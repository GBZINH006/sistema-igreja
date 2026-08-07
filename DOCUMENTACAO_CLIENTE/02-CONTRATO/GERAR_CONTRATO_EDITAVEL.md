# 📄 COMO GERAR CONTRATO EDITÁVEL (DOCX/PDF)

## 🎯 OPÇÃO 1: Google Docs (RECOMENDADO - Fácil e Gratuito)

### Passo a Passo:

1. **Abra o arquivo** `CONTRATO_PRESTACAO_SERVICOS.md` no VS Code

2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)

3. **Abra Google Docs**: https://docs.google.com

4. **Crie novo documento** → "Documento em branco"

5. **Cole o conteúdo** (Ctrl+V)
   - O Google Docs converterá automaticamente o Markdown

6. **Formate o documento**:
   - Selecione títulos com `#` e aplique "Título 1"
   - Selecione títulos com `##` e aplique "Título 2"
   - Ajuste margens: Arquivo → Configurar página → Margens: 2.5cm

7. **Torne editável**:
   - Nos campos entre `[colchetes]`, deixe os colchetes para preenchimento
   - Ou crie campos de formulário: Inserir → Caixa de texto

8. **Baixe como**:
   - **Word**: Arquivo → Fazer download → Microsoft Word (.docx) ✅ EDITÁVEL
   - **PDF**: Arquivo → Fazer download → PDF (.pdf)

---

## 🎯 OPÇÃO 2: Microsoft Word (Se você tem Word instalado)

### Passo a Passo:

1. **Abra o Word**

2. **Arquivo** → **Abrir** → Selecione `CONTRATO_PRESTACAO_SERVICOS.md`
   - Word consegue abrir Markdown diretamente!

3. **Formate**:
   - Aplique estilos de títulos
   - Ajuste margens e fonte

4. **Crie campos de formulário** (para deixar editável):
   - Desenvolvedor → Controles de Conteúdo → Texto simples
   - Coloque nos campos: [Nome], [CPF], [Endereço], etc.

5. **Salve como**:
   - `.docx` para editar depois ✅
   - `.pdf` para compartilhar

---

## 🎯 OPÇÃO 3: Pandoc (Para quem é técnico)

### Instalar Pandoc:

**Windows**:
```powershell
winget install pandoc
# OU baixe em: https://pandoc.org/installing.html
```

### Converter para DOCX:

```powershell
# Navegue até a pasta do contrato
cd "DOCUMENTACAO_CLIENTE\02-CONTRATO"

# Converta para DOCX
pandoc CONTRATO_PRESTACAO_SERVICOS.md -o CONTRATO_EDITAVEL.docx `
  --reference-doc=template.docx `
  --toc `
  --toc-depth=2

# Converta para PDF (requer LaTeX)
pandoc CONTRATO_PRESTACAO_SERVICOS.md -o CONTRATO.pdf `
  --pdf-engine=xelatex `
  --variable mainfont="Arial" `
  --variable fontsize=11pt `
  --variable geometry:margin=2.5cm
```

---

## 🎯 OPÇÃO 4: LibreOffice (Gratuito e Open Source)

### Instalar LibreOffice:
- Baixe em: https://www.libreoffice.org/download/download/

### Converter:

1. **Abra LibreOffice Writer**

2. **Arquivo** → **Abrir** → Selecione `CONTRATO_PRESTACAO_SERVICOS.md`

3. **Formate o documento**

4. **Salve como**:
   - `.odt` (LibreOffice - editável)
   - `.docx` (Word - editável)
   - `.pdf` (PDF)

---

## 🎯 OPÇÃO 5: Online (Sem instalar nada)

### Usando CloudConvert:

1. Acesse: https://cloudconvert.com/md-to-docx

2. Faça upload do arquivo `CONTRATO_PRESTACAO_SERVICOS.md`

3. Clique em "Convert"

4. Baixe o `.docx` gerado

### Usando Dillinger:

1. Acesse: https://dillinger.io/

2. Cole o conteúdo do contrato

3. Clique em "Export as" → "Styled HTML" ou "PDF"

---

## 📋 CHECKLIST APÓS GERAR O DOCX/PDF

- [ ] Títulos estão formatados corretamente
- [ ] Tabelas estão alinhadas
- [ ] Campos `[entre colchetes]` estão destacados para preenchimento
- [ ] Margens adequadas (2.5cm)
- [ ] Fonte legível (Arial 11pt ou Times 12pt)
- [ ] Numeração de páginas (rodapé)
- [ ] Quebras de página em seções importantes
- [ ] Espaço para assinaturas no final

---

## 🎨 TEMPLATE DE FORMATAÇÃO RECOMENDADO

### Configurações de Página:
- **Margens**: 2.5cm todas
- **Papel**: A4
- **Orientação**: Retrato
- **Numeração**: Rodapé centralizado

### Fontes:
- **Títulos**: Arial 14pt (Negrito)
- **Subtítulos**: Arial 12pt (Negrito)
- **Corpo**: Arial 11pt ou Times New Roman 12pt
- **Tabelas**: Arial 10pt

### Espaçamentos:
- **Entrelinhas**: 1.15 ou 1.5
- **Antes do parágrafo**: 6pt
- **Depois do parágrafo**: 6pt

---

## 💡 DICA: CAMPOS EDITÁVEIS NO WORD

Para tornar o contrato realmente editável no Word:

1. **Ative a aba Desenvolvedor**:
   - Arquivo → Opções → Personalizar Faixa de Opções
   - Marque "Desenvolvedor"

2. **Insira Controles de Conteúdo**:
   - Desenvolvedor → Controles → Texto Simples
   - Coloque em cada campo `[Nome]`, `[CPF]`, etc.

3. **Configure cada controle**:
   - Clique no controle → Propriedades
   - Defina "Título" (ex: "Nome Completo")
   - Defina texto de dica

4. **Proteja o documento**:
   - Desenvolvedor → Proteger → Restringir Edição
   - Marque "Permitir apenas este tipo de edição no documento: Preenchendo formulários"
   - Ative a proteção

Resultado: Documento onde só os campos marcados podem ser editados!

---

## 🚀 SOLUÇÃO RÁPIDA (Agora mesmo!)

### Se você quer AGORA um arquivo editável:

**Execute este comando no PowerShell** (dentro da pasta do contrato):

```powershell
# Abre o arquivo no Word (se você tem)
Start-Process "CONTRATO_PRESTACAO_SERVICOS.md" -Wait

# OU abre no Bloco de Notas para copiar e colar no Google Docs
notepad "CONTRATO_PRESTACAO_SERVICOS.md"
```

Depois:
1. Copie TODO o texto
2. Cole no Google Docs
3. Baixe como `.docx`

Pronto! ✅

---

## 📞 SUPORTE

Se tiver dúvidas sobre conversão:
- Google Docs é a forma mais fácil!
- Não requer instalação
- Gera DOCX editável perfeitamente
- Pode salvar como PDF depois

---

**Tempo estimado**: 5-10 minutos usando Google Docs
