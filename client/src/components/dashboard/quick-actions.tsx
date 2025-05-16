import { Link } from "wouter";

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow col-span-1">
      <div className="p-5 border-b border-neutral-light">
        <h2 className="font-heading font-bold text-lg">Ações Rápidas</h2>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">
        <Link 
          href="/pedidos/novo" 
          className="bg-primary text-white p-4 rounded-lg text-center hover:bg-primary-dark transition"
        >
          <i className="fas fa-plus-circle text-2xl mb-2"></i>
          <p className="text-sm font-medium">Novo Pedido</p>
        </Link>
        
        <Link 
          href="/mesas" 
          className="bg-secondary text-white p-4 rounded-lg text-center hover:bg-secondary-dark transition"
        >
          <i className="fas fa-utensils text-2xl mb-2"></i>
          <p className="text-sm font-medium">Gerenciar Mesas</p>
        </Link>
        
        <Link 
          href="/relatorios" 
          className="bg-accent text-neutral-darkest p-4 rounded-lg text-center hover:bg-accent-dark transition"
        >
          <i className="fas fa-chart-bar text-2xl mb-2"></i>
          <p className="text-sm font-medium">Relatórios</p>
        </Link>
        
        <Link 
          href="/estoque" 
          className="bg-neutral-dark text-white p-4 rounded-lg text-center hover:bg-neutral-darkest transition"
        >
          <i className="fas fa-boxes text-2xl mb-2"></i>
          <p className="text-sm font-medium">Estoque</p>
        </Link>
      </div>
    </div>
  );
}
