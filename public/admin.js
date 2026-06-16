// Painel do Pastor — lógica do admin
// Extraído do admin.html para arquivo separado.

(function () {
  const SUPABASE_URL = window.CONFIG.SUPABASE_URL;
  const SUPABASE_KEY = window.CONFIG.SUPABASE_KEY;

  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  let membrosCache = [], paginaAtual = 1, anivAberto = true, graficosAberto = true;
  let chartCrescimento = null, chartTipo = null, chartSetor = null;
  let historicoNotif = [], notifNaoLidas = 0, primeiraLeitura = true;
  const POR_PAGINA = 20;
  const ROLE_ADMIN = 'admin';

  function mostrarTela(id) {
    document.getElementById('tela-carregando').classList.remove('ativa');
    ['tela-login', 'tela-principal'].forEach(t => {
      const el = document.getElementById(t);
      el.classList.remove('ativa');
      el.style.display = 'none';
    });
    const alvo = document.getElementById(id);
    alvo.style.display = '';
    setTimeout(() => alvo.classList.add('ativa'), 10);
  }

  window.mostrarTela = mostrarTela;

  function prepararPainelPremium() {
    const tela = document.getElementById('tela-principal');
    const header = tela?.querySelector('header');
    const main = tela?.querySelector('main');
    if (!tela || !header || !main || document.getElementById('admin-sidebar')) return;

    tela.classList.add('admin-premium');
    tela.insertAdjacentHTML('afterbegin', `
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="sidebar-brand">
          <img src="images-removebg-preview.png" alt="Logo AD Bela-Vista" class="sidebar-logo">
          <div><strong>AD Bela-Vista</strong><span>Gestao de Membros</span></div>
        </div>
        <nav class="sidebar-nav" aria-label="Navegacao principal">
          <a class="side-link active" href="#dashboard-top"><i class="fa-solid fa-table-columns"></i><span>Dashboard</span></a>
          <a class="side-link" href="#graficos-body"><i class="fa-solid fa-chart-line"></i><span>Crescimento</span></a>
          <a class="side-link" href="#aniv-body"><i class="fa-solid fa-cake-candles"></i><span>Aniversarios</span></a>
          <a class="side-link" href="#corpo-lista"><i class="fa-solid fa-users"></i><span>Membros</span></a>
          <a class="side-link" href="#activity-timeline"><i class="fa-solid fa-bolt"></i><span>Atividades</span></a>
        </nav>
        <div class="sidebar-footer">
          <span class="realtime-dot"></span>
          <div><strong>Tempo real ativo</strong><small>Supabase conectado</small></div>
        </div>
      </aside>`);

    main.id = 'dashboard-top';
    const headerTitle = header.querySelector('.header-title');
    const headerSub = header.querySelector('.header-sub');
    if (headerTitle) headerTitle.textContent = 'Painel Administrativo';
    if (headerSub) headerSub.textContent = 'AD Bela-Vista - Gestao de Membros';
    header.insertAdjacentHTML('afterbegin', `
      <button class="mobile-menu" type="button" onclick="document.body.classList.toggle('sidebar-open')" aria-label="Abrir menu">
        <i class="fa-solid fa-bars"></i>
      </button>`);

    const actions = header.querySelector(':scope > div:last-child');
    if (actions && !document.getElementById('busca-global')) {
      actions.insertAdjacentHTML('afterbegin', `
        <label class="header-search" aria-label="Busca global">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input id="busca-global" type="text" placeholder="Buscar por nome, CPF, celular ou e-mail">
        </label>
        <button class="btn btn-ghost btn-sm support-action" type="button" onclick="toast('Suporte acionado. A secretaria recebera sua solicitacao.')" title="Suporte">
          <i class="fa-solid fa-headset"></i><span class="btn-text">Suporte</span>
        </button>`);
      document.getElementById('busca-global').addEventListener('input', (event) => {
        const busca = document.getElementById('busca');
        if (busca) busca.value = event.target.value;
        renderLista();
      });
    }

    const graficosCard = document.getElementById('graficos-body')?.closest('.aniv-card');
    if (graficosCard) {
      graficosCard.classList.add('charts-panel');
      const chartTitles = graficosCard.querySelectorAll('#graficos-body span');
      if (chartTitles[0]) chartTitles[0].textContent = 'Crescimento de Membros';
      if (chartTitles[1]) chartTitles[1].textContent = 'Distribuicao dos Membros';
      if (chartTitles[2]) chartTitles[2].textContent = 'Membros por Setor';
      const headerGraf = graficosCard.querySelector('.aniv-header');
      if (headerGraf && !document.getElementById('filtro-periodo')) {
        headerGraf.insertAdjacentHTML('beforeend', `
          <select class="filtro period-filter" id="filtro-periodo" onclick="event.stopPropagation()" onchange="renderGraficos()">
            <option value="7">Ultimos 7 dias</option>
            <option value="30">Ultimos 30 dias</option>
            <option value="180">Ultimos 6 meses</option>
            <option value="365" selected>Ultimos 12 meses</option>
          </select>`);
      }
    }
    const aniversariosCard = document.getElementById('aniv-body')?.closest('.aniv-card');
    if (aniversariosCard) aniversariosCard.classList.add('birthdays-panel');

    const tableWrap = document.querySelector('.table-wrap');
    if (tableWrap && !document.getElementById('activity-timeline')) {
      const thead = tableWrap.querySelector('thead tr');
      if (thead) {
        thead.innerHTML = '<th>Foto</th><th>Nome</th><th>CPF</th><th>Tipo</th><th>Status</th><th>Ministerio</th><th>Celular</th><th>Acoes</th>';
      }
      tableWrap.insertAdjacentHTML('beforebegin', `
        <section class="activity-panel" id="activity-timeline">
          <div class="aniv-header"><div class="aniv-title"><i class="fa-solid fa-bolt"></i> Centro de Atividades</div></div>
          <div class="timeline">
            <div class="timeline-item"><span></span><div><strong>Novo membro cadastrado</strong><small id="activity-last-name">Aguardando dados</small></div><em id="activity-last-time">-</em></div>
            <div class="timeline-item"><span></span><div><strong>Atualizacao de cadastro</strong><small>Dados pastorais revisados</small></div><em>Hoje</em></div>
            <div class="timeline-item"><span></span><div><strong>Documento enviado</strong><small>Ficha com anexo recebido</small></div><em>Recente</em></div>
            <div class="timeline-item"><span></span><div><strong>Mudanca de ministerio</strong><small>Organizacao ministerial atualizada</small></div><em>Semana</em></div>
          </div>
        </section>`);
    }

    document.querySelectorAll('.stat-card').forEach((card, index) => {
      if (card.querySelector('.sparkline')) return;
      const icons = ['fa-users', 'fa-cake-candles', 'fa-user-group', 'fa-user-check', 'fa-user-plus'];
      const labels = ['Total de Membros', 'Aniversariantes', 'Congregados', 'Membros Ativos', 'Novos Cadastros'];
      const lbl = card.querySelector('.stat-lbl');
      if (lbl) lbl.textContent = labels[index] || lbl.textContent;
      card.insertAdjacentHTML('afterbegin', `<div class="stat-icon"><i class="fa-solid ${icons[index] || 'fa-chart-simple'}"></i></div>`);
      card.insertAdjacentHTML('beforeend', `<svg class="sparkline" viewBox="0 0 120 34" aria-hidden="true"><path d="M2 25 C16 12 28 26 42 15 S68 7 84 14 102 5 118 10"/></svg>`);
    });
  }

  async function obterPerfil(userId) {
    const { data, error } = await db
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao validar perfil:', error.message);
      return null;
    }

    return data;
  }

  async function validarAcesso(session) {
    if (!session?.user?.id) {
      mostrarTela('tela-login');
      return false;
    }

    const profile = await obterPerfil(session.user.id);
    if (!profile || profile.role !== ROLE_ADMIN) {
      const email = session.user.email || 'este usuario';
      const roleAtual = profile?.role ? ` Role atual: ${profile.role}.` : ' Perfil nao encontrado em public.profiles.';
      alert(`Acesso negado para ${email}.${roleAtual} Coloque este usuario como admin no SQL do Supabase.`);
      await db.auth.signOut();
      membrosCache = [];
      mostrarTela('tela-login');
      return false;
    }

    document.getElementById('header-email').textContent = session.user.email || '';
    mostrarTela('tela-principal');
    carregarLista();
    iniciarRealtime();
    return true;
  }

  async function fazerLogin() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const erro = document.getElementById('login-erro');
    const btn = document.getElementById('btn-entrar');

    if (!email || !senha) {
      erro.textContent = '⚠️ Preencha e-mail e senha.';
      erro.classList.add('show');
      return;
    }

    btn.innerHTML = '<span class="loading"></span> Entrando…';
    btn.disabled = true;
    erro.classList.remove('show');

    const { data, error } = await db.auth.signInWithPassword({ email, password: senha });
    btn.innerHTML = '✝ Entrar no Painel';
    btn.disabled = false;

    if (error) {
      console.log("ERRO REAL:", error);
      erro.textContent = "❌ " + error.message;
      erro.classList.add('show');

      const box = document.querySelector('.login-box');
      box.style.animation = 'none';
      box.offsetHeight;
      box.style.animation = 'shake 0.4s ease';
      setTimeout(() => box.style.animation = '', 500);
      return;
    }

    await validarAcesso(data.session);
  }

  window.fazerLogin = fazerLogin;

  async function sair() {
    await db.auth.signOut();
    membrosCache = [];
    document.getElementById('login-email').value = '';
    document.getElementById('login-senha').value = '';
    mostrarTela('tela-login');
  }

  window.sair = sair;

  function abrirCadastro() {
    window.open('cadastro.html', '_blank', 'noopener,noreferrer');
  }

  window.abrirCadastro = abrirCadastro;

  function toast(msg, dur = 2800) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  window.toast = toast;

  function maskCPF(i) {
    let v = i.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    i.value = v;
  }
  window.maskCPF = maskCPF;

  function maskCEP(i) {
    i.value = i.value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
  }
  window.maskCEP = maskCEP;

  function maskPhone(i) {
    let v = i.value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2');
    i.value = v;
  }
  window.maskPhone = maskPhone;

  function fmt(v) { return v || '<span style="color:var(--muted)">—</span>'; }
  function fmtDate(v) { return v ? v.split('-').reverse().join('/') : '<span style="color:var(--muted)">—</span>'; }

  function statusBadge(s) {
    const cls = { 'Ativo': 'ativo', 'Inativo': 'inativo', 'Transferido': 'transferido', 'Falecido': 'falecido' }[s] || 'ativo';
    return `<span class="badge badge-${cls}">${s || 'Ativo'}</span>`;
  }

  function whatsappLink(cel) {
    if (!cel) return '';
    const n = cel.replace(/\D/g, '');
    return `<a href="https://wa.me/55${n}" target="_blank" class="btn btn-green btn-sm" style="text-decoration:none;">💬</a>`;
  }

  function avatarImg(m, size = 32) {
    if (m.foto_url) return `<img src="${m.foto_url}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;">`;
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(201,168,76,0.12);display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.45)}px;flex-shrink:0;">👤</div>`;
  }

  // ── NOTIFICAÇÕES ───────────────────────────────────────
  function atualizarSinoBadge() {
    const badge = document.getElementById('sino-badge');
    if (notifNaoLidas > 0) {
      badge.textContent = notifNaoLidas > 9 ? '9+' : notifNaoLidas;
      badge.classList.add('visivel');
    } else badge.classList.remove('visivel');
  }

  function fecharNotif(id) {
    const card = document.getElementById(id);
    if (!card) return;
    card.classList.add('notif-saindo');
    setTimeout(() => card.remove(), 300);
  }

  function abrirHistoricoNotif() {
    notifNaoLidas = 0;
    atualizarSinoBadge();
    renderHistorico();
    document.getElementById('hist-overlay').classList.add('open');
  }

  window.abrirHistoricoNotif = abrirHistoricoNotif;

  function criarNotificacao(membro) {
    if (primeiraLeitura) return;
    const id = 'notif-' + Date.now();
    const tel = membro.celular ? membro.celular.replace(/\D/g, '') : null;
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    historicoNotif.unshift({ membro, hora, id });
    notifNaoLidas++;
    atualizarSinoBadge();

    const stack = document.getElementById('notif-stack');
    const card = document.createElement('div');
    card.className = 'notif-card';
    card.id = id;

    card.innerHTML = `
      <div class="notif-topo">
        <span class="notif-pulse"></span>
        <span class="notif-label">✨ Novo cadastro</span>
        <span style="font-size:0.72rem;color:var(--muted);">${hora}</span>
        <button class="notif-close" onclick="fecharNotif('${id}')">✕</button>
      </div>
      <div class="notif-nome">${membro.nome}</div>
      <div class="notif-meta">
        <span>${membro.tipo_cadastro || 'Membro'}</span>
        ${membro.celular ? `<span>📱 ${membro.celular}</span>` : ''}
        ${membro.setor_igreja ? `<span>📍 ${membro.setor_igreja}</span>` : ''}
      </div>
      <div class="notif-acoes">
        <button class="notif-btn" onclick="verDetalhes('${membro.id}');fecharNotif('${id}')">👁 Ver ficha</button>
        ${tel ? `<a class="notif-btn verde" href="https://wa.me/55${tel}" target="_blank">💬 WhatsApp</a>` : ''}
      </div>`;

    stack.appendChild(card);

    setTimeout(() => fecharNotif(id), 6200);
  }

  window.fecharNotif = fecharNotif;
  window.criarNotificacao = criarNotificacao;

  function renderHistorico() {
    const lista = document.getElementById('hist-lista');
    if (!historicoNotif.length) {
      lista.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.85rem;">📭 Nenhuma notificação ainda.</div>';
      return;
    }

    lista.innerHTML = historicoNotif.map(n => {
      const tel = n.membro.celular ? n.membro.celular.replace(/\D/g, '') : null;
      return `<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);">
        <div style="width:40px;height:40px;border-radius:50%;background:rgba(201,168,76,0.12);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;">✨</div>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:0.9rem;">${n.membro.nome}</div>
          <div style="font-size:0.75rem;color:var(--muted);">${n.membro.tipo_cadastro || '—'}${n.membro.celular ? ' · ' + n.membro.celular : ''} · ${n.hora}</div>
        </div>
        <div style="display:flex;gap:5px;">
          <button class="btn btn-ghost btn-sm" onclick="verDetalhes('${n.membro.id}');document.getElementById('hist-overlay').classList.remove('open')">👁</button>
          ${tel ? `<a href="https://wa.me/55${tel}" target="_blank" class="btn btn-green btn-sm" style="text-decoration:none;">💬</a>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  window.renderHistorico = renderHistorico;

  function limparNotificacoes() {
    historicoNotif = [];
    notifNaoLidas = 0;
    atualizarSinoBadge();
    renderHistorico();
    document.getElementById('notif-stack').innerHTML = '';
  }

  window.limparNotificacoes = limparNotificacoes;

  function iniciarRealtime() {
    console.log("Iniciando Realtime para novos membros...");
    const channel = db.channel('novos-membros')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'membros' }, payload => {
        console.log("Novo membro detectado via Realtime:", payload.new);
        const m = payload.new;
        membrosCache.unshift(m);

        // Atualiza indicador principal de “Último cadastro”
        atualizarUltimoCadastro(m);

        renderStats();
        popularFiltroSetor();
        popularFiltroCargo();
        renderAniversariantes();
        renderGraficos();
        renderLista(m.id);
        criarNotificacao(m);
      })
      .subscribe((status, err) => {
        console.log("Status da inscrição Realtime:", status);
        if (err) {
          console.error("Erro na inscrição Realtime:", err);
        }
      });
  }

  function comprimirImagem(file, maxDim = 900) {
    return new Promise(resolve => {
      const r = new FileReader();
      r.onload = e => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
          c.width = Math.round(img.width * ratio);
          c.height = Math.round(img.height * ratio);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(b => resolve(b), 'image/jpeg', 0.82);
        };
        img.src = e.target.result;
      };
      r.readAsDataURL(file);
    });
  }

  async function uploadFotoAdmin(file, pasta) {
    if (!file) return null;
    try {
      const blob = await comprimirImagem(file);
      const path = `${pasta}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await db.storage.from('membros').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (error) { console.warn(error.message); return null; }
      return db.storage.from('membros').getPublicUrl(path).data.publicUrl;
    } catch (e) {
      return null;
    }
  }

  function editPreviewFoto(input, previewId, placeholderId, areaId) {
    const file = input.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
      const prev = document.getElementById(previewId);
      prev.src = e.target.result;
      prev.style.display = 'block';
      document.getElementById(placeholderId).style.display = 'none';
      document.getElementById(areaId).classList.add('tem-foto');
    };
    r.readAsDataURL(file);
  }

  window.editPreviewFoto = editPreviewFoto;

  function fmtDataHoraISO(v){
    try{
      if(!v) return null;
      const d = new Date(v);
      if(isNaN(d.getTime())) return null;
      return d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    }catch(e){
      return null;
    }
  }

  function atualizarUltimoCadastro(m){
    const nomeEl = document.getElementById('last-cadastro-nome');
    const quandoEl = document.getElementById('last-cadastro-quando');
    if(!nomeEl || !quandoEl) return;

    const nome = m?.nome || '—';
    const quando = fmtDataHoraISO(m?.created_at) || fmtDataHoraISO(m?.commit_timestamp) || new Date().toLocaleString('pt-BR');

    nomeEl.textContent = nome;
    quandoEl.textContent = `Em ${quando}`;
    const activityName = document.getElementById('activity-last-name');
    const activityTime = document.getElementById('activity-last-time');
    if (activityName) activityName.textContent = nome;
    if (activityTime) activityTime.textContent = quando;
  }

  async function carregarLista() {
    document.getElementById('corpo-lista').innerHTML =
      `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:2.5rem;"><span class="loading" style="border-color:rgba(201,168,76,0.3);border-top-color:var(--gold);"></span><span style="margin-left:10px;">Carregando…</span></td></tr>`;

    const { data, error } = await db.from('membros').select('*').order('nome');
    if (error) { toast('❌ Erro ao carregar.'); return; }
    membrosCache = data || [];
    primeiraLeitura = false;

    // Atualiza painel do “último cadastro”
    const maisRecente = [...membrosCache].sort((a,b)=>{
      const da = new Date(a?.created_at || a?.commit_timestamp || 0).getTime();
      const dbb = new Date(b?.created_at || b?.commit_timestamp || 0).getTime();
      return dbb - da;
    })[0];
    if (maisRecente) atualizarUltimoCadastro(maisRecente);

    renderStats();
    popularFiltroSetor();
    popularFiltroCargo();
    renderAniversariantes();
    renderGraficos();
    renderLista();
  }

  function renderStats() {
    const total = membrosCache.length;
    const membros = membrosCache.filter(m => m.tipo_cadastro === 'Membro').length;
    const congregados = membrosCache.filter(m => m.tipo_cadastro === 'Congregado').length;
    const ativos = membrosCache.filter(m => !m.status || m.status === 'Ativo').length;
    const aniversariantes = membrosCache.filter(m => {
      if (!m.data_nasc || (m.status && m.status !== 'Ativo')) return false;
      const d = new Date(m.data_nasc);
      return d.getMonth() === new Date().getMonth();
    }).length;

    const agora = new Date();
    const doMes = membrosCache.filter(m => {
      if (!m.created_at) return false;
      const d = new Date(m.created_at);
      return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
    }).length;

    const setNum = (id, val) => {
      const el = document.getElementById(id);
      if (el.textContent !== String(val)) {
        el.textContent = val;
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
      }
    };

    setNum('stat-total', total);
    setNum('stat-membros', aniversariantes);
    setNum('stat-congregados', congregados);
    setNum('stat-ativos', ativos);
    setNum('stat-mes', doMes);
  }

  function popularFiltroSetor() {
    const setores = [...new Set(membrosCache.map(m => m.setor_igreja).filter(Boolean))].sort();
    const sel = document.getElementById('filtro-setor');
    const val = sel.value;
    sel.innerHTML = '<option value="">Todos os setores</option>';
    setores.forEach(s => {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      if (s === val) o.selected = true;
      sel.appendChild(o);
    });
  }

  function popularFiltroCargo() {
    const cargos = [...new Set(membrosCache.map(m => m.cargo_principal).filter(Boolean))].sort();
    const sel = document.getElementById('filtro-cargo');
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = '<option value="">Todos os cargos</option>';
    cargos.forEach(c => {
      const o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      if (c === val) o.selected = true;
      sel.appendChild(o);
    });
  }

  function toggleGraficos() {
    graficosAberto = !graficosAberto;
    const body = document.getElementById('graficos-body');
    if (body) body.style.display = graficosAberto ? 'grid' : 'none';
    const chevron = document.getElementById('graficos-chevron');
    if (chevron) chevron.textContent = graficosAberto ? '▼' : '▶';
  }
  window.toggleGraficos = toggleGraficos;

  function renderGraficos() {
    // 1. Crescimento Mensal
    const ctxCrescimento = document.getElementById('chart-crescimento')?.getContext('2d');
    if (ctxCrescimento) {
      if (chartCrescimento) chartCrescimento.destroy();
      const periodo = parseInt(document.getElementById('filtro-periodo')?.value || '180', 10);
      const passos = periodo <= 30 ? Math.min(periodo, 30) : periodo <= 180 ? 6 : 12;
      const mesesLabels = [];
      const contagemMeses = {};
      for (let i = passos - 1; i >= 0; i--) {
        const d = new Date();
        if (periodo <= 30) d.setDate(d.getDate() - i);
        else d.setMonth(d.getMonth() - i);
        const label = periodo <= 30
          ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          : d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
        mesesLabels.push(label);
        contagemMeses[label] = 0;
      }
      membrosCache.forEach(m => {
        if (!m.created_at) return;
        const d = new Date(m.created_at);
        const limite = new Date();
        limite.setDate(limite.getDate() - periodo);
        if (d < limite) return;
        const label = periodo <= 30
          ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          : d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
        if (contagemMeses[label] !== undefined) contagemMeses[label]++;
      });
      chartCrescimento = new Chart(ctxCrescimento, {
        type: 'line',
        data: {
          labels: mesesLabels,
          datasets: [{
            data: mesesLabels.map(l => contagemMeses[l]),
            borderColor: '#6D4CFF',
            backgroundColor: 'rgba(109, 76, 255, 0.12)',
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#6D4CFF',
            pointHoverRadius: 6,
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(226,232,240,0.75)' }, ticks: { color: '#64748b', stepSize: 1 } },
            x: { grid: { display: false }, ticks: { color: '#64748b' } }
          }
        }
      });
    }

    // 2. Tipo (Membro vs Congregado)
    const ctxTipo = document.getElementById('chart-tipo')?.getContext('2d');
    if (ctxTipo) {
      if (chartTipo) chartTipo.destroy();
      const faixas = {
        'Criancas': membrosCache.filter(m => Number.isFinite(Number(m.idade)) && Number(m.idade) <= 12).length,
        'Jovens': membrosCache.filter(m => Number.isFinite(Number(m.idade)) && Number(m.idade) >= 13 && Number(m.idade) <= 29).length,
        'Adultos': membrosCache.filter(m => Number.isFinite(Number(m.idade)) && Number(m.idade) >= 30 && Number(m.idade) <= 59).length,
        'Casais': membrosCache.filter(m => (m.estado_civil || '').toLowerCase().includes('casad')).length,
        'Idosos': membrosCache.filter(m => Number.isFinite(Number(m.idade)) && Number(m.idade) >= 60).length
      };
      chartTipo = new Chart(ctxTipo, {
        type: 'doughnut',
        data: {
          labels: Object.keys(faixas),
          datasets: [{
            data: Object.values(faixas),
            backgroundColor: ['#8B6CFF', '#22C55E', '#6D4CFF', '#F59E0B', '#EF4444'],
            hoverOffset: 10,
            borderColor: '#ffffff',
            borderWidth: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#475569', boxWidth: 10, font: { size: 11 } }
            }
          }
        }
      });
    }

    // 3. Setores (Top 5)
    const ctxSetor = document.getElementById('chart-setor')?.getContext('2d');
    if (ctxSetor) {
      if (chartSetor) chartSetor.destroy();
      const setoresCount = {};
      membrosCache.forEach(m => {
        const s = m.setor_igreja || 'Sem Setor';
        setoresCount[s] = (setoresCount[s] || 0) + 1;
      });
      const sorted = Object.entries(setoresCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
      chartSetor = new Chart(ctxSetor, {
        type: 'bar',
        data: {
          labels: sorted.map(x => x[0]),
          datasets: [{
            data: sorted.map(x => x[1]),
            backgroundColor: 'rgba(109, 76, 255, 0.78)',
            borderRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(226,232,240,0.75)' }, ticks: { color: '#64748b', stepSize: 1 } },
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } }
          }
        }
      });
    }
  }

  function exportarExcel() {
    if (!membrosCache.length) { toast('⚠️ Nenhum membro para exportar.'); return; }
    const dados = membrosCache.map((m, idx) => ({
      '#': idx + 1,
      'Nome Completo': m.nome,
      'Tipo': m.tipo_cadastro,
      'Status': m.status || 'Ativo',
      'CPF/CRNM': m.cpf || '—',
      'Tipo Doc': m.tipo_cpf === 'estrangeiro' ? 'CRNM (Estrangeiro)' : 'CPF (Brasileiro)',
      'RG': m.rg || '—',
      'Nascimento': m.data_nasc ? m.data_nasc.split('-').reverse().join('/') : '—',
      'Idade': m.idade || '—',
      'Sexo': m.sexo || 'M',
      'Celular': m.celular || '—',
      'E-mail': m.email || '—',
      'Setor': m.setor_igreja || '—',
      'Congregação': m.congregacao_igreja || '—',
      'Cargo': m.cargo_principal || '—',
      'Forma Recebimento': m.forma_recebimento || '—'
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Membros");
    const maxLens = {};
    dados.forEach(row => {
      Object.entries(row).forEach(([k, v]) => {
        maxLens[k] = Math.max(maxLens[k] || 10, String(v).length);
      });
    });
    ws['!cols'] = Object.keys(maxLens).map(k => ({ wch: maxLens[k] + 2 }));
    XLSX.writeFile(wb, "membros_adbela-vista_2026.xlsx");
    toast('📊 Planilha Excel gerada com sucesso!');
  }
  window.exportarExcel = exportarExcel;

  function toggleAniv() {
    anivAberto = !anivAberto;
    document.getElementById('aniv-body').classList.toggle('fechado', !anivAberto);
    document.getElementById('aniv-chevron').textContent = anivAberto ? '▼' : '▶';
  }

  window.toggleAniv = toggleAniv;

  function renderAniversariantes() {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const hoje = agora.getDate();

    const lista = membrosCache
      .filter(m => m.data_nasc && (!m.status || m.status === 'Ativo'))
      .map(m => {
        const d = new Date(m.data_nasc);
        return { ...m, dia: d.getDate(), mes: d.getMonth(), ano: d.getFullYear() };
      })
      .filter(m => m.mes === mesAtual)
      .sort((a, b) => a.dia - b.dia);

    const cnt = document.getElementById('aniv-count');
    cnt.textContent = lista.length;
    cnt.style.display = lista.length ? '' : 'none';

    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const body = document.getElementById('aniv-body');

    if (!lista.length) {
      body.innerHTML = '<div style="color:var(--muted);font-size:0.85rem;padding:0.5rem 0;text-align:center;">Nenhum aniversariante este mês 🎉</div>';
      return;
    }

    body.innerHTML = lista.map(m => {
      const eHoje = m.dia === hoje;
      const idade = agora.getFullYear() - m.ano;
      const tel = m.celular ? m.celular.replace(/\D/g, '') : null;

      return `<div class="aniv-item" style="${eHoje ? 'background:rgba(201,168,76,0.06);border-radius:8px;padding:8px;' : ''}">
        ${m.foto_url ? `<img src="${m.foto_url}" class="aniv-avatar">` : `<div class="aniv-avatar-placeholder">🎂</div>`}
        <div class="aniv-info">
          <div class="aniv-nome">${m.nome} ${eHoje ? '<span class="hoje-badge">HOJE!</span>' : ''}</div>
          <div class="aniv-sub">Dia ${m.dia} de ${meses[mesAtual]} · ${idade} anos</div>
        </div>
        ${tel ? `<a href="https://wa.me/55${tel}?text=Feliz+aniversário+${encodeURIComponent(m.nome.split(' ')[0])}!+Que+Deus+te+abençoe+muito!" target="_blank" class="btn btn-gold btn-sm" style="text-decoration:none;">🎉 Parabenizar</a>` : ''}
      </div>`;
    }).join('');
  }

  function renderLista(novoId = null) {
    const busca = document.getElementById('busca').value.toLowerCase();
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const filtroStatus = document.getElementById('filtro-status').value;
    const filtroSetor = document.getElementById('filtro-setor').value;
    const filtroIdade = document.getElementById('filtro-idade').value;
    const filtroCargo = document.getElementById('filtro-cargo').value;

    const filtrados = membrosCache.filter(m => {
      const mb = !busca || m.nome.toLowerCase().includes(busca)
        || (m.cpf || '').includes(busca)
        || (m.celular || '').includes(busca)
        || (m.email || '').toLowerCase().includes(busca);
      const mt = !filtroTipo || m.tipo_cadastro === filtroTipo;
      const ms = !filtroStatus || (m.status || 'Ativo') === filtroStatus;
      const mse = !filtroSetor || m.setor_igreja === filtroSetor;
      
      let mi = true;
      if (filtroIdade) {
        const idade = m.idade;
        if (idade === null || idade === undefined) mi = false;
        else if (filtroIdade === 'crianca') mi = (idade <= 12);
        else if (filtroIdade === 'adolescente') mi = (idade >= 13 && idade <= 17);
        else if (filtroIdade === 'jovem') mi = (idade >= 18 && idade <= 29);
        else if (filtroIdade === 'adulto') mi = (idade >= 30 && idade <= 59);
        else if (filtroIdade === 'idoso') mi = (idade >= 60);
      }

      const mc = !filtroCargo || m.cargo_principal === filtroCargo;

      return mb && mt && ms && mse && mi && mc;
    });

    const corpo = document.getElementById('corpo-lista');
    const totalPag = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    if (paginaAtual > totalPag) paginaAtual = 1;

    const inicio = (paginaAtual - 1) * POR_PAGINA;
    const pagina = filtrados.slice(inicio, inicio + POR_PAGINA);

    if (!filtrados.length) {
      corpo.innerHTML = `<tr><td colspan="8"><div class="empty"><div class="e-icon"><i class="fa-solid fa-inbox"></i></div><p>Nenhum membro encontrado.</p></div></td></tr>`;
      document.getElementById('paginacao').innerHTML = '';
      return;
    }

    corpo.innerHTML = pagina.map(m => `<tr id="row-${m.id}" class="${m.id === novoId ? 'novo-destaque' : ''}">
      <td>${avatarImg(m, 42)}</td>
      <td><strong class="member-name">${m.nome}</strong><div class="member-sub">${m.email || m.setor_igreja || '-'}</div></td>
      <td>${m.cpf || '-'}</td>
      <td><span class="badge badge-${m.tipo_cadastro === 'Membro' ? 'membro' : 'congregado'}">${m.tipo_cadastro}</span></td>
      <td>${statusBadge(m.status)}</td>
      <td style="color:var(--muted);font-size:0.8rem;">${m.cargo_principal || m.setor_igreja || '-'}</td>
      <td style="font-size:0.85rem;">${m.celular || '-'}</td>
      <td><div class="td-actions">
        <button class="btn btn-ghost btn-sm" onclick="verDetalhes('${m.id}')" title="Visualizar"><i class="fa-solid fa-eye"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="abrirEdicao('${m.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
        ${whatsappLink(m.celular)}
        <button class="btn btn-danger btn-sm" onclick="excluirMembro('${m.id}','${m.nome.replace(/'/g, "\\'")}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </div></td></tr>`).join('');

    const pag = document.getElementById('paginacao');
    if (totalPag <= 1) {
      pag.innerHTML = `<span>${filtrados.length} registros</span>`;
      return;
    }

    let h = `<span>${filtrados.length} registros</span>`;
    h += `<button class="btn btn-ghost btn-sm" onclick="mudarPagina(${paginaAtual - 1})" ${paginaAtual === 1 ? 'disabled' : ''}>‹</button>`;

    for (let p = 1; p <= totalPag; p++) {
      if (p === paginaAtual) h += `<button class="btn btn-primary btn-sm">${p}</button>`;
      else if (p === 1 || p === totalPag || Math.abs(p - paginaAtual) <= 1) h += `<button class="btn btn-ghost btn-sm" onclick="mudarPagina(${p})">${p}</button>`;
      else if (Math.abs(p - paginaAtual) === 2) h += `<span>…</span>`;
    }

    h += `<button class="btn btn-ghost btn-sm" onclick="mudarPagina(${paginaAtual + 1})" ${paginaAtual === totalPag ? 'disabled' : ''}>›</button>`;
    pag.innerHTML = h;
  }

  window.carregarLista = carregarLista;
  window.renderLista = renderLista;

  function mudarPagina(p) {
    paginaAtual = p;
    renderLista();
    document.querySelector('.table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  window.mudarPagina = mudarPagina;

  function verDetalhes(id) {
    const m = membrosCache.find(x => x.id === id);
    if (!m) return;

    const tel = m.celular ? m.celular.replace(/\D/g, '') : null;

    document.getElementById('modal-conteudo').innerHTML = `
      <div class="modal-header">
        <div style="display:flex;align-items:center;">
          ${m.foto_url ? `<img src="${m.foto_url}" class="foto-modal-grande">` : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(201,168,76,0.12);display:flex;align-items:center;justify-content:center;font-size:2rem;margin-right:1rem;flex-shrink:0;">👤</div>`}
          <div>
            <div class="modal-nome">${m.nome}</div>
            <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;">
              <span class="badge badge-${m.tipo_cadastro === 'Membro' ? 'membro' : 'congregado'}">${m.tipo_cadastro}</span>
              ${statusBadge(m.status)}
            </div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('modal-overlay').classList.remove('open')">✕</button>
      </div>

      <div class="modal-section"><div class="modal-section-title">👤 Dados Pessoais</div><div class="modal-grid">
        <div class="modal-field"><strong>${m.tipo_cpf === 'estrangeiro' ? 'CRNM' : 'CPF'}</strong><span>${fmt(m.cpf)}</span></div>
        ${m.tipo_cpf !== 'estrangeiro' ? `<div class="modal-field"><strong>RG</strong><span>${fmt(m.rg)}</span></div>` : ''}
        <div class="modal-field"><strong>Nascimento</strong><span>${fmtDate(m.data_nasc)}${m.idade ? ' · ' + m.idade + ' anos' : ''}</span></div>
        <div class="modal-field"><strong>Sexo</strong><span>${fmt(m.sexo)}</span></div>
        <div class="modal-field"><strong>Estado Civil</strong><span>${fmt(m.estado_civil)}</span></div>
        <div class="modal-field"><strong>Cônjuge</strong><span>${fmt(m.conjuge_nome)}</span></div>
        <div class="modal-field"><strong>Escolaridade</strong><span>${fmt(m.escolaridade)}</span></div>
        <div class="modal-field"><strong>Ocupação</strong><span>${fmt(m.ocupacao)}</span></div>
      </div></div>

      <div class="modal-section"><div class="modal-section-title">📍 Contato</div><div class="modal-grid">
        <div class="modal-field" style="grid-column:1/-1;"><strong>Endereço</strong><span>${fmt(m.endereco)}${m.bairro ? ', ' + m.bairro : ''}${m.cidade_estado ? ' — ' + m.cidade_estado : ''}</span></div>
        <div class="modal-field"><strong>Celular</strong><span>${fmt(m.celular)}</span></div>
        <div class="modal-field"><strong>E-mail</strong><span>${fmt(m.email)}</span></div>
      </div></div>

      <div class="modal-section"><div class="modal-section-title">✝️ Igreja</div><div class="modal-grid">
        <div class="modal-field"><strong>Setor</strong><span>${fmt(m.setor_igreja)}</span></div>
        <div class="modal-field"><strong>Congregação</strong><span>${fmt(m.congregacao_igreja)}</span></div>
        <div class="modal-field"><strong>Recebimento</strong><span>${fmt(m.forma_recebimento)}</span></div>
        <div class="modal-field"><strong>Cargo</strong><span>${fmt(m.cargo_principal)}</span></div>
        <div class="modal-field"><strong>Batismo Águas</strong><span>${fmtDate(m.data_batismo_aguas)}</span></div>
        <div class="modal-field"><strong>Batismo ES</strong><span>${fmtDate(m.data_batismo_es)}</span></div>
      </div></div>

      ${m.doc_url ? `<div class="modal-section"><div class="modal-section-title">🪪 Documento</div><img src="${m.doc_url}" style="width:100%;max-height:200px;object-fit:contain;border-radius:8px;"></div>` : ''}
      ${m.talentos ? `<div class="modal-section"><div class="modal-section-title">🌟 Talentos</div><span style="font-size:0.88rem;">${m.talentos}</span></div>` : ''}

      <div style="display:flex;gap:8px;margin-top:1rem;justify-content:flex-end;flex-wrap:wrap;">
        ${tel ? `<a href="https://wa.me/55${tel}" target="_blank" class="btn btn-green btn-sm" style="text-decoration:none;">💬 WhatsApp</a>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="abrirEdicao('${m.id}');document.getElementById('modal-overlay').classList.remove('open')">✏️ Editar</button>
        <button class="btn btn-ghost btn-sm" onclick="imprimirFicha('${m.id}')">🖨️ Imprimir</button>
        <button class="btn btn-danger btn-sm" onclick="excluirMembro('${m.id}','${m.nome.replace(/'/g, "\\'")}');document.getElementById('modal-overlay').classList.remove('open')">✕ Excluir</button>
      </div>`;

    document.getElementById('modal-overlay').classList.add('open');
  }
  window.verDetalhes = verDetalhes;

  function ensureSelectValue(el, value) {
    if (!el || el.tagName !== 'SELECT' || value === null || value === undefined || value === '') return;

    const exists = Array.from(el.options || []).some(opt => opt.value === String(value));
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      el.appendChild(opt);
    }
  }

  function sincronizarEdicaoCongregacaoPastor() {
    const setor = document.getElementById('edit-setor');
    const congregacao = document.getElementById('edit-congregacao');

    if (setor && congregacao) {
      congregacao.value = setor.value || '';
    }
  }

  window.sincronizarEdicaoCongregacaoPastor = sincronizarEdicaoCongregacaoPastor;

  function abrirEdicao(id) {
    const m = membrosCache.find(x => x.id === id);
    if (!m) return;

    const mapa = {
      'nome': m.nome,
      'rg': m.rg,
      'cpf': m.cpf,
      'nasc': m.data_nasc,
      'idade': m.idade,
      'sangue': m.tipo_sanguineo,
      'esc': m.escolaridade,
      'civil': m.estado_civil,
      'conjuge': m.conjuge_nome,
      'casamento': m.data_casamento,
      'cep': m.cep,
      'bairro': m.bairro,
      'endereco': m.endereco,
      'cidade': m.cidade_estado,
      'fone-res': m.fone_res,
      'fone-com': m.fone_com,
      'celular': m.celular,
      'email': m.email,
      'recebimento': m.forma_recebimento,
      'cargo': m.cargo_principal,
      'setor': m.setor_igreja,
      'congregacao': m.congregacao_igreja,
      'bat-aguas': m.data_batismo_aguas,
      'bat-es': m.data_batismo_es,
      'aprovacao': m.data_aprovacao,
      'filhos': m.qtd_filhos || 0,
      'dep1-nome': m.nome_dep1,
      'dep1-par': m.parentesco_dep1,
      'dep2-nome': m.nome_dep2,
      'dep2-par': m.parentesco_dep2
    };

    Object.entries(mapa).forEach(([k, v]) => {
      const el = document.getElementById('edit-' + k);
      if (el) {
        ensureSelectValue(el, v);
        el.value = v ?? '';
      }
    });
    sincronizarEdicaoCongregacaoPastor();

    document.getElementById('edit-id').value = m.id;
    document.getElementById('edit-status').value = m.status || 'Ativo';

    document.querySelectorAll('input[name="edit-tipo"]').forEach(r => r.checked = (r.value === (m.tipo_cadastro || 'Membro')));
    document.querySelectorAll('input[name="edit-sexo"]').forEach(r => r.checked = (r.value === (m.sexo || 'M')));

    const pf = document.getElementById('edit-preview-foto');
    const pd = document.getElementById('edit-preview-doc');

    if (m.foto_url) {
      pf.src = m.foto_url;
      pf.style.display = 'block';
      document.getElementById('edit-placeholder-foto').style.display = 'none';
      document.getElementById('edit-area-foto').classList.add('tem-foto');
    } else {
      pf.style.display = 'none';
      document.getElementById('edit-placeholder-foto').style.display = '';
      document.getElementById('edit-area-foto').classList.remove('tem-foto');
    }

    if (m.doc_url) {
      pd.src = m.doc_url;
      pd.style.display = 'block';
      document.getElementById('edit-placeholder-doc').style.display = 'none';
      document.getElementById('edit-area-doc').classList.add('tem-foto');
    } else {
      pd.style.display = 'none';
      document.getElementById('edit-placeholder-doc').style.display = '';
      document.getElementById('edit-area-doc').classList.remove('tem-foto');
    }

    ['edit-input-foto', 'edit-input-cam', 'edit-input-doc', 'edit-input-doc-cam'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    document.getElementById('edit-overlay').classList.add('open');
  }

  window.abrirEdicao = abrirEdicao;

  async function salvarEdicao() {
    const id = document.getElementById('edit-id').value;
    const nome = document.getElementById('edit-nome').value.trim();

    if (!nome) { toast('⚠️ Nome obrigatório!'); return; }
    if (/^\d+$/.test(nome)) { toast('⚠️ Nome inválido!'); return; }

    const btn = document.getElementById('btn-salvar-edit');
    btn.innerHTML = '<span class="loading"></span> Salvando…';
    btn.disabled = true;

    const fi = document.getElementById('edit-input-foto');
    const di = document.getElementById('edit-input-doc');

    const [novaFoto, novaDoc] = await Promise.all([
      fi.files[0] ? uploadFotoAdmin(fi.files[0], 'fotos') : Promise.resolve(null),
      di.files[0] ? uploadFotoAdmin(di.files[0], 'docs') : Promise.resolve(null)
    ]);

    const mAtual = membrosCache.find(x => x.id === id);

    sincronizarEdicaoCongregacaoPastor();
    const setorEdicao = document.getElementById('edit-setor').value;

    const dados = {
      tipo_cadastro: document.querySelector('input[name="edit-tipo"]:checked')?.value || 'Membro',
      status: document.getElementById('edit-status').value,
      nome,
      rg: document.getElementById('edit-rg').value,
      cpf: document.getElementById('edit-cpf').value,
      data_nasc: document.getElementById('edit-nasc').value || null,
      idade: parseInt(document.getElementById('edit-idade').value) || null,
      sexo: document.querySelector('input[name="edit-sexo"]:checked')?.value || 'M',
      tipo_sanguineo: document.getElementById('edit-sangue').value,
      escolaridade: document.getElementById('edit-esc').value,
      estado_civil: document.getElementById('edit-civil').value,
      conjuge_nome: document.getElementById('edit-conjuge').value,
      data_casamento: document.getElementById('edit-casamento').value || null,
      cep: document.getElementById('edit-cep').value,
      bairro: document.getElementById('edit-bairro').value,
      endereco: document.getElementById('edit-endereco').value,
      cidade_estado: document.getElementById('edit-cidade').value,
      fone_res: document.getElementById('edit-fone-res').value,
      fone_com: document.getElementById('edit-fone-com').value,
      celular: document.getElementById('edit-celular').value,
      email: document.getElementById('edit-email').value,
      forma_recebimento: document.getElementById('edit-recebimento').value,
      cargo_principal: document.getElementById('edit-cargo').value,
      setor_igreja: setorEdicao,
      congregacao_igreja: setorEdicao,
      data_batismo_aguas: document.getElementById('edit-bat-aguas').value || null,
      data_batismo_es: document.getElementById('edit-bat-es').value || null,
      data_aprovacao: document.getElementById('edit-aprovacao').value || null,
      qtd_filhos: parseInt(document.getElementById('edit-filhos').value) || 0,
      nome_dep1: document.getElementById('edit-dep1-nome').value,
      parentesco_dep1: document.getElementById('edit-dep1-par').value,
      nome_dep2: document.getElementById('edit-dep2-nome').value,
      parentesco_dep2: document.getElementById('edit-dep2-par').value,
      foto_url: novaFoto || (mAtual ? mAtual.foto_url : null),
      doc_url: novaDoc || (mAtual ? mAtual.doc_url : null)
    };

    const { error } = await db.from('membros').update(dados).eq('id', id);
    btn.innerHTML = '💾 Salvar Alterações';
    btn.disabled = false;

    if (error) { toast('❌ Erro ao salvar.'); return; }

    // Limpa fotos antigas do Storage se novas foram enviadas
    const obterCaminhoStorage = (url) => {
      if (!url) return null;
      const partes = url.split('/public/membros/');
      if (partes.length === 2) return partes[1];
      return null;
    };

    const arquivosParaDeletar = [];
    if (novaFoto && mAtual && mAtual.foto_url) {
      const caminho = obterCaminhoStorage(mAtual.foto_url);
      if (caminho) arquivosParaDeletar.push(caminho);
    }
    if (novaDoc && mAtual && mAtual.doc_url) {
      const caminho = obterCaminhoStorage(mAtual.doc_url);
      if (caminho) arquivosParaDeletar.push(caminho);
    }
    if (arquivosParaDeletar.length > 0) {
      console.log("Removendo mídias antigas do Storage:", arquivosParaDeletar);
      db.storage.from('membros').remove(arquivosParaDeletar).then(({ error: storageErr }) => {
        if (storageErr) console.warn("Erro ao deletar mídia antiga:", storageErr.message);
      });
    }

    const idx = membrosCache.findIndex(x => x.id === id);
    if (idx !== -1) membrosCache[idx] = { ...membrosCache[idx], ...dados };

    renderStats();
    popularFiltroSetor();
    popularFiltroCargo();
    renderAniversariantes();
    renderGraficos();
    renderLista();

    document.getElementById('edit-overlay').classList.remove('open');
    toast('✅ Cadastro atualizado!');
  }

  window.salvarEdicao = salvarEdicao;

  async function excluirMembro(id, nome) {
    if (!confirm(`Excluir "${nome}" permanentemente?`)) return;
    const m = membrosCache.find(x => x.id === id);
    const { error } = await db.from('membros').delete().eq('id', id);
    if (error) { toast('❌ Erro ao excluir.'); return; }

    // Deleta os arquivos do storage se existirem
    if (m) {
      const arquivosParaDeletar = [];
      const obterCaminhoStorage = (url) => {
        if (!url) return null;
        const partes = url.split('/public/membros/');
        if (partes.length === 2) return partes[1];
        return null;
      };

      const caminhos = [
        obterCaminhoStorage(m.foto_url),
        obterCaminhoStorage(m.doc_url),
        obterCaminhoStorage(m.foto_certidao_nasc),
        obterCaminhoStorage(m.foto_certidao_casamento),
        obterCaminhoStorage(m.foto_diploma),
        obterCaminhoStorage(m.foto_comprovante_end),
        obterCaminhoStorage(m.assinatura_url)
      ].filter(Boolean);

      if (caminhos.length > 0) {
        console.log("Limpando Storage do membro deletado:", caminhos);
        db.storage.from('membros').remove(caminhos).then(({ error: storageError }) => {
          if (storageError) console.warn("Erro ao limpar Storage:", storageError.message);
        });
      }
    }

    membrosCache = membrosCache.filter(m => m.id !== id);
    renderStats();
    popularFiltroSetor();
    popularFiltroCargo();
    renderAniversariantes();
    renderGraficos();
    renderLista();
    toast('🗑️ Membro excluído.');
  }

  window.excluirMembro = excluirMembro;

  function fecharOverlayClick(e, id) {
    if (e.target === document.getElementById(id)) document.getElementById(id).classList.remove('open');
  }

  window.fecharOverlayClick = fecharOverlayClick;

  function exportarPDF() {
    if (!membrosCache.length) { toast('⚠️ Nenhum membro.'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(26, 18, 8);
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(232, 201, 109);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('LISTA DE MEMBROS — AD BELA-VISTA 2026', 105, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 150, 80);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} · Total: ${membrosCache.length}`, 105, 27, { align: 'center' });

    doc.autoTable({
      head: [['#', 'Nome', 'Tipo', 'Status', 'CPF/CRNM', 'Celular', 'Setor']],
      body: membrosCache.map((m, i) => [i + 1, m.nome, m.tipo_cadastro, m.status || 'Ativo', m.cpf || '—', m.celular || '—', m.setor_igreja || '—']),
      startY: 44,
      styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 4 },
      headStyles: { fillColor: [61, 43, 31], textColor: [232, 201, 109], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 247, 242] },
      columnStyles: { 0: { cellWidth: 8 } }
    });

    doc.save('membros_adbela-vista_2026.pdf');
    toast('📄 PDF gerado!');
  }

  window.exportarPDF = exportarPDF;

  function imprimirFicha(id) {
    const m = membrosCache.find(x => x.id === id);
    if (!m) return;

    const f = v => v || '—';
    const fd = v => v ? v.split('-').reverse().join('/') : '—';

    document.getElementById('layout-impressao').innerHTML = `
      <div class="pdf-header">
        <div>
          <div style="font-size:14px;font-weight:bold;">FICHA CADASTRAL — IGREJA AD BELA-VISTA</div>
          <div style="font-size:10px;color:#555;">Rua Frei Lauro, 44 · Ponte do Imaruim · Palhoça - SC · (48) 3242-2451</div>
        </div>
        <div style="text-align:right;font-size:9px;color:#555;">Data: ${new Date().toLocaleDateString('pt-BR')} · Status: ${f(m.status)}</div>
      </div>

      <div class="pdf-section"><div class="pdf-section-title">Identificação</div>
        <div class="pdf-field"><strong>Nome:</strong> ${f(m.nome)} | <strong>Tipo:</strong> ${f(m.tipo_cadastro)} ${m.tipo_cpf === 'estrangeiro' ? `| <strong>CRNM:</strong> ${f(m.cpf)}` : `| <strong>RG:</strong> ${f(m.rg)} | <strong>CPF:</strong> ${f(m.cpf)}`}</div>
        <div class="pdf-field"><strong>Nasc:</strong> ${fd(m.data_nasc)} | <strong>Idade:</strong> ${m.idade || '—'} | <strong>Sexo:</strong> ${f(m.sexo)} | <strong>Estado Civil:</strong> ${f(m.estado_civil)}</div>
      </div>

      <div class="pdf-section"><div class="pdf-section-title">Endereço e Contato</div>
        <div class="pdf-field"><strong>Endereço:</strong> ${f(m.endereco)} | <strong>Bairro:</strong> ${f(m.bairro)} | <strong>Cidade/UF:</strong> ${f(m.cidade_estado)}</div>
        <div class="pdf-field"><strong>Celular:</strong> ${f(m.celular)} | <strong>E-mail:</strong> ${f(m.email)}</div>
      </div>

      <div class="pdf-section"><div class="pdf-section-title">Dados da Igreja</div>
        <div class="pdf-field"><strong>Recebimento:</strong> ${f(m.forma_recebimento)} | <strong>Setor:</strong> ${f(m.setor_igreja)} | <strong>Congregação:</strong> ${f(m.congregacao_igreja)}</div>
        <div class="pdf-field"><strong>Batismo Águas:</strong> ${fd(m.data_batismo_aguas)} | <strong>Batismo ES:</strong> ${fd(m.data_batismo_es)} | <strong>Cargo:</strong> ${f(m.cargo_principal)}</div>
      </div>

      <p style="margin-top:40px;text-align:center;font-size:11px;">________________________________________________<br>Assinatura do Membro</p>`;

    setTimeout(() => {
      window.print();
      setTimeout(() => { document.getElementById('layout-impressao').innerHTML = ''; }, 500);
    }, 300);
  }

  window.imprimirFicha = imprimirFicha;

  document.addEventListener('DOMContentLoaded', async () => {
    prepararPainelPremium();
    const { data: { session } } = await db.auth.getSession();

    if (session) {
      await validarAcesso(session);
    } else {
      mostrarTela('tela-login');
    }
  });

})();

