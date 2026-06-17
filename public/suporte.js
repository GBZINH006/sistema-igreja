(function () {
  const CATEGORIES = [
    "Cadastro de Membros",
    "Documentos",
    "Relatórios",
    "Exportação PDF",
    "Exportação Excel",
    "Permissões",
    "Login",
    "Erro do Sistema",
    "Sugestão",
    "Outros"
  ];

  const SESSION_TICKETS_KEY = "ad_bela_vista_support_submitted";

  const state = {
    db: null,
    session: null,
    tickets: [],
    messages: [],
    selectedId: null,
    submittedIds: JSON.parse(sessionStorage.getItem(SESSION_TICKETS_KEY) || "[]"),
    aiBusy: false,
    aiMessages: [
      {
        role: "assistant",
        content: "Olá! Sou o assistente inteligente da AD Bela-Vista. Descreva sua dúvida que eu te ajudo a organizar o próximo passo."
      }
    ]
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
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
    const raw = String(value || "").trim();
    const map = {
      "Aguardando": "Pendente",
      "Pendente": "Pendente",
      "Em análise": "Em análise",
      "Em Análise": "Em análise",
      "Respondido": "Respondido",
      "Encerrado": "Encerrado",
      "Urgente": "Urgente"
    };
    return map[raw] || "Pendente";
  }

  function statusClass(ticket) {
    const status = normalizeStatus(ticket?.status);
    if (ticket?.priority === "Urgente" || status === "Urgente") return "urgent";
    if (status === "Em análise") return "analysis";
    if (status === "Respondido") return "answered";
    if (status === "Pendente") return "waiting";
    return "";
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
    box.innerHTML = escapeHtml(message);
    box.classList.toggle("show", Boolean(message));
  }

  function getSelectedTicket() {
    return state.tickets.find(ticket => ticket.id === state.selectedId) || null;
  }

  function renderTickets() {
    const list = $("#member-ticket-list");
    const submitted = state.tickets.filter(ticket => state.submittedIds.includes(ticket.id));
    list.innerHTML = submitted.length ? submitted.map(ticket => `
      <button class="ticket-item ${ticket.id === state.selectedId ? "active" : ""}" type="button" data-open-ticket="${ticket.id}">
        <span>
          <strong>${escapeHtml(ticket.subject)}</strong>
          <small>${escapeHtml(ticket.protocol || "Sem protocolo")} · ${formatDate(ticket.created_at)}</small>
        </span>
        <span class="status-badge ${statusClass(ticket)}">${escapeHtml(normalizeStatus(ticket.status))}</span>
      </button>
    `).join("") : `
      <div class="empty-state">
        <i class="fa-regular fa-folder-open"></i>
        <strong>Nenhum chamado nesta sessão</strong>
        <span>Os chamados enviados por este navegador aparecerão aqui.</span>
      </div>
    `;
  }

  function renderChat() {
    const ticket = getSelectedTicket();
    const canReply = Boolean(ticket && state.submittedIds.includes(ticket.id) && normalizeStatus(ticket.status) !== "Encerrado");

    $("#reply-text").disabled = !canReply;
    $("#reply-attachment").disabled = !canReply;
    $("#send-message").disabled = !canReply;

    if (!ticket) {
      $("#chat-title").textContent = "Selecione um chamado";
      $("#chat-subtitle").textContent = "Acompanhe as respostas da equipe por aqui.";
      $("#chat-status").className = "status-badge";
      $("#chat-status").textContent = "Nenhum chamado";
      $("#messages").innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-comments"></i>
          <strong>Nenhuma conversa aberta</strong>
          <span>Envie um chamado ou abra um chamado desta sessão.</span>
        </div>
      `;
      return;
    }

    $("#chat-title").textContent = ticket.subject;
    $("#chat-subtitle").textContent = `${ticket.protocol || "Sem protocolo"} · ${ticket.category} · ${formatDate(ticket.created_at)}`;
    $("#chat-status").className = `status-badge ${statusClass(ticket)}`;
    $("#chat-status").textContent = normalizeStatus(ticket.status);

    const rows = state.messages
      .filter(message => message.ticket_id === ticket.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    $("#messages").innerHTML = rows.length ? rows.map(message => `
      <div class="message ${escapeHtml(message.sender_role || "user")}">
        ${escapeHtml(message.message)}
        ${message.attachment_url ? `<a href="${escapeHtml(message.attachment_url)}" target="_blank" rel="noopener"><i class="fa-solid fa-paperclip"></i> Ver anexo</a>` : ""}
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

  function renderAiMessages() {
    $("#ai-messages").innerHTML = state.aiMessages.map(message => `
      <div class="ai-message ${message.role === "user" ? "user" : "assistant"}">${escapeHtml(message.content)}</div>
    `).join("");
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

  async function uploadAttachment(file) {
    if (!file) return null;
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `support/${Date.now()}_${safeName}`;
    const { error } = await state.db.storage.from("support-attachments-public").upload(path, file, { upsert: true });
    if (error) throw error;
    return state.db.storage.from("support-attachments-public").getPublicUrl(path).data.publicUrl;
  }

  async function loadTickets() {
    if (!state.db || !state.submittedIds.length) {
      renderTickets();
      renderChat();
      return;
    }

    const { data, error } = await state.db
      .from("support_tickets")
      .select("*")
      .in("id", state.submittedIds)
      .order("created_at", { ascending: false });

    if (error) {
      toast("Erro ao carregar chamados", error.message);
      return;
    }

    state.tickets = data || [];
    const ids = state.tickets.map(ticket => ticket.id);
    if (!ids.length) {
      state.messages = [];
      renderTickets();
      renderChat();
      return;
    }

    const { data: messages, error: msgError } = await state.db
      .from("support_messages")
      .select("*")
      .in("ticket_id", ids)
      .order("created_at", { ascending: true });

    if (msgError) {
      toast("Erro ao carregar mensagens", msgError.message);
      return;
    }

    state.messages = messages || [];
    renderTickets();
    renderChat();
  }

  async function createTicket(event) {
    event.preventDefault();
    setWarning("#member-warning", "");

    const file = $("#ticket-attachment").files[0];
    let attachmentUrl = null;
    try {
      attachmentUrl = await uploadAttachment(file);
    } catch (error) {
      setWarning("#member-warning", "Não foi possível enviar o anexo. O chamado será enviado sem arquivo.");
    }

    const payload = {
      p_user_name: $("#requester-name").value.trim(),
      p_user_phone: $("#requester-phone").value.trim(),
      p_user_email: $("#requester-email").value.trim(),
      p_subject: $("#ticket-subject").value.trim(),
      p_category: $("#ticket-category").value,
      p_description: $("#ticket-description").value.trim(),
      p_priority: $("#ticket-priority").value,
      p_attachment_url: attachmentUrl
    };

    try {
      const { data: ticket, error } = await state.db
        .rpc("support_open_public_ticket", payload)
        .single();

      if (error) throw error;

      state.submittedIds = Array.from(new Set([ticket.id, ...state.submittedIds]));
      sessionStorage.setItem(SESSION_TICKETS_KEY, JSON.stringify(state.submittedIds));
      state.tickets = [ticket, ...state.tickets.filter(item => item.id !== ticket.id)];
      state.messages.push({
        id: `local-${ticket.id}`,
        ticket_id: ticket.id,
        sender_role: "user",
        message: ticket.description,
        attachment_url: attachmentUrl,
        created_at: ticket.created_at
      });
      state.selectedId = ticket.id;

      $("#success-box").classList.add("show");
      $("#success-box").innerHTML = `<strong>Chamado enviado.</strong><br>Protocolo: <strong>${escapeHtml(ticket.protocol)}</strong>`;
      $("#ticket-form").reset();
      $("#ticket-file-name").innerHTML = `<i class="fa-solid fa-paperclip"></i> Anexar imagem ou PDF`;
      toast("Chamado enviado", "A equipe de suporte recebeu sua solicitação.");
      renderTickets();
      renderChat();
    } catch (error) {
      setWarning("#member-warning", "Não foi possível enviar o chamado. Confira o Supabase e tente novamente.");
    }
  }

  async function sendMessage() {
    const ticket = getSelectedTicket();
    const text = $("#reply-text").value.trim();
    const file = $("#reply-attachment").files[0];
    if (!ticket || (!text && !file)) return;

    let attachmentUrl = null;
    try {
      attachmentUrl = await uploadAttachment(file);
    } catch (error) {
      toast("Anexo não enviado", "A mensagem será enviada sem arquivo.");
    }

    const { error } = await state.db.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: null,
      sender_name: ticket.user_name,
      sender_role: "user",
      sender_type: "user",
      message: text || "Anexo enviado.",
      attachment_url: attachmentUrl
    });

    if (error) {
      toast("Erro ao enviar", error.message);
      return;
    }

    state.messages.push({
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
  }

  function setAiBusy(busy) {
    state.aiBusy = busy;
    $("#ai-send").disabled = busy;
    $("#ai-input").disabled = busy;
    $("#ai-send").textContent = busy ? "Pensando..." : "Perguntar";
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
    const prompt = String(promptText || $("#ai-input").value || "").trim();
    if (!prompt || state.aiBusy) return;

    state.aiMessages.push({ role: "user", content: prompt });
    $("#ai-input").value = "";
    openAiDrawer();
    setAiBusy(true);

    try {
      const response = await fetch("/api/assistente-suporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: state.aiMessages })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível consultar a IA.");
      state.aiMessages.push({ role: "assistant", content: data.answer || "Não consegui responder agora." });
    } catch (error) {
      state.aiMessages.push({
        role: "assistant",
        content: `${error.message || "Assistente indisponível."} Você pode abrir um chamado com os detalhes abaixo.`
      });
    } finally {
      setAiBusy(false);
      renderAiMessages();
    }
  }

  function fillTicketFromAi() {
    const hasUserMessage = state.aiMessages.some(message => message.role === "user");
    if (!hasUserMessage) {
      toast("Converse primeiro", "Envie uma pergunta para gerar o resumo.");
      return;
    }

    const summary = state.aiMessages
      .slice(1)
      .map(message => `${message.role === "user" ? "Membro" : "Assistente"}: ${message.content}`)
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
    CATEGORIES.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      $("#ticket-category").appendChild(option);
    });

    $("#ticket-form").addEventListener("submit", createTicket);
    $("#refresh-btn").addEventListener("click", loadTickets);
    $("#send-message").addEventListener("click", sendMessage);
    $("#ai-send").addEventListener("click", () => sendAiPrompt());
    $("#ai-input").addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendAiPrompt();
      }
    });
    $$(".quick-prompts button").forEach(button => {
      button.addEventListener("click", () => sendAiPrompt(button.dataset.aiPrompt));
    });
    $("[data-close-ai]").addEventListener("click", closeAiDrawer);
    $$(".drawer-panel [data-close-ai]").forEach(button => button.addEventListener("click", closeAiDrawer));
    $("#ai-fill-ticket").addEventListener("click", fillTicketFromAi);
    $("#ticket-attachment").addEventListener("change", event => {
      $("#ticket-file-name").innerHTML = event.target.files[0]
        ? `<i class="fa-solid fa-paperclip"></i> ${escapeHtml(event.target.files[0].name)}`
        : `<i class="fa-solid fa-paperclip"></i> Anexar imagem ou PDF`;
    });
    document.addEventListener("click", event => {
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
      setWarning("#member-warning", "Configuração do Supabase não encontrada.");
      renderTickets();
      renderChat();
      return;
    }

    state.db = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_KEY);
    await loadTickets();
  }

  init();
})();
