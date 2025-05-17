import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye, Coffee, Clock, CheckCircle, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Mesa, type Pedido } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export function RestaurantStatus() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusAtual, setStatusAtual] = useState("aberto");

  const { data: mesas, isLoading } = useQuery<Mesa[]>({
    queryKey: ['/api/mesas'],
  });

  const { data: pedidos } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos'],
  });

  // Encontrar o pedido ativo para uma mesa
  const encontrarPedidoMesa = (mesaId: number) => {
    if (!pedidos) return null;
    return pedidos.find(
      pedido => pedido.mesaId === mesaId && 
      pedido.status.toLowerCase() !== 'finalizado' &&
      pedido.status.toLowerCase() !== 'cancelado'
    );
  };

  // Alternar status do restaurante
  const alternarStatusRestaurante = () => {
    // Na vida real, isso seria uma chamada à API
    setStatusAtual(statusAtual === "aberto" ? "fechado" : "aberto");
    
    toast({
      title: statusAtual === "aberto" ? "Restaurante fechado" : "Restaurante aberto",
      description: statusAtual === "aberto" 
        ? "O restaurante foi fechado para novos clientes" 
        : "O restaurante está aberto para atendimento",
    });
  };

  // Atualizar status da mesa
  const atualizarStatusMesa = async (mesa: Mesa, novoStatus: string) => {
    try {
      await apiRequest(`/api/mesas/${mesa.id}/status`, 'PATCH', { status: novoStatus });
      
      queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Status atualizado",
        description: `Mesa ${mesa.numero} marcada como ${novoStatus}`,
      });
      
      setOpenDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da mesa",
        variant: "destructive"
      });
    }
  };

  // Ações rápidas para mesas
  const acoesMesa = (mesa: Mesa) => {
    const pedidoAtivo = encontrarPedidoMesa(mesa.id);
    
    const verPedido = () => {
      if (pedidoAtivo) {
        setLocation(`/pedidos/${pedidoAtivo.id}`);
      } else {
        toast({
          title: "Nenhum pedido encontrado",
          description: "Esta mesa não possui pedidos ativos",
          variant: "destructive"
        });
      }
    };
    
    const iniciarPedido = () => {
      setLocation(`/pedidos/novo?mesa=${mesa.id}`);
    };
    
    return (
      <div className="flex space-x-1 mt-2">
        {mesa.status.toLowerCase() === 'ocupada' && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="p-1 h-6" 
            onClick={verPedido}
            title="Ver pedido"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        
        {mesa.status.toLowerCase() === 'livre' && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="p-1 h-6" 
            onClick={iniciarPedido}
            title="Novo pedido"
          >
            <Coffee className="h-3 w-3" />
          </Button>
        )}
        
        {mesa.status.toLowerCase() === 'livre' && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="p-1 h-6" 
            onClick={() => {
              setMesaSelecionada(mesa);
              setOpenDialog(true);
            }}
            title="Configurar status"
          >
            <Clock className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow lg:col-span-2">
        <div className="p-5 border-b border-neutral-light flex justify-between items-center">
          <h2 className="font-heading font-bold text-lg">Status do Restaurante</h2>
          <div className="flex items-center gap-3">
            <Button 
              variant={statusAtual === "aberto" ? "default" : "outline"} 
              size="sm"
              onClick={alternarStatusRestaurante}
            >
              {statusAtual === "aberto" ? "Fechar Restaurante" : "Abrir Restaurante"}
            </Button>
            <StatusBadge status={statusAtual === "aberto" ? "Aberto" : "Fechado"} />
          </div>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="relative p-4 bg-neutral-lightest rounded-lg h-64 mb-4">
              <div className="absolute inset-0 p-4 grid grid-cols-3 gap-4">
                {Array(9).fill(0).map((_, index) => (
                  <div key={index} className="relative">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative p-4 bg-neutral-lightest rounded-lg h-auto min-h-64 flex items-center justify-center mb-4">
              <div className="w-full grid grid-cols-3 sm:grid-cols-4 gap-4">
                {mesas && mesas.map((mesa) => {
                  let bgColor = "";
                  let statusText = "";
                  
                  switch (mesa.status.toLowerCase()) {
                    case 'livre':
                      bgColor = "bg-success";
                      statusText = "Livre";
                      break;
                    case 'ocupada':
                      bgColor = "bg-destructive";
                      statusText = "Ocupada";
                      break;
                    case 'pedido realizado':
                      bgColor = "bg-warning";
                      statusText = "Pedido realizado";
                      break;
                    case 'reservada':
                      bgColor = "bg-primary";
                      statusText = "Reservada";
                      break;
                    case 'limpeza':
                      bgColor = "bg-info";
                      statusText = "Limpeza";
                      break;
                    case 'manutenção':
                      bgColor = "bg-neutral-dark";
                      statusText = "Manutenção";
                      break;
                    default:
                      bgColor = "bg-neutral-medium";
                      statusText = mesa.status;
                  }
                  
                  const pedidoAtivo = encontrarPedidoMesa(mesa.id);
                  
                  return (
                    <div key={mesa.id} className="relative p-1">
                      <div 
                        className={`${bgColor} rounded-lg flex flex-col items-center justify-center p-2 text-white cursor-pointer hover:opacity-90 transition-opacity`}
                        onClick={() => {
                          setMesaSelecionada(mesa);
                          setOpenDialog(true);
                        }}
                      >
                        <div className="flex justify-between w-full">
                          <span className="text-lg font-bold">Mesa {mesa.numero}</span>
                          {pedidoAtivo && <span className="text-xs bg-black bg-opacity-30 px-1 rounded">#{pedidoAtivo.numero}</span>}
                        </div>
                        <span className="text-xs mt-1">{statusText}</span>
                        <span className="text-xs mt-1">{mesa.capacidade} lugares</span>
                        {acoesMesa(mesa)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
              <span className="text-sm">Livre</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-destructive rounded-full mr-2"></div>
              <span className="text-sm">Ocupada</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-warning rounded-full mr-2"></div>
              <span className="text-sm">Pedido realizado</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-sm">Reservada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Gerenciamento de Mesa */}
      <Dialog open={openDialog} onOpenChange={(open) => !open && setOpenDialog(false)}>
        <DialogContent>
          {mesaSelecionada && (
            <>
              <DialogHeader>
                <DialogTitle>Mesa {mesaSelecionada.numero}</DialogTitle>
                <DialogDescription>
                  Status atual: <span className="font-medium">{mesaSelecionada.status}</span>
                  <br />
                  Capacidade: <span className="font-medium">{mesaSelecionada.capacidade} lugares</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-3 py-4">
                <Button 
                  onClick={() => atualizarStatusMesa(mesaSelecionada, 'livre')}
                  className="bg-success hover:bg-success/80 text-white"
                  disabled={mesaSelecionada.status.toLowerCase() === 'livre'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Livre
                </Button>
                
                <Button 
                  onClick={() => atualizarStatusMesa(mesaSelecionada, 'reservada')}
                  className="bg-primary hover:bg-primary/80 text-white"
                  disabled={mesaSelecionada.status.toLowerCase() === 'reservada'}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Marcar como Reservada
                </Button>
                
                <Button 
                  onClick={() => atualizarStatusMesa(mesaSelecionada, 'limpeza')}
                  className="bg-info hover:bg-info/80 text-white"
                  disabled={mesaSelecionada.status.toLowerCase() === 'limpeza'}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Marcar para Limpeza
                </Button>
                
                <Button 
                  onClick={() => atualizarStatusMesa(mesaSelecionada, 'manutenção')}
                  className="bg-neutral-dark hover:bg-neutral-dark/80 text-white"
                  disabled={mesaSelecionada.status.toLowerCase() === 'manutenção'}
                >
                  <X className="h-4 w-4 mr-2" />
                  Marcar para Manutenção
                </Button>
              </div>
              
              <DialogFooter>
                {mesaSelecionada.status.toLowerCase() === 'livre' && (
                  <Button 
                    onClick={() => {
                      setOpenDialog(false);
                      setLocation(`/pedidos/novo?mesa=${mesaSelecionada.id}`);
                    }}
                    className="w-full mb-2"
                  >
                    Iniciar Pedido
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                  className="w-full"
                >
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
