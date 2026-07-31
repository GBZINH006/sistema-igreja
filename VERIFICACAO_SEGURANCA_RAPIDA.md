# ⚡ VERIFICAÇÃO RÁPIDA DE SEGURANÇA
## Checklist de 5 Minutos

---

## 🎯 TESTE AGORA - RLS (Row Level Security)

### ⚠️ MAIS IMPORTANTE: Verificar se dados estão protegidos

**Abra o console do navegador** (F12) em uma aba anônima/privada SEM fazer login:

```javascript
// 1. Copie e cole no console:
const supabase = window.supabase.createClient(
  'https://zhixqgkmcjabbzidadeg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoaXhxZ2ttY2phYmJ6aWRhZGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMjE1NjAsImV4cCI6MjA5ODg5NzU2MH0.JEiUSKtP5-Gs4y-oo44NEvFnmjnVyoEfRYJhRcwuNkA'
);

// 2. Tente acessar dados de membros:
const { data, error } = await supabase
  .from('membros')
  .select('*');

console.log('Dados:', data);
console.log('Erro:', error);
```

### ✅ RESULTADO ESPERADO:
```javascript
Dados: null
Erro: {
  code: "42501",
  message: "new row violates row-level security policy",
  details: "..."
}
```

### 🔴 PROBLEMA SE:
```javascript
Dados: [{nome: "João", cpf: "123...", ...}, ...]
Erro: null
```

**SE APARECER DADOS = URGENTE!** Dados estão expostos!

---

## 🔒 AÇÕES CORRETIVAS IMEDIATAS

### Se dados estão expostos, faça AGORA no Supabase:

1. **Acesse o Supabase Dashboard**:
   - https://app.supabase.com/project/zhixqgkmcjabbzidadeg

2. **Vá em: Authentication → Policies**

3. **Habilite RLS em TODAS as tabelas**:
   ```sql
   -- Para cada tabela, execute:
   ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
   ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ministerios ENABLE ROW LEVEL SECURITY;
   ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comunicacao ENABLE ROW LEVEL SECURITY;
   ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
   ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
   ```

4. **Crie Policies de Acesso**:
   ```sql
   -- Exemplo para tabela membros:
   
   -- SELECT: Apenas admin/secretario ou próprio membro
   CREATE POLICY "membros_select_policy" ON membros
   FOR SELECT
   USING (
     auth.jwt() ->> 'role' IN ('admin', 'secretario', 'pastor')
     OR
     auth.uid() = user_id
   );
   
   -- INSERT: Apenas admin/secretario
   CREATE POLICY "membros_insert_policy" ON membros
   FOR INSERT
   WITH CHECK (
     auth.jwt() ->> 'role' IN ('admin', 'secretario', 'pastor')
   );
   
   -- UPDATE: Apenas admin/secretario
   CREATE POLICY "membros_update_policy" ON membros
   FOR UPDATE
   USING (
     auth.jwt() ->> 'role' IN ('admin', 'secretario', 'pastor')
   );
   
   -- DELETE: Apenas admin
   CREATE POLICY "membros_delete_policy" ON membros
   FOR DELETE
   USING (
     auth.jwt() ->> 'role' = 'admin'
   );
   ```

5. **Teste novamente** com o código acima

---

## 🧪 OUTROS TESTES RÁPIDOS

### 2. Teste XSS (Cross-Site Scripting)
```
1. Vá em cadastro de membro
2. No campo "Nome", digite: <script>alert('XSS')</script>
3. Salve
4. Veja se aparece um alerta

✅ CORRETO: Texto aparece como texto normal
🔴 PROBLEMA: Alerta aparece (script executou)
```

### 3. Teste de Acesso Não Autorizado
```
1. Faça logout (ou abra aba anônima)
2. Tente acessar: https://seu-site.vercel.app/pages/admin.html
3. Veja o que acontece

✅ CORRETO: Redireciona para login
🔴 PROBLEMA: Mostra página admin
```

### 4. Teste de Session Timeout
```
1. Faça login
2. Espere 30 minutos sem usar
3. Tente fazer uma ação (cadastrar membro)

✅ CORRETO: Pede para fazer login novamente
🔴 PROBLEMA: Permite ação sem reautenticar
```

---

## 📋 CHECKLIST COMPLETO

### Antes de Ir para Produção

- [ ] ✅ RLS habilitado em todas as tabelas
- [ ] ✅ Policies de acesso configuradas
- [ ] ✅ Teste sem login confirma bloqueio
- [ ] ✅ Headers de segurança no vercel.json
- [ ] ✅ HTTPS funcionando (Vercel faz automaticamente)
- [ ] ✅ Teste de XSS passou
- [ ] ✅ Teste de acesso não autorizado passou
- [ ] ✅ Session timeout funcionando
- [ ] ✅ Backup automático configurado
- [ ] ✅ Logs de auditoria funcionando

### Monitoramento Contínuo

- [ ] Verificar logs semanalmente
- [ ] Revisar acessos suspeitos
- [ ] Atualizar dependências mensalmente
- [ ] Testar RLS trimestralmente
- [ ] Auditoria completa semestralmente

---

## 🆘 SE ENCONTRAR PROBLEMA

### 1. Dados Expostos (RLS desabilitado)
**Prioridade**: 🔴 URGENTE - Resolver EM MINUTOS

1. Habilite RLS imediatamente (comandos acima)
2. Valide que bloqueou
3. Verifique logs de acesso (quem acessou?)
4. Notifique usuários se necessário

### 2. XSS Funcionando
**Prioridade**: 🟡 ALTA - Resolver EM HORAS

1. Verifique se `escapeHtml()` está sendo usada
2. Corrija outputs não escapados
3. Teste novamente

### 3. Acesso Não Autorizado
**Prioridade**: 🔴 URGENTE - Resolver EM MINUTOS

1. Verifique `auth-guard.js`
2. Confirme que rotas estão protegidas
3. Teste todos os endpoints

---

## 📞 CONTATOS DE EMERGÊNCIA

**Segurança Crítica**:
- Email: seguranca@empresa.com.br
- Telefone: (XX) XXXXX-XXXX
- WhatsApp: (XX) XXXXX-XXXX

**Suporte Supabase**:
- https://supabase.com/dashboard/support

---

## 💡 DICA PRO

Configure alertas automáticos no Supabase:

1. Vá em: **Dashboard → Settings → API**
2. Habilite: "Email notifications for suspicious activity"
3. Configure: Rate limiting e IP whitelisting

---

**Documento criado em**: 31/07/2026  
**Validade**: Teste antes de cada deploy  
**Tempo estimado**: 5-10 minutos
