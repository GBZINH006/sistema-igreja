# AD Bela-Vista - Documentacao de Banco de Dados

**Versao do documento:** 1.2

---

## 1. Backend

O sistema usa Supabase para:

- Supabase Auth nos paineis admin/pastor e secretaria;
- Postgres para cadastros;
- Storage privado para anexos;
- Realtime para novos cadastros;
- RPC para portal do membro, assinatura do pastor e busca da secretaria;
- RLS para proteger dados.

Os scripts ficam em `public/db/`.

---

## 2. Tabela `membros`

Registro principal de membros e congregados.

Campos de maior uso:

- `id`
- `created_at`
- `updated_at`
- `tipo_cadastro`
- `status`
- `nome`
- `cpf`
- `rg`
- `data_nasc`
- `idade`
- `celular`
- `email`
- `endereco`
- `cidade_estado`
- `setor_igreja`
- `congregacao_igreja`
- `forma_recebimento`
- `cargo_principal`
- `data_aprovacao`
- `member_account_id`
- `privacy_accepted_at`: data e hora do aceite, gerada pelo banco.
- `privacy_version`: versao dos termos aceitos.
- `privacy_source`: fluxo em que ocorreu o aceite (`public_registration` ou `member_registration`).

Status esperados:

- `Pendente`
- `Em análise`
- `Correção`
- `Aprovado`
- `Ativo`
- `Inativo`
- `Transferido`
- `Falecido`

---

## 3. Contas de Membro

O portal do membro usa tabelas proprias:

- `member_accounts`
- `member_account_sessions`

O membro nao usa Supabase Auth diretamente. A sessao e controlada por token armazenado com hash no banco.

O aceite feito durante a criacao da conta fica em `member_accounts`, nos campos `privacy_accepted_at`, `privacy_version` e `privacy_source`. Nesse fluxo, a origem registrada e `member_signup`.

---

## 4. Roles Administrativas

A tabela `profiles` vincula usuarios do Supabase Auth a roles:

- `admin`
- `pastor`
- `secretario`

Uso esperado:

- `admin`: acesso total, incluindo exclusao.
- `pastor`: painel pastoral sem exclusao.
- `secretario`: acesso operacional igual ao admin no painel unificado, incluindo exclusao.

---

## 5. Storage

Bucket principal:

- `membros-docs`

Deve permanecer privado.

Campos de midia:

- `foto_url`
- `doc_url`
- `foto_certidao_nasc`
- `foto_certidao_casamento`
- `foto_diploma`
- `foto_comprovante_end`
- `assinatura_url`

---

## 6. Auditoria

O SQL de endurecimento cria `audit_logs` para registrar alteracoes em `membros`.

Eventos esperados:

- insert;
- update;
- delete.

Leitura da auditoria deve ficar restrita a admin/pastor/secretario.

---

## 7. Scripts SQL

- `supabase-schema-principal.sql`: estrutura principal.
- `supabase-security-hardening.sql`: roles, RLS, auditoria e Storage.
- `supabase-secretario.sql`: funcoes/policies historicas da secretaria e acesso unificado.
- `supabase-membro.sql`: conta do membro e RPCs do portal.

Depois de alterar SQL, execute `notify pgrst, 'reload schema';` ou rode o script completo.

Para atualizar um banco existente com o registro de consentimento, rode novamente `supabase-membro.sql` e depois `supabase-security-hardening.sql`.

---

## 8. Boas Praticas

- Nunca expor `service_role`.
- Testar RLS com anon, admin, pastor e secretario.
- Manter `membros-docs` privado.
- Fazer backup antes de mudancas grandes.
- Padronizar status e tipo de cadastro.
