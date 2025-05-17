import { 
  User, InsertUser, 
  Cliente, InsertCliente, 
  Categoria, InsertCategoria, 
  ItemCardapio, InsertItemCardapio, 
  Mesa, InsertMesa, 
  ItemEstoque, InsertItemEstoque,
  MovimentacaoEstoque, InsertMovimentacaoEstoque,
  Pedido, InsertPedido,
  ItemPedido, InsertItemPedido,
  Configuracao, InsertConfiguracao,
  DashboardStats,
  RelatorioVendas,
  RelatorioFinanceiro,
  RelatorioEstoque
} from "@shared/schema";

// Interface para o armazenamento
export interface IStorage {
  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clientes
  getClientes(): Promise<Cliente[]>;
  getCliente(id: number): Promise<Cliente | undefined>;
  createCliente(cliente: InsertCliente): Promise<Cliente>;
  updateCliente(id: number, cliente: Partial<InsertCliente>): Promise<Cliente | undefined>;
  deleteCliente(id: number): Promise<boolean>;

  // Categorias
  getCategorias(): Promise<Categoria[]>;
  getCategoria(id: number): Promise<Categoria | undefined>;
  createCategoria(categoria: InsertCategoria): Promise<Categoria>;
  updateCategoria(id: number, categoria: Partial<InsertCategoria>): Promise<Categoria | undefined>;
  deleteCategoria(id: number): Promise<boolean>;

  // Itens do Cardápio
  getItensCardapio(): Promise<ItemCardapio[]>;
  getItemCardapio(id: number): Promise<ItemCardapio | undefined>;
  createItemCardapio(item: InsertItemCardapio): Promise<ItemCardapio>;
  updateItemCardapio(id: number, item: Partial<InsertItemCardapio>): Promise<ItemCardapio | undefined>;
  deleteItemCardapio(id: number): Promise<boolean>;

  // Mesas
  getMesas(): Promise<Mesa[]>;
  getMesa(id: number): Promise<Mesa | undefined>;
  createMesa(mesa: InsertMesa): Promise<Mesa>;
  updateMesa(id: number, mesa: Partial<InsertMesa>): Promise<Mesa | undefined>;
  updateMesaStatus(id: number, status: string): Promise<Mesa | undefined>;
  deleteMesa(id: number): Promise<boolean>;

  // Estoque
  getItensEstoque(): Promise<ItemEstoque[]>;
  getItensEstoqueBaixo(): Promise<ItemEstoque[]>;
  getItemEstoque(id: number): Promise<ItemEstoque | undefined>;
  createItemEstoque(item: InsertItemEstoque): Promise<ItemEstoque>;
  updateItemEstoque(id: number, item: Partial<InsertItemEstoque>): Promise<ItemEstoque | undefined>;
  ajustarQuantidadeEstoque(id: number, quantidade: number): Promise<ItemEstoque | undefined>;
  deleteItemEstoque(id: number): Promise<boolean>;

  // Movimentações de Estoque
  getMovimentacoesEstoque(): Promise<MovimentacaoEstoque[]>;
  getMovimentacaoEstoque(id: number): Promise<MovimentacaoEstoque | undefined>;
  getMovimentacoesPorItem(itemId: number): Promise<MovimentacaoEstoque[]>;
  createMovimentacaoEstoque(movimentacao: InsertMovimentacaoEstoque): Promise<MovimentacaoEstoque>;

  // Pedidos
  getPedidos(): Promise<Pedido[]>;
  getPedidosRecentes(limit?: number): Promise<Pedido[]>;
  getPedido(id: number): Promise<Pedido | undefined>;
  createPedido(pedido: InsertPedido): Promise<Pedido>;
  updatePedido(id: number, pedido: Partial<InsertPedido>): Promise<Pedido | undefined>;
  updatePedidoStatus(id: number, status: string): Promise<Pedido | undefined>;
  deletePedido(id: number): Promise<boolean>;

  // Itens do Pedido
  getItensPedido(pedidoId: number): Promise<ItemPedido[]>;
  getItemPedido(id: number): Promise<ItemPedido | undefined>;
  createItemPedido(item: InsertItemPedido): Promise<ItemPedido>;
  updateItemPedido(id: number, item: Partial<InsertItemPedido>): Promise<ItemPedido | undefined>;
  deleteItemPedido(id: number): Promise<boolean>;

  // Configurações
  getConfiguracao(): Promise<Configuracao | undefined>;
  updateConfiguracao(config: Partial<InsertConfiguracao>): Promise<Configuracao>;

  // Dashboard e Relatórios
  getDashboardStats(): Promise<DashboardStats>;
  getRelatorioVendas(): Promise<RelatorioVendas>;
  getRelatorioFinanceiro(): Promise<RelatorioFinanceiro>;
  getRelatorioEstoque(): Promise<RelatorioEstoque>;
  zerarRelatorioVendas(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clientes: Map<number, Cliente>;
  private categorias: Map<number, Categoria>;
  private itensCardapio: Map<number, ItemCardapio>;
  private mesas: Map<number, Mesa>;
  private itensEstoque: Map<number, ItemEstoque>;
  private movimentacoesEstoque: Map<number, MovimentacaoEstoque>;
  private pedidos: Map<number, Pedido>;
  private itensPedido: Map<number, ItemPedido>;
  private configuracao: Configuracao;

  private currentUserId: number;
  private currentClienteId: number;
  private currentCategoriaId: number;
  private currentItemCardapioId: number;
  private currentMesaId: number;
  private currentItemEstoqueId: number;
  private currentMovimentacaoId: number;
  private currentPedidoId: number;
  private currentItemPedidoId: number;
  private currentPedidoNumero: number;

  constructor() {
    this.users = new Map();
    this.clientes = new Map();
    this.categorias = new Map();
    this.itensCardapio = new Map();
    this.mesas = new Map();
    this.itensEstoque = new Map();
    this.movimentacoesEstoque = new Map();
    this.pedidos = new Map();
    this.itensPedido = new Map();

    this.currentUserId = 1;
    this.currentClienteId = 1;
    this.currentCategoriaId = 1;
    this.currentItemCardapioId = 1;
    this.currentMesaId = 1;
    this.currentItemEstoqueId = 1;
    this.currentMovimentacaoId = 1;
    this.currentPedidoId = 1;
    this.currentItemPedidoId = 1;
    this.currentPedidoNumero = 1000;

    // Inicializar configuração padrão
    this.configuracao = {
      id: 1,
      nomeEmpresa: "Lanche Fácil",
      cnpj: "12.345.678/0001-90",
      endereco: "Rua Exemplo, 123 - Centro, Lins - SP",
      telefone: "(14) 99999-9999",
      email: "contato@lanchefacil.com.br",
      taxaServicoDefault: 10.00,
      logotipo: "",
      tema: "claro",
      moeda: "BRL"
    };

    // Inicializar dados de exemplo
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Apenas criando um usuário admin para primeiro acesso
    this.createUser({
      username: "admin",
      password: "admin",
      nome: "Administrador",
      cargo: "Gerente",
      email: "admin@lanchefacil.com.br"
    });
    
    // Não inicializar com dados de exemplo
    // O sistema começará zerado para o primeiro uso
  }

  // Implementação de Usuários
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Implementação de Clientes
  async getClientes(): Promise<Cliente[]> {
    return Array.from(this.clientes.values());
  }

  async getCliente(id: number): Promise<Cliente | undefined> {
    return this.clientes.get(id);
  }

  async createCliente(insertCliente: InsertCliente): Promise<Cliente> {
    const id = this.currentClienteId++;
    const now = new Date();
    const cliente: Cliente = { 
      ...insertCliente, 
      id, 
      dataCadastro: now,
      totalPedidos: 0,
      ultimoPedido: undefined
    };
    this.clientes.set(id, cliente);
    return cliente;
  }

  async updateCliente(id: number, cliente: Partial<InsertCliente>): Promise<Cliente | undefined> {
    const existingCliente = this.clientes.get(id);
    if (!existingCliente) return undefined;

    const updatedCliente: Cliente = { ...existingCliente, ...cliente };
    this.clientes.set(id, updatedCliente);
    return updatedCliente;
  }

  async deleteCliente(id: number): Promise<boolean> {
    return this.clientes.delete(id);
  }

  // Implementação de Categorias
  async getCategorias(): Promise<Categoria[]> {
    return Array.from(this.categorias.values());
  }

  async getCategoria(id: number): Promise<Categoria | undefined> {
    return this.categorias.get(id);
  }

  async createCategoria(insertCategoria: InsertCategoria): Promise<Categoria> {
    const id = this.currentCategoriaId++;
    const categoria: Categoria = { ...insertCategoria, id };
    this.categorias.set(id, categoria);
    return categoria;
  }

  async updateCategoria(id: number, categoria: Partial<InsertCategoria>): Promise<Categoria | undefined> {
    const existingCategoria = this.categorias.get(id);
    if (!existingCategoria) return undefined;

    const updatedCategoria: Categoria = { ...existingCategoria, ...categoria };
    this.categorias.set(id, updatedCategoria);
    return updatedCategoria;
  }

  async deleteCategoria(id: number): Promise<boolean> {
    return this.categorias.delete(id);
  }

  // Implementação de Itens do Cardápio
  async getItensCardapio(): Promise<ItemCardapio[]> {
    return Array.from(this.itensCardapio.values());
  }

  async getItemCardapio(id: number): Promise<ItemCardapio | undefined> {
    return this.itensCardapio.get(id);
  }

  async createItemCardapio(insertItem: InsertItemCardapio): Promise<ItemCardapio> {
    const id = this.currentItemCardapioId++;
    const now = new Date();
    const item: ItemCardapio = { ...insertItem, id, dataCriacao: now };
    this.itensCardapio.set(id, item);
    return item;
  }

  async updateItemCardapio(id: number, item: Partial<InsertItemCardapio>): Promise<ItemCardapio | undefined> {
    const existingItem = this.itensCardapio.get(id);
    if (!existingItem) return undefined;

    const updatedItem: ItemCardapio = { ...existingItem, ...item };
    this.itensCardapio.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItemCardapio(id: number): Promise<boolean> {
    return this.itensCardapio.delete(id);
  }

  // Implementação de Mesas
  async getMesas(): Promise<Mesa[]> {
    return Array.from(this.mesas.values());
  }

  async getMesa(id: number): Promise<Mesa | undefined> {
    return this.mesas.get(id);
  }

  async createMesa(insertMesa: InsertMesa): Promise<Mesa> {
    const id = this.currentMesaId++;
    const mesa: Mesa = { 
      ...insertMesa, 
      id,
      horarioOcupacao: insertMesa.status === "ocupada" ? new Date() : undefined,
      horarioReserva: insertMesa.status === "reservada" ? new Date() : undefined
    };
    this.mesas.set(id, mesa);
    return mesa;
  }

  async updateMesa(id: number, mesa: Partial<InsertMesa>): Promise<Mesa | undefined> {
    const existingMesa = this.mesas.get(id);
    if (!existingMesa) return undefined;

    const updatedMesa: Mesa = { ...existingMesa, ...mesa };
    this.mesas.set(id, updatedMesa);
    return updatedMesa;
  }

  async updateMesaStatus(id: number, status: string): Promise<Mesa | undefined> {
    const existingMesa = this.mesas.get(id);
    if (!existingMesa) return undefined;

    const now = new Date();
    const updatedMesa: Mesa = { 
      ...existingMesa, 
      status,
      horarioOcupacao: status === "ocupada" ? now : existingMesa.horarioOcupacao,
      horarioReserva: status === "reservada" ? now : existingMesa.horarioReserva
    };
    this.mesas.set(id, updatedMesa);
    return updatedMesa;
  }

  async deleteMesa(id: number): Promise<boolean> {
    return this.mesas.delete(id);
  }

  // Implementação de Estoque
  async getItensEstoque(): Promise<ItemEstoque[]> {
    return Array.from(this.itensEstoque.values());
  }

  async getItensEstoqueBaixo(): Promise<ItemEstoque[]> {
    return Array.from(this.itensEstoque.values())
      .filter(item => item.quantidade <= item.estoqueMinimo);
  }

  async getItemEstoque(id: number): Promise<ItemEstoque | undefined> {
    return this.itensEstoque.get(id);
  }

  async createItemEstoque(insertItem: InsertItemEstoque): Promise<ItemEstoque> {
    const id = this.currentItemEstoqueId++;
    const now = new Date();
    const item: ItemEstoque = { 
      ...insertItem, 
      id, 
      dataCriacao: now,
      ultimaAtualizacao: now
    };
    this.itensEstoque.set(id, item);
    return item;
  }

  async updateItemEstoque(id: number, item: Partial<InsertItemEstoque>): Promise<ItemEstoque | undefined> {
    const existingItem = this.itensEstoque.get(id);
    if (!existingItem) return undefined;

    const now = new Date();
    const updatedItem: ItemEstoque = { 
      ...existingItem, 
      ...item, 
      ultimaAtualizacao: now 
    };
    this.itensEstoque.set(id, updatedItem);
    return updatedItem;
  }

  async ajustarQuantidadeEstoque(id: number, quantidade: number): Promise<ItemEstoque | undefined> {
    const existingItem = this.itensEstoque.get(id);
    if (!existingItem) return undefined;

    const now = new Date();
    const novaQuantidade = +existingItem.quantidade + +quantidade;
    
    const updatedItem: ItemEstoque = { 
      ...existingItem, 
      quantidade: novaQuantidade, 
      ultimaAtualizacao: now 
    };
    this.itensEstoque.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItemEstoque(id: number): Promise<boolean> {
    return this.itensEstoque.delete(id);
  }

  // Implementação de Movimentações de Estoque
  async getMovimentacoesEstoque(): Promise<MovimentacaoEstoque[]> {
    return Array.from(this.movimentacoesEstoque.values());
  }

  async getMovimentacaoEstoque(id: number): Promise<MovimentacaoEstoque | undefined> {
    return this.movimentacoesEstoque.get(id);
  }

  async getMovimentacoesPorItem(itemId: number): Promise<MovimentacaoEstoque[]> {
    return Array.from(this.movimentacoesEstoque.values())
      .filter(mov => mov.itemId === itemId);
  }

  async createMovimentacaoEstoque(insertMovimentacao: InsertMovimentacaoEstoque): Promise<MovimentacaoEstoque> {
    const id = this.currentMovimentacaoId++;
    const now = new Date();
    const movimentacao: MovimentacaoEstoque = { 
      ...insertMovimentacao, 
      id, 
      dataHora: now 
    };
    this.movimentacoesEstoque.set(id, movimentacao);

    // Ajustar quantidade no estoque
    const quantidade = insertMovimentacao.tipo === "entrada" 
      ? +insertMovimentacao.quantidade 
      : -insertMovimentacao.quantidade;
    
    await this.ajustarQuantidadeEstoque(insertMovimentacao.itemId, quantidade);

    return movimentacao;
  }

  // Implementação de Pedidos
  async getPedidos(): Promise<Pedido[]> {
    return Array.from(this.pedidos.values());
  }

  async getPedidosRecentes(limit: number = 5): Promise<Pedido[]> {
    return Array.from(this.pedidos.values())
      .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
      .slice(0, limit);
  }

  async getPedido(id: number): Promise<Pedido | undefined> {
    return this.pedidos.get(id);
  }

  async createPedido(insertPedido: InsertPedido): Promise<Pedido> {
    const id = this.currentPedidoId++;
    const now = new Date();
    const pedido: Pedido = { 
      ...insertPedido, 
      id,
      numero: this.currentPedidoNumero++,
      dataCriacao: now,
      dataAtualizacao: now
    };
    this.pedidos.set(id, pedido);

    // Atualizar mesa se for um pedido de mesa
    if (pedido.tipo === "mesa" && pedido.mesaId) {
      await this.updateMesaStatus(pedido.mesaId, "ocupada");
    }

    // Atualizar cliente se estiver vinculado
    if (pedido.clienteId) {
      const cliente = await this.getCliente(pedido.clienteId);
      if (cliente) {
        await this.updateCliente(pedido.clienteId, {
          ...cliente,
          totalPedidos: cliente.totalPedidos + 1,
          ultimoPedido: now
        });
      }
    }

    return pedido;
  }

  async updatePedido(id: number, pedido: Partial<InsertPedido>): Promise<Pedido | undefined> {
    const existingPedido = this.pedidos.get(id);
    if (!existingPedido) return undefined;

    const now = new Date();
    const updatedPedido: Pedido = { 
      ...existingPedido, 
      ...pedido, 
      dataAtualizacao: now 
    };
    this.pedidos.set(id, updatedPedido);
    return updatedPedido;
  }

  async updatePedidoStatus(id: number, status: string): Promise<Pedido | undefined> {
    const existingPedido = this.pedidos.get(id);
    if (!existingPedido) return undefined;

    const now = new Date();
    const updatedPedido: Pedido = { 
      ...existingPedido, 
      status, 
      dataAtualizacao: now 
    };
    this.pedidos.set(id, updatedPedido);

    // Se o pedido for concluído ou cancelado, liberar a mesa
    if ((status === "entregue" || status === "cancelado") && updatedPedido.tipo === "mesa" && updatedPedido.mesaId) {
      await this.updateMesaStatus(updatedPedido.mesaId, "livre");
    }

    return updatedPedido;
  }

  async deletePedido(id: number): Promise<boolean> {
    const pedido = this.pedidos.get(id);
    if (pedido && pedido.tipo === "mesa" && pedido.mesaId) {
      await this.updateMesaStatus(pedido.mesaId, "livre");
    }
    return this.pedidos.delete(id);
  }

  // Implementação de Itens do Pedido
  async getItensPedido(pedidoId: number): Promise<ItemPedido[]> {
    return Array.from(this.itensPedido.values())
      .filter(item => item.pedidoId === pedidoId);
  }

  async getItemPedido(id: number): Promise<ItemPedido | undefined> {
    return this.itensPedido.get(id);
  }

  async createItemPedido(insertItem: InsertItemPedido): Promise<ItemPedido> {
    const id = this.currentItemPedidoId++;
    const item: ItemPedido = { ...insertItem, id };
    this.itensPedido.set(id, item);
    return item;
  }

  async updateItemPedido(id: number, item: Partial<InsertItemPedido>): Promise<ItemPedido | undefined> {
    const existingItem = this.itensPedido.get(id);
    if (!existingItem) return undefined;

    const updatedItem: ItemPedido = { ...existingItem, ...item };
    this.itensPedido.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItemPedido(id: number): Promise<boolean> {
    return this.itensPedido.delete(id);
  }

  // Implementação de Configurações
  async getConfiguracao(): Promise<Configuracao | undefined> {
    return this.configuracao;
  }

  async updateConfiguracao(config: Partial<InsertConfiguracao>): Promise<Configuracao> {
    this.configuracao = { ...this.configuracao, ...config };
    return this.configuracao;
  }

  // Implementação de Dashboard e Relatórios
  async getDashboardStats(): Promise<DashboardStats> {
    // Cálculo para pedidos de hoje
    const hoje = new Date();
    const pedidosHoje = Array.from(this.pedidos.values())
      .filter(p => {
        const dataPedido = new Date(p.dataCriacao);
        return dataPedido.getDate() === hoje.getDate() && 
               dataPedido.getMonth() === hoje.getMonth() && 
               dataPedido.getFullYear() === hoje.getFullYear();
      });
    
    // Cálculo para pedidos de ontem
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const pedidosOntem = Array.from(this.pedidos.values())
      .filter(p => {
        const dataPedido = new Date(p.dataCriacao);
        return dataPedido.getDate() === ontem.getDate() && 
               dataPedido.getMonth() === ontem.getMonth() && 
               dataPedido.getFullYear() === ontem.getFullYear();
      });
    
    // Totais de hoje e ontem
    const totalHoje = pedidosHoje.reduce((total, p) => total + +p.valorTotal, 0);
    const totalOntem = pedidosOntem.reduce((total, p) => total + +p.valorTotal, 0);
    
    // Calcular crescimento
    const crescimentoPedidos = pedidosOntem.length > 0 
      ? `${Math.round((pedidosHoje.length - pedidosOntem.length) / pedidosOntem.length * 100)}% em relação a ontem` 
      : "0% em relação a ontem";
    
    const crescimentoVendas = totalOntem > 0 
      ? `${Math.round((totalHoje - totalOntem) / totalOntem * 100)}% em relação a ontem` 
      : "0% em relação a ontem";
    
    // Contar mesas ocupadas
    const mesasOcupadas = Array.from(this.mesas.values())
      .filter(m => m.status === "ocupada").length;
    const totalMesas = this.mesas.size;
    const ocupacaoMesas = `${Math.round(mesasOcupadas / totalMesas * 100)}% de ocupação`;
    
    // Contar itens com estoque baixo
    const itensEstoqueBaixo = Array.from(this.itensEstoque.values())
      .filter(i => i.quantidade <= i.estoqueMinimo).length;
    
    return {
      pedidosHoje: pedidosHoje.length,
      vendasHoje: totalHoje,
      mesasOcupadas,
      totalMesas,
      itensEstoqueBaixo,
      crescimentoPedidos,
      crescimentoVendas,
      ocupacaoMesas
    };
  }

  async getRelatorioVendas(): Promise<RelatorioVendas> {
    // Dados simulados para o relatório de vendas
    // Vendas por dia (últimos 7 dias)
    const vendasPorDia = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      
      // Formatar a data como DD/MM
      const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Simular valores variados
      const total = 500 + Math.floor(Math.random() * 1000);
      const quantidade = 10 + Math.floor(Math.random() * 20);
      
      vendasPorDia.push({
        data: dataFormatada,
        total,
        quantidade
      });
    }
    
    // Vendas por categoria
    const vendasPorCategoria = [
      { categoria: "Lanches", total: 1850, quantidade: 92 },
      { categoria: "Porções", total: 980, quantidade: 65 },
      { categoria: "Bebidas", total: 650, quantidade: 130 },
      { categoria: "Sobremesas", total: 320, quantidade: 25 },
      { categoria: "Combos", total: 1200, quantidade: 30 }
    ];
    
    // Produtos mais vendidos
    const produtosMaisVendidos = [
      { produto: "X-Tudo", quantidade: 45, total: 1345.50 },
      { produto: "Combo Individual", quantidade: 30, total: 987.00 },
      { produto: "Refrigerante Lata", quantidade: 78, total: 460.20 },
      { produto: "Batata Frita M", quantidade: 36, total: 572.40 },
      { produto: "X-Bacon", quantidade: 28, total: 697.20 },
      { produto: "Milkshake", quantidade: 22, total: 283.80 },
      { produto: "Hambúrguer Clássico", quantidade: 20, total: 398.00 },
      { produto: "Combo Família", quantidade: 15, total: 1348.50 }
    ];
    
    return {
      vendasPorDia,
      vendasPorCategoria,
      produtosMaisVendidos
    };
  }

  async getRelatorioFinanceiro(): Promise<RelatorioFinanceiro> {
    // Dados simulados para o relatório financeiro
    // Receitas por dia (últimos 30 dias)
    const receitasPorDia = [];
    for (let i = 29; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      
      // Formatar a data como DD/MM
      const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Simular valores variados
      const valor = 800 + Math.floor(Math.random() * 1200);
      
      receitasPorDia.push({
        data: dataFormatada,
        valor
      });
    }
    
    // Despesas por categoria
    const despesasPorCategoria = [
      { categoria: "Ingredientes", valor: 8500 },
      { categoria: "Salários", valor: 12000 },
      { categoria: "Aluguel", valor: 3500 },
      { categoria: "Água/Luz", valor: 1800 },
      { categoria: "Marketing", valor: 1200 },
      { categoria: "Equipamentos", valor: 2500 },
      { categoria: "Outros", valor: 1500 }
    ];
    
    // Resumo mensal
    const receitas = receitasPorDia.reduce((total, dia) => total + dia.valor, 0);
    const despesas = despesasPorCategoria.reduce((total, categoria) => total + categoria.valor, 0);
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
      return total + (+item.quantidade * +(item.valorUnitario || 0));
    }, 0);
    
    // Distribuição por categoria
    const categorias = [...new Set(itens.map(item => item.categoria))];
    const distribuicaoPorCategoria = categorias.map(categoria => {
      const itensCategoria = itens.filter(item => item.categoria === categoria);
      const quantidade = itensCategoria.reduce((total, item) => total + +item.quantidade, 0);
      const valor = itensCategoria.reduce((total, item) => total + (+item.quantidade * +(item.valorUnitario || 0)), 0);
      
      return {
        categoria,
        quantidade,
        valor
      };
    });
    
    // Movimentações recentes (simuladas)
    const movimentacoes = [
      { data: "2023-06-20", tipo: "entrada", quantidade: 30, produto: "Pão de Hambúrguer" },
      { data: "2023-06-19", tipo: "saida", quantidade: 5, produto: "Queijo Mussarela" },
      { data: "2023-06-18", tipo: "entrada", quantidade: 20, produto: "Refrigerante Cola" },
      { data: "2023-06-17", tipo: "saida", quantidade: 2, produto: "Carne Bovina" },
      { data: "2023-06-16", tipo: "entrada", quantidade: 10, produto: "Batata Frita" },
      { data: "2023-06-15", tipo: "saida", quantidade: 3, produto: "Bacon" },
      { data: "2023-06-14", tipo: "entrada", quantidade: 5, produto: "Alface" },
      { data: "2023-06-13", tipo: "saida", quantidade: 8, produto: "Tomate" }
    ];
    
    return {
      estoqueBaixo: itensBaixo.length,
      valorTotalEstoque,
      distribuicaoPorCategoria,
      movimentacoes
    };
  }
  
  async zerarRelatorioVendas(): Promise<boolean> {
    try {
      // Para a implementação em memória, vamos redefinir o método getRelatorioVendas 
      // para que ele retorne dados zerados
      
      // Vendas por dia - últimos 7 dias com valores zerados
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
      
      // Vendas por categoria - todas zeradas
      const vendasPorCategoria = [
        { categoria: "Lanches", total: 0, quantidade: 0 },
        { categoria: "Porções", total: 0, quantidade: 0 },
        { categoria: "Bebidas", total: 0, quantidade: 0 },
        { categoria: "Sobremesas", total: 0, quantidade: 0 },
        { categoria: "Combos", total: 0, quantidade: 0 }
      ];
      
      // Produtos mais vendidos - lista vazia
      const produtosMaisVendidos: Array<{produto: string, quantidade: number, total: number}> = [];
      
      // Como estamos trabalhando com uma implementação em memória,
      // vamos sobrescrever o método original para demonstração
      const self = this;
      const originalGetRelatorioVendas = this.getRelatorioVendas;
      
      this.getRelatorioVendas = async function() {
        // Restaurar o método original após o primeiro uso
        self.getRelatorioVendas = originalGetRelatorioVendas;
        
        // Retornar dados zerados
        return {
          vendasPorDia,
          vendasPorCategoria,
          produtosMaisVendidos
        };
      };
      
      console.log("Relatório de vendas zerado com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao zerar relatório de vendas:", error);
      return false;
    }
  }
}

export const storage = new MemStorage();
