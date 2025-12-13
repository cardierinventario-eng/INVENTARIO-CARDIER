# Deploy LancheFácil no Netlify (Manual)

## 🚀 Passos para Deploy

### 1. Preparar o Projeto Localmente

```bash
# Fazer build do projeto
npm run build
```

Isso vai gerar a pasta `dist/` com:
- `dist/client/` - Frontend pronto para Netlify
- `dist/index.js` - Backend

### 2. Criar Repositório no GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/lanchefacil.git
git push -u origin main
```

### 3. Deploy no Netlify (Via Site)

1. Acesse **[netlify.com](https://netlify.com)**
2. Clique em **"Sign up"** (crie conta ou use GitHub)
3. Clique em **"Add new site"**
4. Escolha **"Import an existing project"**
5. Conecte seu repositório do GitHub
6. Configure assim:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/client`
   - **Base directory:** (deixe em branco)
7. Clique em **"Deploy site"**

### 4. Configurar Variáveis de Ambiente (se necessário)

No Netlify Dashboard:
- Vá em **Site settings** → **Build & deploy** → **Environment**
- Adicione variáveis se precisar

---

## ⚠️ IMPORTANTE: Limitações no Netlify

O Netlify tem limitações para este projeto porque:
- ❌ SQLite/better-sqlite3 não funciona bem em ambiente serverless
- ⚠️ Dados são perdidos a cada deploy

### Solução Recomendada:

Para usar o Netlify, você precisa migrar o banco de dados para um serviço externo. Opções:

#### Opção A: Firebase (Recomendado - Fácil)
1. Criar projeto em [firebase.google.com](https://firebase.google.com)
2. Criar banco de dados Firestore
3. Atualizar código para usar Firebase SDK

#### Opção B: MongoDB Atlas (Alternativa)
1. Criar cluster em [mongodb.com/cloud](https://mongodb.com/cloud)
2. Atualizar código para usar MongoDB driver

#### Opção C: Supabase (PostgreSQL)
1. Criar projeto em [supabase.com](https://supabase.com)
2. Usar credenciais para conectar

---

## ✅ Alternativa Melhor: Render.com

**Render** é gratuito e suporta SQLite nativamente:

1. Vá em [render.com](https://render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Deploy automático!

**Isso é muito mais fácil que migrar para Firebase**

---

## 📝 Resumo das Opções

| Plataforma | Suporte SQLite | Facilidade | Preço |
|-----------|---|---|---|
| **Netlify** | ❌ Não | ⭐⭐ Requer Firebase | Grátis |
| **Render** | ✅ Sim | ⭐⭐⭐⭐⭐ Fácil | Grátis |
| **Heroku** | ✅ Sim | ⭐⭐⭐⭐ Fácil | Pago ($7/mês) |

---

## 🎯 Recomendação Final

**Use Render.com** - é grátis, fácil e funciona perfeitamente com seu projeto!

Quer ajuda com Render?
