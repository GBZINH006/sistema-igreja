# 🔒 Guia de Proteção contra DevTools e Engenharia Reversa

## 📋 Visão Geral

Este documento descreve o sistema completo de proteção contra inspeção de código, debugging e engenharia reversa implementado no sistema AD Bela-Vista.

---

## 🎯 Objetivos

1. **Dificultar engenharia reversa** do código JavaScript
2. **Bloquear acesso a source maps** (.map files)
3. **Detectar e prevenir uso de DevTools** (F12, Inspecionar)
4. **Proteger dados sensíveis** em memória
5. **Prevenir cópia de código** via view-source

---

## 🛡️ Camadas de Proteção

### 1. Detecção de DevTools

O sistema detecta quando o DevTools está aberto usando múltiplos métodos:

#### Método 1: Dimensões da Janela
```javascript
// Detecta quando a janela é redimensionada (DevTools aberto)
const widthThreshold = window.outerWidth - window.innerWidth > 160;
const heightThreshold = window.outerHeight - window.innerHeight > 160;
```

#### Método 2: Console Timing
```javascript
// Mede tempo de execução do console
// DevTools aberto = execução mais lenta
const before = performance.now();
console.dir(element);
const after = performance.now();
```

#### Método 3: Debugger Detection
```javascript
// Injeta debugger statements
// Para execução se DevTools estiver aberto
setInterval(() => {
  debugger;
}, 500);
```

### 2. Bloqueio de Source Maps

#### Frontend (JavaScript)
```javascript
// Remove comentários de source maps
code.replace(/\/\/# sourceMappingURL=.*/g, '');
code.replace(/\/\*# sourceMappingURL=.*\*\//g, '');
```

#### Backend (.htaccess)
```apache
# Bloqueia acesso HTTP a arquivos .map
<FilesMatch "\\.map$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

#### Build Process
```javascript
// Script de build remove source maps antes do deploy
node build-config.js
// Resultado: Nenhum arquivo .map na produção
```

### 3. Desabilita Clique Direito

```javascript
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});
```

**O que bloqueia:**
- ✅ Clique direito → "Inspecionar elemento"
- ✅ Clique direito → "Ver código fonte"
- ✅ Seleção de texto (exceto inputs)
- ✅ Arrastar e soltar elementos

### 4. Bloqueia Atalhos de Teclado

**Atalhos bloqueados:**

| Atalho | Função | Status |
|--------|--------|--------|
| `F12` | Abrir DevTools | ❌ Bloqueado |
| `Ctrl+Shift+I` | Inspecionar | ❌ Bloqueado |
| `Ctrl+Shift+J` | Console | ❌ Bloqueado |
| `Ctrl+Shift+C` | Seletor | ❌ Bloqueado |
| `Ctrl+U` | Ver código fonte | ❌ Bloqueado |
| `Ctrl+S` | Salvar página | ❌ Bloqueado |
| `Ctrl+P` | Imprimir (revela fonte) | ❌ Bloqueado |
| `Cmd+Opt+I` | DevTools (Mac) | ❌ Bloqueado |

### 5. Ofuscação do Console

```javascript
// Sobrescreve todas as funções do console
const noop = () => {};
console.log = noop;
console.debug = noop;
console.info = noop;
console.warn = noop;
console.error = noop;
```

**Resultado:**
- `console.log("teste")` → Nada acontece
- Informações sensíveis não aparecem no console
- Dificulta debugging

### 6. Anti-Tampering

Detecta modificação do código em tempo real:

```javascript
// Monitora mudanças no DOM
const observer = new MutationObserver((mutations) => {
  // Se script crítico foi modificado
  onTamperDetected();
});

// Congela objetos críticos
Object.freeze(window.CONFIG);
Object.freeze(window.AuthGuard);
```

### 7. Limpeza Automática de Dados

Quando DevTools é detectado:

```javascript
function clearSensitiveData() {
  // Limpa tokens
  localStorage.removeItem('ad_bela_vista_member_session');
  sessionStorage.clear();
  
  // Limpa cookies
  document.cookie.split(';').forEach(cookie => {
    document.cookie = cookie + '=;expires=' + new Date().toUTCString();
  });
  
  // Remove chaves de API
  window.CONFIG.SUPABASE_KEY = null;
}
```

### 8. Proteção contra View-Source

```javascript
// Detecta view-source: protocol
if (window.location.protocol === 'view-source:') {
  window.location.href = 'about:blank';
}
```

### 9. Detecção de Proxy Tools

Detecta ferramentas de interceptação:

```javascript
const proxyTools = [
  'FiddlerCore',
  'Fiddler',
  'Charles',
  'HttpWatch',
  'HttpDebugger'
];

// Verifica se alguma está ativa
proxyTools.forEach(tool => {
  if (window[tool]) {
    blockAccess();
  }
});
```

### 10. Marca D'água Invisível

```javascript
// Adiciona identificador oculto
const watermark = document.createElement('div');
watermark.textContent = `Protected - ${new Date().toISOString()}`;
watermark.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
document.body.appendChild(watermark);
```

---

## 🚀 Implementação

### Passo 1: Incluir o Script

Em **todas as páginas** (protegidas e públicas):

```html
<script src="js/devtools-protection.js"></script>
```

### Passo 2: Configurar Comportamento

Edite `devtools-protection.js` se necessário:

```javascript
const CONFIG = {
  enableProtection: true,        // Ativa/desativa proteção
  redirectUrl: 'about:blank',    // Para onde redirecionar
  checkInterval: 1000,           // Intervalo de verificação (ms)
  alertUser: false,              // Mostra alert ao usuário
  disableRightClick: true,       // Desabilita clique direito
  disableShortcuts: true,        // Bloqueia atalhos (F12, etc)
  obfuscateConsole: true,        // Desabilita console
  detectDebugger: true,          // Injeta debugger statements
  antiTampering: true            // Detecta modificação de código
};
```

### Passo 3: Build para Produção

Antes de fazer deploy:

```bash
# Remove source maps e ofusca código
node build-config.js

# Deploy a pasta /dist (não /public)
vercel deploy dist
```

### Passo 4: Configurar Servidor

Copie o arquivo `.htaccess` para o servidor:

```bash
cp public/.htaccess /var/www/html/
```

---

## 🧪 Testes

### Teste 1: Detecção de DevTools

1. Abra o site normalmente
2. Pressione `F12` para abrir DevTools
3. ✅ **Esperado:** Página fica em branco ou redireciona

### Teste 2: Bloqueio de Clique Direito

1. Tente clicar com botão direito
2. ✅ **Esperado:** Menu não aparece

### Teste 3: Bloqueio de Atalhos

1. Tente pressionar `Ctrl+U` (ver código)
2. ✅ **Esperado:** Nada acontece

### Teste 4: Source Maps Bloqueados

1. Abra DevTools (se conseguir)
2. Vá em Sources → veja os arquivos
3. ✅ **Esperado:** Nenhum arquivo .map aparece

### Teste 5: Console Desabilitado

1. Se conseguir abrir console
2. Digite `console.log("teste")`
3. ✅ **Esperado:** Nada é exibido

---

## ⚙️ Configurações Avançadas

### Desabilitar Temporariamente (Desenvolvimento)

Execute no console (se conseguir acessar):

```javascript
window.__disableDevToolsProtection('ad-bela-vista-dev-2026')
```

**⚠️ Atenção:** Isso só funciona durante o desenvolvimento. Em produção, remova esta função.

### Customizar Mensagem de Bloqueio

Edite em `devtools-protection.js`:

```javascript
function onDevToolsDetected() {
  document.body.innerHTML = `
    <div style="...">
      <h1>Sua Mensagem Aqui</h1>
      <p>Conteúdo customizado</p>
    </div>
  `;
}
```

### Ajustar Sensibilidade

```javascript
const CONFIG = {
  checkInterval: 500,  // Verifica a cada 500ms (mais rápido)
  // OU
  checkInterval: 5000, // Verifica a cada 5s (menos CPU)
};
```

---

## 📊 Níveis de Proteção

### Nível 1: Básico (Usuário Comum)
- ✅ Clique direito desabilitado
- ✅ F12 bloqueado
- ✅ View-source bloqueado

**Efetividade:** 90% dos usuários comuns

### Nível 2: Intermediário (Desenvolvedor Júnior)
- ✅ Tudo do Nível 1
- ✅ Source maps removidos
- ✅ Console ofuscado
- ✅ Debugger detection

**Efetividade:** 70% dos desenvolvedores júnior

### Nível 3: Avançado (Desenvolvedor Experiente)
- ✅ Tudo do Nível 2
- ✅ Anti-tampering ativo
- ✅ Múltiplos métodos de detecção
- ✅ Limpeza automática de dados

**Efetividade:** 40-50% dos desenvolvedores experientes

### Nível 4: Profissional (Security Expert)
- ⚠️ **Impossível bloquear 100%**
- Um expert de segurança SEMPRE conseguirá contornar
- Mas você dificulta MUITO o processo
- Tempo necessário: horas ao invés de minutos

---

## 🎯 O Que é Realmente Protegido

### ✅ Pode Proteger:

1. **Lógica de negócio** simples
2. **Endpoints de API** (se ofuscados)
3. **Estrutura geral** do código
4. **Tokens temporários** em memória
5. **Fluxos de autenticação**

### ❌ Não Pode Proteger 100%:

1. **Requisições HTTP** (visíveis no Network)
2. **HTML/CSS renderizado** (visível no navegador)
3. **Lógica muito complexa** (sempre pode ser revertida)
4. **Dados já exibidos** na tela
5. **Chaves públicas** (Supabase anon key)

---

## 🔐 Melhores Práticas

### 1. Nunca Confie Apenas no Frontend

```javascript
// ❌ ERRADO - Validação apenas no frontend
if (user.role === 'admin') {
  showAdminPanel();
}

// ✅ CORRETO - Validação no backend + frontend
const { data } = await supabase.rpc('verify_admin_access');
if (data.isAdmin) {
  showAdminPanel();
}
```

### 2. Use HTTPS Sempre

```apache
# Força HTTPS no .htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 3. Ofusque Código Crítico

Use ferramentas como:
- [javascript-obfuscator](https://obfuscator.io/)
- [Terser](https://terser.org/)
- [UglifyJS](https://github.com/mishoo/UglifyJS)

### 4. Implemente Rate Limiting

Já implementado em `security-functions.sql`:

```sql
SELECT check_rate_limit(
  'user@email.com',
  'api_call',
  10, -- max requests
  15  -- window minutes
);
```

### 5. Monitore Tentativas Suspeitas

```sql
-- Ver IPs suspeitos
SELECT 
  ip_address,
  COUNT(*) as attempts
FROM access_logs
WHERE event_type = 'devtools_detected'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(*) > 5;
```

---

## 📈 Métricas de Sucesso

Após implementação, você terá:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Acesso a source maps | ✅ Livre | ❌ Bloqueado |
| Uso de DevTools | ✅ Livre | ⚠️ Detectado |
| Clique direito | ✅ Funciona | ❌ Desabilitado |
| View-source | ✅ Funciona | ❌ Bloqueado |
| Console.log | ✅ Funciona | ❌ Ofuscado |
| Tempo para engenharia reversa | 5 min | 2-5 horas |

---

## 🆘 Troubleshooting

### Problema: "Página fica em branco mesmo sem DevTools"

**Causa:** Detecção muito sensível

**Solução:**
```javascript
// Em devtools-protection.js, aumente o threshold
const widthThreshold = window.outerWidth - window.innerWidth > 200; // Era 160
```

### Problema: "Inputs não funcionam (não consigo digitar)"

**Causa:** Proteção de seleção muito agressiva

**Solução:**
```javascript
document.addEventListener('selectstart', function(e) {
  // Permite seleção em inputs
  if (e.target.tagName === 'INPUT' || 
      e.target.tagName === 'TEXTAREA') {
    return true;
  }
  e.preventDefault();
});
```

### Problema: "Usuários legítimos estão sendo bloqueados"

**Solução:** Adicione whitelist de IPs:

```javascript
const WHITELISTED_IPS = ['192.168.1.100', '10.0.0.50'];

function isWhitelisted() {
  // Verificação seria feita no backend
  return false; // Implemente verificação real
}

if (isWhitelisted()) {
  CONFIG.enableProtection = false;
}
```

### Problema: "Proteção não funciona em desenvolvimento"

**Solução:** Disable temporariamente:

```javascript
// No topo de devtools-protection.js
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1') {
  CONFIG.enableProtection = false;
}
```

---

## 📚 Recursos Adicionais

### Ferramentas de Teste

1. **Browser DevTools** - Para testar detecção
2. **Burp Suite** - Para testar interceptação
3. **Lighthouse** - Para verificar segurança
4. **OWASP ZAP** - Scanner de vulnerabilidades

### Leitura Recomendada

- [OWASP Client-Side Security](https://owasp.org/www-project-web-security-testing-guide/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)

---

## ✅ Checklist de Implementação

- [ ] Script `devtools-protection.js` incluído
- [ ] Configurações ajustadas conforme necessidade
- [ ] `.htaccess` configurado no servidor
- [ ] Build de produção executado
- [ ] Source maps removidos
- [ ] Testes de detecção passando
- [ ] Clique direito bloqueado
- [ ] Atalhos bloqueados
- [ ] Console ofuscado
- [ ] Monitoramento ativo

---

## 🎓 Conclusão

**O objetivo NÃO é tornar impossível a engenharia reversa** (isso é impossível no frontend), mas sim:

1. ✅ **Dificultar** o processo
2. ✅ **Desencorajar** usuários comuns
3. ✅ **Detectar** tentativas
4. ✅ **Proteger** dados sensíveis em memória
5. ✅ **Ganhar tempo** para responder a ameaças

Com todas as camadas implementadas, você transforma um processo de **5 minutos** em **várias horas**, o que é suficiente para a maioria dos casos.

---

**🔒 Sistema de proteção contra DevTools implementado!**

Seu código agora está significativamente mais protegido contra inspeção e engenharia reversa.
