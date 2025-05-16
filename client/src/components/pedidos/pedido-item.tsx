import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { type ItemPedido } from "@shared/schema";

interface PedidoItemProps {
  item: ItemPedido;
  editable?: boolean;
  onRemove?: () => void;
  onUpdateQuantidade?: (itemId: number, quantidade: number) => void;
}

export function PedidoItem({ 
  item, 
  editable = true, 
  onRemove,
  onUpdateQuantidade
}: PedidoItemProps) {
  const handleRemoveItem = async () => {
    if (!editable) return;
    
    if (onRemove) {
      onRemove();
      return;
    }
    
    try {
      await apiRequest("DELETE", `/api/pedidos/itens/${item.id}`);
      await queryClient.invalidateQueries({ queryKey: [`/api/pedidos/${item.pedidoId}/itens`] });
      
      toast({
        title: "Item removido",
        description: "O item foi removido do pedido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast({
        title: "Erro ao remover item",
        description: "Ocorreu um erro ao remover o item do pedido.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantidade = async (novaQuantidade: number) => {
    if (!editable || novaQuantidade < 1) return;
    
    if (onUpdateQuantidade) {
      onUpdateQuantidade(item.id, novaQuantidade);
      return;
    }
    
    try {
      await apiRequest("PATCH", `/api/pedidos/itens/${item.id}`, {
        quantidade: novaQuantidade
      });
      await queryClient.invalidateQueries({ queryKey: [`/api/pedidos/${item.pedidoId}/itens`] });
      
      toast({
        title: "Quantidade atualizada",
        description: "A quantidade foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: "Ocorreu um erro ao atualizar a quantidade do item.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-3 flex justify-between items-center border-b border-neutral-light">
      <div>
        <p className="font-medium">{item.nome}</p>
        <p className="text-xs text-neutral-dark">
          {item.quantidade} x {formatCurrency(item.preco)}
        </p>
        {item.observacoes && (
          <p className="text-xs text-neutral-dark mt-1">
            Obs: {item.observacoes}
          </p>
        )}
      </div>
      
      {editable ? (
        <div className="flex items-center">
          <Button 
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => handleUpdateQuantidade(item.quantidade - 1)}
            disabled={item.quantidade <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="mx-2 min-w-[20px] text-center">{item.quantidade}</span>
          
          <Button 
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => handleUpdateQuantidade(item.quantidade + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          
          <Button 
            variant="ghost"
            size="icon"
            className="ml-2 text-destructive"
            onClick={handleRemoveItem}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="text-right">
          <p className="font-medium">
            {formatCurrency(item.preco * item.quantidade)}
          </p>
        </div>
      )}
    </div>
  );
}
