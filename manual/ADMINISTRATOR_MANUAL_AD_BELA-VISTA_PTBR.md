# AD Bela-Vista - Manual do Administrador

**Versao do documento:** 1.1  
**Publico:** administrador tecnico, pastor responsavel e pessoa autorizada a manter o sistema.

---

## 1. Objetivo

Definir procedimentos para:
- manter o acesso ao painel administrativo;
- acompanhar cadastros recem-criados;
- validar integracoes com Supabase e Storage;
- orientar permissoes de pastor, admin e secretaria;
- garantir o funcionamento continuo da gestao de membros.

> **Importante:** Este documento descreve o comportamento observado na interface e no codigo atual do projeto.

---

## 2. Visao do Sistema

### 2.1 Telas principais
- `public/pages/cadastro.html` / `public/js/cadastro.js`: captura e envio de novos cadastros.
- `public/pages/admin.html` / `public/js/admin.js`: painel do pastor/administrador.
- `public/pages/secretario.html` / `public/js/secretario.js`: painel da secretaria.
- `public/pages/membro-login.html` e `public/pages/membro.html`: portal do membro.

### 2.2 Funcionalidades-chave do painel admin/pastor
- Cards de status e estatisticas.
- Filtros, busca dinamica e paginacao.
- Modais de detalhes e edicao.
- Exportacao PDF e Excel.
- PDF completo da ficha do membro.
- Notificacoes de novos cadastros via realtime.
- Indicador **Ultimo cadastro** no painel principal.
- Configuracao de assinatura do pastor para fichas.

### 2.3 Funcionalidades-chave do painel da secretaria
- Busca por nome, parte do nome, CPF ou CRNM.
- Visualizacao de resultados restrita a consulta necessaria.
- Edicao de dados e anexos permitidos.
- Impressao/ficha do cadastro.
- Abertura de novo cadastro.

---

## 3. Permissoes e Papeis

O sistema usa a tabela `profiles` no Supabase para validar a role do usuario.

| Role | Acesso esperado |
|---|---|
| `admin` | Painel admin/pastor; pode editar, exportar e excluir cadastros. |
| `pastor` | Painel admin/pastor; pode consultar, editar, exportar e gerenciar assinatura, sem excluir cadastros. |
| `secretario` | Painel da secretaria; pode pesquisar, consultar, editar e imprimir conforme fluxo do painel. |
| `suporte` | Role prevista nos SQLs para apoio tecnico, conforme politicas aplicadas. |

> **Atencao:** Credenciais devem ser individuais. Evite contas compartilhadas.

---

## 4. Operacao do Indicador "Ultimo cadastro"

### 4.1 Comportamento esperado
- Ao abrir o painel admin/pastor, o sistema identifica o cadastro mais recente.
- A ordenacao considera `created_at` e usa `commit_timestamp` como fallback quando disponivel.
- O painel mostra:
  - nome do cadastro;
  - data/hora do registro.
- Quando um novo cadastro chega via realtime, o indicador e atualizado imediatamente.

### 4.2 Onde verificar
- No painel admin/pastor, secao **Ultimo cadastro**.

### 4.3 Casos de falha comuns
- Registros antigos sem `created_at` podem ficar com ordenacao imprecisa.
- Realtime pode falhar se a conexao WebSocket ou a configuracao do Supabase estiver indisponivel.
- Se a pagina ficar aberta por muito tempo, recarregue a lista pelo botao de atualizar.

---

## 5. Rotina Diaria

- [ ] Abrir `public/pages/admin.html` com usuario `admin` ou `pastor`.
- [ ] Conferir o indicador **Ultimo cadastro**.
- [ ] Conferir notificacoes no sino.
- [ ] Usar o botao de atualizar lista se necessario.
- [ ] Verificar se fotos/documentos carregam.
- [ ] Usar `public/pages/secretario.html` para consultas operacionais da secretaria.

---

## 6. Rotina Mensal

- [ ] Conferir integridade de fotos, documentos e assinaturas.
- [ ] Conferir se exportacoes PDF/Excel incluem os dados esperados.
- [ ] Revisar padronizacao de setor, congregacao e cargo.
- [ ] Revisar usuarios ativos e remover acessos antigos.
- [ ] Confirmar que o bucket `membros-docs` continua privado.

---

## 7. Troubleshooting

### Problema: usuario nao entra no painel admin
- Confirme se o usuario existe no Supabase Auth.
- Confirme se existe registro correspondente em `public.profiles`.
- Confirme se a role e `admin` ou `pastor`.
- Se o usuario esqueceu a senha, use **Esqueci minha senha** na tela de login para enviar codigo/link de recuperacao por e-mail.

### Problema: secretaria nao entra
- Use `public/pages/secretario.html`.
- Confirme se a role do usuario e `secretario`.
- Se a secretaria esqueceu a senha, use **Esqueci minha senha** no painel da secretaria.

### Problema: codigo de recuperacao nao chega
- Confirme se o e-mail esta correto no Supabase Auth.
- Verifique caixa de spam/lixo eletronico.
- Confirme se o template de recuperacao do Supabase envia codigo ou link.
- Se necessario, o administrador tecnico pode redefinir o acesso diretamente no Supabase.

### Problema: indicador nao atualiza
- Recarregue a lista pelo botao de atualizar.
- Verifique o console do navegador.
- Confirme se o cadastro foi salvo com sucesso.
- Confirme se o realtime do Supabase esta ativo.

### Problema: exportacao vazia
- Confirme se a lista foi carregada.
- Recarregue o painel.
- Confirme se o usuario tem permissao de leitura na tabela `membros`.

### Problema: anexos nao aparecem
- Confirme se o bucket `membros-docs` existe.
- Confirme politicas de leitura e URLs assinadas.
- Gere novamente a URL assinada ao abrir/editar a ficha.

---

## 8. Conclusao

O sistema foi construido para facilitar o acompanhamento de membros, congregados e fichas da AD Bela-Vista. O administrador deve garantir:
- acesso restrito por role;
- integridade dos cadastros e anexos;
- funcionamento do painel admin/pastor;
- funcionamento do painel da secretaria;
- backup e manutencao periodica do banco e Storage.
