import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Printer, ChefHat, Receipt, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImpressaoSimplesProps {
  pedidoId: number;
  mesaId?: number;
  trigger?: React.ReactNode;
}

export function ImpressaoSimples({ 
  pedidoId, 
  mesaId, 
  trigger
}: ImpressaoSimplesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tipoComprovante, setTipoComprovante] = useState<string>("cozinha");
  
  // Buscar dados do pedido
  const { data: pedido, isLoading: pedidoLoading } = useQuery({
    queryKey: ['/api/pedidos', pedidoId],
    enabled: !!pedidoId && isOpen,
  });
  
  // Buscar itens do pedido
  const { data: itensPedido = [], isLoading: itensLoading } = useQuery({
    queryKey: [`/api/pedidos/${pedidoId}/itens`],
    enabled: !!pedidoId && isOpen,
  });
  
  // Buscar dados da mesa se houver
  const { data: mesa } = useQuery({
    queryKey: ['/api/mesas', mesaId],
    enabled: !!mesaId && isOpen,
  });
  
  const isLoading = pedidoLoading || itensLoading;
  
  // Função para imprimir usando método nativo do navegador
  const handleImprimir = () => {
    if (!pedido || !Array.isArray(itensPedido) || itensPedido.length === 0) {
      alert("Dados do pedido não encontrados para impressão.");
      return;
    }

    // Criar conteúdo HTML para impressão
    const conteudo = criarConteudoImpressao();
    
    // Criar janela de impressão ou usar método alternativo
    const novaJanela = window.open('', '_blank', 'width=800,height=600');
    
    if (novaJanela) {
      // Se conseguiu abrir janela
      novaJanela.document.write(conteudo);
      novaJanela.document.close();
      novaJanela.focus();
      
      setTimeout(() => {
        novaJanela.print();
      }, 500);
    } else {
      // Método alternativo para dispositivos móveis
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      
      document.body.appendChild(iframe);
      
      if (iframe.contentWindow) {
        iframe.contentWindow.document.write(conteudo);
        iframe.contentWindow.document.close();
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      } else {
        // Último recurso: copiar para área de transferência
        navigator.clipboard.writeText(conteudo.replace(/<[^>]*>/g, '')).then(() => {
          alert("Conteúdo copiado para área de transferência! Cole em um editor de texto e imprima.");
        }).catch(() => {
          alert("Não foi possível imprimir. Tente novamente ou use um navegador diferente.");
        });
      }
    }
    
    setIsOpen(false);
  };

  const criarConteudoImpressao = () => {
    if (!pedido) return '';

    let titulo = "LANCHE FÁCIL";
    let subtitulo = "";
    let incluirPrecos = true;
    let incluirTotais = true;
    
    switch (tipoComprovante) {
      case "cozinha":
        subtitulo = "COMANDA PARA COZINHA";
        incluirPrecos = false;
        incluirTotais = false;
        break;
      case "cliente":
        subtitulo = "COMPROVANTE DE PEDIDO";
        break;
      case "conta":
        subtitulo = "NOTA PARA FECHAMENTO";
        break;
    }

    const dataFormatada = (pedido as any).dataCriacao ? 
      new Date((pedido as any).dataCriacao).toLocaleString('pt-BR') : 
      new Date().toLocaleString('pt-BR');
    
    const formaPagamentoTexto = 
      (pedido as any).formaPagamento === 'dinheiro' ? 'Dinheiro' :
      (pedido as any).formaPagamento === 'cartao_credito' ? 'Cartão de Crédito' :
      (pedido as any).formaPagamento === 'cartao_debito' ? 'Cartão de Débito' :
      (pedido as any).formaPagamento === 'pix' ? 'PIX' : 
      (pedido as any).formaPagamento || '-';
    
    let tipoTexto = 'Balcão';
    if ((pedido as any).tipo === 'mesa') {
      tipoTexto = `Mesa ${(mesa as any)?.numero || mesaId || ''}`;
    } else if ((pedido as any).tipo === 'delivery') {
      tipoTexto = 'Delivery';
    }

    // Criar lista de itens
    let itensTexto = '';
    let valorTotal = 0;
    
    if (Array.isArray(itensPedido)) {
      itensPedido.forEach((item: any) => {
        const preco = parseFloat(item.preco || 0);
        const subtotal = preco * item.quantidade;
        valorTotal += subtotal;
        
        if (tipoComprovante === "cozinha") {
          itensTexto += `${item.quantidade}x ${item.nome}`;
          if (item.observacoes) {
            itensTexto += ` (${item.observacoes})`;
          }
          itensTexto += '\n';
        } else {
          itensTexto += `${item.nome} - ${item.quantidade}x R$ ${preco.toFixed(2)} = R$ ${subtotal.toFixed(2)}\n`;
        }
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprovante #${(pedido as any).numero}</title>
        <style>
          @page { size: 80mm auto; margin: 5mm; }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12px;
            margin: 0; 
            padding: 10px;
            max-width: 70mm;
          }
          .centro { text-align: center; }
          .negrito { font-weight: bold; }
          .linha { border-bottom: 1px dashed #000; margin: 5px 0; }
          .espacamento { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="centro negrito" style="font-size: 16px;">${titulo}</div>
        <div class="centro" style="font-size: 14px;">${subtitulo}</div>
        <div class="linha"></div>
        
        <div><strong>Pedido:</strong> ${(pedido as any).numero}</div>
        <div><strong>Data/Hora:</strong> ${dataFormatada}</div>
        <div><strong>Tipo:</strong> ${tipoTexto}</div>
        ${(pedido as any).nomeCliente ? `<div><strong>Cliente:</strong> ${(pedido as any).nomeCliente}</div>` : ''}
        ${incluirPrecos ? `<div><strong>Pagamento:</strong> ${formaPagamentoTexto}</div>` : ''}
        
        <div class="linha"></div>
        <div class="negrito">ITENS:</div>
        <pre style="font-family: Arial; font-size: 12px; white-space: pre-wrap;">${itensTexto}</pre>
        
        ${incluirTotais ? `
        <div class="linha"></div>
        <div class="negrito" style="text-align: right; font-size: 14px;">
          TOTAL: R$ ${valorTotal.toFixed(2)}
        </div>
        ` : ''}
        
        ${(pedido as any).observacoes ? `
        <div class="linha"></div>
        <div><strong>Observações:</strong></div>
        <div>${(pedido as any).observacoes}</div>
        ` : ''}
        
        <div class="espacamento linha"></div>
        <div class="centro" style="font-size: 11px;">
          Agradecemos pela preferência!<br>
          LANCHE FÁCIL - Seu restaurante completo
        </div>
      </body>
      </html>
    `;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir Comprovante</DialogTitle>
          <DialogDescription>
            Selecione o tipo de comprovante que deseja imprimir.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-6 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Carregando dados do pedido...</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="cozinha" className="w-full" onValueChange={setTipoComprovante}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cozinha" className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  Cozinha
                </TabsTrigger>
                <TabsTrigger value="cliente" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Cliente
                </TabsTrigger>
                <TabsTrigger value="conta" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Conta
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="cozinha" className="mt-6">
                <div className="text-center p-4 border rounded-md">
                  <ChefHat className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Comanda para Cozinha</h3>
                  <p className="text-sm mb-4">
                    Impressão de comanda para a equipe da cozinha com os itens do pedido.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="cliente" className="mt-6">
                <div className="text-center p-4 border rounded-md">
                  <Receipt className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Comprovante para Cliente</h3>
                  <p className="text-sm mb-4">
                    Impressão do comprovante de pedido para entregar ao cliente.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="conta" className="mt-6">
                <div className="text-center p-4 border rounded-md">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Nota para Fechamento</h3>
                  <p className="text-sm mb-4">
                    Impressão da nota fiscal para fechamento da conta.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImprimir} className="bg-primary">
                <Printer className="mr-2 h-4 w-4" /> Imprimir Agora
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}