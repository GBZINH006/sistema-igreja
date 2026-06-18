(function () {
  const CHAT_KEY = "ad_bela_vista_ai_chat";
  const DRAFT_KEY = "ad_bela_vista_support_ai_draft";
  const MESSAGE_LIMIT = 10;
  const MESSAGE_CHAR_LIMIT = 1200;

  const state = {
    busy: false,
    messages: loadMessages()
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function sanitizeText(value, maxLength = 1000) {
    return String(value ?? "")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function defaultMessages() {
    return [{
      role: "assistant",
      content: [
        "# Como posso ajudar?",
        "Descreva sua duvida sobre cadastro, login, relatorios, exportacoes, fotos, documentos ou permissoes.",
        "Dica: se a orientacao nao resolver, clique em Abrir chamado para enviar a conversa ao suporte."
      ].join("\n\n")
    }];
  }

  function loadMessages() {
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
      return Array.isArray(saved) && saved.length ? saved.slice(-MESSAGE_LIMIT) : defaultMessages();
    } catch (error) {
      return defaultMessages();
    }
  }

  function saveMessages() {
    localStorage.setItem(CHAT_KEY, JSON.stringify(state.messages.slice(-MESSAGE_LIMIT)));
  }

  function getEndpoint() {
    if (window.CONFIG?.SUPPORT_AI_ENDPOINT) {
      return window.CONFIG.SUPPORT_AI_ENDPOINT;
    }

    const isStaticLiveServer = ["127.0.0.1", "localhost"].includes(window.location.hostname)
      && ["5500", "5501", "5502"].includes(window.location.port);

    return isStaticLiveServer
      ? "http://localhost:3000/api/assistente-suporte"
      : "/api/assistente-suporte";
  }

  function closeList(context) {
    if (!context.type) return "";
    const tag = context.type;
    context.type = null;
    return `</${tag}>`;
  }

  function formatAiResponse(content) {
    const lines = String(content || "").split(/\r?\n/);
    const context = { type: null };
    let html = "";

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        html += closeList(context);
        return;
      }

      const numbered = line.match(/^\d+[\.)]\s+(.+)/);
      const bullet = line.match(/^[-*]\s+(.+)/);
      const callout = line.match(/^(Aviso|Atencao|Atenção|Dica|Importante):\s*(.+)$/i);

      if (line.startsWith("#")) {
        html += closeList(context);
        html += `<h3>${escapeHtml(line.replace(/^#{1,3}\s*/, ""))}</h3>`;
      } else if (callout) {
        html += closeList(context);
        html += `<div class="ai-callout"><strong>${escapeHtml(callout[1])}</strong><span>${escapeHtml(callout[2])}</span></div>`;
      } else if (numbered) {
        if (context.type !== "ol") {
          html += closeList(context);
          html += "<ol>";
          context.type = "ol";
        }
        html += `<li>${escapeHtml(numbered[1])}</li>`;
      } else if (bullet) {
        if (context.type !== "ul") {
          html += closeList(context);
          html += "<ul>";
          context.type = "ul";
        }
        html += `<li>${escapeHtml(bullet[1])}</li>`;
      } else {
        html += closeList(context);
        html += `<p>${escapeHtml(line)}</p>`;
      }
    });

    html += closeList(context);
    return html || "<p>Nao consegui responder agora.</p>";
  }

  function renderMessages() {
    $("#ai-messages").innerHTML = state.messages.map((message) => {
      const role = message.role === "user" ? "user" : "assistant";
      const body = role === "assistant"
        ? formatAiResponse(message.content)
        : `<p>${escapeHtml(message.content)}</p>`;
      return `<article class="message ${role}">${body}</article>`;
    }).join("");
    $("#ai-messages").scrollTop = $("#ai-messages").scrollHeight;
  }

  function setBusy(busy) {
    state.busy = busy;
    $("#ai-input").disabled = busy;
    $("#ai-send").disabled = busy;
    $("#typing-indicator").classList.toggle("hidden", !busy);
  }

  function toast(title, message = "") {
    const card = document.createElement("div");
    card.className = "toast";
    card.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    $("#toast-stack").appendChild(card);
    setTimeout(() => card.remove(), 4600);
  }

  function payloadMessages() {
    return state.messages
      .slice(-MESSAGE_LIMIT)
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: sanitizeText(message.content, MESSAGE_CHAR_LIMIT)
      }))
      .filter((message) => message.content);
  }

  async function askAi(promptText) {
    const prompt = sanitizeText(promptText || $("#ai-input").value, 900);
    if (!prompt || state.busy) return;

    state.messages.push({ role: "user", content: prompt });
    state.messages = state.messages.slice(-MESSAGE_LIMIT);
    $("#ai-input").value = "";
    renderMessages();
    saveMessages();
    setBusy(true);

    try {
      const response = await fetch(getEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Nao foi possivel consultar a IA.");
      state.messages.push({ role: "assistant", content: data.answer || "Nao consegui responder agora." });
    } catch (error) {
      state.messages.push({
        role: "assistant",
        content: `# Nao consegui concluir\n\nAviso: ${error.message || "O assistente esta indisponivel agora."}\n\n1. Abra um chamado com os detalhes do problema.\n2. Informe a tela, o horario aproximado e a mensagem de erro.\n3. Nunca envie senhas.`
      });
    } finally {
      state.messages = state.messages.slice(-MESSAGE_LIMIT);
      saveMessages();
      setBusy(false);
      renderMessages();
    }
  }

  function openTicket() {
    const summary = state.messages
      .slice(1)
      .map((message) => `${message.role === "user" ? "Membro" : "Assistente"}: ${message.content}`)
      .join("\n\n")
      .slice(-2600);

    if (summary) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        subject: "Atendimento iniciado pelo assistente de IA",
        description: `Resumo da conversa com a IA:\n\n${summary}`
      }));
    }

    window.location.href = "suporte-membro.html?origem=ia";
  }

  function clearChat() {
    state.messages = defaultMessages();
    saveMessages();
    renderMessages();
    toast("Conversa limpa", "O historico local do assistente foi reiniciado.");
  }

  function bindEvents() {
    $("#ai-form").addEventListener("submit", (event) => {
      event.preventDefault();
      askAi();
    });
    $("#clear-chat").addEventListener("click", clearChat);
    $("#open-ticket-top").addEventListener("click", (event) => {
      event.preventDefault();
      openTicket();
    });
    $$(".suggestion-panel button").forEach((button) => {
      button.addEventListener("click", () => askAi(button.dataset.prompt));
    });
  }

  bindEvents();
  renderMessages();
})();
