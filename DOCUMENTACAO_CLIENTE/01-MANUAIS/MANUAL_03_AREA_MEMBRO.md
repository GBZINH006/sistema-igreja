# MANUAL TÉCNICO - ÁREA DO MEMBRO
## Sistema de Gestão Eclesiástica AD Bela Vista

---

## 1. VISÃO GERAL

A Área do Membro é um portal dedicado onde membros da igreja podem acessar suas informações pessoais, histórico eclesiástico, contribuições financeiras e participar de atividades da igreja de forma digital.

### 1.1 Objetivos
- Proporcionar autonomia ao membro
- Transparência nas informações pessoais
- Facilitar comunicação com liderança
- Centralizar histórico eclesiástico
- Promover engajamento digital

---

## 2. ACESSO E AUTENTICAÇÃO

### 2.1 Primeiro Acesso

#### 2.1.1 Criação de Conta
```
[Página Login] → [Primeiro Acesso] → [CPF + Data Nascimento] → [Verificação] → [Criar Senha]
```

**Requisitos para Cadastro**:
- CPF cadastrado no sistema administrativo
- Data de nascimento correspondente
- Email válido (opcional, recomendado)
- Telefone (para recuperação)

**Criação de Senha**:
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial

#### 2.1.2 Processo de Verificação
1. Membro informa CPF e data de nascimento
2. Sistema valida dados contra cadastro administrativo
3. Membro recebe código via WhatsApp/SMS
4. Código válido por 10 minutos
5. Membro cria senha de acesso
6. Confirmação por email (se fornecido)

### 2.2 Login Regular

#### 2.2.1 Credenciais de Acesso
```
┌─────────────────────────────────────┐
│ Área do Membro - Login             │
├─────────────────────────────────────┤
│ CPF: [___.___.___-__]              │
│ Senha: [••••••••]                   │
│                                     │
│ [☐] Manter conectado                │
│                                     │
│ [Entrar]  [Esqueci minha senha]    │
└─────────────────────────────────────┘
```

**Recursos de Segurança**:
- Sessão de 7 dias (se "Manter conectado")
- Logout automático após 30 min de inatividade
- Bloqueio após 5 tentativas incorretas
- Notificação de novo acesso via WhatsApp

### 2.3 Recuperação de Senha

#### 2.3.1 Fluxo de Recuperação
```
[Esqueci Senha] → [CPF] → [Código WhatsApp] → [Nova Senha] → [Confirmação]
```

**Processo**:
1. Informar CPF cadastrado
2. Receber código de 6 dígitos no WhatsApp
3. Inserir código (válido por 15 minutos)
4. Criar nova senha
5. Confirmação e redirect para login

---

## 3. DASHBOARD DO MEMBRO

### 3.1 Visão Geral

#### 3.1.1 Cabeçalho Personalizado
```
┌────────────────────────────────────────────────────────┐
│ [Foto]  Olá, João Silva!                               │
│         Membro desde: 15/03/2020                       │
│         Ministério: Louvor                             │
│                                    [Notificações] [⚙️] │
└────────────────────────────────────────────────────────┘
```

#### 3.1.2 Cards Informativos
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Meu Perfil   │ Dízimos      │ Eventos      │ Comunicados  │
│              │              │              │              │
│ Completo     │ 12 meses     │ 3 próximos   │ 2 novos      │
│ 100%         │ em dia       │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 3.2 Menu de Navegação

```
├── Meu Perfil
│   ├── Dados Pessoais
│   ├── Histórico Eclesiástico
│   └── Certificados
├── Financeiro
│   ├── Meus Dízimos
│   ├── Minhas Ofertas
│   └── Recibos
├── Ministérios
│   ├── Meus Ministérios
│   ├── Escala de Atividades
│   └── Histórico de Participação
├── Eventos
│   ├── Próximos Eventos
│   ├── Minhas Inscrições
│   └── Histórico de Presença
├── Comunicação
│   ├── Avisos da Igreja
│   ├── Mensagens Recebidas
│   └── Contato com Liderança
└── Recursos
    ├── Estudos Bíblicos
    ├── Materiais
    └── Biblioteca Digital
```

---

## 4. MÓDULO: MEU PERFIL

### 4.1 Dados Pessoais

#### 4.1.1 Visualização e Edição
```
┌─────────────────────────────────────────────┐
│ DADOS PESSOAIS                              │
├─────────────────────────────────────────────┤
│ Nome Completo: João Silva Santos            │
│ CPF: 123.456.789-00 (não editável)         │
│ RG: 12.345.678-9                           │
│ Data Nascimento: 15/03/1985                │
│ Sexo: Masculino                            │
│ Estado Civil: Casado                       │
│                                             │
│ Telefone: (11) 98765-4321   [Editar]      │
│ Email: joao@email.com       [Editar]      │
│                                             │
│ [Atualizar Foto] [Salvar Alterações]      │
└─────────────────────────────────────────────┘
```

**Campos Editáveis pelo Membro**:
- Telefone celular
- Email
- Foto de perfil
- Endereço (requer aprovação administrativa)

**Campos Somente Leitura**:
- Nome completo
- CPF
- Data de nascimento
- Status eclesiástico
- Dados de batismo

#### 4.1.2 Endereço
```
Endereço Atual:
Rua das Flores, 123 - Apto 45
Bairro Jardim - São Paulo/SP
CEP: 01234-567

[Solicitar Atualização de Endereço]
```

**Processo de Atualização**:
1. Membro solicita alteração
2. Administração recebe notificação
3. Validação e aprovação
4. Membro recebe confirmação

### 4.2 Histórico Eclesiástico

#### 4.2.1 Timeline da Jornada
```
┌─────────────────────────────────────────────┐
│ MINHA JORNADA NA FÉ                         │
├─────────────────────────────────────────────┤
│ ● 15/03/2020 - Primeira Visita             │
│   └─ Visitante                             │
│                                             │
│ ● 22/03/2020 - Decisão por Cristo         │
│   └─ Congregado                            │
│                                             │
│ ● 10/05/2020 - Batismo nas Águas          │
│   └─ Local: Igreja Central                │
│   └─ Pastor: Rev. Pedro Santos            │
│                                             │
│ ● 05/07/2020 - Membro Efetivo             │
│   └─ Certificado Nº: 2020-456             │
│                                             │
│ ● 15/08/2021 - Ingresso no Ministério     │
│   └─ Ministério de Louvor                 │
│   └─ Função: Backing Vocal                │
└─────────────────────────────────────────────┘
```

### 4.3 Certificados e Documentos

#### 4.3.1 Documentos Disponíveis
- **Certificado de Batismo**: Download em PDF
- **Carta de Transferência**: Solicitar via sistema
- **Declaração de Membro**: Geração automática
- **Certificados de Cursos**: Quando aplicável

**Ações Disponíveis**:
```
[📄 Visualizar] [⬇️ Download] [📧 Enviar por Email] [🖨️ Imprimir]
```

---

## 5. MÓDULO: FINANCEIRO

### 5.1 Meus Dízimos

#### 5.1.1 Histórico de Contribuições
```
┌──────────┬────────────┬──────────────┬───────────┐
│ Mês/Ano  │ Valor      │ Data         │ Recibo    │
├──────────┼────────────┼──────────────┼───────────┤
│ Jul/2026 │ R$ 500,00  │ 05/07/2026   │ [Ver PDF] │
│ Jun/2026 │ R$ 500,00  │ 05/06/2026   │ [Ver PDF] │
│ Mai/2026 │ R$ 500,00  │ 05/05/2026   │ [Ver PDF] │
│ Abr/2026 │ R$ 480,00  │ 05/04/2026   │ [Ver PDF] │
└──────────┴────────────┴──────────────┴───────────┘

Total 2026: R$ 5.980,00
```

#### 5.1.2 Estatísticas Pessoais
```
┌─────────────────────────────────────────────┐
│ MINHA CONTRIBUIÇÃO                          │
├─────────────────────────────────────────────┤
│ • Total no Ano: R$ 5.980,00                │
│ • Média Mensal: R$ 498,33                  │
│ • Meses Consecutivos: 84 meses             │
│ • Dizimista desde: Mar/2020                │
│ • Status: ✓ Fiel                           │
└─────────────────────────────────────────────┘
```

### 5.2 Recibos e Comprovantes

#### 5.2.1 Geração de Recibos
```
[Gerar Recibo Anual] [Gerar por Período] [Solicitar 2ª Via]
```

**Formatos Disponíveis**:
- PDF (com logo da igreja)
- Email automático
- Impressão direta

**Informações no Recibo**:
- Dados da igreja (CNPJ, endereço)
- Dados do membro
- Período e valores
- Assinatura digital do tesoureiro
- Código de verificação

### 5.3 Ofertas Especiais

#### 5.3.1 Histórico de Ofertas
```
┌────────────┬──────────────────┬──────────┬─────────┐
│ Data       │ Finalidade       │ Valor    │ Recibo  │
├────────────┼──────────────────┼──────────┼─────────┤
│ 15/07/2026 │ Missões          │ R$ 100   │ [PDF]   │
│ 01/07/2026 │ Construção       │ R$ 200   │ [PDF]   │
│ 25/06/2026 │ Ação Social      │ R$ 50    │ [PDF]   │
└────────────┴──────────────────┴──────────┴─────────┘
```

---

## 6. MÓDULO: MINISTÉRIOS

### 6.1 Meus Ministérios

#### 6.1.1 Ministérios Ativos
```
┌─────────────────────────────────────────────┐
│ MINISTÉRIO DE LOUVOR                        │
├─────────────────────────────────────────────┤
│ Função: Backing Vocal                       │
│ Ingresso: 15/08/2021                        │
│ Líder: Carlos Oliveira                      │
│ Status: ✓ Ativo                             │
│                                             │
│ [Ver Escala] [Histórico] [Contatar Líder]  │
└─────────────────────────────────────────────┘
```

### 6.2 Escala de Atividades

#### 6.2.1 Calendário de Escalas
```
AGOSTO 2026

Dom 03 - Culto 19h ✓ Confirmado
Qua 06 - Ensaio 20h ✓ Confirmado
Dom 10 - Culto 19h ⚠️ Pendente Confirmação
Qua 13 - Ensaio 20h
Dom 17 - Culto 19h
```

**Ações**:
- **Confirmar Presença**: Até 24h antes
- **Solicitar Dispensa**: Mínimo 48h antes
- **Enviar Substituto**: Se aprovado pelo líder

#### 6.2.2 Notificações de Escala
- Lembrete 48h antes
- Lembrete 24h antes
- Lembrete 2h antes
- Alterações na escala

### 6.3 Histórico de Participação

#### 6.3.1 Estatísticas
```
┌─────────────────────────────────────────────┐
│ PARTICIPAÇÃO EM 2026                        │
├─────────────────────────────────────────────┤
│ • Escalas Cumpridas: 28/30                  │
│ • Taxa de Presença: 93%                     │
│ • Dispensas Justificadas: 2                 │
│ • Faltas: 0                                 │
│ • Status: ⭐ Exemplar                       │
└─────────────────────────────────────────────┘
```

---

## 7. MÓDULO: EVENTOS

### 7.1 Próximos Eventos

#### 7.1.1 Listagem de Eventos
```
┌─────────────────────────────────────────────┐
│ RETIRO ESPIRITUAL 2026                      │
├─────────────────────────────────────────────┤
│ Data: 15 a 17 de Agosto                     │
│ Local: Sítio Paz e Vida - Atibaia/SP       │
│ Inscrições: Até 10/08                       │
│ Valor: R$ 150,00                            │
│                                             │
│ [Ver Detalhes] [Fazer Inscrição]           │
└─────────────────────────────────────────────┘
```

### 7.2 Minhas Inscrições

#### 7.2.1 Eventos Inscritos
```
┌──────────────┬────────────┬──────────┬──────────┐
│ Evento       │ Data       │ Status   │ Ações    │
├──────────────┼────────────┼──────────┼──────────┤
│ Retiro 2026  │ 15-17/08   │ Pago ✓   │ [Ver]    │
│ EBF Infantil │ 20-24/07   │ Inscrito │ [Pagar]  │
└──────────────┴────────────┴──────────┴──────────┘
```

**Status Possíveis**:
- **Inscrito**: Aguardando pagamento
- **Pago**: Confirmado
- **Lista de Espera**: Vagas esgotadas
- **Cancelado**: Por solicitação ou falta de pagamento

### 7.3 Pagamento de Eventos

#### 7.3.1 Métodos de Pagamento
```
Evento: Retiro Espiritual 2026
Valor: R$ 150,00

Forma de Pagamento:
(○) PIX - Pagamento instantâneo
(○) Boleto - Vencimento em 3 dias
(○) Cartão de Crédito - Até 2x sem juros

[Prosseguir para Pagamento]
```

---

## 8. MÓDULO: COMUNICAÇÃO

### 8.1 Avisos da Igreja

#### 8.1.1 Central de Avisos
```
┌─────────────────────────────────────────────┐
│ 🔔 CULTO ESPECIAL - 31/07/2026             │
├─────────────────────────────────────────────┤
│ Amanhã teremos culto especial com o        │
│ Pr. João Souza às 19h. Venha participar!   │
│                                             │
│ Publicado: 30/07/2026 às 15:30             │
│ [Marcar como Lido]                          │
└─────────────────────────────────────────────┘
```

**Tipos de Avisos**:
- Urgente (vermelho)
- Importante (amarelo)
- Informativo (azul)
- Geral (cinza)

### 8.2 Mensagens Diretas

#### 8.2.1 Caixa de Entrada
```
┌───────────┬──────────────────┬────────────────┐
│ Data      │ De               │ Assunto        │
├───────────┼──────────────────┼────────────────┤
│ 30/07 10h │ Secretaria       │ Atualização... │
│ 28/07 15h │ Líder Louvor     │ Escala Agosto  │
│ 25/07 09h │ Pastor           │ Bem-vindo!     │
└───────────┴──────────────────┴────────────────┘
```

### 8.3 Contato com Liderança

#### 8.3.1 Formulário de Contato
```
Para: [Dropdown - Pastor/Líder/Secretaria]
Assunto: [_______________________]
Mensagem:
┌──────────────────────────────────┐
│                                  │
│                                  │
│                                  │
└──────────────────────────────────┘

[Enviar] [Limpar]
```

**Prazo de Resposta**: Até 48 horas úteis

---

## 9. MÓDULO: RECURSOS DIGITAIS

### 9.1 Estudos Bíblicos

#### 9.1.1 Biblioteca de Estudos
```
┌─────────────────────────────────────────────┐
│ ESTUDO: O SERMÃO DA MONTANHA                │
├─────────────────────────────────────────────┤
│ Autor: Pr. Paulo Silva                      │
│ Duração: 8 semanas                          │
│ Material: PDF + Vídeos                      │
│                                             │
│ [Baixar Material] [Assistir Vídeos]        │
└─────────────────────────────────────────────┘
```

### 9.2 Materiais para Download

#### 9.2.1 Categorias Disponíveis
- Estudos Bíblicos
- Livros e E-books
- Áudios de Pregações
- Apostilas de Cursos
- Hinários e Partituras

### 9.3 Biblioteca Digital

#### 9.3.1 Acervo Online
```
┌──────────────┬────────────┬────────────┐
│ Título       │ Categoria  │ Download   │
├──────────────┼────────────┼────────────┤
│ Teologia...  │ Livro      │ [PDF]      │
│ Sermões...   │ Áudio      │ [MP3]      │
│ Hinário...   │ Música     │ [PDF]      │
└──────────────┴────────────┴────────────┘
```

---

## 10. CONFIGURAÇÕES DA CONTA

### 10.1 Preferências Pessoais

#### 10.1.1 Notificações
```
☑️ Email
   ☑️ Avisos importantes
   ☑️ Escalas de ministério
   ☐ Eventos
   ☑️ Mensagens diretas

☑️ WhatsApp
   ☑️ Avisos urgentes
   ☑️ Lembretes de escala
   ☐ Newsletter

☐ SMS
   ☑️ Apenas urgências
```

### 10.2 Segurança

#### 10.2.1 Alterar Senha
```
Senha Atual: [••••••••]
Nova Senha: [••••••••]
Confirmar: [••••••••]

[Atualizar Senha]
```

#### 10.2.2 Sessões Ativas
```
┌──────────────┬─────────────┬──────────────┐
│ Dispositivo  │ Localização │ Última Ativ. │
├──────────────┼─────────────┼──────────────┤
│ iPhone 13    │ São Paulo   │ Agora        │
│ Chrome/Win   │ São Paulo   │ Ontem 20h    │
└──────────────┴─────────────┴──────────────┘

[Encerrar Outras Sessões]
```

### 10.3 Privacidade

#### 10.3.1 Controle de Dados
```
Visibilidade do Perfil:
(●) Apenas Liderança
(○) Todos os Membros
(○) Privado

Dados Compartilhados:
☑️ Telefone (apenas líderes)
☐ Email (todos)
☑️ Aniversário
```

---

## 11. APLICATIVO MÓVEL

### 11.1 Funcionalidades Mobile

#### 11.1.1 App Nativo (iOS/Android)
- Acesso offline a dados pessoais
- Notificações push
- Câmera para upload de documentos
- Geolocalização para eventos
- Compartilhamento rápido

#### 11.1.2 PWA (Progressive Web App)
- Instalação no dispositivo
- Funciona offline (cache)
- Atualizações automáticas
- Menor consumo de dados

---

## 12. TROUBLESHOOTING

### 12.1 Problemas Comuns

#### Não consigo fazer login
1. Verificar CPF digitado
2. Tentar recuperação de senha
3. Contatar secretaria se CPF não reconhecido

#### Meus dados estão incorretos
1. Verificar dados editáveis (telefone, email)
2. Solicitar atualização via sistema
3. Aguardar aprovação administrativa

#### Não recebo notificações
1. Verificar configurações de notificação
2. Confirmar número de WhatsApp correto
3. Verificar bloqueio no dispositivo

#### Recibo não abre
1. Verificar se tem leitor de PDF
2. Tentar outro navegador
3. Baixar arquivo antes de abrir

---

## 13. POLÍTICAS E TERMOS

### 13.1 Termo de Uso
Ao utilizar a Área do Membro, você concorda em:
- Manter suas credenciais seguras
- Não compartilhar sua senha
- Usar o sistema de forma ética
- Respeitar dados de outros membros

### 13.2 Privacidade de Dados (LGPD)
- Seus dados são protegidos
- Acesso restrito por perfil
- Possibilidade de exclusão
- Logs de acesso mantidos por segurança

---

## 14. SUPORTE

### 14.1 Central de Ajuda
- **Email**: membro@adbelavista.com.br
- **WhatsApp**: (XX) XXXXX-XXXX
- **Presencial**: Secretaria da Igreja
- **Horário**: Segunda a Sexta, 9h às 17h

### 14.2 FAQ - Perguntas Frequentes
Disponível em: [Menu] → [Ajuda] → [FAQ]

---

**Documento gerado em**: 31/07/2026  
**Classificação**: Documentação de Usuário  
**Versão do Sistema**: 1.0.0  
**Público-alvo**: Membros da Igreja
