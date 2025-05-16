import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Mesa } from "@shared/schema";

export function RestaurantStatus() {
  const { data: mesas, isLoading } = useQuery<Mesa[]>({
    queryKey: ['/api/mesas'],
  });

  // Determinar se o restaurante está aberto
  const statusRestaurante = "Aberto";

  return (
    <div className="bg-white rounded-lg shadow lg:col-span-2">
      <div className="p-5 border-b border-neutral-light flex justify-between items-center">
        <h2 className="font-heading font-bold text-lg">Status do Restaurante</h2>
        <StatusBadge status={statusRestaurante} />
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
          <div className="relative p-4 bg-neutral-lightest rounded-lg h-64 flex items-center justify-center mb-4">
            <div className="absolute inset-0 p-4 grid grid-cols-3 gap-4">
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
                  default:
                    bgColor = "bg-neutral-medium";
                    statusText = mesa.status;
                }
                
                return (
                  <div key={mesa.id} className="relative">
                    <div className={`${bgColor} rounded-lg h-full flex flex-col items-center justify-center p-2 text-white`}>
                      <span className="text-lg font-bold">{mesa.numero.toString().padStart(2, '0')}</span>
                      <span className="text-xs">{statusText}</span>
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
  );
}
