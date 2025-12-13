# 🚀 Deploy Manual - Passo a Passo

## Opção 1: RENDER.COM (Recomendado - Mais Fácil) ⭐⭐⭐⭐⭐

### Passos:

1. **Acesse [render.com](https://render.com)**
2. **Clique em "Sign Up"** (use GitHub para facilitar)
3. **Após login, clique em "New +"** no dashboard
4. **Selecione "Web Service"**
5. **Conecte seu repositório GitHub:**
   - Se não tem repositório, crie em github.com
   - Dê permissão ao Render acessar seu GitHub
6. **Configure o Deploy:**
   - **Name:** `lanchefacil` (ou outro nome)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Branch:** `main`
7. **Clique em "Create Web Service"**
8. **Aguarde o deploy completar** (3-5 minutos)
9. **Seu app estará em:** `https://seu-app-name.onrender.com` 🎉

---

## Opção 2: NETLIFY (Alternativa)

### ⚠️ Aviso Importante:
Netlify é serverless e **não suporta SQLite bem**. Seus dados **PODEM SER PERDIDOS**.

### Passos:

1. **Acesse [netlify.com](https://netlify.com)**
2. **Clique em "Sign Up"** (use GitHub)
3. **Após login, clique em "Add new site"**
4. **Escolha "Import an existing project"**
5. **Selecione seu repositório GitHub**
6. **Configure assim:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/client`
   - **Base directory:** (deixe em branco)
7. **Clique em "Deploy"**
8. **Seu app estará em:** `https://seu-site.netlify.app` 🎉

### ⚠️ Para Dados Persistentes no Netlify:
Você precisaria usar Firebase, MongoDB Atlas ou Supabase. Peça ajuda se precisar fazer isso.

---

## Opção 3: GITHUB + RENDER (Melhor Prática)

Se quer controle total do código:

1. **Crie repositório no GitHub:**
   ```bash
   cd seu-projeto
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/lanchefacil.git
   git push -u origin main
   ```

2. **Depois siga os passos do Render acima**

---

## 📊 Comparativo Final

| Plataforma | Facilidade | SQLite | Grátis | Dados |
|-----------|-----------|--------|---------|--------|
| **Render** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ Persistente |
| **Netlify** | ⭐⭐⭐⭐ | ❌* | ✅ | ⚠️ Pode perder |
| **Heroku** | ⭐⭐⭐⭐ | ✅ | ❌ | ✅ Persistente |

*Requer migração para Firebase/MongoDB

---

## 🆘 Problemas Comuns

### Build falha?
- Verifique se `npm run build` funciona localmente
- Verifique `.gitignore` - não commite `node_modules` ou `dist`

### App não inicia?
- Verifique logs no dashboard do Render/Netlify
- Verifique se `npm start` funciona localmente

### Dados sumiram?
- Isso é normal em Netlify (use Firebase se precisar)
- Render mantém dados entre deploys

---

## ✅ Próximos Passos

1. Escolha **Render.com** (mais fácil)
2. Crie repositório no GitHub
3. Conecte no Render
4. Deploy! 🚀

Precisa de ajuda com qualquer passo?
