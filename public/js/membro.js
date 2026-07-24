(function () {
  const db = window._supabaseClientInstance || window.getSupabaseClient();
  const MEMBER_SESSION_KEY = "ad_bela_vista_member_session";

  const state = {
    session: null,
    registrations: [],
    avatarDraft: null
  };

  const $ = (selector) => document.querySelector(selector);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function splitName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts.shift() || "",
      lastName: parts.join(" ") || ""
    };
  }

  function initials(name) {
    const parts = String(name || "Membro").trim().split(/\s+/).filter(Boolean);
    return (parts[0]?.[0] || "M") + (parts[1]?.[0] || "B");
  }

  function maskPhone(value) {
    let digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
    }
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
  }

  function maskCpf(value) {
    return onlyDigits(value).slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function showAlert(message, type = "error") {
    const alert = $("#member-alert");
    alert.textContent = message || "";
    alert.classList.toggle("show", Boolean(message));
    alert.classList.toggle("ok", type === "ok");
  }

  function setLoading(show) {
    $("#loading-view").classList.toggle("hidden", !show);
    $("#member-view").classList.toggle("hidden", show);
  }

  function saveSession(patch = {}) {
    state.session = { ...state.session, ...patch };
    const storage = sessionStorage.getItem(MEMBER_SESSION_KEY) ? sessionStorage : localStorage;
    storage.setItem(MEMBER_SESSION_KEY, JSON.stringify(state.session));
  }

  function renderAccount() {
    const session = state.session || {};
    const name = session.fullName || "Membro";
    const split = splitName(name);
    const avatar = session.avatarUrl || session.avatar_url || "";

    $("#member-name").textContent = `Olá, ${name}`;
    $("#member-email").textContent = session.email || "";
    $("#avatar-fallback").textContent = initials(name).toUpperCase();
    $("#profile-first-name").value = split.firstName;
    $("#profile-last-name").value = split.lastName;
    $("#profile-phone").value = maskPhone(session.phone || "");
    $("#profile-cpf").value = maskCpf(session.cpf || "");

    const photo = $("#avatar-img");
    const wrapper = photo.closest(".profile-photo");
    if (avatar) {
      photo.src = avatar;
      wrapper.classList.add("has-image");
    } else {
      photo.removeAttribute("src");
      wrapper.classList.remove("has-image");
    }
  }

  function renderStats() {
    const total = state.registrations.length;
    const membros = state.registrations.filter((item) => item.tipo_cadastro === "Membro").length;
    const congregados = state.registrations.filter((item) => item.tipo_cadastro === "Congregado").length;

    $("#stat-total").textContent = total;
    $("#stat-membros").textContent = membros;
    $("#stat-congregados").textContent = congregados;
  }

  function renderList() {
    const list = $("#registrations-list");

    if (!state.registrations.length) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-folder-open"></i>
          <strong>Nenhum cadastro vinculado ainda</strong>
          <span>Clique em Cadastrar meu perfil para enviar sua primeira ficha.</span>
        </div>
      `;
      return;
    }

    list.innerHTML = state.registrations.map((item) => `
      <article class="registration-card">
        <span>
          <strong>${escapeHtml(item.nome || "Cadastro sem nome")}</strong>
          <small>${escapeHtml(item.cpf || "Documento não informado")} · Enviado em ${formatDate(item.created_at)}</small>
        </span>
        <span class="badge">${escapeHtml(item.tipo_cadastro || "Cadastro")}</span>
        <span class="card-actions">
          <button class="icon-btn" type="button" data-edit="${escapeHtml(item.id)}"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
          <button class="icon-btn" type="button" data-download="${escapeHtml(item.id)}"><i class="fa-solid fa-file-arrow-down"></i> Baixar ficha</button>
        </span>
      </article>
    `).join("");
  }

  async function loadAccount() {
    const { data, error } = await db.rpc("member_get_account", {
      p_session_token: state.session.token
    });

    if (error) throw error;
    const account = data?.[0];
    if (!account) throw new Error("Sessão expirada. Entre novamente.");

    saveSession({
      accountId: account.account_id,
      fullName: account.full_name,
      email: account.email,
      phone: account.phone,
      cpf: account.cpf,
      avatarUrl: account.avatar_url
    });
    renderAccount();
  }

  async function loadRegistrations() {
    showAlert("");
    const button = $("#refresh-btn");
    button.disabled = true;

    try {
      const { data, error } = await db.rpc("member_list_registrations", {
        p_session_token: state.session.token
      });

      if (error) throw error;
      state.registrations = data || [];
    } catch (error) {
      showAlert(error.message || "Não foi possível carregar seus cadastros.");
      state.registrations = [];
    } finally {
      button.disabled = false;
      renderStats();
      renderList();
    }
  }

  function compressAvatar(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("Escolha uma imagem para a foto de perfil."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 320;
          const ratio = Math.max(size / img.width, size / img.height);
          const width = img.width * ratio;
          const height = img.height * ratio;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, (size - width) / 2, (size - height) / 2, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      reader.readAsDataURL(file);
    });
  }

  async function saveProfile() {
    const firstName = $("#profile-first-name").value.trim();
    const lastName = $("#profile-last-name").value.trim();
    const phone = $("#profile-phone").value.trim();
    const button = $("#save-profile-btn");
    button.disabled = true;

    try {
      const { data, error } = await db.rpc("member_update_account", {
        p_session_token: state.session.token,
        p_first_name: firstName,
        p_last_name: lastName,
        p_phone: phone,
        p_avatar_url: state.avatarDraft || null
      });

      if (error) throw error;
      const account = data?.[0];
      saveSession({
        fullName: account.full_name,
        email: account.email,
        phone: account.phone,
        cpf: account.cpf,
        avatarUrl: account.avatar_url
      });
      state.avatarDraft = null;
      renderAccount();
      showAlert("Dados atualizados com sucesso.", "ok");
    } catch (error) {
      showAlert(error.message || "Não foi possível atualizar seus dados.");
    } finally {
      button.disabled = false;
    }
  }

  async function getFullRegistration(id) {
    const { data, error } = await db.rpc("member_get_registration", {
      p_session_token: state.session.token,
      p_registration_id: id
    });

    if (error) throw error;
    if (!data) throw new Error("Cadastro não encontrado para esta conta.");
    return data;
  }

  async function getPastorSignature() {
    try {
      const { data, error } = await db.rpc("get_pastor_signature");
      if (error) throw error;
      return data || {};
    } catch (error) {
      console.warn("Não foi possível carregar assinatura do pastor:", error);
      return {};
    }
  }

  function sanitizeFile(value) {
    return String(value || "ficha")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 70) || "ficha";
  }

  async function downloadRegistration(id) {
    let item;
    try {
      item = await getFullRegistration(id);
    } catch (error) {
      showAlert(error.message || "Não foi possível carregar a ficha.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;
    let y = 0;
    const text = (value, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);
    const date = (value) => value ? String(value).slice(0, 10).split("-").reverse().join("/") : "—";

    const addHeader = () => {
      doc.setFillColor(26, 18, 8);
      doc.rect(0, 0, pageW, 28, "F");
      doc.setTextColor(232, 201, 109);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("FICHA CADASTRAL COMPLETA", margin, 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("Igreja AD Bela-Vista · Rua Frei Lauro, 44 · Ponte do Imaruim · Palhoça - SC", margin, 19);
      doc.setTextColor(180, 150, 80);
      doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, pageW - margin, 12, { align: "right" });
      doc.text(`Status: ${text(item.status, "Ativo")}`, pageW - margin, 19, { align: "right" });
      y = 38;
    };

    const addFooter = () => {
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i += 1) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text(`Ficha de ${text(item.nome)}`, margin, pageH - 7);
        doc.text(`Página ${i} de ${pages}`, pageW - margin, pageH - 7, { align: "right" });
      }
    };

    const ensureSpace = (height) => {
      if (y + height <= pageH - 18) return;
      doc.addPage();
      addHeader();
    };

    const section = (title) => {
      ensureSpace(16);
      y += 2;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentW, 9, 2, 2, "FD");
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(title, margin + 3, y + 6);
      y += 14;
    };

    const addRows = (rows) => {
      const colGap = 8;
      const colW = (contentW - colGap) / 2;
      for (let i = 0; i < rows.length; i += 2) {
        const pair = [rows[i], rows[i + 1]].filter(Boolean);
        const prepared = pair.map(([label, value]) => {
          const lines = doc.splitTextToSize(text(value), colW - 4);
          return { label, lines };
        });
        const rowH = Math.max(10, ...prepared.map((entry) => 6 + entry.lines.length * 4));
        ensureSpace(rowH + 2);
        prepared.forEach((entry, index) => {
          const x = margin + index * (colW + colGap);
          doc.setTextColor(100, 116, 139);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.text(entry.label.toUpperCase(), x, y);
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(entry.lines, x, y + 4.5);
        });
        y += rowH;
      }
    };

    const addTextBlock = (title, value) => {
      if (!value) return;
      section(title);
      const lines = doc.splitTextToSize(text(value), contentW);
      ensureSpace(lines.length * 4 + 4);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(lines, margin, y);
      y += lines.length * 4 + 3;
    };

    addHeader();

    ensureSpace(34);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentW, 34, 3, 3, "FD");
    doc.setFillColor(254, 243, 199);
    doc.circle(margin + 17, y + 17, 13, "F");
    doc.setTextColor(146, 64, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Sem foto", margin + 17, y + 18, { align: "center" });
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(doc.splitTextToSize(text(item.nome), contentW - 42), margin + 36, y + 11);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`${text(item.tipo_cadastro)} · ${text(item.status, "Ativo")}`, margin + 36, y + 19);
    doc.text(`${item.tipo_cpf === "estrangeiro" ? "CRNM" : "CPF"}: ${text(item.cpf)} · Celular: ${text(item.celular)}`, margin + 36, y + 26);
    y += 42;

    section("Identificação");
    addRows([
      ["Nome completo", item.nome],
      ["Tipo de cadastro", item.tipo_cadastro],
      [item.tipo_cpf === "estrangeiro" ? "CRNM" : "CPF", item.cpf],
      ["RG", item.rg],
      ["Nascimento", date(item.data_nasc)],
      ["Idade", item.idade ? `${item.idade} anos` : "—"],
      ["Sexo", item.sexo],
      ["Tipo sanguíneo", item.tipo_sanguineo],
      ["Estado civil", item.estado_civil],
      ["Escolaridade", item.escolaridade],
      ["Cônjuge", item.conjuge_nome],
      ["Data casamento", date(item.data_casamento)]
    ]);

    section("Endereço e Contato");
    addRows([
      ["CEP", item.cep],
      ["Bairro", item.bairro],
      ["Endereço", item.endereco],
      ["Cidade / UF", item.cidade_estado],
      ["Fone residencial", item.fone_res],
      ["Fone comercial", item.fone_com],
      ["Celular / WhatsApp", item.celular],
      ["E-mail", item.email || state.session.email]
    ]);

    section("Dados Profissionais");
    addRows([
      ["Ocupação atual", item.ocupacao],
      ["Empresa / local de trabalho", item.empresa],
      ["Tem computador", item.tem_computador],
      ["Acesso à internet", item.tem_internet]
    ]);

    section("Dados da Igreja");
    addRows([
      ["Forma de recebimento", item.forma_recebimento],
      ["Setor", item.setor_igreja],
      ["Congregação", item.congregacao_igreja],
      ["Igreja anterior", item.igreja_anterior],
      ["Cidade da igreja anterior", item.igreja_cidade],
      ["Pastor anterior", item.igreja_pastor],
      ["Batismo nas águas", date(item.data_batismo_aguas)],
      ["Batismo no Espírito Santo", date(item.data_batismo_es)],
      ["Data de aprovação", date(item.data_aprovacao)],
      ["Cargo principal", item.cargo_principal],
      ["Outras funções", item.outras_funcoes]
    ]);

    section("Família");
    addRows([
      ["Quantidade de filhos", item.qtd_filhos ?? 0],
      ["Integrante 1", item.nome_dep1],
      ["Parentesco 1", item.parentesco_dep1],
      ["Integrante 2", item.nome_dep2],
      ["Parentesco 2", item.parentesco_dep2],
      ["Integrante 3", item.nome_dep3],
      ["Parentesco 3", item.parentesco_dep3]
    ]);

    addTextBlock("Talentos e Recursos", item.talentos);

    section("Documentos anexados");
    addRows([
      ["Foto do membro", item.foto_url ? "Anexada" : "Não anexada"],
      ["Documento", item.doc_url ? "Anexado" : "Não anexado"],
      ["Certidão de nascimento", item.foto_certidao_nasc ? "Anexada" : "Não anexada"],
      ["Certidão de casamento", item.foto_certidao_casamento ? "Anexada" : "Não anexada"],
      ["Diploma / certificado", item.foto_diploma ? "Anexado" : "Não anexado"],
      ["Comprovante de endereço", item.foto_comprovante_end ? "Anexado" : "Não anexado"]
    ]);

    section("Declaração e Assinatura");
    const pastorSignature = await getPastorSignature();
    const declaracao = "Declaro que as informações fornecidas neste cadastro são verdadeiras e completas. Comprometo-me a comunicar qualquer alteração ao secretariado da igreja.";
    const declaracaoLines = doc.splitTextToSize(declaracao, contentW);
    ensureSpace(declaracaoLines.length * 4 + 42);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(declaracaoLines, margin, y);
    y += declaracaoLines.length * 4 + 8;
    const assinaturaW = (contentW - 18) / 2;
    const membroX = margin;
    const pastorX = margin + assinaturaW + 18;

    if (pastorSignature.signature_url) {
      try {
        doc.addImage(pastorSignature.signature_url, "PNG", pastorX, y, 74, 26);
      } catch (error) {
        console.warn("Não foi possível inserir assinatura do pastor:", error);
      }
      y += 32;
    } else {
      y += 20;
    }

    doc.setDrawColor(15, 23, 42);
    doc.line(membroX, y, membroX + assinaturaW, y);
    doc.line(pastorX, y, pastorX + assinaturaW, y);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text("Assinatura do membro", membroX, y + 5);
    doc.text(pastorSignature.pastor_name || "Pastor responsável", pastorX, y + 5);
    doc.text(pastorSignature.pastor_role || "Pastor responsável", pastorX, y + 10);
    doc.text(`Data do cadastro: ${date(item.created_at)}`, pageW - margin, y + 16, { align: "right" });

    addFooter();
    doc.save(`ficha_completa_${sanitizeFile(item.nome)}.pdf`);
  }

  async function openEdit(id) {
    try {
      const item = await getFullRegistration(id);
      $("#edit-id").value = item.id || "";
      $("#edit-nome").value = item.nome || "";
      $("#edit-cpf").value = item.cpf || "";
      $("#edit-celular").value = item.celular || "";
      $("#edit-email").value = item.email || state.session.email || "";
      $("#edit-data-nasc").value = item.data_nasc ? String(item.data_nasc).slice(0, 10) : "";
      $("#edit-estado-civil").value = item.estado_civil || "";
      $("#edit-cidade-estado").value = item.cidade_estado || "";
      $("#edit-setor").value = item.setor_igreja || "";
      $("#edit-forma").value = item.forma_recebimento || "";
      $("#edit-talentos").value = item.talentos || "";
      $("#edit-overlay").classList.remove("hidden");
    } catch (error) {
      showAlert(error.message || "Não foi possível abrir a edição.");
    }
  }

  function closeEdit() {
    $("#edit-overlay").classList.add("hidden");
  }

  async function saveRegistrationEdit(event) {
    event.preventDefault();
    const id = $("#edit-id").value;
    const payload = {
      nome: $("#edit-nome").value.trim(),
      cpf: $("#edit-cpf").value.trim(),
      celular: $("#edit-celular").value.trim(),
      email: $("#edit-email").value.trim(),
      data_nasc: $("#edit-data-nasc").value || null,
      estado_civil: $("#edit-estado-civil").value.trim(),
      cidade_estado: $("#edit-cidade-estado").value.trim(),
      setor_igreja: $("#edit-setor").value.trim(),
      congregacao_igreja: $("#edit-setor").value.trim(),
      forma_recebimento: $("#edit-forma").value.trim(),
      talentos: $("#edit-talentos").value.trim()
    };

    try {
      const { error } = await db.rpc("member_update_registration", {
        p_session_token: state.session.token,
        p_registration_id: id,
        p_payload: payload
      });
      if (error) throw error;
      closeEdit();
      showAlert("Ficha atualizada com sucesso.", "ok");
      await loadRegistrations();
    } catch (error) {
      showAlert(error.message || "Não foi possível salvar a ficha.");
    }
  }

  async function logout() {
    const token = state.session?.token;
    localStorage.removeItem(MEMBER_SESSION_KEY);
    sessionStorage.removeItem(MEMBER_SESSION_KEY);
    state.session = null;

    if (token) {
      await db.rpc("member_logout_account", {
        p_session_token: token
      }).catch(() => {});
    }

    window.location.href = "/pages/membro-login.html";
  }

  function bindEvents() {
    $("#logout-btn").addEventListener("click", logout);
    $("#refresh-btn").addEventListener("click", loadRegistrations);
    $("#save-profile-btn").addEventListener("click", saveProfile);
    $("#profile-form").addEventListener("submit", (event) => {
      event.preventDefault();
      saveProfile();
    });
    $("#profile-phone").addEventListener("input", (event) => {
      event.currentTarget.value = maskPhone(event.currentTarget.value);
    });
    $("#close-edit-btn").addEventListener("click", closeEdit);
    $("#cancel-edit-btn").addEventListener("click", closeEdit);
    $("#edit-overlay").addEventListener("click", (event) => {
      if (event.target.id === "edit-overlay") closeEdit();
    });
    $("#edit-form").addEventListener("submit", saveRegistrationEdit);
    $("#edit-celular").addEventListener("input", (event) => {
      event.currentTarget.value = maskPhone(event.currentTarget.value);
    });
    $("#avatar-input").addEventListener("change", async (event) => {
      const file = event.currentTarget.files?.[0];
      if (!file) return;

      try {
        state.avatarDraft = await compressAvatar(file);
        saveSession({ avatarUrl: state.avatarDraft });
        renderAccount();
        showAlert("Foto pronta. Clique em Salvar para guardar no perfil.", "ok");
      } catch (error) {
        showAlert(error.message || "Não foi possível carregar a foto.");
      }
    });
    document.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit]");
      if (editButton) openEdit(editButton.dataset.edit);

      const downloadButton = event.target.closest("[data-download]");
      if (downloadButton) downloadRegistration(downloadButton.dataset.download);
    });
  }

  async function init() {
    try {
      state.session = JSON.parse(sessionStorage.getItem(MEMBER_SESSION_KEY) || localStorage.getItem(MEMBER_SESSION_KEY) || "null");
    } catch (error) {
      state.session = null;
    }

    if (!state.session?.token) {
      window.location.href = "/pages/membro-login.html";
      return;
    }

    bindEvents();
    renderAccount();
    setLoading(false);

    try {
      await loadAccount();
    } catch (error) {
      localStorage.removeItem(MEMBER_SESSION_KEY);
      sessionStorage.removeItem(MEMBER_SESSION_KEY);
      window.location.href = "/pages/membro-login.html";
      return;
    }

    await loadRegistrations();
  }

  init();
})();
