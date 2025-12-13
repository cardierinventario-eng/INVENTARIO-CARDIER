# ⚡ DEPLOY MANUAL - GUIA RÁPIDO

## 🎯 Resumo

Seu projeto está pronto para deploy. Escolha uma opção:

### ✅ RECOMENDADO: Render.com

**Por quê?**
- Suporta SQLite (dados não são perdidos)
- Grátis
- Deployment automático via GitHub
- Muito fácil

**Como:**
1. Repositório no GitHub (git init + push)
2. Sign up em [render.com](https://render.com)
3. Conectar GitHub
4. Click em "Deploy"
5. Pronto! ✨

---

### ⭐ ALTERNATIVA: Netlify

**Por quê?**
- Muito popular
- Fácil de usar

**Problema:**
- ⚠️ Dados podem ser perdidos (SQLite não funciona bem)

**Como:**
1. Repositório no GitHub
2. Sign up em [netlify.com](https://netlify.com)
3. Conectar GitHub
4. Deploy
5. Funciona, mas dados podem sumir

---

## 📋 Checklist Pré-Deploy

- [x] Projeto buildado localmente (`npm run build`)
- [x] Git configurado
- [x] Netlify.json pronto
- [x] Package.json com engines configurados
- [x] Server suporta variável PORT

---

## 🚀 Arquivos de Referência

- `QUICK_DEPLOY.md` - Este arquivo
- `NETLIFY_DEPLOY.md` - Detalhes do Netlify
- `DEPLOY.md` - Informações gerais
- `Procfile` - Configurado para Heroku/Render
- `netlify.json` - Configurado para Netlify

---

## 🎬 Começar Agora

### Passo 1: GitHub (Obrigatório)

```bash
cd "C:\Users\User\OneDrive\Desktop\LancheFacil"

# Se Git não está instalado:
# Baixe em: https://git-scm.com/download/win
# Instale e reinicie o PowerShell

git init
git add .
git commit -m "Initial commit"
git branch -M main

# Crie repositório em github.com
# Depois:
git remote add origin https://github.com/SEU-USUARIO/lanchefacil.git
git push -u origin main
```

### Passo 2: Escolha Plataforma

**RENDER (Recomendado):**
1. [render.com](https://render.com) → Sign up → GitHub
2. "New +" → "Web Service"
3. Conectar repositório
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Deploy! ✨

**OU NETLIFY:**
1. [netlify.com](https://netlify.com) → Sign up → GitHub
2. "Add new site" → Import project
3. Conectar repositório
4. Build: `npm run build`
5. Publish: `dist/client`
6. Deploy! ✨

---

## 💡 Dúvidas?

- Render não funciona? Verifique logs no dashboard
- Netlify perdeu dados? Use Firebase (veja NETLIFY_DEPLOY.md)
- Build falha? Teste localmente: `npm run build && npm start`

---

**PRONTO PARA DEPLOY!** 🎉
