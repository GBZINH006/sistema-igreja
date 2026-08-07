# Script simples para converter contrato
Write-Host "==================================" -ForegroundColor Cyan
Write-Host " CONVERSOR DE CONTRATO" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Abrir arquivo no Bloco de Notas
Write-Host "Abrindo contrato..." -ForegroundColor Green
notepad "CONTRATO_PRESTACAO_SERVICOS.md"

# Aguardar um pouco
Start-Sleep -Seconds 2

# Abrir Google Docs
Write-Host "Abrindo Google Docs..." -ForegroundColor Green
Start-Process "https://docs.google.com/document/create"

Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Copie TODO o texto do Bloco de Notas (Ctrl+A, Ctrl+C)" -ForegroundColor White
Write-Host "2. Cole no Google Docs (Ctrl+V)" -ForegroundColor White
Write-Host "3. Arquivo > Download > Microsoft Word (.docx)" -ForegroundColor White
Write-Host ""
Write-Host "Pronto! Voce tera um arquivo DOCX editavel!" -ForegroundColor Green
