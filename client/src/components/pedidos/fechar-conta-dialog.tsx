import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ComprovanteImpressao } from "./comprovante-impressao";
import {
  CreditCard,
  Receipt,
  Printer,
  CheckCircle2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FecharContaDialogProps {
  pedidoId: number;
  mesaId: number;
  trigger?: React.ReactNode;
}

export function FecharContaDialog({ 
  pedidoId, 
  mesaId, 
  trigger 
}: FecharContaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [contaFechada, setContaFechada] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Buscar dados do pedido
  const { data: pedido, isLoading: pedidoLoading } = useQuery({
    queryKey: ['/api/pedidos', pedidoId],
    enabled: isOpen,
  });
  
  // Buscar itens do pedido
  const { data: itensPedido = [], isLoading: itensLoading } = useQuery({
    queryKey: [`/api/pedidos/${pedidoId}/itens`],
    enabled: isOpen,
  });
  
  // Buscar dados da mesa
  const { data: mesa, isLoading: mesaLoading } = useQuery({
    queryKey: ['/api/mesas', mesaId],
    enabled: isOpen,
  });
  
  const isLoading = pedidoLoading || itensLoading || mesaLoading;
  
  // Calcular total do pedido
  const valorTotal = Array.isArray(itensPedido) ? itensPedido.reduce((total: number, item: any) => {
    const preco = typeof item.preco === 'string' ? parseFloat(item.preco) : item.preco;
    return total + (preco * item.quantidade);
  }, 0) : 0;
  
  // Fechar a conta e liberar a mesa
  const handleFecharConta = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. Atualizar status do pedido para 'finalizado'
      await apiRequest(`/api/pedidos/${pedidoId}/status`, "PATCH", {
        status: "finalizado",
        formaPagamento
      });
      
      // 2. Liberar a mesa
      await apiRequest(`/api/mesas/${mesaId}/status`, "PATCH", {
        status: "livre"
      });
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Conta fechada",
        description: "A conta foi fechada e a mesa liberada com sucesso",
        variant: "success",
      });
      
      // Invalidar cache para atualizar listagens
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Marcar como fechada para mostrar confirmação
      setContaFechada(true);
      
    } catch (error) {
      console.error("Erro ao fechar conta:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fechar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Resetar quando o diálogo é fechado
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setContaFechada(false);
      setFormaPagamento("dinheiro");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
            Fechar Conta
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[500px]">
        {!contaFechada ? (
          <>
            <DialogHeader>
              <DialogTitle>Fechar Conta</DialogTitle>
              <DialogDescription>
                Revise os itens e confirme o pagamento para liberar a mesa.
              </DialogDescription>
            </DialogHeader>
            
            {isLoading ? (
              <div className="py-8 text-center">Carregando informações...</div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                      <CardDescription>
                        {pedido ? `Pedido #${(pedido as any).numero || '-'}` : 'Carregando...'} - 
                        {mesa ? `Mesa ${(mesa as any).numero || '-'}` : 'Carregando...'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-1">
                        {Array.isArray(itensPedido) && itensPedido.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm py-1">
                            <span>{item.quantidade}x {item.nome}</span>
                            <span>{formatCurrency(item.preco * item.quantidade)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(valorTotal)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-2">
                    <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
                    <Select 
                      value={formaPagamento} 
                      onValueChange={setFormaPagamento}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <ComprovanteImpressao 
                      pedidoId={pedidoId} 
                      mesaId={mesaId}
                      tiposDisponiveis={{ 
                        cozinha: false, 
                        cliente: false,
                        conta: true 
                      }}
                      trigger={
                        <Button variant="outline" className="mr-2">
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir Conta
                        </Button>
                      }
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleFecharConta}
                    disabled={isSubmitting}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Finalizar Pagamento
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        ) : (
          // Tela de confirmação após fechar a conta
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="mb-4 bg-success/10 p-3 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <h2 className="text-xl font-bold mb-2">Conta Fechada com Sucesso!</h2>
            <p className="text-muted-foreground mb-6">
              A mesa foi liberada e o pedido foi finalizado.
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}