# 🚨 ERRO: Função generate_registration_token não encontrada

## ❌ Problema
```
Failed to load resource: the server responded with a status of 404 (Not Found)
/rest/v1/rpc/generate_registration_token
```

**Causa:** A função SQL não foi criada no Supabase ainda.

---

## ✅ SOLUÇÃO RÁPIDA (2 minutos)

### Passo 1: Abrir SQL Editor do Supabase
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **"SQL Editor"** no menu lateral
4. Clique em **"New query"**

### Passo 2: Copiar o SQL
Abra o arquivo: **`INSTALAR_SISTEMA_TOKENS.sql`** (está na raiz do projeto)

Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)

### Passo 3: Alterar a URL
No SQL copiado, procure por (Ctrl+F):
```sql
v_base_url TEXT := 'https://seu-dominio.vercel.app';
```

Você encontrará **2 ocorrências**. Altere ambas para seu domínio real.

**Exemplo:**
Se seu site é `https://igreja-bela-vista.vercel.app`, altere para:
```sql
v_base_url TEXT := 'https://igreja-bela-vista.vercel.app';
```

### Passo 4: Executar
1. Cole o SQL no editor do Supabase
2. Clique em **"Run"** (canto inferior direito)
3. Aguarde aparecer "Success"

### Passo 5: Testar no Painel Admin
1. Volte para o painel admin
2. Recarregue a página (F5)
3. Clique em "Gerar Novo Link" novamente
4. ✅ **Deve funcionar!**

---

## 🎯 O que o SQL cria

- ✅ Tabela `registration_tokens`
- ✅ Função `generate_registration_token()`
- ✅ Função `validate_registration_token()`
- ✅ Função `mark_token_as_used()`
- ✅ Função `list_active_tokens()`
- ✅ Função `revoke_registration_token()`
- ✅ Função `cleanup_expired_tokens()`

---

## 📝 Verificar se foi criado corretamente

No SQL Editor do Supabase, execute:
```sql
SELECT * FROM generate_registration_token(2, 'Teste');
```

**Resultado esperado:**
```
token: "abc123XYZ..."
expires_at: "2024-01-XX XX:XX:XX"
registration_url: "https://seu-dominio.vercel.app/pages/cadastro.html?token=abc123..."
```

Se aparecer isso → ✅ **Funcionou!**

---

## ❓ Troubleshooting

### Erro: "relation registration_tokens already exists"
**Solução:** A tabela já existe. Execute só as funções:
1. No SQL, apague da linha 1 até a linha 50 (criação de tabela)
2. Execute o resto

### Erro: "permission denied"
**Solução:** Seu usuário precisa ser admin. Execute:
```sql
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

### Erro: "function already exists"
**Solução:** Tudo bem, pode ignorar. As funções já foram criadas antes.

---

## 🚀 Depois de Executar

1. Volte ao painel admin
2. Recarregue (F5)
3. Teste gerar link novamente
4. ✅ Deve funcionar perfeitamente!

---

**Execute o SQL AGORA e o erro será resolvido!** 🎉
