// Proteção contra DevTools e depuração
// Implementa múltiplas camadas de proteção contra engenharia reversa

(function() {
  'use strict';

  // Configuração
  const CONFIG = {
    enableProtection: true,
    redirectUrl: 'about:blank',
    checkInterval: 1000,
    alertUser: false,
    disableRightClick: true,
    disableShortcuts: true,
    obfuscateConsole: true,
    detectDebugger: true,
    antiTampering: true
  };

  // Estado da proteção
  const state = {
    devtoolsOpen: false,
    checksRunning: false,
    tamperDetected: false,
    originalFunctions: {},
    checksInterval: null
  };

  /**
   * Detecta se DevTools está aberto
   */
  function detectDevTools() {
    // Método 1: Diferença de tamanho da janela
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
      return true;
    }

    // Método 2: Detecção via console.log timing
    let devtoolsDetected = false;
    const before = performance.now();
    
    // Cria objeto com getter personalizado
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        devtoolsDetected = true;
        return 'devtools-detector';
      }
    });
    
    console.dir(element);
    const after = performance.now();
    
    // Se demorou muito ou getter foi chamado, DevTools está aberto
    if (devtoolsDetected || (after - before > 100)) {
      return true;
    }

    // Método 3: Verificação de debugger
    try {
      const check = function() {};
      check.toString = function() {
        devtoolsDetected = true;
        return '';
      };
      console.log('%c', check);
    } catch (e) {}

    return devtoolsDetected;
  }

  /**
   * Ação ao detectar DevTools
   */
  function onDevToolsDetected() {
    if (state.devtoolsOpen) return;
    
    state.devtoolsOpen = true;

    if (CONFIG.alertUser) {
      alert('⚠️ Ferramentas de desenvolvedor detectadas.\n\nPor questões de segurança, o acesso foi bloqueado.');
    }

    // Limpa dados sensíveis
    clearSensitiveData();

    // Redireciona ou fecha
    if (CONFIG.redirectUrl === 'close') {
      window.close();
      window.location.href = 'about:blank';
    } else if (CONFIG.redirectUrl) {
      window.location.href = CONFIG.redirectUrl;
    } else {
      // Torna a página inutilizável
      document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #1a1a1a; color: #fff; font-family: system-ui;">
          <div style="text-align: center; max-width: 500px; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
            <h1 style="font-size: 1.5rem; margin: 0 0 1rem;">Acesso Bloqueado</h1>
            <p style="color: #999; line-height: 1.6;">
              Ferramentas de desenvolvedor foram detectadas. 
              Por questões de segurança e proteção de dados, 
              o acesso foi temporariamente bloqueado.
            </p>
            <button onclick="location.reload()" style="margin-top: 2rem; padding: 0.75rem 2rem; background: #c9a84c; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              Recarregar Página
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Limpa dados sensíveis da memória
   */
  function clearSensitiveData() {
    try {
      // Limpa localStorage
      const sensitiveKeys = ['ad_bela_vista_member_session', 'admin-page-settings'];
      sensitiveKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Limpa cookies
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // Limpa variáveis globais sensíveis
      if (window.CONFIG) {
        window.CONFIG.SUPABASE_KEY = null;
      }
    } catch (e) {
      // Silenciosamente ignora erros
    }
  }

  /**
   * Desabilita clique direito
   */
  function disableRightClick() {
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);

    // Previne seleção de texto (dificulta copiar código)
    document.addEventListener('selectstart', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      return false;
    });

    // Previne arrastar e soltar
    document.addEventListener('dragstart', function(e) {
      e.preventDefault();
      return false;
    });
  }

  /**
   * Desabilita atalhos de teclado comuns
   */
  function disableKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'K') || // Firefox
        (e.metaKey && e.altKey && e.key === 'I') || // Mac
        (e.metaKey && e.altKey && e.key === 'J') || // Mac
        (e.metaKey && e.altKey && e.key === 'C') // Mac
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S (salvar fonte)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Ctrl+P (imprimir - pode revelar fonte)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }
    }, true);
  }

  /**
   * Ofusca console
   */
  function obfuscateConsole() {
    // Sobrescreve funções do console
    const noop = function() {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupEnd'];
    
    methods.forEach(method => {
      if (console[method]) {
        state.originalFunctions[method] = console[method];
        console[method] = noop;
      }
    });

    // Impede abertura do console via console.log
    Object.defineProperty(console, 'log', {
      get: function() {
        onDevToolsDetected();
        return noop;
      },
      configurable: false
    });
  }

  /**
   * Detecção de debugger
   */
  function debuggerDetection() {
    // Injeta debugger statements em loop
    setInterval(function() {
      (function() {
        return false;
      }
      ['constructor']('debugger')
      ['call']());
    }, 500);
  }

  /**
   * Anti-tampering: detecta modificação do código
   */
  function antiTampering() {
    // Calcula hash do código crítico
    const criticalCode = document.querySelector('script[src*="auth-guard"]');
    
    if (criticalCode) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' || mutation.type === 'attributes') {
            state.tamperDetected = true;
            onDevToolsDetected();
          }
        });
      });

      observer.observe(criticalCode, {
        attributes: true,
        childList: true,
        characterData: true
      });
    }

    // Detecta modificação de funções críticas
    Object.freeze(window.AuthGuard || {});
    Object.freeze(window.CONFIG || {});

    // Detecta modificação do localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      // Permite modificações legítimas do sistema
      const allowedKeys = ['admin-page-settings', 'ad_bela_vista_member_session'];
      
      if (!allowedKeys.includes(key)) {
        console.warn('Tentativa de modificação detectada');
        state.tamperDetected = true;
      }
      
      return originalSetItem.apply(this, arguments);
    };
  }

  /**
   * Detecta ferramentas de proxy/interceptação
   */
  function detectProxyTools() {
    // Detecta Fiddler, Charles, etc
    const proxyIndicators = [
      'FiddlerCore',
      'Fiddler',
      'Charles',
      'HttpWatch',
      'HttpDebugger'
    ];

    proxyIndicators.forEach(indicator => {
      if (window[indicator] || navigator.userAgent.includes(indicator)) {
        onDevToolsDetected();
      }
    });
  }

  /**
   * Proteção contra view-source
   */
  function preventViewSource() {
    // Detecta tentativa de view-source
    if (window.location.protocol === 'view-source:') {
      window.location.href = 'about:blank';
      return;
    }

    // Monitora mudanças na URL
    const originalPushState = history.pushState;
    history.pushState = function() {
      if (window.location.protocol === 'view-source:') {
        window.location.href = 'about:blank';
      }
      return originalPushState.apply(this, arguments);
    };
  }

  /**
   * Inicia verificações contínuas
   */
  function startContinuousChecks() {
    if (state.checksRunning) return;
    
    state.checksRunning = true;

    // Verifica periodicamente
    state.checksInterval = setInterval(function() {
      if (CONFIG.detectDebugger && detectDevTools()) {
        onDevToolsDetected();
      }

      if (state.tamperDetected) {
        onDevToolsDetected();
      }

      // Verifica integridade do DOM
      if (!document.querySelector('script[src*="auth-guard"]')) {
        state.tamperDetected = true;
        onDevToolsDetected();
      }
    }, CONFIG.checkInterval);

    // Adiciona verificação no unload
    window.addEventListener('beforeunload', function() {
      if (state.devtoolsOpen) {
        clearSensitiveData();
      }
    });

    // Verifica quando a janela volta ao foco
    window.addEventListener('focus', function() {
      if (CONFIG.detectDebugger && detectDevTools()) {
        onDevToolsDetected();
      }
    });

    // Verifica mudanças de tamanho da janela
    window.addEventListener('resize', function() {
      if (CONFIG.detectDebugger && detectDevTools()) {
        onDevToolsDetected();
      }
    });
  }

  /**
   * Adiciona marca d'água invisível
   */
  function addInvisibleWatermark() {
    const watermark = document.createElement('div');
    watermark.textContent = `Protected by AD Bela-Vista Security System - ${new Date().toISOString()}`;
    watermark.style.cssText = 'position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;';
    watermark.setAttribute('data-security', 'watermark');
    document.body.appendChild(watermark);
  }

  /**
   * Desabilita source maps
   */
  function disableSourceMaps() {
    // Intercepta requisições de source maps
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver(function(list) {
        list.getEntries().forEach(entry => {
          if (entry.name.endsWith('.map')) {
            // Tenta cancelar carregamento de source map
            console.warn('Source map bloqueado:', entry.name);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // Browser não suporta
      }
    }

    // Remove comentários de source maps do código
    document.querySelectorAll('script').forEach(script => {
      if (script.textContent && script.textContent.includes('//# sourceMappingURL=')) {
        script.textContent = script.textContent.replace(/\/\/# sourceMappingURL=.*/g, '');
      }
    });
  }

  /**
   * Inicializa todas as proteções
   */
  function initialize() {
    if (!CONFIG.enableProtection) {
      console.log('DevTools protection disabled');
      return;
    }

    try {
      // Proteções básicas
      if (CONFIG.disableRightClick) disableRightClick();
      if (CONFIG.disableShortcuts) disableKeyboardShortcuts();
      if (CONFIG.obfuscateConsole) obfuscateConsole();
      if (CONFIG.antiTampering) antiTampering();

      // Proteções avançadas
      preventViewSource();
      detectProxyTools();
      addInvisibleWatermark();
      disableSourceMaps();

      // Inicia detecção contínua
      startContinuousChecks();

      // Debugger detection (mais agressivo)
      if (CONFIG.detectDebugger) {
        debuggerDetection();
      }

      console.log('%c🔒 Sistema de Proteção Ativo', 'color: #c9a84c; font-weight: bold; font-size: 14px;');
      console.log('%cEste sistema é protegido contra engenharia reversa e acesso não autorizado.', 'color: #666; font-size: 12px;');

    } catch (error) {
      console.error('Erro ao inicializar proteção:', error);
    }
  }

  // Adiciona método para desabilitar temporariamente (apenas para desenvolvimento)
  window.__disableDevToolsProtection = function(password) {
    if (password === 'ad-bela-vista-dev-2026') {
      CONFIG.enableProtection = false;
      clearInterval(state.checksInterval);
      console.log('⚠️ Proteção desabilitada temporariamente');
      console.log('Para reativar, recarregue a página');
      return true;
    }
    return false;
  };

  // Inicializa imediatamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Protege contra remoção deste script
  Object.freeze(initialize);
  Object.freeze(CONFIG);

})();
