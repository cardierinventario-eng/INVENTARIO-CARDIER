import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { type Mesa, type ItemCardapio } from "@shared/schema";

interface ItemSelecionado {
  itemCardapioId: number;
  nome: string;
  preco: string;
  quantidade: number;
  observacoes?: string;
}

interface AdicionarProdutosMesaDialogProps {
  mesa: Mesa;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export function AdicionarProdutosMesaDialog({
  mesa,
  onClose,
  trigger
}: AdicionarProdutosMesaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);
  const [itemSelecionadoId, setItemSelecionadoId] = useState<number>(0);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [observacoes, setObservacoes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Buscar itens do cardápio
  const { data: itensCardapio = [] } = useQuery<ItemCardapio[]>({
    queryKey: ['/api/cardapio'],
  });

  // Filtrar apenas itens disponíveis
  const itensDisponiveis = itensCardapio.filter(item => item.disponivel);

  // Item selecionado atual
  const itemAtual = itensDisponiveis.find(item => item.id === itemSelecionadoId);
  
  // Valor total do pedido
  const valorTotal = itensSelecionados.reduce(
    (total, item) => total + parseFloat(item.preco) * item.quantidade, 
    0
  );

  // Limpar os campos ao abrir/fechar o diálogo
  useEffect(() => {
    // Reset apenas quando o diálogo é fechado, não quando é aberto
    if (isOpen === false) {
      // Pequeno timeout para garantir que o componente não está mais renderizando
      // quando limparmos os valores, evitando erros de removeChild
      const timer = setTimeout(() => {
        setItensSelecionados([]);
        setItemSelecionadoId(0);
        setQuantidade(1);
        setObservacoes("");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Função para adicionar item à lista
  const adicionarItem = () => {
    if (!itemSelecionadoId) {
      toast({
        title: "Item não selecionado",
        description: "Selecione um item do cardápio para adicionar.",
        variant: "destructive",
      });
      return;
    }

    const item = itensDisponiveis.find(i => i.id === itemSelecionadoId);
    if (!item) return;

    // Adicionar item à lista
    setItensSelecionados(prev => [
      ...prev, 
      {
        itemCardapioId: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade,
        observacoes: observacoes || undefined
      }
    ]);

    // Limpar os campos após adicionar
    setItemSelecionadoId(0);
    setQuantidade(1);
    setObservacoes("");
  };

  // Remover item da lista
  const removerItem = (index: number) => {
    setItensSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  // Criar pedido com os itens selecionados
  const criarPedido = async () => {
    if (itensSelecionados.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Adicione ao menos um item para criar o pedido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se a mesa já tem um pedido em aberto
      const pedidosResponse = await apiRequest("GET", "/api/pedidos");
      const pedidosExistentes = Array.isArray(pedidosResponse) ? pedidosResponse : [];
      
      // Buscar pedido da mesa que não esteja finalizado
      const pedidoExistente = pedidosExistentes.find(p => 
        p.mesaId === mesa.id && 
        p.status !== 'finalizado' && 
        p.status !== 'cancelado'
      );
      
      let pedidoId;
      
      if (pedidoExistente) {
        // Se já existe um pedido, usar ele
        pedidoId = pedidoExistente.id;
      } else {
        // Se não existe, criar um novo pedido
        const pedidoResponse = await apiRequest("POST", "/api/pedidos", {
          tipo: "mesa",
          mesaId: mesa.id,
          nomeCliente: "",
          observacoes: "",
          status: "em preparo"
        });
        
        pedidoId = pedidoResponse.id;
      }

      // 2. Adicionar itens ao pedido
      for (const item of itensSelecionados) {
        await apiRequest("POST", "/api/pedidos/itens", {
          pedidoId: pedidoId,
          itemCardapioId: item.itemCardapioId,
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          observacoes: item.observacoes
        });
      }

      // 3. Atualizar status da mesa (garantir que esteja como ocupada)
      if (mesa.status.toLowerCase() !== 'ocupada') {
        await apiRequest("PATCH", `/api/mesas/${mesa.id}/status`, { 
          status: "ocupada" 
        });
      }

      // 4. Invalidar queries para atualizar os dados
      await queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });

      toast({
        title: "Pedido criado com sucesso",
        description: `O pedido foi criado para a Mesa ${mesa.numero}.`,
      });

      // Fechar o diálogo
      setIsOpen(false);
      if (onClose) onClose();
      
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro ao tentar criar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Controle de abertura/fechamento mais seguro
      if (!open && isLoading) {
        // Impedir fechamento durante operações em andamento
        return;
      }
      setIsOpen(open);
    }}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" /> Adicionar Produtos
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Produtos à Mesa {mesa.numero}</DialogTitle>
          <DialogDescription>
            Selecione os produtos para adicionar à mesa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Lado esquerdo - Seleção de produtos */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Select 
                value={itemSelecionadoId ? itemSelecionadoId.toString() : ""}
                onValueChange={(value) => setItemSelecionadoId(parseInt(value))}
              >
                <SelectTrigger id="produto">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {itensDisponiveis.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nome} - {formatCurrency(parseFloat(item.preco))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Ex: Sem cebola, bem passado, etc."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full gap-2"
              onClick={adicionarItem}
              disabled={!itemSelecionadoId}
            >
              <PlusCircle className="h-4 w-4" /> Adicionar Item
            </Button>
          </div>
          
          {/* Lado direito - Itens selecionados */}
          <div className="flex flex-col h-full">
            <h3 className="font-medium mb-2">Itens Selecionados</h3>
            <div className="flex-1 overflow-y-auto max-h-[300px] border rounded-md p-2">
              {itensSelecionados.length === 0 ? (
                <div className="text-center py-8 text-neutral-dark">
                  Nenhum item adicionado
                </div>
              ) : (
                <div className="space-y-2">
                  {itensSelecionados.map((item, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item.nome}</div>
                            <div className="text-sm text-neutral-dark">
                              Qtd: {item.quantidade} x {formatCurrency(parseFloat(item.preco))}
                            </div>
                            {item.observacoes && (
                              <div className="text-xs text-neutral-medium mt-1">
                                Obs: {item.observacoes}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              {formatCurrency(parseFloat(item.preco) * item.quantidade)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => removerItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remover</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {itensSelecionados.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="font-medium text-right mb-2">
                  Total: {formatCurrency(valorTotal)}
                </div>
              </>
            )}
            
            <Button 
              variant="default" 
              className="w-full gap-2 mt-2"
              onClick={criarPedido}
              disabled={isLoading || itensSelecionados.length === 0}
            >
              <ShoppingCart className="h-4 w-4" />
              {isLoading ? "Processando..." : "Criar Pedido para a Mesa"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}