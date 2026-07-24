// Configurações globais do sistema
(function() {
  'use strict';
  
  // Ofusca a chave para dificultar acesso direto no DevTools
  const parts = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoaXhxZ2ttY2phYmJ6aWRhZGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMjE1NjAsImV4cCI6MjA5ODg5NzU2MH0',
    'JEiUSKtP5-Gs4y-oo44NEvFnmjnVyoEfRYJhRcwuNkA'
  ];
  
  Object.defineProperty(window, 'CONFIG', {
    value: Object.freeze({
      SUPABASE_URL: 'https://zhixqgkmcjabbzidadeg.supabase.co',
      SUPABASE_KEY: parts.join('.'),
      PRIVACY_POLICY_VERSION: '2026-07-15'
    }),
    writable: false,
    configurable: false
  });
})();
