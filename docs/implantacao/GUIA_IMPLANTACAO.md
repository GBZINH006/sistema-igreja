# Guia de Implantação
## Sistema de Gestão Eclesiástica AD Bela Vista

**Versão**: 2.0.0  
**Público-alvo**: Equipe Técnica e Gestores  
**Última atualização**: Julho de 2026

---

## 📋 Índice

1. [Visão Geral da Implantação](#visão-geral-da-implantação)
2. [Pré-requisitos](#pré-requisitos)
3. [Fase 1: Planejamento](#fase-1-planejamento)
4. [Fase 2: Configuração Técnica](#fase-2-configuração-técnica)
5. [Fase 3: Migração de Dados](#fase-3-migração-de-dados)
6. [Fase 4: Testes e Homologação](#fase-4-testes-e-homologação)
7. [Fase 5: Treinamento](#fase-5-treinamento)
8. [Fase 6: Go-Live](#fase-6-go-live)
9. [Fase 7: Suporte Pós-Implantação](#fase-7-suporte-pós-implantação)
10. [Resolução de Problemas](#resolução-de-problemas)

---

## 1. Visão Geral da Implantação

### 1.1 Objetivo

Implantar de forma **estruturada e segura** o Sistema de Gestão Eclesiástica, garantindo:

- ✅ Mínima interrupção nas atividades da igreja
- ✅ Migração completa e íntegra dos dados existentes
- ✅ Capacitação adequada dos usuários
- ✅ Estabilidade e segurança desde o primeiro dia

### 1.2 Cronograma Resumido

| Fase | Atividade | Duração | Responsável |
|------|-----------|---------|-------------|
| 1 | Planejamento | 2-3 dias | Gestor + Dev |
| 2 | Configuração Técnica | 3-5 dias | Dev |
| 3 | Migração de Dados | 2-4 dias | Dev + Secretaria |
| 4 | Testes e Homologação | 3-5 dias | Todos |
| 5 | Treinamento | 2 dias | Dev + Gestores |
| 6 | Go-Live | 1 dia | Todos |
| 7 | Suporte Pós-Go-Live | 30 dias | Dev |

**Total**: 15-20 dias úteis (aproximadamente 1 mês)

### 1.3 Equipe de Implantação

| Papel | Responsabilidade | Dedicação |
|-------|------------------|-----------|
| **Gestor do Projeto** | Pastor ou líder designado | 4h/semana |
| **Desenvolvedor** | Configuração técnica e suporte | 40h/semana |
| **Secretário(a)** | Validação de dados e testes | 8h/semana |
| **Usuário-chave** | Testes e feedback | 4h/semana |

---

## 2. Pré-requisitos

### 2.1 Documentação Necessária

Antes de iniciar, providenciar:

- [X] CNPJ da igreja
- [X] Endereço completo e atualizado
- [X] Logotipo em alta resolução (PNG com fundo transparente)
- [X] Cores institucionais (código hexadecimal)
- [X] E-mail institucional da igreja
- [X] Lista de usuários administrativos (pastores, secretários)
- [X] Relação de setores/congregações
- [X] Lista de cargos/ministérios

### 2.2 Infraestrutura Técnica

Garantir disponibilidade de:

- [X] Acesso à internet estável (mínimo 10 Mbps)
- [X] Computadores com navegadores atualizados (Chrome 90+, Firefox 88+)
- [X] E-mails válidos para todos os usuários administrativos
- [X] Conta GitHub (para armazenar código-fonte)
- [X] Conta Vercel (para hospedagem frontend)
- [X] Conta Supabase (para backend e banco de dados)

### 2.3 Dados Legados (se aplicável)

Caso a igreja já possua cadastro em outro sistema:

- [X] Exportação de dados em Excel ou CSV
- [X] Validação de integridade (CPFs únicos, datas corretas, etc.)
- [X] Aprovação do pastor para migração completa

### 2.4 Recursos Humanos

Definir e comunicar:

- [X] Pessoa de contato principal (decisor)
- [X] Horários de disponibilidade para reuniões
- [X] Data preferencial para go-live (sugestão: segunda-feira)
- [X] Usuários que participarão dos treinamentos

---

## 3. Fase 1: Planejamento

**Duração**: 2-3 dias  
**Responsável**: Gestor do Projeto + Desenvolvedor

### 3.1 Reunião de Kickoff

**Objetivo**: Alinhar expectativas e definir escopo.

**Pauta**:

1. Apresentação da equipe de implantação
2. Demonstração do sistema (tour completo)
3. Definição de funcionalidades prioritárias
4. Levantamento de personalizações necessárias
5. Definição do cronograma detalhado
6. Assinatura do contrato e termos

**Duração**: 1,5 a 2 horas

**Entrega**: Ata de reunião com decisões e próximos passos

### 3.2 Levantamento de Requisitos

**Checklist**:

- [X] Quantos membros/congregados serão migrados?
- [X] Quais campos personalizados são necessários?
- [X] Há necessidade de integração com outros sistemas?
- [X] Qual a política de retenção de dados da igreja (LGPD)?
- [X] Quem será o Encarregado de Dados (DPO)?
- [X] Há documentos específicos para anexar (certidões, diplomas)?
- [X] Existem relatórios personalizados obrigatórios?

### 3.3 Planejamento de Comunicação

Definir:

- **Quando comunicar** aos membros sobre o novo sistema?
- **Como comunicar**: Culto, grupo de WhatsApp, e-mail?
- **Quem comunica**: Pastor, secretário ou equipe de comunicação?
- **Material de comunicação**: Criar banner, vídeo explicativo?

---

## 4. Fase 2: Configuração Técnica

**Duração**: 3-5 dias  
**Responsável**: Desenvolvedor

### 4.1 Criação de Contas

#### 4.1.1 GitHub
1. Criar organização ou repositório privado
2. Fazer fork do código base
3. Configurar proteções de branch (main)

#### 4.1.2 Vercel
1. Criar conta em https://vercel.com
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente
4. Realizar primeiro deploy

#### 4.1.3 Supabase
1. Criar projeto em https://supabase.com
2. Anotar URL e API Keys
3. Configurar autenticação por e-mail
4. Habilitar Storage para upload de arquivos

### 4.2 Configuração do Banco de Dados

**Executar em ordem**:

1. **Criar tabelas**:
   ```sql
   -- Ver arquivo: /api/EXECUTAR_ESTE_SQL.sql
   ```

2. **Configurar Row Level Security (RLS)**:
   ```sql
   -- Ver arquivo: /api/fix-rls-permissions.sql
   ```

3. **Instalar sistema de tokens**:
   ```sql
   -- Ver arquivo: /INSTALAR_TOKENS_COMPLETO.sql
   ```

4. **Criar perfis administrativos**:
   ```sql
   -- Ver arquivo: /CRIAR_PERFIS_ADMIN.sql
   ```

### 4.3 Personalização Visual

1. **Upload do logotipo**:
   - Substituir `/public/assets/images-removebg-preview.png`

2. **Cores institucionais**:
   - Editar `/public/css/admin.css` (variáveis `:root`)

3. **Dados da igreja**:
   - Atualizar rodapés, headers e documentos

### 4.4 Testes de Integração

**Checklist**:

- [X] Login administrativo funcionando
- [X] Cadastro de teste criado com sucesso
- [X] Upload de imagem funcionando (Storage)
- [X] Link temporário gerado e validado
- [X] Exportação Excel/PDF funcionando
- [X] Notificações em tempo real ativas
- [X] Portal do membro acessível

---

## 5. Fase 3: Migração de Dados

**Duração**: 2-4 dias  
**Responsável**: Desenvolvedor + Secretaria

### 5.1 Preparação dos Dados

#### 5.1.1 Validação da Planilha Excel

**Colunas obrigatórias**:

| Campo | Formato | Observação |
|-------|---------|------------|
| nome | Texto | Nome completo |
| cpf | Somente números | 11 dígitos |
| data_nasc | DD/MM/AAAA | Data válida |
| sexo | M ou F | Maiúsculo |
| celular | (99) 99999-9999 | Com DDD |
| email | E-mail válido | Único |
| tipo_cadastro | Membro ou Congregado | Exato |
| setor_igreja | Texto | Nome do setor |
| status | Ativo, Inativo, etc. | Opcional (padrão: Ativo) |

#### 5.1.2 Limpeza de Dados

**Tarefas**:

- [X] Remover linhas duplicadas (mesmo CPF)
- [X] Validar CPFs (usar ferramentas online)
- [X] Corrigir datas inválidas (ex: 30/02/1990)
- [X] Padronizar telefones (adicionar DDD se faltante)
- [X] Verificar e-mails (formato correto)
- [X] Remover caracteres especiais de nomes

**Ferramentas recomendadas**:
- Excel: Remover Duplicatas, Localizar e Substituir
- Google Sheets: Data Validation
- Site: https://www.4devs.com.br/validador_cpf (validar CPFs)

### 5.2 Importação para o Banco

**Script de importação**:

```sql
-- Importação via COPY (PostgreSQL)
COPY membros(nome, cpf, data_nasc, sexo, celular, email, tipo_cadastro, setor_igreja, status)
FROM '/caminho/para/arquivo.csv'
DELIMITER ','
CSV HEADER;
```

**Alternativa**: Usar interface do Supabase → Table Editor → Insert rows (para poucos registros).

### 5.3 Validação Pós-Migração

**Checklist**:

- [X] Total de registros migrados confere com planilha original
- [X] Nenhum CPF duplicado no sistema
- [X] Datas de nascimento estão corretas
- [X] E-mails únicos (sem duplicação)
- [X] Setores/congregações cadastrados
- [X] Cargos/ministérios cadastrados
- [X] Fotos migradas (se aplicável)

---

## 6. Fase 4: Testes e Homologação

**Duração**: 3-5 dias  
**Responsável**: Toda equipe

### 6.1 Plano de Testes

#### 6.1.1 Testes Funcionais

| ID | Funcionalidade | Cenário de Teste | Resultado Esperado | Status |
|----|----------------|------------------|--------------------|--------|
| 1 | Login Admin | Entrar com e-mail e senha | Acesso ao dashboard | [ ] |
| 2 | Cadastro Membro | Preencher formulário completo | Ficha salva como "Pendente" | [ ] |
| 3 | Aprovação Ficha | Aprovar ficha pendente | Status muda para "Aprovado" | [ ] |
| 4 | Gerar Link | Criar link temporário | Link copiado e funcional | [ ] |
| 5 | Usar Link | Acessar link e cadastrar | Cadastro concluído com sucesso | [ ] |
| 6 | Editar Membro | Alterar telefone de membro | Telefone atualizado | [ ] |
| 7 | Exportar Excel | Clicar em "Exportar Excel" | Arquivo .xlsx baixado | [ ] |
| 8 | Portal Membro | Login com CPF e e-mail | Acesso à ficha pessoal | [ ] |
| 9 | Baixar PDF | Baixar ficha em PDF | Arquivo gerado com assinatura | [ ] |
| 10 | Filtros | Filtrar por "Membros" | Lista apenas membros | [ ] |

#### 6.1.2 Testes de Performance

- [X] Carregar lista com 500+ membros (deve carregar em < 3 segundos)
- [X] Upload de foto 5MB (deve concluir em < 10 segundos)
- [X] Geração de relatório Excel 1000+ linhas (deve gerar em < 5 segundos)

#### 6.1.3 Testes de Usabilidade

- [X] Sistema é intuitivo para usuários não técnicos?
- [X] Mensagens de erro são claras?
- [X] Botões têm rótulos compreensíveis?
- [X] Interface é responsiva em celular?

### 6.2 Correção de Bugs

Para cada bug encontrado:

1. Registrar em planilha com:
   - Descrição detalhada
   - Passos para reproduzir
   - Resultado esperado vs obtido
   - Nível de criticidade (Baixo, Médio, Alto, Crítico)

2. Desenvolvedor corrige e atualiza sistema

3. Retester para confirmar correção

### 6.3 Homologação Final

**Checklist de Homologação**:

- [X] Todas as funcionalidades críticas testadas
- [X] Bugs críticos e altos resolvidos
- [X] Interface aprovada pelo gestor
- [X] Relatórios aprovados pela secretaria
- [X] Portal do membro aprovado por membros-teste
- [X] Performance aceitável
- [X] Documentação entregue (manuais)

**Documento**: Termo de Aceite assinado pelo gestor.

---

## 7. Fase 5: Treinamento

**Duração**: 2 dias  
**Responsável**: Desenvolvedor

### 7.1 Treinamento de Administradores

**Público**: Pastores e administradores  
**Duração**: 2 horas  
**Formato**: Presencial ou remoto (Google Meet/Zoom)

**Agenda**:

1. **Introdução** (15 min)
   - Visão geral do sistema
   - Segurança e boas práticas

2. **Dashboard e Indicadores** (20 min)
   - Navegar pelo dashboard
   - Interpretar indicadores
   - Clicar em cards para detalhes

3. **Gestão de Membros** (30 min)
   - Visualizar e filtrar membros
   - Editar cadastros
   - Aprovar fichas pendentes
   - Excluir (lógica e permanente)

4. **Sistema de Links Temporários** (20 min)
   - Gerar links
   - Monitorar validade
   - Revogar links
   - Boas práticas de uso

5. **Relatórios e Exportação** (15 min)
   - Exportar Excel
   - Gerar relatórios personalizados

6. **Configurações** (10 min)
   - Assinatura digital
   - Dados da igreja

7. **Dúvidas e Casos Práticos** (10 min)

**Material entregue**:
- Manual do Administrador (PDF)
- Vídeo gravado da sessão (se remoto)
- Planilha de contatos para suporte

### 7.2 Treinamento de Secretários

**Público**: Secretários e auxiliares  
**Duração**: 1,5 horas  
**Formato**: Presencial ou remoto

**Agenda**:

1. **Introdução** (10 min)
   - Diferenças entre perfil admin e secretário

2. **Aprovação de Fichas** (30 min)
   - O que verificar antes de aprovar
   - Como solicitar correções
   - Casos práticos

3. **Edição de Cadastros** (20 min)
   - Atualizar telefones e endereços
   - Alterar status de membros

4. **Geração de Relatórios** (15 min)
   - Aniversariantes do mês
   - Novos cadastros

5. **Portal do Membro** (10 min)
   - Como membros acessam
   - Auxílio a membros com dúvidas

6. **Prática** (15 min)
   - Cada secretário aprova 2 fichas
   - Gera 1 link e 1 relatório

**Material entregue**:
- Manual do Secretário (PDF)

### 7.3 Treinamento de Membros

**Público**: Membros e congregados  
**Duração**: 30 minutos  
**Formato**: Vídeo tutorial + FAQ escrito

**Conteúdo**:

1. Como fazer cadastro via link (5 min)
2. Como acessar o portal do membro (5 min)
3. Como atualizar dados (5 min)
4. Como baixar ficha em PDF (5 min)
5. Privacidade e LGPD (10 min)

**Material entregue**:
- Manual do Membro (PDF)
- Vídeo tutorial (YouTube/Vimeo)
- Pôster impresso com QR Code para o manual

---

## 8. Fase 6: Go-Live

**Data**: [Definir - sugestão: segunda-feira]  
**Duração**: 1 dia  
**Responsável**: Toda equipe

### 8.1 Preparação (D-1)

**Checklist Pré-Go-Live**:

- [X] Backup completo do banco de dados realizado
- [X] Sistema em produção estável (sem deploys pendentes)
- [X] Todos os usuários administrativos criados e testados
- [X] Comunicação enviada aos membros sobre novo sistema
- [X] E-mail de suporte criado e monitorado
- [X] Equipe de suporte escalada e disponível
- [X] Plano de rollback definido (caso haja problemas críticos)

### 8.2 Dia do Go-Live

**Cronograma**:

| Horário | Atividade | Responsável |
|---------|-----------|-------------|
| 08:00 | Verificação final do sistema | Desenvolvedor |
| 08:30 | Liberar acesso aos admins | Desenvolvedor |
| 09:00 | Admins testam sistema | Pastor/Secretário |
| 10:00 | Comunicação oficial aos membros | Equipe de Comunicação |
| 10:00-18:00 | Suporte intensivo via WhatsApp | Desenvolvedor + Secretaria |
| 18:00 | Reunião de encerramento | Todos |

### 8.3 Comunicação aos Membros

**Canais**:
- Anúncio no culto (domingo anterior)
- Mensagem no grupo de WhatsApp
- E-mail para membros com e-mail cadastrado
- Cartazes nos murais da igreja
- Post nas redes sociais

**Conteúdo da mensagem**:

> **🎉 Novo Sistema de Gestão da Igreja!**
>
> A partir de [DATA], nossa igreja passa a utilizar um novo sistema de cadastro e gestão de membros.
>
> **O que muda para você?**
> - Cadastro mais rápido e seguro
> - Acesso à sua ficha cadastral online
> - Atualização de dados pelo celular
>
> **Como acessar?**
> - Acesse: [URL do portal do membro]
> - Login: Seu CPF e e-mail cadastrado
>
> **Precisa de ajuda?**
> - WhatsApp: [TELEFONE]
> - E-mail: [E-MAIL DE SUPORTE]
>
> 📱 Assista ao tutorial: [LINK DO VÍDEO]

### 8.4 Monitoramento

Durante as primeiras 48 horas:

- [X] Monitorar logs de erro (Supabase Dashboard)
- [X] Verificar notificações de tempo real
- [X] Acompanhar uso de links temporários
- [X] Responder dúvidas no WhatsApp em até 30 minutos
- [X] Registrar todos os problemas reportados

---

## 9. Fase 7: Suporte Pós-Implantação

**Duração**: 30 dias (período de garantia)  
**Responsável**: Desenvolvedor

### 9.1 Primeira Semana (Suporte Intensivo)

**Atividades**:

- Monitoramento diário do sistema
- Resposta a dúvidas em até 2 horas
- Correção imediata de bugs críticos
- Reunião de acompanhamento (3º dia pós go-live)

### 9.2 Semanas 2-4 (Suporte Padrão)

**Atividades**:

- Resposta a dúvidas em até 24 horas
- Correção de bugs conforme criticidade
- Ajustes de layout e usabilidade
- Relatório semanal de uso do sistema

### 9.3 Indicadores de Sucesso

Acompanhar semanalmente:

| Métrica | Meta | Atual |
|---------|------|-------|
| Taxa de aprovação de cadastros | > 90% | - |
| Tempo médio de aprovação | < 24h | - |
| Links temporários gerados | > 10/semana | - |
| Taxa de uso de links | > 70% | - |
| Membros ativos no portal | > 30% | - |
| Tickets de suporte | < 10/semana | - |
| Satisfação dos usuários | > 4/5 | - |

### 9.4 Reunião de Encerramento

**Data**: 30 dias após go-live  
**Duração**: 1 hora  
**Participantes**: Gestor, Desenvolvedor, Secretário

**Pauta**:

1. Apresentação dos indicadores de sucesso
2. Feedback dos usuários
3. Pontos de melhoria identificados
4. Proposta de plano de manutenção mensal
5. Encerramento formal do projeto

**Entregas finais**:

- [X] Relatório de implantação (PDF)
- [X] Código-fonte completo (GitHub)
- [X] Backup final dos dados
- [X] Documentação técnica completa
- [X] Credenciais de acesso (envelope lacrado)

---

## 10. Resolução de Problemas

### 10.1 Problemas Comuns e Soluções

#### ❌ Sistema não carrega após deploy

**Causa**: Variáveis de ambiente não configuradas no Vercel  
**Solução**:

1. Acessar Vercel → Projeto → Settings → Environment Variables
2. Adicionar `SUPABASE_URL` e `SUPABASE_KEY`
3. Realizar novo deploy

#### ❌ Banco de dados retorna erro de permissão

**Causa**: RLS (Row Level Security) não configurado corretamente  
**Solução**:

1. Executar `/api/fix-rls-permissions.sql`
2. Verificar se usuários têm perfil associado na tabela `profiles`

#### ❌ Link temporário não funciona

**Causa**: Função `generate_registration_token` não instalada  
**Solução**:

1. Executar `/INSTALAR_TOKENS_COMPLETO.sql`
2. Testar geração de novo link

#### ❌ Upload de foto não funciona

**Causa**: Storage não configurado ou bucket não criado  
**Solução**:

1. Acessar Supabase → Storage
2. Criar bucket `membros-docs` (público)
3. Configurar política de upload

### 10.2 Contatos de Emergência

**Desenvolvedor**:
- Nome: [NOME]
- WhatsApp: [TELEFONE]
- E-mail: [E-MAIL]
- Horário: 8h-18h (Segunda a Sexta)

**Suporte Supabase**:
- https://supabase.com/support

**Suporte Vercel**:
- https://vercel.com/support

---

## 📚 Documentos de Apoio

- [Checklist de Implantação](CHECKLIST_IMPLANTACAO.md)
- [Cronograma Detalhado](CRONOGRAMA_IMPLANTACAO.md)
- [Plano de Treinamento](PLANO_TREINAMENTO.md)
- [Manual do Administrador](../manuais/MANUAL_ADMINISTRADOR.md)
- [Manual do Secretário](../manuais/MANUAL_SECRETARIO.md)
- [Manual do Membro](../manuais/MANUAL_MEMBRO.md)

---

*Guia de Implantação - Versão 2.0.0 - Julho de 2026*
