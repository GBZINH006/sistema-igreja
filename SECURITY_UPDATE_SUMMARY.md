# 🔒 Atualização de Segurança - Sistema Igreja AD Bela-Vista

## ✅ O QUE FOI CORRIGIDO

### 1. Sistema de Links Temporários de Cadastro
- **Localização**: Botão "Gerar Link" adicionado no header de `admin.html`
- **Funcionalidade**: 
  - Secretários podem gerar links temporários (válidos por 2 horas)
  - Link copiado pode ser enviado via WhatsApp para membros
  - Modal mostra todos os links ativos com countdown em tempo real
  - Links podem ser revogados manualmente
  - Links expiram automaticamente após 2 horas ou após uso

### 2. Singleton Pattern do Supabase
- **Problema resolvido**: Múltiplas instâncias do GoTrueClient causavam conflitos
- **Solução**: Arquivo `public/js/supabase-client.js` criado com singleton
- **Arquivos atualizados**: Todos os arquivos JS agora usam a mesma instância

### 3. Scripts de Segurança Corrigidos em TODOS os HTML

#### Páginas Administrativas (COM auth-guard.js):
✅ `public/pages/admin.html`
✅ `public/pages/usuarios.html`
✅ `public/pages/superadmin.html`
✅ `public/pages/relatorios.html`
✅ `public/pages/indicadores.html`
✅ `public/pages/configuracoes.html`

**Ordem correta dos scripts:**
```html
<script src="../js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>
<script src="../js/auth-guard.js"></script>
<script src="../js/devtools-protection.js"></script>
<script src="../js/admin-pages.js"></script> <!-- ou admin.js -->
```

#### Páginas Públicas/Membros (SEM auth-guard.js):
✅ `public/pages/cadastro.html`
✅ `public/pages/membro-login.html`
✅ `public/pages/membro.html`
✅ `public/index.html`
✅ `public/pages/privacidade.html`
✅ `public/pages/suporte.html`

**Ordem correta dos scripts:**
```html
<script src="../js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>
<script src="../js/devtools-protection.js"></script>
<script src="../js/cadastro.js"></script> <!-- ou membro-login.js, membro.js -->
```

### 4. Erro CORS da API do IBGE Corrigido
- **Problema**: Espaço na URL causava erro de CORS
- **Corrigido em**: `public/js/cadastro.js`
- **Antes**: `api /v1/localidades`
- **Depois**: `api/v1/localidades`

---

## ⚠️ IMPORTANTE: VOCÊ PRECISA EXECUTAR OS SQL NO SUPABASE

Antes de testar o sistema, você **DEVE** executar 3 arquivos SQL no Supabase SQL Editor:

### Passo 1: Acesse o Supabase SQL Editor
1. Entre em: https://supabase.com/dashboard/project/zhixqgkmcjabbzidadeg/sql
2. Clique em "New Query"

### Passo 2: Execute os arquivos SQL NA ORDEM:

#### 1️⃣ Primeiro: `api/security-functions.sql`
```sql
-- Copie TODO o conteúdo do arquivo api/security-functions.sql
-- Cole no SQL Editor e clique em "Run"
```
**O que faz**: Cria funções de segurança (is_admin, is_superadmin, check_user_role)

#### 2️⃣ Segundo: `api/registration-tokens.sql`
```sql
-- Copie TODO o conteúdo do arquivo api/registration-tokens.sql
-- Cole no SQL Editor e clique em "Run"
```
**O que faz**: Cria tabela e funções para tokens de registro temporário

#### 3️⃣ Terceiro: `api/admin-functions.sql`
```sql
-- Copie TODO o conteúdo do arquivo api/admin-functions.sql
-- Cole no SQL Editor e clique em "Run"
```
**O que faz**: Cria funções admin (admin_upsert_user_role, admin_list_auth_users, admin_remove_user)

---

## 🧪 COMO TESTAR

### Teste 1: Link de Cadastro Temporário
1. Faça login como secretário em `admin.html`
2. Clique no botão "Gerar Link" no header
3. No modal, clique em "Gerar Novo Link"
4. Copie o link gerado
5. Abra o link em outra aba (modo anônimo/private)
6. Você verá um banner amarelo com countdown de 2 horas
7. Preencha e envie o cadastro
8. Volte ao admin e veja que o token foi marcado como "usado"

### Teste 2: Segurança das Páginas Admin
1. Abra qualquer página admin sem estar logado
2. Você deve ser redirecionado para `admin-login.html`
3. Faça login e acesse novamente - deve funcionar

### Teste 3: Múltiplas Instâncias Supabase (RESOLVIDO)
1. Abra o Console do navegador (F12)
2. Navegue entre páginas admin
3. **NÃO** deve aparecer o warning: "Multiple GoTrueClient instances detected"

### Teste 4: IBGE API (RESOLVIDO)
1. Acesse `cadastro.html`
2. Preencha o formulário até a seção de endereço
3. A lista de Estados deve carregar corretamente
4. **NÃO** deve aparecer erro de CORS no console

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### Novos Arquivos:
- ✨ `public/js/supabase-client.js` - Singleton do Supabase
- ✨ `api/admin-functions.sql` - Funções admin (DEVE SER EXECUTADO)

### Arquivos Modificados:
#### JavaScript:
- `public/js/admin.js` - Adicionadas funções de geração de links
- `public/js/admin-pages.js` - Usando singleton
- `public/js/auth-guard.js` - Usando singleton
- `public/js/cadastro.js` - Usando singleton + correção CORS
- `public/js/membro-login.js` - Usando singleton
- `public/js/membro.js` - Usando singleton
- `public/js/superadmin.js` - Usando singleton

#### HTML (Scripts de segurança corrigidos):
- `public/pages/admin.html` - Modal de links + scripts corretos
- `public/pages/usuarios.html` - Scripts corretos
- `public/pages/superadmin.html` - Scripts corretos
- `public/pages/relatorios.html` - Scripts corretos
- `public/pages/indicadores.html` - Scripts corretos
- `public/pages/configuracoes.html` - Scripts corretos
- `public/pages/cadastro.html` - Scripts corretos (SEM auth-guard)
- `public/pages/membro-login.html` - Scripts corretos (SEM auth-guard)
- `public/pages/membro.html` - Scripts corretos (SEM auth-guard)
- `public/index.html` - Scripts corretos
- `public/pages/privacidade.html` - Scripts corretos
- `public/pages/suporte.html` - Scripts corretos

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ **EXECUTE OS 3 ARQUIVOS SQL** (veja seção acima)
2. ✅ Faça commit das mudanças:
   ```bash
   git add .
   git commit -m "fix: corrige segurança, adiciona links temporários e resolve singleton"
   git push
   ```
3. ✅ Vercel fará deploy automático
4. ✅ Teste todas as funcionalidades conforme instruções acima

---

## 🛡️ SEGURANÇA IMPLEMENTADA

### Níveis de Proteção:
1. **Auth Guard** - Bloqueia acesso não autenticado às páginas admin
2. **DevTools Protection** - Dificulta inspeção do código no navegador
3. **RLS (Row Level Security)** - Políticas de acesso no Supabase
4. **Tokens Temporários** - Links de cadastro expiram em 2 horas
5. **Singleton Pattern** - Previne conflitos de autenticação

### Páginas Protegidas:
- ✅ `/pages/admin.html` - Requer login como admin/secretary
- ✅ `/pages/usuarios.html` - Requer login como admin/secretary
- ✅ `/pages/superadmin.html` - Requer login como superadmin
- ✅ `/pages/relatorios.html` - Requer login como admin/secretary
- ✅ `/pages/indicadores.html` - Requer login como admin/secretary
- ✅ `/pages/configuracoes.html` - Requer login como admin/secretary

### Páginas Públicas (SEM proteção):
- ✅ `/index.html` - Página inicial
- ✅ `/pages/cadastro.html` - Formulário de cadastro
- ✅ `/pages/membro-login.html` - Login de membros
- ✅ `/pages/membro.html` - Portal do membro (requer login de membro)
- ✅ `/pages/privacidade.html` - Termos de privacidade
- ✅ `/pages/suporte.html` - Manual do sistema

---

## ❓ DÚVIDAS COMUNS

**P: Por que o erro "admin_upsert_user_role" ainda aparece?**
R: Você precisa executar o arquivo `api/admin-functions.sql` no Supabase SQL Editor.

**P: Os links temporários não estão funcionando?**
R: Você precisa executar o arquivo `api/registration-tokens.sql` no Supabase SQL Editor.

**P: Ainda aparece "Multiple GoTrueClient instances"?**
R: Limpe o cache do navegador (Ctrl+Shift+Delete) e tente novamente.

**P: Erro de CORS ao carregar estados do IBGE?**
R: Já foi corrigido! Se persistir, limpe o cache do navegador.

---

## 📞 SUPORTE

Se algo não funcionar após seguir todos os passos:
1. Verifique se os 3 arquivos SQL foram executados com sucesso
2. Limpe o cache do navegador
3. Abra o Console (F12) e copie qualquer erro que aparecer
4. Envie os erros para análise

---

**Data da atualização**: 21/07/2026
**Versão**: 2.0 - Segurança completa + Links temporários
