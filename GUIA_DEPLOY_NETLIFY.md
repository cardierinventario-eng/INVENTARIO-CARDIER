# 🚀 DEPLOY NETLIFY - GUIA PRÁTICO

## ✅ PRÉ-REQUISITOS
- Conta GitHub (com o repo criado)
- Conta Netlify (https://app.netlify.com)

---

## 📋 PASSO A PASSO - DEPLOY EM 5 MINUTOS

### PASSO 1: Preparar o GitHub

1. **Abra um terminal/PowerShell e navegue até a pasta do projeto:**
```bash
cd "c:\Users\User\OneDrive\Desktop\LancheFacil"
```

2. **Inicialize o Git (se ainda não fez):**
```bash
git init
git add .
git commit -m "LancheFacil - Sistema de Inventário"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/lanchefacil.git
git push -u origin main
```

3. **Atualize o seu repositório com cada mudança:**
```bash
git add .
git commit -m "Mensagem da mudança"
git push origin main
```

---

### PASSO 2: Deploy no Netlify

1. **Acesse https://app.netlify.com**

2. **Faça login com GitHub:**
   - Clique em "Sign up"
   - Escolha "Sign up with GitHub"
   - Autorize o Netlify a acessar seus repositórios

3. **Após fazer login, clique em "Add new site"**

4. **Selecione "Import an existing project"**

5. **Escolha GitHub:**
   - Clique em "GitHub"
   - Busque por "lanchefacil"
   - Selecione o repositório

6. **Configure o deploy:**
   - **Base directory:** deixar vazio (ou .)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/public`
   - Clique em "Deploy site"

7. **Aguarde o deploy completar (2-3 minutos)**

---

### PASSO 3: Configurar Redirects (IMPORTANTE!)

O Netlify precisa saber como rotear as APIs. Já criei um arquivo `netlify.toml` com as configurações:

**Arquivo: netlify.toml**
```toml
[build]
command = "npm run build"
publish = "dist/public"

[[redirects]]
from = "/api/*"
to = "/.netlify/functions/api/:splat"
status = 200

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

Este arquivo já está no seu projeto e será usado automaticamente.

---

## ⚠️ PROBLEMA: Backend no Netlify

**⚠️ IMPORTANTE:** O Netlify com plano gratuito **NÃO suporta servidores Express** de forma nativa.

### Solução 1: Usar Render.com (Recomendado) ⭐
- Deploy gratuito
- Suporta Express.js
- Muito mais fácil
- Link: https://render.com

**Passo a passo Render:**
1. Acesse render.com
2. Faça login com GitHub
3. Clique em "New +"
4. Selecione "Web Service"
5. Conecte o repositório
6. Build: `npm install && npm run build`
7. Start: `npm start`
8. Clique "Create"
9. Pronto!

### Solução 2: Migrar para Netlify Functions
Se quiser usar Netlify Functions, preciso:
1. Refatorar o backend para serverless
2. Criar funções em `netlify/functions/`

---

## 🎯 RECOMENDAÇÃO FINAL

### Para o seu projeto, recomendo **RENDER.COM**:

**Por quê?**
- ✅ Suporta Express.js nativamente
- ✅ Deploy automático no push
- ✅ Gratuito com tier free
- ✅ Sem necessidade de refatorar código
- ✅ Banco de dados pode ficar no servidor
- ✅ Muito mais simples que Netlify Functions

**Passo a passo (2 minutos):**
1. render.com
2. Login com GitHub
3. "New +" → "Web Service"
4. Conecte o repositório
5. Build: `npm install && npm run build`
6. Start: `npm start`
7. Pronto!

---

## 📊 Comparação

| Plataforma | Express | Fácil | Gratuito | Recomendo |
|-----------|---------|-------|----------|-----------|
| **Netlify** | ❌ (Functions) | ⭐ | ✅ | ⚠️ |
| **Render** | ✅ | ⭐⭐⭐ | ✅ | ✅✅✅ |
| **Railway** | ✅ | ⭐⭐ | ✅ | ✅✅ |
| **Heroku** | ✅ | ⭐ | ❌ | ❌ |

---

## 🚀 PRÓXIMOS PASSOS

### Se quiser usar Netlify + Banco de Dados:
Você precisaria:
1. Usar Netlify Functions (refatorar backend)
2. Usar um banco de dados remoto (Supabase, Firebase)
3. Muito mais complexo

### Se quiser usar Render (Recomendado):
1. Push para GitHub
2. Render.com
3. Conectar repositório
4. Pronto!

---

## 💡 Minha Recomendação

```
┌─────────────────────────────────────┐
│  USE RENDER.COM (5 MINUTOS)        │
│                                     │
│  ✅ Fácil                          │
│  ✅ Gratuito                       │
│  ✅ Seu código funciona do jeito    │
│  ✅ Express + SQLite funcionam      │
│                                     │
│  render.com → New Web Service      │
│  GitHub → Build → Deploy!          │
└─────────────────────────────────────┘
```

---

## ❓ Dúvidas?

Se tiver problemas:
1. Verifique os logs na plataforma (Render/Netlify)
2. Confirme que o repositório está atualizado no GitHub
3. Execute `npm run build` localmente para verificar erros

---

## ✨ Seu app está 100% pronto!

Só falta fazer o push e conectar a plataforma. Vamos lá! 🎉
