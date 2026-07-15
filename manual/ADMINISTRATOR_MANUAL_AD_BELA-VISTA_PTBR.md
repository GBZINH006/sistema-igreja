# AD Bela-Vista - Manual do Administrador

**Versao do documento:** 1.2
**Publico:** administrador tecnico, pastor responsavel e pessoa autorizada a manter o sistema.

---

## 1. Objetivo

Orientar a manutencao do sistema, incluindo:

- acesso administrativo;
- controle de roles;
- aprovacao de cadastros;
- integracao com Supabase;
- Storage privado;
- rotinas de verificacao e troubleshooting.

---

## 2. Estrutura Atual

- Paginas: `public/pages/`
- Scripts: `public/js/`
- Estilos: `public/css/`
- SQLs: `public/db/`
- Assets: `public/assets/`
- Manual navegavel: `public/pages/suporte.html`

---

## 3. Roles e Permissoes

| Role | Acesso |
|---|---|
| `admin` | Painel admin/pastor, edicao, exportacao, aprovacao e exclusao. |
| `pastor` | Painel admin/pastor, consulta, edicao, exportacao, aprovacao e assinatura, sem exclusao. |
| `secretario` | Painel da secretaria, busca, consulta e manutencao operacional permitida. |

Nao existe mais central operacional de suporte/tickets. A rota `/suporte.html` agora e manual do sistema.

---

## 4. Rotina de Aprovacao

Status principais:

- `Pendente`: cadastro publico aguardando conferencia.
- `Em análise`: ficha enviada ou alterada pelo membro.
- `Correção`: precisa ajuste do membro ou secretaria.
- `Aprovado`: ficha conferida.

Rotina recomendada:

1. Abra o painel admin/pastor.
2. Use o filtro rapido **Pendentes**.
3. Abra a ficha e confira dados e anexos.
4. Se estiver correto, aprove.
5. Se faltar informacao, marque como **Correção**.

---

## 5. Seguranca Operacional

- Nunca coloque `service_role` no front-end.
- Use apenas a chave anonima em `public/js/config.js`.
- Rode `public/db/supabase-security-hardening.sql` no Supabase.
- Confirme RLS em `membros`, `profiles`, `audit_logs` e Storage.
- Mantenha `membros-docs` privado.
- Ative MFA para usuarios admin/pastor quando possivel.

---

## 6. Troubleshooting

### Usuario nao entra no painel

- Confirme se existe em Supabase Auth.
- Confirme registro em `public.profiles`.
- Confirme role correta.
- Use **Esqueci minha senha** se o problema for senha.

### Cadastro nao aparece

- Recarregue a lista.
- Verifique RLS da tabela `membros`.
- Confirme se o registro tem `created_at`.

### Anexo nao abre

- Confirme se o bucket `membros-docs` existe.
- Confirme policies de Storage.
- Gere nova URL assinada abrindo novamente a ficha.

### Exportacao falha

- Confirme se as bibliotecas de CDN carregaram.
- Teste PDF, Excel e PDF completo em navegadores atualizados.

---

## 7. Checklist Mensal

- [ ] Revisar usuarios em `profiles`.
- [ ] Remover acessos antigos.
- [ ] Confirmar bucket privado.
- [ ] Testar login admin, pastor e secretario.
- [ ] Testar envio de ficha publica.
- [ ] Testar envio pelo portal do membro.
- [ ] Testar aprovacao/correcao.
- [ ] Testar PDF completo.
- [ ] Fazer backup do banco e Storage.
