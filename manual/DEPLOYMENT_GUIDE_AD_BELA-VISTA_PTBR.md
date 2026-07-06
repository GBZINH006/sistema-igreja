# AD Bela-Vista - Guia de Deploy

**Versao do documento:** 1.1  
**Publico:** equipe tecnica/administrador do sistema.

---

## 1. Visao Geral

Este guia descreve como publicar e validar o sistema web da AD Bela-Vista conforme a estrutura atual do projeto.

O sistema e uma aplicacao estatica hospedada a partir da pasta `public/`, com paginas HTML em `public/pages/`, scripts em `public/js/`, estilos em `public/css/`, SQLs de apoio em `public/db/` e assets em `public/assets/`.

---

## 2. Estrutura Atual do Projeto

### 2.1 Paginas principais
- `public/pages/cadastro.html`: ficha publica de cadastro.
- `public/pages/admin.html`: painel do pastor/administrador.
- `public/pages/secretario.html`: painel da secretaria.
- `public/pages/membro-login.html`: login/criacao de conta do membro.
- `public/pages/membro.html`: portal do membro.
- `public/pages/relatorios.html`, `public/pages/indicadores.html`, `public/pages/configuracoes.html`: paginas auxiliares administrativas.
- `public/pages/privacidade.html`: pagina de privacidade/LGPD.

### 2.2 Arquivos de suporte
- `public/js/`: scripts das paginas.
- `public/css/`: estilos das paginas.
- `public/db/`: scripts SQL do Supabase.
- `public/assets/`: imagens e demais assets.
- `public/vercel.json`: configuracao de headers e rewrite para deploy.

> **Importante:** Os caminhos antigos diretamente em `public/` foram reorganizados. Para manutencao, considere os arquivos em `public/pages`, `public/js`, `public/css` e `public/db`.

---

## 3. Requisitos para Funcionamento

- Navegador moderno: Chrome, Edge ou Firefox atualizado.
- Acesso aos CDNs usados pela interface:
  - Supabase JS
  - jsPDF
  - jsPDF AutoTable
  - Chart.js
  - XLSX
  - Font Awesome
  - Google Fonts
- Projeto Supabase configurado.
- Arquivo `config.js` disponivel para as paginas, com:
  - `SUPABASE_URL`
  - `SUPABASE_KEY` anonima
- Bucket privado `membros-docs` configurado no Supabase Storage.
- Politicas RLS e roles aplicadas no Supabase.

> **Seguranca:** nunca coloque chave `service_role` em arquivo publico.

---

## 4. Banco de Dados e Permissoes

Antes de publicar ou apos recriar o ambiente, valide os SQLs em `public/db/`:

- `supabase-security-hardening.sql`: roles, RLS, auditoria e bucket privado.
- `supabase-secretario.sql`: suporte ao painel da secretaria.
- `supabase-membro.sql`: suporte ao portal/conta do membro e funcoes relacionadas.

### Roles esperadas
- `admin`: acesso ao painel admin/pastor e permissao para excluir cadastros.
- `pastor`: acesso ao painel admin/pastor sem permissao de exclusao.
- `secretario`: acesso ao painel da secretaria.
- `suporte`: role prevista nos SQLs para suporte tecnico, conforme politica aplicada.

---

## 5. Passo a Passo de Deploy

1. Confirme que a pasta `public/` sera usada como diretorio estatico do deploy.
2. Configure o ambiente para servir corretamente os arquivos dentro de `public/pages/`.
3. Garanta que `config.js` esteja acessivel pelas paginas publicadas.
4. Publique os arquivos estaticos do projeto.
5. No Supabase, rode/valide os scripts SQL necessarios.
6. Crie usuarios no Supabase Auth para pastor, admin e secretaria.
7. Insira os perfis correspondentes em `public.profiles`.
8. Teste os fluxos principais.

---

## 6. Validacao Pos-Deploy

- [ ] `cadastro.html` abre e permite escolher Membro ou Congregado.
- [ ] Cadastro envia dados, anexos e assinatura.
- [ ] `admin.html` permite login de `admin` e `pastor`.
- [ ] `secretario.html` permite login de `secretario`.
- [ ] Admin/pastor visualiza lista, filtros, cards, graficos e aniversariantes.
- [ ] Indicador **Ultimo cadastro** mostra o registro mais recente.
- [ ] Realtime/notificacoes funcionam quando um novo cadastro e criado.
- [ ] PDF e Excel sao gerados com dados.
- [ ] Admin consegue excluir cadastro.
- [ ] Pastor nao consegue excluir cadastro.
- [ ] Secretaria consegue pesquisar, visualizar, editar e imprimir fichas conforme permissao.
- [ ] URLs assinadas de anexos/fotos/documentos carregam corretamente.

---

## 7. Observacoes de Operacao

- O `vercel.json` define headers de seguranca e rewrite para `cadastro.html`.
- Caso o deploy use subpastas ou rotas diferentes, revise os caminhos relativos usados nos HTMLs.
- O realtime depende da configuracao do Supabase e da disponibilidade da conexao WebSocket.
- Exporte periodicamente PDF/Excel apenas como apoio operacional; o backup principal deve ser feito no banco e no Storage.

---

## 8. Boas Praticas

- Fazer backup de dados e anexos antes de alteracoes grandes.
- Validar SQLs em ambiente de teste antes de producao.
- Manter contas individuais por funcao.
- Revogar acessos quando houver troca de equipe.
- Conferir se os CDNs externos estao acessiveis no ambiente da igreja.
