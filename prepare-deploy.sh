#!/bin/bash
# Script de Preparação para Deploy

echo "🚀 Preparando LancheFácil para Deploy..."
echo ""

# 1. Limpar cache
echo "🧹 Limpando cache..."
rm -rf node_modules/.vite
rm -rf dist

# 2. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 3. Build
echo "🏗️ Building projeto..."
npm run build

# 4. Checar tamanho
echo ""
echo "📊 Tamanho do build:"
du -sh dist/

# 5. Pronto
echo ""
echo "✅ Projeto pronto para deploy!"
echo ""
echo "Próximos passos:"
echo "1. git add ."
echo "2. git commit -m 'Versão final para deploy'"
echo "3. git push origin main"
echo "4. Acesse render.com e conecte o repositório"
