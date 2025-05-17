import { useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { type Mesa } from "@shared/schema";

interface ItemProduto {
  id: number;
  nome: string;
  preco: string;
  quantidade: number;
  observacoes?: string;
}

interface ProdutosMesaDialogProps {
  mesa: Mesa;
  trigger?: React.ReactNode;
}

export function ProdutosMesaDialog({ mesa, trigger }: ProdutosMesaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemSelecionadoId, setItemSelecionadoId] = useState<number | undefined>(undefined);
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [itensSelecionados, setItensSelecionados] = useState<ItemProduto[]>([]);
  
  // Use uma ref para o botão trigger personalizado
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Buscar itens do cardápio
  const { data: itensCardapio = [] } = useQuery({
    queryKey: ['/api/cardapio'],
  });
  
  // Filtrar apenas itens disponíveis
  const itensDisponiveis = (itensCardapio as any[]).filter(item => item.disponivel);
  
  // Item selecionado atual
  const itemAtual = itensDisponiveis.find(item => item.id === itemSelecionadoId);
  
  // Valor total
  const valorTotal = itensSelecionados.reduce(
    (total, item) => total + parseFloat(item.preco) * item.quantidade, 
    0
  );
  
  // Adicionar item à lista
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
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade,
        observacoes: observacoes || undefined
      }
    ]);
    
    // Limpar os campos após adicionar
    setItemSelecionadoId(undefined);
    setQuantidade(1);
    setObservacoes("");
  };
  
  // Remover item da lista
  const removerItem = (index: number) => {
    setItensSelecionados(prev => prev.filter((_, i) => i !== index));
  };
  
  // Criar pedido
  const criarPedido = async () => {
    if (itensSelecionados.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Adicione ao menos um item para criar o pedido.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Verificar se a mesa já tem um pedido em aberto
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
        const novoPedido = {
          tipo: "mesa",
          mesaId: mesa.id,
          nomeCliente: "",
          observacoes: "",
          status: "em preparo"
        };
        
        const pedidoResponse = await apiRequest("POST", "/api/pedidos", novoPedido);
        pedidoId = pedidoResponse.id;
      }
      
      // 2. Adicionar itens ao pedido
      for (const item of itensSelecionados) {
        await apiRequest("POST", "/api/pedidos/itens", {
          pedidoId: pedidoId,
          itemCardapioId: item.id,
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
      await queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Pedido criado com sucesso",
        description: `Os itens foram adicionados à Mesa ${mesa.numero}.`,
      });
      
      // Fechar o diálogo e resetar formulário
      setOpen(false);
      setItensSelecionados([]);
      setItemSelecionadoId(undefined);
      setQuantidade(1);
      setObservacoes("");
      
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro ao tentar criar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para fechar o diálogo
  const fecharDialog = () => {
    setOpen(false);
    setItensSelecionados([]);
    setItemSelecionadoId(undefined);
    setQuantidade(1);
    setObservacoes("");
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="default"
            onClick={() => setOpen(true)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Produtos
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Produtos à Mesa {mesa.numero}</DialogTitle>
          <DialogDescription>
            Selecione os produtos para adicionar à mesa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="produto">Produto</Label>
            <Select 
              value={itemSelecionadoId?.toString() || ""}
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
          
          <div className="grid grid-cols-2 gap-4">
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
            
            <div className="flex items-end">
              <Button 
                onClick={adicionarItem}
                disabled={!itemSelecionadoId}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
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
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="font-medium">Itens Selecionados</h3>
            
            {itensSelecionados.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum item adicionado
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {itensSelecionados.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{item.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantidade}x {formatCurrency(parseFloat(item.preco))}
                          </div>
                          {item.observacoes && (
                            <div className="text-xs text-muted-foreground mt-1">
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
                            className="h-8 w-8 p-0"
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
            
            {itensSelecionados.length > 0 && (
              <div className="font-bold text-right">
                Total: {formatCurrency(valorTotal)}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={fecharDialog}
            type="button"
          >
            Cancelar
          </Button>
          <Button 
            onClick={criarPedido} 
            disabled={isSubmitting || itensSelecionados.length === 0}
            type="button"
          >
            {isSubmitting ? (
              "Criando pedido..."
            ) : (
              "Criar Pedido"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}