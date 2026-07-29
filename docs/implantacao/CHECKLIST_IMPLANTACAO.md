# Checklist de Implantação
## Sistema de Gestão Eclesiástica AD Bela Vista

**Use esta lista para garantir que nenhuma etapa seja esquecida**

---

## ☑️ PRÉ-IMPLANTAÇÃO

### Documentação
- [ ] CNPJ da igreja coletado
- [ ] Endereço completo validado
- [ ] Logotipo em alta resolução (PNG transparente)
- [ ] Cores institucionais definidas (hex codes)
- [ ] E-mail institucional criado
- [ ] Contrato assinado
- [ ] Termo de confidencialidade assinado

### Recursos Humanos
- [ ] Gestor do projeto designado
- [ ] Secretário(a) disponível para validação
- [ ] Usuários-chave identificados
- [ ] Horários de reunião definidos
- [ ] Data de go-live acordada

### Infraestrutura
- [ ] Acesso à internet estável (>10 Mbps)
- [ ] Computadores com navegadores atualizados
- [ ] Conta GitHub criada
- [ ] Conta Vercel criada
- [ ] Conta Supabase criada

### Dados Legados (se aplicável)
- [ ] Planilha Excel exportada do sistema antigo
- [ ] Dados validados (CPFs, datas, e-mails)
- [ ] Campos padronizados
- [ ] Duplicatas removidas

---

## ☑️ CONFIGURAÇÃO TÉCNICA

### GitHub
- [ ] Repositório criado (público ou privado)
- [ ] Código-fonte do sistema clonado
- [ ] Branch main protegida
- [ ] Colaboradores adicionados

### Vercel
- [ ] Projeto criado e conectado ao GitHub
- [ ] Variável `SUPABASE_URL` configurada
- [ ] Variável `SUPABASE_KEY` configurada
- [ ] Primeiro deploy realizado com sucesso
- [ ] URL de produção acessível

### Supabase
- [ ] Projeto criado
- [ ] URL e API Keys anotadas
- [ ] Autenticação por e-mail habilitada
- [ ] Storage habilitado
- [ ] Bucket `membros-docs` criado (público)

### Banco de Dados
- [ ] Tabelas criadas (`membros`, `profiles`, `registration_tokens`)
- [ ] Views criadas (se aplicável)
- [ ] Functions criadas (RPC)
- [ ] Row Level Security (RLS) configurado
- [ ] Policies de acesso criadas
- [ ] Triggers instalados
- [ ] Índices otimizados

### Sistema de Tokens
- [ ] Tabela `registration_tokens` criada
- [ ] Function `generate_registration_token` instalada
- [ ] Function `list_active_tokens` instalada
- [ ] Function `revoke_registration_token` instalada
- [ ] Testado: Gerar link
- [ ] Testado: Usar link
- [ ] Testado: Revogar link

### Perfis Administrativos
- [ ] Tabela `profiles` criada
- [ ] Perfil do pastor criado (role: admin)
- [ ] Perfil do(a) secretário(a) criado (role: secretario)
- [ ] Testado: Login com e-mail/senha
- [ ] Testado: Acesso ao dashboard

### Personalização Visual
- [ ] Logotipo substituído em `/public/assets/`
- [ ] Cores institucionais aplicadas em CSS
- [ ] Nome da igreja atualizado nos headers
- [ ] Rodapés personalizados
- [ ] Favicon atualizado

---

## ☑️ MIGRAÇÃO DE DADOS

### Preparação
- [ ] Planilha validada e limpa
- [ ] Campos obrigatórios preenchidos
- [ ] CPFs validados
- [ ] E-mails únicos
- [ ] Datas corretas (DD/MM/AAAA)
- [ ] Telefones com DDD

### Importação
- [ ] Backup do banco realizado (antes da importação)
- [ ] Dados importados via SQL ou interface
- [ ] Total de registros confere com planilha
- [ ] Nenhum erro durante importação

### Validação Pós-Migração
- [ ] Total de membros correto
- [ ] Nenhum CPF duplicado
- [ ] Datas de nascimento corretas
- [ ] E-mails únicos
- [ ] Setores/congregações cadastrados
- [ ] Cargos/ministérios cadastrados
- [ ] Status iniciais corretos (Ativo, Inativo, etc.)

---

## ☑️ TESTES E HOMOLOGAÇÃO

### Testes Funcionais
- [ ] Login administrativo (e-mail + senha)
- [ ] Cadastro manual de membro
- [ ] Aprovação de ficha pendente
- [ ] Solicitação de correção
- [ ] Edição de dados de membro
- [ ] Exclusão lógica (inativar)
- [ ] Exclusão permanente (com confirmação)
- [ ] Geração de link temporário
- [ ] Uso de link temporário (cadastro via token)
- [ ] Revogação de link
- [ ] Filtros de membros (tipo, status, setor)
- [ ] Busca por nome
- [ ] Exportação Excel
- [ ] Visualização de indicadores no dashboard
- [ ] Portal do membro (login com CPF + e-mail)
- [ ] Baixar ficha em PDF (com assinatura do pastor)
- [ ] Notificações em tempo real
- [ ] Aniversariantes do mês

### Testes de Performance
- [ ] Lista de 500+ membros carrega em < 3s
- [ ] Upload de foto 5MB em < 10s
- [ ] Exportação Excel 1000+ linhas em < 5s
- [ ] Dashboard atualiza indicadores em < 2s

### Testes de Usabilidade
- [ ] Interface intuitiva para não técnicos
- [ ] Mensagens de erro claras
- [ ] Botões com rótulos compreensíveis
- [ ] Responsivo em celular (iPhone, Android)
- [ ] Responsivo em tablet (iPad)

### Correção de Bugs
- [ ] Todos os bugs críticos resolvidos
- [ ] Bugs altos resolvidos
- [ ] Bugs médios documentados (correção pós-go-live)
- [ ] Retestes realizados

### Homologação Final
- [ ] Gestor aprovou interface
- [ ] Secretário aprovou funcionalidades
- [ ] Membros-teste aprovaram portal
- [ ] Termo de Aceite assinado
- [ ] Liberado para go-live

---

## ☑️ TREINAMENTO

### Material Preparado
- [ ] Manual do Administrador (PDF)
- [ ] Manual do Secretário (PDF)
- [ ] Manual do Membro (PDF)
- [ ] Vídeo tutorial para membros (YouTube/Vimeo)
- [ ] FAQ impresso

### Treinamento de Administradores
- [ ] Data e horário agendados
- [ ] Plataforma de videoconferência configurada (se remoto)
- [ ] Treinamento realizado (2 horas)
- [ ] Dúvidas respondidas
- [ ] Sessão gravada (se remoto)
- [ ] Certificado de participação entregue (opcional)

### Treinamento de Secretários
- [ ] Data e horário agendados
- [ ] Treinamento realizado (1,5 horas)
- [ ] Prática realizada (aprovar fichas, gerar relatórios)
- [ ] Dúvidas respondidas

### Treinamento de Membros
- [ ] Vídeo tutorial publicado
- [ ] Link do vídeo divulgado nos grupos
- [ ] FAQ disponível no site/portal
- [ ] Pôster com QR Code impresso e afixado

---

## ☑️ GO-LIVE

### Preparação (D-1)
- [ ] Backup completo do banco realizado
- [ ] Sistema em produção estável
- [ ] Usuários administrativos criados e testados
- [ ] Comunicação enviada aos membros
- [ ] E-mail de suporte criado
- [ ] Equipe de suporte escalada
- [ ] Plano de rollback definido

### Dia do Go-Live
- [ ] Verificação final às 8h
- [ ] Acesso liberado aos admins às 8h30
- [ ] Admins testaram e aprovaram às 9h
- [ ] Comunicação oficial enviada às 10h
- [ ] Suporte intensivo ativo (10h-18h)
- [ ] Reunião de encerramento às 18h

### Comunicação
- [ ] Anúncio no culto (domingo anterior)
- [ ] Mensagem no WhatsApp enviada
- [ ] E-mail para membros enviado
- [ ] Cartazes afixados nos murais
- [ ] Post nas redes sociais publicado

### Monitoramento
- [ ] Logs de erro monitorados (Supabase Dashboard)
- [ ] Notificações em tempo real verificadas
- [ ] Uso de links temporários acompanhado
- [ ] Dúvidas no WhatsApp respondidas (< 30 min)
- [ ] Problemas registrados em planilha

---

## ☑️ SUPORTE PÓS-GO-LIVE

### Primeira Semana
- [ ] Monitoramento diário realizado
- [ ] Dúvidas respondidas em até 2 horas
- [ ] Bugs críticos corrigidos imediatamente
- [ ] Reunião de acompanhamento (3º dia)

### Semanas 2-4
- [ ] Dúvidas respondidas em até 24 horas
- [ ] Bugs corrigidos conforme criticidade
- [ ] Ajustes de layout/usabilidade aplicados
- [ ] Relatório semanal de uso enviado

### Indicadores Acompanhados
- [ ] Taxa de aprovação de cadastros
- [ ] Tempo médio de aprovação
- [ ] Links temporários gerados/usados
- [ ] Membros ativos no portal
- [ ] Tickets de suporte
- [ ] Satisfação dos usuários

### Reunião de Encerramento (30 dias)
- [ ] Indicadores apresentados
- [ ] Feedback coletado
- [ ] Pontos de melhoria identificados
- [ ] Plano de manutenção proposto
- [ ] Projeto encerrado formalmente

---

## ☑️ ENTREGAS FINAIS

### Documentação
- [ ] Manual do Administrador entregue
- [ ] Manual do Secretário entregue
- [ ] Manual do Membro entregue
- [ ] Relatório de implantação entregue
- [ ] Documentação técnica completa entregue

### Código e Acessos
- [ ] Código-fonte completo entregue (GitHub)
- [ ] Backup final dos dados entregue
- [ ] Credenciais de acesso entregues (envelope lacrado)
- [ ] Propriedade do repositório transferida (se aplicável)
- [ ] Propriedade do projeto Vercel transferida (se aplicável)
- [ ] Propriedade do projeto Supabase transferida (se aplicável)

### Financeiro
- [ ] Todas as parcelas pagas
- [ ] Nota fiscal/recibo emitido
- [ ] Contrato arquivado

---

## ✅ PROJETO CONCLUÍDO COM SUCESSO!

**Data de Conclusão**: ___/___/______  
**Assinatura do Gestor**: ________________________  
**Assinatura do Desenvolvedor**: ________________________

---

*Checklist Versão 2.0.0 - Julho de 2026*
