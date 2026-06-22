// Painel do Pastor — lógica do admin
// Extraído do admin.html para arquivo separado.

(function () {
  const SUPABASE_URL = window.CONFIG.SUPABASE_URL;
  const SUPABASE_KEY = window.CONFIG.SUPABASE_KEY;

  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  let membrosCache = [], paginaAtual = 1, anivAberto = false;
  let metricChart = null;
  let indicadorAtivo = null, tipoVisualizacaoIndicador = 'bar';
  let historicoNotif = [], notifNaoLidas = 0, primeiraLeitura = true;
  const POR_PAGINA = 20;
  const ROLE_ADMIN = 'admin';
  const INDICADORES_CAROUSEL = ['total', 'membros', 'congregados', 'ativos', 'mes'];
  let indicadorCarouselAtual = 0;
  const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:']);

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function jsString(value) {
    return JSON.stringify(String(value ?? '')).replace(/</g, '\\u003C');
  }

  function safeText(value, fallback = '—') {
    const text = value === null || value === undefined || value === '' ? fallback : value;
    return escapeHtml(text);
  }

  function safeUrl(value) {
    if (!value) return '';
    try {
      const url = new URL(String(value), window.location.origin);
      if (!SAFE_URL_PROTOCOLS.has(url.protocol)) return '';
      return escapeAttr(url.href);
    } catch (e) {
      return '';
    }
  }

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

  function mostrarErroLogin(message) {
    const erro = document.getElementById('login-erro');
    if (!erro) return;
    erro.textContent = message;
    erro.classList.add('show');
  }

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
          <div><strong>AD Bela-Vista</strong><span>Painel administrativo</span></div>
        </div>
        <nav class="sidebar-nav" aria-label="Navegacao principal">
          <a class="side-link active" href="#dashboard-top" data-nav="dashboard"><i class="fa-solid fa-table-columns"></i><span>Dashboard</span></a>
          <a class="side-link" href="#corpo-lista" data-nav="membros"><i class="fa-solid fa-users"></i><span>Membros</span></a>
          <a class="side-link" href="#aniv-body" data-nav="aniversariantes"><i class="fa-solid fa-cake-candles"></i><span>Aniversariantes</span></a>
          <a class="side-link" href="relatorios.html"><i class="fa-solid fa-file-export"></i><span>Relatorios</span></a>
          <a class="side-link" href="indicadores.html"><i class="fa-solid fa-chart-line"></i><span>Indicadores</span></a>
          <a class="side-link" href="configuracoes.html"><i class="fa-solid fa-gear"></i><span>Configuracoes</span></a>
        </nav>
        <div class="sidebar-footer">
          <span class="realtime-dot"></span>
          <div><strong>Tempo real ativo</strong><small>Supabase conectado</small></div>
        </div>
      </aside>`);

    main.id = 'dashboard-top';
    const headerTitle = header.querySelector('.header-title');
    const headerSub = header.querySelector('.header-sub');
    if (headerTitle) headerTitle.textContent = '';
    if (headerSub) headerSub.textContent = '';
    header.insertAdjacentHTML('afterbegin', `
      <button class="mobile-menu" type="button" onclick="document.body.classList.toggle('sidebar-open')" aria-label="Abrir menu">
        <i class="fa-solid fa-bars"></i>
      </button>`);

    const aniversariosCard = document.getElementById('aniv-body')?.closest('.aniv-card');
    if (aniversariosCard) {
      aniversariosCard.classList.add('birthdays-panel');
      document.getElementById('aniv-body')?.classList.add('fechado');
      const title = aniversariosCard.querySelector('.aniv-title');
      if (title) title.firstChild.textContent = 'Aniversariantes do mes ';
    }

    const tableWrap = document.querySelector('.table-wrap');
    if (tableWrap) {
      const thead = tableWrap.querySelector('thead tr');
      if (thead) {
        thead.innerHTML = '<th>Foto</th><th>Nome</th><th>CPF</th><th>Tipo</th><th>Status</th><th>Ministerio</th><th>Celular</th><th>Acoes</th>';
      }
    }

    const metricCards = {
      total: {
        icon: 'fa-users',
        title: 'Total de Registros',
        subtitle: 'Pessoas cadastradas no sistema',
        pill: 'crescimento total',
        trend: '+12% em relacao ao mes anterior',
        visual: 'progress',
        tone: 'purple'
      },
      membros: {
        icon: 'fa-user-group',
        title: 'Membros recebidos',
        subtitle: 'Membros oficialmente recebidos pela igreja',
        pill: 'entradas mensais',
        trend: '+14% no mes atual',
        visual: 'member-bars',
        tone: 'blue'
      },
      congregados: {
        icon: 'fa-user-group',
        title: 'Congregados acompanhados',
        subtitle: 'Pessoas em processo de acompanhamento',
        pill: 'acompanhados',
        trend: '75% de acompanhamento',
        visual: 'gauge',
        tone: 'amber'
      },
      ativos: {
        icon: 'fa-user-check',
        title: 'Cadastros ativos',
        subtitle: 'Membros ativos no sistema',
        pill: 'ativos x inativos',
        trend: 'Ativos em destaque',
        visual: 'people',
        tone: 'green'
      },
      mes: {
        icon: 'fa-user-plus',
        title: 'Novos este mes',
        subtitle: 'Evolucao de novos cadastros',
        pill: 'novos do mes',
        trend: 'Mostrando os ultimos meses',
        visual: 'trend-bars',
        tone: 'coral'
      },
      aniversariantes: {
        icon: 'fa-cake-candles',
        title: 'Aniversariantes',
        subtitle: 'Celebrações previstas para este mês',
        pill: 'aniversariantes',
        trend: 'Nenhum aniversariante este mês',
        visual: 'birthday',
        tone: 'red'
      }
    };

    const renderMetricVisual = (metric, config) => {
      if (config.visual === 'progress') {
        return `
          <div class="metric-progress" aria-hidden="true">
            <div class="metric-progress-top">
              <span>Crescimento do cadastro</span>
              <strong id="metric-total-percent">0%</strong>
            </div>
            <div class="metric-progress-track">
              <div class="metric-progress-fill" id="metric-total-fill" style="width: 0;"></div>
            </div>
            <small>Comparado ao mês anterior</small>
          </div>`;
      }
      if (config.visual === 'member-bars' || config.visual === 'trend-bars') {
        return `
          <div class="metric-member-bars" aria-hidden="true">
            <span class="member-bar" id="member-bar-0" style="--h:28%"><i class="fa-solid fa-user"></i><strong>0</strong><em>Mai</em></span>
            <span class="member-bar" id="member-bar-1" style="--h:28%"><i class="fa-solid fa-user"></i><strong>0</strong><em>Jun</em></span>
            <span class="member-bar" id="member-bar-2" style="--h:62%"><i class="fa-solid fa-user"></i><strong>1</strong><em>Jul</em></span>
            <span class="member-bar current" id="member-bar-3" style="--h:92%"><i class="fa-solid fa-user"></i><strong>2</strong><em>Ago</em></span>
          </div>`;
      }
      if (config.visual === 'gauge') {
        return `
          <div class="metric-gauge" aria-hidden="true">
            <span class="gauge-needle"></span>
            <strong id="metric-congregados-percent">0%</strong>
            <small>do total de congregados</small>
          </div>`;
      }
      if (config.visual === 'people') {
        return `
          <div class="metric-people" aria-hidden="true" id="metric-ativos-people"></div>`;
      }
      if (config.visual === 'birthday') {
        return `
          <div class="metric-birthday" aria-hidden="true">
            <div class="metric-hero-circle">
              <i class="fa-solid fa-cake-candles"></i>
            </div>
            <div class="metric-birthday-state" id="metric-aniversariantes-state">Nenhum aniversariante este mês</div>
          </div>`;
      }
      return `
        <div class="metric-hero-circle" aria-hidden="true">
          <i class="fa-solid ${metric === 'mes' ? 'fa-user-plus' : config.icon}"></i>
        </div>`;
    };

    const ensureBirthdayStrip = () => {
      const grid = document.querySelector('.stats-grid');
      if (!grid || document.getElementById('dashboard-birthday-strip')) return;

      grid.insertAdjacentHTML('afterend', `
        <section class="dashboard-birthday-strip" id="dashboard-birthday-strip">
          <div class="birthday-strip-icon"><i class="fa-regular fa-calendar-days"></i></div>
          <div>
            <strong id="dashboard-birthday-title">0 aniversariantes este mes</strong>
            <span id="dashboard-birthday-subtitle">Nenhuma celebracao prevista para este mes.</span>
          </div>
          <button class="birthday-strip-action" type="button" onclick="toggleAniv()">
            Ver aniversariantes <i class="fa-solid fa-chevron-right"></i>
          </button>
        </section>`);
    };

    document.querySelector('.stats-grid')?.classList.add('dashboard-metrics');
    document.querySelectorAll('.stat-card').forEach((card, index) => {
      if (card.dataset.ready === 'true') return;
      const metric = card.dataset.metric || ['total', 'membros', 'congregados', 'ativos', 'mes', 'aniversariantes'][index] || 'total';
      const config = metricCards[metric] || metricCards.total;
      const num = card.querySelector('.stat-num');
      const numId = num?.id || `stat-${metric}`;
      const currentValue = num?.textContent || '0';

      card.classList.add('premium-metric', `metric-${config.tone}`);
      card.innerHTML = `
        <div class="metric-card-head">
          <div class="metric-icon"><i class="fa-solid ${config.icon}"></i></div>
          <div>
            <h3>${config.title}</h3>
            <p>${config.subtitle}</p>
          </div>
        </div>
        <div class="metric-card-body">
          <div class="metric-stack">
            <div class="metric-value-pill">
              <span class="metric-pill-icon"><i class="fa-solid ${config.icon}"></i></span>
              <div>
                <div class="stat-num" id="${numId}">${currentValue}</div>
                <div class="stat-lbl">${config.pill}</div>
              </div>
            </div>
            <div class="metric-trend-pill">
              <span><i class="fa-solid fa-arrow-up"></i></span>
              <strong id="metric-${metric}-trend">${config.trend.split(' ')[0]}</strong>
              <small>${config.trend.replace(config.trend.split(' ')[0], '').trim()}</small>
            </div>
          </div>
          <div class="metric-visual metric-visual-${config.visual}">
            ${renderMetricVisual(metric, config)}
          </div>
        </div>
        <div class="metric-card-foot">
          <span id="metric-${metric}-foot-left">Atualizando dados...</span>
          <strong id="metric-${metric}-foot-right">--</strong>
        </div>`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Abrir indicador ${config.title}`);
      card.addEventListener('click', () => abrirPainelIndicador(card.dataset.metric || 'total'));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          abrirPainelIndicador(card.dataset.metric || 'total');
        }
      });
      card.dataset.ready = 'true';
    });
    redesenharCardsIndicadores();

    document.querySelectorAll('.side-link[data-nav]').forEach(link => {
      link.addEventListener('click', (event) => {
        const nav = link.dataset.nav;
        document.querySelectorAll('.side-link').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        if (nav === 'aniversariantes') {
          if (!anivAberto) toggleAniv();
        }
        document.body.classList.remove('sidebar-open');
      });
    });
  }

  function redesenharCardsIndicadoresLegado() {
    const cards = {
      total: {
        title: 'Total de Registros',
        desc: 'Pessoas cadastradas no sistema',
        icon: 'fa-users',
        visual: 'total',
        numberLabel: 'registros no cadastro',
        secondary: 'Comparação com mês anterior'
      },
      membros: {
        title: 'Membros Recebidos',
        desc: 'Membros oficialmente recebidos pela igreja',
        icon: 'fa-user-group',
        visual: 'membros',
        numberLabel: 'membros registrados',
        secondary: 'Mês atual em destaque'
      },
      congregados: {
        title: 'Congregados Acompanhados',
        desc: 'Pessoas em processo de acompanhamento',
        icon: 'fa-hand-holding-heart',
        visual: 'congregados',
        numberLabel: 'em acompanhamento',
        secondary: 'Medidor de cuidado pastoral'
      },
      ativos: {
        title: 'Cadastros Ativos',
        desc: 'Pessoas aptas para contato e acompanhamento',
        icon: 'fa-user-check',
        visual: 'ativos',
        numberLabel: 'cadastros ativos',
        secondary: 'Pessoas coloridas representam inativos'
      },
      mes: {
        title: 'Novo Este Mês',
        desc: 'Evolução recente dos novos cadastros',
        icon: 'fa-user-plus',
        visual: 'mes',
        numberLabel: 'novos neste mês',
        secondary: 'Evolução dos últimos meses'
      },
      aniversariantes: {
        title: 'Aniversariantes',
        desc: 'Pessoas para celebrar neste mês',
        icon: 'fa-cake-candles',
        visual: 'aniversariantes',
        numberLabel: 'aniversariantes no mês',
        secondary: 'Estado atual do mês'
      }
    };

    const visualMarkup = (metric, config) => {
      if (metric === 'total') {
        return `
          <div class="ux-growth-path" id="ux-total-growth" aria-hidden="true"></div>`;
      }
      if (metric === 'membros') {
        return `
          <div class="ux-member-icons" id="ux-membros-icons" aria-hidden="true"></div>
          <div class="ux-month-bars" id="ux-membros-bars" aria-hidden="true"></div>`;
      }
      if (metric === 'congregados') {
        return `
          <div class="ux-gauge-wrap">
            <div class="ux-gauge" id="ux-congregados-gauge" style="--pct:0%;">
              <div class="ux-gauge-center">
                <strong id="ux-congregados-percent">0%</strong>
                <span>acomp.</span>
              </div>
            </div>
            <div class="ux-gauge-facts">
              <span><strong id="ux-congregados-total">0</strong> congregados</span>
              <span><strong id="ux-congregados-acompanhados">0</strong> acompanhados</span>
            </div>
          </div>`;
      }
      if (metric === 'ativos') {
        return `<div class="ux-human-map" id="ux-ativos-people" aria-hidden="true"></div>`;
      }
      if (metric === 'mes') {
        return `<div class="ux-month-bars ux-month-bars-modern" id="ux-mes-bars" aria-hidden="true"></div>`;
      }
      if (metric === 'aniversariantes') {
        return `
          <div class="ux-birthday-illustration" aria-hidden="true">
            <span class="ux-birthday-ring"></span>
            <span class="ux-birthday-icon"><i class="fa-solid ${config.icon}"></i></span>
          </div>
          <div class="ux-birthday-state" id="ux-aniversariantes-state">Carregando estado atual</div>`;
      }
      return `<i class="fa-solid ${config.icon}"></i>`;
    };

    document.querySelector('.stats-grid')?.classList.add('dashboard-metrics', 'ux-dashboard-metrics');
    document.getElementById('dashboard-birthday-strip')?.remove();

    document.querySelectorAll('.stat-card').forEach((card, index) => {
      const metric = card.dataset.metric || ['total', 'membros', 'congregados', 'ativos', 'mes', 'aniversariantes'][index] || 'total';
      const config = cards[metric] || cards.total;
      const currentNum = card.querySelector('.stat-num');
      const numId = currentNum?.id || `stat-${metric}`;
      const currentValue = currentNum?.textContent || '0';

      card.classList.add('premium-metric', 'ux-story-card', `ux-card-${metric}`);
      card.innerHTML = `
        <div class="ux-card-head">
          <span class="ux-card-icon"><i class="fa-solid ${config.icon}"></i></span>
          <div>
            <h3>${config.title}</h3>
            <p>${config.desc}</p>
          </div>
        </div>
        <div class="ux-card-visual ux-visual-${config.visual}">
          ${visualMarkup(metric, config)}
        </div>
        <div class="ux-card-foot">
          <div>
            <div class="stat-num" id="${numId}">${currentValue}</div>
            <div class="stat-lbl">${config.numberLabel}</div>
          </div>
          <p class="ux-card-secondary" id="ux-secondary-${metric}">${config.secondary}</p>
        </div>`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Abrir indicador ${config.title}`);
      card.onclick = () => abrirPainelIndicador(card.dataset.metric || metric);
      card.onkeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          abrirPainelIndicador(card.dataset.metric || metric);
        }
      };
      card.dataset.ready = 'true';
    });
  }

  function redesenharCardsIndicadores() {
    const indicadores = {
      total: {
        title: 'Total de Registros',
        desc: 'Pessoas cadastradas no sistema',
        icon: 'fa-users',
        numberId: 'stat-total',
        label: 'pessoas cadastradas',
        visual: `
          <div class="carousel-people-bg" aria-hidden="true">${Array.from({ length: 28 }, () => '<i class="fa-solid fa-user"></i>').join('')}</div>
          <div class="carousel-growth-bars" id="ux-total-growth" aria-label="Crescimento acumulado"></div>
          <div class="annual-progress">
            <div class="annual-progress-head">
              <span>Meta anual</span>
              <strong id="ux-total-percent">0%</strong>
            </div>
            <span class="annual-progress-track"><i id="ux-total-progress"></i></span>
            <small id="ux-total-goal">0 registros no ano</small>
          </div>`
      },
      membros: {
        title: 'Membros Recebidos',
        desc: 'Evolução mensal de membros oficialmente recebidos pela igreja',
        icon: 'fa-user-group',
        numberId: 'stat-membros',
        label: 'membros registrados',
        visual: `
          <div class="carousel-person-strip" id="ux-membros-icons" aria-hidden="true"></div>
          <div class="carousel-month-bars" id="ux-membros-bars" aria-label="Evolução mensal de membros"></div>`
      },
      congregados: {
        title: 'Congregados Acompanhados',
        desc: 'Pessoas em processo de acompanhamento pastoral',
        icon: 'fa-hand-holding-heart',
        numberId: 'stat-congregados',
        label: 'congregados cadastrados',
        visual: `
          <div class="carousel-gauge-wrap">
            <div class="carousel-gauge" id="ux-congregados-gauge" style="--pct:0%;">
              <div class="carousel-gauge-center">
                <strong id="ux-congregados-percent">0%</strong>
                <span>acompanhados</span>
              </div>
            </div>
            <div class="carousel-gauge-facts">
              <span><strong id="ux-congregados-total">0</strong> congregados</span>
              <span><strong id="ux-congregados-acompanhados">0</strong> acompanhados</span>
            </div>
          </div>`
      },
      ativos: {
        title: 'Cadastros Ativos',
        desc: 'Leitura visual de pessoas ativas e inativas no cadastro',
        icon: 'fa-user-check',
        numberId: 'stat-ativos',
        label: 'cadastros ativos',
        visual: `
          <div class="carousel-human-map" id="ux-ativos-people" aria-label="Pessoas ativas e inativas"></div>
          <div class="carousel-legend">
            <span><i class="active"></i> Ativos</span>
            <span><i class="inactive"></i> Inativos</span>
          </div>`
      },
      mes: {
        title: 'Crescimento Mensal',
        desc: 'Evolução dos últimos meses com comparação do período atual',
        icon: 'fa-arrow-trend-up',
        numberId: 'stat-mes',
        label: 'novos neste mês',
        visual: `<div class="carousel-month-bars carousel-month-bars-wide" id="ux-mes-bars" aria-label="Crescimento mensal"></div>`
      }
    };

    const grid = document.querySelector('.stats-grid');
    if (!grid) return;

    let section = document.getElementById('indicadores-igreja');
    if (!section) {
      section = document.createElement('section');
      section.id = 'indicadores-igreja';
      section.className = 'indicator-carousel-section';
      section.innerHTML = `
        <div class="indicator-carousel-head">
          <div>
            <h2>Indicadores da Igreja</h2>
            <p>Visão geral do crescimento e acompanhamento</p>
          </div>
          <div class="indicator-carousel-controls" aria-label="Navegação dos indicadores">
            <button class="indicator-nav-btn" type="button" data-carousel-prev aria-label="Indicador anterior"><i class="fa-solid fa-arrow-left"></i></button>
            <button class="indicator-nav-btn" type="button" data-carousel-next aria-label="Próximo indicador"><i class="fa-solid fa-arrow-right"></i></button>
          </div>
        </div>
        <div class="indicator-carousel-shell">
          <div class="indicator-carousel-viewport"></div>
        </div>
        <div class="indicator-carousel-dots" id="indicator-carousel-dots" aria-label="Indicador atual"></div>`;
      section.tabIndex = 0;
      grid.parentNode.insertBefore(section, grid);
      section.querySelector('.indicator-carousel-viewport').appendChild(grid);
      section.querySelector('[data-carousel-prev]')?.addEventListener('click', () => mudarIndicadorCarousel(-1));
      section.querySelector('[data-carousel-next]')?.addEventListener('click', () => mudarIndicadorCarousel(1));
      section.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') mudarIndicadorCarousel(-1);
        if (event.key === 'ArrowRight') mudarIndicadorCarousel(1);
      });
    }

    grid.className = 'stats-grid indicator-carousel-track';
    grid.innerHTML = INDICADORES_CAROUSEL.map((metric) => {
      const item = indicadores[metric];
      return `
        <article class="stat-card indicator-slide indicator-slide-${metric}" data-metric="${metric}" aria-roledescription="slide">
          <div class="indicator-slide-copy">
            <span class="indicator-slide-icon"><i class="fa-solid ${item.icon}"></i></span>
            <div>
              <span class="indicator-slide-kicker">Indicador principal</span>
              <h3>${item.title}</h3>
              <p>${item.desc}</p>
            </div>
          </div>
          <div class="indicator-slide-body">
            <div class="indicator-visual indicator-visual-${metric}">
              ${item.visual}
            </div>
            <aside class="indicator-side-summary">
              <span>Leitura rápida</span>
              <strong class="stat-num" id="${item.numberId}">0</strong>
              <small>${item.label}</small>
              <p id="ux-secondary-${metric}">Atualizando indicador...</p>
            </aside>
          </div>
        </article>`;
    }).join('');

    grid.querySelectorAll('.indicator-slide').forEach((slide) => {
      slide.setAttribute('role', 'group');
      slide.addEventListener('click', () => abrirPainelIndicador(slide.dataset.metric || 'total'));
    });

    const dots = document.getElementById('indicator-carousel-dots');
    if (dots) {
      dots.innerHTML = INDICADORES_CAROUSEL.map((metric, index) => `
        <button type="button" class="indicator-dot" data-carousel-dot="${index}" aria-label="Ver indicador ${indicadores[metric].title}"></button>
      `).join('');
      dots.querySelectorAll('[data-carousel-dot]').forEach((dot) => {
        dot.addEventListener('click', () => irParaIndicadorCarousel(Number(dot.dataset.carouselDot || 0)));
      });
    }

    atualizarCarouselIndicadores();
  }

  function atualizarCarouselIndicadores() {
    const track = document.querySelector('.indicator-carousel-track');
    const slides = Array.from(document.querySelectorAll('.indicator-slide'));
    const dots = Array.from(document.querySelectorAll('.indicator-dot'));
    if (!track || !slides.length) return;

    indicadorCarouselAtual = Math.max(0, Math.min(indicadorCarouselAtual, slides.length - 1));
    track.style.transform = `translateX(-${indicadorCarouselAtual * 100}%)`;

    slides.forEach((slide, index) => {
      const active = index === indicadorCarouselAtual;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === indicadorCarouselAtual);
      dot.setAttribute('aria-current', index === indicadorCarouselAtual ? 'true' : 'false');
    });
  }

  function irParaIndicadorCarousel(index) {
    indicadorCarouselAtual = index;
    atualizarCarouselIndicadores();
  }

  function mudarIndicadorCarousel(delta) {
    const totalSlides = INDICADORES_CAROUSEL.length;
    indicadorCarouselAtual = (indicadorCarouselAtual + delta + totalSlides) % totalSlides;
    atualizarCarouselIndicadores();
  }

  window.irParaIndicadorCarousel = irParaIndicadorCarousel;
  window.mudarIndicadorCarousel = mudarIndicadorCarousel;

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
      await db.auth.signOut();
      membrosCache = [];
      mostrarTela('tela-login');
      mostrarErroLogin(`Acesso negado para ${email}.${roleAtual} Coloque este usuario como admin no SQL do Supabase.`);
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

  function fmt(v) { return v ? safeText(v) : '<span style="color:var(--muted)">—</span>'; }
  function fmtDate(v) { return v ? v.split('-').reverse().join('/') : '<span style="color:var(--muted)">—</span>'; }

  function statusBadge(s) {
    const cls = { 'Ativo': 'ativo', 'Inativo': 'inativo', 'Transferido': 'transferido', 'Falecido': 'falecido' }[s] || 'ativo';
    return `<span class="badge badge-${cls}">${safeText(s || 'Ativo')}</span>`;
  }

  function whatsappLink(cel) {
    if (!cel) return '';
    const n = cel.replace(/\D/g, '');
    return `<a href="https://wa.me/55${n}" target="_blank" class="btn btn-green btn-sm" style="text-decoration:none;">💬</a>`;
  }

  function avatarImg(m, size = 32) {
    const foto = safeUrl(m.foto_url);
    if (foto) return `<img src="${foto}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;" referrerpolicy="no-referrer">`;
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
      <div class="notif-nome">${safeText(membro.nome)}</div>
      <div class="notif-meta">
        <span>${safeText(membro.tipo_cadastro || 'Membro')}</span>
        ${membro.celular ? `<span>📱 ${safeText(membro.celular)}</span>` : ''}
        ${membro.setor_igreja ? `<span>📍 ${safeText(membro.setor_igreja)}</span>` : ''}
      </div>
      <div class="notif-acoes">
        <button class="notif-btn" onclick="verDetalhes(${jsString(membro.id)});fecharNotif('${id}')">👁 Ver ficha</button>
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
          <div style="font-weight:700;font-size:0.9rem;">${safeText(n.membro.nome)}</div>
          <div style="font-size:0.75rem;color:var(--muted);">${safeText(n.membro.tipo_cadastro || '—')}${n.membro.celular ? ' · ' + safeText(n.membro.celular) : ''} · ${safeText(n.hora)}</div>
        </div>
        <div style="display:flex;gap:5px;">
          <button class="btn btn-ghost btn-sm" onclick="verDetalhes(${jsString(n.membro.id)});document.getElementById('hist-overlay').classList.remove('open')">👁</button>
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
    const channel = db.channel('novos-membros')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'membros' }, payload => {
        const m = payload.new;
        membrosCache.unshift(m);

        // Atualiza indicador principal de “Último cadastro”
        atualizarUltimoCadastro(m);

        renderStats();
        popularFiltroSetor();
        popularFiltroCargo();
        renderAniversariantes();
        renderLista(m.id);
        criarNotificacao(m);
      })
      .subscribe((status, err) => {
        if (err) {
          toast('Tempo real indisponível no momento.');
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
    renderLista();
  }

  function renderStoryStats() {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    const setNum = (id, val) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.textContent !== String(val)) {
        el.textContent = val;
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
      }
    };
    const setStyle = (id, prop, val) => {
      const el = document.getElementById(id);
      if (el) el.style.setProperty(prop, val);
    };
    const plural = (value, single, pluralText) => `${value} ${value === 1 ? single : pluralText}`;
    const isAtivo = m => !m.status || m.status === 'Ativo';
    const parseDataLocal = valor => {
      if (!valor) return null;
      const partes = String(valor).slice(0, 10).split('-').map(Number);
      if (partes.length === 3 && partes.every(Boolean)) return new Date(partes[0], partes[1] - 1, partes[2]);
      const d = new Date(valor);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const chaveMes = data => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    const meses = Array.from({ length: 6 }, (_, index) => {
      const data = new Date();
      data.setDate(1);
      data.setHours(12, 0, 0, 0);
      data.setMonth(data.getMonth() - (5 - index));
      return {
        key: chaveMes(data),
        label: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        nome: data.toLocaleDateString('pt-BR', { month: 'long' }),
        atual: index === 5
      };
    });
    const contarMeses = lista => {
      const mapa = Object.fromEntries(meses.map(mes => [mes.key, 0]));
      lista.forEach(item => {
        if (!item.created_at) return;
        const d = new Date(item.created_at);
        if (Number.isNaN(d.getTime())) return;
        const key = chaveMes(d);
        if (mapa[key] !== undefined) mapa[key]++;
      });
      return meses.map(mes => mapa[mes.key]);
    };
    const textoComparacao = (atual, anterior, nome = 'cadastros') => {
      const delta = atual - anterior;
      if (delta > 0) return `+${delta} ${nome} vs mês anterior`;
      if (delta < 0) return `${Math.abs(delta)} a menos que no mês anterior`;
      if (atual > 0) return 'Mesmo ritmo do mês anterior';
      return 'Sem registros nos dois últimos meses';
    };
    const alturaBarra = (valor, maximo, min = 16, max = 86) => {
      if (!maximo) return min;
      return Math.max(min, Math.round((valor / maximo) * max));
    };

    const total = membrosCache.length;
    const membrosLista = membrosCache.filter(m => m.tipo_cadastro === 'Membro');
    const congregadosLista = membrosCache.filter(m => m.tipo_cadastro === 'Congregado');
    const ativos = membrosCache.filter(isAtivo).length;
    const inativos = Math.max(0, total - ativos);
    const membros = membrosLista.length;
    const congregados = congregadosLista.length;
    const registrosMes = contarMeses(membrosCache);
    const membrosMes = contarMeses(membrosLista);
    const doMes = registrosMes[registrosMes.length - 1] || 0;
    const mesAnterior = registrosMes[registrosMes.length - 2] || 0;
    const membrosAtual = membrosMes[membrosMes.length - 1] || 0;
    const aniversariantes = membrosCache
      .filter(m => m.data_nasc && isAtivo(m))
      .map(m => {
        const d = parseDataLocal(m.data_nasc);
        return d ? { ...m, mes: d.getMonth() } : null;
      })
      .filter(Boolean)
      .filter(m => m.mes === new Date().getMonth()).length;
    const acompanhados = congregadosLista.filter(m =>
      isAtivo(m) && (m.setor_igreja || m.congregacao_igreja || m.forma_recebimento || m.cargo_principal)
    ).length;
    const percentAcompanhados = congregados ? Math.round((acompanhados / congregados) * 100) : 0;
    const anoAtual = new Date().getFullYear();
    const registrosAno = membrosCache.filter(m => {
      if (!m.created_at) return false;
      const d = new Date(m.created_at);
      return !Number.isNaN(d.getTime()) && d.getFullYear() === anoAtual;
    }).length;
    const metaAnual = Math.max(100, Math.ceil(Math.max(registrosAno, total, 1) / 50) * 50);
    const percentMetaAnual = Math.min(100, Math.round((registrosAno / metaAnual) * 100));

    setNum('stat-total', total);
    setNum('stat-membros', membros);
    setNum('stat-congregados', congregados);
    setNum('stat-ativos', ativos);
    setNum('stat-mes', doMes);
    setNum('stat-aniversariantes', aniversariantes);
    setText('ux-total-percent', `${percentMetaAnual}%`);
    setText('ux-total-goal', `${registrosAno} de ${metaAnual} registros em ${anoAtual}`);
    setStyle('ux-total-progress', 'width', `${percentMetaAnual}%`);

    const renderBarras = (id, valores) => {
      const alvo = document.getElementById(id);
      if (!alvo) return;
      const maximo = Math.max(1, ...valores);
      alvo.innerHTML = meses.map((mes, index) => `
        <span class="ux-month-bar ${mes.atual ? 'current' : ''}" title="${valores[index]} em ${mes.nome}">
          <i class="ux-bar-fill" style="height:${alturaBarra(valores[index], maximo)}px"></i>
          <strong>${valores[index]}</strong>
          <em>${mes.label}</em>
        </span>`).join('');
    };

    const totalGrowth = document.getElementById('ux-total-growth');
    if (totalGrowth) {
      const anteriores = Math.max(0, total - registrosMes.reduce((acc, value) => acc + value, 0));
      let acumulado = anteriores;
      const progressao = registrosMes.map(value => {
        acumulado += value;
        return acumulado;
      });
      const maximo = Math.max(1, ...progressao);
      totalGrowth.innerHTML = meses.map((mes, index) => `
        <span class="ux-growth-step ${mes.atual ? 'current' : ''}" title="${progressao[index]} registros acumulados">
          <i class="ux-growth-fill" style="height:${alturaBarra(progressao[index], maximo)}px"></i>
          <b><i class="fa-solid ${mes.atual ? 'fa-user-check' : 'fa-user-plus'}"></i></b>
          <em>${mes.label}</em>
        </span>`).join('');
    }

    const membrosIcons = document.getElementById('ux-membros-icons');
    if (membrosIcons) {
      const maximo = Math.max(1, ...membrosMes);
      const preenchidos = membrosAtual ? Math.max(1, Math.ceil((membrosAtual / maximo) * 8)) : 0;
      membrosIcons.innerHTML = Array.from({ length: 8 }, (_, index) =>
        `<i class="fa-solid fa-user ${index < preenchidos ? 'active' : ''}"></i>`
      ).join('');
    }

    renderBarras('ux-membros-bars', membrosMes);
    renderBarras('ux-mes-bars', registrosMes);

    const gauge = document.getElementById('ux-congregados-gauge');
    if (gauge) gauge.style.setProperty('--pct', `${percentAcompanhados}%`);
    setText('ux-congregados-percent', `${percentAcompanhados}%`);
    setText('ux-congregados-total', congregados);
    setText('ux-congregados-acompanhados', acompanhados);

    const people = document.getElementById('ux-ativos-people');
    if (people) {
      const slots = 24;
      const inativosSlots = total && inativos ? Math.max(1, Math.round((inativos / total) * slots)) : 0;
      people.innerHTML = Array.from({ length: slots }, (_, index) => {
        const inactive = !total || index >= slots - inativosSlots;
        return `<span class="${inactive ? 'inactive' : 'active'}"><i class="fa-solid fa-user"></i></span>`;
      }).join('');
    }

    setText('ux-aniversariantes-state', aniversariantes
      ? `${plural(aniversariantes, 'celebração prevista', 'celebrações previstas')}`
      : 'Não há aniversariantes este mês');

    setText('ux-secondary-total', textoComparacao(doMes, mesAnterior));
    setText('ux-secondary-membros', membrosAtual
      ? `${plural(membrosAtual, 'membro recebido', 'membros recebidos')} neste mês`
      : 'Nenhum membro recebido neste mês');
    setText('ux-secondary-congregados', congregados
      ? `${acompanhados} de ${congregados} congregados acompanhados`
      : 'Nenhum congregado cadastrado ainda');
    setText('ux-secondary-ativos', inativos
      ? `${ativos} ativos e ${inativos} inativos`
      : 'Todos os cadastros estão ativos');
    setText('ux-secondary-mes', textoComparacao(doMes, mesAnterior));
    setText('ux-secondary-aniversariantes', aniversariantes
      ? `${plural(aniversariantes, 'pessoa para celebrar', 'pessoas para celebrar')}`
      : 'Não há aniversariantes este mês');

    if (indicadorAtivo) renderPainelIndicador();
  }

  function renderStats() {
    return renderStoryStats();
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
    setNum('stat-membros', membros);
    setNum('stat-congregados', congregados);
    setNum('stat-ativos', ativos);
    setNum('stat-mes', doMes);
    setNum('stat-aniversariantes', aniversariantes);

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    const setCssValue = (selector, prop, val) => {
      const el = document.querySelector(selector);
      if (el) el.style.setProperty(prop, val);
    };
    const plural = (value, single, pluralText) => `${value} ${value === 1 ? single : pluralText}`;
    const metaMensal = Math.max(4, doMes || 0);
    const totalPercent = metaMensal ? Math.min(100, Math.round((doMes / metaMensal) * 100)) : 0;
    const congregadosPercent = total ? Math.round((congregados / total) * 100) : 0;
    const ativosPercent = total ? Math.round((ativos / total) * 100) : 0;
    const mesesResumo = Array.from({ length: 4 }, (_, offset) => {
      const data = new Date(agora.getFullYear(), agora.getMonth() - (3 - offset), 1);
      const count = membrosCache.filter(m => {
        if (!m.created_at) return false;
        const d = new Date(m.created_at);
        return d.getMonth() === data.getMonth() && d.getFullYear() === data.getFullYear();
      }).length;
      return {
        label: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        count
      };
    });
    const maiorMes = Math.max(1, ...mesesResumo.map(item => item.count));

    setText('metric-total-percent', `${totalPercent}%`);
    setCssValue('#metric-total-fill', 'width', `${totalPercent}%`);
    setText('metric-congregados-percent', `${congregadosPercent}%`);
    setCssValue('.metric-gauge', '--gauge-value', `${Math.min(180, Math.round((congregadosPercent / 100) * 180))}deg`);
    document.querySelectorAll('.metric-member-bars .member-bar').forEach((bar, index) => {
      const item = mesesResumo[index];
      if (!item) return;
      bar.style.setProperty('--h', `${Math.max(18, Math.round((item.count / maiorMes) * 92))}%`);
      const value = bar.querySelector('strong');
      const label = bar.querySelector('em');
      if (value) value.textContent = item.count;
      if (label) label.textContent = item.label;
      if (index === mesesResumo.length - 1) bar.classList.add('current');
    });

    const peopleContainer = document.getElementById('metric-ativos-people');
    if (peopleContainer) {
      const onCount = Math.min(10, ativos);
      const icons = Array.from({ length: 10 }, (_, index) => `
        <i class="fa-solid fa-user ${index < onCount ? 'on' : ''}"></i>`).join('');
      peopleContainer.innerHTML = icons;
    }

    const birthdayState = document.getElementById('metric-aniversariantes-state');
    if (birthdayState) {
      birthdayState.textContent = aniversariantes
        ? `${plural(aniversariantes, 'aniversariante ativo', 'aniversariantes ativos')}`
        : 'Nao ha aniversariantes este mes';
    }

    setText('metric-total-foot-left', `Meta mensal: ${metaMensal} registros`);
    setText('metric-total-foot-right', `${Math.min(doMes, metaMensal)} de ${metaMensal}`);
    setText('metric-membros-foot-left', `Este mês: ${agora.toLocaleDateString('pt-BR', { month: 'long' })}`);
    setText('metric-membros-foot-right', `Total no ano: ${membros}`);
    setText('metric-congregados-foot-left', `Total de congregados: ${congregados}`);
    setText('metric-congregados-foot-right', `Acompanhados: ${congregados}`);
    setText('metric-ativos-foot-left', `${ativos} de ${total} registros ativos`);
    setText('metric-ativos-foot-right', `${ativosPercent}%`);
    setText('metric-mes-foot-left', `${plural(doMes, 'novo cadastro', 'novos cadastros')}`);
    setText('metric-mes-foot-right', `Neste mês`);
    setText('metric-aniversariantes-foot-left', aniversariantes ? `${plural(aniversariantes, 'celebracao prevista', 'celebracoes previstas')}` : 'Nenhum aniversariante este mes');
    setText('metric-aniversariantes-foot-right', agora.toLocaleDateString('pt-BR', { month: 'long' }));

    setText('dashboard-birthday-title', `${plural(aniversariantes, 'aniversariante', 'aniversariantes')} este mes`);
    setText(
      'dashboard-birthday-subtitle',
      aniversariantes ? 'Confira a lista e prepare a celebracao do mes.' : 'Nenhuma celebracao prevista para este mes.'
    );

    if (indicadorAtivo) renderPainelIndicador();
  }

  function obterIndicador(metric = 'total') {
    const ativos = membrosCache.filter(m => !m.status || m.status === 'Ativo');
    const membros = membrosCache.filter(m => m.tipo_cadastro === 'Membro');
    const congregados = membrosCache.filter(m => m.tipo_cadastro === 'Congregado');
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();
    const doMes = membrosCache.filter(m => {
      if (!m.created_at) return false;
      const d = new Date(m.created_at);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });
    const aniversariantes = membrosCache.filter(m => {
      if (!m.data_nasc || (m.status && m.status !== 'Ativo')) return false;
      const d = new Date(m.data_nasc);
      return d.getMonth() === mesAtual;
    });

    const porStatus = ['Ativo', 'Inativo', 'Transferido', 'Falecido'].map(status => ({
      label: status,
      value: membrosCache.filter(m => (m.status || 'Ativo') === status).length
    }));

    const porTipo = [
      { label: 'Membros', value: membros.length },
      { label: 'Congregados', value: congregados.length }
    ];

    const ultimosMeses = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anoAtual, mesAtual - i, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      ultimosMeses.push({
        label,
        value: membrosCache.filter(m => {
          if (!m.created_at) return false;
          const cd = new Date(m.created_at);
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
        }).length
      });
    }

    const diasDoMes = Array.from({ length: agora.getDate() }, (_, i) => ({
      label: String(i + 1).padStart(2, '0'),
      value: doMes.filter(m => new Date(m.created_at).getDate() === i + 1).length
    }));

    const porDiaAniversario = aniversariantes
      .map(m => ({ label: String(new Date(m.data_nasc).getDate()).padStart(2, '0'), value: 1 }))
      .reduce((acc, item) => {
        const atual = acc.find(x => x.label === item.label);
        if (atual) atual.value += 1;
        else acc.push(item);
        return acc;
      }, [])
      .sort((a, b) => Number(a.label) - Number(b.label));

    const mapas = {
      total: {
        title: 'Total de cadastros',
        subtitle: 'Visao geral dos registros cadastrados',
        summary: `${membrosCache.length} registros no sistema, sendo ${membros.length} membros e ${congregados.length} congregados.`,
        items: ultimosMeses
      },
      membros: {
        title: 'Membros',
        subtitle: 'Distribuicao dos membros por status',
        summary: `${membros.length} membros cadastrados. ${membros.filter(m => !m.status || m.status === 'Ativo').length} estao ativos.`,
        items: porStatus.map(item => ({
          ...item,
          value: membros.filter(m => (m.status || 'Ativo') === item.label).length
        }))
      },
      congregados: {
        title: 'Congregados',
        subtitle: 'Congregados acompanhados pela igreja',
        summary: `${congregados.length} congregados cadastrados. Este indicador ajuda a acompanhar integracao e crescimento.`,
        items: porStatus.map(item => ({
          ...item,
          value: congregados.filter(m => (m.status || 'Ativo') === item.label).length
        }))
      },
      ativos: {
        title: 'Cadastros ativos',
        subtitle: 'Comparativo entre ativos e demais status',
        summary: `${ativos.length} cadastros ativos de um total de ${membrosCache.length}.`,
        items: [
          { label: 'Ativos', value: ativos.length },
          { label: 'Outros status', value: Math.max(0, membrosCache.length - ativos.length) }
        ]
      },
      mes: {
        title: 'Cadastros deste mes',
        subtitle: 'Entradas registradas no mes atual',
        summary: `${doMes.length} novo(s) cadastro(s) registrados neste mes.`,
        items: diasDoMes.length ? diasDoMes : [{ label: 'Sem dados', value: 0 }]
      },
      aniversariantes: {
        title: 'Aniversariantes',
        subtitle: 'Celebracoes do mes atual',
        summary: `${aniversariantes.length} aniversariante(s) ativo(s) neste mes.`,
        items: porDiaAniversario.length ? porDiaAniversario : [{ label: 'Sem dados', value: 0 }]
      }
    };

    return mapas[metric] || mapas.total;
  }

  function abrirPainelIndicador(metric) {
    indicadorAtivo = metric || 'total';
    document.querySelectorAll('.stat-card').forEach(card => {
      card.classList.toggle('active', card.dataset.metric === indicadorAtivo);
    });
    const panel = document.getElementById('metric-detail-panel');
    if (panel) panel.classList.add('open');
    renderPainelIndicador();
  }

  window.abrirPainelIndicador = abrirPainelIndicador;

  function fecharPainelIndicador() {
    indicadorAtivo = null;
    document.querySelectorAll('.stat-card').forEach(card => card.classList.remove('active'));
    const panel = document.getElementById('metric-detail-panel');
    if (panel) panel.classList.remove('open');
    if (metricChart) {
      metricChart.destroy();
      metricChart = null;
    }
  }

  window.fecharPainelIndicador = fecharPainelIndicador;

  function alterarVisualizacaoIndicador(tipo) {
    tipoVisualizacaoIndicador = tipo || 'bar';
    const select = document.getElementById('metric-view-type');
    if (select && select.value !== tipoVisualizacaoIndicador) select.value = tipoVisualizacaoIndicador;
    if (!indicadorAtivo) abrirPainelIndicador('total');
    else renderPainelIndicador();
  }

  window.alterarVisualizacaoIndicador = alterarVisualizacaoIndicador;

  function renderPainelIndicador() {
    if (!indicadorAtivo) return;
    const info = obterIndicador(indicadorAtivo);
    const title = document.getElementById('metric-title');
    const subtitle = document.getElementById('metric-subtitle');
    const summary = document.getElementById('metric-summary');
    const textView = document.getElementById('metric-text-view');
    const canvas = document.getElementById('metric-chart');
    const select = document.getElementById('metric-view-type');
    if (select) select.value = tipoVisualizacaoIndicador;
    if (title) title.textContent = info.title;
    if (subtitle) subtitle.textContent = info.subtitle;
    if (summary) {
      summary.innerHTML = `<strong>Resumo</strong><p>${safeText(info.summary)}</p><ul>${info.items.map(item => `<li><span>${safeText(item.label)}</span><strong>${safeText(item.value)}</strong></li>`).join('')}</ul>`;
    }

    if (metricChart) {
      metricChart.destroy();
      metricChart = null;
    }

    const labels = info.items.map(item => item.label);
    const values = info.items.map(item => item.value);
    const palette = ['#6D4CFF', '#22C55E', '#F59E0B', '#06B6D4', '#EF4444', '#8B5CF6', '#14B8A6'];

    if (tipoVisualizacaoIndicador === 'text') {
      if (canvas) canvas.style.display = 'none';
      if (textView) {
        textView.style.display = 'grid';
        textView.innerHTML = `<h3>${safeText(info.title)}</h3><p>${safeText(info.summary)}</p>${info.items.map(item => `<div><span>${safeText(item.label)}</span><strong>${safeText(item.value)}</strong></div>`).join('')}`;
      }
      return;
    }

    if (canvas) canvas.style.display = 'block';
    if (textView) {
      textView.style.display = 'none';
      textView.innerHTML = '';
    }
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const chartType = tipoVisualizacaoIndicador === 'donut' ? 'doughnut' : tipoVisualizacaoIndicador;
    const isRound = chartType === 'pie' || chartType === 'doughnut';
    metricChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label: info.title,
          data: values,
          borderColor: '#6D4CFF',
          backgroundColor: isRound ? palette : 'rgba(109, 76, 255, 0.72)',
          pointBackgroundColor: '#fff',
          pointBorderColor: '#6D4CFF',
          borderRadius: chartType === 'bar' ? 10 : 0,
          borderWidth: isRound ? 3 : 2,
          fill: chartType === 'line',
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: isRound, position: 'bottom', labels: { color: '#475569', boxWidth: 10 } }
        },
        scales: isRound ? {} : {
          y: { beginAtZero: true, grid: { color: 'rgba(226,232,240,0.85)' }, ticks: { color: '#64748b', stepSize: 1 } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }

  function exportarIndicadorPDF() {
    if (!indicadorAtivo) abrirPainelIndicador('total');
    const info = obterIndicador(indicadorAtivo);
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { toast('Biblioteca PDF indisponivel.'); return; }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(info.title, 14, 18);
    doc.setFontSize(10);
    doc.text(info.subtitle, 14, 26);
    doc.text(doc.splitTextToSize(info.summary, 180), 14, 38);
    if (metricChart && tipoVisualizacaoIndicador !== 'text') {
      const img = metricChart.toBase64Image();
      doc.addImage(img, 'PNG', 14, 58, 180, 85);
    }
    const startY = metricChart && tipoVisualizacaoIndicador !== 'text' ? 154 : 58;
    doc.autoTable({
      startY,
      head: [['Item', 'Quantidade']],
      body: info.items.map(item => [item.label, item.value])
    });
    doc.save(`indicador-${indicadorAtivo}.pdf`);
  }

  window.exportarIndicadorPDF = exportarIndicadorPDF;

  function exportarIndicadorPNG() {
    if (!metricChart || tipoVisualizacaoIndicador === 'text') {
      toast('Abra uma visualizacao grafica antes de baixar PNG.');
      return;
    }
    const a = document.createElement('a');
    a.href = metricChart.toBase64Image();
    a.download = `indicador-${indicadorAtivo}.png`;
    a.click();
  }

  window.exportarIndicadorPNG = exportarIndicadorPNG;

  function toggleFiltrosAvancados() {
    document.querySelector('.toolbar')?.classList.toggle('avancados-abertos');
  }

  window.toggleFiltrosAvancados = toggleFiltrosAvancados;

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
    document.getElementById('aniv-chevron').textContent = anivAberto ? 'Ocultar' : 'Ver aniversariantes';
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
    const title = document.querySelector('.birthdays-panel .aniv-title') || document.querySelector('.aniv-title');
    if (title?.childNodes?.[0]) {
      title.childNodes[0].textContent = `${lista.length} aniversariante${lista.length === 1 ? '' : 's'} este mes `;
    }
    const chevron = document.getElementById('aniv-chevron');
    if (chevron) chevron.textContent = anivAberto ? 'Ocultar' : 'Ver aniversariantes';

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
      const foto = safeUrl(m.foto_url);
      const nome = safeText(m.nome);
      const primeiroNome = encodeURIComponent(String(m.nome || '').split(' ')[0] || '');

      return `<div class="aniv-item" style="${eHoje ? 'background:rgba(201,168,76,0.06);border-radius:8px;padding:8px;' : ''}">
        ${foto ? `<img src="${foto}" class="aniv-avatar" referrerpolicy="no-referrer">` : `<div class="aniv-avatar-placeholder">🎂</div>`}
        <div class="aniv-info">
          <div class="aniv-nome">${nome} ${eHoje ? '<span class="hoje-badge">HOJE!</span>' : ''}</div>
          <div class="aniv-sub">Dia ${m.dia} de ${meses[mesAtual]} · ${idade} anos</div>
        </div>
        ${tel ? `<a href="https://wa.me/55${tel}?text=Feliz+aniversário+${primeiroNome}!+Que+Deus+te+abençoe+muito!" target="_blank" class="btn btn-gold btn-sm" style="text-decoration:none;">🎉 Parabenizar</a>` : ''}
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
      const nomeBusca = String(m.nome || '').toLowerCase();
      const emailBusca = String(m.email || '').toLowerCase();
      const mb = !busca || nomeBusca.includes(busca)
        || (m.cpf || '').includes(busca)
        || (m.celular || '').includes(busca)
        || emailBusca.includes(busca);
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

    corpo.innerHTML = pagina.map(m => {
      const id = String(m.id ?? '');
      const tipo = m.tipo_cadastro || '-';
      const badgeTipo = tipo === 'Membro' ? 'membro' : 'congregado';
      const destaque = String(m.id ?? '') === String(novoId ?? '') ? 'novo-destaque' : '';
      return `<tr id="row-${escapeAttr(id)}" class="${destaque}">
      <td>${avatarImg(m, 42)}</td>
      <td><strong class="member-name">${safeText(m.nome)}</strong><div class="member-sub">${safeText(m.email || m.setor_igreja || '-')}</div></td>
      <td>${safeText(m.cpf || '-')}</td>
      <td><span class="badge badge-${badgeTipo}">${safeText(tipo)}</span></td>
      <td>${statusBadge(m.status)}</td>
      <td style="color:var(--muted);font-size:0.8rem;">${safeText(m.cargo_principal || m.setor_igreja || '-')}</td>
      <td style="font-size:0.85rem;">${safeText(m.celular || '-')}</td>
      <td><div class="td-actions">
        <button class="btn btn-ghost btn-sm" onclick="verDetalhes(${jsString(id)})" title="Visualizar"><i class="fa-solid fa-eye"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="abrirEdicao(${jsString(id)})" title="Editar"><i class="fa-solid fa-pen"></i></button>
        ${whatsappLink(m.celular)}
        <button class="btn btn-danger btn-sm" onclick="excluirMembro(${jsString(id)},${jsString(m.nome || '')})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </div></td></tr>`;
    }).join('');

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

  let renderListaTimer = null;
  function renderListaDebounced() {
    clearTimeout(renderListaTimer);
    renderListaTimer = setTimeout(() => renderLista(), 120);
  }
  window.renderListaDebounced = renderListaDebounced;

  function mudarPagina(p) {
    paginaAtual = p;
    renderLista();
    document.querySelector('.table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  window.mudarPagina = mudarPagina;

  function verDetalhes(id) {
    const m = membrosCache.find(x => String(x.id) === String(id));
    if (!m) return;

    const idSeguro = String(m.id ?? '');
    const tel = m.celular ? m.celular.replace(/\D/g, '') : null;
    const foto = safeUrl(m.foto_url);
    const doc = safeUrl(m.doc_url);
    const tipo = m.tipo_cadastro || '-';
    const badgeTipo = tipo === 'Membro' ? 'membro' : 'congregado';
    const enderecoLinha = `${fmt(m.endereco)}${m.bairro ? ', ' + safeText(m.bairro) : ''}${m.cidade_estado ? ' — ' + safeText(m.cidade_estado) : ''}`;

    document.getElementById('modal-conteudo').innerHTML = `
      <div class="modal-header">
        <div style="display:flex;align-items:center;">
          ${foto ? `<img src="${foto}" class="foto-modal-grande" referrerpolicy="no-referrer">` : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(201,168,76,0.12);display:flex;align-items:center;justify-content:center;font-size:2rem;margin-right:1rem;flex-shrink:0;">👤</div>`}
          <div>
            <div class="modal-nome">${safeText(m.nome)}</div>
            <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;">
              <span class="badge badge-${badgeTipo}">${safeText(tipo)}</span>
              ${statusBadge(m.status)}
            </div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('modal-overlay').classList.remove('open')">✕</button>
      </div>

      <div class="modal-section"><div class="modal-section-title">👤 Dados Pessoais</div><div class="modal-grid">
        <div class="modal-field"><strong>${m.tipo_cpf === 'estrangeiro' ? 'CRNM' : 'CPF'}</strong><span>${fmt(m.cpf)}</span></div>
        ${m.tipo_cpf !== 'estrangeiro' ? `<div class="modal-field"><strong>RG</strong><span>${fmt(m.rg)}</span></div>` : ''}
        <div class="modal-field"><strong>Nascimento</strong><span>${fmtDate(m.data_nasc)}${m.idade ? ' · ' + safeText(m.idade) + ' anos' : ''}</span></div>
        <div class="modal-field"><strong>Sexo</strong><span>${fmt(m.sexo)}</span></div>
        <div class="modal-field"><strong>Estado Civil</strong><span>${fmt(m.estado_civil)}</span></div>
        <div class="modal-field"><strong>Cônjuge</strong><span>${fmt(m.conjuge_nome)}</span></div>
        <div class="modal-field"><strong>Escolaridade</strong><span>${fmt(m.escolaridade)}</span></div>
        <div class="modal-field"><strong>Ocupação</strong><span>${fmt(m.ocupacao)}</span></div>
      </div></div>

      <div class="modal-section"><div class="modal-section-title">📍 Contato</div><div class="modal-grid">
        <div class="modal-field" style="grid-column:1/-1;"><strong>Endereço</strong><span>${enderecoLinha}</span></div>
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

      ${doc ? `<div class="modal-section"><div class="modal-section-title">🪪 Documento</div><img src="${doc}" style="width:100%;max-height:200px;object-fit:contain;border-radius:8px;" referrerpolicy="no-referrer"></div>` : ''}
      ${m.talentos ? `<div class="modal-section"><div class="modal-section-title">🌟 Talentos</div><span style="font-size:0.88rem;">${safeText(m.talentos)}</span></div>` : ''}

      <div style="display:flex;gap:8px;margin-top:1rem;justify-content:flex-end;flex-wrap:wrap;">
        ${tel ? `<a href="https://wa.me/55${tel}" target="_blank" class="btn btn-green btn-sm" style="text-decoration:none;">💬 WhatsApp</a>` : ''}
        <button class="btn btn-ghost btn-sm" onclick="abrirEdicao(${jsString(idSeguro)});document.getElementById('modal-overlay').classList.remove('open')">✏️ Editar</button>
        <button class="btn btn-ghost btn-sm" onclick="imprimirFicha(${jsString(idSeguro)})">🖨️ Imprimir</button>
        <button class="btn btn-danger btn-sm" onclick="excluirMembro(${jsString(idSeguro)},${jsString(m.nome || '')});document.getElementById('modal-overlay').classList.remove('open')">✕ Excluir</button>
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

    const fotoAtual = safeUrl(m.foto_url);
    const docAtual = safeUrl(m.doc_url);

    if (fotoAtual) {
      pf.src = fotoAtual;
      pf.style.display = 'block';
      document.getElementById('edit-placeholder-foto').style.display = 'none';
      document.getElementById('edit-area-foto').classList.add('tem-foto');
    } else {
      pf.style.display = 'none';
      document.getElementById('edit-placeholder-foto').style.display = '';
      document.getElementById('edit-area-foto').classList.remove('tem-foto');
    }

    if (docAtual) {
      pd.src = docAtual;
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
    renderLista();

    document.getElementById('edit-overlay').classList.remove('open');
    toast('✅ Cadastro atualizado!');
  }

  window.salvarEdicao = salvarEdicao;

  function garantirModalExclusao() {
    let overlay = document.getElementById('delete-overlay');
    if (overlay) return overlay;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="overlay" id="delete-overlay" onclick="fecharOverlayClick(event,'delete-overlay')">
        <div class="modal modal-danger" role="dialog" aria-modal="true" aria-labelledby="delete-title" style="max-width:460px;">
          <div class="modal-header">
            <div>
              <div class="modal-kicker">Ação permanente</div>
              <div class="modal-nome" id="delete-title">Excluir cadastro</div>
            </div>
            <button class="btn btn-ghost btn-sm" type="button" onclick="fecharModalExclusao()" aria-label="Fechar">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <p class="delete-copy" id="delete-copy"></p>
          <div class="delete-target" id="delete-target"></div>
          <div class="delete-actions">
            <button class="btn btn-ghost" type="button" onclick="fecharModalExclusao()">Cancelar</button>
            <button class="btn btn-danger" type="button" id="btn-confirmar-exclusao">
              <i class="fa-solid fa-trash"></i> Excluir permanentemente
            </button>
          </div>
        </div>
      </div>`);

    return document.getElementById('delete-overlay');
  }

  function fecharModalExclusao() {
    document.getElementById('delete-overlay')?.classList.remove('open');
  }

  window.fecharModalExclusao = fecharModalExclusao;

  function abrirConfirmacaoExclusao(id, nome) {
    const overlay = garantirModalExclusao();
    const nomeSeguro = nome || 'este cadastro';
    document.getElementById('delete-copy').textContent = 'Esta ação remove o cadastro e tenta limpar as mídias vinculadas no Storage. Depois disso, não há desfazer.';
    document.getElementById('delete-target').textContent = nomeSeguro;
    document.getElementById('btn-confirmar-exclusao').onclick = () => excluirMembro(id, nomeSeguro, true);
    overlay.classList.add('open');
  }

  async function excluirMembro(id, nome, confirmado = false) {
    if (!confirmado) {
      abrirConfirmacaoExclusao(id, nome);
      return;
    }

    const btn = document.getElementById('btn-confirmar-exclusao');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="loading"></span> Excluindo...';
    }

    const m = membrosCache.find(x => x.id === id);
    const { error } = await db.from('membros').delete().eq('id', id);
    if (error) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir permanentemente';
      }
      toast('❌ Erro ao excluir.');
      return;
    }

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
    renderLista();
    fecharModalExclusao();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-trash"></i> Excluir permanentemente';
    }
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

    const f = v => safeText(v || '—');
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

