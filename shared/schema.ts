import { sql } from "drizzle-orm";
import { integer, real, text, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";

// Tabela de Grupos/Setores
export const grupos = sqliteTable("grupos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull().unique(),
  descricao: text("descricao"),
  cor: text("cor").default("#3B82F6"), // cor para identificação visual
  ativo: integer("ativo").default(1), // 1 = true, 0 = false
  dataCriacao: text("data_criacao").default(sql`CURRENT_TIMESTAMP`),
  dataAtualizacao: text("data_atualizacao").default(sql`CURRENT_TIMESTAMP`),
});

export type Grupo = typeof grupos.$inferSelect;

// Tabela de Itens de Inventário/Estoque
export const itens = sqliteTable("itens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  grupoId: integer("grupo_id").notNull(),
  quantidade: real("quantidade").notNull().default(0),
  unidade: text("unidade").notNull(), // kg, l, un, m, etc
  valorUnitario: real("valor_unitario").notNull().default(0),
  estoqueMinimo: real("estoque_minimo"),
  estoqueIdeal: real("estoque_ideal"),
  localizacao: text("localizacao"), // onde está armazenado
  sku: text("sku"), // código do item
  observacoes: text("observacoes"),
  ativo: integer("ativo").default(1),
  dataCriacao: text("data_criacao").default(sql`CURRENT_TIMESTAMP`),
  dataAtualizacao: text("data_atualizacao").default(sql`CURRENT_TIMESTAMP`),
});

export type Item = typeof itens.$inferSelect;

// Tabela de Movimentação de Estoque
export const movimentacoes = sqliteTable("movimentacoes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  tipo: text("tipo").notNull(), // entrada, saida, ajuste
  quantidade: real("quantidade").notNull(),
  quantidadeAnterior: real("quantidade_anterior"),
  quantidadeNova: real("quantidade_nova"),
  motivo: text("motivo"), // compra, devolução, perda, uso, etc
  observacoes: text("observacoes"),
  usuario: text("usuario"), // quem fez a movimentação
  dataCriacao: text("data_criacao").default(sql`CURRENT_TIMESTAMP`),
});

export type Movimentacao = typeof movimentacoes.$inferSelect;

// Tabela de Fornecedores
export const fornecedores = sqliteTable("fornecedores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  email: text("email"),
  telefone: text("telefone"),
  endereco: text("endereco"),
  cnpj: text("cnpj"),
  observacoes: text("observacoes"),
  ativo: integer("ativo").default(1),
  dataCriacao: text("data_criacao").default(sql`CURRENT_TIMESTAMP`),
});

export type Fornecedor = typeof fornecedores.$inferSelect;

// Tabela de Configurações
export const config = sqliteTable("config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chave: text("chave").notNull().unique(),
  valor: text("valor").notNull(),
  dataCriacao: text("data_criacao").default(sql`CURRENT_TIMESTAMP`),
});

export type Config = typeof config.$inferSelect;
