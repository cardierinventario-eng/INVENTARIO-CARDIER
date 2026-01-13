# 🍽️ KARUK RESTAURANTE - Instalação via Pen Drive

## 📋 Passo a Passo

### No Windows (seu PC):

#### 1. Preparar o Projeto
```bash
# Abrir terminal no projeto
cd c:\Users\User\OneDrive\Desktop\LancheFacil

# Limpar arquivos temporários
rmdir /s /q node_modules
rmdir /s /q dist
del /q *.log
```

#### 2. Copiar para Pen Drive
```bash
# Copiar TUDO para pen drive (exceto node_modules e dist)
# Basta copiar toda a pasta c:\Users\User\OneDrive\Desktop\LancheFacil
# para a raiz do pen drive (Pode demorar uns minutos)
```

**OU via Git (mais rápido):**
```bash
# No pen drive, abrir terminal e fazer:
git clone https://github.com/cardierinventario-eng/INVENTARIO-CARDIER.git karuk-restaurante
cd karuk-restaurante
```

---

### No Debian (seu servidor):

#### 1. Prerequisitos
Se ainda não tem, instale Node.js:
```bash
sudo apt update
sudo apt install -y nodejs npm
sudo apt install -y git

# Instalar PM2 globalmente
sudo npm install -g pm2
```

#### 2. Plugar o Pen Drive e Montar
```bash
# Ver pen drives
lsblk

# Montar (exemplo: /dev/sdb1)
sudo mkdir -p /mnt/pendrive
sudo mount /dev/sdb1 /mnt/pendrive

# Entrar no diretório
cd /mnt/pendrive/karuk-restaurante
# ou se copiou:
cd /mnt/pendrive/LancheFacil
```

#### 3. Copiar para Servidor
```bash
# Copiar para diretório permanente
sudo cp -r . /opt/karuk-restaurante
sudo chown -R $USER:$USER /opt/karuk-restaurante
cd /opt/karuk-restaurante
```

#### 4. Executar Setup
```bash
chmod +x setup-from-pendrive.sh
./setup-from-pendrive.sh
```

#### 5. Iniciar Aplicação
```bash
# Iniciar
pm2 start dist/index.js --name "karuk-restaurante" --env production

# Ver se está rodando
pm2 status

# Salvar para iniciar automaticamente
pm2 startup
pm2 save
```

#### 6. Desmontar Pen Drive (opcional)
```bash
cd /opt/karuk-restaurante
sudo umount /mnt/pendrive
```

---

## ✅ Verificar se está funcionando

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs karuk-restaurante

# Acessar
# Browser: http://localhost:5000
# Ou IP: http://IP_DO_SERVIDOR:5000
```

---

## 📊 Dados Persistentes

O banco de dados fica em: `/opt/karuk-restaurante/data/karuk-restaurante.db`

Está seguro no servidor Debian, não depende mais do pen drive!

---

## ⚠️ Problemas?

### Erro: "Node.js not found"
```bash
sudo apt install -y nodejs npm
```

### Erro: "Permission denied"
```bash
chmod +x setup-from-pendrive.sh
```

### Erro: "Port already in use"
```bash
sudo lsof -i :5000
sudo kill -9 PID
```

### Ver logs de erro
```bash
pm2 logs karuk-restaurante --err
pm2 logs karuk-restaurante --lines 100
```

---

## 🎯 Tamanhos

- **Projeto sem node_modules:** ~50MB (cabe fácil em pen drive)
- **node_modules após npm install:** ~500MB
- **Build (dist):** ~5MB

> 💡 Por isso copia sem node_modules e dist - mais rápido e o script regenera no servidor!

