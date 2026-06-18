(function () {
  const CATEGORIES = [
    "Cadastro de Membros",
    "Documentos",
    "Relatorios",
    "Exportacao PDF",
    "Exportacao Excel",
    "Permissoes",
    "Login",
    "Erro do Sistema",
    "Sugestao",
    "Outros"
  ];

  const SESSION_TICKETS_KEY = "ad_bela_vista_support_submitted";
  const AI_MESSAGE_LIMIT = 10;
  const AI_MESSAGE_CHAR_LIMIT = 1200;
  const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
  const ALLOWED_ATTACHMENT_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ]);

  const STATUS_LABELS = {
    Pendente: "Aguardando",
    Aguardando: "Aguardando",
    "Em analise": "Em analise",
    "Em análise": "Em analise",
    Respondido: "Respondido",
    Encerrado: "Encerrado",
    Urgente: "Urgente"
  };

  const state = {
    db: null,
    tickets: [],
    messages: [],
    selectedId: null,
    submittedTickets: readStoredTickets(),
    aiBusy: false,
    ticketsLoading: false,
    aiMessages: [
      {
        role: "assistant",
        content: [
          "# Assistente da AD Bela-Vista",
          "Descreva sua duvida em poucas palavras. Eu posso orientar sobre cadastro, login, relatorios, exportacoes, fotos, documentos e permissoes.",
          "Dica: nunca envie senhas pelo chat."
        ].join("\n\n")
      }
    ]
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

  function normalizePhone(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 14);
  }

  function normalizeProtocol(value) {
    return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  }

  function readStoredTickets() {
    try {
      const raw = JSON.parse(sessionStorage.getItem(SESSION_TICKETS_KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw
        .map((item) => {
          if (typeof item === "string") return { id: item };
          return {
            id: item?.id || null,
            protocol: item?.protocol || null,
            contact: item?.contact || null
          };
        })
        .filter((item) => item.id || item.protocol);
    } catch (error) {
      return [];
    }
  }

  function saveStoredTickets() {
    sessionStorage.setItem(SESSION_TICKETS_KEY, JSON.stringify(state.submittedTickets.slice(0, 12)));
  }

  function rememberTicket(ticket, contact) {
    const entry = {
      id: ticket.id,
      protocol: ticket.protocol,
      contact: sanitizeText(contact || ticket.user_email || ticket.user_phone || "", 180)
    };

    state.submittedTickets = [
      entry,
      ...state.submittedTickets.filter((item) => item.id !== entry.id && item.protocol !== entry.protocol)
    ].slice(0, 12);
    saveStoredTickets();
  }

  function hasTicketAccess(ticket) {
    return state.submittedTickets.some((item) => item.id === ticket.id || item.protocol === ticket.protocol);
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function normalizeStatus(value) {
    const raw = sanitizeText(value, 40);
    return STATUS_LABELS[raw] || "Aguardando";
  }

  function statusClass(ticket) {
    const status = normalizeStatus(ticket?.status);
    if (ticket?.priority === "Urgente" || status === "Urgente") return "urgent";
    if (status === "Em analise") return "analysis";
    if (status === "Respondido") return "answered";
    if (status === "Encerrado") return "closed";
    return "waiting";
  }

  function toast(title, message = "") {
    const card = document.createElement("div");
    card.className = "toast";
    card.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    $("#toast-stack").appendChild(card);
    setTimeout(() => card.remove(), 4600);
  }

  function setWarning(selector, message) {
    const box = $(selector);
    if (!box) return;
    box.textContent = message;
    box.classList.toggle("show", Boolean(message));
  }

  function setButtonLoading(button, loading, loadingText) {
    if (!button) return;
    if (!button.dataset.defaultText) button.dataset.defaultText = button.innerHTML;
    button.disabled = loading;
    button.innerHTML = loading ? `<span class="loading-dot"></span>${escapeHtml(loadingText)}` : button.dataset.defaultText;
  }

  function getSelectedTicket() {
    return state.tickets.find((ticket) => ticket.id === state.selectedId) || null;
  }

  function hydrateTicket(row) {
    if (!row) return null;
    const messages = Array.isArray(row.messages) ? row.messages : [];
    return {
      ticket: {
        id: row.id,
        protocol: row.protocol,
        user_name: row.user_name,
        user_phone: row.user_phone,
        user_email: row.user_email,
        subject: row.subject,
        category: row.category,
        description: row.description,
        priority: row.priority,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        last_message_at: row.last_message_at
      },
      messages
    };
  }

  function renderTickets() {
    const list = $("#member-ticket-list");
    if (!list) return;

    if (state.ticketsLoading) {
      list.innerHTML = Array.from({ length: 3 }, () => '<div class="ticket-skeleton"></div>').join("");
      return;
    }

    const submitted = state.tickets.filter(hasTicketAccess);
    list.innerHTML = submitted.length ? submitted.map((ticket) => `
      <button class="ticket-item ${ticket.id === state.selectedId ? "active" : ""}" type="button" data-open-ticket="${escapeHtml(ticket.id)}">
        <span>
          <strong>${escapeHtml(ticket.subject)}</strong>
          <small>${escapeHtml(ticket.protocol || "Sem protocolo")} · ${formatDate(ticket.created_at)}</small>
        </span>
        <span class="status-badge ${statusClass(ticket)}">${escapeHtml(normalizeStatus(ticket.status))}</span>
      </button>
    `).join("") : `
      <div class="empty-state compact">
        <i class="fa-regular fa-folder-open"></i>
        <strong>Nenhum chamado encontrado</strong>
        <span>Abra um chamado ou consulte pelo protocolo recebido.</span>
      </div>
    `;
  }

  function renderChat() {
    const ticket = getSelectedTicket();
    const canReply = Boolean(ticket && hasTicketAccess(ticket) && normalizeStatus(ticket.status) !== "Encerrado");

    $("#reply-text").disabled = !canReply;
    $("#reply-attachment").disabled = !canReply;
    $("#send-message").disabled = !canReply;

    if (!ticket) {
      $("#chat-title").textContent = "Selecione um chamado";
      $("#chat-subtitle").textContent = "Consulte pelo protocolo ou abra um novo chamado.";
      $("#chat-status").className = "status-badge";
      $("#chat-status").textContent = "Nenhum chamado";
      $("#messages").innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-comments"></i>
          <strong>Nenhuma conversa aberta</strong>
          <span>As respostas do suporte aparecem aqui.</span>
        </div>
      `;
      return;
    }

    $("#chat-title").textContent = ticket.subject;
    $("#chat-subtitle").textContent = `${ticket.protocol || "Sem protocolo"} · ${ticket.category} · ${formatDate(ticket.created_at)}`;
    $("#chat-status").className = `status-badge ${statusClass(ticket)}`;
    $("#chat-status").textContent = normalizeStatus(ticket.status);

    const rows = state.messages
      .filter((message) => message.ticket_id === ticket.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    $("#messages").innerHTML = rows.length ? rows.map((message) => `
      <div class="message ${escapeHtml(message.sender_role || "user")}">
        <p>${escapeHtml(message.message)}</p>
        ${message.attachment_url ? `<a href="${escapeHtml(message.attachment_url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-paperclip"></i> Ver anexo</a>` : ""}
        <small>${formatDate(message.created_at)}</small>
      </div>
    `).join("") : `
      <div class="empty-state">
        <i class="fa-regular fa-comment"></i>
        <strong>Sem mensagens ainda</strong>
        <span>A primeira mensagem foi registrada no chamado.</span>
      </div>
    `;
    $("#messages").scrollTop = $("#messages").scrollHeight;
  }

  function formatAiResponse(content) {
    const lines = String(content || "").split(/\r?\n/);
    let html = "";
    let listType = null;

    function closeList() {
      if (!listType) return;
      html += `</${listType}>`;
      listType = null;
    }

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        closeList();
        return;
      }

      const safe = escapeHtml(line.replace(/^#{1,3}\s*/, ""));
      const numbered = line.match(/^\d+[\.)]\s+(.+)/);
      const bullet = line.match(/^[-*]\s+(.+)/);
      const callout = line.match(/^(Aviso|Atencao|Atenção|Dica|Importante):\s*(.+)$/i);

      if (line.startsWith("#")) {
        closeList();
        html += `<h3>${safe}</h3>`;
      } else if (callout) {
        closeList();
        html += `<div class="ai-callout"><strong>${escapeHtml(callout[1])}</strong><span>${escapeHtml(callout[2])}</span></div>`;
      } else if (numbered) {
        if (listType !== "ol") {
          closeList();
          html += "<ol>";
          listType = "ol";
        }
        html += `<li>${escapeHtml(numbered[1])}</li>`;
      } else if (bullet) {
        if (listType !== "ul") {
          closeList();
          html += "<ul>";
          listType = "ul";
        }
        html += `<li>${escapeHtml(bullet[1])}</li>`;
      } else {
        closeList();
        html += `<p>${escapeHtml(line)}</p>`;
      }
    });

    closeList();
    return html || "<p>Nao consegui responder agora.</p>";
  }

  function renderAiMessages() {
    $("#ai-messages").innerHTML = state.aiMessages.map((message) => {
      const role = message.role === "user" ? "user" : "assistant";
      const body = role === "assistant"
        ? formatAiResponse(message.content)
        : `<p>${escapeHtml(message.content)}</p>`;
      return `<div class="ai-message ${role}">${body}</div>`;
    }).join("");
    $("#ai-messages").scrollTop = $("#ai-messages").scrollHeight;
  }

  function openAiDrawer() {
    $("#ai-drawer").classList.add("open");
    $("#ai-drawer").setAttribute("aria-hidden", "false");
    renderAiMessages();
  }

  function closeAiDrawer() {
    $("#ai-drawer").classList.remove("open");
    $("#ai-drawer").setAttribute("aria-hidden", "true");
  }

  function validateAttachment(file) {
    if (!file) return;
    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      throw new Error("Use apenas JPG, PNG, WEBP ou PDF.");
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new Error("O anexo deve ter no maximo 5 MB.");
    }
  }

  async function uploadAttachment(file) {
    if (!file) return null;
    validateAttachment(file);
    const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "file";
    const randomName = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const safeName = `${randomName}.${extension}`;
    const path = `support/${new Date().getFullYear()}/${safeName}`;
    const { error } = await state.db.storage.from("support-attachments-public").upload(path, file, {
      contentType: file.type,
      upsert: false
    });
    if (error) throw error;
    return state.db.storage.from("support-attachments-public").getPublicUrl(path).data.publicUrl;
  }

  async function fetchTicket(entry) {
    const { data, error } = await state.db.rpc("support_get_public_ticket", {
      p_ticket_id: entry.id || null,
      p_protocol: entry.protocol || null,
      p_contact: entry.contact || null
    });

    if (error) throw error;
    return hydrateTicket(Array.isArray(data) ? data[0] : data);
  }

  async function loadTickets() {
    if (!state.db || !state.submittedTickets.length) {
      state.tickets = [];
      state.messages = [];
      renderTickets();
      renderChat();
      return;
    }

    state.ticketsLoading = true;
    renderTickets();

    try {
      const results = await Promise.allSettled(state.submittedTickets.map(fetchTicket));
      const hydrated = results
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);

      state.tickets = hydrated.map((item) => item.ticket);
      state.messages = hydrated.flatMap((item) => item.messages);

      if (state.selectedId && !state.tickets.some((ticket) => ticket.id === state.selectedId)) {
        state.selectedId = null;
      }
      if (!state.selectedId && state.tickets[0]) {
        state.selectedId = state.tickets[0].id;
      }
    } catch (error) {
      toast("Erro ao carregar chamados", "Tente novamente em instantes.");
    } finally {
      state.ticketsLoading = false;
      renderTickets();
      renderChat();
    }
  }

  function validateTicketForm() {
    const payload = {
      p_user_name: sanitizeText($("#requester-name").value, 120),
      p_user_phone: normalizePhone($("#requester-phone").value),
      p_user_email: sanitizeText($("#requester-email").value, 160).toLowerCase(),
      p_subject: sanitizeText($("#ticket-subject").value, 120),
      p_category: sanitizeText($("#ticket-category").value, 60),
      p_description: sanitizeText($("#ticket-description").value, 3000),
      p_priority: sanitizeText($("#ticket-priority").value, 20),
      p_attachment_url: null
    };

    if (payload.p_user_name.length < 3) throw new Error("Informe seu nome.");
    if (!payload.p_user_phone && !payload.p_user_email) throw new Error("Informe telefone ou e-mail para consultar o protocolo depois.");
    if (payload.p_user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.p_user_email)) throw new Error("Informe um e-mail valido.");
    if (!CATEGORIES.includes(payload.p_category)) throw new Error("Selecione uma categoria valida.");
    if (payload.p_subject.length < 5) throw new Error("Informe um assunto com pelo menos 5 caracteres.");
    if (payload.p_description.length < 10) throw new Error("Descreva a solicitacao com pelo menos 10 caracteres.");

    return payload;
  }

  async function createTicket(event) {
    event.preventDefault();
    setWarning("#member-warning", "");
    const button = event.submitter || $("#ticket-form button[type='submit']");

    let payload;
    try {
      payload = validateTicketForm();
      validateAttachment($("#ticket-attachment").files[0]);
    } catch (error) {
      setWarning("#member-warning", error.message);
      return;
    }

    setButtonLoading(button, true, "Enviando...");

    try {
      payload.p_attachment_url = await uploadAttachment($("#ticket-attachment").files[0]);
    } catch (error) {
      setWarning("#member-warning", error.message || "Nao foi possivel enviar o anexo. O chamado sera enviado sem arquivo.");
    }

    try {
      const { data: ticket, error } = await state.db
        .rpc("support_open_public_ticket", payload)
        .single();

      if (error) throw error;

      rememberTicket(ticket, payload.p_user_email || payload.p_user_phone);
      state.tickets = [ticket, ...state.tickets.filter((item) => item.id !== ticket.id)];
      state.messages.push({
        id: `local-${ticket.id}`,
        ticket_id: ticket.id,
        sender_role: "user",
        message: ticket.description,
        attachment_url: payload.p_attachment_url,
        created_at: ticket.created_at
      });
      state.selectedId = ticket.id;

      $("#success-box").classList.add("show");
      $("#success-box").innerHTML = `<strong>Chamado enviado.</strong><br>Protocolo: <strong>${escapeHtml(ticket.protocol)}</strong>`;
      $("#ticket-form").reset();
      $("#ticket-file-name").innerHTML = '<i class="fa-solid fa-paperclip"></i> Anexar imagem ou PDF';
      toast("Chamado enviado", "Guarde o protocolo para consultar as respostas.");
      renderTickets();
      renderChat();
    } catch (error) {
      setWarning("#member-warning", "Nao foi possivel enviar o chamado. Tente novamente ou fale com o suporte.");
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function lookupTicket(event) {
    event.preventDefault();
    setWarning("#lookup-warning", "");

    const protocol = normalizeProtocol($("#lookup-protocol").value);
    const contact = sanitizeText($("#lookup-contact").value, 180).toLowerCase();
    if (!protocol || !contact) {
      setWarning("#lookup-warning", "Informe protocolo e telefone/e-mail usado no chamado.");
      return;
    }

    const button = $("#lookup-ticket-btn");
    setButtonLoading(button, true, "Consultando...");

    try {
      const result = await fetchTicket({ protocol, contact });
      if (!result) {
        setWarning("#lookup-warning", "Chamado nao encontrado. Confira protocolo e contato.");
        return;
      }

      rememberTicket(result.ticket, contact);
      state.tickets = [result.ticket, ...state.tickets.filter((ticket) => ticket.id !== result.ticket.id)];
      state.messages = [
        ...state.messages.filter((message) => message.ticket_id !== result.ticket.id),
        ...result.messages
      ];
      state.selectedId = result.ticket.id;
      $("#lookup-form").reset();
      toast("Chamado encontrado", "As respostas do suporte foram carregadas.");
      renderTickets();
      renderChat();
    } catch (error) {
      setWarning("#lookup-warning", "Nao foi possivel consultar o protocolo agora.");
    } finally {
      setButtonLoading(button, false);
    }
  }

  async function sendMessage() {
    const ticket = getSelectedTicket();
    const text = sanitizeText($("#reply-text").value, 2000);
    const file = $("#reply-attachment").files[0];
    if (!ticket || (!text && !file)) return;

    try {
      validateAttachment(file);
    } catch (error) {
      toast("Anexo invalido", error.message);
      return;
    }

    const button = $("#send-message");
    setButtonLoading(button, true, "Enviando...");

    let attachmentUrl = null;
    try {
      attachmentUrl = await uploadAttachment(file);
    } catch (error) {
      toast("Anexo nao enviado", "A mensagem sera enviada sem arquivo.");
    }

    try {
      const stored = state.submittedTickets.find((item) => item.id === ticket.id || item.protocol === ticket.protocol);
      const { data, error } = await state.db.rpc("support_add_public_message", {
        p_ticket_id: ticket.id,
        p_protocol: ticket.protocol,
        p_contact: stored?.contact || ticket.user_email || ticket.user_phone || "",
        p_message: text || "Anexo enviado.",
        p_attachment_url: attachmentUrl
      });

      if (error) throw error;

      const inserted = Array.isArray(data) ? data[0] : data;
      state.messages.push(inserted || {
        id: `local-${Date.now()}`,
        ticket_id: ticket.id,
        sender_role: "user",
        message: text || "Anexo enviado.",
        attachment_url: attachmentUrl,
        created_at: new Date().toISOString()
      });
      $("#reply-text").value = "";
      $("#reply-attachment").value = "";
      renderChat();
    } catch (error) {
      toast("Erro ao enviar", "Confira se o chamado ainda esta aberto.");
    } finally {
      setButtonLoading(button, false);
    }
  }

  function setAiBusy(busy) {
    state.aiBusy = busy;
    $("#ai-send").disabled = busy;
    $("#ai-input").disabled = busy;
    $("#ai-send").textContent = busy ? "Pensando..." : "Perguntar";
  }

  function getAiPayloadMessages() {
    return state.aiMessages
      .slice(-AI_MESSAGE_LIMIT)
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: sanitizeText(message.content, AI_MESSAGE_CHAR_LIMIT)
      }))
      .filter((message) => message.content);
  }

  function getAiEndpoint() {
    if (window.CONFIG?.SUPPORT_AI_ENDPOINT) {
      return window.CONFIG.SUPPORT_AI_ENDPOINT;
    }

    const isStaticLiveServer = ["127.0.0.1", "localhost"].includes(window.location.hostname)
      && ["5500", "5501", "5502"].includes(window.location.port);

    return isStaticLiveServer
      ? "http://localhost:3000/api/assistente-suporte"
      : "/api/assistente-suporte";
  }

  async function sendAiPrompt(promptText) {
    const prompt = sanitizeText(promptText || $("#ai-input").value, 900);
    if (!prompt || state.aiBusy) return;

    state.aiMessages.push({ role: "user", content: prompt });
    $("#ai-input").value = "";
    openAiDrawer();
    setAiBusy(true);

    try {
      const response = await fetch(getAiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: getAiPayloadMessages() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Nao foi possivel consultar a IA.");
      state.aiMessages.push({ role: "assistant", content: data.answer || "Nao consegui responder agora." });
      state.aiMessages = state.aiMessages.slice(-AI_MESSAGE_LIMIT);
    } catch (error) {
      state.aiMessages.push({
        role: "assistant",
        content: `# Assistente indisponivel\n\nAviso: ${error.message || "Nao foi possivel consultar a IA agora."}\n\n1. Abra um chamado com os detalhes do problema.\n2. Informe tela, horario aproximado e mensagem de erro.\n3. Nao envie senhas.`
      });
      state.aiMessages = state.aiMessages.slice(-AI_MESSAGE_LIMIT);
    } finally {
      setAiBusy(false);
      renderAiMessages();
    }
  }

  function fillTicketFromAi() {
    const hasUserMessage = state.aiMessages.some((message) => message.role === "user");
    if (!hasUserMessage) {
      toast("Converse primeiro", "Envie uma pergunta para gerar o resumo.");
      return;
    }

    const summary = state.aiMessages
      .slice(1)
      .map((message) => `${message.role === "user" ? "Membro" : "Assistente"}: ${message.content}`)
      .join("\n\n")
      .slice(-2600);

    if (!$("#ticket-subject").value.trim()) {
      $("#ticket-subject").value = "Atendimento iniciado pelo assistente de IA";
    }
    $("#ticket-description").value = $("#ticket-description").value.trim()
      ? `${$("#ticket-description").value.trim()}\n\nResumo da conversa com a IA:\n\n${summary}`
      : `Resumo da conversa com a IA:\n\n${summary}`;

    closeAiDrawer();
    $("#ticket-form").scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Resumo adicionado", "Revise os campos antes de enviar.");
  }

  function bindEvents() {
    CATEGORIES.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      $("#ticket-category").appendChild(option);
    });

    $("#ticket-form").addEventListener("submit", createTicket);
    $("#lookup-form").addEventListener("submit", lookupTicket);
    $("#refresh-btn").addEventListener("click", loadTickets);
    $("#send-message").addEventListener("click", sendMessage);
    $("#ai-send").addEventListener("click", () => sendAiPrompt());
    $("#ai-input").addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendAiPrompt();
      }
    });
    $$(".quick-prompts button").forEach((button) => {
      button.addEventListener("click", () => sendAiPrompt(button.dataset.aiPrompt));
    });
    $("[data-close-ai]").addEventListener("click", closeAiDrawer);
    $$(".drawer-panel [data-close-ai]").forEach((button) => button.addEventListener("click", closeAiDrawer));
    $("#ai-fill-ticket").addEventListener("click", fillTicketFromAi);
    $("#ticket-attachment").addEventListener("change", (event) => {
      const file = event.target.files[0];
      try {
        validateAttachment(file);
        $("#ticket-file-name").innerHTML = file
          ? `<i class="fa-solid fa-paperclip"></i> ${escapeHtml(file.name)}`
          : '<i class="fa-solid fa-paperclip"></i> Anexar imagem ou PDF';
      } catch (error) {
        event.target.value = "";
        $("#ticket-file-name").innerHTML = '<i class="fa-solid fa-paperclip"></i> Anexar imagem ou PDF';
        setWarning("#member-warning", error.message);
      }
    });
    $("#reply-attachment").addEventListener("change", (event) => {
      try {
        validateAttachment(event.target.files[0]);
      } catch (error) {
        event.target.value = "";
        toast("Anexo invalido", error.message);
      }
    });
    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-open-ticket]");
      if (!opener) return;
      state.selectedId = opener.dataset.openTicket;
      renderTickets();
      renderChat();
    });
  }

  async function init() {
    bindEvents();
    renderAiMessages();

    if (!window.supabase || !window.CONFIG?.SUPABASE_URL || !window.CONFIG?.SUPABASE_KEY) {
      setWarning("#member-warning", "Configuracao do Supabase nao encontrada.");
      renderTickets();
      renderChat();
      return;
    }

    state.db = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_KEY);
    await loadTickets();
  }

  init();
})();
