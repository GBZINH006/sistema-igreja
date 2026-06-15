# AD Bela-Vista — Manual do Usuário (Staff)

**Sistema:** Gestão de Membros (AD Bela-Vista · Palhoça - SC)  
**Versão do documento:** 1.0  
**Objetivo:** Orientar o time da igreja (secretaria/pastor) a cadastrar, consultar e manter as fichas de membros.

---

## 1. Capa

**AD Bela-Vista**  
**Manual do Usuário (Staff)**  
Gestão de Membros — 2026

---

## 2. Visão Geral do Sistema

O sistema permite:

- **Cadastrar novos membros/congregados** via formulário.
- **Gerenciar cadastros** no painel do pastor (editar e excluir).
- **Buscar e filtrar** membros por critérios.
- **Visualizar detalhes completos** em modal.
- **Gerenciar fotos e documentos** anexados.
- **Acompanhar aniversariantes do mês**.
- **Exportar relatórios** em PDF e Excel.
- **Receber alertas de novos cadastros** no painel.

> **Nota:** A interface é dividida em duas frentes principais:
> 1) `cadastro.html` (cadastro)  
> 2) `admin.html` (painel administrativo/pastor)

---

## 3. Acesso e Login

### 3.1 Entrar no Painel do Pastor
1. Abra `admin.html`.
2. Preencha **E-mail** e **Senha**.
3. Clique em **“✝ Entrar no Painel”**.
4. Aguarde a mensagem **“Verificando acesso…”** até carregar.

### 3.2 Tela de acesso negado
Se o usuário não tiver permissão, o sistema exibirá um alerta informando que o acesso foi negado.

> **Atenção:** Credenciais e permissões devem ser ajustadas pelo administrador técnico do sistema.

---

## 4. Visão Geral do Dashboard (Admin)

Ao entrar no painel, você verá:

1. **Stats (cards de resumo)**
   - Total
   - Membros
   - Congregados
   - Ativos
   - Este mês

2. **📌 Último cadastro** (novo)
   - **Nome** do último cadastro
   - **Data/hora** do cadastro

3. **Gráficos e Aniversariantes**
   - Crescimento mensal
   - Membros vs Congregados
   - Membros por setor
   - Aniversariantes do mês

4. **Toolbar de busca e filtros**
   - Buscar por nome, CPF ou celular
   - Tipo (Membro/Congregado)
   - Status (Ativo/Inativo/Transferido/Falecido)
   - Setor
   - Idade (faixas)
   - Cargo

5. **Tabela principal**
   - Nome, tipo, status, celular, setor e ações.

6. **Notificações (sino)**
   - Exibe quantos novos cadastros chegaram (quando houver)
   - Modal “Novos Cadastros” com histórico

---

## 5. Cadastrando Novos Membros

### 5.1 Abrir o formulário de cadastro
1. No painel administrativo, clique em **“Novo cadastro”** (abre em nova aba).
2. O sistema abrirá `cadastro.html`.

### 5.2 Escolher tipo de cadastro
1. Na etapa inicial, selecione:
   - **Membro** ou
   - **Congregado**

> **Dica:** O modo **Congregado** mostra um fluxo mais enxuto (campos mínimos).

### 5.3 Preencher o formulário por etapas
O formulário é guiado por etapas (stepper), com cards de seções como:
- Identificação
- Contato
- Documentos
- Igreja e família
- Assinatura

#### Progresso
- A barra de progresso mostra quantos campos mínimos já foram preenchidos.

### 5.4 Campos obrigatórios (visão geral)
No modo **Congregado**, a validação considera campos mínimos como:
- Nome
- CPF/CRNM
- Celular
- Estado civil
- Assinatura digital

No modo **Membro**, além desses, há outros campos conforme a ficha.

> **Atenção:** Antes de enviar, revise sempre se a **assinatura digital** está registrada.

### 5.5 Enviar o cadastro
1. Clique em **“✝ Enviar Cadastro”**.
2. Aguarde o envio (inclui anexos de fotos/documentos e assinatura).
3. Ao concluir, aparece a tela de sucesso.

---

## 6. Editando Informações de Membros

### 6.1 Acessar a edição
1. No painel admin, localize o registro na tabela.
2. Clique em **✏️** (Editar).
3. O modal “✏️ Editar Cadastro” abrirá.

### 6.2 Como salvar alterações
1. Faça as mudanças necessárias.
2. Clique em **“💾 Salvar Alterações”**.
3. Aguarde o carregamento final e feche o modal.

### 6.3 Cancelar edição
- Clique em **Cancelar** ou **✕ Fechar**.

> **Nota:** Se você alterar fotos/documentos, o sistema faz upload e atualiza as referências.

---

## 7. Busca e Filtragem de Registros

### 7.1 Busca rápida
- Use a caixa **“Buscar por nome, CPF ou celular…”**.
- A busca é aplicada enquanto você digita (oninput).

### 7.2 Filtros
Você pode combinar:
- **Tipo**
- **Status**
- **Setor**
- **Faixa de idade**
- **Cargo**

> **Dica:** Para refinar, selecione um filtro de setor e depois use busca por nome.

---

## 8. Visualizando Detalhes do Membro

### 8.1 Abrir ficha completa
1. Na tabela, clique em **👁**.
2. O modal “detalhes” mostrará dados pessoais, contato, igreja, e documentos (se houver).

### 8.2 Ações dentro do modal
- **Editar** (abrirá o modal de edição)
- **Imprimir** (gera versão para impressão)
- **Excluir** (confirmação antes de deletar)
- **WhatsApp** (quando o celular existe)

---

## 9. Gerenciando Fotos e Documentos

### 9.1 Upload no cadastro
- Use **botão Arquivo** ou **Câmera** (quando disponível).
- O sistema faz pré-visualização antes do envio.

### 9.2 Upload no painel admin (edição)
- No modal de edição, use:
  - **📁 Arquivo**
  - **📷 Câmera**

### 9.3 Sem foto/documento
- O sistema exibe placeholders (“Sem foto”, “Sem documento”) quando não houver anexos.

---

## 10. Dashboard de Aniversariantes

1. Localize o card **“🎂 Aniversariantes do mês”**.
2. Ele é expandível/recolhível.
3. Para cada aniversariante, o sistema exibe:
   - Nome
   - Dia e idade
   - Botão para **parabenizar via WhatsApp** (se celular existir)

---

## 11. Estatísticas e Gráficos

O painel exibe:

- **Crescimento mensal:** quantidade de cadastros por mês (últimos 6 meses)
- **Membros vs Congregados:** gráfico em pizza (doughnut)
- **Membros por setor:** gráfico de barras (top 5)

> **Dica:** Se quiser dados mais recentes, clique em **carregar lista (↻)**.

---

## 12. Exportando Relatórios em PDF

### 12.1 Exportar lista
1. No painel admin, clique em **PDF**.
2. O sistema gera o arquivo **`membros_adbela-vista_2026.pdf`**.

> **Atenção:** O PDF inclui somente dados presentes em memória/consulta (conforme a lista carregada).

---

## 13. Exportando Relatórios em Excel

### 13.1 Exportar planilha
1. Clique em **Excel**.
2. O arquivo gerado será **`membros_adbela-vista_2026.xlsx`**.

> **Dica:** A planilha inclui campos como Nome, Tipo, Status, CPF/CRNM, Celular, Setor, Congregação, Cargo e Forma de Recebimento.

---

## 14. Sistema de Notificações

### 14.1 Como funciona
- Quando um novo cadastro é criado, o painel pode atualizar um **histórico** e destacar no sino.

### 14.2 Abrir o histórico
1. Clique no sino 🔔.
2. Abra **“Novos Cadastros”**.
3. Use **“Limpar tudo”** quando necessário.

### 14.3 Ver ficha pelo histórico
- No histórico, clique em **👁** para abrir a ficha do membro.

> **Atenção:** O histórico em tela é mantido enquanto a página estiver aberta.

---

## 15. Logout

1. Clique em **“Sair”** no header.
2. O sistema desloga e retorna para a tela de login.

---

## 16. Perguntas Frequentes (FAQ)

| Pergunta | Resposta |
|---|---|
| O que fazer se a assinatura não foi aceita? | Assine novamente no canvas e valide o destaque visual “Assinatura registrada”. |
| Por que o painel não atualiza na hora? | Verifique se a lista foi carregada e se a página está ativa. Use o botão de recarregar ↻. |
| Posso excluir um membro? | Sim, mas há confirmação antes. A exclusão remove também referências de mídia (quando aplicável). |
| O que significa “Último cadastro”? | É o cadastro mais recente identificado pelo sistema, exibido como controle interno. |

---

## 17. Guia de Troubleshooting

### Problema: “Não abre o admin”
- Verifique e-mail/senha.
- Tente novamente após alguns segundos.

### Problema: “Campos obrigatórios”
- O sistema marca campos inválidos (classe `invalid`).
- Vá até o passo indicado e complete.

### Problema: “Upload falhou”
- Verifique conexão.
- Tente novamente.

---

## 18. Boas Práticas

- Mantenha o campo **celular** correto (WhatsApp).
- Padronize **setor** e **cargo** para facilitar filtros.
- Ao editar, evite alterar campos sem necessidade.
- Faça exportação periódica (PDF/Excel) como backup.

---

## 19. Diretrizes de Segurança de Dados

- Não compartilhe credenciais de acesso ao painel.
- Evite divulgar CPF/CRNM publicamente.
- Mantenha a tela do painel restrita aos responsáveis.

> **Atenção:** Use dispositivos autorizados e evite acessos em computadores públicos.

---

## 20. Conclusão

Este manual guiou o uso do sistema para cadastro, gerenciamento, consulta e exportação de membros da AD Bela-Vista.

---

### Apêndice: Dicionário rápido
- **Membro:** cadastrado completo conforme fluxo.
- **Congregado:** fluxo mínimo.
- **Status:** Ativo/Inativo/Transferido/Falecido.
- **Setor:** área/local dentro do templo.

