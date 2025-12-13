# ========================================
# SCRIPT DE DEPLOY - LancheFácil
# ========================================
# Execute: powershell -ExecutionPolicy Bypass -File .\deploy.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY - LANCHE FACIL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se Git está instalado
Write-Host "🔍 Verificando se Git está instalado..." -ForegroundColor Yellow
$gitCheck = git --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git não está instalado!" -ForegroundColor Red
    Write-Host "📥 Baixe em: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Pressione Enter para abrir o link"
    Start-Process "https://git-scm.com/download/win"
    exit
}
Write-Host "✅ Git encontrado: $gitCheck" -ForegroundColor Green
Write-Host ""

# 2. Verificar status do repositório
Write-Host "📋 Status do Git:" -ForegroundColor Yellow
git status
Write-Host ""

# 3. Adicionar arquivos
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Yellow
git add .
Write-Host "✅ Arquivos adicionados" -ForegroundColor Green
Write-Host ""

# 4. Commit
Write-Host "💾 Fazendo commit..." -ForegroundColor Yellow
$commitMsg = Read-Host "Digite a mensagem do commit (ou pressione Enter para padrão)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Lanche Facil - Sistema de Inventário"
}
git commit -m $commitMsg
Write-Host "✅ Commit realizado" -ForegroundColor Green
Write-Host ""

# 5. Push
Write-Host "🚀 Fazendo push para GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao fazer push!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}
Write-Host ""

# 6. Instruções finais
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Acesse: https://app.netlify.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣  Faça login com GitHub" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Clique em 'Add new site'" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Escolha 'Import an existing project'" -ForegroundColor Yellow
Write-Host ""
Write-Host "5️⃣  Selecione 'GitHub'" -ForegroundColor Yellow
Write-Host ""
Write-Host "6️⃣  Configure:" -ForegroundColor Yellow
Write-Host "    Build command: npm run build" -ForegroundColor White
Write-Host "    Publish directory: dist/public" -ForegroundColor White
Write-Host ""
Write-Host "7️⃣  Clique em 'Deploy site'" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏱️  Aguarde 2-3 minutos" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 Seu app estará online!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "Pressione Enter para sair"
