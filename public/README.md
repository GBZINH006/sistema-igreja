SPEC DRIVEN — CENTRAL DE SUPORTE ADMINISTRATIVO AD BELA-VISTA

OBJETIVO

Criar um sistema profissional de suporte interno integrado ao Sistema de Gestão de Membros AD Bela-Vista.

Os usuários poderão abrir chamados diretamente pelo sistema.

Os chamados serão enviados para um painel exclusivo do administrador responsável pelo suporte.

Tempo estimado de resposta:

Até 30 minutos.

---

CONCEITO

Inspirado em:

- Zendesk
- Intercom
- Freshdesk
- Discord ModMail
- Jira Service Desk

O sistema deve transmitir:

- Organização
- Profissionalismo
- Rapidez
- Segurança
- Facilidade de comunicação

---

FLUXO

USUÁRIO

↓

Abre chamado

↓

Administrador recebe notificação

↓

Administrador responde

↓

Usuário recebe resposta

↓

Chamado encerrado

---

TELA DO USUÁRIO

CABEÇALHO

Título:

Central de Suporte

Subtítulo:

Está com alguma dúvida ou problema? Abra um chamado e nossa equipe responderá em até 30 minutos.

---

CARD INFORMATIVO

Tempo médio:

30 minutos

Status:

🟢 Atendimento Online

Chamados resolvidos:

Contador em tempo real

---

FORMULÁRIO DE SUPORTE

Campos:

Categoria

Assunto

Descrição

Prioridade

Anexar imagem

---

Categorias

Cadastro de Membros

Documentos

Relatórios

Exportação PDF

Exportação Excel

Permissões

Login

Erro do Sistema

Sugestão

Outros

---

Prioridade

Baixa

Normal

Alta

Urgente

---

Botão

Enviar Chamado

---

APÓS ENVIAR

Exibir:

✅ Chamado enviado com sucesso

Protocolo:

SUP-2026-0001

Mensagem:

Nossa equipe responderá em até 30 minutos.

---

ÁREA MEUS CHAMADOS

Tabela

Protocolo

Assunto

Categoria

Data

Status

Ações

---

Status

🟡 Aguardando

🔵 Em análise

🟢 Respondido

⚫ Encerrado

🔴 Urgente

---

CHAT DO CHAMADO

Ao abrir um chamado.

Visual estilo WhatsApp.

Mensagens do usuário:

lado direito

Mensagens do suporte:

lado esquerdo

---

Recursos

Enviar mensagens

Enviar imagens

Enviar PDFs

Visualizar histórico

Notificações em tempo real

---

PAINEL DO ADMINISTRADOR

ACESSO EXCLUSIVO

Cargo:

Administrador

Pastor

Suporte

---

DASHBOARD

Cards

Chamados Hoje

Pendentes

Urgentes

Resolvidos

Tempo Médio

Taxa de Resolução

---

LISTA DE CHAMADOS

Tabela profissional

Protocolo

Usuário

Categoria

Assunto

Data

Prioridade

Status

---

Filtros

Todos

Pendentes

Respondidos

Urgentes

Encerrados

---

VISUALIZAÇÃO DO CHAMADO

Ao clicar.

Abre painel lateral.

---

Informações

Nome

Telefone

E-mail

Data

Categoria

Prioridade

---

Histórico completo

Mensagens

Arquivos enviados

Logs

---

RESPOSTA DO SUPORTE

Campo grande

Placeholder:

Digite sua resposta...

---

Botões

Responder

Encerrar

Transferir

Marcar urgente

---

NOTIFICAÇÕES EM TEMPO REAL

Administrador recebe:

🔔 Novo chamado recebido

🔔 Nova mensagem

🔔 Chamado urgente

🔔 Avaliação recebida

---

Exemplo

Novo chamado criado por:

Gabriel Dutra

Categoria:

Exportação PDF

Há poucos segundos

---

SISTEMA DE AVALIAÇÃO

Após encerramento.

Usuário avalia:

⭐
⭐⭐
⭐⭐⭐
⭐⭐⭐⭐
⭐⭐⭐⭐⭐

Comentário opcional

---

AUTOMAÇÕES

Mensagem automática:

Chamado recebido.

Mensagem automática:

Chamado em análise.

Mensagem automática:

Chamado respondido.

Mensagem automática:

Chamado encerrado.

---

BANCO DE DADOS

Tabela:

support_tickets

id

protocol

user_id

subject

category

priority

status

created_at

updated_at

---

Tabela:

support_messages

id

ticket_id

sender_id

message

attachment_url

created_at

---

Tabela:

support_notifications

id

user_id

title

message

read

created_at

---

ANIMAÇÕES

Notificações:

slide-in

Mensagens:

fade-in

Cards:

hover premium

Indicador online:

pulse animation

---

CORES

Mesmo padrão do sistema

Background:
#020B26

Cards:
#08132E

Dourado:
#D4AF37

Azul:
#22D3EE

Roxo:
#8B5CF6

Verde:
#10B981

Vermelho:
#EF4444

---

RESULTADO ESPERADO

Um sistema de suporte profissional integrado ao AD Bela-Vista.

O usuário não precisa sair do sistema para pedir ajuda.

O administrador recebe tudo em tempo real.

Controle total dos atendimentos.

Histórico completo.

Experiência semelhante a plataformas SaaS profissionais.