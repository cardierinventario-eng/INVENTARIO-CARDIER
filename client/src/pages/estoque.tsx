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
  Barcode,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type ItemEstoque as ItemEstoqueType } from "@shared/schema";

import { NovoItemEstoqueDialog } from "@/components/estoque/novo-item-estoque-dialog";
import { DialogCodigoBarras } from "@/components/codigo-barras/dialog-codigo-barras";

export default function Estoque() {
  const [filtro, setFiltro] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null);
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  
  const { data: itensEstoque, isLoading } = useQuery<ItemEstoqueType[]>({
    queryKey: ['/api/estoque', codigoBarras],
    queryFn: async () => {
      setBuscaAtiva(!!codigoBarras);
      const url = codigoBarras 
        ? `/api/estoque?codigoBarras=${encodeURIComponent(codigoBarras)}`
        : '/api/estoque';
      const response = await fetch(url);
      const data = await response.json();
      return data;
    }
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
  // Cria um array de categorias únicas
  const categoriasArray = itensEstoque?.map(item => item.categoria) || [];
  const categorias = Array.from(new Set(categoriasArray));

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Controle de Estoque</h1>
          <p className="text-neutral-dark">Gerencie o estoque de produtos do seu restaurante</p>
        </div>
        <NovoItemEstoqueDialog />
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
          <div className="flex gap-2 items-center">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar itens..."
                className="pl-8"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
            {buscaAtiva ? (
              <div className="flex items-center gap-2">
                <div className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md flex items-center">
                  <Barcode className="h-4 w-4 mr-1" />
                  <span>Filtrando por código: {codigoBarras}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setCodigoBarras(null);
                    setBuscaAtiva(false);
                  }}
                >
                  Limpar
                </Button>
              </div>
            ) : (
              <DialogCodigoBarras 
                onScan={(codigo) => {
                  setCodigoBarras(codigo);
                  // Limpar o filtro de texto ao usar código de barras
                  setFiltro("");
                }}
                titulo="Leitor de Código de Barras" 
                descricao="Escaneie o código de barras para buscar o produto no estoque"
                trigger={
                  <Button variant="outline" size="icon" title="Ler código de barras">
                    <Barcode className="h-4 w-4" />
                  </Button>
                }
              />
            )}
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
          <div id="tabela-estoque">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-[200px] rounded-lg" />
                ))}
              </div>
            ) : itensFiltrados && itensFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {itensFiltrados.map((item) => (
                  <ItemEstoque key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-lg shadow">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {filtro ? 
                    `Não encontramos itens correspondentes à sua busca "${filtro}"` : 
                    "Ainda não existem itens cadastrados no estoque."}
                </p>
                <NovoItemEstoqueDialog />
              </div>
            )}
            
            {/* Versão para impressão (oculta na tela) */}
            <div className="hidden print:block mt-8">
              <h2 className="text-xl font-bold mb-4">Relatório de Estoque</h2>
              <p className="mb-4">Data: {new Date().toLocaleDateString('pt-BR')}</p>
              
              {categorias.length > 0 && (
                <div className="space-y-6">
                  {categorias.map((categoria) => (
                    <div key={categoria} className="mb-6">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-2">{categoria}</h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-3 border text-left">Item</th>
                            <th className="py-2 px-3 border text-left">Quantidade</th>
                            <th className="py-2 px-3 border text-left">Mínimo</th>
                            <th className="py-2 px-3 border text-left">Ideal</th>
                            <th className="py-2 px-3 border text-left">Preço Unit.</th>
                            <th className="py-2 px-3 border text-left">Valor Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itensEstoque?.filter(item => item.categoria === categoria).map(item => (
                            <tr key={item.id} className="border-b">
                              <td className="py-2 px-3 border">{item.nome}</td>
                              <td className="py-2 px-3 border">{item.quantidade} {item.unidade}</td>
                              <td className="py-2 px-3 border">{item.estoqueMinimo} {item.unidade}</td>
                              <td className="py-2 px-3 border">{item.estoqueIdeal} {item.unidade}</td>
                              <td className="py-2 px-3 border">R$ {(parseFloat(item.valorUnitario || '0')).toFixed(2)}</td>
                              <td className="py-2 px-3 border">R$ {(parseFloat(item.quantidade || '0') * parseFloat(item.valorUnitario || '0')).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
