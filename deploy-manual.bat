@echo off
REM Script de Deploy Manual - LancheFácil
REM Execute este arquivo para preparar o deploy

cls
echo.
echo ==========================================
echo  DEPLOY MANUAL - LANCHE FACIL
echo ==========================================
echo.

REM 1. Verificar se Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git não está instalado!
    echo.
    echo 📥 Baixe em: https://git-scm.com/download/win
    echo Depois execute novamente este script.
    pause
    exit /b 1
)

echo ✅ Git encontrado!
echo.

REM 2. Verificar status do repositório
echo 📋 Status do Git:
git status
echo.

REM 3. Adicionar arquivos
echo 📦 Adicionando arquivos...
git add .
echo ✅ Arquivos adicionados

REM 4. Commit
echo 💾 Fazendo commit...
git commit -m "Lanche Facil - Sistema de Inventario Pronto para Deploy"
echo ✅ Commit realizado

REM 5. Informar próximos passos
echo.
echo ==========================================
echo  PRÓXIMOS PASSOS
echo ==========================================
echo.
echo 1️⃣  Execute:
echo    git push origin main
echo.
echo 2️⃣  Acesse:
echo    https://render.com
echo.
echo 3️⃣  Faça login com GitHub
echo.
echo 4️⃣  Clique em "New +" e selecione "Web Service"
echo.
echo 5️⃣  Conecte seu repositório:
echo    - Repository: seu-usuario/lanchefacil
echo    - Branch: main
echo    - Build Command: npm install && npm run build
echo    - Start Command: npm start
echo.
echo 6️⃣  Clique em "Create Web Service"
echo.
echo ==========================================
echo.
pause
