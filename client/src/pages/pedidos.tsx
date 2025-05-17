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
import { VisualizarPedidoDialog } from "@/components/pedidos/visualizar-pedido-dialog";
import { Eye, Plus, Search, FileDown, Printer, Edit2, Trash2, CreditCard } from "lucide-react";
import { PrintButton } from "@/components/shared/print-button";
import { Skeleton } from "@/components/ui/skeleton";
import { type Pedido } from "@shared/schema";
import { ComprovanteImpressao } from "@/components/pedidos/comprovante-impressao";
import { FecharContaDialog } from "@/components/pedidos/fechar-conta-dialog";

export default function Pedidos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTexto, setFiltroTexto] = useState<string>("");
  
  // Verificar se existe parâmetro de mesa e ação na URL
  const urlParams = new URLSearchParams(window.location.search);
  const mesaIdParam = urlParams.get('mesa');
  const acaoParam = urlParams.get('acao');
  
  // Se a ação for "adicionar", abrir o diálogo de novo pedido, independente de ter mesa ou não
  const mostrarNovoPedido = acaoParam === 'adicionar';
  
  // Converter mesaId para número se existir, senão deixar undefined
  const mesaId = mesaIdParam && mesaIdParam !== "null" ? parseInt(mesaIdParam) : undefined;
  
  // Função para abrir o diálogo de visualização de pedido
  const handleVisualizarPedido = (pedido: any) => {
    setPedidoSelecionado(pedido);
    setIsViewModalOpen(true);
  };
  
  // Função para voltar para a página de mesas
  const voltarParaMesas = () => {
    window.location.href = '/mesas';
  };
  
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
        <div className="flex space-x-2">
          {/* Botão para voltar às mesas se vier da página de mesas */}
          {mostrarNovoPedido && (
            <Button 
              variant="outline"
              onClick={voltarParaMesas}
            >
              Voltar para Mesas
            </Button>
          )}
          <Button 
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Pedido
          </Button>
        </div>
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
                              onClick={() => handleVisualizarPedido(pedido)}
                            >
                              <Eye className="h-4 w-4" />
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
                            
                            {/* Botão de fechar conta (apenas para pedidos de mesa) */}
                            {pedido.tipo === "mesa" && pedido.status !== "finalizado" && (
                              <FecharContaDialog
                                pedidoId={pedido.id}
                                mesaId={pedido.mesaId || 0}
                                trigger={
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                    <CreditCard className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            )}
                            
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
        isOpen={mostrarNovoPedido}
        onOpenChange={setIsDialogOpen}
        mesaIdPreSelecionada={mesaId}
      />
      
      {pedidoSelecionado && (
        <EditarPedidoDialog 
          pedido={pedidoSelecionado}
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}
      
      {pedidoSelecionado && (
        <VisualizarPedidoDialog
          pedidoId={pedidoSelecionado.id}
          aberto={isViewModalOpen}
          aoFechar={() => setIsViewModalOpen(false)}
        />
      )}
    </>
  );
}
