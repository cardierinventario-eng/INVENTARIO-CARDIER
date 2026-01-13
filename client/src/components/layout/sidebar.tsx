import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Inventário", type: "header" },
  { title: "Inventário", icon: "fa-boxes", href: "/" },
  { title: "Estoque", icon: "fa-warehouse", href: "/estoque" },
  { title: "Grupos", icon: "fa-folder", href: "/grupos" },
  { title: "Movimentações", icon: "fa-arrows-alt", href: "/movimentacoes" },
  { title: "Fornecedores", icon: "fa-truck", href: "/fornecedores" },

  { title: "Sistema", type: "header" },
  { title: "Configurações", icon: "fa-cog", href: "/configuracoes" },
  { title: "Ajuda", icon: "fa-question-circle", href: "/ajuda" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="bg-gradient-to-b from-amber-800 to-amber-900 w-64 flex-shrink-0 hidden md:block h-full overflow-y-auto shadow-lg">
      <div className="p-4 flex items-center border-b border-amber-700">
        <div className="w-10 h-10 rounded-md mr-3 bg-white/20 flex items-center justify-center text-white">
          <i className="fas fa-utensils text-xl"></i>
        </div>
        <h1 className="text-white font-heading font-bold text-lg">KARUK</h1>
      </div>
      
      <nav className="mt-5">
        {menuItems.map((item, index) => {
          if (item.type === "header") {
            return (
              <div key={index} className="px-4 mb-2 mt-6 first:mt-0">
                <p className="text-sm text-amber-200 uppercase tracking-wider font-semibold">
                  {item.title}
                </p>
              </div>
            );
          }
          
          // Check if the current path matches this menu item
          let isActive = false;
          if (item.href === "/" && location === "/") {
            isActive = true;
          } else if (item.href !== "/" && location.startsWith(item.href ?? '')) {
            isActive = true;
          }
          
          return (
            <Link 
              key={index} 
              href={item.href ?? '/'}
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
