import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Mesa } from "@shared/schema";

export function QuickActions() {
  const [, setLocation] = useLocation();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: mesas } = useQuery<Mesa[]>({
    queryKey: ['/api/mesas'],
  });
  
  // Função para criar novo pedido balcão rápido
  const criarPedidoBalcao = async () => {
    try {
      const novoPedido = {
        tipo: "balcao",
        nomeCliente: "Cliente Balcão",
        numero: Math.floor(1000 + Math.random() * 9000), // Número aleatório de 4 dígitos
        valorTotal: 0, // Será atualizado quando itens forem adicionados
        status: "pendente",
        observacoes: ""
      };
      
      const pedidoCriado = await apiRequest('/api/pedidos', 'POST', novoPedido);
      
      toast({
        title: "Pedido de balcão criado",
        description: `Pedido #${pedidoCriado.numero} criado com sucesso!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      setLocation(`/pedidos/${pedidoCriado.id}`);
    } catch (error) {
      toast({
        title: "Erro ao criar pedido",
        description: "Não foi possível criar o pedido de balcão.",
        variant: "destructive"
      });
    }
  };

  // Função para encerrar expediente
  const encerrarExpediente = async () => {
    try {
      // Verificar se todas as mesas estão livres
      const mesasOcupadas = mesas?.filter(mesa => mesa.status.toLowerCase() !== 'livre') || [];
      
      if (mesasOcupadas.length > 0) {
        toast({
          title: "Não é possível encerrar o expediente",
          description: `Existem ${mesasOcupadas.length} mesas ainda ocupadas.`,
          variant: "destructive"
        });
        return;
      }
      
      // TODO: Implementar fechamento de caixa quando tivermos essa funcionalidade
      toast({
        title: "Expediente encerrado",
        description: "Todas as operações do dia foram finalizadas.",
      });
      
      setOpenDialog(null);
    } catch (error) {
      toast({
        title: "Erro ao encerrar expediente",
        description: "Não foi possível encerrar o expediente.",
        variant: "destructive"
      });
    }
  };
  
  // Função para liberar todas as mesas (apenas em caso de emergência/erro)
  const liberarTodasMesas = async () => {
    try {
      // Atualizar o status de todas as mesas para livre
      for (const mesa of mesas || []) {
        if (mesa.status.toLowerCase() !== 'livre') {
          await apiRequest(`/api/mesas/${mesa.id}/status`, 'PATCH', { status: 'livre' });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Mesas liberadas",
        description: "Todas as mesas foram liberadas com sucesso.",
      });
      
      setOpenDialog(null);
    } catch (error) {
      toast({
        title: "Erro ao liberar mesas",
        description: "Não foi possível liberar todas as mesas.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow col-span-1">
        <div className="p-5 border-b border-neutral-light">
          <h2 className="font-heading font-bold text-lg">Ações Rápidas</h2>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <Button
            onClick={() => setLocation(`/pedidos?mesa=${null}&acao=adicionar`)}
            className="bg-primary text-white p-4 h-auto rounded-lg text-center hover:bg-primary-dark transition flex flex-col items-center justify-center"
          >
            <i className="fas fa-plus-circle text-2xl mb-2"></i>
            <p className="text-sm font-medium">Novo Pedido</p>
          </Button>
          
          <Button
            onClick={() => criarPedidoBalcao()}
            className="bg-secondary text-white p-4 h-auto rounded-lg text-center hover:bg-secondary-dark transition flex flex-col items-center justify-center"
          >
            <i className="fas fa-shopping-bag text-2xl mb-2"></i>
            <p className="text-sm font-medium">Pedido Balcão</p>
          </Button>
          
          <Button
            onClick={() => setOpenDialog('liberarMesas')}
            className="bg-accent text-neutral-darkest p-4 h-auto rounded-lg text-center hover:bg-accent-dark transition flex flex-col items-center justify-center"
          >
            <i className="fas fa-check-circle text-2xl mb-2"></i>
            <p className="text-sm font-medium">Liberar Mesas</p>
          </Button>
          
          <Button
            onClick={() => setOpenDialog('encerrarExpediente')}
            className="bg-neutral-dark text-white p-4 h-auto rounded-lg text-center hover:bg-neutral-darkest transition flex flex-col items-center justify-center"
          >
            <i className="fas fa-power-off text-2xl mb-2"></i>
            <p className="text-sm font-medium">Encerrar Expediente</p>
          </Button>
          
          <Link 
            href="/clientes" 
            className="bg-info text-white p-4 rounded-lg text-center hover:bg-info-dark transition flex flex-col items-center justify-center"
          >
            <i className="fas fa-users text-2xl mb-2"></i>
            <p className="text-sm font-medium">Clientes</p>
          </Link>
          
          <Link 
            href="/configuracoes" 
            className="bg-slate-600 text-white p-4 rounded-lg text-center hover:bg-slate-700 transition flex flex-col items-center justify-center"
          >
            <i className="fas fa-cog text-2xl mb-2"></i>
            <p className="text-sm font-medium">Configurações</p>
          </Link>
        </div>
      </div>

      {/* Dialog de Encerrar Expediente */}
      <Dialog open={openDialog === 'encerrarExpediente'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar Expediente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja encerrar o expediente? Essa ação irá finalizar todas as operações do dia.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
            <Button onClick={encerrarExpediente}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Liberar Mesas */}
      <Dialog open={openDialog === 'liberarMesas'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liberar Todas as Mesas</DialogTitle>
            <DialogDescription>
              Esta ação irá liberar todas as mesas, independente do status atual. Utilize apenas em caso de necessidade.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={liberarTodasMesas}>Liberar Todas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
