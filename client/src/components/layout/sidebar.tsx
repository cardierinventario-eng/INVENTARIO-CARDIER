import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Principal", type: "header" },
  { title: "Dashboard", icon: "fa-tachometer-alt", href: "/" },
  { title: "Pedidos", icon: "fa-receipt", href: "/pedidos" },
  { title: "Mesas", icon: "fa-utensils", href: "/mesas" },
  { title: "Estoque", icon: "fa-boxes", href: "/estoque" },
  { title: "Clientes", icon: "fa-users", href: "/clientes" },
  { title: "Cardápio", icon: "fa-hamburger", href: "/cardapio" },

  { title: "Relatórios", type: "header" },
  { title: "Vendas", icon: "fa-chart-line", href: "/relatorios?tipo=vendas" },
  { title: "Financeiro", icon: "fa-dollar-sign", href: "/relatorios?tipo=financeiro" },
  { title: "Estoque", icon: "fa-cubes", href: "/relatorios?tipo=estoque" },

  { title: "Sistema", type: "header" },
  { title: "Configurações", icon: "fa-cog", href: "/configuracoes" },
  { title: "Ajuda", icon: "fa-question-circle", href: "/ajuda" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="bg-primary w-64 flex-shrink-0 hidden md:block h-full overflow-y-auto shadow-lg">
      <div className="p-4 flex items-center border-b border-primary-dark">
        <div className="w-10 h-10 rounded-md mr-3 bg-white/20 flex items-center justify-center text-white">
          <i className="fas fa-utensils text-xl"></i>
        </div>
        <h1 className="text-white font-heading font-bold text-xl">Lanche Fácil</h1>
      </div>
      
      <nav className="mt-5">
        {menuItems.map((item, index) => {
          if (item.type === "header") {
            return (
              <div key={index} className="px-4 mb-2 mt-6 first:mt-0">
                <p className="text-sm text-blue-200 uppercase tracking-wider font-semibold">
                  {item.title}
                </p>
              </div>
            );
          }
          
          // Check if the current path matches this menu item
          let isActive = false;
          if (item.href === "/" && location === "/") {
            isActive = true;
          } else if (item.href !== "/" && location.startsWith(item.href)) {
            isActive = true;
          }
          
          return (
            <Link 
              key={index} 
              href={item.href}
              className={cn(
                "flex items-center py-3 px-4 text-white",
                isActive 
                  ? "bg-primary-dark" 
                  : "hover:bg-primary-dark/50"
              )}
            >
              <i className={`fas ${item.icon} w-5 text-center mr-3`}></i>
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
