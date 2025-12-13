#!/bin/bash

# Script de Setup - LancheFácil em VPS Linux

echo "🚀 Iniciando setup do LancheFácil..."

# 1. Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt-get update
sudo apt-get upgrade -y

# 2. Instalar Docker
echo "🐳 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Instalar Docker Compose
echo "🐙 Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Adicionar usuário ao grupo docker
echo "👤 Configurando permissões..."
sudo usermod -aG docker $USER

# 5. Clonar repositório
echo "📥 Clonando repositório..."
cd /home
sudo git clone https://github.com/seu-usuario/lanchefacil.git
cd lanchefacil

# 6. Iniciar com Docker Compose
echo "🚀 Iniciando aplicação..."
sudo docker-compose up -d

echo "✅ Setup completo!"
echo "Seu app está rodando em: http://seu-ip:5000"
echo ""
echo "Comandos úteis:"
echo "  Ver logs: docker-compose logs -f"
echo "  Parar: docker-compose down"
echo "  Reiniciar: docker-compose restart"
