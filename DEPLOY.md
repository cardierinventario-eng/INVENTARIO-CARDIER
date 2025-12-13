# Deploy do LancheFácil

## Opção 1: HEROKU (Recomendado) ✅

Heroku é ideal para este projeto porque suporta Node.js + SQLite.

### Pré-requisitos
1. Conta em [heroku.com](https://heroku.com)
2. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) instalado
3. Git instalado

### Passos

1. **Login no Heroku:**
```bash
heroku login
```

2. **Criar app:**
```bash
heroku create seu-app-name
```

3. **Fazer push:**
```bash
git push heroku main
```

4. **Abrir app:**
```bash
heroku open
```

5. **Ver logs:**
```bash
heroku logs --tail
```

---

## Opção 2: NETLIFY (Requer modificações)

Netlify é serverless e não suporta SQLite bem. Você precisaria:
- Usar um banco de dados externo (Firebase, Supabase, MongoDB Atlas)
- Modificar toda a camada de banco de dados
- Não recomendado para este projeto

---

## Opção 3: RENDER (Alternativa ao Heroku)

Similar ao Heroku, suporta Node.js com SQLite.

1. Vá em [render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Crie um "New Web Service"
4. Configure:
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Deploy

---

## Configuração Atual

✅ `Procfile` - Configurado para Heroku
✅ `package.json` - Scripts de build otimizados
✅ `.gitignore` - Arquivos ignorados
✅ `netlify.toml` - Configurado (se escolher Netlify no futuro)

---

## Próximos Passos

1. Crie repositório no GitHub
2. Push do código
3. Escolha Heroku ou Render
4. Deploy!

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

Quer ajuda com qualquer uma dessas opções?
