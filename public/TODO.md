# TODO - Central de Ajuda AD Bela-Vista

- [ ] Portal do Membro / Seguranca / LGPD
  - [ ] Implementar recuperacao real de senha com token temporario ou fluxo controlado pela secretaria
  - [ ] Adicionar status em `member_accounts`: `pending`, `approved`, `blocked`
  - [ ] Bloquear ou limitar acesso de contas ainda nao aprovadas
  - [ ] Separar claramente na UI: conta criada vs. ficha completa enviada para analise
  - [x] Registrar aceite dos termos no banco: `privacy_accepted_at`, `privacy_version` e origem do fluxo
  - [ ] Substituir o texto provisorio de `public/pages/privacidade.html` pelo texto oficial da igreja
  - [ ] Rodar `public/db/supabase-security-hardening.sql` no SQL Editor do Supabase
  - [ ] Revisar politicas do bucket `membros-docs` no painel do Supabase e confirmar que esta privado
  - [ ] Ativar MFA para usuarios admin/pastor no Supabase Auth
  - [ ] Padronizar nome institucional em todo o sistema: `AD Palhoca` ou `AD Bela-Vista`
