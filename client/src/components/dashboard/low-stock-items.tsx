import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type ItemEstoque } from "@shared/schema";

export function LowStockItems() {
  const { data: itensEstoqueBaixo, isLoading } = useQuery<ItemEstoque[]>({
    queryKey: ['/api/estoque/baixo'],
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-5 border-b border-neutral-light flex justify-between items-center">
        <h2 className="font-heading font-bold text-lg">Estoque Baixo</h2>
        <Link href="/estoque" className="text-sm text-primary hover:text-primary-dark">
          Ver todos
        </Link>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="p-3 bg-neutral-lightest rounded-lg">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {itensEstoqueBaixo && itensEstoqueBaixo.length > 0 ? (
              itensEstoqueBaixo.map((item) => {
                // Define o estilo com base no nível de estoque
                const isVeryLow = item.quantidade <= item.estoqueMinimo;
                const dotColor = isVeryLow ? "bg-destructive" : "bg-warning";
                const textColor = isVeryLow ? "text-destructive" : "text-warning";
                
                return (
                  <li key={item.id} className="flex justify-between items-center p-3 bg-neutral-lightest rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 ${dotColor} rounded-full mr-3`}></div>
                      <span>{item.nome}</span>
                    </div>
                    <div className={`text-sm ${textColor}`}>
                      {item.quantidade} {item.unidade}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="p-3 text-center text-neutral-dark">
                Nenhum item com estoque baixo
              </li>
            )}
          </ul>
        )}
        
        <Button 
          className="w-full mt-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          asChild
        >
          <Link href="/estoque/compra">
            Realizar Compra
          </Link>
        </Button>
      </div>
    </div>
  );
}
