import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency, calculateTotal } from "@/lib/utils";
import { PedidoItem } from "@/components/pedidos/pedido-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { type ItemCardapio, type Cliente, type Mesa } from "@shared/schema";

interface NovoPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoPedidoDialog({ open, onOpenChange }: NovoPedidoDialogProps) {
  // Estado do pedido
  const [tipoPedido, setTipoPedido] = useState<"balcao" | "mesa">("balcao");
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null);
  const [nomeCliente, setNomeCliente] = useState<string>("");
  const [filtroCliente, setFiltroCliente] = useState<string>("");
  const [formaPagamento, setFormaPagamento] = useState<string>("dinheiro");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todos");
  const [itensPedido, setItensPedido] = useState<Array<{
    itemCardapioId: number;
    nome: string;
    preco: number;
    quantidade: number;
    observacoes?: string;
  }>>([]);
  const [taxaServico, setTaxaServico] = useState<number>(10); // 10%
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Queries
  const { data: itensCardapio, isLoading: isLoadingCardapio } = useQuery<ItemCardapio[]>({
    queryKey: ['/api/cardapio'],
  });

  const { data: mesas, isLoading: isLoadingMesas } = useQuery<Mesa[]>({
    queryKey: ['/api/mesas'],
  });

  const { data: clientes, isLoading: isLoadingClientes } = useQuery<Cliente[]>({
    queryKey: ['/api/clientes'],
  });

  // Obter categorias únicas
  const categorias = itensCardapio
    ? [...new Set(itensCardapio.map(item => item.categoria))]
    : [];

  // Filtrar itens por categoria
  const itensFiltrados = itensCardapio?.filter(item => {
    return categoriaAtiva === "todos" || item.categoria.toLowerCase() === categoriaAtiva.toLowerCase();
  });

  // Filtrar clientes por texto
  const clientesFiltrados = clientes?.filter(cliente => {
    return cliente.nome.toLowerCase().includes(filtroCliente.toLowerCase()) ||
           cliente.telefone.includes(filtroCliente);
  }).slice(0, 5); // Limitar a 5 resultados

  // Calcular totais
  const subtotal = calculateTotal(itensPedido);
  const valorTaxaServico = tipoPedido === "mesa" ? subtotal * (taxaServico / 100) : 0;
  const total = subtotal + valorTaxaServico;

  // Atualizar nome do cliente quando o cliente selecionado mudar
  useEffect(() => {
    if (clienteSelecionado && clientes) {
      const cliente = clientes.find(c => c.id === clienteSelecionado);
      if (cliente) {
        setNomeCliente(cliente.nome);
      }
    }
  }, [clienteSelecionado, clientes]);

  // Adicionar item ao pedido
  const adicionarItem = (item: ItemCardapio) => {
    // Verificar se o item já existe no pedido
    const itemExistente = itensPedido.findIndex(i => i.itemCardapioId === item.id);
    
    if (itemExistente !== -1) {
      // Aumentar quantidade
      const novoItens = [...itensPedido];
      novoItens[itemExistente].quantidade += 1;
      setItensPedido(novoItens);
    } else {
      // Adicionar novo item
      setItensPedido([...itensPedido, {
        itemCardapioId: item.id,
        nome: item.nome,
        preco: +item.preco,
        quantidade: 1
      }]);
    }
  };

  // Remover item do pedido
  const removerItem = (index: number) => {
    const novoItens = [...itensPedido];
    novoItens.splice(index, 1);
    setItensPedido(novoItens);
  };

  // Atualizar quantidade do item
  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade < 1) return;
    
    const novoItens = [...itensPedido];
    novoItens[index].quantidade = novaQuantidade;
    setItensPedido(novoItens);
  };

  // Finalizar pedido
  const finalizarPedido = async () => {
    // Validações
    if (itensPedido.length === 0) {
      toast({
        title: "Pedido vazio",
        description: "Adicione pelo menos um item ao pedido.",
        variant: "destructive",
      });
      return;
    }

    if (tipoPedido === "mesa" && !mesaSelecionada) {
      toast({
        title: "Mesa não selecionada",
        description: "Selecione uma mesa para o pedido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Criar pedido
      const pedidoData = {
        tipo: tipoPedido,
        mesaId: tipoPedido === "mesa" ? mesaSelecionada : null,
        clienteId: clienteSelecionado,
        nomeCliente: nomeCliente || "Cliente balcão",
        valorTotal: total,
        taxaServico: valorTaxaServico,
        formaPagamento,
        status: "novo",
      };

      const response = await apiRequest("POST", "/api/pedidos", pedidoData);
      const pedidoCriado = await response.json();

      // Adicionar itens ao pedido
      for (const item of itensPedido) {
        await apiRequest("POST", `/api/pedidos/${pedidoCriado.id}/itens`, {
          itemCardapioId: item.itemCardapioId,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          observacoes: item.observacoes || "",
        });
      }

      // Atualizar queries
      await queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });

      // Fechar modal e limpar estado
      toast({
        title: "Pedido criado",
        description: `Pedido #${pedidoCriado.numero} criado com sucesso.`,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro ao criar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setTipoPedido("balcao");
    setMesaSelecionada(null);
    setClienteSelecionado(null);
    setNomeCliente("");
    setFiltroCliente("");
    setFormaPagamento("dinheiro");
    setCategoriaAtiva("todos");
    setItensPedido([]);
  };

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      if (!newState) {
        resetForm();
      }
      onOpenChange(newState);
    }}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Adicione os itens do pedido e preencha as informações necessárias.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Itens do Cardápio */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Itens do Cardápio</h3>
                
                {/* Categorias */}
                <div className="flex overflow-x-auto pb-2 mb-4">
                  <Button 
                    variant={categoriaAtiva === "todos" ? "default" : "outline"}
                    className="mr-2 whitespace-nowrap"
                    onClick={() => setCategoriaAtiva("todos")}
                  >
                    Todos
                  </Button>
                  {categorias.map(categoria => (
                    <Button 
                      key={categoria} 
                      variant={categoriaAtiva === categoria.toLowerCase() ? "default" : "outline"}
                      className="mr-2 whitespace-nowrap"
                      onClick={() => setCategoriaAtiva(categoria.toLowerCase())}
                    >
                      {categoria}
                    </Button>
                  ))}
                </div>
                
                {/* Lista de Itens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoadingCardapio ? (
                    // Skeleton loader para itens em carregamento
                    Array(6).fill(0).map((_, index) => (
                      <div key={index} className="border border-neutral-light rounded-lg p-3 flex">
                        <Skeleton className="h-20 w-20 rounded-md" />
                        <div className="ml-3 flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-full mb-2" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                    ))
                  ) : itensFiltrados && itensFiltrados.length > 0 ? (
                    itensFiltrados.map(item => (
                      <div 
                        key={item.id} 
                        className="border border-neutral-light rounded-lg p-3 flex cursor-pointer hover:shadow-md"
                        onClick={() => adicionarItem(item)}
                      >
                        {/* Imagem ou ícone do item */}
                        <div className="w-20 h-20 bg-neutral-light rounded-md flex items-center justify-center">
                          <i className="fas fa-hamburger text-2xl text-neutral-medium"></i>
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="font-medium text-neutral-darkest">{item.nome}</h4>
                          <p className="text-sm text-neutral-dark mb-2 line-clamp-2">{item.descricao}</p>
                          <p className="font-bold text-primary">{formatCurrency(+item.preco)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 text-neutral-dark">
                      Nenhum item encontrado nesta categoria.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Coluna Direita - Resumo do Pedido */}
            <div className="bg-neutral-lightest rounded-lg p-5">
              <h3 className="font-heading font-semibold text-lg mb-4">Resumo do Pedido</h3>
              
              {/* Tipo de Pedido */}
              <div className="mb-4">
                <Label className="font-medium mb-2 block">Tipo de Pedido</Label>
                <RadioGroup 
                  value={tipoPedido} 
                  onValueChange={(value) => setTipoPedido(value as "balcao" | "mesa")}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className={`flex items-center justify-center p-3 rounded-lg cursor-pointer ${
                    tipoPedido === "balcao" 
                      ? "border border-primary bg-primary/10" 
                      : "border border-neutral-medium"
                  }`}>
                    <RadioGroupItem value="balcao" id="balcao" className="mr-2" />
                    <Label htmlFor="balcao" className="cursor-pointer">Balcão</Label>
                  </div>
                  <div className={`flex items-center justify-center p-3 rounded-lg cursor-pointer ${
                    tipoPedido === "mesa" 
                      ? "border border-primary bg-primary/10" 
                      : "border border-neutral-medium"
                  }`}>
                    <RadioGroupItem value="mesa" id="mesa" className="mr-2" />
                    <Label htmlFor="mesa" className="cursor-pointer">Mesa</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Seleção de Mesa (se tipo = mesa) */}
              {tipoPedido === "mesa" && (
                <div className="mb-4">
                  <Label className="font-medium mb-2 block">Mesa</Label>
                  <Select 
                    value={mesaSelecionada?.toString() || ""} 
                    onValueChange={(value) => setMesaSelecionada(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma mesa" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingMesas ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : mesas && mesas.length > 0 ? (
                        mesas
                          .filter(mesa => mesa.status === "livre")
                          .map(mesa => (
                            <SelectItem key={mesa.id} value={mesa.id.toString()}>
                              Mesa {mesa.numero} ({mesa.capacidade} lugares)
                            </SelectItem>
                          ))
                      ) : (
                        <div className="p-2 text-center text-neutral-dark">
                          Nenhuma mesa disponível
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Itens do Pedido */}
              <div className="mb-4">
                <Label className="font-medium mb-2 block">Itens do Pedido</Label>
                <div className="border border-neutral-medium rounded-lg divide-y divide-neutral-light bg-white">
                  {itensPedido.length > 0 ? (
                    itensPedido.map((item, index) => (
                      <PedidoItem
                        key={`${item.itemCardapioId}-${index}`}
                        item={{
                          id: index,
                          pedidoId: 0,
                          itemCardapioId: item.itemCardapioId,
                          nome: item.nome,
                          preco: item.preco,
                          quantidade: item.quantidade,
                          observacoes: item.observacoes
                        }}
                        onRemove={() => removerItem(index)}
                        onUpdateQuantidade={(_, quantidade) => atualizarQuantidade(index, quantidade)}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-neutral-dark">
                      Nenhum item adicionado
                    </div>
                  )}
                </div>
              </div>
              
              {/* Cliente */}
              <div className="mb-4">
                <Label className="font-medium mb-2 block">Cliente</Label>
                <div className="relative">
                  <Input
                    placeholder="Procurar cliente..."
                    value={filtroCliente}
                    onChange={(e) => setFiltroCliente(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-dark h-4 w-4" />
                  
                  {/* Resultados da busca */}
                  {filtroCliente && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-neutral-light rounded-md shadow-md max-h-48 overflow-y-auto">
                      {isLoadingClientes ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : clientesFiltrados && clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map(cliente => (
                          <div 
                            key={cliente.id}
                            className="p-2 hover:bg-neutral-lightest cursor-pointer"
                            onClick={() => {
                              setClienteSelecionado(cliente.id);
                              setNomeCliente(cliente.nome);
                              setFiltroCliente("");
                            }}
                          >
                            <div className="font-medium">{cliente.nome}</div>
                            <div className="text-xs text-neutral-dark">{cliente.telefone}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-neutral-dark">
                          Nenhum cliente encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Cliente selecionado */}
                {clienteSelecionado && (
                  <div className="mt-2 p-2 bg-primary/10 rounded-md flex justify-between items-center">
                    <span>{nomeCliente}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setClienteSelecionado(null);
                        setNomeCliente("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {/* Nome do cliente (para pedidos sem cadastro) */}
                {!clienteSelecionado && (
                  <div className="mt-2">
                    <Input
                      placeholder="Nome do cliente (opcional)"
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              {/* Forma de Pagamento */}
              <div className="mb-4">
                <Label className="font-medium mb-2 block">Forma de Pagamento</Label>
                <Select 
                  value={formaPagamento}
                  onValueChange={(value) => setFormaPagamento(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Totais */}
              <div className="mb-6 border-t border-neutral-medium pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {tipoPedido === "mesa" && (
                  <div className="flex justify-between mb-2">
                    <span>Taxa de serviço ({taxaServico}%)</span>
                    <span className="font-medium">{formatCurrency(valorTaxaServico)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition focus:outline-none font-medium"
                onClick={finalizarPedido}
                disabled={isSubmitting || itensPedido.length === 0 || (tipoPedido === "mesa" && !mesaSelecionada)}
              >
                {isSubmitting ? "Processando..." : "Finalizar Pedido"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
