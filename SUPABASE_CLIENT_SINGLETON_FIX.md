# 🔧 Correção: Multiple GoTrueClient Instances

## Problema
O site estava criando múltiplas instâncias do Supabase Client, causando:
- **Warning**: "Multiple GoTrueClient instances detected"
- **Erro 400**: Função `admin_upsert_user_role` não existia

## Solução Implementada

### 1. **Criado Supabase Client Singleton**
📁 `public/js/supabase-client.js`

- Garante que **apenas uma instância** do cliente seja criada
- Expõe globalmente como `window._supabaseClientInstance`
- Fornece helper `window.getSupabaseClient()`

### 2. **Criada Função SQL Faltante**
📁 `api/admin-functions.sql`

Funções administrativas que estavam faltando:
- ✅ `admin_list_auth_users()` - Lista usuários autenticados
- ✅ `admin_upsert_user_role(email, role)` - Atribui perfil a usuário
- ✅ `admin_remove_user(user_id)` - Remove usuário (apenas admin)

### 3. **Atualizados Arquivos JavaScript**

Todos os arquivos agora usam o singleton:

```javascript
// ❌ ANTES (múltiplas instâncias)
const { createClient } = window.supabase;
const db = createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_KEY);

// ✅ AGORA (singleton)
const db = window._supabaseClientInstance || window.getSupabaseClient();
```

**Arquivos atualizados:**
- ✅ `public/js/admin.js`
- ✅ `public/js/admin-pages.js`
- ✅ `public/js/auth-guard.js`
- ✅ `public/js/cadastro.js`
- ✅ `public/js/membro-login.js`
- ✅ `public/js/membro.js`
- ✅ `public/js/superadmin.js`

## Como Implementar

### Passo 1: Execute o SQL no Supabase

**Ordem de execução:**
1. `api/security-functions.sql` (se ainda não executou)
2. `api/registration-tokens.sql` (se ainda não executou)
3. **`api/admin-functions.sql`** ⬅️ **NOVO**

```sql
-- Cole todo o conteúdo de api/admin-functions.sql
-- no SQL Editor do Supabase e execute
```

### Passo 2: Adicione o Singleton nas Páginas HTML

**Em TODAS as páginas que usam Supabase**, adicione o script do singleton **ANTES** dos outros scripts:

```html
<!-- Config (primeiro) -->
<script src="../js/config.js"></script>

<!-- Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- ⭐ Singleton (NOVO - adicionar ANTES dos outros) -->
<script src="../js/supabase-client.js"></script>

<!-- Outros scripts -->
<script src="../js/auth-guard.js"></script>
<script src="../js/admin.js"></script>
<!-- etc -->
```

### Passo 3: Teste

1. **Limpe cache do navegador** (Ctrl + Shift + Delete)
2. Acesse a página de usuários: `/pages/usuarios.html`
3. Tente criar um novo usuário administrativo
4. Verifique no console:
   - ✅ Deve aparecer: `"✅ Supabase client singleton inicializado"`
   - ❌ NÃO deve aparecer: `"Multiple GoTrueClient instances detected"`

## Páginas que Precisam do Script

Adicione `<script src="../js/supabase-client.js"></script>` em:

- ✅ `admin.html`
- ✅ `usuarios.html`
- ✅ `relatorios.html`
- ✅ `indicadores.html`
- ✅ `configuracoes.html`
- ✅ `cadastro.html`
- ✅ `membro-login.html`
- ✅ `membro.html`
- ✅ `superadmin.html`

## Benefícios

### Antes
```
❌ Multiple GoTrueClient instances (3x)
❌ 400 Bad Request em admin_upsert_user_role
❌ Conflitos de autenticação
❌ Consumo desnecessário de memória
```

### Agora
```
✅ Apenas 1 instância do Supabase Client
✅ Função admin_upsert_user_role funcionando
✅ Sem warnings no console
✅ Melhor performance
```

## Checklist de Implementação

- [ ] Executar `api/admin-functions.sql` no Supabase
- [ ] Adicionar `<script src="../js/supabase-client.js"></script>` em todas as páginas
- [ ] Limpar cache do navegador
- [ ] Testar criação de usuário em `/pages/usuarios.html`
- [ ] Verificar console (não deve ter warnings)
- [ ] Verificar que o perfil é atribuído corretamente

## Troubleshooting

### Se ainda aparecer o warning:
1. Verifique se o `supabase-client.js` está sendo carregado **ANTES** dos outros scripts
2. Limpe completamente o cache do navegador
3. Verifique se não há código antigo em cache do Service Worker

### Se o erro 400 persistir:
1. Confirme que executou `api/admin-functions.sql` no Supabase
2. Verifique se o usuário atual tem perfil `admin` ou `pastor` na tabela `profiles`
3. Confira logs do Supabase em "Database" > "Logs"

## Contato

Se tiver problemas, verifique:
1. Console do navegador (F12)
2. Network tab (requisições para `/rest/v1/rpc/admin_upsert_user_role`)
3. Logs do Supabase SQL Editor

---

**Data da correção**: 21/07/2026  
**Versão**: 1.0
