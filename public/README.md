# Sistema de Gestao de Membros AD Bela-Vista

Sistema web para cadastro, organizacao, consulta, relatorios e suporte interno da Igreja AD Bela-Vista, em Palhoca - SC. O projeto foi construido como uma aplicacao estatica em HTML, CSS e JavaScript, integrada ao Supabase para autenticacao, banco de dados, storage e recursos em tempo real, com deploy pensado para Vercel.

O foco principal do sistema e manter uma base organizada de membros e congregados, permitir que a secretaria e o pastor acompanhem os cadastros, emitir exportacoes administrativas e centralizar pedidos de suporte.

## Sumario

- [Visao geral](#visao-geral)
- [Principais modulos](#principais-modulos)
- [Arquitetura do projeto](#arquitetura-do-projeto)
- [Tecnologias e dependencias](#tecnologias-e-dependencias)
- [Rotas e telas](#rotas-e-telas)
- [Banco de dados e storage](#banco-de-dados-e-storage)
- [Permissoes e seguranca](#permissoes-e-seguranca)
- [Configuracao do ambiente](#configuracao-do-ambiente)
- [Como executar localmente](#como-executar-localmente)
- [Deploy](#deploy)
- [Operacao do sistema](#operacao-do-sistema)
- [Documentacao complementar](#documentacao-complementar)
- [Pontos de atencao](#pontos-de-atencao)

## Visao Geral

O sistema atende quatro necessidades centrais:

1. Cadastrar membros e congregados por meio de uma ficha digital responsiva.
2. Gerenciar registros em paineis restritos para pastor, administracao e secretaria.
3. Consultar indicadores, aniversariantes e relatorios exportaveis em PDF, Excel e PNG.
4. Oferecer uma central de suporte com chamados, chat, anexos e assistente inteligente.

A tela inicial (`public/index.html`) redireciona automaticamente para `public/cadastro.html`, tornando o cadastro a entrada publica principal.

## Principais Modulos

### Cadastro de membros e congregados

Arquivos principais:

- `public/cadastro.html`
- `public/cadastro.js`
- `public/cadastro.css`

Funcionalidades:

- Escolha inicial entre `Membro` e `Congregado`.
- Fluxo por etapas com indicador visual de progresso.
- Campos de identificacao, contato, documentos, dados da igreja, familia, talentos e assinatura.
- Validacao de nome, CPF/CRNM, RG, telefone e assinatura digital.
- Upload de foto, documento, certidoes, diploma, comprovante e assinatura.
- Busca de CEP e preenchimento auxiliar de endereco.
- Envio dos dados para a tabela `membros`.
- Envio de anexos para buckets do Supabase Storage.

O modo `Congregado` usa um fluxo mais enxuto. O modo `Membro` abre a ficha completa.

### Painel do Pastor/Admin

Arquivos principais:

- `public/admin.html`
- `public/admin.js`
- `public/admin.css`

Funcionalidades:

- Login via Supabase Auth.
- Validacao de perfil `admin` na tabela `profiles`.
- Dashboard com cards de total, membros, congregados, ativos, cadastros do mes e aniversariantes.
- Indicador de ultimo cadastro.
- Graficos com Chart.js.
- Lista de membros com busca por nome, CPF ou celular.
- Filtros por tipo, status, setor, faixa de idade e cargo.
- Modal de detalhes do cadastro.
- Edicao completa de cadastro.
- Exclusao de registros.
- Exportacao de relatorios em PDF e Excel.
- Notificacoes de novos cadastros via canal realtime `novos-membros`.

### Painel da Secretaria

Arquivos principais:

- `public/secretario.html`
- `public/secretario.js`
- `public/secretario.css`

Funcionalidades:

- Login via Supabase Auth.
- Validacao de perfil `secretario` ou perfil permitido conforme policies/funcoes.
- Busca limitada por nome, CPF ou CRNM usando a funcao `buscar_membros_secretaria`.
- Visualizacao dos resultados encontrados.
- Modal de detalhes.
- Edicao de dados cadastrais.
- Upload de arquivos para `membros-docs`.

O painel da secretaria foi pensado para consulta controlada, evitando leitura direta irrestrita da tabela inteira.

### Relatorios

Arquivos principais:

- `public/relatorios.html`
- `public/admin-pages.js`
- `public/admin-pages.css`

Funcionalidades:

- Area restrita para admin.
- Leitura da tabela `membros`.
- Cards de resumo.
- Previa da lista de membros.
- Exportacao em PDF com `jsPDF` e `autoTable`.
- Exportacao em Excel com `xlsx`.

### Indicadores

Arquivos principais:

- `public/indicadores.html`
- `public/admin-pages.js`
- `public/admin-pages.css`

Funcionalidades:

- Area restrita para admin.
- Indicadores de total, cadastros do mes, ativos e aniversariantes.
- Graficos por crescimento mensal, tipo de cadastro, status e setor.
- Alternancia entre barra, linha, pizza e donut.
- Exportacao do grafico em PNG.

### Configuracoes

Arquivos principais:

- `public/configuracoes.html`
- `public/admin-pages.js`
- `public/admin-pages.css`

Funcionalidades:

- Preferencias administrativas salvas no `localStorage`.
- Opcoes para realtime, aniversariantes, confirmacao de exclusao, exportacoes completas, grafico padrao e itens por pagina.
- Area restrita para admin.

### Assistente IA

Arquivos principais:

- `public/suporte-ia.html`
- `public/suporte-ia.js`
- `public/suporte-ia.css`

Funcionalidades:

- Chat moderno com IA via `/api/assistente-suporte`.
- Historico local da conversa.
- Respostas formatadas com titulos, listas, passos e avisos.
- Sugestoes rapidas.
- Indicador de digitacao e loading.
- Botao para abrir chamado transferindo o resumo para o modulo do membro.

### Suporte do Membro

Arquivos principais:

- `public/suporte-membro.html`
- `public/suporte-membro.js`
- `public/suporte-membro.css`

Funcionalidades:

- Abertura de chamado sem login.
- Campos de nome, telefone, e-mail, categoria, prioridade, assunto e mensagem.
- Upload de imagem ou PDF para o bucket `support-attachments-public`.
- Protocolo gerado no banco no formato `SUP-YYYY-NNNN`.
- Consulta por protocolo e contato.
- Lista de chamados carregados no navegador usando `sessionStorage`.
- Chat do chamado com mensagens e anexos.
- Status: `Aguardando`, `Em analise`, `Respondido`, `Encerrado` e `Urgente`.
- Tempo medio exibido: ate 30 minutos.

### Painel de Atendimento de Suporte

Arquivos principais:

- `public/suporte-admin.html`
- `public/suporte-admin.js`
- `public/suporte-admin.css`

Funcionalidades:

- Login via Supabase Auth.
- Validacao de perfil em `profiles`.
- Dashboard de chamados pendentes, em analise, respondidos e urgentes.
- Fila de chamados com busca e filtros por status.
- Visualizacao de dados do solicitante.
- Chat administrativo.
- Resposta do suporte.
- Alteracao de status para `Em analise`, `Urgente`, `Respondido` e `Encerrado`.
- Realtime em `support_tickets` e `support_messages`.

### Assistente Inteligente de Suporte

Arquivos principais:

- `public/api/assistente-suporte.js`
- `api/assistente-suporte.js`

O arquivo em `api/assistente-suporte.js` apenas reexporta o handler de `public/api/assistente-suporte.js`, mantendo compatibilidade com a estrutura de funcoes serverless da Vercel.

Funcionalidades:

- Endpoint `GET` para teste de disponibilidade.
- Endpoint `POST` recebendo `{ messages: [...] }`.
- Uso da variavel de ambiente server-side `GROQ_API_KEY`.
- Modelo `llama-3.3-70b-versatile`.
- Respostas em portugues do Brasil, focadas em login, cadastro, documentos, relatorios, exportacoes, permissoes e uso geral do sistema.
- Validacao de origem, limite de requisicoes, limite de mensagens, limite de tamanho do JSON e timeout para evitar travamentos.
- Respostas sempre em JSON.

## Arquitetura do Projeto

```text
sistema-igreja/
├── api/
│   └── assistente-suporte.js
├── public/
│   ├── api/
│   │   └── assistente-suporte.js
│   ├── index.html
│   ├── cadastro.html / cadastro.js / cadastro.css
│   ├── admin.html / admin.js / admin.css
│   ├── secretario.html / secretario.js / secretario.css
│   ├── suporte-ia.html / suporte-ia.js / suporte-ia.css
│   ├── suporte-membro.html / suporte-membro.js / suporte-membro.css
│   ├── suporte.html (redireciona para suporte-ia.html)
│   ├── suporte-admin.html / suporte-admin.js / suporte-admin.css
│   ├── relatorios.html
│   ├── indicadores.html
│   ├── configuracoes.html
│   ├── admin-pages.js / admin-pages.css
│   ├── config.js
│   ├── supabase-secretario.sql
│   ├── supabase-suporte.sql
│   ├── vercel.json
│   └── imagens e assets
├── ADMINISTRATOR_MANUAL_AD_BELA-VISTA_PTBR.md
├── DATABASE_DOCUMENTATION_AD_BELA-VISTA_PTBR.md
├── DEPLOYMENT_GUIDE_AD_BELA-VISTA_PTBR.md
├── SYSTEM_REQUIREMENTS_AD_BELA-VISTA_PTBR.md
├── USER_MANUAL_AD_BELA-VISTA_PTBR.md
└── README.md
```

## Tecnologias e Dependencias

O projeto nao possui `package.json` na raiz. A interface e carregada diretamente por arquivos estaticos e CDNs.

Dependencias usadas no navegador:

- Supabase JS v2: autenticacao, banco, storage e realtime.
- Font Awesome: icones.
- Google Fonts: tipografia.
- Chart.js: graficos.
- jsPDF: exportacao PDF.
- jsPDF AutoTable: tabelas em PDF.
- xlsx: exportacao Excel.

Dependencia serverless:

- API nativa da Groq via `fetch` no endpoint `public/api/assistente-suporte.js`.

## Rotas e Telas

| Caminho | Finalidade | Acesso |
|---|---|---|
| `public/index.html` | Redireciona para cadastro | Publico |
| `public/cadastro.html` | Ficha de cadastro | Publico |
| `public/admin.html` | Painel do pastor/admin | Restrito a `admin` |
| `public/secretario.html` | Busca e manutencao pela secretaria | Restrito a usuario autenticado com permissao |
| `public/relatorios.html` | Relatorios e exportacoes | Restrito a `admin` |
| `public/indicadores.html` | Graficos e indicadores | Restrito a `admin` |
| `public/configuracoes.html` | Preferencias locais do painel | Restrito a `admin` |
| `public/suporte-ia.html` | Assistente IA de suporte | Publico |
| `public/suporte-membro.html` | Abertura e acompanhamento de chamados | Publico |
| `public/suporte.html` | Entrada antiga, redireciona para o assistente IA | Publico |
| `public/suporte-admin.html` | Atendimento de chamados | Restrito a perfis de suporte/admin |
| `/api/assistente-suporte` | Assistente de IA | Serverless |

## Banco de Dados e Storage

### Tabela `membros`

Entidade principal do cadastro. Os scripts usam campos como:

- `id`
- `nome`
- `tipo_cadastro`
- `status`
- `cpf`
- `rg`
- `tipo_cpf`
- `data_nasc`
- `idade`
- `sexo`
- `tipo_sanguineo`
- `escolaridade`
- `estado_civil`
- `conjuge_nome`
- `data_casamento`
- `cep`
- `bairro`
- `endereco`
- `cidade_estado`
- `fone_res`
- `fone_com`
- `celular`
- `email`
- `ocupacao`
- `empresa`
- `forma_recebimento`
- `setor_igreja`
- `congregacao_igreja`
- `igreja_anterior`
- `igreja_cidade`
- `igreja_pastor`
- `data_batismo_aguas`
- `data_batismo_es`
- `data_aprovacao`
- `cargo_principal`
- `outras_funcoes`
- `qtd_filhos`
- `nome_dep1`, `parentesco_dep1`
- `nome_dep2`, `parentesco_dep2`
- `nome_dep3`, `parentesco_dep3`
- `talentos`
- `tem_computador`
- `tem_internet`
- URLs de midia, como `foto_url`, `doc_url`, `assinatura_url` e anexos relacionados.

### Tabela `profiles`

Criada e mantida pelo SQL de secretaria/suporte. Controla autorizacao por usuario autenticado.

Campos principais:

- `id`: referencia `auth.users(id)`.
- `role`: perfil de acesso.
- `created_at`: data de criacao.

Roles usadas no projeto:

- `admin`
- `secretario`
- `pastor`
- `suporte`

O painel admin principal exige explicitamente `role = 'admin'`.

### Funcoes do Supabase

Funcoes definidas nos SQLs:

- `tem_role(roles text[])`: helper para policies por perfil.
- `buscar_membros_secretaria(...)`: busca limitada para a secretaria.
- `support_is_admin_or_support()`: valida perfis administrativos no suporte.
- `support_set_updated_at()`: atualiza `updated_at` em chamados.
- `support_generate_protocol()`: gera protocolo `SUP-YYYY-NNNN`.
- `support_notify_on_new_message()`: cria notificacoes quando ha mensagens.
- `support_log_ticket_insert()`: registra criacao de chamado.
- `support_log_ticket_update()`: registra mudancas relevantes no chamado.
- `support_open_public_ticket(...)`: abre chamado publico e cria a primeira mensagem.

### Tabelas de suporte

Definidas em `public/supabase-suporte.sql`:

- `support_tickets`: chamado principal.
- `support_messages`: mensagens do chamado.
- `support_notifications`: notificacoes de suporte.
- `support_logs`: historico tecnico do chamado.

Campos importantes de `support_tickets`:

- `id`
- `protocol`
- `user_id`
- `user_name`
- `user_phone`
- `user_email`
- `subject`
- `category`
- `description`
- `priority`
- `status`
- `rating`
- `rating_comment`
- `created_at`
- `updated_at`
- `last_message_at`

Campos importantes de `support_messages`:

- `id`
- `ticket_id`
- `sender_id`
- `sender_name`
- `sender_type`
- `sender_role`
- `message`
- `attachment_url`
- `created_at`

### Buckets de Storage

Buckets usados ou esperados pelo codigo:

| Bucket | Uso |
|---|---|
| `membros-docs` | Uploads do cadastro, assinatura e arquivos da secretaria |
| `membros-public` | Uploads publicos do cadastro quando aplicavel |
| `membros` | Uploads/remoção referenciados pelo painel admin |
| `support-attachments-public` | Anexos de chamados de suporte |

Ponto importante: o cadastro e a secretaria usam `membros-docs`, mas `admin.js` referencia o bucket `membros`. Antes de operar em producao, confirme se os buckets existem e se as policies permitem as leituras/escritas esperadas.

## Permissoes e Seguranca

O projeto usa Supabase Auth e Row Level Security.

Regras principais:

- Cadastro publico pode inserir registros na tabela `membros`.
- Admin pode visualizar, inserir, atualizar e excluir membros.
- Secretaria pode buscar membros pela funcao controlada e atualizar registros.
- Suporte/admin pode visualizar e responder chamados.
- Chamados publicos podem ser abertos sem login via funcao `support_open_public_ticket`.
- Anexos de suporte ficam em bucket publico, conforme SQL atual.

Boas praticas:

- Nao compartilhe credenciais entre usuarios.
- Revogue acessos quando houver troca de equipe.
- Garanta que cada usuario autenticado tenha uma linha correta em `profiles`.
- Mantenha RLS habilitado nas tabelas sensiveis.
- Evite expor dados pessoais fora dos paineis restritos.

Observacao: a chave anon do Supabase em `public/config.js` e normal em projetos frontend, mas a seguranca depende diretamente das policies de RLS e das funcoes protegidas no banco.

## Configuracao do Ambiente

### Supabase

Edite `public/config.js`:

```js
window.CONFIG = {
  SUPABASE_URL: "https://seu-projeto.supabase.co",
  SUPABASE_KEY: "sua-chave-anon"
};
```

Opcionalmente, para o assistente:

```js
window.CONFIG.SUPPORT_AI_ENDPOINT = "/api/assistente-suporte";
```

### SQL necessario

Execute no SQL Editor do Supabase:

1. Estrutura principal da tabela `membros`, caso ainda nao exista.
2. `public/supabase-secretario.sql` para perfis, roles, policies e busca da secretaria.
3. `public/supabase-suporte.sql` para suporte, tickets, mensagens, notificacoes, logs e bucket de anexos.

O script de suporte tambem cria as funcoes publicas seguras usadas pela pagina do membro:

- `support_open_public_ticket(...)`: abre chamado sem expor inserts diretos.
- `support_get_public_ticket(...)`: consulta protocolo com ticket/id ou protocolo + contato.
- `support_add_public_message(...)`: adiciona resposta do membro sem liberar insert anonimo direto na tabela.

Depois de atualizar esse arquivo, rode novamente `public/supabase-suporte.sql` no SQL Editor do Supabase para aplicar as novas RLS, validacoes e funcoes RPC.

Depois crie usuarios em Authentication e associe perfis:

```sql
insert into public.profiles (id, role)
select id, 'admin'
from auth.users
where email = 'email-do-admin@exemplo.com'
on conflict (id) do update set role = excluded.role;

insert into public.profiles (id, role)
select id, 'secretario'
from auth.users
where email = 'email-da-secretaria@exemplo.com'
on conflict (id) do update set role = excluded.role;
```

Para atendimento de suporte, use roles como `admin`, `pastor`, `secretario` ou `suporte`, conforme `support_is_admin_or_support()`.

### Vercel e Groq

Para usar o assistente inteligente, configure variaveis no ambiente da Vercel:

| Variavel | Obrigatoria | Finalidade |
|---|---|---|
| `GROQ_API_KEY` | Sim | Chave da API da Groq usada somente no backend |
| `SUPPORT_AI_ALLOWED_ORIGINS` | Nao | Lista de origens permitidas separadas por virgula, util para dominios customizados |

Sem `GROQ_API_KEY`, o endpoint retorna erro informando que o assistente esta indisponivel.

Nunca coloque `GROQ_API_KEY` em arquivos dentro de `public/`, HTML, CSS ou JavaScript do navegador. Configure a variavel em Vercel Project Settings > Environment Variables e, localmente, use `.env` fora do controle de versao.

## Como Executar Localmente

Como o projeto e estatico, ha duas formas simples:

### Abrir direto no navegador

Abra:

```text
public/cadastro.html
```

Esse modo funciona para telas estaticas e chamadas diretas ao Supabase, mas pode ter limitacoes com rotas serverless e CORS dependendo do navegador.

### Servir a pasta `public`

Use qualquer servidor estatico. Exemplos:

```powershell
npx serve public
```

ou:

```powershell
python -m http.server 5500 -d public
```

Depois acesse:

```text
http://localhost:5500/cadastro.html
```

Para testar `/api/assistente-suporte` localmente como funcao serverless, use o ambiente da Vercel CLI ou publique em um preview da Vercel com as variaveis configuradas.

## Deploy

O projeto inclui `public/vercel.json` com rewrites:

- `/api/(.*)` para manter endpoints serverless.
- `/(.*)` para direcionar rotas para `index.html`.

Passos recomendados:

1. Configure `public/config.js` com URL e chave anon do Supabase.
2. Crie/valide tabelas, funcoes, triggers, buckets e policies no Supabase.
3. Configure usuarios e roles em `profiles`.
4. Configure `GROQ_API_KEY` na Vercel se o assistente for usado.
5. Publique a pasta do projeto na Vercel.
6. Teste as telas principais:
   - `cadastro.html`
   - `admin.html`
   - `secretario.html`
   - `relatorios.html`
   - `indicadores.html`
   - `suporte-ia.html`
   - `suporte-membro.html`
   - `suporte-admin.html`
7. Valide uploads, assinatura, exportacoes, realtime e abertura de chamados.

## Operacao do Sistema

### Rotina diaria

- Conferir novos cadastros no painel admin.
- Validar indicador de ultimo cadastro.
- Verificar aniversariantes do mes.
- Responder chamados pendentes.
- Revisar dados incompletos ou anexos faltantes.

### Rotina mensal

- Exportar PDF/Excel para controle administrativo.
- Conferir consistencia de setores, cargos e status.
- Verificar se fotos, documentos e assinaturas continuam acessiveis.
- Revisar usuarios ativos e roles na tabela `profiles`.
- Avaliar chamados recorrentes para melhorar orientacoes internas.

### Status usados em membros

- `Ativo`
- `Inativo`
- `Transferido`
- `Falecido`

### Tipos de cadastro

- `Membro`
- `Congregado`

### Prioridades de suporte

- `Baixa`
- `Normal`
- `Alta`
- `Urgente`

### Status de suporte

- `Pendente`
- `Em analise`
- `Respondido`
- `Urgente`
- `Encerrado`

## Documentacao Complementar

Arquivos ja existentes no repositorio:

| Arquivo | Conteudo |
|---|---|
| `USER_MANUAL_AD_BELA-VISTA_PTBR.md` | Manual de uso para equipe |
| `ADMINISTRATOR_MANUAL_AD_BELA-VISTA_PTBR.md` | Procedimentos administrativos |
| `DEPLOYMENT_GUIDE_AD_BELA-VISTA_PTBR.md` | Guia de publicacao |
| `SYSTEM_REQUIREMENTS_AD_BELA-VISTA_PTBR.md` | Requisitos do sistema |
| `DATABASE_DOCUMENTATION_AD_BELA-VISTA_PTBR.md` | Modelo de dados descritivo |
| `README_DOCUMENTACAO_AD_BELA-VISTA.md` | Indice antigo da documentacao |
| `TODO.md` | Pendencias gerais da central de suporte |
| `public/TODO.md` | Pendencias especificas da central de ajuda |

## Pontos de Atencao

- Alguns documentos antigos do repositorio parecem ter sido salvos com codificacao quebrada. Este README foi reescrito como referencia limpa.
- Nao ha `package.json` na raiz, apesar de existir `node_modules`. O projeto, no estado atual, depende principalmente de arquivos estaticos e CDNs.
- Confirme a existencia dos buckets `membros-docs`, `membros-public`, `membros` e `support-attachments-public`.
- Confirme se a tabela `membros` possui todos os campos usados pelos formularios antes de colocar em producao.
- Realtime precisa estar habilitado no Supabase para as tabelas usadas por notificacoes e suporte.
- O bucket `support-attachments-public` e publico no SQL atual. Se anexos de suporte forem sensiveis, troque para bucket privado e adapte o front-end para URLs assinadas.
- O painel admin exige `role = 'admin'`; outros perfis nao passam nessa tela mesmo que existam em `profiles`.
- O assistente de IA nao altera dados no sistema. Ele apenas orienta o usuario e sugere abertura de chamado quando necessario.

## Licenca e Uso

Este projeto e direcionado ao uso interno da Igreja AD Bela-Vista. Antes de reutilizar em outro contexto, revise dados, identidade visual, URLs, chaves, policies de seguranca e textos operacionais.
