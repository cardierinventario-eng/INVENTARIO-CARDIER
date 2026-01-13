# ============================================
# KARUK RESTAURANTE - Preparar Pen Drive (Windows)
# ============================================

Write-Host "🍽️  KARUK RESTAURANTE - Preparador de Pen Drive" -ForegroundColor Cyan
Write-Host ""

# Pedir letra da unidade do pen drive
Write-Host "Digite a LETRA da unidade do Pen Drive (ex: E, F, G):" -ForegroundColor Yellow
$driveLetter = Read-Host

$pendrivePath = "$($driveLetter):"

# Verificar se pen drive existe
if (!(Test-Path $pendrivePath)) {
    Write-Host "❌ Pen drive não encontrado em $pendrivePath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pen drive detectado: $pendrivePath" -ForegroundColor Green
Write-Host ""

# Confirmar limpeza (opcional)
Write-Host "Tem certeza que quer copiar para o pen drive?" -ForegroundColor Yellow
Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Yellow
$confirm = Read-Host "(S/N)"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Cancelado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Limpando arquivos temporários..." -ForegroundColor Cyan

# Remover node_modules e dist
if (Test-Path "node_modules") {
    Write-Host "  Removendo node_modules..."
    Remove-Item -Recurse -Force "node_modules" 2>$null
}

if (Test-Path "dist") {
    Write-Host "  Removendo dist..."
    Remove-Item -Recurse -Force "dist" 2>$null
}

Write-Host ""
Write-Host "📁 Copiando para pen drive: $pendrivePath" -ForegroundColor Cyan
Write-Host "  `(Isso pode levar alguns minutos...`)" -ForegroundColor Gray

# Copiar projeto
$projectPath = Get-Location
$targetPath = "$pendrivePath\karuk-restaurante"

# Criar pasta no pen drive se não existir
if (!(Test-Path $targetPath)) {
    New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
}

# Copiar todos os arquivos
robocopy $projectPath $targetPath /E /XD node_modules dist .git .idea .local .vscode /XF *.log /COPY:DAT /R:3

Write-Host ""
Write-Host "✅ Cópia concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximas etapas no Debian:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Plugar pen drive no servidor Debian"
Write-Host ""
Write-Host "2. Montar:"
Write-Host "   sudo mkdir -p /mnt/pendrive"
Write-Host "   sudo mount /dev/sdb1 /mnt/pendrive"
Write-Host ""
Write-Host "3. Copiar:"
Write-Host "   sudo cp -r /mnt/pendrive/karuk-restaurante /opt/karuk-restaurante"
Write-Host "   cd /opt/karuk-restaurante"
Write-Host ""
Write-Host "4. Executar:"
Write-Host "   chmod +x setup-from-pendrive.sh"
Write-Host "   ./setup-from-pendrive.sh"
Write-Host ""
Write-Host "5. Iniciar:"
Write-Host "   pm2 start dist/index.js --name 'karuk-restaurante'"
Write-Host "   pm2 startup && pm2 save"
Write-Host ""
Write-Host "💾 Tamanho no pen drive: ~50MB (sem node_modules)"
Write-Host ""
Write-Host "🎯 Acessar em: http://seu-ip:5000"
Write-Host ""
Write-Host "✅ Tudo pronto! Escaneie seu restaurante! 🍽️" -ForegroundColor Green
