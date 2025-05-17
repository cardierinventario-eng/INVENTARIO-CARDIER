import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImprimirPedido, PedidoPDFViewer } from "./imprimir-pedido";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, FileText, Printer } from "lucide-react";

interface PedidoImpressoDialogProps {
  pedidoId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PedidoImpressoDialog({ 
  pedidoId, 
  isOpen, 
  onOpenChange 
}: PedidoImpressoDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("imprimir");

  // Reset active tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("imprimir");
    }
  }, [isOpen]);

  // Buscar dados do pedido
  const { data: pedido, isLoading: pedidoLoading } = useQuery({
    queryKey: ['/api/pedidos', pedidoId],
    enabled: !!pedidoId && isOpen,
  });

  // Buscar itens do pedido
  const { data: itensPedido = [], isLoading: itensLoading } = useQuery({
    queryKey: ['/api/pedidos/itens', pedidoId],
    enabled: !!pedidoId && isOpen,
  });

  const isLoading = pedidoLoading || itensLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Impressão de Pedido</DialogTitle>
          <DialogDescription>
            Visualize e imprima o comprovante do pedido.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando dados do pedido...</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="imprimir" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="imprimir" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </TabsTrigger>
                <TabsTrigger value="visualizar" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Visualizar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="imprimir" className="py-4">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Pedido #{pedido?.numero}</h3>
                  <p className="text-muted-foreground mb-6">
                    Clique no botão abaixo para imprimir o comprovante do pedido.
                  </p>
                  
                  <ImprimirPedido 
                    pedido={pedido} 
                    itensPedido={itensPedido} 
                    autoImprimir={true}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="visualizar">
                <div className="border rounded-lg overflow-hidden">
                  <PedidoPDFViewer pedido={pedido} itensPedido={itensPedido} />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
          
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}