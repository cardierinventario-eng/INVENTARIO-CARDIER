import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { NovoPedidoDialog } from "@/components/pedidos/novo-pedido-dialog";
import { EditarPedidoDialog } from "@/components/pedidos/editar-pedido-dialog";
import { ExcluirPedidoDialog } from "@/components/pedidos/excluir-pedido-dialog";
import { Eye, Plus, Search, FileDown, Printer, Edit2, Trash2 } from "lucide-react";
import { PrintButton } from "@/components/shared/print-button";
import { Skeleton } from "@/components/ui/skeleton";
import { type Pedido } from "@shared/schema";
import { ComprovanteImpressao } from "@/components/pedidos/comprovante-impressao";

export default function Pedidos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTexto, setFiltroTexto] = useState<string>("");
  
  const { data: pedidos, isLoading } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos'],
  });

  // Filtrar os pedidos com base nos filtros selecionados
  const pedidosFiltrados = pedidos?.filter(pedido => {
    // Filtro por status
    if (filtroStatus !== "todos" && pedido.status?.toLowerCase() !== filtroStatus.toLowerCase()) {
      return false;
    }
    
    // Filtro por texto (número do pedido ou nome do cliente)
    if (filtroTexto && !pedido.numero.toString().includes(filtroTexto) && 
        !(pedido.nomeCliente && pedido.nomeCliente.toLowerCase().includes(filtroTexto.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Pedidos</h1>
          <p className="text-neutral-dark">Gerencie todos os pedidos do restaurante</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-dark text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Pedido
        </Button>
      </div>
      
      <Tabs defaultValue="todos" className="mb-6">
        <TabsList>
          <TabsTrigger value="todos" onClick={() => setFiltroStatus("todos")}>Todos</TabsTrigger>
          <TabsTrigger value="novo" onClick={() => setFiltroStatus("novo")}>Novos</TabsTrigger>
          <TabsTrigger value="em preparo" onClick={() => setFiltroStatus("em preparo")}>Em Preparo</TabsTrigger>
          <TabsTrigger value="pago" onClick={() => setFiltroStatus("pago")}>Pagos</TabsTrigger>
          <TabsTrigger value="entregue" onClick={() => setFiltroStatus("entregue")}>Entregues</TabsTrigger>
          <TabsTrigger value="cancelado" onClick={() => setFiltroStatus("cancelado")}>Cancelados</TabsTrigger>
        </TabsList>
        
        <div className="flex justify-between items-center my-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              className="pl-8"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <PrintButton 
              contentId="tabela-pedidos"
              title="Relatório de Pedidos"
            />
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>
        
        <TabsContent value="todos" className="mt-0">
          <div className="bg-white rounded-lg shadow">
            <div id="tabela-pedidos" className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Skeleton loader para dados em carregamento
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-9 w-9 rounded-md ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : pedidosFiltrados && pedidosFiltrados.length > 0 ? (
                    pedidosFiltrados.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell className="font-medium">#{pedido.numero}</TableCell>
                        <TableCell>{pedido.dataCriacao ? formatDateTime(new Date(pedido.dataCriacao)) : '-'}</TableCell>
                        <TableCell>{pedido.nomeCliente || '-'}</TableCell>
                        <TableCell>{formatCurrency(Number(pedido.valorTotal))}</TableCell>
                        <TableCell>
                          <StatusBadge status={pedido.status || 'pendente'} />
                        </TableCell>
                        <TableCell>{pedido.tipo}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <Link href={`/pedidos/${pedido.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            <ComprovanteImpressao 
                              pedidoId={pedido.id}
                              mesaId={pedido.mesaId}
                              trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              }
                            />
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setPedidoSelecionado(pedido);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            
                            <ExcluirPedidoDialog 
                              pedido={pedido}
                              trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-neutral-dark">
                        Nenhum pedido encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <NovoPedidoDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
      
      {pedidoSelecionado && (
        <EditarPedidoDialog 
          pedido={pedidoSelecionado}
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}
    </>
  );
}
