import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Ban, Printer, FileText, Clock, CreditCard } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Pedido, type ItemPedido } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function RecentOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: string; id: number } | null>(null);

  const { data: pedidos, isLoading } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos/recentes'],
  });

  // Carrega os itens do pedido
  const carregarItensPedido = async (pedidoId: number) => {
    try {
      const itens = await apiRequest(`/api/pedidos/${pedidoId}/itens`);
      setItensPedido(itens);
    } catch (error) {
      toast({
        title: "Erro ao carregar itens",
        description: "Não foi possível carregar os itens do pedido",
        variant: "destructive"
      });
    }
  };

  // Visualiza o pedido em detalhes
  const visualizarPedido = async (pedido: Pedido) => {
    setSelectedPedido(pedido);
    await carregarItensPedido(pedido.id);
    setOpenDialog(true);
  };

  // Atualiza o status do pedido
  const atualizarStatusPedido = async (pedidoId: number, novoStatus: string) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest(`/api/pedidos/${pedidoId}/status`, 'PATCH', { 
        status: novoStatus 
      });
      
      // Se o pedido for finalizado, libera a mesa
      if (novoStatus === 'finalizado') {
        const pedido = pedidos?.find(p => p.id === pedidoId);
        if (pedido && pedido.mesaId) {
          await apiRequest(`/api/mesas/${pedido.mesaId}/status`, 'PATCH', { 
            status: 'livre' 
          });
        }
      }
      
      // Atualiza os dados
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Status atualizado",
        description: `O pedido foi ${novoStatus === 'finalizado' ? 'finalizado' : novoStatus}`,
      });
      
      setConfirmAction(null);
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formata o tipo de pedido
  const formatarTipoPedido = (tipo: string, mesa?: number | null) => {
    switch(tipo.toLowerCase()) {
      case 'mesa':
        return <Badge variant="outline">Mesa {mesa}</Badge>;
      case 'balcao':
        return <Badge variant="secondary">Balcão</Badge>;
      case 'delivery':
        return <Badge variant="default">Delivery</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow lg:col-span-2">
        <div className="p-5 border-b border-neutral-light flex justify-between items-center">
          <h2 className="font-heading font-bold text-lg">Pedidos Recentes</h2>
          <Link href="/pedidos" className="text-sm text-primary hover:text-primary-dark">
            Ver todos
          </Link>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-neutral-dark border-b">
                  <th className="pb-3 font-semibold">Número</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Valor</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Mostrar skeleton loader durante o carregamento
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index} className="border-b border-neutral-light">
                      <td className="py-3 text-sm">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="py-3 text-sm">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="py-3 text-sm">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="py-3 text-sm">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="py-3 text-sm">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                      <td className="py-3 text-sm">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : pedidos && pedidos.length > 0 ? (
                  pedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b border-neutral-light hover:bg-neutral-lightest">
                      <td className="py-3 text-sm">#{pedido.numero}</td>
                      <td className="py-3 text-sm">{pedido.nomeCliente}</td>
                      <td className="py-3 text-sm">
                        {formatarTipoPedido(pedido.tipo, pedido.mesaId)}
                      </td>
                      <td className="py-3 text-sm">{formatCurrency(Number(pedido.valorTotal))}</td>
                      <td className="py-3 text-sm">
                        <StatusBadge status={pedido.status} />
                      </td>
                      <td className="py-3 text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-neutral-dark hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações do Pedido</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => visualizarPedido(pedido)}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Ver Detalhes</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => setLocation(`/pedidos/${pedido.id}`)}>
                              <Clock className="mr-2 h-4 w-4" />
                              <span>Ir para Pedido</span>
                            </DropdownMenuItem>
                            
                            {pedido.status.toLowerCase() === 'pendente' && (
                              <DropdownMenuItem 
                                onClick={() => setConfirmAction({
                                  action: 'preparando',
                                  id: pedido.id
                                })}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Marcar em Preparo</span>
                              </DropdownMenuItem>
                            )}
                            
                            {pedido.status.toLowerCase() === 'preparando' && (
                              <DropdownMenuItem 
                                onClick={() => setConfirmAction({
                                  action: 'pronto',
                                  id: pedido.id
                                })}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Marcar como Pronto</span>
                              </DropdownMenuItem>
                            )}
                            
                            {['pendente', 'preparando', 'pronto'].includes(pedido.status.toLowerCase()) && (
                              <DropdownMenuItem 
                                onClick={() => setConfirmAction({
                                  action: 'finalizado',
                                  id: pedido.id
                                })}
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Finalizar Pedido</span>
                              </DropdownMenuItem>
                            )}
                            
                            {['pendente'].includes(pedido.status.toLowerCase()) && (
                              <DropdownMenuItem 
                                onClick={() => setConfirmAction({
                                  action: 'cancelado',
                                  id: pedido.id
                                })}
                                className="text-destructive"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Cancelar Pedido</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-dark">
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 text-neutral-medium mb-2" />
                        <span>Nenhum pedido recente encontrado</span>
                        <span className="text-xs text-neutral-medium mt-1">
                          Os pedidos feitos aparecerão aqui
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline"
              className="text-sm"
              asChild
            >
              <Link href="/pedidos/novo">
                <span>Novo Pedido</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de Visualização de Pedido */}
      <Dialog open={openDialog} onOpenChange={(open) => !open && setOpenDialog(false)}>
        <DialogContent className="max-w-md">
          {selectedPedido && (
            <>
              <DialogHeader>
                <DialogTitle>Pedido #{selectedPedido.numero}</DialogTitle>
                <DialogDescription>
                  <div className="flex justify-between items-center mt-1">
                    <span>Cliente: {selectedPedido.nomeCliente}</span>
                    <StatusBadge status={selectedPedido.status} />
                  </div>
                  <div className="text-xs text-neutral-medium mt-1">
                    Data: {formatDateTime(new Date(selectedPedido.dataCriacao))}
                  </div>
                  {selectedPedido.tipo === 'mesa' && (
                    <div className="text-xs text-neutral-medium">
                      Mesa: {selectedPedido.mesaId}
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-2">
                <div className="text-sm font-medium mb-2">Itens do Pedido</div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {itensPedido.map((item) => (
                    <div key={item.id} className="flex justify-between p-2 bg-neutral-lightest rounded">
                      <div>
                        <div className="font-medium">{item.nome}</div>
                        <div className="text-xs text-neutral-medium">
                          {item.quantidade}x {formatCurrency(item.preco / item.quantidade)}
                        </div>
                        {item.observacoes && (
                          <div className="text-xs italic mt-1">{item.observacoes}</div>
                        )}
                      </div>
                      <div className="font-medium text-right">{formatCurrency(item.preco)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t mt-3 pt-2 flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">{formatCurrency(selectedPedido.valorTotal)}</span>
                </div>
                
                {selectedPedido.observacoes && (
                  <div className="mt-3 p-2 bg-neutral-lightest rounded text-sm">
                    <span className="font-medium">Observações:</span>
                    <p className="mt-1 text-sm">{selectedPedido.observacoes}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 flex-col sm:flex-row">
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="sm"
                  onClick={() => setOpenDialog(false)}
                >
                  Fechar
                </Button>
                <Button 
                  variant="default" 
                  className="w-full"
                  size="sm"
                  onClick={() => setLocation(`/pedidos/${selectedPedido.id}`)}
                >
                  Ir para Pedido
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Ações */}
      {confirmAction && (
        <Dialog open={true} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {(() => {
                  switch(confirmAction.action) {
                    case 'preparando': return 'Marcar como Em Preparo';
                    case 'pronto': return 'Marcar como Pronto';
                    case 'finalizado': return 'Finalizar Pedido';
                    case 'cancelado': return 'Cancelar Pedido';
                    default: return 'Confirmar Ação';
                  }
                })()}
              </DialogTitle>
              <DialogDescription>
                {(() => {
                  switch(confirmAction.action) {
                    case 'preparando': 
                      return 'Confirma que o pedido está sendo preparado?';
                    case 'pronto': 
                      return 'Confirma que o pedido está pronto para entrega?';
                    case 'finalizado': 
                      return 'Confirma que o pedido foi entregue e pago?';
                    case 'cancelado': 
                      return 'Tem certeza que deseja cancelar este pedido?';
                    default: 
                      return 'Confirma esta ação?';
                  }
                })()}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setConfirmAction(null)} 
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                variant={confirmAction.action === 'cancelado' ? 'destructive' : 'default'}
                onClick={() => atualizarStatusPedido(confirmAction.id, confirmAction.action)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
