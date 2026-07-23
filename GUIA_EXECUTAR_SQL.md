# 🎯 GUIA: Como Executar os SQL no Supabase

## ⚠️ IMPORTANTE
Use os arquivos **`-SAFE.sql`** que fazem DROP antes de criar (evita erros).

---

## 📋 PASSO A PASSO

### 1. Acesse o Supabase SQL Editor
🔗 **Link direto**: https://supabase.com/dashboard/project/zhixqgkmcjabbzidadeg/sql

Ou:
1. Entre em https://supabase.com
2. Selecione seu projeto: **zhixqgkmcjabbzidadeg**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **"New Query"**

---

### 2. Execute os 3 Arquivos NA ORDEM

#### ✅ ARQUIVO 1: `1_security-functions-SAFE.sql`

1. Abra o arquivo `api/1_security-functions-SAFE.sql` no VS Code
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. No Supabase SQL Editor, **cole** o código (Ctrl+V)
4. Clique em **"Run"** (ou aperte Ctrl+Enter)
5. Aguarde até ver: ✅ **"Success. No rows returned"**

**O que esse arquivo faz:**
- Cria tabelas de logs de acesso
- Cria funções de validação de sessão
- Cria sistema de rate limiting
- Cria funções de auditoria

---

#### ✅ ARQUIVO 2: `2_registration-tokens-SAFE.sql`

1. Abra o arquivo `api/2_registration-tokens-SAFE.sql` no VS Code
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. No Supabase SQL Editor, **limpe** o editor anterior
4. **Cole** o novo código (Ctrl+V)
5. Clique em **"Run"** (ou aperte Ctrl+Enter)
6. Aguarde até ver: ✅ **"Success. No rows returned"**

**O que esse arquivo faz:**
- Cria tabela `registration_tokens`
- Cria função para gerar tokens temporários (2h)
- Cria função para validar tokens
- Cria função para listar e revogar tokens

---

#### ✅ ARQUIVO 3: `3_admin-functions-SAFE.sql`

1. Abra o arquivo `api/3_admin-functions-SAFE.sql` no VS Code
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. No Supabase SQL Editor, **limpe** o editor anterior
4. **Cole** o novo código (Ctrl+V)
5. Clique em **"Run"** (ou aperte Ctrl+Enter)
6. Aguarde até ver: ✅ **"Success. No rows returned"**

**O que esse arquivo faz:**
- Cria função `admin_list_auth_users()` - lista usuários
- Cria função `admin_upsert_user_role()` - atribui perfis
- Cria função `admin_remove_user()` - remove usuários

---

## ✅ CONFIRMAÇÃO: Tudo deu certo?

Após executar os 3 arquivos, execute este SQL para confirmar:

```sql
-- Teste se as funções foram criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'member_validate_session',
    'admin_check_permissions',
    'log_access_attempt',
    'generate_registration_token',
    'validate_registration_token',
    'admin_list_auth_users',
    'admin_upsert_user_role',
    'admin_remove_user'
  )
ORDER BY routine_name;
```

**Resultado esperado**: Deve aparecer **8 funções**.

---

## 🚨 SE DER ERRO

### Erro: "policy already exists"
✅ **IGNORE!** É esperado. O script usa `DROP POLICY IF EXISTS`.

### Erro: "function does not exist"
✅ **IGNORE!** É esperado. O script usa `DROP FUNCTION IF EXISTS`.

### Erro: "cannot change return type"
❌ Isso significa que você usou o arquivo antigo (sem `-SAFE`).
**Solução**: Use os arquivos `1_security-functions-SAFE.sql`, `2_registration-tokens-SAFE.sql`, `3_admin-functions-SAFE.sql`

### Erro: "table does not exist"
❌ Você precisa criar as tabelas base primeiro.
**Solução**: 
1. Execute `api/setup-database.sql` PRIMEIRO
2. Depois execute os 3 arquivos `-SAFE.sql`

---

## 📊 VERIFICAR TABELAS CRIADAS

Execute este SQL para ver as tabelas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'access_logs',
    'rate_limit_tracker',
    'registration_tokens'
  )
ORDER BY table_name;
```

**Resultado esperado**: Deve aparecer **3 tabelas**.

---

## 🎉 PRONTO!

Após executar os 3 arquivos com sucesso:

1. ✅ Feche o SQL Editor
2. ✅ Acesse seu site: https://project-8i1w1.vercel.app/pages/admin.html
3. ✅ Faça login como admin
4. ✅ Clique no botão **"Gerar Link"** no header
5. ✅ Teste a geração de links temporários!

---

## 🆘 AINDA COM PROBLEMAS?

Se depois de executar os 3 arquivos ainda houver erro:

1. Copie a mensagem de erro completa
2. Tire um print da tela do SQL Editor mostrando o erro
3. Me envie para análise

---

**Data**: 21/07/2026  
**Versão**: 2.0 - Arquivos SAFE (com DROP)
