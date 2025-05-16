import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { type Pedido } from "@shared/schema";

export function RecentOrders() {
  const { data: pedidos, isLoading } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos/recentes'],
  });

  return (
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
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </td>
                    <td className="py-3 text-sm">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : pedidos && pedidos.length > 0 ? (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-neutral-light">
                    <td className="py-3 text-sm">#{pedido.numero}</td>
                    <td className="py-3 text-sm">{pedido.nomeCliente}</td>
                    <td className="py-3 text-sm">{formatCurrency(pedido.valorTotal)}</td>
                    <td className="py-3 text-sm">
                      <StatusBadge status={pedido.status} />
                    </td>
                    <td className="py-3 text-sm">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-neutral-dark hover:text-primary"
                        asChild
                      >
                        <Link href={`/pedidos/${pedido.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-neutral-dark">
                    Nenhum pedido recente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
