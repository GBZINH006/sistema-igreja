(function () {
  const ADMIN_ROLES = ["admin", "pastor", "secretario", "suporte"];
  const STATUS = {
    pending: "Pendente",
    analysis: "Em análise",
    answered: "Respondido",
    closed: "Encerrado",
    urgent: "Urgente"
  };

  const state = {
    db: null,
    session: null,
    role: null,
    tickets: [],
    messages: [],
    selectedId: null,
    filter: "Todos",
    search: "",
    channels: []
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

  function normalizeStatus(value) {
    const raw = String(value || "").trim();
    const map = {
      "Aguardando": STATUS.pending,
      "Pendente": STATUS.pending,
      "Em análise": STATUS.analysis,
      "Em Análise": STATUS.analysis,
      "Respondido": STATUS.answered,
      "Encerrado": STATUS.closed,
      "Urgente": STATUS.urgent
    };
    return map[raw] || STATUS.pending;
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

  function isAdmin() {
    return ADMIN_ROLES.includes(String(state.role || "").toLowerCase());
  }

  function statusClass(status) {
    const value = normalizeStatus(status);
    if (value === STATUS.pending) return "status-pendente";
    if (value === STATUS.analysis) return "status-analise";
    if (value === STATUS.answered) return "status-respondido";
    if (value === STATUS.closed) return "status-encerrado";
    if (value === STATUS.urgent) return "status-urgente";
    return "";
  }

  function toast(title, message = "") {
    const card = document.createElement("div");
    card.className = "toast";
    card.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    $("#toast-stack").appendChild(card);
    setTimeout(() => card.remove(), 4600);
  }

  function showAlert(message) {
    const alert = $("#login-alert");
    alert.textContent = message;
    alert.classList.toggle("show", Boolean(message));
  }

  function showDashboard(show) {
    $("#login-view").classList.toggle("hidden", show);
    $("#dashboard-view").classList.toggle("hidden", !show);
  }

  async function getProfile() {
    const { data, error } = await state.db
      .from("profiles")
      .select("role")
      .eq("id", state.session.user.id)
      .maybeSingle();

    if (error) return null;
    state.role = data?.role || null;
    return data;
  }

  async function login(event) {
    event.preventDefault();
    showAlert("");

    const email = $("#login-email").value.trim();
    const password = $("#login-password").value;
    const { data, error } = await state.db.auth.signInWithPassword({ email, password });

    if (error) {
      showAlert(error.message);
      return;
    }

    state.session = data.session;
    await getProfile();

    if (!isAdmin()) {
      await state.db.auth.signOut();
      state.session = null;
      state.role = null;
      showAlert("Acesso negado. Use um perfil Administrador, Pastor ou Suporte.");
      return;
    }

    showDashboard(true);
    await loadTickets();
    subscribeRealtime();
  }

  async function logout() {
    await state.db.auth.signOut();
    state.session = null;
    state.role = null;
    state.tickets = [];
    state.messages = [];
    state.selectedId = null;
    showDashboard(false);
    renderAll();
  }

  async function loadTickets() {
    if (!state.session || !isAdmin()) return;

    const { data, error } = await state.db
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast("Erro ao carregar chamados", error.message);
      return;
    }

    state.tickets = (data || []).map(ticket => ({
      ...ticket,
      status: normalizeStatus(ticket.status)
    }));

    const ids = state.tickets.map(ticket => ticket.id);
    if (!ids.length) {
      state.messages = [];
      renderAll();
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
    renderAll();
  }

  function filteredTickets() {
    const q = state.search.toLowerCase();
    return state.tickets.filter(ticket => {
      const status = normalizeStatus(ticket.status);
      const urgent = ticket.priority === "Urgente" || status === STATUS.urgent;
      const filterMatch =
        state.filter === "Todos" ||
        status === state.filter ||
        (state.filter === "Urgente" && urgent);

      const haystack = [
        ticket.protocol,
        ticket.user_name,
        ticket.user_email,
        ticket.category,
        ticket.subject,
        ticket.priority,
        status
      ].join(" ").toLowerCase();

      return filterMatch && (!q || haystack.includes(q));
    });
  }

  function renderStats() {
    const pending = state.tickets.filter(ticket => normalizeStatus(ticket.status) === STATUS.pending).length;
    const analysis = state.tickets.filter(ticket => normalizeStatus(ticket.status) === STATUS.analysis).length;
    const answered = state.tickets.filter(ticket => normalizeStatus(ticket.status) === STATUS.answered).length;
    const urgent = state.tickets.filter(ticket => ticket.priority === "Urgente" || normalizeStatus(ticket.status) === STATUS.urgent).length;

    $("#stat-pending").textContent = pending;
    $("#stat-analysis").textContent = analysis;
    $("#stat-answered").textContent = answered;
    $("#stat-urgent").textContent = urgent;
  }

  function renderTable() {
    const rows = $("#ticket-rows");
    const tickets = filteredTickets();

    rows.innerHTML = tickets.length ? tickets.map(ticket => {
      const status = normalizeStatus(ticket.status);
      const priorityClass = ticket.priority === "Urgente" ? "priority-urgent" : "";
      return `
        <tr class="${ticket.id === state.selectedId ? "active" : ""}" data-open-ticket="${ticket.id}">
          <td><strong>${escapeHtml(ticket.protocol || "-")}</strong></td>
          <td>${escapeHtml(ticket.user_name || "Membro")}</td>
          <td>${escapeHtml(ticket.category || "-")}</td>
          <td>${escapeHtml(ticket.subject || "-")}</td>
          <td><span class="status-badge ${statusClass(status)}">${escapeHtml(status)}</span></td>
          <td><span class="priority-badge ${priorityClass}">${escapeHtml(ticket.priority || "Normal")}</span></td>
          <td>${formatDate(ticket.created_at)}</td>
        </tr>
      `;
    }).join("") : `<tr><td colspan="7"><div class="empty-state">Nenhum chamado encontrado.</div></td></tr>`;
  }

  function getSelectedTicket() {
    return state.tickets.find(ticket => ticket.id === state.selectedId) || null;
  }

  function renderConversation() {
    const ticket = getSelectedTicket();
    const canAct = Boolean(ticket && normalizeStatus(ticket.status) !== STATUS.closed);

    $("#reply-text").disabled = !canAct;
    $("#reply-btn").disabled = !canAct;
    $("#analysis-btn").disabled = !canAct;
    $("#urgent-btn").disabled = !canAct;
    $("#close-btn").disabled = !ticket;

    if (!ticket) {
      $("#conversation-title").textContent = "Selecione um chamado";
      $("#conversation-subtitle").textContent = "Mensagens, anexos e ações do atendimento.";
      $("#conversation-status").className = "status-badge";
      $("#conversation-status").textContent = "-";
      $("#customer-card").innerHTML = `
        <div><span>Nome</span><strong>-</strong></div>
        <div><span>Telefone</span><strong>-</strong></div>
        <div><span>E-mail</span><strong>-</strong></div>
        <div><span>Categoria</span><strong>-</strong></div>
      `;
      $("#messages").innerHTML = `<div class="empty-state">Clique em um chamado para visualizar.</div>`;
      return;
    }

    const status = normalizeStatus(ticket.status);
    $("#conversation-title").textContent = ticket.subject || ticket.protocol || "Chamado";
    $("#conversation-subtitle").textContent = `${ticket.protocol || "-"} · ${formatDate(ticket.created_at)}`;
    $("#conversation-status").className = `status-badge ${statusClass(status)}`;
    $("#conversation-status").textContent = status;
    $("#customer-card").innerHTML = `
      <div><span>Nome</span><strong>${escapeHtml(ticket.user_name || "Membro")}</strong></div>
      <div><span>Telefone</span><strong>${escapeHtml(ticket.user_phone || "-")}</strong></div>
      <div><span>E-mail</span><strong>${escapeHtml(ticket.user_email || "-")}</strong></div>
      <div><span>Categoria</span><strong>${escapeHtml(ticket.category || "-")}</strong></div>
    `;

    const messages = state.messages
      .filter(message => message.ticket_id === ticket.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    $("#messages").innerHTML = messages.length ? messages.map(message => `
      <div class="message ${escapeHtml(message.sender_role || "user")}">
        ${escapeHtml(message.message)}
        ${message.attachment_url ? `<a href="${escapeHtml(message.attachment_url)}" target="_blank" rel="noopener"><i class="fa-solid fa-paperclip"></i> Ver anexo</a>` : ""}
        <small>${formatDate(message.created_at)}</small>
      </div>
    `).join("") : `<div class="empty-state">Nenhuma mensagem no chamado.</div>`;
    $("#messages").scrollTop = $("#messages").scrollHeight;
  }

  function renderAll() {
    renderStats();
    renderTable();
    renderConversation();
  }

  async function updateTicketStatus(status, reload = true) {
    const ticket = getSelectedTicket();
    if (!ticket) return;

    const update = {
      status,
      priority: status === STATUS.urgent ? "Urgente" : ticket.priority,
      updated_at: new Date().toISOString()
    };

    const { error } = await state.db
      .from("support_tickets")
      .update(update)
      .eq("id", ticket.id);

    if (error) {
      toast("Erro ao atualizar", error.message);
      return;
    }

    await state.db.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: state.session.user.id,
      sender_name: state.session.user.email,
      sender_role: "system",
      sender_type: "system",
      message: `Chamado ${status.toLowerCase()}.`
    });

    if (reload) await loadTickets();
  }

  async function sendReply() {
    const ticket = getSelectedTicket();
    const text = $("#reply-text").value.trim();
    if (!ticket || !text) return;

    const { error } = await state.db.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: state.session.user.id,
      sender_name: state.session.user.email,
      sender_role: "support",
      sender_type: "support",
      message: text
    });

    if (error) {
      toast("Erro ao responder", error.message);
      return;
    }

    if (normalizeStatus(ticket.status) !== STATUS.closed) {
      await state.db
        .from("support_tickets")
        .update({ status: STATUS.answered, updated_at: new Date().toISOString() })
        .eq("id", ticket.id);
    }

    $("#reply-text").value = "";
    await loadTickets();
  }

  function subscribeRealtime() {
    if (!state.db || state.channels.length) return;
    const tickets = state.db.channel("support-admin-tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, loadTickets)
      .subscribe();
    const messages = state.db.channel("support-admin-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_messages" }, loadTickets)
      .subscribe();
    state.channels.push(tickets, messages);
  }

  function bindEvents() {
    $("#login-form").addEventListener("submit", login);
    $("#logout-btn").addEventListener("click", logout);
    $("#refresh-btn").addEventListener("click", loadTickets);
    $("#search-input").addEventListener("input", event => {
      state.search = event.target.value;
      renderTable();
    });
    $("#reply-btn").addEventListener("click", sendReply);
    $("#analysis-btn").addEventListener("click", () => updateTicketStatus(STATUS.analysis));
    $("#urgent-btn").addEventListener("click", () => updateTicketStatus(STATUS.urgent));
    $("#close-btn").addEventListener("click", () => updateTicketStatus(STATUS.closed));
    $("#filters").addEventListener("click", event => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      state.filter = button.dataset.filter;
      $$("#filters .filter").forEach(item => item.classList.toggle("active", item === button));
      renderTable();
    });
    document.addEventListener("click", event => {
      const row = event.target.closest("[data-open-ticket]");
      if (!row) return;
      state.selectedId = row.dataset.openTicket;
      renderTable();
      renderConversation();
    });
  }

  async function init() {
    bindEvents();

    if (!window.supabase || !window.CONFIG?.SUPABASE_URL || !window.CONFIG?.SUPABASE_KEY) {
      showAlert("Configuração do Supabase não encontrada.");
      return;
    }

    state.db = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_KEY);
    const { data } = await state.db.auth.getSession();
    state.session = data.session;

    if (state.session) {
      await getProfile();
      if (isAdmin()) {
        showDashboard(true);
        await loadTickets();
        subscribeRealtime();
      } else {
        await state.db.auth.signOut();
        state.session = null;
      }
    }
  }

  init();
})();
