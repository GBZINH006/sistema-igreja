# Script para converter Markdown para DOCX editável
# Executar no PowerShell: .\CONVERTER_PARA_DOCX.ps1

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " CONVERSOR DE CONTRATO - MD → DOCX/PDF" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se pandoc está instalado
$pandocInstalled = Get-Command pandoc -ErrorAction SilentlyContinue

if (!$pandocInstalled) {
    Write-Host "❌ Pandoc não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "═══ USE GOOGLE DOCS (MAIS FÁCIL) ═══" -ForegroundColor Yellow
    Write-Host "1. Abrindo contrato para copiar..." -ForegroundColor White
    
    # Abrir o arquivo para copiar
    notepad "CONTRATO_PRESTACAO_SERVICOS.md"
    
    # Abrir Google Docs
    Start-Process "https://docs.google.com/document/create"
    
    Write-Host "2. Cole no Google Docs (Ctrl+V)" -ForegroundColor White
    Write-Host "3. Baixe como: Microsoft Word (.docx)" -ForegroundColor White
    
    exit
}

Write-Host "✅ Pandoc encontrado!" -ForegroundColor Green
Write-Host ""

# Arquivos
$inputFile = "CONTRATO_PRESTACAO_SERVICOS.md"
$outputDocx = "CONTRATO_EDITAVEL.docx"

# Converter para DOCX
Write-Host "📄 Convertendo para DOCX..." -ForegroundColor Cyan

try {
    pandoc $inputFile -o $outputDocx --toc --toc-depth=2
    
    Write-Host "✅ DOCX gerado: $outputDocx" -ForegroundColor Green
    
    # Abrir o arquivo
    if (Test-Path $outputDocx) {
        Write-Host "📂 Abrindo arquivo..." -ForegroundColor Cyan
        Start-Process $outputDocx
    }
}
catch {
    Write-Host "❌ Erro ao converter" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
