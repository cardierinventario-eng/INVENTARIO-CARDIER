# 🍽️ KARUK RESTAURANTE - Guia Instalação Debian

## Opção 1: Instalação Automática (Recomendado)

### No seu servidor Debian/Ubuntu:

```bash
# 1. Download do script
curl -O https://raw.githubusercontent.com/cardierinventario-eng/INVENTARIO-CARDIER/main/setup-debian.sh

# 2. Dar permissão de execução
chmod +x setup-debian.sh

# 3. Executar
./setup-debian.sh
```

---

## Opção 2: Instalação Manual

### Passo 1: Atualizar Sistema
```bash
sudo apt update
sudo apt upgrade -y
```

### Passo 2: Instalar Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Passo 3: Instalar Git
```bash
sudo apt install -y git
```

### Passo 4: Instalar PM2 (gerenciador de processos)
```bash
sudo npm install -g pm2
```

### Passo 5: Clonar e Setup
```bash
# Criar diretório
mkdir -p /opt/karuk-restaurante
cd /opt/karuk-restaurante

# Clonar repositório
git clone https://github.com/cardierinventario-eng/INVENTARIO-CARDIER.git .

# Instalar dependências
npm install

# Build
npm run build

# Criar diretório de dados
mkdir -p data
```

### Passo 6: Iniciar com PM2
```bash
# Iniciar
pm2 start dist/index.js --name "karuk-restaurante" --env production

# Salvar startup
pm2 startup
pm2 save
```

### Passo 7: (Opcional) Instalar Nginx

```bash
sudo apt install -y nginx

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/karuk-restaurante
```

**Colar este conteúdo:**
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Salvar e habilitar:**
```bash
sudo ln -sf /etc/nginx/sites-available/karuk-restaurante /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## 🔍 Verificar Status

```bash
# Ver se está rodando
pm2 status

# Ver logs
pm2 logs karuk-restaurante

# Ver logs em tempo real
pm2 logs karuk-restaurante --lines 50 --follow
```

---

## 🔄 Comandos Úteis

```bash
# Reiniciar
pm2 restart karuk-restaurante

# Parar
pm2 stop karuk-restaurante

# Iniciar novamente
pm2 start karuk-restaurante

# Deletar
pm2 delete karuk-restaurante
```

---

## 📍 Acessar Aplicação

- **Local do servidor:** `http://localhost:5000`
- **IP do servidor:** `http://SEU_IP:5000`
- **Via Nginx (porta 80):** `http://SEU_IP`

---

## 🔒 Firewall

```bash
# Permitir porta 5000
sudo ufw allow 5000/tcp

# Permitir HTTP (80) e HTTPS (443)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable
```

---

## 📊 Banco de Dados

O banco SQLite está em: `/opt/karuk-restaurante/data/karuk-restaurante.db`

Para fazer backup:
```bash
cp /opt/karuk-restaurante/data/karuk-restaurante.db ~/backup-$(date +%Y%m%d).db
```

---

## ⚠️ Problemas Comuns

### Porta 5000 já em uso
```bash
# Encontrar o processo
sudo lsof -i :5000

# Matar processo
sudo kill -9 PID
```

### Permissões
```bash
sudo chown -R $USER:$USER /opt/karuk-restaurante
chmod -R 755 /opt/karuk-restaurante/data
```

### Logs não aparecem
```bash
pm2 logs karuk-restaurante --err
```

---

## 🚀 Próximos Passos

1. **HTTPS/SSL** - Instalar Certbot para Let's Encrypt
2. **Domínio** - Apontar seu domínio para o IP do servidor
3. **Backups** - Criar script de backup automático
4. **Monitoramento** - Usar PM2 Plus ou similar

