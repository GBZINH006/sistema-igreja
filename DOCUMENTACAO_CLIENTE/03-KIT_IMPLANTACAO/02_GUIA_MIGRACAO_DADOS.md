# GUIA DE MIGRAÇÃO DE DADOS
## Sistema de Gestão Eclesiástica AD Bela Vista

---

## 1. VISÃO GERAL DA MIGRAÇÃO

### 1.1 Objetivo
Este documento fornece orientações técnicas e práticas para preparar, validar e migrar dados do sistema atual (ou planilhas) para o novo Sistema de Gestão Eclesiástica.

### 1.2 Princípios da Migração
- **Integridade**: Garantir que nenhum dado seja perdido ou corrompido
- **Consistência**: Manter relacionamentos e regras de negócio
- **Validação**: Verificar qualidade antes e depois da migração
- **Rastreabilidade**: Documentar todo o processo

### 1.3 Responsabilidades

| Papel | Responsabilidade |
|-------|------------------|
| **Cliente** | Fornecer dados, validar informações, aprovar resultados |
| **Equipe Técnica** | Executar migração, validar integridade técnica |
| **Coordenador** | Aprovar cada etapa, resolver conflitos |

---

## 2. PREPARAÇÃO DOS DADOS

### 2.1 Inventário de Dados

#### 2.1.1 Dados de Membros
**Campos Obrigatórios**:
- Nome completo
- CPF (único no sistema)
- Data de nascimento
- Telefone celular
- Status (Membro/Congregado/Visitante)

**Campos Recomendados**:
- RG
- Email
- Endereço completo
- Estado civil
- Sexo
- Data de batismo
- Data de conversão
- Ministério

**Campos Opcionais**:
- Foto
- Observações
- Telefone fixo
- Cargo na igreja

#### 2.1.2 Dados Financeiros
**Dízimos**:
- CPF do dizimista
- Data do dízimo
- Valor
- Método de pagamento
- Mês/ano de referência

**Ofertas**:
- Data
- Valor
- Finalidade
- Doador (opcional)

**Despesas**:
- Data
- Categoria
- Descrição
- Valor
- Forma de pagamento

#### 2.1.3 Ministérios
- Nome do ministério
- Coordenador
- Descrição
- Membros participantes
- Data de criação

---

## 3. MODELOS DE PLANILHAS

### 3.1 Planilha de Membros

**Arquivo**: `TEMPLATE_MEMBROS.xlsx`

```
┌────────────────┬─────────────┬────────────────┬────────────┬─────────────┬──────────────┐
│ Nome Completo* │ CPF*        │ Data Nasc.*    │ Telefone*  │ Email       │ Status*      │
├────────────────┼─────────────┼────────────────┼────────────┼─────────────┼──────────────┤
│ João da Silva  │ 12345678900 │ 15/03/1985     │ 11987654321│ joao@x.com  │ Membro       │
└────────────────┴─────────────┴────────────────┴────────────┴─────────────┴──────────────┘

Continuação:
┌──────┬──────────────┬─────────┬─────────┬───────────┬───────────┬─────────┬────────┐
│ Sexo │ Est. Civil   │ CEP     │ Endereço│ Número    │ Bairro    │ Cidade  │ UF     │
├──────┼──────────────┼─────────┼─────────┼───────────┼───────────┼─────────┼────────┤
│ M    │ Casado       │ 01234567│ Rua X   │ 123       │ Centro    │ São Paulo│ SP    │
└──────┴──────────────┴─────────┴─────────┴───────────┴───────────┴─────────┴────────┘

Continuação:
┌────────────────┬────────────────┬────────────┬──────────────────┐
│ Data Batismo   │ Data Conversão │ Ministério │ Observações      │
├────────────────┼────────────────┼────────────┼──────────────────┤
│ 10/05/2020     │ 22/03/2020     │ Louvor     │ Músico - Violão  │
└────────────────┴────────────────┴────────────┴──────────────────┘
```

**Regras de Preenchimento**:
1. Campos com * são obrigatórios
2. CPF deve ter 11 dígitos (sem pontos ou traços)
3. Data no formato DD/MM/AAAA
4. Telefone com DDD (11 dígitos para celular)
5. Status: "Membro", "Congregado" ou "Visitante"
6. Sexo: "M" ou "F"

### 3.2 Planilha de Dízimos

**Arquivo**: `TEMPLATE_DIZIMOS.xlsx`

```
┌─────────────┬────────────┬──────────┬────────────────────┬─────────────┐
│ CPF Membro* │ Data*      │ Valor*   │ Forma Pagamento*   │ Referência  │
├─────────────┼────────────┼──────────┼────────────────────┼─────────────┤
│ 12345678900 │ 05/07/2026 │ 500.00   │ PIX                │ Jul/2026    │
│ 12345678900 │ 05/06/2026 │ 500.00   │ Dinheiro           │ Jun/2026    │
└─────────────┴────────────┴──────────┴────────────────────┴─────────────┘
```

**Regras de Preenchimento**:
1. CPF deve existir na planilha de membros
2. Data no formato DD/MM/AAAA
3. Valor com ponto como separador decimal (ex: 500.00)
4. Forma de Pagamento: "Dinheiro", "PIX", "Transferência", "Débito", "Crédito", "Cheque"

### 3.3 Planilha de Ofertas

**Arquivo**: `TEMPLATE_OFERTAS.xlsx`

```
┌────────────┬──────────┬────────────────┬──────────────────┬─────────────┐
│ Data*      │ Valor*   │ Finalidade*    │ Doador (CPF)     │ Observações │
├────────────┼──────────┼────────────────┼──────────────────┼─────────────┤
│ 15/07/2026 │ 100.00   │ Missões        │ 12345678900      │             │
│ 01/07/2026 │ 200.00   │ Construção     │                  │ Anônimo     │
└────────────┴──────────┴────────────────┴──────────────────┴─────────────┘
```

### 3.4 Planilha de Despesas

**Arquivo**: `TEMPLATE_DESPESAS.xlsx`

```
┌────────────┬────────────────┬──────────────────────┬──────────┬──────────────────┐
│ Data*      │ Categoria*     │ Descrição*           │ Valor*   │ Forma Pagamento* │
├────────────┼────────────────┼──────────────────────┼──────────┼──────────────────┤
│ 10/07/2026 │ Aluguel        │ Aluguel sede jul/26  │ 2000.00  │ Transferência    │
│ 15/07/2026 │ Contas         │ Conta de luz         │ 350.50   │ Boleto           │
└────────────┴────────────────┴──────────────────────┴──────────┴──────────────────┘
```

**Categorias de Despesas**:
- Aluguel
- Contas (luz, água, internet)
- Salários
- Manutenção
- Material
- Transporte
- Alimentação
- Outras

### 3.5 Planilha de Ministérios

**Arquivo**: `TEMPLATE_MINISTERIOS.xlsx`

```
┌──────────────────┬────────────────┬───────────────────────────┬──────────────┐
│ Nome Ministério* │ Coordenador*   │ Descrição                 │ Data Criação │
├──────────────────┼────────────────┼───────────────────────────┼──────────────┤
│ Louvor           │ 12345678900    │ Ministério de louvor...   │ 01/01/2020   │
│ Jovens           │ 98765432100    │ Ministério de jovens...   │ 15/03/2019   │
└──────────────────┴────────────────┴───────────────────────────┴──────────────┘
```

---

## 4. VALIDAÇÃO DE DADOS

### 4.1 Validação Automática

O sistema executará as seguintes validações automáticas:

#### 4.1.1 Validações de CPF
- [ ] CPF no formato correto (11 dígitos)
- [ ] Dígitos verificadores válidos
- [ ] CPF não duplicado
- [ ] CPF não pertence a lista de inválidos conhecidos

#### 4.1.2 Validações de Data
- [ ] Formato DD/MM/AAAA
- [ ] Data válida (dia/mês corretos)
- [ ] Data de nascimento: Pessoa deve ter entre 0 e 120 anos
- [ ] Data de batismo posterior à data de nascimento
- [ ] Data de conversão anterior ou igual à data de batismo

#### 4.1.3 Validações de Contato
- [ ] Telefone com 10 ou 11 dígitos (DDD + número)
- [ ] Email no formato válido (se informado)
- [ ] Pelo menos um meio de contato (telefone ou email)

#### 4.1.4 Validações de Valores Financeiros
- [ ] Valor numérico positivo
- [ ] Máximo 2 casas decimais
- [ ] Formato com ponto (.) como separador decimal

### 4.2 Relatório de Validação

Após validação automática, o sistema gerará relatório:

```
┌──────────────────────────────────────────────────────────────┐
│ RELATÓRIO DE VALIDAÇÃO DE DADOS                              │
├──────────────────────────────────────────────────────────────┤
│ Data: 31/07/2026 10:45                                       │
│                                                              │
│ RESUMO:                                                      │
│ ✓ Registros válidos: 1.187                                   │
│ ✗ Registros com erro: 48                                     │
│ ⚠ Registros com aviso: 23                                    │
│                                                              │
│ ERROS ENCONTRADOS:                                           │
│ Linha 23: CPF inválido (João Silva)                         │
│ Linha 45: Data de nascimento futura (Maria Santos)          │
│ Linha 67: CPF duplicado (Pedro Oliveira)                    │
│ ...                                                          │
│                                                              │
│ AVISOS:                                                      │
│ Linha 12: Email ausente (Carlos Costa)                      │
│ Linha 89: Endereço incompleto (Ana Paula)                   │
│ ...                                                          │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Correção de Erros

**Processo**:
1. Receber relatório de validação
2. Corrigir erros na planilha original
3. Enviar planilha corrigida
4. Aguardar nova validação
5. Repetir até 0 erros críticos

---

## 5. PROCESSO DE MIGRAÇÃO

### 5.1 Fases da Migração

#### Fase 1: Preparação (Dia -7)
- [ ] Recebimento das planilhas
- [ ] Validação automática
- [ ] Envio do relatório de validação
- [ ] Aguardar correções

#### Fase 2: Validação (Dia -3)
- [ ] Recebimento das planilhas corrigidas
- [ ] Nova validação
- [ ] Aprovação final dos dados
- [ ] Agendamento da migração

#### Fase 3: Migração em Ambiente de Testes (Dia -1)
- [ ] Importação dos dados no ambiente de testes
- [ ] Validação de integridade referencial
- [ ] Geração de relatórios de conferência
- [ ] Cliente valida dados no sistema

#### Fase 4: Homologação (Dia 0 - Manhã)
- [ ] Cliente aprova dados em testes
- [ ] Backup de segurança
- [ ] Preparação do ambiente de produção

#### Fase 5: Migração em Produção (Dia 0 - Tarde)
- [ ] Importação definitiva
- [ ] Validação pós-migração
- [ ] Testes funcionais
- [ ] Liberação do sistema

### 5.2 Cronograma Típico

```
Semana 1:
Segunda  : Recebimento de planilhas, validação inicial
Terça    : Correções pela igreja
Quarta   : Revalidação e ajustes finais
Quinta   : Preparação de scripts de migração
Sexta    : Migração em ambiente de testes

Semana 2:
Segunda  : Homologação pelo cliente
Terça    : Ajustes finos
Quarta   : Migração para produção
Quinta   : Validação final
Sexta    : Entrada em operação
```

---

## 6. VALIDAÇÃO PÓS-MIGRAÇÃO

### 6.1 Checklist de Validação

#### 6.1.1 Dados de Membros
- [ ] Total de membros conferido
- [ ] Membros ativos corretos
- [ ] CPFs sem duplicação
- [ ] Telefones corretos
- [ ] Ministérios atribuídos corretamente

#### 6.1.2 Dados Financeiros
- [ ] Total de dízimos conferido
- [ ] Somatório de valores correto
- [ ] Dizimistas vinculados corretamente
- [ ] Histórico de ofertas completo
- [ ] Categorias de despesas corretas

#### 6.1.3 Relatórios de Conferência

**Total de Membros**:
```
Sistema Antigo:  1.234 membros
Sistema Novo:    1.234 membros  ✓
```

**Total Financeiro 2026**:
```
Sistema Antigo:
  Dízimos:   R$ 125.450,00
  Ofertas:   R$ 18.700,00
  Despesas:  R$ 98.320,00

Sistema Novo:
  Dízimos:   R$ 125.450,00  ✓
  Ofertas:   R$ 18.700,00   ✓
  Despesas:  R$ 98.320,00   ✓
```

### 6.2 Teste de Amostragem

Validar manualmente uma amostra de 10 registros aleatórios:

| CPF | Nome | Conferido |
|-----|------|-----------|
| 123.456.789-00 | João Silva | [ ] |
| ... | ... | [ ] |

---

## 7. TRATAMENTO DE CASOS ESPECIAIS

### 7.1 Membros sem CPF

**Situação**: Membros antigos sem CPF cadastrado

**Solução**:
1. Solicitar CPF antes da migração
2. Se impossível obter, gerar ID temporário
3. Membro não poderá acessar portal até fornecer CPF
4. Incluir no relatório de pendências

### 7.2 Dados Financeiros Incompletos

**Situação**: Histórico financeiro parcial ou ausente

**Solução**:
1. Migrar o que estiver disponível
2. Documentar períodos sem dados
3. Iniciar histórico a partir da migração
4. Manter backup do sistema antigo para consulta

### 7.3 Duplicações de Nomes

**Situação**: Pessoas com nomes idênticos

**Solução**:
1. CPF diferenciará automaticamente
2. Adicionar observação para identificação
3. Incluir apelido ou nome social se necessário

### 7.4 Fotos dos Membros

**Situação**: Fotos em sistema antigo ou arquivos físicos

**Solução**:
1. **Se digital**: Solicitar pasta com fotos nomeadas por CPF
   - Formato: `12345678900.jpg`
   - Tamanho máximo: 2MB por foto
2. **Se físico**: Digitalizar antes da migração
3. Importação de fotos pode ser posterior à migração principal

---

## 8. BACKUP E SEGURANÇA

### 8.1 Backup Pré-Migração

Antes de qualquer migração:
- [ ] Backup completo do sistema antigo
- [ ] Exportação de todas as planilhas
- [ ] Cópias em 2 locais diferentes
- [ ] Validação de integridade dos backups

### 8.2 Plano de Rollback

Em caso de problemas críticos:

**Critérios para Rollback**:
- Perda de dados superior a 1%
- Inconsistências críticas não resolvíveis
- Indisponibilidade do sistema > 4 horas

**Procedimento**:
1. Suspender operações no sistema novo
2. Restaurar sistema antigo
3. Identificar causa raiz
4. Corrigir problemas
5. Reagendar migração

---

## 9. COMUNICAÇÃO DURANTE A MIGRAÇÃO

### 9.1 Antes da Migração (Semana Anterior)

**Comunicado aos Usuários**:
```
Assunto: Novo Sistema de Gestão - Migração Agendada

Prezados(as),

Informamos que no dia __/__/__ realizaremos a migração para o 
novo Sistema de Gestão da igreja.

Durante o período de migração (____h às ____h), o sistema antigo 
estará indisponível.

Solicitamos que não realizem lançamentos no sistema durante este período.

Qualquer dúvida, entrar em contato com [Responsável].

Att,
Equipe de Implantação
```

### 9.2 Durante a Migração

**Status Updates a cada hora**:
- 09:00 - Iniciando migração
- 10:00 - 25% concluído - Dados de membros importados
- 11:00 - 50% concluído - Dados financeiros importados
- 12:00 - 75% concluído - Validações em andamento
- 13:00 - 100% concluído - Sistema disponível

### 9.3 Após a Migração

**Comunicado de Conclusão**:
```
Assunto: Sistema de Gestão - Migração Concluída com Sucesso

Prezados(as),

A migração para o novo sistema foi concluída com sucesso!

Total migrado:
- 1.234 membros
- 5.678 lançamentos financeiros
- 12 ministérios

O sistema está disponível em: [URL]

Credenciais de acesso foram enviadas por email separado.

Treinamento agendado para: __/__/__ às ____h

Att,
Equipe de Implantação
```

---

## 10. TROUBLESHOOTING

### 10.1 Problemas Comuns e Soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| CPF duplicado | Cadastro em duplicidade | Consolidar cadastros, manter CPF único |
| Data inválida | Formato incorreto | Corrigir para DD/MM/AAAA |
| Valor não importa | Formato incorreto | Usar ponto como separador decimal |
| Membro não aparece | Não marcado como ativo | Verificar campo Status |
| Totais divergentes | Registros com erro | Corrigir erros e reimportar |

---

## 11. CHECKLIST FINAL DE MIGRAÇÃO

### 11.1 Antes de Liberar o Sistema

- [ ] Todos os dados foram importados
- [ ] Validação de totais está correta
- [ ] Amostragem manual foi aprovada
- [ ] Relatórios de conferência foram gerados
- [ ] Cliente validou e aprovou os dados
- [ ] Backup de segurança foi realizado
- [ ] Usuários foram cadastrados e testados
- [ ] Treinamento foi agendado
- [ ] Documentação foi entregue
- [ ] Sistema antigo foi desativado (ou mantido em paralelo conforme acordado)

### 11.2 Termo de Aceite

**Termo de Homologação da Migração de Dados**

Declaro que os dados migrados para o Sistema de Gestão Eclesiástica foram validados e estão em conformidade com os registros anteriores da instituição.

Dados migrados:
- Membros: ______
- Dízimos: ______
- Ofertas: ______
- Despesas: ______
- Ministérios: ______

Autorizo a entrada em produção do sistema.

Nome: ________________________________  
Cargo: ________________________________  
Data: ___/___/______  
Assinatura: ____________________________

---

**Documento preparado em**: 31/07/2026  
**Versão**: 1.0  
**Classificação**: Guia Técnico de Implantação  
**Próxima Revisão**: Conforme necessidade
