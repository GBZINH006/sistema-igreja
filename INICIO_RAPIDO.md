# 🚀 Início Rápido - Sistema de Tokens

## ⚡ Setup em 5 Minutos

### 1️⃣ Execute o SQL no Supabase (2 min)

```bash
# Acesse: https://supabase.com/dashboard/project/SEU_PROJETO/sql/new
```

1. Cole o conteúdo de `GERAR_TOKEN_CADASTRO.sql`
2. **Altere a linha 43 e 206:**
   ```sql
   v_base_url TEXT := 'https://SEU-DOMINIO.vercel.app';
   ```
3. Clique em **"Run"** (canto inferior direito)

✅ Se aparecer "Success", está pronto!

---

### 2️⃣ Gere Seu Primeiro Token (1 min)

No mesmo SQL Editor do Supabase:

```sql
SELECT * FROM generate_registration_token(2, 'Teste de token');
```

**Clique em "Run"**

Você verá algo assim:
```
┌─────────────────────────────┬────────────────────────┬───────────────────────────────────────┐
│ token                       │ expires_at             │ registration_url                       │
├─────────────────────────────┼────────────────────────┼───────────────────────────────────────┤
│ abc123XYZ789_exemplo        │ 2024-01-15 16:30:00    │ https://seu-dominio.vercel.app/pages/ │
│                             │                        │ cadastro.html?token=abc123XYZ789...   │
└─────────────────────────────┴────────────────────────┴───────────────────────────────────────┘
```

**Copie o `registration_url`** 📋

---

### 3️⃣ Teste o Link (1 min)

1. **Cole o link** no navegador
2. Você deve ver a **página de cadastro**
3. No topo deve aparecer um **banner azul** com contagem regressiva: ⏱️ "Este link expira em: 01:59:45"

✅ Se aparecer o banner = funcionou!

❌ Se aparecer "Link inválido" = revise o passo 1 (URL base)

---

### 4️⃣ Envie para Alguém Testar (1 min)

**Copie este modelo de mensagem:**

```
🙏 Igreja AD Bela-Vista

Olá! Seu link para cadastro:
[COLE_O_LINK_AQUI]

⏰ Válido por 2 horas
📝 Use apenas uma vez

Dúvidas? Fale com a secretaria.
```

**Envie via WhatsApp** → Peça para a pessoa clicar e testar

---

## 🎯 Comandos Essenciais

### Gerar Token (2 horas)
```sql
SELECT * FROM generate_registration_token();
```

### Gerar Token (4 horas)
```sql
SELECT * FROM generate_registration_token(4, 'João Silva - urgente');
```

### Ver Tokens Ativos
```sql
SELECT * FROM list_active_tokens();
```

### Validar um Token
```sql
SELECT * FROM validate_registration_token('abc123...');
```

### Revogar um Token
```sql
SELECT revoke_registration_token('abc123...');
```

---

## 📱 Modelo de Mensagens

### WhatsApp (Informal)
```
🙏 *AD Bela-Vista*

Olá, João!

Seu link de cadastro: 
https://seu-dominio.vercel.app/pages/cadastro.html?token=abc123...

⏰ Expira em 2h
📝 Uso único

Dúvidas? Chama a gente! 😊
```

### WhatsApp (Formal)
```
✝ *Igreja Assembleia de Deus Bela-Vista*

Prezado(a) *João Silva*,

Seja bem-vindo(a)! Segue seu link exclusivo para cadastro:

https://seu-dominio.vercel.app/pages/cadastro.html?token=abc123...

*Informações importantes:*
• Válido por 2 horas
• Pode ser usado apenas uma vez
• Em caso de dúvidas, contate a secretaria

Que Deus o(a) abençoe! 🙏
```

### E-mail
```
Assunto: Bem-vindo à AD Bela-Vista - Complete seu Cadastro

Olá, João Silva!

Estamos felizes em tê-lo(a) conosco! 

Para completar seu cadastro, clique no botão abaixo:

[ COMPLETAR CADASTRO ] → link aqui

Importante:
• Este link é válido por 2 horas
• Pode ser usado apenas uma vez
• Guarde este e-mail para referência

Em caso de dúvidas, entre em contato com nossa secretaria.

--
Igreja Assembleia de Deus Bela-Vista
Rua Frei Lauro, 44 - Ponte do Imaruim
Palhoça - SC
```

### SMS
```
AD Bela-Vista: Seu link de cadastro (valido 2h):
https://seu-dominio.vercel.app/pages/cadastro.html?token=abc123...
```

---

## ⚠️ Problemas Comuns

### "Link inválido" sempre

**Causa:** URL base não foi configurada

**Solução:**
1. Vá no SQL Editor
2. Execute:
   ```sql
   DROP FUNCTION generate_registration_token;
   ```
3. Cole novamente o `GERAR_TOKEN_CADASTRO.sql` com a URL correta
4. Execute

---

### Token expira muito rápido

**Solução:** Gere com mais tempo
```sql
SELECT * FROM generate_registration_token(4); -- 4 horas
```

---

### Pessoa clicou mas diz que está inválido

**Possíveis causas:**
1. Token já foi usado → Gere novo
2. Token expirou → Gere novo
3. Link foi copiado errado → Envie novamente

**Verificar:**
```sql
SELECT * FROM validate_registration_token('cole_o_token_aqui');
```

---

## 📊 Estatísticas Rápidas

### Quantos tokens foram usados hoje?
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE used) as usados
FROM registration_tokens
WHERE created_at::date = CURRENT_DATE;
```

### Taxa de conversão (últimos 7 dias)
```sql
SELECT 
  COUNT(*) as gerados,
  COUNT(*) FILTER (WHERE used) as usados,
  ROUND(
    COUNT(*) FILTER (WHERE used)::NUMERIC / 
    COUNT(*) * 100, 
    2
  ) || '%' as taxa
FROM registration_tokens
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## ✅ Checklist Pré-Produção

Antes de usar em produção, verifique:

- [ ] SQL executado com sucesso
- [ ] URL base configurada corretamente
- [ ] Token gerado com sucesso
- [ ] Link abre a página de cadastro
- [ ] Banner de contagem regressiva aparece
- [ ] Cadastro pode ser preenchido
- [ ] Ao enviar, token é marcado como usado
- [ ] Token usado não pode ser reutilizado
- [ ] Token expirado mostra mensagem apropriada
- [ ] Apenas admins conseguem gerar tokens

---

## 🎓 Treinamento da Equipe

### Para Secretária/Pastor:

**Como gerar token:**
1. Acesse Supabase SQL Editor
2. Cole: `SELECT * FROM generate_registration_token(2, 'Nome da Pessoa');`
3. Clique "Run"
4. Copie o `registration_url`
5. Envie via WhatsApp/E-mail

**Como verificar se foi usado:**
```sql
SELECT * FROM list_active_tokens();
```

Procure o nome da pessoa na coluna `notes` e veja se `used` está `true`.

---

## 📞 Suporte

**Dúvidas?**
1. Leia `COMO_USAR_TOKENS.md` (documentação completa)
2. Execute `TESTE_RAPIDO_TOKEN.sql` (testes automatizados)
3. Veja `RESUMO_ALTERACOES.md` (mudanças do sistema)

**Erros?**
- Verifique logs no Supabase
- Verifique console do navegador (F12)
- Revise as configurações de RLS

---

## 🎉 Pronto para Usar!

Agora você pode:
✅ Gerar links de cadastro seguros
✅ Controlar quem se cadastra
✅ Rastrear uso de tokens
✅ Revogar tokens quando necessário

**Sistema configurado e documentado!** 🚀

---

*Criado para Igreja AD Bela-Vista* ✝
