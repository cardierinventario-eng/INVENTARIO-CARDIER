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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Edit,
  MoreVertical,
  Trash2,
  Eye,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { NovoItemDialog } from "@/components/cardapio/novo-item-dialog";
import { EditarItemDialog } from "@/components/cardapio/editar-item-dialog";
import { ExcluirItemDialog } from "@/components/cardapio/excluir-item-dialog";
import { type ItemCardapio } from "@shared/schema";

export default function Cardapio() {
  const [filtro, setFiltro] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  
  const { data: itensCardapio, isLoading } = useQuery<ItemCardapio[]>({
    queryKey: ['/api/cardapio'],
  });

  // Obter categorias únicas para o menu
  const categorias = itensCardapio 
    ? Array.from(new Set(itensCardapio.map(item => item.categoria)))
    : [];

  // Filtrar itens por texto e/ou categoria
  const itensFiltrados = itensCardapio?.filter(item => {
    // Filtro por texto
    const textoMatch = !filtro || 
                      (item.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
                      (item.descricao && item.descricao.toLowerCase().includes(filtro.toLowerCase())));
    
    // Filtro por categoria
    const categoriaMatch = categoriaAtiva === "todos" || 
                          item.categoria.toLowerCase() === categoriaAtiva.toLowerCase();
    
    return textoMatch && categoriaMatch;
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Cardápio</h1>
          <p className="text-neutral-dark">Gerencie os itens do cardápio do seu restaurante</p>
        </div>
        <NovoItemDialog categorias={categorias} />
      </div>
      
      <Tabs defaultValue="todos" className="mb-6">
        <TabsList className="mb-2">
          <TabsTrigger 
            value="todos" 
            onClick={() => setCategoriaAtiva("todos")}
          >
            Todos
          </TabsTrigger>
          {categorias.map(categoria => (
            <TabsTrigger 
              key={categoria} 
              value={categoria.toLowerCase()}
              onClick={() => setCategoriaAtiva(categoria.toLowerCase())}
            >
              {categoria}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="relative w-64 my-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            className="pl-8"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        
        <TabsContent value="todos" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Skeleton loader para itens em carregamento
              Array(8).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden shadow-sm">
                  <div className="h-40 bg-neutral-light">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-6 w-16" />
                  </CardContent>
                  <CardFooter className="pt-2 justify-between">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </CardFooter>
                </Card>
              ))
            ) : itensFiltrados && itensFiltrados.length > 0 ? (
              itensFiltrados.map((item) => (
                <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="h-40 bg-neutral-light overflow-hidden">
                    <div 
                      className="h-full w-full bg-center bg-cover"
                      style={{ 
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className="fas fa-hamburger text-5xl text-neutral-medium"></i>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{item.nome}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="font-bold text-primary text-lg">
                      {formatCurrency(parseFloat(String(item.preco)))}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 justify-between">
                    <EditarItemDialog 
                      item={item} 
                      categorias={categorias}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" /> Visualizar
                        </DropdownMenuItem>
                        <ExcluirItemDialog 
                          item={item}
                          trigger={
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          } 
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-neutral-dark">
                {filtro || categoriaAtiva !== "todos" ? (
                  "Nenhum item encontrado com os filtros selecionados"
                ) : (
                  "Nenhum item cadastrado no cardápio. Clique em 'Novo Item' para adicionar."
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
