# ARQUITETURA DO SISTEMA
## Sistema de Gestão Eclesiástica AD Bela Vista

---

## 1. VISÃO GERAL DA ARQUITETURA

### 1.1 Modelo Arquitetural
O sistema utiliza arquitetura **Client-Server** com separação em **três camadas**:

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                │
│  (Frontend - HTML5, CSS3, JavaScript, PWA)              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST API
┌────────────────────▼────────────────────────────────────┐
│                    CAMADA DE APLICAÇÃO                   │
│  (Backend - Node.js, API REST, Business Logic)          │
└────────────────────┬────────────────────────────────────┘
                     │ SQL/ORM
┌────────────────────▼────────────────────────────────────┐
│                    CAMADA DE DADOS                       │
│  (PostgreSQL + Supabase, Storage, Cache)                │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Princípios Arquiteturais
- **Escalabilidade**: Horizontal e vertical
- **Segurança**: Defense in depth
- **Disponibilidade**: 99,5% uptime
- **Performance**: < 2s tempo de resposta
- **Manutenibilidade**: Código modular e documentado

---

## 2. COMPONENTES DO SISTEMA

### 2.1 Frontend (Client-Side)

#### 2.1.1 Tecnologias
```
┌────────────────────────────────────────┐
│ HTML5 + CSS3 + JavaScript ES6+         │
├────────────────────────────────────────┤
│ • Progressive Web App (PWA)            │
│ • Responsive Design (Mobile-First)     │
│ • Service Workers (Offline Support)    │
│ • Local Storage / IndexedDB            │
│ • Push Notifications API               │
└────────────────────────────────────────┘
```

#### 2.1.2 Páginas Principais
```
/index.html                 → Landing page pública
/pages/admin.html           → Painel administrativo
/pages/membro-login.html    → Login de membros
/pages/membro.html          → Dashboard do membro
/pages/cadastro.html        → Cadastro de membros
/pages/relatorios.html      → Relatórios e analytics
/pages/configuracoes.html   → Configurações do sistema
/pages/superadmin.html      → Administração avançada
```

#### 2.1.3 Arquivos JavaScript Principais
```javascript
/js/main.js           // Scripts gerais da landing page
/js/admin.js          // Lógica do painel administrativo
/js/membro.js         // Lógica da área do membro
/js/supabase.js       // Client Supabase (singleton)
/js/auth.js           // Autenticação e tokens
/js/utils.js          // Funções utilitárias
/js/charts.js         // Gráficos e visualizações
```

### 2.2 Backend (Server-Side)

#### 2.2.1 Supabase como BaaS
```
┌─────────────────────────────────────────┐
│         SUPABASE (Backend-as-a-Service) │
├─────────────────────────────────────────┤
│ ✓ PostgreSQL Database                   │
│ ✓ Row Level Security (RLS)              │
│ ✓ Real-time Subscriptions               │
│ ✓ Authentication (JWT)                  │
│ ✓ Storage (Files & Images)              │
│ ✓ Edge Functions (Serverless)           │
│ ✓ RESTful API Auto-gerada               │
└─────────────────────────────────────────┘
```

#### 2.2.2 Estrutura de API
```
Base URL: https://[projeto].supabase.co

Endpoints Principais:
  /rest/v1/membros                  # CRUD membros
  /rest/v1/ministerios              # CRUD ministérios
  /rest/v1/financeiro              # Lançamentos financeiros
  /rest/v1/eventos                  # Eventos da igreja
  /rest/v1/comunicacao              # Mensagens e avisos
  /rest/v1/usuarios                 # Usuários administrativos
  /rest/v1/audit_log                # Logs de auditoria
  /rest/v1/rpc/custom_function      # Stored procedures
  /auth/v1/token                    # Autenticação JWT
  /storage/v1/object/               # Upload de arquivos
```

### 2.3 Banco de Dados

#### 2.3.1 PostgreSQL - Schema Principal
```sql
-- Tabelas Core
membros               # Cadastro de pessoas
ministerios           # Ministérios da igreja
membro_ministerio     # Relacionamento N:N
eventos               # Eventos e cultos
evento_presenca       # Controle de presença
financeiro            # Transações financeiras
dizimos               # Registro de dízimos
ofertas               # Registro de ofertas
comunicacao           # Mensagens enviadas
usuarios              # Usuários administrativos
audit_log             # Auditoria de operações
tokens_temporarios    # Tokens de acesso temporário
configuracoes         # Configurações do sistema
```

#### 2.3.2 Diagrama ER Simplificado
```
┌──────────────┐       ┌────────────────┐       ┌──────────────┐
│   membros    │──────<│membro_ministerio│>──────│ ministerios  │
└──────────────┘       └────────────────┘       └──────────────┘
       │                                                 │
       │                                                 │
       ▼                                                 ▼
┌──────────────┐                               ┌──────────────┐
│   dizimos    │                               │   usuarios   │
└──────────────┘                               └──────────────┘
       │                                                 │
       │                                                 │
       ▼                                                 ▼
┌──────────────┐                               ┌──────────────┐
│  financeiro  │                               │  audit_log   │
└──────────────┘                               └──────────────┘
```

---

## 3. FLUXOS DE DADOS

### 3.1 Fluxo de Autenticação

```
┌─────────┐                  ┌──────────┐                  ┌─────────┐
│ Usuário │                  │ Frontend │                  │ Supabase│
└────┬────┘                  └────┬─────┘                  └────┬────┘
     │                            │                             │
     │ 1. Insere credenciais      │                             │
     ├───────────────────────────>│                             │
     │                            │ 2. POST /auth/v1/token      │
     │                            ├────────────────────────────>│
     │                            │                             │
     │                            │ 3. JWT Token + Refresh      │
     │                            │<────────────────────────────┤
     │                            │ 4. Armazena token (seguro)  │
     │                            │                             │
     │ 5. Dashboard autenticado   │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │ 6. Requisições com Bearer  │                             │
     │                            ├────────────────────────────>│
     │                            │ 7. Valida JWT               │
     │                            │                             │
     │                            │ 8. Dados autorizados        │
     │                            │<────────────────────────────┤
     │ 9. Exibe dados             │                             │
     │<───────────────────────────┤                             │
```

### 3.2 Fluxo de Cadastro de Membro

```
Administrador → [Formulário] → Validação Client-Side → API POST /membros
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │ Backend Validation      │
                            │ - CPF único             │
                            │ - Campos obrigatórios   │
                            │ - Formato de dados      │
                            └────────┬────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                  ERRO                              SUCESSO
                    │                                 │
                    ▼                                 ▼
          [Mensagem de Erro]              [INSERT no banco]
          [Campo com problema]                       │
                                                     ▼
                                          [Audit Log registrado]
                                                     │
                                                     ▼
                                          [Resposta 201 Created]
                                                     │
                                                     ▼
                                          [Frontend atualiza lista]
```

### 3.3 Fluxo de Geração de Relatórios

```
Usuário → Seleciona Parâmetros → API GET /relatorios/membros?periodo=2026
                                           │
                                           ▼
                                  ┌────────────────────┐
                                  │ Check Permissions  │
                                  │ (RLS Policy)       │
                                  └─────────┬──────────┘
                                           │
                            ┌──────────────┴──────────────┐
                            │                             │
                     NÃO AUTORIZADO                   AUTORIZADO
                            │                             │
                            ▼                             ▼
                    [403 Forbidden]           [Query ao PostgreSQL]
                                                         │
                                                         ▼
                                              [Aggregation + Join]
                                                         │
                                                         ▼
                                               [Retorna JSON]
                                                         │
                                                         ▼
                                     [Frontend processa e renderiza]
                                                         │
                                     ┌───────────────────┴────────────────┐
                                     │                                    │
                                   GRÁFICOS                            TABELAS
                                     │                                    │
                                     ▼                                    ▼
                                [Chart.js]                         [DataTables]
```

---

## 4. SEGURANÇA

### 4.1 Camadas de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 1: Network Security                                  │
│ • HTTPS/TLS 1.3 obrigatório                                 │
│ • Firewall (WAF - Web Application Firewall)                 │
│ • DDoS Protection                                            │
│ • Rate Limiting                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 2: Application Security                              │
│ • JWT Token Authentication                                   │
│ • CSRF Protection                                            │
│ • XSS Prevention (Content Security Policy)                  │
│ • SQL Injection Protection (Parameterized Queries)          │
│ • Input Validation & Sanitization                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 3: Database Security                                 │
│ • Row Level Security (RLS)                                   │
│ • Encrypted at Rest (AES-256)                               │
│ • Encrypted in Transit (TLS)                                │
│ • Audit Logging                                              │
│ • Principle of Least Privilege                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Row Level Security (RLS) Policies

```sql
-- Exemplo: Membros só podem ver seus próprios dados
CREATE POLICY "membros_select_policy"
ON membros FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND perfil IN ('admin', 'superadmin')
  )
);

-- Exemplo: Apenas administradores podem inserir membros
CREATE POLICY "membros_insert_policy"
ON membros FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND perfil IN ('admin', 'superadmin', 'secretario')
  )
);
```

### 4.3 Autenticação e Autorização

```
┌─────────────────────────────────────────────────────────────┐
│ NÍVEIS DE ACESSO                                            │
├─────────────────────────────────────────────────────────────┤
│ PÚBLICO (Sem autenticação)                                  │
│ • Landing page                                              │
│ • Política de privacidade                                   │
├─────────────────────────────────────────────────────────────┤
│ MEMBRO (Autenticação via CPF/Senha)                        │
│ • Visualizar próprios dados                                │
│ • Consultar histórico pessoal                              │
│ • Atualizar contatos                                        │
├─────────────────────────────────────────────────────────────┤
│ SECRETÁRIO (Autenticação + Perfil)                         │
│ • Cadastrar membros                                         │
│ • Visualizar relatórios                                     │
│ • Gerenciar eventos                                         │
├─────────────────────────────────────────────────────────────┤
│ TESOUREIRO (Autenticação + Perfil)                         │
│ • Lançamentos financeiros                                   │
│ • Relatórios financeiros                                    │
│ • Geração de recibos                                        │
├─────────────────────────────────────────────────────────────┤
│ ADMINISTRADOR (Autenticação + Perfil)                      │
│ • Todas as funcionalidades exceto:                         │
│   - Configurações críticas                                  │
│   - Exclusão de logs                                        │
├─────────────────────────────────────────────────────────────┤
│ SUPER ADMINISTRADOR (Autenticação + Perfil)                │
│ • Acesso total ao sistema                                   │
│ • Configurações de segurança                                │
│ • Gerenciamento de usuários                                 │
│ • Acesso a logs de auditoria                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. ESCALABILIDADE

### 5.1 Estratégias de Escalabilidade

#### 5.1.1 Escalabilidade Horizontal
```
         [Load Balancer]
               │
      ┌────────┼────────┐
      │        │        │
   [App 1]  [App 2]  [App 3]  ← Múltiplas instâncias
      │        │        │
      └────────┼────────┘
               │
        [Database Pool]
               │
          [PostgreSQL]
```

#### 5.1.2 Cache Strategy
```
┌──────────────┐    ┌───────────┐    ┌──────────────┐
│   Request    │───>│   Cache   │───>│   Database   │
│              │    │  (Redis)  │    │ (PostgreSQL) │
└──────────────┘    └───────────┘    └──────────────┘
                         │
                         ▼
                    Cache Hit: 
                    Retorna imediatamente
                    
                    Cache Miss:
                    Busca no DB → Armazena no Cache → Retorna
```

**Itens Cacheados**:
- Configurações do sistema (TTL: 1 hora)
- Lista de ministérios (TTL: 30 min)
- Estatísticas do dashboard (TTL: 5 min)
- Dados de membros (TTL: 10 min)

### 5.2 Otimizações de Performance

#### 5.2.1 Frontend
- **Lazy Loading**: Imagens e componentes carregados sob demanda
- **Code Splitting**: JavaScript dividido em chunks
- **Minificação**: CSS e JS compactados
- **Compressão**: Gzip/Brotli habilitado
- **CDN**: Assets estáticos via CDN

#### 5.2.2 Backend
- **Connection Pooling**: Pool de conexões ao banco
- **Query Optimization**: Índices e query plans otimizados
- **Pagination**: Limitação de registros retornados
- **Async Processing**: Tarefas pesadas em background

#### 5.2.3 Database
```sql
-- Índices Críticos
CREATE INDEX idx_membros_cpf ON membros(cpf);
CREATE INDEX idx_membros_status ON membros(status);
CREATE INDEX idx_dizimos_membro ON dizimos(membro_id);
CREATE INDEX idx_dizimos_data ON dizimos(data);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

-- Particionamento de Tabelas Grandes
CREATE TABLE audit_log_2026 PARTITION OF audit_log
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

---

## 6. MONITORAMENTO E OBSERVABILIDADE

### 6.1 Métricas de Sistema

```
┌─────────────────────────────────────────────────────────────┐
│ MÉTRICAS MONITORADAS                                        │
├─────────────────────────────────────────────────────────────┤
│ Infraestrutura:                                             │
│ • CPU Usage (target: < 70%)                                 │
│ • Memory Usage (target: < 80%)                              │
│ • Disk I/O (target: < 75%)                                  │
│ • Network Throughput                                         │
├─────────────────────────────────────────────────────────────┤
│ Aplicação:                                                  │
│ • Request Rate (req/s)                                      │
│ • Response Time (p50, p95, p99)                             │
│ • Error Rate (target: < 0.1%)                               │
│ • Uptime (target: 99.5%)                                    │
├─────────────────────────────────────────────────────────────┤
│ Banco de Dados:                                             │
│ • Connection Pool Usage                                     │
│ • Query Performance (slow queries)                          │
│ • Deadlocks e Lock Waits                                    │
│ • Disk Usage Growth Rate                                    │
├─────────────────────────────────────────────────────────────┤
│ Negócio:                                                    │
│ • Novos cadastros/dia                                       │
│ • Logins/dia                                                │
│ • Transações financeiras/dia                                │
│ • Mensagens enviadas/dia                                    │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Logging

```
┌──────────────────────────────────────────────────────────┐
│ NÍVEIS DE LOG                                            │
├──────────────────────────────────────────────────────────┤
│ ERROR   : Erros que impedem operação                     │
│ WARN    : Situações anormais mas não críticas            │
│ INFO    : Eventos importantes do sistema                 │
│ DEBUG   : Informações detalhadas para diagnóstico        │
└──────────────────────────────────────────────────────────┘

Exemplo de Log Estruturado (JSON):
{
  "timestamp": "2026-07-31T10:30:00.000Z",
  "level": "INFO",
  "service": "api",
  "action": "membro.create",
  "user_id": "uuid-123",
  "duration_ms": 45,
  "status": "success",
  "ip": "192.168.1.100"
}
```

### 6.3 Alertas Automáticos

| Condição | Severidade | Ação |
|----------|------------|------|
| CPU > 85% por 5 min | HIGH | Email + SMS + Escalar |
| Erro rate > 1% | HIGH | Email + SMS |
| Response time > 5s | MEDIUM | Email |
| Disco > 90% | HIGH | Email + Ticket |
| Backup falhou | CRITICAL | Email + SMS + Chamada |
| Disponibilidade < 99% | HIGH | Email + SMS |

---

## 7. DISASTER RECOVERY

### 7.1 Estratégia de Backup

```
┌───────────────────────────────────────────────────────┐
│ POLÍTICA DE BACKUP                                    │
├───────────────────────────────────────────────────────┤
│ Backup Completo (Full):                              │
│ • Frequência: Semanal (Domingos 02:00 AM)            │
│ • Retenção: 4 semanas                                │
│ • Local: Cloud Storage (região diferente)            │
├───────────────────────────────────────────────────────┤
│ Backup Incremental:                                  │
│ • Frequência: Diário (03:00 AM)                      │
│ • Retenção: 30 dias                                  │
│ • Local: Cloud Storage + Local                       │
├───────────────────────────────────────────────────────┤
│ Backup Transacional (WAL):                          │
│ • Frequência: Contínuo (streaming)                   │
│ • Retenção: 7 dias                                   │
│ • RPO: 5 minutos                                     │
└───────────────────────────────────────────────────────┘
```

### 7.2 RTO e RPO

- **RTO (Recovery Time Objective)**: 4 horas
- **RPO (Recovery Point Objective)**: 5 minutos
- **MTTR (Mean Time To Repair)**: 2 horas

### 7.3 Plano de Recuperação

```
CENÁRIO 1: Falha de Aplicação
├─ Detecção: Monitoramento automático (< 1 min)
├─ Diagnóstico: Análise de logs (5-10 min)
├─ Ação: Restart automático ou rollback
└─ Tempo Total: 15-30 minutos

CENÁRIO 2: Corrupção de Dados
├─ Detecção: Validação de integridade
├─ Diagnóstico: Identificação do escopo (30 min)
├─ Ação: Restauração de backup específico
└─ Tempo Total: 1-2 horas

CENÁRIO 3: Desastre Total (Data Center)
├─ Detecção: Imediata (failover automático)
├─ Ação: Ativação de região secundária
├─ Restauração: Backup mais recente
└─ Tempo Total: 2-4 horas
```

---

## 8. INTEGRAÇÕES EXTERNAS

### 8.1 WhatsApp Business API

```
Sistema → [API Gateway] → [WhatsApp Business API] → [WhatsApp]
              │
              ├─ Autenticação: Bearer Token
              ├─ Rate Limit: 1000 msg/hora
              ├─ Templates: Pré-aprovados pelo WhatsApp
              └─ Webhooks: Recebimento de respostas
```

### 8.2 Gateways de Pagamento (Futuro)

```
Sistema → [Payment Gateway] → [Adquirente] → [Banco]
              │
              ├─ PCI-DSS Compliance
              ├─ Tokenização de Cartões
              ├─ 3D Secure
              └─ Webhooks de Confirmação
```

---

## 9. DEPLOY E CI/CD

### 9.1 Pipeline de Deploy

```
[Git Push] → [GitHub Actions] → [Build & Test] → [Deploy to Vercel]
                                      │
                                      ├─ Unit Tests
                                      ├─ Integration Tests
                                      ├─ Linting
                                      └─ Security Scan
```

### 9.2 Ambientes

| Ambiente | URL | Objetivo | Deploy |
|----------|-----|----------|--------|
| Development | dev.sistema.com.br | Desenvolvimento | Manual |
| Staging | staging.sistema.com.br | Testes e homologação | Automático (branch develop) |
| Production | sistema.com.br | Produção | Manual (aprovação) |

---

## 10. MANUTENÇÃO E EVOLUÇÃO

### 10.1 Janelas de Manutenção

- **Programada**: Domingos 02:00 - 05:00 AM
- **Emergencial**: Quando necessário (com notificação)
- **Atualizações de Segurança**: Imediatas (hotfix)

### 10.2 Roadmap Técnico

**Q3 2026**:
- Implementação de cache Redis
- Otimização de queries lentas
- App mobile nativo (Flutter)

**Q4 2026**:
- Integração com gateway de pagamento
- Sistema de notificações push avançado
- Dashboard de analytics em tempo real

---

**Documento gerado em**: 31/07/2026  
**Classificação**: Documentação Técnica - Confidencial  
**Próxima Revisão**: Trimestral  
**Versão**: 1.0.0
