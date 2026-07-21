/**
 * Supabase Client Singleton
 * Garante que apenas uma instância do cliente seja criada
 * Evita o warning "Multiple GoTrueClient instances detected"
 */

(function() {
  'use strict';

  // Verifica se já existe uma instância
  if (window._supabaseClientInstance) {
    console.warn('Supabase client singleton já foi inicializado.');
    return;
  }

  // Valida configuração
  if (!window.CONFIG?.SUPABASE_URL || !window.CONFIG?.SUPABASE_KEY) {
    console.error('Configuração do Supabase não encontrada. Certifique-se de que config.js foi carregado.');
    return;
  }

  // Valida biblioteca Supabase
  if (!window.supabase?.createClient) {
    console.error('Biblioteca @supabase/supabase-js não encontrada. Adicione o script CDN.');
    return;
  }

  /**
   * Cria instância única do cliente Supabase
   * @type {import('@supabase/supabase-js').SupabaseClient}
   */
  const client = window.supabase.createClient(
    window.CONFIG.SUPABASE_URL,
    window.CONFIG.SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'ad-bela-vista-web'
        }
      }
    }
  );

  // Expõe instância globalmente (singleton)
  Object.defineProperty(window, '_supabaseClientInstance', {
    value: client,
    writable: false,
    configurable: false,
    enumerable: true
  });

  // Alias para compatibilidade com código legado
  Object.defineProperty(window, 'db', {
    get: function() {
      return window._supabaseClientInstance;
    },
    configurable: false,
    enumerable: true
  });

  console.info('✅ Supabase client singleton inicializado');

  /**
   * Helper: Obtém cliente Supabase (sempre retorna o singleton)
   * @returns {import('@supabase/supabase-js').SupabaseClient}
   */
  window.getSupabaseClient = function() {
    return window._supabaseClientInstance;
  };

})();
