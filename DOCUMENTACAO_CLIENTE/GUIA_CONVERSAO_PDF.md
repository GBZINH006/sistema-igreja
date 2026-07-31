# GUIA DE CONVERSÃO PARA PDF
## Sistema de Gestão Eclesiástica AD Bela Vista

---

## 📄 OBJETIVO

Este guia fornece instruções passo a passo para converter os documentos Markdown (.md) em PDFs profissionais para apresentação ao cliente.

---

## 🛠️ MÉTODO 1: Visual Studio Code + Extensão (RECOMENDADO)

### Passo 1: Instalar Extensão
1. Abra o Visual Studio Code
2. Vá em Extensions (Ctrl+Shift+X)
3. Busque por "Markdown PDF"
4. Instale a extensão do **yzane** (mais popular)

### Passo 2: Configurar Estilos (Opcional)
Crie arquivo `markdown-pdf.css` na raiz com:

```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
    padding-bottom: 10px;
}

h2 {
    color: #34495e;
    border-bottom: 2px solid #95a5a6;
    padding-bottom: 5px;
    margin-top: 30px;
}

h3 {
    color: #555;
}

code {
    background-color: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
}

pre {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    overflow-x: auto;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
}

th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
}

th {
    background-color: #3498db;
    color: white;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

blockquote {
    border-left: 4px solid #3498db;
    padding-left: 20px;
    margin-left: 0;
    color: #555;
    font-style: italic;
}
```

### Passo 3: Converter
1. Abra o arquivo `.md` que deseja converter
2. Pressione `Ctrl+Shift+P` (Command Palette)
3. Digite "Markdown PDF: Export (pdf)"
4. Aguarde a conversão
5. PDF será salvo na mesma pasta do arquivo

### Passo 4: Conversão em Lote
Para converter todos os arquivos:

```powershell
# Execute no terminal do VS Code na pasta DOCUMENTACAO_CLIENTE
Get-ChildItem -Recurse -Filter *.md | ForEach-Object {
    Write-Host "Convertendo: $($_.FullName)"
    # Usar extensão Markdown PDF
}
```

---

## 🛠️ MÉTODO 2: Pandoc (Para Profissionais)

### Instalação
1. Baixe o Pandoc: https://pandoc.org/installing.html
2. Instale o MiKTeX (para LaTeX): https://miktex.org/download
3. Adicione ao PATH do Windows

### Comando Básico
```powershell
pandoc ARQUIVO.md -o ARQUIVO.pdf --pdf-engine=xelatex
```

### Comando Avançado (Com Template)
```powershell
pandoc ARQUIVO.md -o ARQUIVO.pdf `
  --pdf-engine=xelatex `
  --variable mainfont="Arial" `
  --variable fontsize=11pt `
  --variable geometry:margin=2cm `
  --toc `
  --number-sections `
  --highlight-style=tango
```

### Converter Todos os Arquivos
```powershell
# Script PowerShell
Get-ChildItem -Path . -Recurse -Filter *.md | ForEach-Object {
    $outputPath = $_.FullName -replace '\.md$', '.pdf'
    pandoc $_.FullName -o $outputPath `
        --pdf-engine=xelatex `
        --variable mainfont="Arial" `
        --variable fontsize=11pt `
        --variable geometry:margin=2.5cm `
        --toc `
        --number-sections
    Write-Host "✓ Convertido: $($_.Name) → $([System.IO.Path]::GetFileName($outputPath))"
}
```

---

## 🛠️ MÉTODO 3: Typora (Mais Simples e Visual)

### Instalação
1. Baixe o Typora: https://typora.io/
2. Instale no Windows
3. É pago, mas tem trial gratuito

### Conversão
1. Abra o arquivo `.md` no Typora
2. Vá em `File` → `Export` → `PDF`
3. Configure margens e estilos (opcional)
4. Clique em `Export`

**Vantagem**: WYSIWYG (What You See Is What You Get)

---

## 🛠️ MÉTODO 4: Online (Sem Instalação)

### Opção A: Markdown to PDF (markdowntopdf.com)
1. Acesse: https://www.markdowntopdf.com/
2. Faça upload do arquivo `.md`
3. Clique em "Convert"
4. Baixe o PDF gerado

### Opção B: CloudConvert
1. Acesse: https://cloudconvert.com/md-to-pdf
2. Faça upload do arquivo `.md`
3. Clique em "Convert"
4. Baixe o PDF

**Limitação**: Não mantém formatação avançada e estilos customizados

---

## 📋 ORDEM RECOMENDADA DE CONVERSÃO

### Para Apresentação ao Cliente

**1. DOCUMENTOS EXECUTIVOS** (converter primeiro):
```
APRESENTACAO_EXECUTIVA.md          → APRESENTACAO_EXECUTIVA.pdf
README.md                          → INDICE_E_VISAO_GERAL.pdf
INDICE_GERAL.md                    → NAVEGACAO_COMPLETA.pdf
```

**2. CONTRATO** (converter depois de preencher valores):
```
02-CONTRATO/
  └─ CONTRATO_PRESTACAO_SERVICOS.md → CONTRATO_PRESTACAO_SERVICOS.pdf
```

**3. MANUAIS** (converter todos):
```
01-MANUAIS/
  ├─ MANUAL_01_PAGINA_INICIAL.md   → MANUAL_01_PAGINA_INICIAL.pdf
  ├─ MANUAL_02_ADMIN.md             → MANUAL_02_ADMIN.pdf
  └─ MANUAL_03_AREA_MEMBRO.md       → MANUAL_03_AREA_MEMBRO.pdf
```

**4. KIT DE IMPLANTAÇÃO**:
```
03-KIT_IMPLANTACAO/
  ├─ 01_CHECKLIST_PRE_IMPLANTACAO.md → 01_CHECKLIST_PRE_IMPLANTACAO.pdf
  ├─ 02_GUIA_MIGRACAO_DADOS.md       → 02_GUIA_MIGRACAO_DADOS.pdf
  ├─ 03_PLANO_TREINAMENTO.md         → 03_PLANO_TREINAMENTO.pdf
  └─ 04_PROCEDIMENTOS_GO_LIVE.md     → 04_PROCEDIMENTOS_GO_LIVE.pdf
```

**5. DOCUMENTAÇÃO TÉCNICA**:
```
04-DOCUMENTACAO_TECNICA/
  └─ ARQUITETURA_SISTEMA.md          → ARQUITETURA_SISTEMA.pdf
```

---

## 🎨 PERSONALIZAÇÃO DO PDF

### Adicionar Cabeçalho e Rodapé

**Com Pandoc**:
Crie arquivo `header.tex`:
```latex
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhead[L]{Sistema de Gestão Eclesiástica}
\fancyhead[R]{AD Bela Vista}
\fancyfoot[C]{\thepage}
```

Use no comando:
```powershell
pandoc ARQUIVO.md -o ARQUIVO.pdf `
  --include-in-header=header.tex `
  --pdf-engine=xelatex
```

### Adicionar Logo na Primeira Página

Adicione no início do arquivo `.md`:
```markdown
![Logo da Igreja](caminho/para/logo.png)

# TÍTULO DO DOCUMENTO

---
```

---

## 📦 CRIAR PACOTE COMPLETO PARA O CLIENTE

### Opção 1: PDFs Individuais
```
DOCUMENTACAO_CLIENTE_PDFs/
├─ 00_APRESENTACAO_EXECUTIVA.pdf
├─ 01_INDICE_GERAL.pdf
├─ 02_CONTRATO_PRESTACAO_SERVICOS.pdf
├─ 03_MANUAL_ADMIN.pdf
├─ 04_MANUAL_AREA_MEMBRO.pdf
├─ 05_CHECKLIST_IMPLANTACAO.pdf
├─ 06_GUIA_MIGRACAO.pdf
├─ 07_PLANO_TREINAMENTO.pdf
└─ 08_PROCEDIMENTOS_GO_LIVE.pdf
```

### Opção 2: PDF Único Consolidado

**Com Pandoc**:
```powershell
pandoc `
  APRESENTACAO_EXECUTIVA.md `
  README.md `
  INDICE_GERAL.md `
  01-MANUAIS/MANUAL_02_ADMIN.md `
  01-MANUAIS/MANUAL_03_AREA_MEMBRO.md `
  -o DOCUMENTACAO_COMPLETA.pdf `
  --pdf-engine=xelatex `
  --toc `
  --toc-depth=3 `
  --number-sections
```

**Vantagem**: Documento único de 200+ páginas  
**Desvantagem**: Arquivo grande, navegação complexa

### Opção 3: Pasta Zipada
```powershell
# Criar PDFs primeiro, depois:
Compress-Archive -Path DOCUMENTACAO_CLIENTE_PDFs\* `
  -DestinationPath "Sistema_Gestao_Igreja_Docs_$(Get-Date -Format 'yyyyMMdd').zip"
```

---

## ✅ CHECKLIST DE CONVERSÃO

### Antes de Converter
- [ ] Revisar ortografia e gramática
- [ ] Preencher campos em branco (valores, datas, contatos)
- [ ] Validar links e referências
- [ ] Verificar formatação de tabelas
- [ ] Testar blocos de código
- [ ] Adicionar logo da igreja (se disponível)

### Durante a Conversão
- [ ] Testar conversão de 1 arquivo primeiro
- [ ] Validar qualidade do PDF gerado
- [ ] Ajustar estilos se necessário
- [ ] Converter todos os arquivos
- [ ] Verificar numeração de páginas

### Após a Conversão
- [ ] Abrir cada PDF e validar
- [ ] Verificar índice (se tiver)
- [ ] Testar links internos
- [ ] Validar imagens e diagramas
- [ ] Conferir quebras de página
- [ ] Criar pasta organizada com PDFs
- [ ] Gerar versão ZIP para envio

---

## 🐛 TROUBLESHOOTING

### Problema: Caracteres especiais não aparecem
**Solução**: Use UTF-8 encoding e especifique no Pandoc:
```powershell
pandoc arquivo.md -o arquivo.pdf --pdf-engine=xelatex --variable mainfont="Arial"
```

### Problema: Tabelas muito largas
**Solução**: Reduza font-size ou ajuste margens:
```powershell
pandoc arquivo.md -o arquivo.pdf --variable fontsize=10pt --variable geometry:margin=1.5cm
```

### Problema: Imagens não aparecem
**Solução**: Use caminhos absolutos ou relativos corretos. Copie imagens para mesma pasta do .md temporariamente.

### Problema: Quebras de página ruins
**Solução**: Adicione quebras manuais no Markdown:
```markdown
<div style="page-break-after: always;"></div>
```

### Problema: Pandoc muito lento
**Solução**: Converta arquivos menores separadamente e depois junte os PDFs.

---

## 🔗 FERRAMENTAS AUXILIARES

### Juntar PDFs
**PDFtk Free**: https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/
```bash
pdftk file1.pdf file2.pdf file3.pdf cat output merged.pdf
```

### Comprimir PDFs
**Smallpdf**: https://smallpdf.com/compress-pdf (online)
**Adobe Acrobat**: Ferramentas → Otimizar PDF

### Adicionar Senha aos PDFs
```powershell
# Com PDFtk
pdftk input.pdf output output-encrypted.pdf user_pw SENHA
```

---

## 📝 TEMPLATE DE NOME DE ARQUIVO

### Padrão Recomendado
```
[ORG]_[PROJETO]_[TIPO]_[NOME]_v[VERSAO]_[DATA].pdf

Exemplo:
ADBV_SistemaGestao_Manual_Administrador_v1.0_20260731.pdf
ADBV_SistemaGestao_Contrato_PrestaçãoServiços_v1.0_20260731.pdf
```

### Siglas
- **ADBV**: Assembleia de Deus Bela Vista
- **v1.0**: Versão 1.0
- **20260731**: Data no formato AAAAMMDD

---

## 🎯 RECOMENDAÇÃO FINAL

**Para esta documentação**, recomendamos:

1. **Use VS Code + Markdown PDF** (mais rápido e prático)
2. **Converta documentos principais individualmente**
3. **Organize em pasta estruturada**
4. **Crie versão ZIP para envio**
5. **Mantenha Markdowns** para futuras edições

**Tempo estimado**: 15-30 minutos para converter todos os documentos

---

## 📧 SCRIPT COMPLETO DE CONVERSÃO

```powershell
# SCRIPT DE CONVERSÃO AUTOMÁTICA
# Salve como: converter-todos-pdfs.ps1

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " CONVERSÃO DE DOCUMENTAÇÃO PARA PDF" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Cria pasta de destino
$destino = "DOCUMENTACAO_CLIENTE_PDFs"
if (!(Test-Path $destino)) {
    New-Item -ItemType Directory -Path $destino | Out-Null
}

# Arquivos principais na raiz
$principais = @(
    "APRESENTACAO_EXECUTIVA.md",
    "README.md",
    "INDICE_GERAL.md"
)

Write-Host "Convertendo arquivos principais..." -ForegroundColor Yellow
foreach ($arquivo in $principais) {
    if (Test-Path $arquivo) {
        $pdf = [System.IO.Path]::GetFileNameWithoutExtension($arquivo) + ".pdf"
        pandoc $arquivo -o "$destino\$pdf" --pdf-engine=xelatex
        Write-Host "  ✓ $arquivo → $pdf" -ForegroundColor Green
    }
}

# Converter subpastas
$pastas = @("01-MANUAIS", "02-CONTRATO", "03-KIT_IMPLANTACAO", "04-DOCUMENTACAO_TECNICA")

foreach ($pasta in $pastas) {
    if (Test-Path $pasta) {
        Write-Host "`nConvertendo $pasta..." -ForegroundColor Yellow
        Get-ChildItem -Path $pasta -Filter *.md | ForEach-Object {
            $pdf = [System.IO.Path]::GetFileNameWithoutExtension($_.Name) + ".pdf"
            pandoc $_.FullName -o "$destino\$pdf" --pdf-engine=xelatex
            Write-Host "  ✓ $($_.Name) → $pdf" -ForegroundColor Green
        }
    }
}

Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " CONVERSÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host " PDFs salvos em: $destino" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan

# Criar ZIP
$dataHoje = Get-Date -Format "yyyyMMdd"
$zipNome = "ADBV_SistemaGestao_Documentacao_$dataHoje.zip"
Compress-Archive -Path "$destino\*" -DestinationPath $zipNome -Force
Write-Host "`n✓ Arquivo ZIP criado: $zipNome" -ForegroundColor Green
```

**Para usar**: Salve o script e execute no PowerShell dentro da pasta `DOCUMENTACAO_CLIENTE`

---

**Documento preparado em**: 31/07/2026  
**Versão**: 1.0  
**Próxima Revisão**: Conforme necessidade
