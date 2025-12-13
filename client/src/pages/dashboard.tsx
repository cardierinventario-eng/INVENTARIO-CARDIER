import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { LowStockItems } from "@/components/dashboard/low-stock-items";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RestaurantStatus } from "@/components/dashboard/restaurant-status";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface DashboardStats {
  totalItens: number;
  totalGrupos: number;
  itensEstoqueBaixo: number;
  valorTotalEstoque: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });
  
  // Efeito para mostrar alerta quando houver itens com estoque baixo
  useEffect(() => {
    if (stats && stats.itensEstoqueBaixo > 0) {
      toast({
        title: "Alerta de Estoque",
        description: `${stats.itensEstoqueBaixo} ${stats.itensEstoqueBaixo === 1 ? "item está" : "itens estão"} com estoque abaixo do mínimo.`,
        variant: "destructive"
      });
    }
  }, [stats?.itensEstoqueBaixo, toast]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Dashboard de Inventário</h1>
        <p className="text-neutral-dark">Visão geral do seu sistema de estoque</p>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {isLoading ? (
          // Skeleton loaders for stats
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-center">
                <div className="w-full">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total de Itens"
              value={stats.totalItens}
              icon="fa-boxes"
              color="primary"
            />
            
            <StatCard
              title="Grupos"
              value={stats.totalGrupos}
              icon="fa-folder"
              color="secondary"
            />
            
            <StatCard
              title="Valor Total Estoque"
              value={`R$ ${stats.valorTotalEstoque.toFixed(2).replace('.', ',')}`}
              icon="fa-dollar-sign"
              color="warning"
            />
            
            <StatCard
              title="Itens com Estoque Baixo"
              value={stats.itensEstoqueBaixo}
              icon="fa-alert-triangle"
              color="danger"
              trend={stats.itensEstoqueBaixo > 0 ? {
                value: "Atenção necessária",
                positive: false
              } : undefined}
            />
          </>
        ) : null}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <RecentOrders />
        <LowStockItems />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions />
        <RestaurantStatus />
      </div>
    </>
  );
}
