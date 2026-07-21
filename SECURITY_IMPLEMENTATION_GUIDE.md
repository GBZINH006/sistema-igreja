# 🔒 Guia de Implementação de Segurança - Sistema AD Bela-Vista

Este guia descreve como implementar o sistema completo de proteção de rotas e segurança.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação no Banco de Dados](#instalação-no-banco-de-dados)
3. [Configuração no Frontend](#configuração-no-frontend)
4. [Recursos de Segurança](#recursos-de-segurança)
5. [Testes e Verificação](#testes-e-verificação)
6. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

O sistema implementa múltiplas camadas de segurança:

### Camadas de Proteção

1. **Autenticação de Sessão**
   - Validação de tokens JWT
   - Verificação de expiração (24h)
   - Renovação automática

2. **Controle de Acesso Baseado em Funções (RBAC)**
   - Admin: acesso completo
   - Pastor: gestão e relatórios
   - Secretário: cadastros e edição
   - Membro: apenas área pessoal

3. **Rate Limiting**
   - Previne ataques de força bruta
   - Limita tentativas de login
   - Bloqueio temporário após falhas

4. **Auditoria e Logs**
   - Registra todas tentativas de acesso
   - Monitora atividades suspeitas
   - Histórico de 90 dias

5. **Proteção contra Navegação Indevida**
   - Bloqueia acesso direto por URL
   - Impede navegação via histórico
   - Redireciona automaticamente

---

## 🗄️ Instalação no Banco de Dados

### Passo 1: Executar Script SQL

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Crie uma nova query
4. Cole o conteúdo do arquivo `api/security-functions.sql`
5. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 2: Verificar Criação

Execute este SQL para verificar:

```sql
-- Verificar funções criadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'member_validate_session',
    'admin_check_permissions',
    'log_access_attempt',
    'check_rate_limit'
  );

-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('access_logs', 'rate_limit_tracker');
```

Você deve ver 4 funções e 2 tabelas criadas.

---

## 🌐 Configuração no Frontend

### Passo 1: Incluir o Script de Proteção

Adicione o script `auth-guard.js` em **TODAS as páginas HTML**, logo após o Supabase:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Configurações -->
<script src="js/config.js"></script>

<!-- ✅ ADICIONE ESTA LINHA -->
<script src="js/auth-guard.js"></script>

<!-- Scripts específicos da página -->
<script src="js/admin.js"></script>
```

### Passo 2: Adicionar Scripts de Proteção

**Proteção de Rotas + DevTools** em páginas protegidas:

```html
<!-- Sistema de Proteção -->
<script src="js/auth-guard.js"></script>
<script src="js/devtools-protection.js"></script>
```

**Apenas proteção DevTools** em páginas públicas (opcional):

```html
<!-- Proteção básica -->
<script src="js/devtools-protection.js"></script>
```

#### Páginas que precisam de AMBOS os scripts:

- ✅ `admin.html`
- ✅ `usuarios.html`
- ✅ `configuracoes.html`
- ✅ `relatorios.html`
- ✅ `indicadores.html`
- ✅ `membro.html`

#### Páginas públicas (opcional - apenas devtools-protection):

- 🔓 `cadastro.html`
- 🔓 `membro-login.html`
- 🔓 `privacidade.html`
- 🔓 `suporte.html`

### Exemplo Completo (admin.html):

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel do Pastor - AD Bela-Vista</title>
  
  <!-- CSS -->
  <link rel="stylesheet" href="css/admin.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
</head>
<body>
  <!-- Conteúdo da página -->
  
  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/config.js"></script>
  
  <!-- ✅ Proteção de Rotas -->
  <script src="js/auth-guard.js"></script>
  
  <!-- ✅ Proteção contra DevTools -->
  <script src="js/devtools-protection.js"></script>
  
  <!-- Scripts específicos -->
  <script src="js/admin.js"></script>
</body>
</html>
```

### Passo 3: Deploy com Proteção de Source Maps

#### Opção A: Build Manual

Execute o script de build antes do deploy:

```bash
# Instala Node.js (se não tiver)
# Depois execute:
node build-config.js
```

Isso criará uma pasta `/dist` com:
- Source maps removidos
- Comentários removidos
- `.htaccess` configurado

Deploy a pasta `/dist` ao invés de `/public`.

#### Opção B: Configuração do Vercel

Adicione ao `vercel.json`:

```json
{
  "buildCommand": "node build-config.js",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "**/*.map",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "null"
        }
      ]
    }
  ],
  "routes": [
    {
      "src": "^/.*\\.map$",
      "status": 404
    }
  ]
}
```

---

## 🛡️ Recursos de Segurança

### 1. Proteção contra DevTools e Engenharia Reversa

O sistema implementa múltiplas camadas:

- ✅ **Detecção de DevTools**: Identifica quando F12/console está aberto
- ✅ **Bloqueio de Source Maps**: Remove e bloqueia acesso a arquivos .map
- ✅ **Desabilita clique direito**: Impede "Inspecionar elemento"
- ✅ **Bloqueia atalhos**: F12, Ctrl+Shift+I, Ctrl+U, etc
- ✅ **Ofuscação de console**: Desabilita console.log
- ✅ **Anti-tampering**: Detecta modificação do código
- ✅ **Limpeza automática**: Remove dados sensíveis ao detectar DevTools

### 2. Validação Automática de Sessão

O sistema verifica automaticamente:

- ✅ Token de sessão válido
- ✅ Sessão não expirada (< 24h)
- ✅ Permissões necessárias para a página
- ✅ Usuário não está bloqueado

### 2. Renovação de Sessão

A cada 5 minutos, o sistema:

- Verifica se a sessão ainda é válida
- Atualiza timestamp de atividade
- Faz logout automático se expirada

### 3. Detecção de Inatividade

- Após 30 minutos sem atividade, faz logout automático
- Atividade detectada: mouse, teclado, scroll, touch

### 4. Proteção contra Navegação Indevida

```javascript
// Usuário tenta acessar admin.html sem login
// ❌ Bloqueado automaticamente
// ✅ Redirecionado para login

// Usuário logado como membro tenta acessar admin.html
// ❌ Acesso negado
// ✅ Mensagem: "Permissão insuficiente"
```

### 5. Rate Limiting

Configuração padrão:

- Máximo 10 tentativas de login
- Janela de 15 minutos
- Bloqueio de 15 minutos após exceder

### 6. Logs de Auditoria

Registra automaticamente:

- Tentativas de login (sucesso/falha)
- Acessos negados
- Sessões expiradas
- Mudanças de permissão

---

## 🧪 Testes e Verificação

### Teste 1: Acesso Não Autenticado

1. Abra o navegador **em aba anônima**
2. Tente acessar `admin.html` diretamente
3. ✅ **Esperado:** Redirecionamento automático para login

### Teste 2: Permissões Insuficientes

1. Faça login como **membro** (sem privilégios admin)
2. Tente acessar `admin.html`
3. ✅ **Esperado:** Mensagem "Acesso Restrito"

### Teste 3: Sessão Expirada

1. Faça login normalmente
2. No **DevTools**, execute:
   ```javascript
   // Simula sessão expirada
   const session = JSON.parse(localStorage.getItem('ad_bela_vista_member_session'));
   session.timestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 horas atrás
   localStorage.setItem('ad_bela_vista_member_session', JSON.stringify(session));
   ```
3. Recarregue a página
4. ✅ **Esperado:** Logout automático e redirecionamento

### Teste 4: Rate Limiting

1. Tente fazer login com senha errada **10 vezes seguidas**
2. ✅ **Esperado:** Bloqueio temporário de 15 minutos

### Teste 5: Navegação via Histórico

1. Faça login no admin
2. Faça logout
3. Pressione **← Voltar** no navegador
4. ✅ **Esperado:** Não consegue voltar para área autenticada

---

## 🔧 Manutenção

### Monitoramento de Logs

#### Ver tentativas de acesso recentes:

```sql
SELECT 
  event_type,
  user_type,
  email,
  page_accessed,
  reason,
  created_at
FROM access_logs
ORDER BY created_at DESC
LIMIT 50;
```

#### Ver tentativas falhadas nas últimas 24h:

```sql
SELECT 
  email,
  COUNT(*) as tentativas,
  MAX(created_at) as ultima_tentativa
FROM access_logs
WHERE event_type = 'login_failed'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY email
ORDER BY tentativas DESC;
```

#### Ver IPs bloqueados:

```sql
SELECT 
  identifier,
  action_type,
  request_count,
  blocked_until,
  created_at
FROM rate_limit_tracker
WHERE blocked_until IS NOT NULL
  AND blocked_until > NOW()
ORDER BY blocked_until DESC;
```

### Limpeza Automática

Execute periodicamente (ou crie um cron job):

```sql
-- Limpar logs antigos (> 90 dias)
SELECT cleanup_old_access_logs();

-- Limpar rate limits antigos (> 24h)
SELECT cleanup_old_rate_limits();
```

### Configurar Limpeza Automática (Opcional)

Crie um Edge Function no Supabase para rodar diariamente:

```javascript
// supabase/functions/cleanup-logs/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Limpa logs antigos
  await supabase.rpc('cleanup_old_access_logs')
  await supabase.rpc('cleanup_old_rate_limits')

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 🎯 Resumo de Configuração

### ✅ Checklist de Implementação

- [ ] Executar `security-functions.sql` no Supabase
- [ ] Verificar criação de funções e tabelas
- [ ] Adicionar `auth-guard.js` em todas páginas protegidas
- [ ] Testar acesso não autenticado
- [ ] Testar permissões insuficientes
- [ ] Testar sessão expirada
- [ ] Testar rate limiting
- [ ] Configurar limpeza automática (opcional)
- [ ] Monitorar logs de acesso

### 📊 Métricas de Segurança

Após implementação, você terá:

- ✅ **100% das rotas administrativas protegidas**
- ✅ **Auditoria completa de acessos**
- ✅ **Proteção contra força bruta**
- ✅ **Detecção automática de sessões inválidas**
- ✅ **Logs de segurança por 90 dias**

---

## 🆘 Suporte e Troubleshooting

### Problema: "Função não encontrada"

**Solução:** Execute novamente o arquivo `security-functions.sql` no Supabase

### Problema: "Acesso negado para todos usuários"

**Solução:** Verifique se as políticas RLS estão corretas:

```sql
-- Ver políticas da tabela profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Problema: "Rate limit muito agressivo"

**Solução:** Ajuste os parâmetros na função `check_rate_limit()`:

```javascript
// Em auth-guard.js, altere os valores padrão:
const MAX_FAILED_ATTEMPTS = 10; // Era 5
const LOCKOUT_DURATION = 10 * 60 * 1000; // Era 15 min
```

### Problema: "Logout muito frequente"

**Solução:** Aumente o timeout de inatividade:

```javascript
// Em auth-guard.js:
const SESSION_TIMEOUT = 48 * 60 * 60 * 1000; // Era 24h
```

---

## 📞 Contato

Se precisar de ajuda adicional, consulte:

- 📖 [Documentação do Supabase](https://supabase.com/docs)
- 🔒 [Melhores Práticas de Segurança](https://supabase.com/docs/guides/auth/row-level-security)
- 💬 [Comunidade Supabase](https://github.com/supabase/supabase/discussions)

---

**✅ Sistema de segurança implementado com sucesso!**

O sistema agora possui proteção robusta contra acessos não autorizados e navegação indevida.
