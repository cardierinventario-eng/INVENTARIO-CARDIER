import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema para usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nome: text("nome").notNull(),
  cargo: text("cargo").notNull(),
  email: text("email"),
  ativo: boolean("ativo").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  nome: true,
  cargo: true,
  email: true,
});

// Schema para clientes
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  endereco: text("endereco"),
  dataCadastro: timestamp("data_cadastro").defaultNow(),
  totalPedidos: integer("total_pedidos").default(0),
  ultimoPedido: timestamp("ultimo_pedido"),
  observacoes: text("observacoes"),
});

export const insertClienteSchema = createInsertSchema(clientes).pick({
  nome: true,
  email: true,
  telefone: true,
  endereco: true,
  observacoes: true,
});

// Schema para categorias do cardápio
export const categorias = pgTable("categorias", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
});

export const insertCategoriaSchema = createInsertSchema(categorias).pick({
  nome: true,
  descricao: true,
});

// Schema para itens do cardápio
export const itensCardapio = pgTable("itens_cardapio", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  categoriaId: integer("categoria_id").notNull(),
  categoria: text("categoria").notNull(),
  disponivel: boolean("disponivel").default(true),
  imagem: text("imagem"),
  dataCriacao: timestamp("data_criacao").defaultNow(),
});

export const insertItemCardapioSchema = createInsertSchema(itensCardapio).pick({
  nome: true,
  descricao: true,
  preco: true,
  categoriaId: true,
  categoria: true,
  disponivel: true,
  imagem: true,
});

// Schema para mesas
export const mesas = pgTable("mesas", {
  id: serial("id").primaryKey(),
  numero: integer("numero").notNull(),
  capacidade: integer("capacidade").notNull(),
  status: text("status").notNull().default("livre"),
  horarioOcupacao: timestamp("horario_ocupacao"),
  horarioReserva: timestamp("horario_reserva"),
  observacoes: text("observacoes"),
});

export const insertMesaSchema = createInsertSchema(mesas).pick({
  numero: true,
  capacidade: true,
  status: true,
  observacoes: true,
});

// Schema para estoque
export const itensEstoque = pgTable("itens_estoque", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  categoria: text("categoria").notNull(),
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull(),
  unidade: text("unidade").notNull(),
  valorUnitario: decimal("valor_unitario", { precision: 10, scale: 2 }),
  estoqueMinimo: decimal("estoque_minimo", { precision: 10, scale: 2 }).notNull(),
  estoqueIdeal: decimal("estoque_ideal", { precision: 10, scale: 2 }).notNull(),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  ultimaAtualizacao: timestamp("ultima_atualizacao").defaultNow(),
});

export const insertItemEstoqueSchema = createInsertSchema(itensEstoque).pick({
  nome: true,
  descricao: true,
  categoria: true,
  quantidade: true,
  unidade: true,
  valorUnitario: true,
  estoqueMinimo: true,
  estoqueIdeal: true,
});

// Schema para movimentações de estoque
export const movimentacoesEstoque = pgTable("movimentacoes_estoque", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  tipo: text("tipo").notNull(), // entrada, saida
  quantidade: decimal("quantidade", { precision: 10, scale: 2 }).notNull(),
  dataHora: timestamp("data_hora").defaultNow(),
  usuarioId: integer("usuario_id"),
  motivo: text("motivo"),
  produto: text("produto").notNull(),
});

export const insertMovimentacaoEstoqueSchema = createInsertSchema(movimentacoesEstoque).pick({
  itemId: true,
  tipo: true,
  quantidade: true,
  usuarioId: true,
  motivo: true,
  produto: true,
});

// Schema para pedidos
export const pedidos = pgTable("pedidos", {
  id: serial("id").primaryKey(),
  numero: integer("numero").notNull(),
  tipo: text("tipo").notNull(), // balcao, mesa
  mesaId: integer("mesa_id"),
  clienteId: integer("cliente_id"),
  nomeCliente: text("nome_cliente"),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  valorDesconto: decimal("valor_desconto", { precision: 10, scale: 2 }).default("0"),
  taxaServico: decimal("taxa_servico", { precision: 10, scale: 2 }).default("0"),
  formaPagamento: text("forma_pagamento"),
  status: text("status").notNull(),
  dataCriacao: timestamp("data_criacao").defaultNow(),
  dataAtualizacao: timestamp("data_atualizacao").defaultNow(),
  observacoes: text("observacoes"),
});

export const insertPedidoSchema = createInsertSchema(pedidos).pick({
  numero: true,
  tipo: true,
  mesaId: true,
  clienteId: true,
  nomeCliente: true,
  valorTotal: true,
  valorDesconto: true,
  taxaServico: true,
  formaPagamento: true,
  status: true,
  observacoes: true,
});

// Schema para itens do pedido
export const itensPedido = pgTable("itens_pedido", {
  id: serial("id").primaryKey(),
  pedidoId: integer("pedido_id").notNull(),
  itemCardapioId: integer("item_cardapio_id").notNull(),
  nome: text("nome").notNull(),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  quantidade: integer("quantidade").notNull(),
  observacoes: text("observacoes"),
});

export const insertItemPedidoSchema = createInsertSchema(itensPedido).pick({
  pedidoId: true,
  itemCardapioId: true,
  nome: true,
  preco: true,
  quantidade: true,
  observacoes: true,
});

// Schema para configurações do sistema
export const configuracoes = pgTable("configuracoes", {
  id: serial("id").primaryKey(),
  nomeEmpresa: text("nome_empresa").notNull(),
  cnpj: text("cnpj"),
  endereco: text("endereco"),
  telefone: text("telefone"),
  email: text("email"),
  taxaServicoDefault: decimal("taxa_servico_default", { precision: 5, scale: 2 }).default("0"),
  logotipo: text("logotipo"),
  tema: text("tema").default("claro"),
  moeda: text("moeda").default("BRL"),
});

export const insertConfiguracaoSchema = createInsertSchema(configuracoes).pick({
  nomeEmpresa: true,
  cnpj: true,
  endereco: true,
  telefone: true,
  email: true,
  taxaServicoDefault: true,
  logotipo: true,
  tema: true,
  moeda: true,
});

// Estatísticas do dashboard
export interface DashboardStats {
  pedidosHoje: number;
  vendasHoje: number;
  mesasOcupadas: number;
  totalMesas: number;
  itensEstoqueBaixo: number;
  crescimentoPedidos: string;
  crescimentoVendas: string;
  ocupacaoMesas: string;
}

// Tipos para os relatórios
export interface RelatorioVendas {
  vendasPorDia: Array<{
    data: string;
    total: number;
    quantidade: number;
  }>;
  vendasPorCategoria: Array<{
    categoria: string;
    total: number;
    quantidade: number;
  }>;
  produtosMaisVendidos: Array<{
    produto: string;
    quantidade: number;
    total: number;
  }>;
}

export interface RelatorioFinanceiro {
  receitasPorDia: Array<{
    data: string;
    valor: number;
  }>;
  despesasPorCategoria: Array<{
    categoria: string;
    valor: number;
  }>;
  resumoMensal: {
    receitas: number;
    despesas: number;
    lucro: number;
  };
}

export interface RelatorioEstoque {
  estoqueBaixo: number;
  valorTotalEstoque: number;
  movimentacoes: Array<{
    data: string;
    tipo: string;
    quantidade: number;
    produto: string;
  }>;
  distribuicaoPorCategoria: Array<{
    categoria: string;
    quantidade: number;
    valor: number;
  }>;
}

// Tipos gerados a partir dos schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = z.infer<typeof insertClienteSchema>;

export type Categoria = typeof categorias.$inferSelect;
export type InsertCategoria = z.infer<typeof insertCategoriaSchema>;

export type ItemCardapio = typeof itensCardapio.$inferSelect;
export type InsertItemCardapio = z.infer<typeof insertItemCardapioSchema>;

export type Mesa = typeof mesas.$inferSelect;
export type InsertMesa = z.infer<typeof insertMesaSchema>;

export type ItemEstoque = typeof itensEstoque.$inferSelect;
export type InsertItemEstoque = z.infer<typeof insertItemEstoqueSchema>;

export type MovimentacaoEstoque = typeof movimentacoesEstoque.$inferSelect;
export type InsertMovimentacaoEstoque = z.infer<typeof insertMovimentacaoEstoqueSchema>;

export type Pedido = typeof pedidos.$inferSelect;
export type InsertPedido = z.infer<typeof insertPedidoSchema>;

export type ItemPedido = typeof itensPedido.$inferSelect;
export type InsertItemPedido = z.infer<typeof insertItemPedidoSchema>;

export type Configuracao = typeof configuracoes.$inferSelect;
export type InsertConfiguracao = z.infer<typeof insertConfiguracaoSchema>;
