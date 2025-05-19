import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertClienteSchema, 
  insertItemCardapioSchema,
  insertMesaSchema, 
  insertItemEstoqueSchema,
  insertMovimentacaoEstoqueSchema,
  insertPedidoSchema,
  insertItemPedidoSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rotas da API (prefixadas com /api)
  
  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Clientes
  app.get("/api/clientes", async (req, res) => {
    const clientes = await storage.getClientes();
    res.json(clientes);
  });

  app.get("/api/clientes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const cliente = await storage.getCliente(id);
    
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }
    
    res.json(cliente);
  });

  app.post("/api/clientes", async (req, res) => {
    try {
      const data = insertClienteSchema.parse(req.body);
      const cliente = await storage.createCliente(data);
      res.status(201).json(cliente);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.patch("/api/clientes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertClienteSchema.partial().parse(req.body);
      const cliente = await storage.updateCliente(id, data);
      
      if (!cliente) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      res.json(cliente);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.delete("/api/clientes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteCliente(id);
    
    if (!success) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }
    
    res.status(204).end();
  });

  // Cardápio
  app.get("/api/cardapio", async (req, res) => {
    const itens = await storage.getItensCardapio();
    res.json(itens);
  });

  app.get("/api/cardapio/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const item = await storage.getItemCardapio(id);
    
    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }
    
    res.json(item);
  });

  app.post("/api/cardapio", async (req, res) => {
    try {
      console.log("Dados recebidos:", req.body);
      
      // Criar schema personalizado para validação
      const customSchema = z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        preco: z.string(), // Aceita string que será convertida para decimal
        categoria: z.string(),
        categoriaId: z.number().default(1),
        disponivel: z.boolean().default(true),
        imagem: z.string().optional(),
      });
      
      // Validar com o schema personalizado
      const validatedData = customSchema.parse(req.body);
      
      // Criar item no cardápio
      const item = await storage.createItemCardapio(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Erro ao criar item do cardápio:", error);
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.patch("/api/cardapio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Converter preço para número se vier como string
      if (typeof req.body.preco === 'string') {
        req.body.preco = parseFloat(req.body.preco.replace(',', '.'));
      }
      
      const data = insertItemCardapioSchema.partial().parse(req.body);
      const item = await storage.updateItemCardapio(id, data);
      
      if (!item) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Erro ao atualizar item do cardápio:", error);
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.delete("/api/cardapio/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteItemCardapio(id);
    
    if (!success) {
      return res.status(404).json({ message: "Item não encontrado" });
    }
    
    res.status(204).end();
  });

  // Mesas
  app.get("/api/mesas", async (req, res) => {
    const mesas = await storage.getMesas();
    res.json(mesas);
  });

  app.get("/api/mesas/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const mesa = await storage.getMesa(id);
    
    if (!mesa) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }
    
    res.json(mesa);
  });

  app.post("/api/mesas", async (req, res) => {
    try {
      const data = insertMesaSchema.parse(req.body);
      const mesa = await storage.createMesa(data);
      res.status(201).json(mesa);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.patch("/api/mesas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertMesaSchema.partial().parse(req.body);
      const mesa = await storage.updateMesa(id, data);
      
      if (!mesa) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }
      
      res.json(mesa);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.patch("/api/mesas/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const statusSchema = z.object({ status: z.string() });
      const { status } = statusSchema.parse(req.body);
      
      const mesa = await storage.updateMesaStatus(id, status);
      
      if (!mesa) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }
      
      res.json(mesa);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.delete("/api/mesas/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteMesa(id);
    
    if (!success) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }
    
    res.status(204).end();
  });

  // Estoque
  app.get("/api/estoque", async (req, res) => {
    // Verificar se há um código de barras na query
    const codigoBarras = req.query.codigoBarras as string;
    
    if (codigoBarras) {
      // Buscar por código de barras
      const item = await storage.getItemEstoquePorCodigoBarras(codigoBarras);
      if (item) {
        // Retornar como array para manter consistência
        return res.json([item]);
      } else {
        // Se não encontrar, retornar array vazio
        return res.json([]);
      }
    }
    
    // Busca normal sem filtro
    const itens = await storage.getItensEstoque();
    res.json(itens);
  });

  app.get("/api/estoque/baixo", async (req, res) => {
    const itens = await storage.getItensEstoqueBaixo();
    res.json(itens);
  });

  app.get("/api/estoque/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const item = await storage.getItemEstoque(id);
    
    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }
    
    res.json(item);
  });

  app.post("/api/estoque", async (req, res) => {
    try {
      const data = insertItemEstoqueSchema.parse(req.body);
      const item = await storage.createItemEstoque(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.patch("/api/estoque/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertItemEstoqueSchema.partial().parse(req.body);
      const item = await storage.updateItemEstoque(id, data);
      
      if (!item) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.patch("/api/estoque/:id/ajustar", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Aceitar quantidade como string ou número
      const schema = z.object({ 
        quantidade: z.union([z.string(), z.number()]) 
      });
      const { quantidade } = schema.parse(req.body);
      
      // Convertemos para número ao processar
      const qtdNumerica = typeof quantidade === 'string' ? parseInt(quantidade) : quantidade;
      
      const item = await storage.ajustarQuantidadeEstoque(id, qtdNumerica);
      
      if (!item) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      
      // Registrar movimentação
      const tipo = qtdNumerica > 0 ? "entrada" : "saida";
      const itemNome = item.nome;
      
      await storage.createMovimentacaoEstoque({
        itemId: id,
        tipo,
        quantidade: Math.abs(qtdNumerica).toString(),
        usuarioId: 1, // Admin por padrão
        motivo: "Ajuste manual",
        produto: itemNome
      });
      
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.delete("/api/estoque/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteItemEstoque(id);
    
    if (!success) {
      return res.status(404).json({ message: "Item não encontrado" });
    }
    
    res.status(204).end();
  });

  app.post("/api/estoque/movimentacao", async (req, res) => {
    try {
      const data = insertMovimentacaoEstoqueSchema.parse(req.body);
      const movimentacao = await storage.createMovimentacaoEstoque(data);
      res.status(201).json(movimentacao);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.get("/api/estoque/movimentacao", async (req, res) => {
    const movimentacoes = await storage.getMovimentacoesEstoque();
    res.json(movimentacoes);
  });

  // Pedidos
  app.get("/api/pedidos", async (req, res) => {
    const pedidos = await storage.getPedidos();
    res.json(pedidos);
  });

  app.get("/api/pedidos/recentes", async (req, res) => {
    const pedidos = await storage.getPedidosRecentes();
    res.json(pedidos);
  });

  app.get("/api/pedidos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const pedido = await storage.getPedido(id);
    
    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }
    
    res.json(pedido);
  });

  app.get("/api/pedidos/:id/itens", async (req, res) => {
    const id = parseInt(req.params.id);
    const itens = await storage.getItensPedido(id);
    res.json(itens);
  });

  app.post("/api/pedidos", async (req, res) => {
    try {
      const data = insertPedidoSchema.parse(req.body);
      const pedido = await storage.createPedido(data);
      res.status(201).json(pedido);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.patch("/api/pedidos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertPedidoSchema.partial().parse(req.body);
      const pedido = await storage.updatePedido(id, data);
      
      if (!pedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      res.json(pedido);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.patch("/api/pedidos/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const statusSchema = z.object({ status: z.string() });
      const { status } = statusSchema.parse(req.body);
      
      const pedido = await storage.updatePedidoStatus(id, status);
      
      if (!pedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      res.json(pedido);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.delete("/api/pedidos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`Recebida solicitação para excluir pedido ${id}`);
      
      // Verificar se o pedido existe
      const pedido = await storage.getPedido(id);
      if (!pedido) {
        console.log(`Pedido ${id} não encontrado`);
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      console.log(`Pedido ${id} encontrado, tipo: ${pedido.tipo}, mesa: ${pedido.mesaId || 'N/A'}`);
      
      // Obter itens do pedido para log
      const itens = await storage.getItensPedido(id);
      console.log(`Pedido ${id} possui ${itens.length} itens para excluir`);
      
      // Excluir pedido e seus itens
      const success = await storage.deletePedido(id);
      
      if (!success) {
        console.log(`Falha ao excluir pedido ${id}`);
        return res.status(500).json({ message: "Erro ao excluir pedido" });
      }
      
      console.log(`Pedido ${id} excluído com sucesso via API`);
      res.status(204).end();
    } catch (error) {
      console.error("Erro na rota de exclusão de pedido:", error);
      res.status(500).json({ 
        message: "Erro interno ao processar a exclusão do pedido",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/pedidos/:id/itens", async (req, res) => {
    try {
      const pedidoId = parseInt(req.params.id);
      const data = insertItemPedidoSchema.parse({ ...req.body, pedidoId });
      const item = await storage.createItemPedido(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });
  
  // Nova rota para criar itens de pedido diretamente
  // Obter itens de um pedido específico
  app.get("/api/pedidos/:id/itens", async (req, res) => {
    try {
      const pedidoId = parseInt(req.params.id);
      
      // Verificar se o pedido existe
      const pedido = await storage.getPedido(pedidoId);
      if (!pedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      const itens = await storage.getItensPedido(pedidoId);
      res.json(itens);
    } catch (error) {
      res.status(400).json({ message: "Erro ao buscar itens do pedido", error });
    }
  });

  app.post("/api/pedidos/itens", async (req, res) => {
    try {
      const data = insertItemPedidoSchema.parse(req.body);
      const item = await storage.createItemPedido(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  app.delete("/api/pedidos/itens/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteItemPedido(id);
    
    if (!success) {
      return res.status(404).json({ message: "Item não encontrado" });
    }
    
    res.status(204).end();
  });

  // Relatórios
  app.get("/api/relatorios/vendas", async (req, res) => {
    const relatorio = await storage.getRelatorioVendas();
    res.json(relatorio);
  });

  app.get("/api/relatorios/financeiro", async (req, res) => {
    const relatorio = await storage.getRelatorioFinanceiro();
    res.json(relatorio);
  });

  app.get("/api/relatorios/estoque", async (req, res) => {
    const relatorio = await storage.getRelatorioEstoque();
    res.json(relatorio);
  });
  
  // Endpoint para zerar relatórios
  app.post("/api/relatorios/zerar", async (req, res) => {
    try {
      // Zera tanto o relatório de vendas quanto o financeiro
      const result = await storage.zerarRelatorioVendas();
      res.json({ success: true, message: "Relatórios zerados com sucesso" });
    } catch (error) {
      console.error("Erro ao zerar relatórios:", error);
      res.status(500).json({ success: false, message: "Erro ao zerar relatórios" });
    }
  });

  // Configurações
  app.get("/api/configuracoes", async (req, res) => {
    const config = await storage.getConfiguracao();
    res.json(config);
  });

  app.patch("/api/configuracoes", async (req, res) => {
    try {
      const config = await storage.updateConfiguracao(req.body);
      res.json(config);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
