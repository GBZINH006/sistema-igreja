# Script simples: Abre o contrato no Notepad
# Depois voce copia e cola no Google Docs

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " METODO GOOGLE DOCS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$arquivo = Join-Path $scriptDir "CONTRATO_PRESTACAO_SERVICOS.md"

Write-Host "PASSO A PASSO:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Abrindo arquivo no Notepad..." -ForegroundColor White
Start-Process notepad $arquivo
Start-Sleep -Seconds 2

Write-Host "2. No Notepad: Selecione tudo (Ctrl+A)" -ForegroundColor White
Write-Host "3. Copie (Ctrl+C)" -ForegroundColor White
Write-Host ""
Write-Host "4. Abrindo Google Docs no navegador..." -ForegroundColor White
Start-Process "https://docs.google.com/document"
Write-Host ""
Write-Host "5. No Google Docs:" -ForegroundColor Yellow
Write-Host "   - Crie um documento novo (+ Blank)" -ForegroundColor White
Write-Host "   - Cole o conteudo (Ctrl+V)" -ForegroundColor White
Write-Host "   - O Google Docs formata automaticamente!" -ForegroundColor Green
Write-Host ""
Write-Host "6. Para salvar:" -ForegroundColor Yellow
Write-Host "   - Arquivo > Download > Microsoft Word (.docx)" -ForegroundColor White
Write-Host "   - Ou Arquivo > Download > PDF" -ForegroundColor White
Write-Host ""
Write-Host "Pronto! Contrato formatado em 2 minutos!" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione Enter para fechar..." -ForegroundColor Gray
$null = Read-Host
