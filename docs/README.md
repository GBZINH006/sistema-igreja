# Sistema de Gestão Eclesiástica - AD Bela Vista
## Documentação Técnica e Comercial

---

## 📋 Índice de Documentação

### 1. Manuais do Sistema
- [Manual do Administrador](manuais/MANUAL_ADMINISTRADOR.md)
- [Manual do Secretário](manuais/MANUAL_SECRETARIO.md)
- [Manual do Membro](manuais/MANUAL_MEMBRO.md)
- [Manual Técnico](manuais/MANUAL_TECNICO.md)

### 2. Contratos e Termos
- [Contrato de Prestação de Serviços](contratos/CONTRATO_PRESTACAO_SERVICOS.pdf)
- [Contrato de Prestação de Serviços (Editável)](contratos/CONTRATO_PRESTACAO_SERVICOS.docx)
- [Termo de Confidencialidade](contratos/TERMO_CONFIDENCIALIDADE.pdf)
- [Política de Privacidade LGPD](contratos/POLITICA_PRIVACIDADE_LGPD.pdf)

### 3. Kit de Implantação
- [Guia de Implantação](implantacao/GUIA_IMPLANTACAO.md)
- [Checklist de Implantação](implantacao/CHECKLIST_IMPLANTACAO.md)
- [Plano de Treinamento](implantacao/PLANO_TREINAMENTO.md)
- [Cronograma de Implantação](implantacao/CRONOGRAMA_IMPLANTACAO.md)

### 4. Material de Apresentação
- [Apresentação Executiva](apresentacao/APRESENTACAO_EXECUTIVA.pdf)
- [Proposta Comercial](apresentacao/PROPOSTA_COMERCIAL.pdf)
- [Catálogo de Funcionalidades](apresentacao/CATALOGO_FUNCIONALIDADES.pdf)

---

## 🎯 Sobre o Sistema

**Sistema de Gestão Eclesiástica AD Bela Vista** é uma plataforma completa desenvolvida especificamente para atender às necessidades administrativas de igrejas evangélicas, com foco em gestão de membros, congregados, ministérios e relatórios gerenciais.

### Principais Características

- ✅ **Gestão Completa de Membros**: Cadastro, acompanhamento e histórico
- ✅ **Cadastro Temporário via Link**: Sistema de tokens com expiração automática
- ✅ **Dashboard Analítico**: Indicadores em tempo real
- ✅ **Conformidade LGPD**: Política completa de privacidade e proteção de dados
- ✅ **Multi-perfil**: Admin, Pastor, Secretário e Membro
- ✅ **Sistema de Relatórios**: Exportação em Excel e PDF
- ✅ **Notificações em Tempo Real**: Via Supabase Realtime
- ✅ **Área do Membro**: Portal self-service para membros

### Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Realtime)
- **Hospedagem**: Vercel (Deploy contínuo via GitHub)
- **Bibliotecas**: Chart.js, SheetJS (XLSX), jsPDF, Font Awesome

---

## 📞 Suporte e Contato

**Desenvolvedor**: Gabriel Dutra  
**E-mail**: suporte@sistema-igreja.com.br  
**Telefone**: (XX) XXXXX-XXXX

---

## 📄 Versão e Licenciamento

**Versão Atual**: 2.0.0  
**Data de Release**: Julho de 2026  
**Licença**: Proprietária - AD Bela Vista

---

## 📂 Estrutura de Pastas

```
docs/
├── README.md (este arquivo)
├── GUIA_APRESENTACAO_CLIENTE.md ⭐ LEIA PRIMEIRO!
│
├── manuais/
│   ├── MANUAL_ADMINISTRADOR.md (Pastores e Admins)
│   ├── MANUAL_SECRETARIO.md (Secretários)
│   ├── MANUAL_MEMBRO.md (Membros e Congregados)
│   └── MANUAL_TECNICO.md (Desenvolvedores)
│
├── contratos/
│   ├── CONTRATO_PRESTACAO_SERVICOS.md (Modelo editável)
│   ├── TERMO_CONFIDENCIALIDADE.md
│   └── POLITICA_PRIVACIDADE_LGPD.md
│
├── implantacao/
│   ├── GUIA_IMPLANTACAO.md (Passo a passo completo)
│   ├── CHECKLIST_IMPLANTACAO.md (Lista de verificação)
│   ├── PLANO_TREINAMENTO.md
│   └── CRONOGRAMA_IMPLANTACAO.md
│
├── apresentacao/
│   ├── PROPOSTA_COMERCIAL.md (Para apresentar ao cliente)
│   ├── APRESENTACAO_EXECUTIVA.pdf (Slides)
│   └── CATALOGO_FUNCIONALIDADES.pdf (Screenshots)
│
└── sql/
    ├── EXECUTAR_ESTE_SQL.sql (Criar tabelas)
    ├── INSTALAR_TOKENS_COMPLETO.sql (Sistema de links)
    ├── CRIAR_PERFIS_ADMIN.sql (Usuários administrativos)
    └── fix-rls-permissions.sql (Segurança RLS)
```

---

## 🚀 Como Usar Esta Documentação

### Para VENDER o Sistema

1. Leia **GUIA_APRESENTACAO_CLIENTE.md** ⭐
2. Imprima **PROPOSTA_COMERCIAL.md**
3. Prepare demonstração ao vivo
4. Leve **CONTRATO_PRESTACAO_SERVICOS.md** para assinatura

### Para IMPLANTAR o Sistema

1. Leia **GUIA_IMPLANTACAO.md**
2. Use **CHECKLIST_IMPLANTACAO.md** para não esquecer nada
3. Execute os SQLs da pasta `sql/` na ordem
4. Siga o cronograma sugerido

### Para TREINAR Usuários

1. Entregue **MANUAL_ADMINISTRADOR.md** (pastores)
2. Entregue **MANUAL_SECRETARIO.md** (secretários)
3. Publique **MANUAL_MEMBRO.md** no site ou como PDF

### Para SUPORTE Técnico

1. Consulte **MANUAL_TECNICO.md**
2. Verifique scripts SQL na pasta `sql/`
3. Revise logs do Supabase

---

## 📋 Documentos Pendentes de Criação

Estes documentos ainda precisam ser criados (PDFs profissionais):

- [ ] **APRESENTACAO_EXECUTIVA.pdf** (Slides no PowerPoint/Canva)
- [ ] **CATALOGO_FUNCIONALIDADES.pdf** (Screenshots com descrições)
- [ ] **TERMO_CONFIDENCIALIDADE.pdf** (Documento legal)
- [ ] **POLITICA_PRIVACIDADE_LGPD.pdf** (Já existe em HTML, converter para PDF)
- [ ] **MANUAL_TECNICO.md** (Documentação para desenvolvedores)
- [ ] **PLANO_TREINAMENTO.md** (Roteiro de treinamento detalhado)
- [ ] **CRONOGRAMA_IMPLANTACAO.md** (Gantt ou tabela detalhada)

**Ferramentas sugeridas**:
- Canva (apresentações e catálogos)
- Microsoft Word (contratos e termos)
- Google Docs → Exportar como PDF

---

## 🎯 Prioridades para Apresentação ao Cliente

### Documentos Essenciais (Imprimir)

1. ✅ **PROPOSTA_COMERCIAL.md** (já criado)
2. ✅ **CONTRATO_PRESTACAO_SERVICOS.md** (já criado)
3. ⏳ **CATALOGO_FUNCIONALIDADES.pdf** (criar com screenshots)
4. ⏳ **APRESENTACAO_EXECUTIVA.pdf** (criar slides)

### Demonstração ao Vivo (Preparar)

1. ✅ Sistema funcionando em produção
2. ✅ Dados de teste realistas (não usar "Teste 1, Teste 2")
3. ✅ Cenário de uso preparado (evento, cadastro via link)
4. ⏳ Vídeo de backup (caso internet falhe)

---

## 💼 Checklist Pré-Reunião com Cliente

- [ ] Notebook carregado e funcionando
- [ ] Internet 4G como backup
- [ ] Proposta comercial impressa (2 vias)
- [ ] Contrato impresso (2 vias)
- [ ] Canetas para assinatura
- [ ] Cartões de visita
- [ ] Calculadora (para simular parcelamentos)
- [ ] Leu o **GUIA_APRESENTACAO_CLIENTE.md**

---

## 📞 Suporte e Contato

**Desenvolvedor**: Gabriel Dutra  
**E-mail**: suporte@sistema-igreja.com.br  
**Telefone**: (XX) XXXXX-XXXX

---

*Este documento faz parte do Sistema de Gestão Eclesiástica AD Bela Vista. Todos os direitos reservados.*
