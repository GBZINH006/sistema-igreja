# Script para abrir contrato em editores que suportam Markdown
# Tenta Word, depois alternativas gratuitas

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ABRINDO CONTRATO PARA EDICAO" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Caminho correto do arquivo (relativo ao script)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$arquivo = Join-Path $scriptDir "CONTRATO_PRESTACAO_SERVICOS.md"

if (!(Test-Path $arquivo)) {
    Write-Host "ERRO: Arquivo nao encontrado!" -ForegroundColor Red
    Write-Host "Caminho esperado: $arquivo" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "Arquivo encontrado: $arquivo" -ForegroundColor Green
Write-Host ""

# Tentar abrir no Word
Write-Host "Procurando Microsoft Word..." -ForegroundColor Yellow
$wordPaths = @(
    "C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE",
    "C:\Program Files (x86)\Microsoft Office\root\Office16\WINWORD.EXE",
    "C:\Program Files\Microsoft Office\Office16\WINWORD.EXE",
    "C:\Program Files (x86)\Microsoft Office\Office16\WINWORD.EXE",
    "C:\Program Files\Microsoft Office\Office15\WINWORD.EXE",
    "C:\Program Files (x86)\Microsoft Office\Office15\WINWORD.EXE"
)

$wordFound = $false
foreach ($path in $wordPaths) {
    if (Test-Path $path) {
        Write-Host "Word encontrado: $path" -ForegroundColor Green
        Write-Host ""
        Write-Host "INSTRUCOES:" -ForegroundColor Cyan
        Write-Host "1. Word vai abrir o arquivo .md" -ForegroundColor White
        Write-Host "2. Vai converter Markdown automaticamente" -ForegroundColor White
        Write-Host "3. Arquivo > Salvar Como > DOCX (editavel)" -ForegroundColor White
        Write-Host "4. Ou Arquivo > Salvar Como > PDF (final)" -ForegroundColor White
        Write-Host ""
        Start-Process $path -ArgumentList "`"$arquivo`""
        $wordFound = $true
        break
    }
}

if (!$wordFound) {
    Write-Host "Word nao encontrado. Tentando alternativas..." -ForegroundColor Yellow
    Write-Host ""
    
    # Tentar LibreOffice
    $libreofficePaths = @(
        "C:\Program Files\LibreOffice\program\swriter.exe",
        "C:\Program Files (x86)\LibreOffice\program\swriter.exe"
    )
    
    $libreofficeFound = $false
    foreach ($path in $libreofficePaths) {
        if (Test-Path $path) {
            Write-Host "LibreOffice encontrado!" -ForegroundColor Green
            Write-Host "Abrindo no LibreOffice Writer..." -ForegroundColor Green
            Start-Process $path -ArgumentList "`"$arquivo`""
            $libreofficeFound = $true
            break
        }
    }
    
    if (!$libreofficeFound) {
        Write-Host "Nenhum editor de documentos encontrado!" -ForegroundColor Red
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host " SOLUCOES ALTERNATIVAS" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "OPCAO 1 - GOOGLE DOCS (MAIS FACIL):" -ForegroundColor Cyan
        Write-Host "1. Abra o arquivo em um editor de texto (Notepad)" -ForegroundColor White
        Write-Host "2. Copie TODO o conteudo (Ctrl+A, Ctrl+C)" -ForegroundColor White
        Write-Host "3. Acesse: https://docs.google.com/document" -ForegroundColor White
        Write-Host "4. Crie um documento novo" -ForegroundColor White
        Write-Host "5. Cole o conteudo (Ctrl+V)" -ForegroundColor White
        Write-Host "6. Arquivo > Download > DOCX ou PDF" -ForegroundColor White
        Write-Host ""
        Write-Host "OPCAO 2 - INSTALAR LIBREOFFICE (GRATUITO):" -ForegroundColor Cyan
        Write-Host "1. Acesse: https://www.libreoffice.org/download" -ForegroundColor White
        Write-Host "2. Baixe e instale (100% gratuito)" -ForegroundColor White
        Write-Host "3. Execute este script novamente" -ForegroundColor White
        Write-Host ""
        Write-Host "OPCAO 3 - ABRIR NO NOTEPAD (MANUAL):" -ForegroundColor Cyan
        Write-Host "Abrindo no Notepad agora..." -ForegroundColor Green
        Write-Host ""
        Start-Process notepad $arquivo
        Write-Host "Arquivo aberto no Notepad!" -ForegroundColor Green
        Write-Host "Copie o conteudo e cole no Google Docs" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Pressione Enter para fechar..." -ForegroundColor Gray
$null = Read-Host
