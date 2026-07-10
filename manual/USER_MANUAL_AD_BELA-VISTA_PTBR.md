# AD Bela-Vista - Manual do Usuario

**Sistema:** Gestao de Membros da AD Bela-Vista  
**Versao do documento:** 1.1  
**Publico:** pastor, administrador, secretaria e equipe autorizada.

---

## 1. Visao Geral

O sistema permite:

- cadastrar novos membros e congregados;
- consultar e manter fichas;
- anexar fotos, documentos e assinatura digital;
- acompanhar estatisticas e aniversariantes;
- exportar dados em PDF e Excel;
- receber alertas de novos cadastros no painel admin/pastor;
- realizar consultas operacionais pelo painel da secretaria.

### Telas principais
- `public/pages/cadastro.html`: ficha publica de cadastro.
- `public/pages/admin.html`: painel do pastor/administrador.
- `public/pages/secretario.html`: painel da secretaria.
- `public/pages/membro-login.html`: login/criacao de conta do membro.
- `public/pages/membro.html`: portal do membro.

---

## 2. Acesso

### 2.1 Painel do pastor/administrador
1. Abra `public/pages/admin.html`.
2. Informe e-mail e senha.
3. Clique em **Entrar no Painel**.
4. Aguarde a validacao de acesso.

Podem entrar nesse painel usuarios com role:
- `admin`
- `pastor`

> **Atencao:** somente `admin` pode excluir cadastros.

### 2.2 Painel da secretaria
1. Abra `public/pages/secretario.html`.
2. Informe e-mail e senha.
3. Clique em **Entrar no Painel**.

Podem entrar nesse painel usuarios com role:
- `secretario`

### 2.3 Acesso negado
Se o usuario nao tiver a role correta, o sistema exibe mensagem de acesso negado e retorna para a tela de login.

### 2.4 Esqueci minha senha
Na tela de login do painel admin/pastor ou da secretaria:
1. Clique em **Esqueci minha senha**.
2. Informe o e-mail do usuario.
3. Clique em **Enviar codigo por e-mail**.
4. Digite o codigo recebido no e-mail.
5. Informe e confirme a nova senha.
6. Clique em **Trocar senha** e entre novamente.

Se o e-mail recebido vier como link de recuperacao, abra o link e informe a nova senha na tela exibida.

---

## 3. Cadastro de Membros e Congregados

### 3.1 Abrir ficha
- No painel admin/pastor, use o botao **Abrir ficha**.
- No painel da secretaria, use o botao **Novo cadastro**.
- Tambem e possivel abrir diretamente `public/pages/cadastro.html`, conforme o deploy.

### 3.2 Escolher tipo de cadastro
Na tela inicial, selecione:
- **Membro**
- **Congregado**

O modo **Congregado** mostra um fluxo mais enxuto e oculta campos que pertencem ao cadastro completo de membro.

### 3.3 Campos obrigatorios principais
Para Congregado:
- Nome
- CPF/CRNM
- Celular
- Estado civil
- Assinatura digital
- Aceite LGPD/privacidade

Para Membro:
- Nome
- CPF/CRNM
- Celular
- Assinatura digital
- Aceite LGPD/privacidade
- Demais campos visiveis conforme a ficha completa

### 3.4 Envio
1. Preencha os dados.
2. Anexe fotos/documentos quando necessario.
3. Registre a assinatura digital.
4. Aceite os termos de privacidade.
5. Clique em **Enviar Cadastro**.
6. Aguarde a tela de sucesso.

---

## 4. Painel Admin/Pastor

Ao entrar em `public/pages/admin.html`, o usuario ve:

- cards de total, membros, congregados, ativos e cadastros do mes;
- indicador **Ultimo cadastro**;
- graficos de crescimento, membros/congregados e setor;
- aniversariantes do mes;
- busca e filtros;
- tabela de cadastros;
- notificacoes de novos cadastros;
- exportacao PDF/Excel;
- assinatura do pastor para fichas.

### 4.1 Busca e filtros
E possivel filtrar por:
- texto de busca;
- tipo;
- status;
- setor;
- faixa de idade;
- cargo.

### 4.2 Visualizar detalhes
Na tabela, use a acao de visualizar para abrir a ficha do membro/congregado.

Dentro da ficha podem aparecer:
- dados pessoais;
- contato;
- igreja/setor/cargo;
- foto;
- documento;
- assinatura;
- botoes de WhatsApp, editar e PDF completo.

### 4.3 Editar cadastro
1. Abra o cadastro.
2. Clique em **Editar**.
3. Altere os dados necessarios.
4. Clique em **Salvar Alteracoes**.

### 4.4 Excluir cadastro
Somente usuario com role `admin` pode excluir.

O sistema exibe confirmacao antes da exclusao e tenta remover arquivos vinculados no Storage quando aplicavel.

---

## 5. Painel da Secretaria

O painel da secretaria fica em `public/pages/secretario.html`.

Ele e voltado para consulta e manutencao operacional.

### 5.1 Buscar cadastro
1. Digite nome, parte do nome, CPF ou CRNM.
2. Use pelo menos 3 letras do nome ou 4 numeros do documento.
3. Clique em **Buscar**.

### 5.2 Acoes disponiveis
A secretaria pode:
- visualizar detalhes;
- editar dados permitidos;
- atualizar foto, documento e assinatura;
- imprimir ficha;
- abrir novo cadastro.

---

## 6. Anexos e Assinaturas

O sistema usa o bucket privado `membros-docs` no Supabase Storage.

Campos de midia usados pelo sistema:
- `foto_url`
- `doc_url`
- `foto_certidao_nasc`
- `foto_certidao_casamento`
- `foto_diploma`
- `foto_comprovante_end`
- `assinatura_url`

As URLs sao assinadas e podem expirar. Ao abrir fichas, o sistema tenta renovar URLs quando necessario.

---

## 7. Exportacoes

### 7.1 PDF
No painel admin/pastor, clique em **PDF** para gerar:
- `membros_adbela-vista_2026.pdf`

### 7.2 Excel
No painel admin/pastor, clique em **Excel** para gerar:
- `membros_adbela-vista_2026.xlsx`

### 7.3 PDF completo da ficha
Na ficha individual, use **PDF completo** para gerar um documento mais detalhado do cadastro, incluindo declaracao e assinaturas quando disponiveis.

---

## 8. Notificacoes

O painel admin/pastor escuta novos registros na tabela `membros` via realtime do Supabase.

Quando um novo cadastro chega:
- o sino pode mostrar contador;
- o historico de novos cadastros e atualizado;
- o indicador **Ultimo cadastro** muda para o registro mais recente;
- a lista e os cards sao atualizados.

> **Observacao:** o historico em tela vale para a sessao aberta no navegador.

---

## 9. Aniversariantes e Graficos

O painel admin/pastor mostra:
- aniversariantes do mes;
- crescimento mensal dos ultimos meses;
- proporcao entre membros e congregados;
- membros por setor.

Se os dados parecerem desatualizados, use o botao de atualizar lista.

---

## 10. Logout

Clique em **Sair** no painel correspondente.

O sistema encerra a sessao e volta para a tela de login.

---

## 11. Perguntas Frequentes

| Pergunta | Resposta |
|---|---|
| Secretaria entra pelo painel admin? | Nao. A secretaria usa `public/pages/secretario.html`. |
| Pastor pode excluir cadastro? | Nao. Exclusao e restrita a role `admin`. |
| O que e "Ultimo cadastro"? | E o cadastro mais recente identificado por `created_at` ou `commit_timestamp`. |
| Por que anexo nao abre? | A URL assinada pode ter expirado ou o Storage pode estar sem permissao correta. |
| Posso exportar backup por PDF/Excel? | Pode como apoio, mas backup oficial deve ser feito no banco e Storage. |

---

## 12. Boas Praticas

- Nao compartilhar credenciais.
- Usar contas separadas por funcao.
- Conferir celular/WhatsApp antes de salvar.
- Padronizar setor, congregacao e cargo.
- Revisar anexos antes de concluir.
- Fazer backup periodico no Supabase.
