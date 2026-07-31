# MANUAL TÉCNICO - PAINEL ADMINISTRATIVO
## Sistema de Gestão Eclesiástica AD Bela Vista

---

## 1. VISÃO GERAL

O Painel Administrativo (admin.html) é o núcleo de gestão do sistema, permitindo aos administradores gerenciar todos os aspectos operacionais da igreja através de uma interface unificada e intuitiva.

### 1.1 Níveis de Acesso
- **Super Administrador**: Acesso total ao sistema
- **Administrador**: Acesso completo exceto configurações críticas
- **Secretário**: Acesso a cadastros e relatórios
- **Tesoureiro**: Acesso financeiro e relatórios

---

## 2. AUTENTICAÇÃO E SEGURANÇA

### 2.1 Sistema de Login

#### 2.1.1 Processo de Autenticação
```
[Usuário] → [Credenciais] → [Validação] → [Token JWT] → [Dashboard]
```

**Campos Obrigatórios**:
- Email institucional
- Senha (mínimo 8 caracteres)

**Validações Aplicadas**:
- Verificação de formato de email
- Validação de complexidade de senha
- Proteção contra força bruta (rate limiting)
- Captcha após 3 tentativas falhas

#### 2.1.2 Recuperação de Senha
```
[Esqueci Senha] → [Email Verificação] → [Token Temporário] → [Nova Senha]
```

**Processo**:
1. Usuário solicita recuperação
2. Sistema envia email com código de 6 dígitos
3. Código válido por 15 minutos
4. Usuário define nova senha
5. Sessões antigas são invalidadas

### 2.2 Sistema de Tokens

#### 2.2.1 Controle de Acesso Temporário
O sistema utiliza tokens temporários para autenticação de operações sensíveis.

**Características**:
- **Duração**: 12 horas
- **Renovação**: Automática quando < 2 horas restantes
- **Invalidação**: Ao fazer logout ou expirar

**Visualização de Tokens**:
```
Dashboard → Canto superior direito → [Ícone Relógio] → Contagem regressiva
```

**Comportamento**:
- Verde: > 6 horas restantes
- Amarelo: 2-6 horas restantes
- Vermelho: < 2 horas restantes
- Piscante: < 30 minutos restantes

---

## 3. INTERFACE DO DASHBOARD

### 3.1 Estrutura de Navegação

#### 3.1.1 Menu Lateral
```
├── Dashboard (Visão Geral)
├── Membros
│   ├── Cadastro
│   ├── Listagem
│   └── Importação em Lote
├── Ministérios
│   ├── Gerenciar Ministérios
│   └── Atribuir Membros
├── Eventos
│   ├── Criar Evento
│   ├── Calendário
│   └── Controle de Presença
├── Financeiro
│   ├── Lançamentos
│   ├── Dízimos e Ofertas
│   └── Relatórios Financeiros
├── Comunicação
│   ├── Enviar Mensagem
│   ├── WhatsApp Integrado
│   └── Histórico
├── Relatórios
│   ├── Analíticos
│   ├── Estatísticos
│   └── Exportação
├── Configurações
│   ├── Dados da Igreja
│   ├── Usuários do Sistema
│   └── Preferências
└── Suporte
    ├── Documentação
    ├── Vídeos Tutoriais
    └── Contato Técnico
```

### 3.2 Dashboard Principal

#### 3.2.1 Cards de Indicadores
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   Total         │   Ativos        │   Visitantes    │   Conversões    │
│   Membros       │   Este Mês      │   Este Mês      │   Este Mês      │
│   ────────      │   ────────      │   ────────      │   ────────      │
│   1.234         │   156           │   45            │   12            │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### 3.2.2 Gráficos Analíticos
- **Crescimento Mensal**: Linha temporal de novos membros
- **Distribuição por Faixa Etária**: Gráfico de pizza
- **Frequência de Cultos**: Gráfico de barras
- **Dízimos e Ofertas**: Evolução mensal

#### 3.2.3 Atividades Recentes
- Últimos cadastros
- Aniversariantes do mês
- Eventos próximos
- Pendências administrativas

---

## 4. MÓDULO DE MEMBROS

### 4.1 Cadastro de Membros

#### 4.1.1 Formulário de Cadastro

**Dados Pessoais**:
```
- Nome Completo* (obrigatório)
- CPF* (validação automática)
- RG
- Data de Nascimento*
- Sexo*
- Estado Civil*
- Telefone Celular* (formato: (XX) XXXXX-XXXX)
- Email
```

**Endereço**:
```
- CEP (busca automática via ViaCEP)
- Logradouro
- Número
- Complemento
- Bairro
- Cidade
- Estado
```

**Informações Eclesiásticas**:
```
- Status* (Membro, Congregado, Visitante)
- Data de Batismo
- Data de Conversão
- Ministério Principal
- Ministérios Secundários
- Cargo/Função
- Observações
```

**Foto**:
- Upload de foto (opcional)
- Formatos aceitos: JPG, PNG
- Tamanho máximo: 2MB
- Redimensionamento automático

#### 4.1.2 Validações Automáticas
- CPF válido e único no sistema
- Formato de email correto
- Telefone no padrão brasileiro
- CEP válido e existente
- Campos obrigatórios preenchidos

### 4.2 Listagem de Membros

#### 4.2.1 Tabela de Membros
```
┌────┬──────────────┬────────────┬────────────┬──────────┬─────────┐
│ ID │ Nome         │ Status     │ Telefone   │ Cadastro │ Ações   │
├────┼──────────────┼────────────┼────────────┼──────────┼─────────┤
│ 01 │ João Silva   │ Membro     │ (11)99999  │ 01/01/26 │ [⚙️📝🗑️]│
└────┴──────────────┴────────────┴────────────┴──────────┴─────────┘
```

**Recursos da Tabela**:
- **Busca Avançada**: Nome, CPF, telefone, email
- **Filtros**:
  - Por status (Membro/Congregado/Visitante)
  - Por ministério
  - Por faixa etária
  - Por data de cadastro
- **Ordenação**: Todos os campos são ordenáveis
- **Paginação**: 20/50/100 registros por página
- **Exportação**: CSV, Excel, PDF

#### 4.2.2 Ações Rápidas
- **Visualizar**: Ver ficha completa do membro
- **Editar**: Alterar dados cadastrais
- **Excluir**: Remover registro (requer confirmação)
- **Enviar Mensagem**: WhatsApp direto
- **Imprimir Ficha**: Gerar PDF da ficha

### 4.3 Importação em Lote

#### 4.3.1 Processo de Importação
```
[Download Modelo] → [Preencher Excel] → [Upload Arquivo] → [Validação] → [Importação]
```

**Formato do Arquivo**:
- Extensão: .xlsx ou .csv
- Encoding: UTF-8
- Tamanho máximo: 5MB
- Limite: 1000 registros por arquivo

**Modelo de Planilha**:
```excel
Nome Completo | CPF | Telefone | Email | Data Nascimento | Status | ...
João Silva    | 123 | (11)9999 | joão@ | 01/01/1990     | Membro | ...
```

**Validação de Dados**:
- Verificação de CPFs duplicados
- Validação de formatos
- Identificação de erros
- Relatório de inconsistências

---

## 5. MÓDULO FINANCEIRO

### 5.1 Lançamentos

#### 5.1.1 Tipos de Lançamento
- **Receitas**:
  - Dízimos
  - Ofertas
  - Doações
  - Eventos
  - Outras receitas
  
- **Despesas**:
  - Aluguel
  - Contas (luz, água, internet)
  - Salários
  - Manutenção
  - Material
  - Outras despesas

#### 5.1.2 Formulário de Lançamento
```
Data*: [__/__/____]
Tipo*: (○) Receita  (○) Despesa
Categoria*: [Dropdown com categorias]
Descrição*: [_______________________]
Valor*: R$ [______,__]
Forma de Pagamento*: [Dropdown]
Comprovante: [Anexar arquivo]
Observações: [_______________________]
```

**Formas de Pagamento**:
- Dinheiro
- PIX
- Transferência Bancária
- Débito
- Crédito
- Cheque

### 5.2 Controle de Dízimos

#### 5.2.1 Registro de Dízimo
```
Membro*: [Busca por nome/CPF]
Data*: [__/__/____]
Valor*: R$ [______,__]
Referência: [Mês/Ano]
Método*: [Dropdown pagamento]
Envelope Nº: [____]
```

**Funcionalidades**:
- Histórico de dízimos por membro
- Relatório de dizimistas ativos
- Média de contribuição
- Emissão de recibos automáticos

### 5.3 Relatórios Financeiros

#### 5.3.1 Tipos de Relatórios
- **Fluxo de Caixa**: Entradas vs Saídas
- **DRE**: Demonstrativo de Resultado
- **Balancete**: Posição financeira atual
- **Comparativo**: Períodos anteriores
- **Por Categoria**: Detalhamento por tipo

#### 5.3.2 Exportação
- **Formatos**: PDF, Excel, CSV
- **Períodos**: Diário, Semanal, Mensal, Anual, Personalizado
- **Gráficos**: Inclusos nos relatórios PDF

---

## 6. MÓDULO DE COMUNICAÇÃO

### 6.1 Envio de Mensagens

#### 6.1.1 WhatsApp Business API

**Tipos de Envio**:
- **Individual**: Para um membro específico
- **Grupo**: Para um ministério/categoria
- **Broadcast**: Para todos os membros

**Recursos**:
- Templates pré-aprovados pelo WhatsApp
- Variáveis personalizáveis (nome, data, etc)
- Agendamento de envio
- Histórico de mensagens
- Status de entrega

#### 6.1.2 Formulário de Envio
```
Destinatários*: [○] Individual  [○] Grupo  [○] Todos

[Se Grupo]
Selecionar: [☑] Ministério Louvor
            [☐] Ministério Infantil
            [☐] Jovens
            
Mensagem*:
┌────────────────────────────────────────┐
│ Olá {nome}!                           │
│                                        │
│ Lembrete: Culto hoje às 19h.          │
│ Contamos com sua presença!            │
│                                        │
│ AD Bela Vista                          │
└────────────────────────────────────────┘

Enviar: (○) Agora  (○) Agendar [__/__/__ às __:__]
```

### 6.2 Histórico de Comunicação
- Data e hora de envio
- Destinatário(s)
- Conteúdo da mensagem
- Status (Enviado/Entregue/Lido/Falhou)
- Respostas recebidas

---

## 7. MÓDULO DE RELATÓRIOS

### 7.1 Relatórios Analíticos

#### 7.1.1 Crescimento da Igreja
- Gráfico de evolução de membros
- Taxa de crescimento mensal
- Projeção de crescimento
- Comparativo com anos anteriores

#### 7.1.2 Análise Demográfica
- Distribuição por faixa etária
- Distribuição por sexo
- Distribuição geográfica
- Estado civil

#### 7.1.3 Engajamento
- Frequência média de cultos
- Participação em ministérios
- Taxa de dizimistas
- Presença em eventos

### 7.2 Relatórios Estatísticos

#### 7.2.1 Métricas Disponíveis
```
┌─────────────────────────────────────────┐
│ INDICADORES PRINCIPAIS                  │
├─────────────────────────────────────────┤
│ • Membros Ativos: 1.234                 │
│ • Taxa de Retenção: 94%                 │
│ • Novos Membros (mês): 45               │
│ • Taxa de Crescimento: 3.6%             │
│ • Dizimistas Ativos: 567 (46%)          │
│ • Média de Presença: 856 pessoas        │
└─────────────────────────────────────────┘
```

### 7.3 Exportação de Dados

#### 7.3.1 Formatos Disponíveis
- **PDF**: Relatórios formatados com gráficos
- **Excel**: Dados brutos para análise
- **CSV**: Integração com outros sistemas
- **JSON**: API para sistemas externos

---

## 8. MÓDULO DE CONFIGURAÇÕES

### 8.1 Dados da Igreja

#### 8.1.1 Informações Institucionais
```
Nome da Igreja*: [_______________________]
CNPJ: [__.___.___/____-__]
Endereço*: [_______________________]
Telefone*: [(___) ____-____]
Email*: [_______________________]
Site: [_______________________]
Redes Sociais:
  Facebook: [_______________________]
  Instagram: [_______________________]
  YouTube: [_______________________]
```

#### 8.1.2 Dados Bancários
```
Banco: [_______________________]
Agência: [____-_]
Conta: [_________-_]
PIX: [_______________________]
```

### 8.2 Gerenciamento de Usuários

#### 8.2.1 Criar Novo Usuário
```
Nome*: [_______________________]
Email*: [_______________________]
Perfil*: [Dropdown com perfis]
Status: [☑] Ativo
Permissões: [☑] Membros
            [☑] Financeiro
            [☐] Configurações
            [☑] Relatórios
```

**Perfis Disponíveis**:
- Super Administrador
- Administrador
- Secretário
- Tesoureiro
- Líder de Ministério

#### 8.2.2 Gerenciar Permissões
Controle granular de acesso por módulo e funcionalidade.

---

## 9. RECURSOS AVANÇADOS

### 9.1 Auditoria de Sistema

#### 9.1.1 Logs de Atividade
- Registro de todas as ações dos usuários
- Timestamp com data/hora exata
- IP de origem da ação
- Detalhes da operação realizada

**Visualização**:
```
┌───────────┬─────────┬──────────────────┬────────────────┐
│ Data/Hora │ Usuário │ Ação             │ Detalhes       │
├───────────┼─────────┼──────────────────┼────────────────┤
│ 31/07 08h │ admin   │ Cadastro Membro  │ João Silva     │
│ 31/07 09h │ tesour  │ Lançamento       │ R$ 1.500,00    │
└───────────┴─────────┴──────────────────┴────────────────┘
```

### 9.2 Backup Automático

#### 9.2.1 Configuração de Backup
- **Frequência**: Diária (automática às 03:00)
- **Retenção**: 30 dias
- **Local**: Armazenamento em nuvem (AWS S3)
- **Criptografia**: AES-256

#### 9.2.2 Restauração
```
[Configurações] → [Backup] → [Restaurar] → [Selecionar Data] → [Confirmar]
```

**Atenção**: Restauração substitui dados atuais. Criar backup manual antes.

### 9.3 Integração com Sistemas Externos

#### 9.3.1 API REST Disponível
- Endpoint: `https://api.adbelavista.com.br/v1/`
- Autenticação: Bearer Token
- Formato: JSON
- Rate Limit: 1000 requisições/hora

**Endpoints Principais**:
```
GET  /membros          # Listar membros
POST /membros          # Criar membro
GET  /membros/{id}     # Detalhes do membro
PUT  /membros/{id}     # Atualizar membro
GET  /financeiro       # Transações financeiras
POST /financeiro       # Novo lançamento
```

---

## 10. MONITORAMENTO E PERFORMANCE

### 10.1 Detecção de Problemas

#### 10.1.1 Reconexão Automática
O sistema detecta automaticamente quando a internet é reconectada:

```
⚠️ Internet desconectada → Modo Offline → Usa Cache Local
✅ Internet reconectada → Reinicia Atualizações → Sincroniza Dados
```

#### 10.1.2 Indicadores de Status
- **Online**: ● Verde - Sistema funcionando normalmente
- **Sincronizando**: ◐ Amarelo - Sincronizando dados
- **Offline**: ● Vermelho - Sem conexão, usando cache

### 10.2 Otimizações de Performance
- Cache inteligente de dados
- Compressão de imagens
- Lazy loading de componentes
- Minimização de requisições ao servidor

---

## 11. TROUBLESHOOTING

### 11.1 Problemas Comuns

#### Não consigo fazer login
**Soluções**:
1. Verificar se email está correto
2. Tentar recuperação de senha
3. Limpar cache do navegador
4. Verificar se usuário está ativo

#### Tokens expiraram
**Soluções**:
1. Fazer logout e login novamente
2. Verificar conexão com internet
3. Aguardar sincronização automática

#### Relatórios não carregam
**Soluções**:
1. Verificar filtros de data aplicados
2. Reduzir período do relatório
3. Limpar filtros e tentar novamente
4. Atualizar página (F5)

#### Erro ao cadastrar membro
**Soluções**:
1. Verificar CPF duplicado
2. Validar formato de campos obrigatórios
3. Verificar tamanho de foto (max 2MB)
4. Tentar novamente após alguns segundos

---

## 12. SEGURANÇA E PRIVACIDADE

### 12.1 Proteções Implementadas
- Criptografia end-to-end
- Token JWT com expiração
- Rate limiting contra ataques
- Proteção XSS e SQL Injection
- HTTPS obrigatório
- Logs de auditoria completos

### 12.2 LGPD - Lei Geral de Proteção de Dados
- Dados criptografados em repouso
- Acesso controlado por perfil
- Logs de quem acessou dados sensíveis
- Possibilidade de exclusão de dados
- Termo de consentimento de uso de dados

---

## 13. SUPORTE TÉCNICO

### 13.1 Canais de Suporte
- **Email**: suporte@adbelavista.com.br
- **WhatsApp**: (XX) XXXXX-XXXX
- **Telefone**: (XX) XXXX-XXXX
- **Horário**: Segunda a Sexta, 9h às 18h

### 13.2 SLA - Acordo de Nível de Serviço
- **Crítico**: Resposta em 2 horas
- **Alto**: Resposta em 4 horas
- **Médio**: Resposta em 8 horas
- **Baixo**: Resposta em 24 horas

---

## 14. ATUALIZAÇÕES DO SISTEMA

### 14.1 Política de Atualizações
- **Patch de Segurança**: Imediato
- **Correções**: Semanal
- **Novas Funcionalidades**: Mensal
- **Versões Maiores**: Trimestral

### 14.2 Notificações
Usuários são notificados sobre atualizações importantes via:
- Banner no sistema
- Email administrativo
- WhatsApp (para atualizações críticas)

---

**Documento gerado em**: 31/07/2026  
**Classificação**: Documentação Técnica - Uso Interno  
**Versão do Sistema**: 1.0.0  
**Próxima Revisão**: 31/01/2027
