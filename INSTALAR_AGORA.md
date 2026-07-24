# ⚡ Instalação Imediata - Sistema de Tokens

## 🎯 Se você recebeu erro "column used does not exist"

Siga este guia:

---

## 📝 Passo a Passo (5 minutos)

### 1️⃣ Abrir SQL Editor (30 segundos)

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **"SQL Editor"** no menu lateral
4. Clique em **"New query"**

---

### 2️⃣ Copiar o Script Correto (30 segundos)

Abra o arquivo: **`INSTALAR_TOKENS_COMPLETO.sql`**

Copie TODO o conteúdo (Ctrl+A, Ctrl+C)

---

### 3️⃣ Colar no SQL Editor (10 segundos)

Cole o script no SQL Editor do Supabase (Ctrl+V)

---

### 4️⃣ Alterar a URL (1 minuto)

Procure por estas duas linhas (use Ctrl+F):

```sql
v_base_url TEXT := 'https://seu-dominio.vercel.app';
```

Você encontrará 2 ocorrências. Altere ambas para seu domínio real:

**Exemplo:**
```sql
v_base_url TEXT := 'https://igreja-bela-vista.vercel.app';
```

---

### 5️⃣ Executar o Script (10 segundos)

1. Clique no botão **"Run"** (canto inferior direito)
2. Aguarde a mensagem **"Success"**

✅ Se aparecer "Success" → Pronto!

❌ Se aparecer erro → Copie o erro e me envie

---

### 6️⃣ Testar (1 minuto)

No mesmo SQL Editor, execute:

```sql
SELECT * FROM generate_registration_token(2, 'Teste de instalação');
```

**Clique em "Run"**

Você deve ver algo como:

```
token: "abc123XYZ..."
expires_at: "2024-01-15 16:30:00"
registration_url: "https://seu-dominio.vercel.app/pages/cadastro.html?token=abc123..."
```

✅ Se viu isso → Funcionou!

---

## 🎉 Pronto!

Agora você pode:

### Gerar Token:
```sql
SELECT * FROM generate_registration_token(2, 'João Silva');
```

### Ver Tokens:
```sql
SELECT * FROM list_active_tokens();
```

### Validar Token:
```sql
SELECT * FROM validate_registration_token('cole_o_token_aqui');
```

---

## ❓ Troubleshooting

### Erro: "permission denied for table profiles"

**Causa:** Tabela profiles não existe ou RLS está bloqueando.

**Solução:** Execute primeiro o `EXECUTAR_ESTE_SQL.sql` do sistema principal.

---

### Erro: "relation registration_tokens already exists"

**Causa:** Tabela já existe parcialmente.

**Solução:** Use o arquivo `CORRIGIR_TABELA_TOKENS.sql` primeiro, depois execute `INSTALAR_TOKENS_COMPLETO.sql`.

---

### Erro ao gerar token: "access denied"

**Causa:** Seu usuário não tem role de admin/secretario/pastor.

**Solução:**
```sql
-- Verificar seu role atual:
SELECT role FROM profiles WHERE id = auth.uid();

-- Se não retornar nada ou role diferente, atualize:
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

---

### Token gerado mas link não funciona

**Causa:** URL base não foi alterada corretamente.

**Solução:**
1. Execute novamente `INSTALAR_TOKENS_COMPLETO.sql`
2. Certifique-se de alterar AMBAS as ocorrências de `v_base_url`
3. Use seu domínio completo (https://seu-dominio.vercel.app)

---

## 📞 Ainda com problemas?

Se o erro persistir, me envie:

1. ✅ Print do erro completo
2. ✅ Resultado de: `SELECT * FROM registration_tokens LIMIT 1;`
3. ✅ Resultado de: `SELECT role FROM profiles WHERE id = auth.uid();`

---

**Sistema pronto em 5 minutos!** 🚀
