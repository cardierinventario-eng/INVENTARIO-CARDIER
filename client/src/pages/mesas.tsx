import { useQuery } from "@tanstack/react-query";
import { type Mesa } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NovaMesaDialog } from "@/components/mesas/nova-mesa-dialog";
import { AdicionarProdutosMesaDialog } from "@/components/mesas/adicionar-produtos-mesa-dialog";
import { EditarMesaDialog } from "@/components/mesas/editar-mesa-dialog";
import { ExcluirMesaDialog } from "@/components/mesas/excluir-mesa-dialog";
import { VisualizarPedidoDialog } from "@/components/pedidos/visualizar-pedido-dialog";
import { Plus, UtensilsCrossed, Eye, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Mesas() {
  const [, setRefresh] = useState(0);
  const { toast } = useToast();

  const { data: mesas = [], isLoading } = useQuery<Mesa[]>({
    queryKey: ['/api/mesas'],
  });

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'livre': return 'bg-green-100 text-green-800';
      case 'ocupada': return 'bg-red-100 text-red-800';
      case 'reservada': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const liberarMesa = async (mesaId: number) => {
    try {
      await apiRequest('PATCH', `/api/mesas/${mesaId}`, {
        status: 'livre'
      });
      toast({
        title: "Sucesso",
        description: "Mesa liberada com sucesso!",
      });
      setRefresh(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao liberar a mesa",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-darkest">Mesas</h1>
        <NovaMesaDialog 
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" />
              Nova Mesa
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">Carregando mesas...</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mesas.map((mesa) => (
            <Card key={mesa.id} className="hover:shadow-lg transition">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-blue-600" />
                    <CardTitle>Mesa {mesa.numero}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(mesa.status)}>
                    {mesa.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  Capacidade: {mesa.capacidade} lugares
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {mesa.status.toLowerCase() === 'livre' && (
                    <AdicionarProdutosMesaDialog 
                      mesa={mesa}
                      trigger={
                        <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 flex-1">
                          <Plus className="h-3 w-3 mr-1" />
                          Pedido
                        </Button>
                      }
                    />
                  )}
                  
                  {mesa.status.toLowerCase() === 'ocupada' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => liberarMesa(mesa.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Liberar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </>
                  )}
                  
                  <EditarMesaDialog 
                    mesaId={mesa.id}
                    trigger={
                      <Button size="sm" variant="ghost">Editar</Button>
                    }
                  />
                  
                  <ExcluirMesaDialog 
                    mesaId={mesa.id}
                    trigger={
                      <Button size="sm" variant="ghost" className="text-red-600">Excluir</Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
