import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { NovaMesaDialog } from "@/components/mesas/nova-mesa-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { type Mesa } from "@shared/schema";

export default function Mesas() {
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: mesas, isLoading } = useQuery<Mesa[]>({
    queryKey: ['/api/mesas'],
  });

  const mesasFiltradas = mesas?.filter(mesa => {
    if (selectedStatus === "todos") return true;
    return mesa.status.toLowerCase() === selectedStatus.toLowerCase();
  });

  const handleStatusChange = async (mesaId: number, novoStatus: string) => {
    try {
      await apiRequest("PATCH", `/api/mesas/${mesaId}/status`, { status: novoStatus });
      await queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar status da mesa:", error);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Mesas</h1>
          <p className="text-neutral-dark">Gerencie as mesas do restaurante</p>
        </div>
        <NovaMesaDialog />
      </div>
      
      <Tabs defaultValue="todos" className="mb-6">
        <TabsList>
          <TabsTrigger 
            value="todos" 
            onClick={() => setSelectedStatus("todos")}
          >
            Todas
          </TabsTrigger>
          <TabsTrigger 
            value="livre" 
            onClick={() => setSelectedStatus("livre")}
          >
            Livres
          </TabsTrigger>
          <TabsTrigger 
            value="ocupada" 
            onClick={() => setSelectedStatus("ocupada")}
          >
            Ocupadas
          </TabsTrigger>
          <TabsTrigger 
            value="reservada" 
            onClick={() => setSelectedStatus("reservada")}
          >
            Reservadas
          </TabsTrigger>
          <TabsTrigger 
            value="limpeza" 
            onClick={() => setSelectedStatus("limpeza")}
          >
            Em Limpeza
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Skeleton loader para mesas em carregamento
          Array(8).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="pt-3 flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))
        ) : mesasFiltradas && mesasFiltradas.length > 0 ? (
          mesasFiltradas.map(mesa => {
            // Determina as cores com base no status
            let borderColor = "";
            
            switch (mesa.status.toLowerCase()) {
              case 'livre':
                borderColor = "border-t-success";
                break;
              case 'ocupada':
                borderColor = "border-t-destructive";
                break;
              case 'pedido realizado':
                borderColor = "border-t-warning";
                break;
              case 'reservada':
                borderColor = "border-t-primary";
                break;
              case 'limpeza':
                borderColor = "border-t-info";
                break;
              default:
                borderColor = "border-t-neutral-medium";
            }
            
            return (
              <Card 
                key={mesa.id} 
                className={`overflow-hidden border-t-4 ${borderColor} transition-shadow hover:shadow-md`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-heading">
                      Mesa {mesa.numero.toString().padStart(2, '0')}
                    </CardTitle>
                    <StatusBadge status={mesa.status} />
                  </div>
                  <CardDescription>
                    Capacidade: {mesa.capacidade} pessoas
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  {mesa.status.toLowerCase() === 'ocupada' && (
                    <p className="text-sm text-neutral-dark">
                      Ocupada desde: {new Date(mesa.horarioOcupacao!).toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                  {mesa.status.toLowerCase() === 'reservada' && (
                    <p className="text-sm text-neutral-dark">
                      Reserva para: {new Date(mesa.horarioReserva!).toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedMesa(mesa);
                      setIsDialogOpen(true);
                    }}
                  >
                    Gerenciar
                  </Button>
                  {mesa.status.toLowerCase() === 'ocupada' && (
                    <Button 
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                      onClick={() => {
                        // Navegar para os pedidos da mesa
                        window.location.href = `/pedidos?mesa=${mesa.id}`;
                      }}
                    >
                      Ver Pedido
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10 text-neutral-dark">
            Nenhuma mesa encontrada com os filtros selecionados
          </div>
        )}
      </div>

      {/* Dialog para alterar status da mesa */}
      {selectedMesa && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Mesa {selectedMesa.numero}</DialogTitle>
              <DialogDescription>
                Altere o status da mesa ou realize outras ações.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Status Atual</h4>
                <StatusBadge status={selectedMesa.status} />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Alterar Status</h4>
                <Select 
                  defaultValue={selectedMesa.status.toLowerCase()} 
                  onValueChange={(value) => handleStatusChange(selectedMesa.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livre">Livre</SelectItem>
                    <SelectItem value="ocupada">Ocupada</SelectItem>
                    <SelectItem value="reservada">Reservada</SelectItem>
                    <SelectItem value="pedido realizado">Pedido Realizado</SelectItem>
                    <SelectItem value="limpeza">Em Limpeza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              {selectedMesa.status.toLowerCase() !== 'ocupada' && (
                <Button
                  onClick={() => handleStatusChange(selectedMesa.id, 'ocupada')}
                >
                  Ocupar Mesa
                </Button>
              )}
              {selectedMesa.status.toLowerCase() === 'ocupada' && (
                <Button
                  onClick={() => handleStatusChange(selectedMesa.id, 'livre')}
                >
                  Liberar Mesa
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
