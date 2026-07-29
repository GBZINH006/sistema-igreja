# Manual do Administrador
## Sistema de Gestão Eclesiástica AD Bela Vista

**Versão**: 2.0.0  
**Público-alvo**: Pastores e Administradores  
**Última atualização**: Julho de 2026

---

## 📑 Sumário

1. [Introdução](#introdução)
2. [Acesso ao Sistema](#acesso-ao-sistema)
3. [Dashboard Principal](#dashboard-principal)
4. [Gestão de Membros](#gestão-de-membros)
5. [Sistema de Links Temporários](#sistema-de-links-temporários)
6. [Indicadores e Relatórios](#indicadores-e-relatórios)
7. [Gestão de Usuários](#gestão-de-usuários)
8. [Configurações do Sistema](#configurações-do-sistema)
9. [Segurança e Backup](#segurança-e-backup)
10. [Resolução de Problemas](#resolução-de-problemas)

---

## 1. Introdução

### 1.1 Sobre o Sistema

O Sistema de Gestão Eclesiástica AD Bela Vista é uma plataforma web completa desenvolvida para otimizar a administração da igreja, centralizando informações de membros, congregados, ministérios e fornecendo ferramentas analíticas para tomada de decisões.

### 1.2 Perfil do Administrador

O perfil **Administrador/Pastor** possui acesso total ao sistema, incluindo:

- ✅ Visualização e edição de todos os cadastros
- ✅ Aprovação de fichas cadastrais
- ✅ Geração de links temporários de cadastro
- ✅ Acesso a relatórios e indicadores completos
- ✅ Gerenciamento de usuários e permissões
- ✅ Configurações globais do sistema
- ✅ Assinatura digital para documentos

---

## 2. Acesso ao Sistema

### 2.1 Primeiro Acesso

**URL de Acesso**: `https://sistema-igreja.vercel.app/pages/admin.html`

1. Acesse a URL acima em seu navegador
2. Digite seu **e-mail** cadastrado no sistema
3. Digite sua **senha** (mínimo 8 caracteres)
4. Clique em **"✝ Entrar no Painel"**

### 2.2 Recuperação de Senha

Caso tenha esquecido sua senha:

1. Na tela de login, clique em **"Esqueceu a senha?"**
2. Digite seu **e-mail** cadastrado
3. Clique em **"Enviar código por e-mail"**
4. Verifique sua caixa de entrada e copie o **código de 6 dígitos**
5. Digite o código recebido e clique em **"Validar código"**
6. **Opção A**: Digite uma nova senha (mínimo 8 caracteres) e clique em **"Trocar senha e entrar"**
7. **Opção B**: Clique em **"Pular e ir para o painel"** para entrar sem trocar a senha

### 2.3 Segurança de Acesso

⚠️ **Recomendações de Segurança**:

- Use uma senha forte com letras, números e caracteres especiais
- Nunca compartilhe suas credenciais com terceiros
- Sempre faça logout ao encerrar o uso
- Acesse apenas de dispositivos confiáveis
- Não salve senhas em navegadores públicos

---

## 3. Dashboard Principal

### 3.1 Visão Geral

Ao acessar o sistema, você visualizará o **Dashboard** com:

#### 📊 Indicadores em Tempo Real

1. **Total de Registros**
   - Quantidade total de pessoas cadastradas
   - Crescimento acumulado (últimos 6 meses)
   - Meta anual de cadastros

2. **Membros Recebidos**
   - Membros oficialmente recebidos pela igreja
   - Evolução mensal de entradas
   - Total no ano

3. **Congregados Acompanhados**
   - Congregados em processo de acompanhamento
   - Percentual de acompanhamento efetivo
   - Distribuição por status

4. **Cadastros Ativos**
   - Comparativo entre ativos e inativos
   - Visualização gráfica da situação
   - Percentual de atividade

5. **Novos Este Mês**
   - Novos cadastros do mês atual
   - Comparação com mês anterior
   - Taxa diária de cadastros

6. **Aniversariantes**
   - Aniversariantes do mês atual
   - Lista detalhada com idades
   - Botão direto para WhatsApp

### 3.2 Menu Lateral

O menu lateral permite navegação rápida:

- 🏠 **Dashboard**: Página principal com indicadores
- 👥 **Membros**: Lista completa de cadastros
- 🎂 **Aniversariantes**: Celebrações do mês
- 📊 **Relatórios**: Geração de documentos
- 📈 **Indicadores**: Análises aprofundadas
- 👤 **Usuários**: Gestão de acesso
- ⚙️ **Configurações**: Ajustes do sistema

### 3.3 Informações em Tempo Real

O sistema utiliza **Supabase Realtime** para:

- ✅ Atualização automática de indicadores
- ✅ Notificações de novos cadastros
- ✅ Sincronização entre múltiplos usuários
- ✅ Badge visual de "Tempo real ativo"

---

## 4. Gestão de Membros

### 4.1 Visualização da Lista

Na seção **Membros**, você encontra:

#### Filtros Rápidos

- **Todos**: Exibe todos os cadastros
- **Pendentes**: Fichas aguardando aprovação
- **Ativos**: Membros com status ativo
- **Membros**: Apenas membros recebidos
- **Congregados**: Apenas congregados

#### Filtros Avançados

Clique em **"Filtros avançados"** para:

- Filtrar por **Tipo de Cadastro**
- Filtrar por **Status**
- Filtrar por **Setor/Congregação**
- Filtrar por **Cargo/Ministério**
- Pesquisar por **Nome**

### 4.2 Ações sobre Membros

Para cada membro, você pode:

#### 👁️ Ver Detalhes
- Visualiza a ficha completa
- Mostra documentos anexados
- Exibe histórico de alterações

#### ✏️ Editar Cadastro
- Altera informações pessoais
- Atualiza dados de contato
- Modifica vínculos ministeriais
- Faz upload de novos documentos

#### ✅ Aprovar Ficha
*Disponível apenas para fichas pendentes*
- Valida as informações fornecidas
- Altera status para "Aprovado"
- Libera acesso do membro ao portal

#### ⚠️ Solicitar Correção
*Disponível apenas para fichas pendentes*
- Marca ficha para correção
- Envia notificação ao membro (se configurado)
- Permite reabertura do cadastro

#### 🗑️ Excluir (Exclusão Lógica)
- Marca como "Inativo" (não apaga do banco)
- Preserva histórico para relatórios
- Reversível a qualquer momento

#### ❌ Excluir Permanentemente
⚠️ **Atenção**: Esta ação é **irreversível**!
- Remove definitivamente do banco de dados
- Apaga documentos anexados no Storage
- Cumpre com direito ao esquecimento (LGPD)
- Requer confirmação dupla

### 4.3 Criação Manual de Cadastro

Para criar um membro manualmente:

1. Clique no botão **"+ Novo Cadastro"** no canto superior direito
2. Será aberta uma nova aba com o formulário de cadastro
3. Preencha todos os campos obrigatórios (marcados com *)
4. Faça upload dos documentos necessários
5. Clique em **"Enviar Cadastro"**
6. O membro aparecerá na lista com status "Pendente"
7. Aprove a ficha para liberar acesso

### 4.4 Exportação de Dados

#### Exportar para Excel

1. Clique no botão **"📊 Exportar Excel"**
2. Será gerado um arquivo `.xlsx` com todos os membros
3. Colunas incluídas:
   - Número sequencial
   - Nome Completo
   - Tipo de Cadastro
   - Status
   - CPF/CRNM
   - RG
   - Data de Nascimento
   - Idade
   - Sexo
   - Celular
   - E-mail
   - Setor
   - Congregação
   - Cargo
   - Forma de Recebimento

---

## 5. Sistema de Links Temporários

### 5.1 O que são Links Temporários?

Links temporários são **URLs únicas e temporárias** que permitem que pessoas realizem cadastro no sistema sem precisar de login. Cada link:

- ✅ É válido por **2 horas** (configurável)
- ✅ Pode ser usado **apenas uma vez**
- ✅ Expira automaticamente após o prazo
- ✅ Pode ser revogado manualmente a qualquer momento

### 5.2 Gerar Novo Link

1. No menu lateral, clique em **"Gerar Links"** ou no botão flutuante **"🔗"**
2. Será aberto o **Painel de Gerenciamento de Links**
3. (Opcional) Digite uma **observação** para identificar o link (ex: "Link para João Silva")
4. Clique em **"✨ Gerar Link Temporário"**
5. O link será **copiado automaticamente** para a área de transferência
6. Cole e envie via WhatsApp, e-mail ou qualquer meio de comunicação

**Formato do Link**:
```
https://sistema-igreja.vercel.app/pages/cadastro.html?token=abc123...
```

### 5.3 Visualizar Links Ativos

No painel, você vê:

#### 📊 Estatísticas (Clicáveis)

- **Ativos**: Links válidos e não utilizados (clique para filtrar)
- **Usados**: Links já utilizados por membros (clique para filtrar)
- **Expirados**: Links que venceram sem uso (clique para filtrar)

#### 📃 Lista de Links

Cada card mostra:

- 🎫 **Token**: Identificador único (primeiros 8 caracteres)
- 📝 **Observação**: Nota cadastrada (se houver)
- ⏰ **Tempo Restante**: Contador regressivo em tempo real
- 📋 **Link Completo**: URL para copiar
- 🚫 **Botão Revogar**: Cancela o link imediatamente

### 5.4 Copiar Link

1. Localize o link desejado na lista
2. Clique no botão **"📋 Copiar"** ao lado do link
3. O link será copiado para a área de transferência
4. Cole e envie para a pessoa

### 5.5 Revogar Link

Para cancelar um link antes da expiração:

1. Localize o link na lista
2. Clique no botão **"🚫 Revogar"**
3. Confirme a ação no alerta
4. O link será **imediatamente invalidado** e não poderá mais ser usado

**Quando revogar um link?**

- ❌ Pessoa já realizou cadastro manualmente
- ❌ Link foi enviado por engano
- ❌ Informações de contato mudaram
- ❌ Pessoa desistiu do cadastro

### 5.6 Filtros de Visualização

Clique nos cards de estatísticas para filtrar:

- **Ativos**: Mostra apenas links válidos e não usados
- **Usados**: Mostra links já utilizados
- **Expirados**: Mostra links que venceram
- **Todos**: Remove filtros e mostra tudo

### 5.7 Boas Práticas

✅ **Recomendações**:

- Sempre adicione uma **observação** ao gerar links (ex: nome da pessoa)
- Envie o link **imediatamente** após gerar (validade de 2h)
- Oriente a pessoa a preencher o cadastro **logo que possível**
- Revogue links não utilizados após o evento/reunião
- Monitore os links ativos regularmente

⚠️ **Evite**:

- Compartilhar links publicamente em redes sociais
- Gerar múltiplos links para a mesma pessoa
- Deixar links ativos desnecessariamente

---

## 6. Indicadores e Relatórios

### 6.1 Indicadores Interativos

Clique em qualquer **card de indicador** no Dashboard para abrir o **Painel Detalhado**:

#### Visualizações Disponíveis

- 📊 **Gráfico de Barras**: Comparação entre categorias
- 📈 **Gráfico de Linhas**: Evolução temporal
- 🍩 **Gráfico de Pizza/Rosca**: Distribuição percentual
- 📝 **Visualização Textual**: Tabela resumida

#### Exportação de Indicadores

- **📄 Exportar PDF**: Gera documento com gráfico e tabela
- **🖼️ Exportar PNG**: Salva apenas o gráfico como imagem

### 6.2 Página de Relatórios

Acesse **Relatórios** no menu lateral para:

#### Relatórios Predefinidos

1. **Relatório de Membros Ativos**
   - Lista completa de membros com status "Ativo"
   - Inclui dados de contato e ministério
   - Exportável em Excel e PDF

2. **Relatório de Novos Cadastros**
   - Membros cadastrados em período específico
   - Filtro por data de entrada
   - Análise de crescimento

3. **Relatório de Aniversariantes**
   - Lista por mês de aniversário
   - Inclui idade e data completa
   - Útil para planejamento de celebrações

4. **Relatório por Ministério**
   - Agrupamento por cargo/setor
   - Distribuição de membros por área
   - Identificação de áreas carentes

#### Filtros Personalizados

- 📅 **Período**: Selecione data inicial e final
- 👤 **Tipo**: Membros, Congregados ou Ambos
- ✅ **Status**: Ativo, Inativo, Pendente, etc.
- 🏢 **Setor**: Filtre por congregação/setor
- 🎯 **Ministério**: Filtre por cargo específico

---

## 7. Gestão de Usuários

### 7.1 Tipos de Usuário

O sistema possui 3 perfis de acesso:

| Perfil | Permissões |
|--------|-----------|
| **Pastor/Admin** | Acesso total, incluindo exclusão de dados |
| **Secretário** | Visualização, edição, aprovação. Sem exclusão |
| **Membro** | Acesso apenas à própria ficha cadastral |

### 7.2 Criar Novo Usuário Administrativo

1. Acesse **Usuários** no menu lateral
2. Clique em **"+ Novo Usuário"**
3. Preencha os dados:
   - **Nome completo**
   - **E-mail** (usado para login)
   - **Senha temporária** (mínimo 8 caracteres)
   - **Perfil**: Pastor, Secretário ou Membro
4. Clique em **"Salvar Usuário"**
5. O usuário receberá um e-mail com instruções (se configurado)

### 7.3 Editar Usuário

1. Localize o usuário na lista
2. Clique no botão **"✏️ Editar"**
3. Altere as informações necessárias
4. Clique em **"Salvar Alterações"**

### 7.4 Redefinir Senha

Para redefinir a senha de um usuário:

1. Localize o usuário na lista
2. Clique em **"🔑 Redefinir Senha"**
3. Digite a nova senha temporária
4. O usuário será notificado (se configurado)
5. Oriente o usuário a trocar a senha no primeiro acesso

### 7.5 Desativar Usuário

Para remover acesso sem excluir:

1. Localize o usuário na lista
2. Clique em **"🚫 Desativar"**
3. Confirme a ação
4. O usuário não poderá mais fazer login
5. Reversível a qualquer momento

---

## 8. Configurações do Sistema

### 8.1 Assinatura Digital do Pastor

Configure sua assinatura para ser exibida em documentos:

1. Acesse **Configurações** → **Assinatura do Pastor**
2. Preencha:
   - **Nome exibido**: Nome completo do pastor
   - **Cargo exibido**: Ex: "Pastor Presidente"
3. **Desenhe sua assinatura** no quadro branco
4. Use o mouse ou toque (em tablets/celulares)
5. Clique em **"💾 Salvar assinatura"**

**Dica**: Use uma caneta stylus em tablets para melhor resultado.

Para **limpar e refazer**:
- Clique em **"🧹 Limpar"** e desenhe novamente

### 8.2 Dados da Igreja

Configure informações institucionais:

1. Acesse **Configurações** → **Dados da Igreja**
2. Preencha:
   - Nome da igreja
   - CNPJ
   - Endereço completo
   - Telefone de contato
   - E-mail institucional
   - Site/redes sociais

### 8.3 Parâmetros do Sistema

#### Validade de Links Temporários
- Padrão: 2 horas
- Mínimo: 30 minutos
- Máximo: 24 horas

#### Retenção de Dados (LGPD)
- Membros ativos: 5 anos após inativação
- Congregados: 2 anos após inativação
- Tokens de cadastro: 7 dias após expiração

#### Notificações
- ✅ Novos cadastros
- ✅ Aprovações pendentes
- ✅ Aniversariantes do dia
- ✅ Links próximos da expiração

---

## 9. Segurança e Backup

### 9.1 Segurança dos Dados

O sistema implementa:

- 🔒 **Criptografia**: Todos os dados em trânsito são criptografados (HTTPS)
- 🛡️ **Autenticação**: Sistema robusto via Supabase Auth
- 👥 **Controle de Acesso**: RLS (Row Level Security) no banco de dados
- 📋 **Auditoria**: Logs de todas as ações administrativas
- 🔐 **Senhas**: Armazenadas com hash bcrypt

### 9.2 Conformidade LGPD

O sistema está em conformidade com a LGPD através de:

- ✅ Política de Privacidade completa e acessível
- ✅ Termos de Consentimento no cadastro
- ✅ Direito ao Esquecimento (exclusão permanente)
- ✅ Portabilidade de Dados (exportação)
- ✅ Prazo de retenção definido
- ✅ DPO (Encarregado) identificado

### 9.3 Backup Automático

**Supabase** realiza backups automáticos:

- ⚡ **Backup contínuo**: Point-in-time recovery (PITR)
- 📅 **Retenção**: 7 dias (plano gratuito) a 90 dias (plano pago)
- 🌍 **Redundância**: Múltiplas zonas de disponibilidade
- 🔄 **Restauração**: Contate o suporte técnico

### 9.4 Recuperação de Desastres

Em caso de perda de dados:

1. **Contate imediatamente** o suporte técnico
2. Informe a data/hora aproximada da última operação correta
3. O backup será restaurado em ambiente de testes
4. Após validação, será promovido para produção

**Tempo de Recuperação**: 4-24 horas (dependendo da complexidade)

---

## 10. Resolução de Problemas

### 10.1 Problemas Comuns

#### ❌ Não consigo fazer login

**Possíveis causas**:
- E-mail ou senha incorretos
- Usuário desativado
- Perfil sem permissão de acesso ao admin

**Solução**:
1. Verifique se está digitando corretamente
2. Use a opção "Esqueceu a senha?"
3. Contate outro administrador para verificar seu status

#### ❌ Dashboard não carrega os indicadores

**Possíveis causas**:
- Conexão com internet instável
- Cache do navegador desatualizado

**Solução**:
1. Pressione **Ctrl + Shift + R** para recarregar
2. Limpe o cache do navegador
3. Tente em modo anônimo

#### ❌ Link temporário não funciona

**Possíveis causas**:
- Link expirado (mais de 2 horas)
- Link já foi usado
- Link foi revogado manualmente

**Solução**:
1. Verifique o status do link no painel
2. Gere um novo link se necessário
3. Envie imediatamente para a pessoa

#### ❌ Arquivo não faz upload

**Possíveis causas**:
- Arquivo muito grande (limite: 5MB)
- Formato não suportado
- Conexão instável

**Solução**:
1. Comprima a imagem (use ferramentas online)
2. Converta para formato suportado (JPG, PNG, PDF)
3. Tente novamente com internet estável

### 10.2 Contato com Suporte

Para problemas não resolvidos:

📧 **E-mail**: suporte@sistema-igreja.com.br  
📱 **WhatsApp**: (XX) XXXXX-XXXX  
⏰ **Horário**: Segunda a Sexta, 9h às 18h

**Ao entrar em contato, informe**:
- Nome da igreja
- Seu nome e e-mail de login
- Descrição detalhada do problema
- Prints de tela (se possível)
- Navegador utilizado

---

## 📚 Glossário

- **Token**: Código único gerado para links temporários
- **RLS**: Row Level Security (segurança em nível de linha)
- **LGPD**: Lei Geral de Proteção de Dados
- **Dashboard**: Painel principal com indicadores
- **Realtime**: Atualização em tempo real
- **Storage**: Armazenamento de arquivos (fotos, documentos)

---

*Este manual é constantemente atualizado. Versão 2.0.0 - Julho de 2026*
