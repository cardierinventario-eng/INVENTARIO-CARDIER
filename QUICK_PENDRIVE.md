# 🚀 QUICK START - Pen Drive para Debian

## Windows - Preparar Pen Drive

```powershell
# Abrir PowerShell em c:\Users\User\OneDrive\Desktop\LancheFacil
.\preparar-pendrive.ps1

# Seguir as instruções
# Responder com S quando pedir confirmação
# Pen drive será preenchido automaticamente
```

---

## Debian - Instalar do Pen Drive

```bash
# 1. Instalar Node.js (se não tiver)
sudo apt update
sudo apt install -y nodejs npm git

# 2. Montar pen drive
sudo mkdir -p /mnt/pendrive
sudo mount /dev/sdb1 /mnt/pendrive

# 3. Copiar
sudo cp -r /mnt/pendrive/karuk-restaurante /opt/karuk-restaurante
cd /opt/karuk-restaurante

# 4. Instalar PM2
sudo npm install -g pm2

# 5. Setup
chmod +x setup-from-pendrive.sh
./setup-from-pendrive.sh

# 6. Iniciar
pm2 start dist/index.js --name "karuk-restaurante" --env production
pm2 startup
pm2 save

# 7. Pronto!
pm2 status
```

---

## 📍 Acessar

- **Local:** http://localhost:5000
- **Rede:** http://IP_DO_SERVIDOR:5000

---

## 📊 Banco de Dados

- **Localização:** `/opt/karuk-restaurante/data/karuk-restaurante.db`
- **Tamanho inicial:** ~8KB
- **Crescimento:** Conforme adicionar produtos

---

## 🔧 Gerenciar

```bash
# Ver status
pm2 status

# Logs
pm2 logs karuk-restaurante

# Reiniciar
pm2 restart karuk-restaurante

# Parar
pm2 stop karuk-restaurante

# Deletar
pm2 delete karuk-restaurante
```

---

## ✅ Pronto! 🍽️

Seu restaurante KARUK está rodando offline no Debian!

