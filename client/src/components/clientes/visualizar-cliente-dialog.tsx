import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Cliente } from "@shared/schema";
import { formatDate } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  Eye, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag,
  FileText,
  Wallet
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface VisualizarClienteDialogProps {
  cliente: Cliente;
  children?: React.ReactNode;
}

export function VisualizarClienteDialog({ cliente, children }: VisualizarClienteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Buscar pedidos do cliente quando o diálogo estiver aberto
  const { data: pedidos, isLoading: isLoadingPedidos } = useQuery({
    queryKey: ['/api/clientes', cliente.id, 'pedidos'],
    enabled: isOpen,  // Só busca quando o diálogo estiver aberto
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
          <DialogDescription>
            Informações detalhadas do cadastro do cliente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Dados principais */}
          <div className="flex items-start space-x-4">
            <div className="bg-muted flex items-center justify-center rounded-full h-16 w-16 flex-shrink-0">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{cliente.nome}</h3>
              
              <div className="flex flex-col space-y-1 text-sm">
                {cliente.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{cliente.email}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{cliente.telefone}</span>
                </div>
                {cliente.endereco && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{cliente.endereco}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />
          
          {/* Resumo de atividade */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Total de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-2xl font-bold">{cliente.totalPedidos || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Valor Total Gasto
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(0)} {/* Valor total não está disponível no modelo atual */}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Observações */}
          {cliente.observacoes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Observações
              </h4>
              <p className="text-sm bg-muted p-3 rounded-md">{cliente.observacoes}</p>
            </div>
          )}
          
          {/* Último pedido */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Último Pedido
            </h4>
            <div>
              {cliente.ultimoPedido ? (
                <p className="text-sm">
                  Realizado em{" "}
                  <span className="font-medium">
                    {new Date(cliente.ultimoPedido).toLocaleDateString('pt-BR')}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Este cliente ainda não realizou nenhum pedido.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}