// Sistema de proteção de rotas e autenticação
// Implementa verificação de sessão, controle de acesso e segurança

(function () {
  const { createClient } = window.supabase;
  const db = createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_KEY);

  // Constantes de configuração
  const MEMBER_SESSION_KEY = 'ad_bela_vista_member_session';
  const ADMIN_SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

  // Mapeamento de rotas protegidas e suas permissões necessárias
  const PROTECTED_ROUTES = {
    'admin.html': {
      roles: ['admin', 'pastor', 'secretario'],
      requireAuth: true,
      type: 'admin'
    },
    'usuarios.html': {
      roles: ['admin', 'secretario'],
      requireAuth: true,
      type: 'admin'
    },
    'configuracoes.html': {
      roles: ['admin', 'pastor', 'secretario'],
      requireAuth: true,
      type: 'admin'
    },
    'relatorios.html': {
      roles: ['admin', 'pastor', 'secretario'],
      requireAuth: true,
      type: 'admin'
    },
    'indicadores.html': {
      roles: ['admin', 'pastor', 'secretario'],
      requireAuth: true,
      type: 'admin'
    },
    'membro.html': {
      requireAuth: true,
      type: 'member'
    }
  };

  // Rotas públicas que não requerem autenticação
  const PUBLIC_ROUTES = [
    'cadastro.html',
    'membro-login.html',
    'privacidade.html',
    'suporte.html',
    'index.html',
    ''
  ];

  // Estado do sistema de segurança
  const SecurityState = {
    failedAttempts: {},
    lockedAccounts: {},
    sessionCheckTimer: null,
    lastActivity: Date.now()
  };

  /**
   * Obtém a página atual do navegador
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  }

  /**
   * Verifica se a rota atual é pública
   */
  function isPublicRoute() {
    const currentPage = getCurrentPage();
    return PUBLIC_ROUTES.includes(currentPage);
  }

  /**
   * Obtém configuração da rota protegida
   */
  function getRouteConfig() {
    const currentPage = getCurrentPage();
    return PROTECTED_ROUTES[currentPage] || null;
  }

  /**
   * Verifica se o IP está bloqueado por tentativas excessivas
   */
  function isLocked(identifier) {
    const lockInfo = SecurityState.lockedAccounts[identifier];
    if (!lockInfo) return false;

    const elapsed = Date.now() - lockInfo.lockedAt;
    if (elapsed > LOCKOUT_DURATION) {
      delete SecurityState.lockedAccounts[identifier];
      delete SecurityState.failedAttempts[identifier];
      return false;
    }

    return true;
  }

  /**
   * Registra tentativa de acesso falhada
   */
  function recordFailedAttempt(identifier) {
    if (!SecurityState.failedAttempts[identifier]) {
      SecurityState.failedAttempts[identifier] = {
        count: 0,
        firstAttempt: Date.now()
      };
    }

    SecurityState.failedAttempts[identifier].count += 1;

    if (SecurityState.failedAttempts[identifier].count >= MAX_FAILED_ATTEMPTS) {
      SecurityState.lockedAccounts[identifier] = {
        lockedAt: Date.now(),
        reason: 'Muitas tentativas de acesso falhadas'
      };
      return true; // Retorna true se foi bloqueado
    }

    return false;
  }

  /**
   * Limpa tentativas falhadas após sucesso
   */
  function clearFailedAttempts(identifier) {
    delete SecurityState.failedAttempts[identifier];
    delete SecurityState.lockedAccounts[identifier];
  }

  /**
   * Valida sessão de membro
   */
  async function validateMemberSession() {
    try {
      const sessionData = sessionStorage.getItem(MEMBER_SESSION_KEY) || 
                         localStorage.getItem(MEMBER_SESSION_KEY);

      if (!sessionData) {
        return { valid: false, reason: 'no_session' };
      }

      const session = JSON.parse(sessionData);
      
      if (!session.token || !session.accountId) {
        return { valid: false, reason: 'invalid_session' };
      }

      // Verifica se a sessão expirou
      if (session.timestamp) {
        const elapsed = Date.now() - session.timestamp;
        if (elapsed > SESSION_TIMEOUT) {
          return { valid: false, reason: 'session_expired' };
        }
      }

      // Valida token com o servidor
      const { data, error } = await db.rpc('member_validate_session', {
        p_session_token: session.token
      });

      if (error || !data?.[0]?.valid) {
        return { valid: false, reason: 'invalid_token' };
      }

      // Atualiza timestamp da sessão
      session.timestamp = Date.now();
      const storage = sessionStorage.getItem(MEMBER_SESSION_KEY) ? sessionStorage : localStorage;
      storage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));

      return { 
        valid: true, 
        session: session,
        data: data[0]
      };

    } catch (error) {
      console.warn('Erro ao validar sessão:', error);
      return { valid: false, reason: 'validation_error' };
    }
  }

  /**
   * Valida sessão de administrador
   */
  async function validateAdminSession(requiredRoles = []) {
    try {
      const { data: { session }, error } = await db.auth.getSession();

      if (error || !session) {
        return { valid: false, reason: 'no_session' };
      }

      // Busca perfil do usuário
      const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        return { valid: false, reason: 'profile_not_found' };
      }

      // Verifica se o usuário tem permissão necessária
      if (requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
        return { 
          valid: false, 
          reason: 'insufficient_permissions',
          userRole: profile.role,
          requiredRoles: requiredRoles
        };
      }

      return { 
        valid: true, 
        session: session,
        role: profile.role
      };

    } catch (error) {
      console.warn('Erro ao validar sessão admin:', error);
      return { valid: false, reason: 'validation_error' };
    }
  }

  /**
   * Limpa sessão e redireciona
   */
  function clearSessionAndRedirect(type = 'member', reason = '') {
    if (type === 'member') {
      localStorage.removeItem(MEMBER_SESSION_KEY);
      sessionStorage.removeItem(MEMBER_SESSION_KEY);
      
      const redirectUrl = 'membro-login.html' + (reason ? `?error=${encodeURIComponent(reason)}` : '');
      window.location.replace(redirectUrl);
    } else {
      db.auth.signOut().then(() => {
        const currentPage = getCurrentPage();
        if (currentPage !== 'index.html' && currentPage !== '') {
          window.location.replace('admin.html?error=session_expired');
        }
      });
    }
  }

  /**
   * Verifica proteção da rota atual
   */
  async function checkRouteProtection() {
    // Se for rota pública, permite acesso
    if (isPublicRoute()) {
      return { allowed: true };
    }

    const routeConfig = getRouteConfig();

    // Se não há configuração, assume que é protegida (segurança por padrão)
    if (!routeConfig) {
      console.warn('Rota sem configuração de segurança:', getCurrentPage());
      return { allowed: false, reason: 'unconfigured_route' };
    }

    // Verifica autenticação baseada no tipo
    if (routeConfig.type === 'member') {
      const validation = await validateMemberSession();
      
      if (!validation.valid) {
        clearSessionAndRedirect('member', validation.reason);
        return { allowed: false, reason: validation.reason };
      }

      return { allowed: true, session: validation.session };
    }

    if (routeConfig.type === 'admin') {
      const validation = await validateAdminSession(routeConfig.roles || []);
      
      if (!validation.valid) {
        if (validation.reason === 'insufficient_permissions') {
          // Usuário autenticado mas sem permissão
          showAccessDeniedMessage(validation);
          return { allowed: false, reason: 'access_denied' };
        }
        
        clearSessionAndRedirect('admin', validation.reason);
        return { allowed: false, reason: validation.reason };
      }

      return { allowed: true, session: validation.session, role: validation.role };
    }

    return { allowed: false, reason: 'unknown_route_type' };
  }

  /**
   * Mostra mensagem de acesso negado
   */
  function showAccessDeniedMessage(validation) {
    document.body.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="background: white; padding: 3rem; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px;">
          <div style="width: 80px; height: 80px; background: #fee; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
            <i class="fa-solid fa-shield-halved" style="font-size: 2.5rem; color: #dc2626;"></i>
          </div>
          <h1 style="font-size: 1.75rem; font-weight: 700; color: #1a1a1a; margin: 0 0 1rem;">Acesso Restrito</h1>
          <p style="color: #666; line-height: 1.6; margin: 0 0 1.5rem;">
            Você não tem permissão para acessar esta página. Esta área é exclusiva para administradores autorizados.
          </p>
          <div style="background: #fef3c7; border: 1px solid #fde047; border-radius: 8px; padding: 1rem; margin: 1rem 0; font-size: 0.875rem;">
            <strong style="color: #92400e;">Seu perfil:</strong> 
            <span style="color: #78350f;">${validation.userRole || 'Desconhecido'}</span><br>
            <strong style="color: #92400e;">Acesso necessário:</strong> 
            <span style="color: #78350f;">${validation.requiredRoles?.join(', ') || 'Não especificado'}</span>
          </div>
          <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
            <button onclick="window.history.back()" style="padding: 0.75rem 1.5rem; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              <i class="fa-solid fa-arrow-left"></i> Voltar
            </button>
            <button onclick="window.location.href='admin.html'" style="padding: 0.75rem 1.5rem; background: #c9a84c; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              <i class="fa-solid fa-home"></i> Início
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Mostra tela de carregamento durante verificação
   */
  function showLoadingScreen() {
    const loader = document.createElement('div');
    loader.id = 'auth-guard-loader';
    loader.innerHTML = `
      <div style="position: fixed; inset: 0; background: white; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999;">
        <div style="text-align: center;">
          <div style="width: 60px; height: 60px; border: 4px solid #f3f4f6; border-top-color: #c9a84c; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
          <p style="color: #6b7280; font-size: 0.875rem;">Verificando acesso...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loader);
  }

  /**
   * Remove tela de carregamento
   */
  function hideLoadingScreen() {
    const loader = document.getElementById('auth-guard-loader');
    if (loader) {
      loader.remove();
    }
  }

  /**
   * Inicia monitoramento de atividade
   */
  function startActivityMonitoring() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      SecurityState.lastActivity = Date.now();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  /**
   * Verifica inatividade e renova sessão
   */
  function startSessionCheck() {
    if (SecurityState.sessionCheckTimer) {
      clearInterval(SecurityState.sessionCheckTimer);
    }

    SecurityState.sessionCheckTimer = setInterval(async () => {
      const inactive = Date.now() - SecurityState.lastActivity;
      
      // Se inativo por mais de 30 minutos, faz logout
      if (inactive > 30 * 60 * 1000) {
        const routeConfig = getRouteConfig();
        if (routeConfig) {
          clearSessionAndRedirect(routeConfig.type, 'inactivity_timeout');
        }
        return;
      }

      // Verifica se sessão ainda é válida
      const routeConfig = getRouteConfig();
      if (!routeConfig) return;

      if (routeConfig.type === 'member') {
        const validation = await validateMemberSession();
        if (!validation.valid) {
          clearSessionAndRedirect('member', validation.reason);
        }
      } else if (routeConfig.type === 'admin') {
        const validation = await validateAdminSession(routeConfig.roles || []);
        if (!validation.valid) {
          clearSessionAndRedirect('admin', validation.reason);
        }
      }
    }, ADMIN_SESSION_CHECK_INTERVAL);
  }

  /**
   * Previne navegação usando histórico para páginas protegidas
   */
  function preventBackNavigation() {
    window.history.pushState(null, '', window.location.href);
    
    window.addEventListener('popstate', function () {
      window.history.pushState(null, '', window.location.href);
      
      // Verifica se ainda está autenticado
      checkRouteProtection().then(result => {
        if (!result.allowed) {
          // Se não, será redirecionado automaticamente
          return;
        }
      });
    });
  }

  /**
   * Adiciona cabeçalhos de segurança às requisições
   */
  function setupSecurityHeaders() {
    // Intercepta fetch para adicionar headers de segurança
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const [url, config = {}] = args;
      
      // Adiciona headers de segurança
      config.headers = {
        ...config.headers,
        'X-Requested-With': 'XMLHttpRequest',
        'X-Content-Type-Options': 'nosniff'
      };

      return originalFetch(url, config);
    };
  }

  /**
   * Inicializa o sistema de proteção de rotas
   */
  async function initializeAuthGuard() {
    // Mostra loading
    showLoadingScreen();

    try {
      // Verifica proteção da rota
      const result = await checkRouteProtection();

      if (result.allowed) {
        // Inicia monitoramento de segurança
        startActivityMonitoring();
        startSessionCheck();
        preventBackNavigation();
        setupSecurityHeaders();

        // Expõe funções úteis globalmente
        window.AuthGuard = {
          checkAccess: checkRouteProtection,
          validateSession: function() {
            const routeConfig = getRouteConfig();
            if (routeConfig?.type === 'member') {
              return validateMemberSession();
            } else if (routeConfig?.type === 'admin') {
              return validateAdminSession(routeConfig.roles);
            }
            return Promise.resolve({ valid: false });
          },
          clearSession: function() {
            const routeConfig = getRouteConfig();
            clearSessionAndRedirect(routeConfig?.type || 'member');
          },
          isLocked: isLocked,
          recordFailedAttempt: recordFailedAttempt,
          clearFailedAttempts: clearFailedAttempts
        };

        console.log('✅ Sistema de proteção de rotas inicializado');
      }
    } catch (error) {
      console.error('Erro ao inicializar proteção de rotas:', error);
      // Em caso de erro, assume que não é seguro e bloqueia
      if (!isPublicRoute()) {
        showAccessDeniedMessage({ userRole: 'Erro', requiredRoles: ['Verificação necessária'] });
      }
    } finally {
      hideLoadingScreen();
    }
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthGuard);
  } else {
    initializeAuthGuard();
  }

})();
