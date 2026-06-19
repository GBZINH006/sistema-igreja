(function () {
  const SUPABASE_URL = window.CONFIG.SUPABASE_URL;
  const SUPABASE_KEY = window.CONFIG.SUPABASE_KEY;

  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  let membrosCache = [];
  let ultimaBusca = "";
  const ROLES_PERMITIDOS = ["secretario"];

  const CAMPOS_EDICAO = [
    ["tipo", "tipo_cadastro"],
    ["status", "status"],
    ["tipo-cpf", "tipo_cpf"],
    ["nome", "nome"],
    ["cpf", "cpf"],
    ["rg", "rg"],
    ["sexo", "sexo"],
    ["data-nasc", "data_nasc", "date"],
    ["idade", "idade", "number"],
    ["estado-civil", "estado_civil"],
    ["tipo-sanguineo", "tipo_sanguineo"],
    ["escolaridade", "escolaridade"],
    ["data-casamento", "data_casamento", "date"],
    ["conjuge-nome", "conjuge_nome"],
    ["cep", "cep"],
    ["bairro", "bairro"],
    ["cidade-estado", "cidade_estado"],
    ["endereco", "endereco"],
    ["fone-res", "fone_res"],
    ["fone-com", "fone_com"],
    ["celular", "celular"],
    ["email", "email"],
    ["ocupacao", "ocupacao"],
    ["empresa", "empresa"],
    ["forma-recebimento", "forma_recebimento"],
    ["setor-igreja", "setor_igreja"],
    ["congregacao-igreja", "congregacao_igreja"],
    ["igreja-anterior", "igreja_anterior"],
    ["igreja-cidade", "igreja_cidade"],
    ["igreja-pastor", "igreja_pastor"],
    ["data-batismo-aguas", "data_batismo_aguas", "date"],
    ["data-batismo-es", "data_batismo_es", "date"],
    ["data-aprovacao", "data_aprovacao", "date"],
    ["cargo-principal", "cargo_principal"],
    ["outras-funcoes", "outras_funcoes"],
    ["qtd-filhos", "qtd_filhos", "number"],
    ["nome-dep1", "nome_dep1"],
    ["parentesco-dep1", "parentesco_dep1"],
    ["nome-dep2", "nome_dep2"],
    ["parentesco-dep2", "parentesco_dep2"],
    ["nome-dep3", "nome_dep3"],
    ["parentesco-dep3", "parentesco_dep3"],
    ["talentos", "talentos"],
    ["tem-computador", "tem_computador"],
    ["tem-internet", "tem_internet"]
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function safeText(value, fallback = "-") {
    const text = value === null || value === undefined || value === "" ? fallback : value;
    return escapeHtml(text);
  }

  function fmtDate(value) {
    if (!value) return "-";
    const partes = String(value).split("-");
    if (partes.length !== 3) return escapeHtml(value);
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function formatarCPF(digits) {
    if (!digits || digits.length !== 11) return digits;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  function limparBuscaBanco(value) {
    return String(value || "")
      .trim()
      .replace(/[,%]/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 80);
  }

  function mostrarTela(id) {
    $("tela-carregando").classList.remove("ativa");
    ["tela-login", "tela-principal"].forEach(telaId => {
      const el = $(telaId);
      el.classList.remove("ativa");
      el.style.display = "none";
    });

    const alvo = $(id);
    alvo.style.display = "";
    setTimeout(() => alvo.classList.add("ativa"), 10);
  }

  window.mostrarTela = mostrarTela;

  function toast(msg, dur = 2800) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), dur);
  }

  window.toast = toast;

  function statusBadge(status) {
    const s = status || "Ativo";
    const cls = s === "Ativo" ? "ativo" : (s === "Falecido" ? "alerta" : "neutro");
    return `<span class="badge badge-${cls}">${escapeHtml(s)}</span>`;
  }

  function tipoBadge(tipo) {
    const t = tipo || "Membro";
    return `<span class="badge badge-${t === "Membro" ? "membro" : "congregado"}">${escapeHtml(t)}</span>`;
  }

  function avatar(m) {
    if (m.foto_url) {
      return `<img src="${escapeAttr(m.foto_url)}" alt="" class="avatar" referrerpolicy="no-referrer">`;
    }
    return `<div class="avatar-placeholder"><i class="fa-solid fa-user"></i></div>`;
  }

  async function obterPerfil(userId) {
    const { data, error } = await db
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  }

  async function validarAcesso(session) {
    if (!session?.user?.id) return false;

    const profile = await obterPerfil(session.user.id);
    if (!profile || !ROLES_PERMITIDOS.includes(profile.role)) {
      alert("Acesso negado. Esta pagina e restrita a secretaria.");
      await db.auth.signOut();
      mostrarTela("tela-login");
      return false;
    }

    $("header-email").textContent = session.user.email || "";
    mostrarTela("tela-principal");
    renderEstadoInicial();
    return true;
  }

  async function fazerLogin() {
    const email = $("login-email").value.trim();
    const senha = $("login-senha").value;
    const erro = $("login-erro");
    const btn = $("btn-entrar");

    if (!email || !senha) {
      erro.textContent = "Preencha e-mail e senha.";
      erro.classList.add("show");
      return;
    }

    btn.innerHTML = '<span class="loading"></span> Entrando...';
    btn.disabled = true;
    erro.classList.remove("show");

    const { data, error } = await db.auth.signInWithPassword({ email, password: senha });

    btn.innerHTML = '<i class="fa-solid fa-lock"></i> Entrar no Painel';
    btn.disabled = false;

    if (error) {
      erro.textContent = error.message;
      erro.classList.add("show");
      return;
    }

    await validarAcesso(data.session);
  }

  window.fazerLogin = fazerLogin;

  async function sair() {
    await db.auth.signOut();
    membrosCache = [];
    ultimaBusca = "";
    $("login-email").value = "";
    $("login-senha").value = "";
    mostrarTela("tela-login");
  }

  window.sair = sair;

  function abrirCadastro() {
    window.open("cadastro.html", "_blank", "noopener,noreferrer");
  }

  window.abrirCadastro = abrirCadastro;

  function atalhoBusca(event) {
    if (event.key === "Enter") pesquisarMembro();
  }

  window.atalhoBusca = atalhoBusca;

  function renderEstadoInicial() {
    $("resultado-resumo").textContent = "Nenhuma busca realizada.";
    $("corpo-resultados").innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty">
            <i class="fa-solid fa-id-card-clip"></i>
            <p>Pesquise pelo nome ou CPF para localizar um cadastro.</p>
          </div>
        </td>
      </tr>`;
  }

  function renderCarregando() {
    $("resultado-resumo").textContent = "Buscando...";
    $("corpo-resultados").innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:var(--muted);padding:2.5rem;">
          <span class="loading"></span>
          <span style="margin-left:10px;">Consultando cadastros...</span>
        </td>
      </tr>`;
  }

  function renderResultados() {
    const corpo = $("corpo-resultados");
    const total = membrosCache.length;

    $("resultado-resumo").textContent = total
      ? `${total} resultado${total > 1 ? "s" : ""} para "${ultimaBusca}".`
      : `Nenhum resultado para "${ultimaBusca}".`;

    if (!total) {
      corpo.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty">
              <i class="fa-solid fa-magnifying-glass"></i>
              <p>Nenhum cadastro encontrado.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    corpo.innerHTML = membrosCache.map(m => `
      <tr id="row-${escapeAttr(m.id)}">
        <td>
          <div class="td-member">
            ${avatar(m)}
            <div>
              <strong>${safeText(m.nome)}</strong>
              <div style="font-size:0.72rem;color:var(--muted);">${safeText(m.celular)}</div>
            </div>
          </div>
        </td>
        <td>${tipoBadge(m.tipo_cadastro)}</td>
        <td>${statusBadge(m.status)}</td>
        <td>${safeText(m.cpf)}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-ghost btn-sm" onclick="verDetalhes('${escapeAttr(m.id)}')" title="Ver detalhes">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="abrirEdicao('${escapeAttr(m.id)}')" title="Editar cadastro">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-gold btn-sm" onclick="imprimirFicha('${escapeAttr(m.id)}')" title="Imprimir ficha">
              <i class="fa-solid fa-print"></i>
            </button>
          </div>
        </td>
      </tr>`).join("");
  }

  async function pesquisarMembro() {
    const buscaOriginal = $("busca-secretaria").value.trim();
    const busca = limparBuscaBanco(buscaOriginal);
    const digits = buscaOriginal.replace(/\D/g, "");

    if (busca.length < 3 && digits.length < 4) {
      toast("Digite pelo menos 3 letras ou 4 numeros do documento.");
      $("busca-secretaria").focus();
      return;
    }

    ultimaBusca = buscaOriginal;
    renderCarregando();

    const { data, error } = await db.rpc("buscar_membros_secretaria", {
      termo: busca,
      termo_digits: digits,
      termo_cpf_formatado: formatarCPF(digits)
    });

    if (error) {
      console.warn(error);
      toast("Erro ao buscar cadastro.");
      membrosCache = [];
      renderResultados();
      return;
    }

    membrosCache = data || [];
    renderResultados();
  }

  window.pesquisarMembro = pesquisarMembro;

  function limparBusca() {
    $("busca-secretaria").value = "";
    membrosCache = [];
    ultimaBusca = "";
    renderEstadoInicial();
    $("busca-secretaria").focus();
  }

  window.limparBusca = limparBusca;

  function buscarCache(id) {
    return membrosCache.find(m => String(m.id) === String(id));
  }

  function campo(label, value) {
    return `<div class="modal-field"><strong>${escapeHtml(label)}</strong><span>${safeText(value)}</span></div>`;
  }

  function linkArquivo(label, url) {
    if (!url) return campo(label, "");
    return `<div class="modal-field"><strong>${escapeHtml(label)}</strong><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">Abrir arquivo</a></div>`;
  }

  function verDetalhes(id) {
    const m = buscarCache(id);
    if (!m) return;

    $("modal-conteudo").innerHTML = `
      <div class="modal-header">
        <div style="display:flex;align-items:center;min-width:0;">
          ${m.foto_url ? `<img src="${escapeAttr(m.foto_url)}" class="foto-modal-grande" referrerpolicy="no-referrer">` : `<div class="foto-modal-grande" style="background:rgba(201,168,76,0.12);display:flex;align-items:center;justify-content:center;color:var(--gold2);"><i class="fa-solid fa-user"></i></div>`}
          <div>
            <div class="modal-nome">${safeText(m.nome)}</div>
            <div style="margin-top:5px;display:flex;gap:6px;flex-wrap:wrap;">${tipoBadge(m.tipo_cadastro)}${statusBadge(m.status)}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('modal-overlay').classList.remove('open')"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Dados pessoais</div>
        <div class="modal-grid">
          ${campo(m.tipo_cpf === "estrangeiro" ? "CRNM" : "CPF", m.cpf)}
          ${campo("RG", m.rg)}
          ${campo("Nascimento", `${fmtDate(m.data_nasc)}${m.idade ? " - " + m.idade + " anos" : ""}`)}
          ${campo("Sexo", m.sexo)}
          ${campo("Estado civil", m.estado_civil)}
          ${campo("Tipo sanguineo", m.tipo_sanguineo)}
          ${campo("Escolaridade", m.escolaridade)}
          ${campo("Conjuge", m.conjuge_nome)}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Endereco e contato</div>
        <div class="modal-grid">
          ${campo("Endereco", m.endereco)}
          ${campo("Bairro", m.bairro)}
          ${campo("Cidade / UF", m.cidade_estado)}
          ${campo("CEP", m.cep)}
          ${campo("Fone residencial", m.fone_res)}
          ${campo("Fone comercial", m.fone_com)}
          ${campo("Celular", m.celular)}
          ${campo("E-mail", m.email)}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Profissional e igreja</div>
        <div class="modal-grid">
          ${campo("Ocupacao", m.ocupacao)}
          ${campo("Empresa", m.empresa)}
          ${campo("Forma recebimento", m.forma_recebimento)}
          ${campo("Setor", m.setor_igreja)}
          ${campo("Congregacao", m.congregacao_igreja)}
          ${campo("Cargo principal", m.cargo_principal)}
          ${campo("Igreja anterior", m.igreja_anterior)}
          ${campo("Pastor anterior", m.igreja_pastor)}
          ${campo("Batismo aguas", fmtDate(m.data_batismo_aguas))}
          ${campo("Batismo ES", fmtDate(m.data_batismo_es))}
          ${campo("Data aprovacao", fmtDate(m.data_aprovacao))}
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Familia e recursos</div>
        <div class="modal-grid">
          ${campo("Qtd. filhos", m.qtd_filhos)}
          ${campo("Integrante 1", m.nome_dep1)}
          ${campo("Parentesco 1", m.parentesco_dep1)}
          ${campo("Integrante 2", m.nome_dep2)}
          ${campo("Parentesco 2", m.parentesco_dep2)}
          ${campo("Integrante 3", m.nome_dep3)}
          ${campo("Parentesco 3", m.parentesco_dep3)}
          ${campo("Tem computador", m.tem_computador)}
          ${campo("Tem internet", m.tem_internet)}
        </div>
        ${m.talentos ? `<div style="margin-top:0.75rem;font-size:0.88rem;">${safeText(m.talentos)}</div>` : ""}
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Arquivos</div>
        <div class="modal-grid">
          ${linkArquivo("Documento", m.doc_url)}
          ${linkArquivo("Certidao nascimento", m.foto_certidao_nasc)}
          ${linkArquivo("Certidao casamento", m.foto_certidao_casamento)}
          ${linkArquivo("Diploma", m.foto_diploma)}
          ${linkArquivo("Comprovante endereco", m.foto_comprovante_end)}
          ${linkArquivo("Assinatura", m.assinatura_url)}
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-top:1rem;justify-content:flex-end;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" onclick="abrirEdicao('${escapeAttr(m.id)}');document.getElementById('modal-overlay').classList.remove('open')">
          <i class="fa-solid fa-pen-to-square"></i> Editar
        </button>
        <button class="btn btn-gold btn-sm" onclick="imprimirFicha('${escapeAttr(m.id)}')">
          <i class="fa-solid fa-print"></i> Ficha
        </button>
      </div>`;

    $("modal-overlay").classList.add("open");
  }

  window.verDetalhes = verDetalhes;

  function ensureSelectValue(el, value) {
    if (!el || value === null || value === undefined || value === "") return;
    const exists = Array.from(el.options || []).some(opt => opt.value === String(value));
    if (!exists) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      el.appendChild(opt);
    }
  }

  function setEditValue(sufixo, value) {
    const el = $("edit-" + sufixo);
    if (!el) return;
    ensureSelectValue(el, value);
    el.value = value ?? "";
  }

  function sincronizarEdicaoCongregacaoSecretaria() {
    const setor = $("edit-setor-igreja");
    const congregacao = $("edit-congregacao-igreja");

    if (setor && congregacao) {
      congregacao.value = setor.value || "";
    }
  }

  window.sincronizarEdicaoCongregacaoSecretaria = sincronizarEdicaoCongregacaoSecretaria;

  function abrirEdicao(id) {
    const m = buscarCache(id);
    if (!m) return;

    $("edit-id").value = m.id;
    CAMPOS_EDICAO.forEach(([sufixo, key]) => setEditValue(sufixo, m[key]));
    sincronizarEdicaoCongregacaoSecretaria();

    ["foto-url", "doc-url", "assinatura-url"].forEach(sufixo => {
      const el = $("edit-" + sufixo + "-file");
      if (el) el.value = "";
    });

    $("edit-overlay").classList.add("open");
  }

  window.abrirEdicao = abrirEdicao;

  function fecharEdicao() {
    $("edit-overlay").classList.remove("open");
  }

  window.fecharEdicao = fecharEdicao;

  function getEditValue(sufixo, tipo) {
    const el = $("edit-" + sufixo);
    if (!el) return "";

    if (tipo === "number") {
      const n = Number(el.value);
      return Number.isFinite(n) && el.value !== "" ? n : null;
    }

    if (tipo === "date") {
      return el.value || null;
    }

    return el.value?.trim?.() ?? el.value ?? "";
  }

  async function comprimirImagem(file, maxDim = 1000) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.84);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadArquivoEdicao(inputId, pasta) {
    const input = $(inputId);
    if (!input || !input.files[0]) return null;

    const file = input.files[0];
    const isImage = file.type.startsWith("image/");
    const uploadFile = isImage ? await comprimirImagem(file) : file;
    const ext = isImage ? "jpg" : (file.name.split(".").pop() || "pdf");
    const path = `secretaria/${crypto.randomUUID()}/${pasta}/${Date.now()}.${ext}`;

    const { error } = await db.storage
      .from("membros-docs")
      .upload(path, uploadFile, {
        contentType: isImage ? "image/jpeg" : file.type,
        upsert: true
      });

    if (error) {
      console.warn(error.message);
      return null;
    }

    const { data, error: signedError } = await db.storage
      .from("membros-docs")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    if (signedError) {
      console.warn(signedError.message);
      return null;
    }

    return data.signedUrl;
  }

  async function salvarEdicao() {
    const id = $("edit-id").value;
    const nome = $("edit-nome").value.trim();
    const btn = $("btn-salvar-edit");

    if (!id) return;
    if (!nome) {
      toast("Nome obrigatorio.");
      $("edit-nome").focus();
      return;
    }

    const dados = {};
    CAMPOS_EDICAO.forEach(([sufixo, key, tipo]) => {
      dados[key] = getEditValue(sufixo, tipo);
    });
    dados.congregacao_igreja = dados.setor_igreja || "";
    sincronizarEdicaoCongregacaoSecretaria();

    btn.innerHTML = '<span class="loading"></span> Salvando...';
    btn.disabled = true;

    try {
      const [novaFoto, novoDoc, novaAssinatura] = await Promise.all([
        uploadArquivoEdicao("edit-foto-url-file", "fotos"),
        uploadArquivoEdicao("edit-doc-url-file", "documentos"),
        uploadArquivoEdicao("edit-assinatura-url-file", "assinaturas")
      ]);

      const atual = buscarCache(id);
      if (novaFoto) dados.foto_url = novaFoto;
      else if (atual?.foto_url) dados.foto_url = atual.foto_url;

      if (novoDoc) dados.doc_url = novoDoc;
      else if (atual?.doc_url) dados.doc_url = atual.doc_url;

      if (novaAssinatura) dados.assinatura_url = novaAssinatura;
      else if (atual?.assinatura_url) dados.assinatura_url = atual.assinatura_url;

      const { error } = await db
        .from("membros")
        .update(dados)
        .eq("id", id);

      if (error) throw error;

      membrosCache = membrosCache.map(m => String(m.id) === String(id) ? { ...m, ...dados } : m);
      renderResultados();
      fecharEdicao();
      toast("Cadastro atualizado.");
    } catch (error) {
      console.warn(error);
      toast("Erro ao salvar alteracoes.");
    } finally {
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alteracoes';
      btn.disabled = false;
    }
  }

  window.salvarEdicao = salvarEdicao;

  function fecharOverlayClick(event, id) {
    if (event.target === $(id)) $(id).classList.remove("open");
  }

  window.fecharOverlayClick = fecharOverlayClick;

  function check(condicao) {
    return `<span class="ficha-check">${condicao ? "X" : ""}</span>`;
  }

  function valorFicha(value) {
    return escapeHtml(value === null || value === undefined || value === "" ? "" : value);
  }

  function dataFicha(value) {
    const v = fmtDate(value);
    return v === "-" ? "" : escapeHtml(v);
  }

  function col(label, value, extra = "") {
    return `<div class="ficha-col ${extra}"><span class="ficha-label">${escapeHtml(label)}</span><span class="ficha-value">${valorFicha(value)}</span></div>`;
  }

  function montarFichaHTML(m) {
    const tipo = m.tipo_cadastro || "";
    const sexo = m.sexo || "";
    const assinatura = m.assinatura_url
      ? `<img src="${escapeAttr(m.assinatura_url)}" class="assinatura-img" referrerpolicy="no-referrer">`
      : "";

    return `
      <div class="ficha-a4">
        <div class="ficha-topo">
          <div class="ficha-endereco">
            Rua Frei Lauro, 44<br>
            Ponte do Imaruim - CEP 88130-750<br>
            Palhoca - Santa Catarina<br>
            <strong>Fone: (48) 3242-2451</strong>
          </div>
          <div class="ficha-logo">
            <img src="images-removebg-preview.png" alt="">
            ASSEMBLEIA DE DEUS<br>PALHOCA - SC
          </div>
          <div class="ficha-titulo">FICHA CADASTRAL</div>
        </div>

        <div class="ficha-tipo">
          <span>${check(tipo === "Membro")} MEMBRO</span>
          <span>${check(tipo === "Congregado")} CONGREGADO</span>
        </div>

        <div class="ficha-row" style="grid-template-columns:1fr 1fr;border:1.4px solid #333;border-radius:3mm;overflow:hidden;margin-bottom:1.2mm;">
          ${col("Congregacao", m.congregacao_igreja)}
          ${col("Setor", m.setor_igreja)}
        </div>

        <div class="ficha-section-title">Dados pessoais</div>
        <div class="ficha-box">
          <div class="ficha-row" style="grid-template-columns:1.6fr 1fr 1fr;">
            ${col("Nome", m.nome)}
            ${col(m.tipo_cpf === "estrangeiro" ? "CRNM" : "CPF", m.cpf)}
            ${col("RG", m.rg)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr 1fr 1fr 1fr;">
            <div class="ficha-col">
              <span class="ficha-label">Sexo</span>
              <span class="ficha-value">${check(sexo === "M")} Masculino&nbsp;&nbsp;${check(sexo === "F")} Feminino</span>
            </div>
            ${col("Estado civil", m.estado_civil)}
            ${col("Data nascimento", dataFicha(m.data_nasc))}
            ${col("Idade", m.idade)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr 1fr 1fr;">
            ${col("Tipo sanguineo", m.tipo_sanguineo)}
            ${col("Escolaridade", m.escolaridade)}
            ${col("Data casamento", dataFicha(m.data_casamento))}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr 1fr;">
            ${col("Nome conjuge", m.conjuge_nome)}
            ${col("E-mail", m.email)}
          </div>
        </div>

        <div class="ficha-section-title">Endereco e contato</div>
        <div class="ficha-box">
          <div class="ficha-row" style="grid-template-columns:1.4fr 1fr;">
            ${col("Endereco", m.endereco)}
            ${col("Bairro", m.bairro)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr 0.55fr 1fr 1fr;">
            ${col("Cidade / UF", m.cidade_estado)}
            ${col("CEP", m.cep)}
            ${col("Telefone residencial", m.fone_res)}
            ${col("Telefone comercial", m.fone_com)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr 1fr;">
            ${col("Telefone celular", m.celular)}
            ${col("Status", m.status || "Ativo")}
          </div>
        </div>

        <div class="ficha-section-title">Dados profissionais</div>
        <div class="ficha-box">
          <div class="ficha-row" style="grid-template-columns:1fr 1fr;">
            ${col("Ocupacao atual", m.ocupacao)}
            ${col("Empresa / local de trabalho", m.empresa)}
          </div>
        </div>

        <div class="ficha-section-title">Igreja</div>
        <div class="ficha-box">
          <div class="ficha-row" style="grid-template-columns:1fr 1fr 1fr;">
            ${col("Forma de recebimento", m.forma_recebimento)}
            ${col("Data batismo nas aguas", dataFicha(m.data_batismo_aguas))}
            ${col("Batismo Espirito Santo", dataFicha(m.data_batismo_es))}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr 1fr 1fr;">
            ${col("Igreja anterior", m.igreja_anterior)}
            ${col("Cidade", m.igreja_cidade)}
            ${col("Pastor anterior", m.igreja_pastor)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr 1fr 1fr;">
            ${col("Cargo principal", m.cargo_principal)}
            ${col("Data aprovacao", dataFicha(m.data_aprovacao))}
            ${col("Congregacao", m.congregacao_igreja)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr;">
            ${col("Outras funcoes", m.outras_funcoes)}
          </div>
        </div>

        <div class="ficha-section-title">Familia</div>
        <div class="ficha-box">
          <div class="ficha-row" style="grid-template-columns:1.2fr 0.5fr;">
            ${col("Nome conjuge", m.conjuge_nome)}
            ${col("Quantidade de filhos", m.qtd_filhos)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1.4fr 0.8fr;">
            ${col("Integrante 1", m.nome_dep1)}
            ${col("Parentesco", m.parentesco_dep1)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1.4fr 0.8fr;">
            ${col("Integrante 2", m.nome_dep2)}
            ${col("Parentesco", m.parentesco_dep2)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1.4fr 0.8fr;">
            ${col("Integrante 3", m.nome_dep3)}
            ${col("Parentesco", m.parentesco_dep3)}
          </div>
        </div>

        <div class="ficha-section-title">Talentos e habilidades</div>
        <div class="ficha-box">
          <div class="ficha-row" style="grid-template-columns:1fr;">
            ${col("Talentos", m.talentos)}
          </div>
          <div class="ficha-row" style="grid-template-columns:1fr 1fr 1.4fr;">
            <div class="ficha-col"><span class="ficha-label">Tem computador em casa?</span><span class="ficha-value">${check(m.tem_computador === "Sim")} Sim&nbsp;&nbsp;${check(m.tem_computador === "Nao" || m.tem_computador === "Não")} Nao</span></div>
            <div class="ficha-col"><span class="ficha-label">Acessa a internet?</span><span class="ficha-value">${check(m.tem_internet === "Sim")} Sim&nbsp;&nbsp;${check(m.tem_internet === "Nao" || m.tem_internet === "Não")} Nao</span></div>
            ${col("Observacao", "")}
          </div>
        </div>

        <div class="ficha-row" style="grid-template-columns:1fr 1fr;border:1.4px solid #333;border-radius:3mm;overflow:hidden;margin-top:2mm;min-height:17mm;">
          ${col("Data do preenchimento", dataFicha(m.created_at ? String(m.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10)))}
          <div class="ficha-col"><span class="ficha-label">Assinatura</span>${assinatura}</div>
        </div>
      </div>`;
  }

  function imprimirFicha(id) {
    const m = buscarCache(id);
    if (!m) return;

    $("layout-impressao").innerHTML = montarFichaHTML(m);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        $("layout-impressao").innerHTML = "";
      }, 700);
    }, 200);
  }

  window.imprimirFicha = imprimirFicha;

  document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await db.auth.getSession();

    if (session) {
      await validarAcesso(session);
    } else {
      mostrarTela("tela-login");
    }
  });
})();
