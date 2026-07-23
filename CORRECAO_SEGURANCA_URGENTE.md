# 🚨 CORREÇÃO URGENTE: Segurança do Site

## ❌ **Problema Atual**
Após o redeploy, a segurança **NÃO está funcionando** porque:

1. **Scripts não estão sendo carregados** (caminhos errados)
2. **Ordem de carregamento está errada**
3. **Faltam scripts essenciais** (supabase-client.js, devtools-protection.js)

## ✅ **Solução Completa**

### **1️⃣ Executar SQL no Supabase (OBRIGATÓRIO)**

Acesse: https://supabase.com/dashboard → Seu projeto → SQL Editor

Execute **nesta ordem**:

```sql
-- 1. security-functions.sql (cole TODO o conteúdo)
-- 2. registration-tokens.sql (cole TODO o conteúdo)
-- 3. admin-functions.sql (cole TODO o conteúdo) ⬅️ NOVO
```

### **2️⃣ Corrigir TODAS as páginas HTML**

Os scripts devem estar **nesta ordem exata**:

```html
<!-- 1. Config (primeiro sempre) -->
<script src="../js/config.js"></script>

<!-- 2. Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 3. ⭐ Singleton (NOVO - adicionar) -->
<script src="../js/supabase-client.js"></script>

<!-- 4. ⭐ Segurança (auth-guard só em páginas protegidas) -->
<script src="../js/auth-guard.js"></script>

<!-- 5. ⭐ DevTools Protection (NOVO - adicionar) -->
<script src="../js/devtools-protection.js"></script>

<!-- 6. Script da página (por último) -->
<script src="../js/admin.js"></script> <!-- ou cadastro.js, membro.js, etc -->
```

---

## 📄 **Páginas que Precisam Correção**

### **Páginas Administrativas** (precisam de TODOS os scripts)

#### ✅ `admin.html` - **JÁ CORRIGIDO**
```html
<script src="../js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>
<script src="../js/auth-guard.js"></script>
<script src="../js/devtools-protection.js"></script>
<script src="../js/admin.js"></script>
```

#### ✅ `usuarios.html` - **JÁ CORRIGIDO**
```html
<script src="../js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>
<script src="../js/auth-guard.js"></script>
<script src="../js/devtools-protection.js"></script>
<script src="../js/admin-pages.js"></script>
```

#### ❌ `relatorios.html` - **PRECISA CORRIGIR**
**ANTES** (ERRADO):
```html
<script src="../js/admin-pages.js"></script>
<script src="js/auth-guard.js"></script> ❌ caminho errado + ordem errada
```

**DEPOIS** (CERTO):
```html
<script src="../js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>
<script src="../js/auth-guard.js"></script>
<script src="../js/devtools-protection.js"></script>
<script src="../js/admin-pages.js"></script>
```

#### ❌ `indicadores.html` - **PRECISA CORRIGIR**
(Igual ao relatorios.html)

#### ❌ `configuracoes.html` - **PRECISA CORRIGIR**
**ANTES** (ERRADO):
```html
<script src="js/auth-guard.js"></script> ❌ caminho errado
<script src="../js/admin-pages.js"></script>
```

**DEPOIS** (CERTO):
```html
<script src="../js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>
<script src="../js/auth-guard.js"></script>
<script src="../js/devtools-protection.js"></script>
<script src="../js/admin-pages.js"></script>
```

#### ✅ `superadmin.html` - **JÁ CORRIGIDO**

---

### **Páginas Públicas/Membros** (NÃO precisam de auth-guard)

#### ❌ `cadastro.html` - **PRECISA CORRIGIR**
**ANTES** (ERRADO):
```html
<script src="js/auth-guard.js"></script> ❌ não precisa + caminho errado
<script src="../js/cadastro.js"></script>
```

**DEPOIS** (CERTO):
```html
<script src="../js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>
<script src="js/devtools-protection.js"></script>
<script src="../js/cadastro.js"></script>
```

#### ❌ `membro-login.html` - **PRECISA CORRIGIR**
**ANTES** (ERRADO):
```html
<script src="js/auth-guard.js"></script> ❌ não precisa
<script src="../js/membro-login.js"></script>
```

**DEPOIS** (CERTO):
```html
<script src="../js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-client.js"></script>
<script src="js/devtools-protection.js"></script>
<script src="../js/membro-login.js"></script>
```

#### ❌ `membro.html` - **PRECISA CORRIGIR**
(Igual ao membro-login.html)

#### ✅ `index.html` - **JÁ CORRIGIDO**
#### ✅ `privacidade.html` - **JÁ CORRIGIDO**
#### ✅ `suporte.html` - **JÁ CORRIGIDO**

---

## 🔍 **Como Verificar se Está Funcionando**

### **Teste 1: Console do Navegador** (F12)
✅ **Deve aparecer**:
```
✅ Supabase client singleton inicializado
```

❌ **NÃO deve aparecer**:
```
Multiple GoTrueClient instances detected
```

### **Teste 2: Proteção de Rotas**
1. Tente acessar `/pages/admin.html` sem login
2. **Deve redirecionar** para tela de login automaticamente

### **Teste 3: DevTools Protection**
1. Tente abrir DevTools (F12)
2. **Deve ser bloqueado** (página recarrega ou mostra aviso)

### **Teste 4: Source Maps**
1. Abra DevTools → Sources
2. **NÃO deve mostrar** arquivos `.map`

---

## ⚠️ **Erros Comuns**

### Erro 1: "Multiple GoTrueClient instances"
**Causa**: Falta o `supabase-client.js` ou está na ordem errada  
**Solução**: Adicionar ANTES de todos os outros scripts

### Erro 2: "admin_upsert_user_role 400 Bad Request"
**Causa**: Função SQL não foi executada no Supabase  
**Solução**: Executar `api/admin-functions.sql`

### Erro 3: DevTools não bloqueia
**Causa**: Falta o `devtools-protection.js`  
**Solução**: Adicionar o script em todas as páginas

### Erro 4: "auth-guard.js não encontrado"
**Causa**: Caminho errado (`js/auth-guard.js` vs `../js/auth-guard.js`)  
**Solução**: Usar `../js/` quando a página está em `/pages/`

---

## 📋 **Checklist de Implementação**

- [ ] Executar `api/admin-functions.sql` no Supabase
- [ ] Corrigir `relatorios.html`
- [ ] Corrigir `indicadores.html`
- [ ] Corrigir `configuracoes.html`
- [ ] Corrigir `cadastro.html`
- [ ] Corrigir `membro-login.html`
- [ ] Corrigir `membro.html`
- [ ] Fazer git add, commit e push
- [ ] Redeploy no Vercel
- [ ] Limpar cache do navegador (Ctrl + Shift + Delete)
- [ ] Testar login admin
- [ ] Testar proteção F12
- [ ] Verificar console (sem warnings)

---

## 🚀 **Comando para Deploy**

```bash
git add .
git commit -m "fix: corrigir sistema de segurança completo"
git push origin main
```

Vercel vai fazer deploy automático.

---

**Data**: 21/07/2026  
**Prioridade**: 🔴 **CRÍTICA**  
**Tempo estimado**: 10-15 minutos
