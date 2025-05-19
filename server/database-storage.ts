import { 
  users, 
  clientes, 
  categorias, 
  itensCardapio, 
  mesas, 
  itensEstoque, 
  movimentacoesEstoque,
  pedidos,
  itensPedido,
  configuracoes,
  type User,
  type InsertUser,
  type Cliente,
  type InsertCliente,
  type Categoria,
  type InsertCategoria,
  type ItemCardapio,
  type InsertItemCardapio,
  type Mesa,
  type InsertMesa,
  type ItemEstoque,
  type InsertItemEstoque,
  type MovimentacaoEstoque,
  type InsertMovimentacaoEstoque,
  type Pedido,
  type InsertPedido,
  type ItemPedido,
  type InsertItemPedido,
  type Configuracao,
  type InsertConfiguracao,
  type DashboardStats,
  type RelatorioVendas,
  type RelatorioFinanceiro,
  type RelatorioEstoque
} from "@shared/schema";

import { db } from "./db";
import { eq, desc, lt, and, sql, gte, asc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // As propriedades para rastreamento de zeramento foram movidas para o banco de dados
  // e agora são armazenadas na tabela 'configuracoes' 
  // com os campos:
  // - dataZeramentoVendas
  // - dataZeramentoFinanceiro
  // - relatorioVendasZerado (JSON)
  // - relatorioFinanceiroZerado (JSON)

  constructor() {
    // Inicializar o banco de dados se necessário
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Verificar se há dados básicos e inicializar se necessário
      const adminUsers = await db.select().from(users).where(eq(users.username, "admin"));
      
      if (adminUsers.length === 0) {
        console.log("Inicializando banco de dados com dados padrão...");
        
        // Criar usuário admin padrão
        await db.insert(users).values({
          username: "admin",
          password: "admin",
          nome: "Administrador",
          cargo: "Gerente",
          email: "admin@lanchefacil.com.br"
        });

        // Gerar dados de vendas por dia zerados (últimos 7 dias)
        const vendasPorDia = [];
        for (let i = 6; i >= 0; i--) {
          const data = new Date();
          data.setDate(data.getDate() - i);
          const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
          vendasPorDia.push({
            data: dataFormatada,
            total: 0,
            quantidade: 0
          });
        }
        
        // Dados do relatório de vendas zerado
        const relatorioVendasZerado = {
          data: new Date(),
          vendasPorDia: vendasPorDia,
          vendasPorCategoria: [
            { categoria: "Lanches", total: 0, quantidade: 0 },
            { categoria: "Porções", total: 0, quantidade: 0 },
            { categoria: "Bebidas", total: 0, quantidade: 0 },
            { categoria: "Sobremesas", total: 0, quantidade: 0 },
            { categoria: "Combos", total: 0, quantidade: 0 }
          ],
          produtosMaisVendidos: []
        };
        
        // Gerar dados financeiros zerados (últimos 30 dias)
        const receitasPorDia = [];
        for (let i = 29; i >= 0; i--) {
          const data = new Date();
          data.setDate(data.getDate() - i);
          const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
          receitasPorDia.push({
            data: dataFormatada,
            valor: 0
          });
        }
        
        // Dados do relatório financeiro zerado
        const relatorioFinanceiroZerado = {
          data: new Date(),
          receitasPorDia: receitasPorDia,
          despesasPorCategoria: [
            { categoria: "Ingredientes", valor: 0 },
            { categoria: "Salários", valor: 0 },
            { categoria: "Aluguel", valor: 0 },
            { categoria: "Água/Luz", valor: 0 },
            { categoria: "Marketing", valor: 0 },
            { categoria: "Equipamentos", valor: 0 },
            { categoria: "Outros", valor: 0 }
          ],
          resumoMensal: {
            receitas: 0,
            despesas: 0,
            lucro: 0
          }
        };

        // Criar configuração padrão com relatórios zerados
        await db.insert(configuracoes).values({
          nomeEmpresa: "Lanche Fácil",
          cnpj: "12.345.678/0001-90",
          endereco: "Rua Exemplo, 123 - Centro, Lins - SP",
          telefone: "(14) 99999-9999",
          email: "contato@lanchefacil.com.br",
          taxaServicoDefault: "10.00",
          logotipo: "",
          tema: "claro",
          moeda: "BRL",
          dataZeramentoVendas: new Date(),
          dataZeramentoFinanceiro: new Date(),
          relatorioVendasZerado,
          relatorioFinanceiroZerado
        });
        
        console.log("Banco de dados inicializado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao inicializar banco de dados:", error);
    }
  }

  // Implementação de Usuários
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Implementação de Clientes
  async getClientes(): Promise<Cliente[]> {
    return await db.select().from(clientes);
  }

  async getCliente(id: number): Promise<Cliente | undefined> {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    return cliente || undefined;
  }

  async createCliente(insertCliente: InsertCliente): Promise<Cliente> {
    // Adicionar campos calculados
    const clienteComCamposExtras = {
      ...insertCliente,
      dataCadastro: new Date(),
      totalPedidos: 0,
      ultimoPedido: null
    };
    
    const [cliente] = await db.insert(clientes).values(clienteComCamposExtras).returning();
    return cliente;
  }

  async updateCliente(id: number, updateData: Partial<InsertCliente>): Promise<Cliente | undefined> {
    const [updatedCliente] = await db
      .update(clientes)
      .set(updateData)
      .where(eq(clientes.id, id))
      .returning();
    
    return updatedCliente || undefined;
  }

  async deleteCliente(id: number): Promise<boolean> {
    const result = await db.delete(clientes).where(eq(clientes.id, id));
    return result.rowCount > 0;
  }

  // Implementação de Categorias
  async getCategorias(): Promise<Categoria[]> {
    return await db.select().from(categorias);
  }

  async getCategoria(id: number): Promise<Categoria | undefined> {
    const [categoria] = await db.select().from(categorias).where(eq(categorias.id, id));
    return categoria || undefined;
  }

  async createCategoria(insertCategoria: InsertCategoria): Promise<Categoria> {
    const [categoria] = await db.insert(categorias).values(insertCategoria).returning();
    return categoria;
  }

  async updateCategoria(id: number, updateData: Partial<InsertCategoria>): Promise<Categoria | undefined> {
    const [updatedCategoria] = await db
      .update(categorias)
      .set(updateData)
      .where(eq(categorias.id, id))
      .returning();
    
    return updatedCategoria || undefined;
  }

  async deleteCategoria(id: number): Promise<boolean> {
    const result = await db.delete(categorias).where(eq(categorias.id, id));
    return result.rowCount > 0;
  }

  // Implementação de Itens do Cardápio
  async getItensCardapio(): Promise<ItemCardapio[]> {
    return await db.select().from(itensCardapio);
  }

  async getItemCardapio(id: number): Promise<ItemCardapio | undefined> {
    const [item] = await db.select().from(itensCardapio).where(eq(itensCardapio.id, id));
    return item || undefined;
  }

  async createItemCardapio(insertItem: InsertItemCardapio): Promise<ItemCardapio> {
    const itemComData = {
      ...insertItem,
      dataCriacao: new Date()
    };
    
    const [item] = await db.insert(itensCardapio).values(itemComData).returning();
    return item;
  }

  async updateItemCardapio(id: number, updateData: Partial<InsertItemCardapio>): Promise<ItemCardapio | undefined> {
    const [updatedItem] = await db
      .update(itensCardapio)
      .set(updateData)
      .where(eq(itensCardapio.id, id))
      .returning();
    
    return updatedItem || undefined;
  }

  async deleteItemCardapio(id: number): Promise<boolean> {
    const result = await db.delete(itensCardapio).where(eq(itensCardapio.id, id));
    return result.rowCount > 0;
  }

  // Implementação de Mesas
  async getMesas(): Promise<Mesa[]> {
    return await db.select().from(mesas);
  }

  async getMesa(id: number): Promise<Mesa | undefined> {
    const [mesa] = await db.select().from(mesas).where(eq(mesas.id, id));
    return mesa || undefined;
  }

  async createMesa(insertMesa: InsertMesa): Promise<Mesa> {
    const [mesa] = await db.insert(mesas).values(insertMesa).returning();
    return mesa;
  }

  async updateMesa(id: number, updateData: Partial<InsertMesa>): Promise<Mesa | undefined> {
    const [updatedMesa] = await db
      .update(mesas)
      .set(updateData)
      .where(eq(mesas.id, id))
      .returning();
    
    return updatedMesa || undefined;
  }

  async updateMesaStatus(id: number, status: string): Promise<Mesa | undefined> {
    const [updatedMesa] = await db
      .update(mesas)
      .set({ status })
      .where(eq(mesas.id, id))
      .returning();
    
    return updatedMesa || undefined;
  }

  async deleteMesa(id: number): Promise<boolean> {
    const result = await db.delete(mesas).where(eq(mesas.id, id));
    return result.rowCount > 0;
  }

  // Implementação de Estoque
  async getItensEstoque(): Promise<ItemEstoque[]> {
    return await db.select().from(itensEstoque);
  }

  async getItensEstoqueBaixo(): Promise<ItemEstoque[]> {
    return await db
      .select()
      .from(itensEstoque)
      .where(
        sql`cast(${itensEstoque.quantidade} as decimal) <= cast(${itensEstoque.estoqueMinimo} as decimal)`
      );
  }

  async getItemEstoque(id: number): Promise<ItemEstoque | undefined> {
    const [item] = await db.select().from(itensEstoque).where(eq(itensEstoque.id, id));
    return item || undefined;
  }
  
  async getItemEstoquePorCodigoBarras(codigoBarras: string): Promise<ItemEstoque | undefined> {
    const [item] = await db.select().from(itensEstoque).where(eq(itensEstoque.codigoBarras, codigoBarras));
    return item || undefined;
  }

  async createItemEstoque(insertItem: InsertItemEstoque): Promise<ItemEstoque> {
    const [item] = await db.insert(itensEstoque).values(insertItem).returning();
    return item;
  }

  async updateItemEstoque(id: number, updateData: Partial<InsertItemEstoque>): Promise<ItemEstoque | undefined> {
    const [updatedItem] = await db
      .update(itensEstoque)
      .set(updateData)
      .where(eq(itensEstoque.id, id))
      .returning();
    
    return updatedItem || undefined;
  }

  async ajustarQuantidadeEstoque(id: number, quantidade: number): Promise<ItemEstoque | undefined> {
    // Primeiro, obter o item atual
    const [item] = await db.select().from(itensEstoque).where(eq(itensEstoque.id, id));
    
    if (!item) return undefined;
    
    // Calcular a nova quantidade
    const quantidadeAtual = parseFloat(item.quantidade);
    const novaQuantidade = quantidadeAtual + quantidade;
    
    // Atualizar o item
    const [updatedItem] = await db
      .update(itensEstoque)
      .set({ quantidade: novaQuantidade.toString() })
      .where(eq(itensEstoque.id, id))
      .returning();
    
    // Registrar a movimentação
    await this.createMovimentacaoEstoque({
      itemId: id,
      quantidade: quantidade.toString(),
      tipo: quantidade > 0 ? "entrada" : "saida",
      motivo: "Ajuste manual",
      responsavel: "Sistema",
      data: new Date()
    });
    
    return updatedItem || undefined;
  }

  async deleteItemEstoque(id: number): Promise<boolean> {
    const result = await db.delete(itensEstoque).where(eq(itensEstoque.id, id));
    return result.rowCount > 0;
  }

  // Implementação de Movimentações de Estoque
  async getMovimentacoesEstoque(): Promise<MovimentacaoEstoque[]> {
    return await db
      .select()
      .from(movimentacoesEstoque)
      .orderBy(desc(movimentacoesEstoque.dataHora));
  }

  async getMovimentacaoEstoque(id: number): Promise<MovimentacaoEstoque | undefined> {
    const [movimentacao] = await db
      .select()
      .from(movimentacoesEstoque)
      .where(eq(movimentacoesEstoque.id, id));
    
    return movimentacao || undefined;
  }

  async getMovimentacoesPorItem(itemId: number): Promise<MovimentacaoEstoque[]> {
    return await db
      .select()
      .from(movimentacoesEstoque)
      .where(eq(movimentacoesEstoque.itemId, itemId))
      .orderBy(desc(movimentacoesEstoque.dataHora));
  }

  async createMovimentacaoEstoque(insertMovimentacao: InsertMovimentacaoEstoque): Promise<MovimentacaoEstoque> {
    // Ajustar o nome da propriedade para corresponder ao esquema
    const movimentacaoAjustada = {
      ...insertMovimentacao,
      dataHora: insertMovimentacao.data || new Date()
    };
    
    // Remover a propriedade data se existir para evitar conflitos
    if ('data' in movimentacaoAjustada) {
      delete (movimentacaoAjustada as any).data;
    }
    
    const [movimentacao] = await db
      .insert(movimentacoesEstoque)
      .values(movimentacaoAjustada)
      .returning();
    
    return movimentacao;
  }

  // Implementação de Pedidos
  async getPedidos(): Promise<Pedido[]> {
    return await db
      .select()
      .from(pedidos)
      .orderBy(desc(pedidos.dataCriacao));
  }

  async getPedidosRecentes(limit: number = 5): Promise<Pedido[]> {
    return await db
      .select()
      .from(pedidos)
      .orderBy(desc(pedidos.dataCriacao))
      .limit(limit);
  }

  async getPedido(id: number): Promise<Pedido | undefined> {
    const [pedido] = await db
      .select()
      .from(pedidos)
      .where(eq(pedidos.id, id));
    
    return pedido || undefined;
  }

  async createPedido(insertPedido: InsertPedido): Promise<Pedido> {
    // Incrementar o número do pedido
    const maxNumeroResult = await db
      .select({ maxNumero: sql`max(${pedidos.numero})` })
      .from(pedidos);
    
    const maxNumero = maxNumeroResult[0]?.maxNumero || 1000;
    const proximoNumero = Number(maxNumero) + 1;
    
    const pedidoComDatas = {
      ...insertPedido,
      numero: proximoNumero,
      dataCriacao: new Date(),
      dataAtualizacao: new Date()
    };
    
    const [pedido] = await db
      .insert(pedidos)
      .values(pedidoComDatas)
      .returning();
    
    // Se for um pedido de mesa, atualizar o status da mesa
    if (pedido.tipo === "mesa" && pedido.mesaId) {
      await this.updateMesaStatus(pedido.mesaId, "ocupada");
    }
    
    // Se for um pedido de cliente, atualizar as informações do cliente
    if (pedido.clienteId) {
      // Obter o cliente
      const [cliente] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.id, pedido.clienteId));
      
      if (cliente) {
        // Atualizar o total de pedidos e a data do último pedido
        await db
          .update(clientes)
          .set({
            totalPedidos: (cliente.totalPedidos || 0) + 1,
            ultimoPedido: new Date()
          })
          .where(eq(clientes.id, cliente.id));
      }
    }
    
    return pedido;
  }

  async updatePedido(id: number, updateData: Partial<InsertPedido>): Promise<Pedido | undefined> {
    const [updatedPedido] = await db
      .update(pedidos)
      .set({
        ...updateData,
        dataAtualizacao: new Date()
      })
      .where(eq(pedidos.id, id))
      .returning();
    
    return updatedPedido || undefined;
  }

  async updatePedidoStatus(id: number, status: string): Promise<Pedido | undefined> {
    const [updatedPedido] = await db
      .update(pedidos)
      .set({
        status,
        dataAtualizacao: new Date()
      })
      .where(eq(pedidos.id, id))
      .returning();
    
    // Se o pedido for finalizado ou cancelado e for de mesa, liberar a mesa
    if (
      updatedPedido &&
      (status === "finalizado" || status === "cancelado") &&
      updatedPedido.tipo === "mesa" &&
      updatedPedido.mesaId
    ) {
      await this.updateMesaStatus(updatedPedido.mesaId, "livre");
    }
    
    return updatedPedido || undefined;
  }

  async deletePedido(id: number): Promise<boolean> {
    try {
      // Primeiro verificar se existe pedido e obter dados
      const [pedido] = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.id, id));
      
      if (!pedido) {
        console.log(`Pedido com ID ${id} não encontrado para exclusão.`);
        return false;
      }

      // Iniciar uma transação para garantir que todas as operações sejam concluídas com sucesso
      await db.transaction(async (tx) => {
        // 1. Primeiro excluir todos os itens do pedido
        console.log(`Excluindo itens do pedido ${id}...`);
        await tx.delete(itensPedido).where(eq(itensPedido.pedidoId, id));
        
        // 2. Excluir o pedido
        console.log(`Excluindo pedido ${id}...`);
        await tx.delete(pedidos).where(eq(pedidos.id, id));
        
        // 3. Se for pedido de mesa, atualizar o status da mesa para livre
        if (pedido.tipo === "mesa" && pedido.mesaId) {
          console.log(`Liberando mesa ${pedido.mesaId}...`);
          await tx
            .update(mesas)
            .set({ status: "livre" })
            .where(eq(mesas.id, pedido.mesaId));
        }
      });
      
      console.log(`Pedido ${id} excluído com sucesso.`);
      return true;
    } catch (error) {
      console.error(`Erro ao excluir pedido ${id}:`, error);
      return false;
    }
  }

  // Implementação de Itens do Pedido
  async getItensPedido(pedidoId: number): Promise<ItemPedido[]> {
    return await db
      .select()
      .from(itensPedido)
      .where(eq(itensPedido.pedidoId, pedidoId));
  }

  async getItemPedido(id: number): Promise<ItemPedido | undefined> {
    const [item] = await db
      .select()
      .from(itensPedido)
      .where(eq(itensPedido.id, id));
    
    return item || undefined;
  }

  async createItemPedido(insertItem: InsertItemPedido): Promise<ItemPedido> {
    const [item] = await db
      .insert(itensPedido)
      .values(insertItem)
      .returning();
    
    return item;
  }

  async updateItemPedido(id: number, updateData: Partial<InsertItemPedido>): Promise<ItemPedido | undefined> {
    const [updatedItem] = await db
      .update(itensPedido)
      .set(updateData)
      .where(eq(itensPedido.id, id))
      .returning();
    
    return updatedItem || undefined;
  }

  async deleteItemPedido(id: number): Promise<boolean> {
    const result = await db.delete(itensPedido).where(eq(itensPedido.id, id));
    return result.rowCount > 0;
  }

  // Implementação de Configurações
  async getConfiguracao(): Promise<Configuracao | undefined> {
    const [config] = await db.select().from(configuracoes);
    return config || undefined;
  }

  async updateConfiguracao(updateData: Partial<InsertConfiguracao>): Promise<Configuracao> {
    const [existingConfig] = await db.select().from(configuracoes);
    
    if (existingConfig) {
      const [updatedConfig] = await db
        .update(configuracoes)
        .set(updateData)
        .where(eq(configuracoes.id, existingConfig.id))
        .returning();
      
      return updatedConfig;
    } else {
      const [newConfig] = await db
        .insert(configuracoes)
        .values(updateData)
        .returning();
      
      return newConfig;
    }
  }

  // Dashboard e Relatórios
  async getDashboardStats(): Promise<DashboardStats> {
    // Obter data de hoje para filtrar
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Obter data de ontem para comparação
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    ontem.setHours(0, 0, 0, 0);
    
    // Consultar pedidos de hoje
    const pedidosHoje = await db
      .select()
      .from(pedidos)
      .where(gte(pedidos.dataCriacao, hoje));
    
    // Calcular total vendido hoje
    const totalHoje = pedidosHoje.reduce((sum, pedido) => {
      return sum + parseFloat(pedido.valorTotal || "0");
    }, 0);
    
    // Consultar pedidos de ontem para comparação
    const pedidosOntem = await db
      .select()
      .from(pedidos)
      .where(
        and(
          gte(pedidos.dataCriacao, ontem),
          lt(pedidos.dataCriacao, hoje)
        )
      );
    
    // Calcular total vendido ontem
    const totalOntem = pedidosOntem.reduce((sum, pedido) => {
      return sum + parseFloat(pedido.valorTotal || "0");
    }, 0);
    
    // Calcular crescimento
    const crescimentoPedidos = pedidosOntem.length > 0 
      ? `${Math.round((pedidosHoje.length - pedidosOntem.length) / pedidosOntem.length * 100)}% em relação a ontem` 
      : "0% em relação a ontem";
    
    const crescimentoVendas = totalOntem > 0 
      ? `${Math.round((totalHoje - totalOntem) / totalOntem * 100)}% em relação a ontem` 
      : "0% em relação a ontem";
    
    // Contar mesas ocupadas
    const mesasResult = await db.select().from(mesas);
    const mesasOcupadas = mesasResult.filter(m => m.status === "ocupada").length;
    const totalMesas = mesasResult.length;
    const ocupacaoMesas = `${Math.round(mesasOcupadas / totalMesas * 100)}% de ocupação`;
    
    // Contar itens com estoque baixo
    const itensBaixoEstoque = await this.getItensEstoqueBaixo();
    
    return {
      pedidosHoje: pedidosHoje.length,
      vendasHoje: totalHoje,
      mesasOcupadas,
      totalMesas,
      itensEstoqueBaixo: itensBaixoEstoque.length,
      crescimentoPedidos,
      crescimentoVendas,
      ocupacaoMesas
    };
  }

  async getRelatorioVendas(): Promise<RelatorioVendas> {
    // Buscar configuração para verificar se o relatório foi zerado
    const config = await this.getConfiguracao();
    
    if (config?.dataZeramentoVendas && config?.relatorioVendasZerado) {
      console.log("Relatório foi zerado anteriormente, verificando tempo decorrido");
      
      // Se o relatório foi zerado, retornar os dados zerados armazenados no banco
      const relatorioZerado = config.relatorioVendasZerado as any;
      
      return {
        vendasPorDia: relatorioZerado.vendasPorDia || [],
        vendasPorCategoria: relatorioZerado.vendasPorCategoria || [],
        produtosMaisVendidos: relatorioZerado.produtosMaisVendidos || []
      };
    }
    
    console.log("Calculando relatório de vendas com dados do banco");
    
    // Obter pedidos dos últimos 7 dias
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 6);
    dataInicio.setHours(0, 0, 0, 0);
    
    const pedidos7Dias = await db
      .select()
      .from(pedidos)
      .where(gte(pedidos.dataCriacao, dataInicio))
      .orderBy(asc(pedidos.dataCriacao));
    
    // Agrupar vendas por dia
    const vendasPorDia = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      data.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(data);
      dataFim.setDate(dataFim.getDate() + 1);
      
      // Formatar a data como DD/MM
      const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Filtrar pedidos desta data
      const pedidosDoDia = pedidos7Dias.filter(p => {
        const dataPedido = new Date(p.dataCriacao);
        return dataPedido >= data && dataPedido < dataFim;
      });
      
      // Calcular total e quantidade
      const total = pedidosDoDia.reduce((sum, p) => sum + parseFloat(p.valorTotal || "0"), 0);
      const quantidade = pedidosDoDia.length;
      
      vendasPorDia.push({
        data: dataFormatada,
        total,
        quantidade
      });
    }
    
    // Para outros dados (vendas por categoria e produtos mais vendidos)
    // Como isso requer consultas complexas e junções que são mais fáceis de fazer com SQL direto,
    // vamos manter um comportamento simplificado semelhante à implementação em memória
    
    const vendasPorCategoria = [
      { categoria: "Lanches", total: 0, quantidade: 0 },
      { categoria: "Porções", total: 0, quantidade: 0 },
      { categoria: "Bebidas", total: 0, quantidade: 0 },
      { categoria: "Sobremesas", total: 0, quantidade: 0 },
      { categoria: "Combos", total: 0, quantidade: 0 }
    ];
    
    // Como não temos uma maneira fácil de agrupar itens por categoria no esquema atual,
    // vamos manter a lista de produtos mais vendidos vazia
    const produtosMaisVendidos = [];
    
    return {
      vendasPorDia,
      vendasPorCategoria,
      produtosMaisVendidos
    };
  }

  async getRelatorioFinanceiro(): Promise<RelatorioFinanceiro> {
    // Buscar configuração para verificar se o relatório foi zerado
    const config = await this.getConfiguracao();
    
    // Verificar se o relatório financeiro foi zerado e temos dados no banco
    if (config?.dataZeramentoFinanceiro && config?.relatorioFinanceiroZerado) {
      console.log("Retornando dados do marco zero financeiro do banco de dados");
      
      // Usar os dados persistentes do banco
      const relatorioZerado = config.relatorioFinanceiroZerado as any;
      
      return {
        receitasPorDia: relatorioZerado.receitasPorDia || [],
        despesasPorCategoria: relatorioZerado.despesasPorCategoria || [],
        resumoMensal: relatorioZerado.resumoMensal || { receitas: 0, despesas: 0, lucro: 0 }
      };
    }
    
    console.log("Calculando relatório financeiro com dados do banco");
    
    // Obter pedidos dos últimos 30 dias para calcular receitas
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 29);
    dataInicio.setHours(0, 0, 0, 0);
    
    const pedidos30Dias = await db
      .select()
      .from(pedidos)
      .where(gte(pedidos.dataCriacao, dataInicio))
      .orderBy(asc(pedidos.dataCriacao));
    
    // Agrupar receitas por dia
    const receitasPorDia = [];
    for (let i = 29; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      data.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(data);
      dataFim.setDate(dataFim.getDate() + 1);
      
      // Formatar a data como DD/MM
      const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Filtrar pedidos desta data
      const pedidosDoDia = pedidos30Dias.filter(p => {
        const dataPedido = new Date(p.dataCriacao);
        return dataPedido >= data && dataPedido < dataFim;
      });
      
      // Calcular valor das receitas
      const valor = pedidosDoDia.reduce((sum, p) => sum + parseFloat(p.valorTotal || "0"), 0);
      
      receitasPorDia.push({
        data: dataFormatada,
        valor
      });
    }
    
    // Como despesas não estão diretamente associadas a um modelo no banco atual,
    // usaremos dados simplificados
    const despesasPorCategoria = [
      { categoria: "Ingredientes", valor: 0 },
      { categoria: "Salários", valor: 0 },
      { categoria: "Aluguel", valor: 0 },
      { categoria: "Água/Luz", valor: 0 },
      { categoria: "Marketing", valor: 0 },
      { categoria: "Equipamentos", valor: 0 },
      { categoria: "Outros", valor: 0 }
    ];
    
    // Resumo mensal
    const receitas = receitasPorDia.reduce((sum, dia) => sum + dia.valor, 0);
    const despesas = despesasPorCategoria.reduce((sum, cat) => sum + cat.valor, 0);
    const lucro = receitas - despesas;
    
    return {
      receitasPorDia,
      despesasPorCategoria,
      resumoMensal: {
        receitas,
        despesas,
        lucro
      }
    };
  }

  async getRelatorioEstoque(): Promise<RelatorioEstoque> {
    // Obter dados reais de estoque
    const itens = await this.getItensEstoque();
    const itensBaixo = await this.getItensEstoqueBaixo();
    
    // Calcular valor total em estoque
    const valorTotalEstoque = itens.reduce((total, item) => {
      return total + (parseFloat(item.quantidade) * parseFloat(item.valorUnitario || "0"));
    }, 0);
    
    // Distribuição por categoria
    const categoriasSet = new Set(itens.map(item => item.categoria));
    const categorias = Array.from(categoriasSet);
    
    const distribuicaoPorCategoria = categorias.map(categoria => {
      const itensCategoria = itens.filter(item => item.categoria === categoria);
      const quantidade = itensCategoria.reduce((total, item) => total + parseFloat(item.quantidade), 0);
      const valor = itensCategoria.reduce((total, item) => {
        return total + (parseFloat(item.quantidade) * parseFloat(item.valorUnitario || "0"));
      }, 0);
      
      return {
        categoria,
        quantidade,
        valor
      };
    });
    
    // Obter movimentações recentes
    const movimentacoesResult = await db
      .select()
      .from(movimentacoesEstoque)
      .orderBy(desc(movimentacoesEstoque.dataHora))
      .limit(10);
    
    // Transformar movimentações para o formato esperado
    // Precisamos obter o nome do produto para cada movimentação
    const movimentacoes = await Promise.all(
      movimentacoesResult.map(async (mov) => {
        const [item] = await db
          .select()
          .from(itensEstoque)
          .where(eq(itensEstoque.id, mov.itemId));
        
        const dataFormatada = mov.dataHora instanceof Date
          ? mov.dataHora.toISOString().split('T')[0]
          : new Date(mov.dataHora || new Date()).toISOString().split('T')[0];
        
        return {
          data: dataFormatada,
          tipo: mov.tipo,
          quantidade: parseFloat(mov.quantidade),
          produto: item?.nome || "Produto não encontrado"
        };
      })
    );
    
    return {
      estoqueBaixo: itensBaixo.length,
      valorTotalEstoque,
      distribuicaoPorCategoria,
      movimentacoes
    };
  }

  async zerarRelatorioVendas(): Promise<boolean> {
    try {
      // Criar objetos para armazenar no banco de dados
      
      // Gerar dados de vendas por dia zerados (últimos 7 dias)
      const vendasPorDia = [];
      for (let i = 6; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        
        // Formatar a data como DD/MM
        const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
        
        vendasPorDia.push({
          data: dataFormatada,
          total: 0,
          quantidade: 0
        });
      }
      
      // Dados do relatório de vendas zerado
      const relatorioVendasZerado = {
        data: new Date(), // Marca quando o relatório foi zerado
        vendasPorDia: vendasPorDia,
        vendasPorCategoria: [
          { categoria: "Lanches", total: 0, quantidade: 0 },
          { categoria: "Porções", total: 0, quantidade: 0 },
          { categoria: "Bebidas", total: 0, quantidade: 0 },
          { categoria: "Sobremesas", total: 0, quantidade: 0 },
          { categoria: "Combos", total: 0, quantidade: 0 }
        ],
        produtosMaisVendidos: []
      };
      
      // Gerar dados financeiros zerados (últimos 30 dias)
      const receitasPorDia = [];
      for (let i = 29; i >= 0; i--) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        
        // Formatar a data como DD/MM
        const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
        
        receitasPorDia.push({
          data: dataFormatada,
          valor: 0
        });
      }
      
      // Dados do relatório financeiro zerado
      const relatorioFinanceiroZerado = {
        data: new Date(),
        receitasPorDia: receitasPorDia,
        despesasPorCategoria: [
          { categoria: "Ingredientes", valor: 0 },
          { categoria: "Salários", valor: 0 },
          { categoria: "Aluguel", valor: 0 },
          { categoria: "Água/Luz", valor: 0 },
          { categoria: "Marketing", valor: 0 },
          { categoria: "Equipamentos", valor: 0 },
          { categoria: "Outros", valor: 0 }
        ],
        resumoMensal: {
          receitas: 0,
          despesas: 0,
          lucro: 0
        }
      };
      
      // Buscar a configuração atual ou criar uma nova
      const configExistente = await this.getConfiguracao();
      
      if (configExistente) {
        // Atualizar configuração existente com os novos dados de zeramento
        await db
          .update(configuracoes)
          .set({
            dataZeramentoVendas: new Date(),
            dataZeramentoFinanceiro: new Date(),
            relatorioVendasZerado,
            relatorioFinanceiroZerado
          })
          .where(eq(configuracoes.id, configExistente.id));
      } else {
        // Criar nova configuração com os dados de zeramento
        await db
          .insert(configuracoes)
          .values({
            nomeEmpresa: "Lanche Fácil",
            tema: "claro",
            moeda: "R$",
            dataZeramentoVendas: new Date(),
            dataZeramentoFinanceiro: new Date(),
            relatorioVendasZerado,
            relatorioFinanceiroZerado
          });
      }
      
      console.log("Relatórios de vendas e financeiro zerados com sucesso no banco de dados");
      return true;
    } catch (error) {
      console.error("Erro ao zerar relatórios:", error);
      return false;
    }
  }
}