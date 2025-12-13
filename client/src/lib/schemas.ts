import { z } from "zod";

// Schemas específicos para formulários do cliente
// Esses schemas lidam com null values que vêm do banco de dados

export const editClienteFormSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).or(z.string().length(0)),
  telefone: z.string().min(10, { message: "Telefone deve ter no mínimo 10 dígitos" }),
  endereco: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
});

export type EditClienteFormValues = z.infer<typeof editClienteFormSchema>;

export const editEstoqueFormSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  categoria: z.string().min(1, { message: "Categoria é obrigatória" }),
  quantidade: z.string().or(z.number()),
  unidade: z.string().min(1, { message: "Unidade é obrigatória" }),
  valorUnitario: z.string().or(z.number()),
  estoqueMinimo: z.string().or(z.number()),
  estoqueIdeal: z.string().or(z.number()),
  descricao: z.string().nullable().optional(),
});

export type EditEstoqueFormValues = z.infer<typeof editEstoqueFormSchema>;

export const novoClienteFormSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.string().length(0)),
  telefone: z.string().min(10, { message: "Telefone deve ter no mínimo 10 dígitos" }),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

export type NovoClienteFormValues = z.infer<typeof novoClienteFormSchema>;

export const novoEstoqueFormSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  categoria: z.string().min(1, { message: "Categoria é obrigatória" }),
  quantidade: z.string().or(z.number()),
  unidade: z.string().min(1, { message: "Unidade é obrigatória" }),
  valorUnitario: z.string().or(z.number()),
  estoqueMinimo: z.string().or(z.number()),
  estoqueIdeal: z.string().or(z.number()),
  descricao: z.string().optional(),
});

export type NovoEstoqueFormValues = z.infer<typeof novoEstoqueFormSchema>;
