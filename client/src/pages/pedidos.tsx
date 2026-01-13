import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { type Pedido } from "@shared/schema";
import { NovoPedidoDialog } from "@/components/pedidos/novo-pedido-dialog";
import { VisualizarPedidoDialog } from "@/components/pedidos/visualizar-pedido-dialog";
import { EditarPedidoDialog } from "@/components/pedidos/editar-pedido-dialog";
import { ExcluirPedidoDialog } from "@/components/pedidos/excluir-pedido-dialog";
import { ComprovanteImpressao } from "@/components/pedidos/comprovante-impressao";
import { Plus, Search, Eye, Printer, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Pedidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openNovoPedido, setOpenNovoPedido] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pedidos = [], isLoading } = useQuery<Pedido[]>({
    queryKey: ['/api/pedidos'],
  });

  const filteredPedidos = pedidos.filter(
    pedido => 
      pedido.numero?.toString().includes(searchTerm) ||
      pedido.nomeCliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em preparo': return 'bg-blue-100 text-blue-800';
      case 'pronto': return 'bg-green-100 text-green-800';
      case 'finalizado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoTexto = (tipo: string, mesaId?: number) => {
    switch(tipo?.toLowerCase()) {
      case 'mesa': return `Mesa ${mesaId || ''}`;
      case 'balcao': return 'Balcão';
      case 'delivery': return 'Delivery';
      default: return tipo;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-darkest">Pedidos</h1>
        <NovoPedidoDialog 
          open={openNovoPedido} 
          onOpenChange={setOpenNovoPedido}
        >
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        </NovoPedidoDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por número ou cliente..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">Carregando pedidos...</div>
          ) : filteredPedidos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum pedido encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">#{pedido.numero}</TableCell>
                    <TableCell>{pedido.nomeCliente || '-'}</TableCell>
                    <TableCell>{getTipoTexto(pedido.tipo, pedido.mesaId)}</TableCell>
                    <TableCell>{formatDate(pedido.data)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pedido.status)}>
                        {pedido.status}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {pedido.valorTotal?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <VisualizarPedidoDialog 
                          pedidoId={pedido.id}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <ComprovanteImpressao 
                          pedidoId={pedido.id}
                          mesaId={pedido.mesaId}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <EditarPedidoDialog 
                          pedidoId={pedido.id}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <ExcluirPedidoDialog 
                          pedidoId={pedido.id}
                          trigger={
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
