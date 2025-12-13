import express, { Request, Response } from "express";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "../shared/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar variáveis de ambiente
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || "file:./data/lanchefacil.db";

console.log("🚀 Starting server...");
console.log(`📝 Environment: ${NODE_ENV}`);
console.log(`🔗 Database URL: ${DATABASE_URL}`);

// Criar conexão com banco de dados
const dbPath = DATABASE_URL.replace("file:", "");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

// Inicializar banco de dados com as tabelas
function initializeDatabase() {
  try {
    // Criar tabelas usando SQL raw
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS grupos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        descricao TEXT,
        cor TEXT DEFAULT '#3B82F6',
        ativo INTEGER DEFAULT 1,
        data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS itens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        grupo_id INTEGER NOT NULL,
        quantidade REAL NOT NULL DEFAULT 0,
        unidade TEXT NOT NULL,
        valor_unitario REAL NOT NULL DEFAULT 0,
        estoque_minimo REAL,
        estoque_ideal REAL,
        localizacao TEXT,
        sku TEXT,
        observacoes TEXT,
        ativo INTEGER DEFAULT 1,
        data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS movimentacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        quantidade REAL NOT NULL,
        quantidade_anterior REAL,
        quantidade_nova REAL,
        motivo TEXT,
        observacoes TEXT,
        usuario TEXT,
        data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fornecedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        endereco TEXT,
        cnpj TEXT,
        observacoes TEXT,
        ativo INTEGER DEFAULT 1,
        data_criacao TEXT DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chave TEXT NOT NULL UNIQUE,
        valor TEXT
      );
    `);
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

initializeDatabase();

// Criar app Express
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (simples)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ============================================
// ROTAS DE GRUPOS/SETORES
// ============================================

// GET /api/grupos - Listar todos os grupos
app.get("/api/grupos", (req: Request, res: Response) => {
  try {
    const grupos = db.select().from(schema.grupos).all();
    res.json(grupos);
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    res.status(500).json({ error: "Erro ao buscar grupos" });
  }
});

// GET /api/grupos/:id - Buscar grupo por ID
app.get("/api/grupos/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grupo = db.select().from(schema.grupos).where(sql`id = ${id}`).get();
    if (!grupo) {
      return res.status(404).json({ error: "Grupo não encontrado" });
    }
    res.json(grupo);
  } catch (error) {
    console.error("Erro ao buscar grupo:", error);
    res.status(500).json({ error: "Erro ao buscar grupo" });
  }
});

// POST /api/grupos - Criar novo grupo
app.post("/api/grupos", (req: Request, res: Response) => {
  try {
    const { nome, descricao, cor } = req.body;
    const result = db.insert(schema.grupos).values({
      nome,
      descricao: descricao || null,
      cor: cor || "#3B82F6",
      ativo: 1,
    }).run();
    
    const novoGrupo = db.select().from(schema.grupos).where(sql`id = ${result.lastInsertRowid}`).get();
    res.status(201).json(novoGrupo);
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    res.status(500).json({ error: "Erro ao criar grupo" });
  }
});

// PUT /api/grupos/:id - Atualizar grupo
app.put("/api/grupos/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, cor, ativo } = req.body;
    
    db.update(schema.grupos)
      .set({
        nome,
        descricao: descricao || null,
        cor: cor || "#3B82F6",
        ativo: ativo !== undefined ? (ativo ? 1 : 0) : 1,
        dataAtualizacao: new Date().toISOString(),
      })
      .where(sql`id = ${id}`)
      .run();
    
    const grupoAtualizado = db.select().from(schema.grupos).where(sql`id = ${id}`).get();
    res.json(grupoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar grupo:", error);
    res.status(500).json({ error: "Erro ao atualizar grupo" });
  }
});

// DELETE /api/grupos/:id - Deletar grupo
app.delete("/api/grupos/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.delete(schema.grupos).where(sql`id = ${id}`).run();
    res.json({ message: "Grupo deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar grupo:", error);
    res.status(500).json({ error: "Erro ao deletar grupo" });
  }
});

// ============================================
// ROTAS DE ITENS DE INVENTÁRIO
// ============================================

// GET /api/itens - Listar todos os itens
app.get("/api/itens", (req: Request, res: Response) => {
  try {
    const itens = db.select().from(schema.itens).all();
    res.json(itens);
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    res.status(500).json({ error: "Erro ao buscar itens" });
  }
});

// GET /api/itens/grupo/:grupoId - Listar itens por grupo
app.get("/api/itens/grupo/:grupoId", (req: Request, res: Response) => {
  try {
    const { grupoId } = req.params;
    const itens = db.select().from(schema.itens).where(sql`grupo_id = ${grupoId}`).all();
    res.json(itens);
  } catch (error) {
    console.error("Erro ao buscar itens:", error);
    res.status(500).json({ error: "Erro ao buscar itens" });
  }
});

// GET /api/itens/:id - Buscar item por ID
app.get("/api/itens/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = db.select().from(schema.itens).where(sql`id = ${id}`).get();
    if (!item) {
      return res.status(404).json({ error: "Item não encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Erro ao buscar item:", error);
    res.status(500).json({ error: "Erro ao buscar item" });
  }
});

// POST /api/itens - Criar novo item
app.post("/api/itens", (req: Request, res: Response) => {
  try {
    const { nome, descricao, grupoId, quantidade, unidade, valorUnitario, estoqueMinimo, estoqueIdeal, localizacao, sku, observacoes } = req.body;
    const result = db.insert(schema.itens).values({
      nome,
      descricao: descricao || null,
      grupoId,
      quantidade: parseFloat(quantidade) || 0,
      unidade,
      valorUnitario: parseFloat(valorUnitario) || 0,
      estoqueMinimo: estoqueMinimo ? parseFloat(estoqueMinimo) : null,
      estoqueIdeal: estoqueIdeal ? parseFloat(estoqueIdeal) : null,
      localizacao: localizacao || null,
      sku: sku || null,
      observacoes: observacoes || null,
      ativo: 1,
    }).run();
    
    const novoItem = db.select().from(schema.itens).where(sql`id = ${result.lastInsertRowid}`).get();
    res.status(201).json(novoItem);
  } catch (error) {
    console.error("Erro ao criar item:", error);
    res.status(500).json({ error: "Erro ao criar item" });
  }
});

// PUT /api/itens/:id - Atualizar item
app.put("/api/itens/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, grupoId, quantidade, unidade, valorUnitario, estoqueMinimo, estoqueIdeal, localizacao, sku, observacoes, ativo } = req.body;
    
    db.update(schema.itens)
      .set({
        nome,
        descricao: descricao || null,
        grupoId,
        quantidade: parseFloat(quantidade) || 0,
        unidade,
        valorUnitario: parseFloat(valorUnitario) || 0,
        estoqueMinimo: estoqueMinimo ? parseFloat(estoqueMinimo) : null,
        estoqueIdeal: estoqueIdeal ? parseFloat(estoqueIdeal) : null,
        localizacao: localizacao || null,
        sku: sku || null,
        observacoes: observacoes || null,
        ativo: ativo !== undefined ? (ativo ? 1 : 0) : 1,
        dataAtualizacao: new Date().toISOString(),
      })
      .where(sql`id = ${id}`)
      .run();
    
    const itemAtualizado = db.select().from(schema.itens).where(sql`id = ${id}`).get();
    res.json(itemAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    res.status(500).json({ error: "Erro ao atualizar item" });
  }
});

// PATCH /api/itens/:id/quantidade - Ajustar quantidade do item
app.patch("/api/itens/:id/quantidade", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body;
    
    // Buscar item atual
    const itemAtual = db.select().from(schema.itens).where(sql`id = ${id}`).get();
    if (!itemAtual) {
      return res.status(404).json({ error: "Item não encontrado" });
    }
    
    // Atualizar quantidade
    const novaQuantidade = parseFloat(quantidade) || 0;
    db.update(schema.itens)
      .set({ 
        quantidade: novaQuantidade,
        dataAtualizacao: new Date().toISOString(),
      })
      .where(sql`id = ${id}`)
      .run();
    
    // Registrar movimentação
    db.insert(schema.movimentacoes).values({
      itemId: parseInt(id),
      tipo: novaQuantidade > itemAtual.quantidade ? "entrada" : "saida",
      quantidade: Math.abs(novaQuantidade - itemAtual.quantidade),
      quantidadeAnterior: itemAtual.quantidade,
      quantidadeNova: novaQuantidade,
      motivo: "ajuste",
      observacoes: "Ajuste de quantidade",
    }).run();
    
    const itemAtualizado = db.select().from(schema.itens).where(sql`id = ${id}`).get();
    res.json(itemAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error);
    res.status(500).json({ error: "Erro ao atualizar quantidade" });
  }
});

// DELETE /api/itens/:id - Deletar item
app.delete("/api/itens/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.delete(schema.itens).where(sql`id = ${id}`).run();
    res.json({ message: "Item deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    res.status(500).json({ error: "Erro ao deletar item" });
  }
});

// ============================================
// ROTAS DE MOVIMENTAÇÕES
// ============================================

// GET /api/movimentacoes - Listar todas as movimentações
app.get("/api/movimentacoes", (req: Request, res: Response) => {
  try {
    const movimentacoes = db.select().from(schema.movimentacoes).orderBy(sql`data_criacao DESC`).all();
    res.json(movimentacoes);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    res.status(500).json({ error: "Erro ao buscar movimentações" });
  }
});

// GET /api/movimentacoes/item/:itemId - Buscar movimentações de um item
app.get("/api/movimentacoes/item/:itemId", (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const movimentacoes = db.select().from(schema.movimentacoes).where(sql`item_id = ${itemId}`).orderBy(sql`data_criacao DESC`).all();
    res.json(movimentacoes);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    res.status(500).json({ error: "Erro ao buscar movimentações" });
  }
});

// POST /api/movimentacoes - Registrar movimentação
app.post("/api/movimentacoes", (req: Request, res: Response) => {
  try {
    const { itemId, tipo, quantidade, motivo, observacoes, usuario } = req.body;
    
    // Buscar item para obter quantidade atual
    const item = db.select().from(schema.itens).where(sql`id = ${itemId}`).get();
    
    if (!item) {
      return res.status(404).json({ error: "Item não encontrado" });
    }
    
    let novaQuantidade = item.quantidade;
    
    // Calcular nova quantidade baseado no tipo de movimentação
    if (tipo === "entrada") {
      novaQuantidade = item.quantidade + parseFloat(quantidade);
    } else if (tipo === "saida") {
      novaQuantidade = item.quantidade - parseFloat(quantidade);
    } else if (tipo === "ajuste") {
      novaQuantidade = parseFloat(quantidade); // Para ajuste, é valor direto
    }
    
    // Registrar a movimentação
    const result = db.insert(schema.movimentacoes).values({
      itemId,
      tipo,
      quantidade: parseFloat(quantidade) || 0,
      quantidadeAnterior: item.quantidade,
      quantidadeNova: novaQuantidade,
      motivo: motivo || null,
      observacoes: observacoes || null,
      usuario: usuario || null,
    }).run();
    
    // Atualizar quantidade do item
    db.update(schema.itens).set({ quantidade: novaQuantidade }).where(sql`id = ${itemId}`).run();
    
    const novaMovimentacao = db.select().from(schema.movimentacoes).where(sql`id = ${result.lastInsertRowid}`).get();
    res.status(201).json(novaMovimentacao);
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);
    res.status(500).json({ error: "Erro ao registrar movimentação" });
  }
});

// DELETE /api/movimentacoes/:id - Deletar movimentação
app.delete("/api/movimentacoes/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Buscar a movimentação para reverter a quantidade se necessário
    const movimentacao = db.select().from(schema.movimentacoes).where(sql`id = ${id}`).get();
    
    if (!movimentacao) {
      return res.status(404).json({ error: "Movimentação não encontrada" });
    }
    
    // Reverter a quantidade do item
    const item = db.select().from(schema.itens).where(sql`id = ${movimentacao.itemId}`).get();
    
    if (item && movimentacao.quantidadeAnterior !== null) {
      // Reverter para a quantidade anterior
      db.update(schema.itens).set({ quantidade: movimentacao.quantidadeAnterior }).where(sql`id = ${movimentacao.itemId}`).run();
    }
    
    // Deletar a movimentação
    db.delete(schema.movimentacoes).where(sql`id = ${id}`).run();
    
    res.json({ message: "Movimentação deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar movimentação:", error);
    res.status(500).json({ error: "Erro ao deletar movimentação" });
  }
});

// ============================================
// ROTAS DE FORNECEDORES
// ============================================

// GET /api/fornecedores - Listar todos os fornecedores
app.get("/api/fornecedores", (req: Request, res: Response) => {
  try {
    const fornecedores = db.select().from(schema.fornecedores).all();
    res.json(fornecedores);
  } catch (error) {
    console.error("Erro ao buscar fornecedores:", error);
    res.status(500).json({ error: "Erro ao buscar fornecedores" });
  }
});

// GET /api/fornecedores/:id - Buscar fornecedor por ID
app.get("/api/fornecedores/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fornecedor = db.select().from(schema.fornecedores).where(sql`id = ${id}`).get();
    if (!fornecedor) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }
    res.json(fornecedor);
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error);
    res.status(500).json({ error: "Erro ao buscar fornecedor" });
  }
});

// POST /api/fornecedores - Criar novo fornecedor
app.post("/api/fornecedores", (req: Request, res: Response) => {
  try {
    const { nome, email, telefone, endereco, cnpj, observacoes } = req.body;
    const result = db.insert(schema.fornecedores).values({
      nome,
      email: email || null,
      telefone: telefone || null,
      endereco: endereco || null,
      cnpj: cnpj || null,
      observacoes: observacoes || null,
      ativo: 1,
    }).run();
    
    const novoFornecedor = db.select().from(schema.fornecedores).where(sql`id = ${result.lastInsertRowid}`).get();
    res.status(201).json(novoFornecedor);
  } catch (error) {
    console.error("Erro ao criar fornecedor:", error);
    res.status(500).json({ error: "Erro ao criar fornecedor" });
  }
});

// PUT /api/fornecedores/:id - Atualizar fornecedor
app.put("/api/fornecedores/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, endereco, cnpj, observacoes, ativo } = req.body;
    
    db.update(schema.fornecedores)
      .set({
        nome,
        email: email || null,
        telefone: telefone || null,
        endereco: endereco || null,
        cnpj: cnpj || null,
        observacoes: observacoes || null,
        ativo: ativo !== undefined ? (ativo ? 1 : 0) : 1,
      })
      .where(sql`id = ${id}`)
      .run();
    
    const fornecedorAtualizado = db.select().from(schema.fornecedores).where(sql`id = ${id}`).get();
    res.json(fornecedorAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    res.status(500).json({ error: "Erro ao atualizar fornecedor" });
  }
});

// DELETE /api/fornecedores/:id - Deletar fornecedor
app.delete("/api/fornecedores/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.delete(schema.fornecedores).where(sql`id = ${id}`).run();
    res.json({ message: "Fornecedor deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar fornecedor:", error);
    res.status(500).json({ error: "Erro ao deletar fornecedor" });
  }
});

// ============================================
// ROTA DE DASHBOARD/STATS
// ============================================

// GET /api/stats - Obter estatísticas
app.get("/api/stats", (req: Request, res: Response) => {
  try {
    const totalItens = db.select().from(schema.itens).all().length;
    const totalGrupos = db.select().from(schema.grupos).all().length;
    const itensComEstoqueBaixo = db.select().from(schema.itens)
      .where(sql`quantidade < estoque_minimo OR (estoque_minimo IS NOT NULL AND quantidade < estoque_minimo)`)
      .all().length;
    const totalFornecedores = db.select().from(schema.fornecedores).all().length;
    
    const valorTotalEstoque = db.select().from(schema.itens).all()
      .reduce((sum, item) => sum + (item.quantidade * item.valorUnitario), 0);
    
    res.json({
      totalItens,
      totalGrupos,
      itensComEstoqueBaixo,
      totalFornecedores,
      valorTotalEstoque: valorTotalEstoque.toFixed(2),
    });
  } catch (error) {
    console.error("Erro ao buscar stats:", error);
    res.status(500).json({ error: "Erro ao buscar stats" });
  }
});

// ============================================
// ROTA DE HEALTH CHECK
// ============================================

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================
// ROTAS ESTÁTICAS (Frontend)
// ============================================

// Servir arquivos estáticos do build do Vite
const publicDir = path.join(__dirname, "..", "dist", "public");
app.use(express.static(publicDir));

// Fallback para SPA (React Router)
app.get("*", (req: Request, res: Response) => {
  const indexPath = path.join(publicDir, "index.html");
  res.sendFile(indexPath);
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API Base: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  sqlite.close();
  process.exit(0);
});
