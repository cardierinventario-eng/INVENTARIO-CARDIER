import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { LowStockItems } from "@/components/dashboard/low-stock-items";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RestaurantStatus } from "@/components/dashboard/restaurant-status";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  pedidosHoje: number;
  vendasHoje: number;
  mesasOcupadas: number;
  totalMesas: number;
  itensEstoqueBaixo: number;
  crescimentoPedidos: string;
  crescimentoVendas: string;
  ocupacaoMesas: string;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Dashboard</h1>
        <p className="text-neutral-dark">Bem-vindo ao sistema de gerenciamento Lanche Fácil</p>
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
              title="Pedidos Hoje"
              value={stats.pedidosHoje}
              icon="fa-shopping-bag"
              color="primary"
              trend={{
                value: stats.crescimentoPedidos,
                positive: !stats.crescimentoPedidos.includes("-")
              }}
            />
            
            <StatCard
              title="Vendas de Hoje"
              value={`R$ ${stats.vendasHoje.toFixed(2).replace('.', ',')}`}
              icon="fa-dollar-sign"
              color="secondary"
              trend={{
                value: stats.crescimentoVendas,
                positive: !stats.crescimentoVendas.includes("-")
              }}
            />
            
            <StatCard
              title="Mesas Ocupadas"
              value={`${stats.mesasOcupadas}/${stats.totalMesas}`}
              icon="fa-utensils"
              color="warning"
              trend={{
                value: stats.ocupacaoMesas,
                positive: true
              }}
            />
            
            <StatCard
              title="Itens com Estoque Baixo"
              value={stats.itensEstoqueBaixo}
              icon="fa-boxes"
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
