#!/bin/bash

# ============================================
# KARUK RESTAURANTE - Setup from Pen Drive
# ============================================

set -e

echo "🚀 Instalando KARUK RESTAURANTE do Pen Drive..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "Instale primeiro com: sudo apt install -y nodejs npm"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo ""

# Get current directory
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Diretório da app: $APP_DIR"

# Install dependencies
echo ""
echo "📚 Instalando dependências..."
cd "$APP_DIR"
npm install

# Build
echo ""
echo "🔨 Fazendo build..."
npm run build

# Create data directory
echo ""
echo "📁 Criando diretório de dados..."
mkdir -p "$APP_DIR/data"
chmod -R 755 "$APP_DIR/data"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo "📦 Instalando PM2 globalmente..."
    sudo npm install -g pm2
fi

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Para iniciar a aplicação, execute:"
echo ""
echo "  cd '$APP_DIR'"
echo "  pm2 start dist/index.js --name 'karuk-restaurante'"
echo ""
echo "Depois salve com:"
echo "  pm2 startup"
echo "  pm2 save"
echo ""
echo "Acessar em: http://localhost:5000"
echo ""
