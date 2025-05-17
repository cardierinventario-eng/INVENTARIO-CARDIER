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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Printer, FileText, CreditCard } from "lucide-react";

interface VisualizarPedidoDialogProps {
  pedidoId: number;
  aberto: boolean;
  aoFechar: () => void;
}

export function VisualizarPedidoDialog({ 
  pedidoId, 
  aberto, 
  aoFechar 
}: VisualizarPedidoDialogProps) {
  // Renderizar somente quando estiver realmente aberto
  if (!aberto) return null;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Buscar detalhes do pedido
  const { data: pedido, isLoading: carregandoPedido } = useQuery({
    queryKey: ['/api/pedidos', pedidoId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/pedidos/${pedidoId}`);
        return response;
      } catch (error) {
        console.error("Erro ao buscar detalhes do pedido:", error);
        toast({
          title: "Erro ao carregar pedido",
          description: "Não foi possível buscar os detalhes do pedido.",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: aberto && pedidoId !== undefined,
  });

  // Buscar itens do pedido
  const { data: itensPedido = [], isLoading: carregandoItens } = useQuery({
    queryKey: ['/api/pedidos/itens', pedidoId],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/pedidos/${pedidoId}/itens`);
        return response;
      } catch (error) {
        console.error("Erro ao buscar itens do pedido:", error);
        toast({
          title: "Erro ao carregar itens",
          description: "Não foi possível buscar os itens do pedido.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: aberto && pedidoId !== undefined,
  });

  // Função para imprimir o pedido
  const imprimirPedido = () => {
    window.location.href = `/comprovante/${pedidoId}`;
  };

  // Função para atualizar status do pedido
  const atualizarStatus = async (novoStatus: string) => {
    setIsSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/pedidos/${pedidoId}/status`, { status: novoStatus });
      
      // Se o pedido for finalizado e for de uma mesa, liberar a mesa
      if (novoStatus === "finalizado" && pedido?.tipo === "mesa" && pedido?.mesaId) {
        await apiRequest("PATCH", `/api/mesas/${pedido.mesaId}/status`, { status: "livre" });
      }
      
      // Atualizar os dados
      await queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/pedidos', pedidoId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Status atualizado",
        description: `O pedido foi marcado como ${novoStatus}.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular total do pedido
  const totalPedido = (itensPedido as any[]).reduce(
    (total, item) => total + parseFloat(item.preco) * item.quantidade, 
    0
  );

  return (
    <Dialog open={true} onOpenChange={(open) => !open && aoFechar()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
          <DialogDescription>
            Visualize informações e gerencie o pedido
          </DialogDescription>
        </DialogHeader>

        {carregandoPedido || carregandoItens ? (
          <div className="py-8 text-center">Carregando detalhes do pedido...</div>
        ) : !pedido ? (
          <div className="py-8 text-center">Pedido não encontrado</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Informações do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Número:</span>
                      <span className="font-medium">{pedido.numero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium capitalize">{pedido.tipo}</span>
                    </div>
                    {pedido.tipo === "mesa" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mesa:</span>
                        <span className="font-medium">{pedido.mesaId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-medium">{formatDateTime(new Date(pedido.dataCriacao))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={pedido.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {pedido.nomeCliente ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span className="font-medium">{pedido.nomeCliente}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground italic">
                        Sem informações de cliente
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="font-medium">Itens do Pedido</h3>
              
              {(itensPedido as any[]).length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhum item no pedido
                </div>
              ) : (
                <div className="space-y-2">
                  {(itensPedido as any[]).map((item) => (
                    <Card key={item.id}>
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
                          <div className="font-medium">
                            {formatCurrency(parseFloat(item.preco) * item.quantidade)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">Total:</span>
                <span className="font-bold">{formatCurrency(totalPedido)}</span>
              </div>
              
              {pedido.observacoes && (
                <div className="pt-2">
                  <span className="text-sm font-medium">Observações:</span>
                  <p className="text-sm text-muted-foreground">{pedido.observacoes}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
              <div className="flex-1 flex gap-2">
                <Button 
                  variant="outline" 
                  className="gap-1"
                  onClick={imprimirPedido}
                >
                  <Printer className="h-4 w-4" /> Imprimir
                </Button>
              </div>
              
              <div className="flex gap-2">
                {pedido.status !== "finalizado" && (
                  <Button 
                    onClick={() => atualizarStatus("finalizado")}
                    disabled={isSubmitting}
                    className="gap-1"
                  >
                    <CreditCard className="h-4 w-4" /> Finalizar
                  </Button>
                )}
                
                {pedido.status !== "cancelado" && pedido.status !== "finalizado" && (
                  <Button 
                    variant="destructive"
                    onClick={() => atualizarStatus("cancelado")}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                )}
                
                <Button 
                  variant="secondary" 
                  onClick={aoFechar}
                >
                  Fechar
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}