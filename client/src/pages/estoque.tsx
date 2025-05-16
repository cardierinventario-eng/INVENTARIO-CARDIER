import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemEstoque } from "@/components/estoque/item-estoque";
import { PrintButton } from "@/components/shared/print-button";
import { 
  Plus, 
  Search, 
  FileDown, 
  AlertTriangle,
  Package,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type ItemEstoque as ItemEstoqueType } from "@shared/schema";

export default function Estoque() {
  const [filtro, setFiltro] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  
  const { data: itensEstoque, isLoading } = useQuery<ItemEstoqueType[]>({
    queryKey: ['/api/estoque'],
  });

  // Filtrar itens por texto e/ou categoria
  const itensFiltrados = itensEstoque?.filter(item => {
    // Filtro por texto
    const textoMatch = item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                       item.categoria.toLowerCase().includes(filtro.toLowerCase());
    
    // Filtro por categoria
    const categoriaMatch = categoriaAtiva === "todos" || 
                         (categoriaAtiva === "baixo" && item.quantidade <= item.estoqueMinimo) ||
                         (categoriaAtiva === "normal" && item.quantidade > item.estoqueMinimo && item.quantidade < item.estoqueIdeal) ||
                         (categoriaAtiva === "ideal" && item.quantidade >= item.estoqueIdeal);
    
    return textoMatch && categoriaMatch;
  });

  // Agrupar por categoria para exibir na interface
  const categorias = [...new Set(itensEstoque?.map(item => item.categoria))];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Controle de Estoque</h1>
          <p className="text-neutral-dark">Gerencie o estoque de produtos do seu restaurante</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Item
        </Button>
      </div>
      
      <Tabs defaultValue="todos" className="mb-6">
        <TabsList>
          <TabsTrigger 
            value="todos" 
            onClick={() => setCategoriaAtiva("todos")}
          >
            <Package className="mr-2 h-4 w-4" />
            Todos
          </TabsTrigger>
          <TabsTrigger 
            value="baixo" 
            onClick={() => setCategoriaAtiva("baixo")}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Estoque Baixo
          </TabsTrigger>
          <TabsTrigger 
            value="normal" 
            onClick={() => setCategoriaAtiva("normal")}
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            Estoque Normal
          </TabsTrigger>
          <TabsTrigger 
            value="ideal" 
            onClick={() => setCategoriaAtiva("ideal")}
          >
            <PackageX className="mr-2 h-4 w-4" />
            Estoque Ideal
          </TabsTrigger>
        </TabsList>
        
        <div className="flex justify-between items-center my-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar itens..."
              className="pl-8"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <PrintButton 
              contentId="tabela-estoque"
              title="Relatório de Estoque"
            />
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>
        
        <TabsContent value="todos" className="mt-0">
          <div className="bg-white rounded-lg shadow">
            <div id="tabela-estoque" className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Estoque Mínimo</TableHead>
                    <TableHead>Estoque Ideal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Skeleton loader para dados em carregamento
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Skeleton className="h-9 w-9 rounded-md" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : itensFiltrados && itensFiltrados.length > 0 ? (
                    itensFiltrados.map((item) => (
                      <ItemEstoque key={item.id} item={item} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-neutral-dark">
                        Nenhum item encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
