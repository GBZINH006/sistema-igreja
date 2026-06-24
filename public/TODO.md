# TODO - Central de Ajuda AD Bela-Vista

- [ ] Portal do Membro / Seguranca / LGPD
  - [ ] Implementar recuperacao real de senha com token temporario ou fluxo controlado pela secretaria
  - [ ] Adicionar status em `member_accounts`: `pending`, `approved`, `blocked`
  - [ ] Bloquear ou limitar acesso de contas ainda nao aprovadas
  - [ ] Separar claramente na UI: conta criada vs. ficha completa enviada para analise
  - [ ] Registrar aceite dos termos no banco: `privacy_accepted_at`, `privacy_version` e, se necessario, IP/origem
  - [ ] Substituir o texto provisorio de `public/privacidade.html` pelo texto oficial da igreja
  - [ ] Revisar politicas do bucket `membros-docs` para garantir acesso privado a fotos e documentos
  - [ ] Padronizar nome institucional em todo o sistema: `AD Palhoca` ou `AD Bela-Vista`

- [ ] Atualizar `public/suporte.html` para ficar 100% fiel ao SPEC-DRIVEN:
  - [ ] Ajustar textos do Hero e do Card de Suporte exatamente conforme SPEC
  - [ ] Ajustar icones/labels do Sidebar para corresponder ao SPEC (Headphones, MessageSquare, HelpCircle, PlayCircle)
  - [ ] Implementar Busca Global unificada (FAQ + Tutoriais + Respostas automaticas/quick actions + temas do sistema)
  - [ ] Criar secao real de **Tutoriais** (cards/lista) conforme SPEC
  - [ ] Transformar "Respostas automaticas" em acoes que alimentam o chat da IA (mensagem nova com animacao)
  - [ ] Melhorar microinteracoes (fadeIn/slideUp na IA ao enviar mensagens)
  - [ ] Revisar link e mensagem do WhatsApp para bater com `https://wa.me/5548996839730?text=...`
  - [ ] Ajustar layout responsivo (FAQ 70% / IA 30% no desktop) conforme SPEC

- [ ] Validar manualmente abrindo `public/suporte.html` no navegador
