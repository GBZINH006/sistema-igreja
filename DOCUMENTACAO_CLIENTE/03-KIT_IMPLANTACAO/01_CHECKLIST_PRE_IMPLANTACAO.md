# CHECKLIST DE PRÉ-IMPLANTAÇÃO
## Sistema de Gestão Eclesiástica AD Bela Vista

---

## 1. INFORMAÇÕES INSTITUCIONAIS

### 1.1 Dados da Igreja
- [ ] Razão Social completa
- [ ] CNPJ
- [ ] Endereço completo
- [ ] Telefones de contato
- [ ] Email institucional
- [ ] Site (se houver)
- [ ] Redes sociais (Facebook, Instagram, YouTube)

### 1.2 Dados Bancários
- [ ] Banco
- [ ] Agência
- [ ] Conta corrente
- [ ] Chave PIX
- [ ] Titularidade da conta

### 1.3 Responsáveis pelo Projeto
- [ ] Pastor(a) Presidente
- [ ] Diretor(a) Administrativo(a)
- [ ] Tesoureiro(a)
- [ ] Secretário(a)
- [ ] Coordenador(a) de TI (se houver)

---

## 2. INFRAESTRUTURA TECNOLÓGICA

### 2.1 Conectividade
- [ ] Internet banda larga mínima de 10 Mbps
- [ ] Link de internet redundante (recomendado)
- [ ] Wi-Fi disponível para acesso administrativo
- [ ] Qualidade de conexão validada

### 2.2 Equipamentos
- [ ] Computadores para administração (mínimo 2)
- [ ] Impressora para relatórios
- [ ] Scanner para digitalização de documentos (recomendado)
- [ ] Tablet ou smartphone para acesso mobile

### 2.3 Requisitos Mínimos dos Computadores
- [ ] Sistema Operacional: Windows 10 ou superior / macOS 10.13 ou superior / Linux
- [ ] Navegador: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- [ ] RAM: Mínimo 4 GB
- [ ] Processador: Dual-core 2.0 GHz ou superior
- [ ] Resolução de tela: Mínimo 1366x768

---

## 3. DADOS PARA MIGRAÇÃO

### 3.1 Cadastro de Membros
- [ ] Planilha com dados dos membros
- [ ] Formato: Excel (.xlsx) ou CSV
- [ ] Campos mínimos: Nome, CPF, Data Nascimento, Telefone, Status
- [ ] Fotos dos membros (opcional)

**Formato da Planilha de Membros**:
```
Nome Completo | CPF | RG | Data Nascimento | Sexo | Estado Civil | Telefone | Email | CEP | Endereço | Número | Complemento | Bairro | Cidade | UF | Status | Data Batismo | Data Conversão | Ministério | Observações
```

### 3.2 Ministérios
- [ ] Lista de ministérios ativos
- [ ] Coordenadores de cada ministério
- [ ] Descrição e objetivos
- [ ] Membros por ministério

### 3.3 Dados Financeiros
- [ ] Histórico de dízimos (últimos 12 meses mínimo)
- [ ] Histórico de ofertas
- [ ] Categorias de receitas
- [ ] Categorias de despesas
- [ ] Plano de contas atual

**Formato da Planilha Financeira**:
```
Data | Tipo (Receita/Despesa) | Categoria | Descrição | Valor | Forma Pagamento | Observações
```

### 3.4 Eventos
- [ ] Calendário de eventos fixos (cultos, reuniões)
- [ ] Eventos especiais recorrentes
- [ ] Histórico de eventos realizados (opcional)

---

## 4. ESTRUTURA ORGANIZACIONAL

### 4.1 Hierarquia Administrativa
- [ ] Organograma da igreja
- [ ] Departamentos existentes
- [ ] Cargos e funções
- [ ] Estrutura de liderança

### 4.2 Usuários do Sistema
Definir usuários que terão acesso administrativo:

| Nome | Cargo | Perfil de Acesso | Email | Telefone |
|------|-------|------------------|-------|----------|
| | | Super Admin / Admin / Secretário / Tesoureiro | | |
| | | | | |
| | | | | |

**Perfis Disponíveis**:
- **Super Administrador**: Acesso total
- **Administrador**: Acesso completo exceto configurações críticas
- **Secretário**: Membros, eventos, relatórios
- **Tesoureiro**: Financeiro e relatórios

---

## 5. CONFIGURAÇÕES ESPECÍFICAS

### 5.1 Parâmetros da Igreja
- [ ] Dia e horário dos cultos regulares
- [ ] Tipos de reuniões realizadas
- [ ] Frequência de reuniões
- [ ] Faixa etária para categorização (Crianças, Jovens, Adultos, Idosos)

### 5.2 Regras de Negócio
- [ ] Critérios para ser considerado membro/congregado/visitante
- [ ] Processo de batismo
- [ ] Processo de transferência
- [ ] Regras de frequência em ministérios
- [ ] Política de dízimos e ofertas

### 5.3 Comunicação
- [ ] Número de WhatsApp Business da igreja
- [ ] Token de API do WhatsApp (se já tiver)
- [ ] Templates de mensagens padrão
- [ ] Preferências de comunicação com membros

---

## 6. LOGOTIPOS E IDENTIDADE VISUAL

### 6.1 Materiais Necessários
- [ ] Logo da igreja em alta resolução (formato PNG com fundo transparente)
- [ ] Logo alternativa (se houver)
- [ ] Cores institucionais (código hexadecimal)
- [ ] Tipografia padrão (fonte utilizada)
- [ ] Manual de identidade visual (se houver)

**Especificações Técnicas dos Logos**:
- Formato: PNG com transparência
- Resolução mínima: 1000x1000 pixels
- Tamanho máximo: 2 MB
- Versões: Colorida, monocromática, negativo

---

## 7. INTEGRAÇÕES EXTERNAS

### 7.1 WhatsApp Business API
- [ ] Conta WhatsApp Business ativa
- [ ] Verificação da conta
- [ ] Token de API (será fornecido durante implantação)

### 7.2 Email Marketing (Opcional)
- [ ] Serviço de email (Gmail, Outlook, outro)
- [ ] Credenciais SMTP (se necessário)

### 7.3 Gateway de Pagamento (Opcional)
- [ ] Conta Mercado Pago / PagSeguro / outro
- [ ] Chaves de API

---

## 8. TREINAMENTO

### 8.1 Participantes do Treinamento
Definir até 5 pessoas que participarão do treinamento inicial:

| Nome | Cargo | Email | Telefone | Disponibilidade |
|------|-------|-------|----------|-----------------|
| | | | | |
| | | | | |
| | | | | |
| | | | | |
| | | | | |

### 8.2 Preferências de Treinamento
- [ ] Presencial
- [ ] Remoto (videoconferência)
- [ ] Híbrido

**Data preferencial**: ___/___/______  
**Horário preferencial**: ____:____ às ____:____

---

## 9. HOMOLOGAÇÃO

### 9.1 Critérios de Aceitação
Definir o que será validado antes da entrada em produção:

- [ ] Cadastro completo de membros migrado corretamente
- [ ] Acesso de todos os usuários administrativos funcionando
- [ ] Relatórios principais operacionais
- [ ] Envio de mensagens via WhatsApp testado
- [ ] Dashboard com indicadores corretos
- [ ] Portal do membro funcional
- [ ] Importação/exportação de dados funcionando
- [ ] Performance do sistema adequada

### 9.2 Responsáveis pela Homologação
| Nome | Cargo | Área de Validação |
|------|-------|-------------------|
| | | |
| | | |

---

## 10. PRAZOS E CRONOGRAMA

### 10.1 Datas Importantes
- [ ] Assinatura do contrato: ___/___/______
- [ ] Início da implantação: ___/___/______
- [ ] Entrega do sistema em testes: ___/___/______
- [ ] Treinamento: ___/___/______
- [ ] Homologação: ___/___/______
- [ ] Entrada em produção: ___/___/______

### 10.2 Marco de Validação
Cada fase deve ser aprovada formalmente antes de prosseguir para a próxima.

---

## 11. CONTINGÊNCIA E PLANO B

### 11.1 Período de Transição
- [ ] Sistema antigo permanecerá ativo por quanto tempo? ______ dias
- [ ] Uso paralelo dos sistemas durante transição? [ ] Sim [ ] Não
- [ ] Responsável pela validação de consistência de dados

### 11.2 Reversão
- [ ] Critérios para abortar implantação
- [ ] Plano de rollback
- [ ] Backup dos dados no sistema anterior

---

## 12. COMUNICAÇÃO DO PROJETO

### 12.1 Canais de Comunicação
**Durante a implantação**:
- Email: _________________________
- WhatsApp: ______________________
- Telefone: _______________________
- Horário de contato: ______________

### 12.2 Reuniões de Acompanhamento
- [ ] Reuniões semanais de status
- [ ] Dia da semana preferencial: _______________
- [ ] Horário preferencial: ___________________
- [ ] Formato: [ ] Presencial [ ] Remoto

---

## 13. DOCUMENTAÇÃO ENTREGUE

### 13.1 Documentos a Receber
- [ ] Manual do Administrador
- [ ] Manual do Usuário (Membro)
- [ ] Documentação Técnica
- [ ] Guia de Implantação
- [ ] Política de Backup
- [ ] Termos de Uso e Privacidade
- [ ] Contrato de Prestação de Serviços

---

## 14. SEGURANÇA E CONFORMIDADE

### 14.1 LGPD - Lei Geral de Proteção de Dados
- [ ] Termo de Consentimento preparado
- [ ] Política de Privacidade aprovada
- [ ] Encarregado de Dados (DPO) nomeado
- [ ] Fluxo de exclusão de dados definido

### 14.2 Controle de Acesso
- [ ] Política de senhas definida
- [ ] Procedimento de inclusão de novos usuários
- [ ] Procedimento de desligamento de usuários
- [ ] Revisão periódica de acessos

---

## 15. PÓS-IMPLANTAÇÃO

### 15.1 Suporte Contínuo
- [ ] Canal de suporte técnico definido
- [ ] SLA (Tempo de resposta) acordado
- [ ] Procedimento de abertura de chamados
- [ ] Escalation (escalada) de problemas críticos

### 15.2 Evolução do Sistema
- [ ] Processo de solicitação de melhorias
- [ ] Frequência de atualizações
- [ ] Janela de manutenção acordada

---

## 16. APROVAÇÕES FINAIS

### 16.1 Checklist Preenchido
- [ ] Todas as seções foram revisadas
- [ ] Todas as informações foram fornecidas
- [ ] Dúvidas foram esclarecidas
- [ ] Cronograma foi acordado

### 16.2 Assinaturas de Aprovação

**Responsável pela Igreja**:

Nome: ________________________________  
Cargo: ________________________________  
Data: ___/___/______  
Assinatura: ____________________________

**Responsável pela Implantação**:

Nome: ________________________________  
Cargo: ________________________________  
Data: ___/___/______  
Assinatura: ____________________________

---

## OBSERVAÇÕES ADICIONAIS

Use o espaço abaixo para anotações, requisitos especiais ou informações complementares:

```
_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________
```

---

**Documento preparado em**: 31/07/2026  
**Versão**: 1.0  
**Próxima revisão**: Durante reunião de kickoff do projeto  
**Status**: [ ] Em preenchimento [ ] Concluído [ ] Aprovado
