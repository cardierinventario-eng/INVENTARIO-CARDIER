# 🎉 LancheFácil - Sistema de Inventário

![Status](https://img.shields.io/badge/status-ready-brightgreen)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![React](https://img.shields.io/badge/react-18-blue)
![Node](https://img.shields.io/badge/node-20-green)

## 📋 Sobre o Projeto

Sistema completo de gestão de inventário e estoque para lanchonete/restaurante.

**Transformado de:** Lanchonete → **Sistema de Inventário**

### ✨ Funcionalidades

- ✅ Gestão de itens com múltiplos atributos
- ✅ Entrada/saída de produtos com rastreamento
- ✅ Histórico de movimentações (com delete)
- ✅ Organização por grupos/setores
- ✅ Sincronização automática de quantidades
- ✅ Interface moderna e responsiva
- ✅ Filtros avançados
- ✅ Notificações toast

---

## 🚀 Deploy Rápido

### ⭐ Recomendado: RENDER.COM (5 minutos)

1. **Push para GitHub:**
```bash
cd "c:\Users\User\OneDrive\Desktop\LancheFacil"
git add .
git commit -m "Deploy LancheFacil"
git push origin main
```

2. **Acesse render.com:**
   - Login com GitHub
   - "New +" → "Web Service"
   - Repositório: seu-usuario/lanchefacil
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Deploy!

3. **Pronto!** Seu app está online 🎊

### Alternativas:
- Railway.app ($5/mês crédito)
- Heroku ($7/mês)

---

## 🏃 Executar Localmente

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev
# Acesse: http://localhost:5000

# Build
npm run build

# Produção
npm start
```

---

## 📁 Estrutura do Projeto

```
LancheFácil/
├── client/              # React Frontend
│   └── src/
│       ├── pages/      # Inventário, Estoque, Grupos, etc
│       ├── components/ # Componentes reutilizáveis
│       └── lib/        # Utilitários e schemas
│
├── server/             # Express Backend
│   └── index.ts        # Rotas da API
│
├── shared/             # Código compartilhado
│   └── schema.ts       # Tipos e schemas
│
└── dist/               # Build (gerado)
```

---

## 🛠️ Tecnologias

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- React Hook Form

### Backend
- Express.js
- Drizzle ORM
- SQLite
- TypeScript

---

## 📊 Páginas

| Página | Descrição |
|--------|-----------|
| **Inventário** | Visualização de todos os itens |
| **Estoque** | Entrada/Saída de produtos |
| **Grupos** | Gerenciar categorias/setores |
| **Movimentações** | Histórico com delete |
| **Fornecedores** | Dados dos fornecedores |
| **Configurações** | Ajustes do sistema |

---

## 🎨 Interface

- Design moderno com Tailwind CSS
- Componentes do shadcn/ui
- Responsivo (mobile + desktop)
- Ícones Lucide React
- Notificações toast
- Diálogos de confirmação

---

## ✅ Status

| Item | Status |
|------|--------|
| Frontend | ✅ |
| Backend | ✅ |
| Database | ✅ |
| Build | ✅ |
| Testes | ✅ |
| Deploy | ✅ Pronto |

---

## 🔧 Checklist Pré-Deploy

- [x] Erros TypeScript corrigidos
- [x] Build funcionando
- [x] Servidor rodando
- [x] Database funcionando
- [x] Todas as páginas funcionando
- [x] Delete de movimentações funcionando
- [x] Repositório GitHub atualizado

---

## 📝 Notas

- Database: SQLite local (`data/lanchefacil.db`)
- Port: 5000 (configurável)
- Environment: Auto-detectado (dev vs prod)

---

## 🎯 Próximos Passos

1. **Push para GitHub** (confirmado ✅)
2. **Conectar no Render.com** (5 minutos)
3. **Deploy automático** (automático a cada push)
4. **App online** 🎉

---

## 📞 Documentação

- [Guia Deploy Netlify](./GUIA_DEPLOY_NETLIFY.md)
- [Checklist Pré-Deploy](./PRE_DEPLOY_CHECKLIST.md)
- [Resumo Final](./FINAL_SUMMARY.md)

---

## 🎉 Status: PRONTO PARA PRODUÇÃO!

**Versão:** 1.0.0
**Status:** ✅ Pronto para Deploy
**Última atualização:** Dezembro 2025

Vamos fazer o deploy! 🚀
