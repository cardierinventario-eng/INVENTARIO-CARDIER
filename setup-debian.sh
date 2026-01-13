#!/bin/bash

# ============================================
# KARUK RESTAURANTE - Setup Debian/Ubuntu
# ============================================

set -e

echo "🚀 Instalando KARUK RESTAURANTE no Debian..."

# Update system
echo "📦 Atualizando sistema..."
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
echo "📦 Instalando Git..."
sudo apt install -y git

# Install PM2 (para gerenciar processo)
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# Create app directory
echo "📁 Criando diretório da aplicação..."
mkdir -p /opt/karuk-restaurante
cd /opt/karuk-restaurante

# Clone repository
echo "📥 Clonando repositório..."
git clone https://github.com/cardierinventario-eng/INVENTARIO-CARDIER.git .

# Install dependencies
echo "📚 Instalando dependências..."
npm install

# Build
echo "🔨 Fazendo build..."
npm run build

# Create data directory
mkdir -p /opt/karuk-restaurante/data
chmod -R 755 /opt/karuk-restaurante/data

# Start with PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 start dist/index.js --name "karuk-restaurante" --env production

# Save PM2 startup
pm2 startup
pm2 save

# Setup firewall (opcional)
echo "🔒 Configurando firewall..."
sudo ufw allow 5000/tcp 2>/dev/null || true
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true

# Optional: Install Nginx (reverse proxy)
read -p "Deseja instalar Nginx como reverse proxy? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "📦 Instalando Nginx..."
    sudo apt install -y nginx
    
    # Create Nginx config
    sudo tee /etc/nginx/sites-available/karuk-restaurante > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/karuk-restaurante /etc/nginx/sites-enabled/
    sudo systemctl restart nginx
    echo "✅ Nginx configurado!"
fi

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📍 Seu restaurante está rodando em:"
echo "   Local: http://localhost:5000"
echo "   Rede: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "📋 Comandos úteis:"
echo "   pm2 status              - Ver status"
echo "   pm2 logs                - Ver logs"
echo "   pm2 restart             - Reiniciar app"
echo "   pm2 stop                - Parar app"
echo ""
