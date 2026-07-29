# Manual do Secretário
## Sistema de Gestão Eclesiástica AD Bela Vista

**Versão**: 2.0.0  
**Público-alvo**: Secretários da Igreja  
**Última atualização**: Julho de 2026

---

## 📑 Sumário

1. [Introdução](#introdução)
2. [Acesso ao Sistema](#acesso-ao-sistema)
3. [Funções do Secretário](#funções-do-secretário)
4. [Gestão de Cadastros](#gestão-de-cadastros)
5. [Aprovação de Fichas](#aprovação-de-fichas)
6. [Geração de Relatórios](#geração-de-relatórios)
7. [Limitações do Perfil](#limitações-do-perfil)

---

## 1. Introdução

### 1.1 Sobre o Perfil Secretário

O perfil **Secretário** possui permissões intermediárias no sistema:

✅ **Pode fazer**:
- Visualizar todos os cadastros
- Editar informações de membros
- Aprovar ou solicitar correção de fichas
- Gerar e gerenciar links temporários
- Visualizar indicadores e relatórios
- Exportar dados para Excel

❌ **Não pode fazer**:
- Excluir membros permanentemente
- Gerenciar outros usuários
- Alterar configurações globais
- Modificar permissões de acesso

---

## 2. Acesso ao Sistema

### 2.1 Login

**URL**: `https://sistema-igreja.vercel.app/pages/admin.html`

1. Digite seu **e-mail** fornecido pelo pastor
2. Digite sua **senha**
3. Clique em **"Entrar no Painel"**

### 2.2 Primeiro Acesso

No primeiro acesso, recomenda-se:

1. Trocar a senha temporária
2. Clique no ícone de usuário → **"Alterar Senha"**
3. Digite a senha atual (temporária)
4. Digite a nova senha (mínimo 8 caracteres)
5. Confirme a nova senha
6. Salve

---

## 3. Funções do Secretário

### 3.1 Principais Responsabilidades

Como secretário, suas principais funções são:

1. **Revisar e Aprovar Cadastros**
   - Análise de fichas pendentes
   - Validação de documentos
   - Solicitação de correções quando necessário

2. **Manter Dados Atualizados**
   - Atualização de telefones e e-mails
   - Correção de informações cadastrais
   - Registro de mudanças de status

3. **Gerar Links de Cadastro**
   - Criar links temporários para novos membros
   - Enviar links via WhatsApp/e-mail
   - Monitorar uso e validade

4. **Produzir Relatórios**
   - Exportar listas para Excel
   - Gerar relatórios de aniversariantes
   - Preparar dados para reuniões

---

## 4. Gestão de Cadastros

### 4.1 Visualizar Lista de Membros

No menu lateral, clique em **"Membros"** para ver:

- Lista completa de cadastros
- Filtros rápidos (Todos, Pendentes, Ativos, Membros, Congregados)
- Barra de pesquisa por nome
- Filtros avançados por tipo, status, setor e cargo

### 4.2 Editar Cadastro

Para editar informações de um membro:

1. Localize o membro na lista
2. Clique no botão **"✏️ Editar"**
3. Será aberta a ficha completa
4. Altere os campos necessários
5. Faça upload de novos documentos (se necessário)
6. Clique em **"💾 Salvar Alterações"**

**Campos editáveis**:
- Dados pessoais (nome, CPF, RG, data de nascimento)
- Endereço completo
- Contatos (celular, e-mail, telefone)
- Vínculos eclesiásticos (setor, congregação, cargo)
- Status (Ativo, Inativo, Transferido, Falecido)
- Observações internas

### 4.3 Visualizar Detalhes

Para ver a ficha completa sem editar:

1. Clique no botão **"👁️ Ver"** ao lado do nome
2. Será exibido um modal com todas as informações
3. Visualize documentos anexados
4. Feche clicando no **"✕"** ou fora do modal

---

## 5. Aprovação de Fichas

### 5.1 Fichas Pendentes

Quando um novo cadastro é enviado, ele entra com status **"Pendente"** e precisa ser aprovado.

Para ver apenas fichas pendentes:
- Clique no filtro rápido **"Pendentes"**

### 5.2 Processo de Aprovação

1. Clique em **"👁️ Ver"** para abrir a ficha
2. **Revise cuidadosamente**:
   - ✅ Nome completo está correto
   - ✅ CPF/CRNM está válido
   - ✅ Data de nascimento está correta
   - ✅ Endereço está completo
   - ✅ Telefone/e-mail estão corretos
   - ✅ Documentos foram anexados (se exigido)

3. **Se tudo estiver correto**:
   - Clique no botão **"✅ Aprovar Ficha"**
   - Confirme a aprovação
   - Status muda para **"Aprovado"**
   - Membro recebe acesso ao portal (se configurado)

4. **Se houver erros ou falta de informações**:
   - Clique no botão **"⚠️ Solicitar Correção"**
   - Adicione observações sobre o que precisa ser corrigido
   - Status muda para **"Correção"**
   - Membro será notificado (se configurado)

### 5.3 Boas Práticas de Aprovação

✅ **Sempre revise**:
- Ortografia do nome (evita problemas em certificados)
- Validade do CPF (usar sites validadores se necessário)
- Coerência da data de nascimento com a idade
- Completude do endereço (CEP, número, bairro)

⚠️ **Atenção especial**:
- Documentos de estrangeiros (CRNM)
- Dados de menores de idade (verificar responsável)
- Telefones com DDD incorreto
- E-mails com domínios suspeitos (@test.com, @exemplo.com)

---

## 6. Geração de Relatórios

### 6.1 Exportar para Excel

Para exportar a lista de membros:

1. Aplique os filtros desejados (tipo, status, setor, etc.)
2. Clique no botão **"📊 Exportar Excel"**
3. Aguarde o download do arquivo `.xlsx`
4. Abra no Excel, Google Sheets ou LibreOffice

**Colunas incluídas**:
- Nome Completo, Tipo, Status, CPF/CRNM, RG
- Data de Nascimento, Idade, Sexo
- Celular, E-mail
- Setor, Congregação, Cargo, Forma de Recebimento

### 6.2 Relatórios Predefinidos

Acesse **"Relatórios"** no menu lateral para:

#### Relatório de Aniversariantes

1. Selecione o **mês** desejado
2. Clique em **"Gerar Relatório"**
3. Exportel em Excel ou PDF

#### Relatório de Novos Cadastros

1. Selecione o **período** (data inicial e final)
2. Filtre por **tipo** (Membros, Congregados ou Ambos)
3. Clique em **"Gerar Relatório"**

#### Relatório por Ministério

1. Selecione o **ministério/cargo**
2. Clique em **"Gerar Relatório"**
3. Útil para organizar escalas e eventos

---

## 7. Limitações do Perfil

### 7.1 O que NÃO é possível fazer

Como secretário, você **não tem permissão** para:

❌ **Excluir membros permanentemente**
- Apenas o pastor/admin pode fazer exclusão definitiva
- Você pode marcar como "Inativo" se necessário

❌ **Gerenciar usuários**
- Não pode criar novos secretários ou admins
- Não pode redefinir senhas de outros usuários
- Para isso, solicite ao pastor

❌ **Alterar configurações globais**
- Não pode modificar assinatura digital do pastor
- Não pode alterar dados institucionais da igreja
- Não pode ajustar parâmetros do sistema

❌ **Acessar logs de auditoria completos**
- Possui acesso limitado ao histórico
- Auditorias completas são exclusivas do admin

### 7.2 Solicitações ao Pastor

Quando precisar de uma ação restrita:

1. Entre em contato com o pastor ou administrador
2. Explique a necessidade
3. Aguarde autorização e execução

---

## 📚 Dicas e Atalhos

### Atalhos de Teclado

- **Ctrl + F**: Busca na página
- **Ctrl + R**: Recarregar página
- **Esc**: Fechar modais

### Dicas de Produtividade

1. **Use filtros rápidos**: Economiza tempo na busca
2. **Favoritos do navegador**: Salve a URL do painel admin
3. **Monitore notificações**: Verifique o sino de notificações para novos cadastros
4. **Revise em lotes**: Aprove várias fichas de uma vez

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

- Contate o **pastor/administrador** da igreja
- Consulte o **Manual do Administrador** para informações técnicas
- Entre em contato com o **suporte técnico** (via pastor)

---

*Manual Versão 2.0.0 - Julho de 2026*
