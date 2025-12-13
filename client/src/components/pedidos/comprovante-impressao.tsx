import { useState } from "react";
import { type Pedido, type ItemPedido, type Mesa } from "@shared/schema";
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

interface ComprovanteTipos {
  cozinha: boolean;
  cliente: boolean;
  conta: boolean;
}

interface ComprovanteImpressaoProps {
  pedidoId: number;
  mesaId?: number;
  trigger?: React.ReactNode;
  tiposDisponiveis?: ComprovanteTipos;
}

export function ComprovanteImpressao({ 
  pedidoId, 
  mesaId, 
  trigger,
  tiposDisponiveis = { cozinha: true, cliente: true, conta: true }
}: ComprovanteImpressaoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tipoComprovante, setTipoComprovante] = useState<string>("cozinha");
  
  // Buscar dados do pedido
  const { data: pedido, isLoading: pedidoLoading } = useQuery<Pedido>({
    queryKey: ['/api/pedidos', pedidoId],
    enabled: !!pedidoId && isOpen,
  });
  
  // Buscar itens do pedido
  const { data: itensPedido = [], isLoading: itensLoading } = useQuery<ItemPedido[]>({
    queryKey: [`/api/pedidos/${pedidoId}/itens`],
    enabled: !!pedidoId && isOpen,
  });
  
  // Buscar dados da mesa se houver
  const { data: mesa } = useQuery<Mesa>({
    queryKey: ['/api/mesas', mesaId],
    enabled: !!mesaId && isOpen,
  });
  
  const isLoading = pedidoLoading || itensLoading;
  
  // Função para imprimir na página atual (método alternativo)
  const imprimirNaPaginaAtual = () => {
    if (!pedido || !itensPedido) return;
    
    // Criar o conteúdo do comprovante
    const content = gerarConteudoComprovante();
    
    // Criar elemento temporário para impressão
    const printElement = document.createElement('div');
    printElement.innerHTML = content;
    printElement.style.display = 'none';
    printElement.id = 'print-content';
    
    // Adicionar ao DOM
    document.body.appendChild(printElement);
    
    // Criar CSS para impressão
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #print-content, #print-content * { visibility: visible; }
        #print-content { position: absolute; left: 0; top: 0; width: 100%; }
        @page { size: 80mm 200mm; margin: 5mm; }
      }
    `;
    document.head.appendChild(printStyle);
    
    // Imprimir
    window.print();
    
    // Limpar após impressão
    setTimeout(() => {
      document.body.removeChild(printElement);
      document.head.removeChild(printStyle);
    }, 1000);
  };

  // Função para gerar conteúdo do comprovante
  const gerarConteudoComprovante = () => {
    if (!pedido || !itensPedido) return '';
    
    let titulo = "LANCHE FÁCIL";
    let subtitulo = "";
    let incluirPrecos = true;
    let incluirObservacoes = true;
    let incluirRodape = true;
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
        incluirObservacoes = true;
        break;
    }
    
    const dataFormatada = pedido.dataCriacao ? 
      new Date(pedido.dataCriacao).toLocaleString('pt-BR') : 
      new Date().toLocaleString('pt-BR');
    
    const formaPagamentoTexto = 
      pedido.formaPagamento === 'dinheiro' ? 'Dinheiro' :
      pedido.formaPagamento === 'cartao_credito' ? 'Cartão de Crédito' :
      pedido.formaPagamento === 'cartao_debito' ? 'Cartão de Débito' :
      pedido.formaPagamento === 'pix' ? 'PIX' : 
      pedido.formaPagamento || '-';
    
    let tipoTexto = 'Balcão';
    if (pedido.tipo === 'mesa') {
      tipoTexto = `Mesa ${mesa?.numero || mesaId || ''}`;
    } else if (pedido.tipo === 'delivery') {
      tipoTexto = 'Delivery';
    }
    
    // Itens do pedido em HTML
    let itensHtml = '';
    if (Array.isArray(itensPedido)) {
      itensPedido.forEach((item: any) => {
        const precoUnitario = parseFloat(item.preco);
        const precoTotal = precoUnitario * item.quantidade;
        
        if (tipoComprovante === "cozinha") {
          itensHtml += `
            <tr>
              <td style="font-weight: bold">${item.quantidade}x</td>
              <td style="font-weight: bold">${item.nome}</td>
              ${item.observacoes ? `<td>${item.observacoes}</td>` : '<td></td>'}
            </tr>
          `;
        } else {
          itensHtml += `
            <tr>
              <td>${item.nome}</td>
              <td style="text-align: center">${item.quantidade}</td>
              <td style="text-align: right">R$ ${precoUnitario.toFixed(2)}</td>
              <td style="text-align: right">R$ ${precoTotal.toFixed(2)}</td>
            </tr>
          `;
        }
      });
    }
    
    return `
      <div style="font-family: Arial, sans-serif; width: 70mm; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 3px;">${titulo}</div>
          <div style="font-size: 16px; margin-bottom: 3px;">${subtitulo}</div>
        </div>
        
        ${tipoComprovante === "cozinha" ? `
        <div style="text-align: center; margin: 10px 0; padding: 5px; border: 1px dashed #000;">
          <div style="font-size: 18px; font-weight: bold;">PEDIDO PARA PREPARO</div>
          <div style="font-size: 18px; font-weight: bold;">${tipoTexto}</div>
        </div>
        ` : ''}
        
        <div style="margin-bottom: 5px; font-size: 14px;">
          <strong>Número:</strong> ${pedido.numero}
        </div>
        <div style="margin-bottom: 5px; font-size: 14px;">
          <strong>Data/Hora:</strong> ${dataFormatada}
        </div>
        <div style="margin-bottom: 5px; font-size: 14px;">
          <strong>Tipo:</strong> ${tipoTexto}
        </div>
        
        ${pedido.nomeCliente ? `
        <div style="margin-bottom: 5px; font-size: 14px;">
          <strong>Cliente:</strong> ${pedido.nomeCliente}
        </div>
        ` : ''}
        
        ${incluirPrecos ? `
        <div style="margin-bottom: 5px; font-size: 14px;">
          <strong>Pagamento:</strong> ${formaPagamentoTexto}
        </div>
        ` : ''}
        
        <table style="width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px;">
          <thead>
            <tr>
              ${tipoComprovante === "cozinha" ? `
                <th style="border-bottom: 1px solid #ddd; padding: 4px; text-align: left; font-weight: bold;">Qtd</th>
                <th style="border-bottom: 1px solid #ddd; padding: 4px; text-align: left; font-weight: bold;">Item</th>
                <th style="border-bottom: 1px solid #ddd; padding: 4px; text-align: left; font-weight: bold;">Observações</th>
              ` : `
                <th style="border-bottom: 1px solid #ddd; padding: 4px; text-align: left; font-weight: bold;">Item</th>
                <th style="border-bottom: 1px solid #ddd; padding: 4px; text-align: center; font-weight: bold;">Qtd</th>
                <th style="border-bottom: 1px solid #ddd; padding: 4px; text-align: right; font-weight: bold;">Preço</th>
                <th style="border-bottom: 1px solid #ddd; padding: 4px; text-align: right; font-weight: bold;">Total</th>
              `}
            </tr>
          </thead>
          <tbody>
            ${itensHtml}
          </tbody>
        </table>
        
        ${incluirTotais ? `
        <div style="font-weight: bold; margin-top: 8px; margin-bottom: 8px; text-align: right; font-size: 16px;">
          TOTAL: R$ ${
            Array.isArray(itensPedido) ? 
              itensPedido.reduce((total, item) => {
                const preco = typeof item.preco === 'string' ? parseFloat(item.preco) : item.preco;
                return total + (preco * item.quantidade);
              }, 0).toFixed(2) : 
              "0.00"
          }
        </div>
        ` : ''}
        
        ${incluirObservacoes && pedido.observacoes ? `
        <div style="margin-top: 8px; font-size: 13px;">
          <div style="font-weight: bold; margin-bottom: 2px;">Observações:</div>
          <div>${pedido.observacoes}</div>
        </div>
        ` : ''}
        
        ${incluirRodape ? `
        <div style="margin-top: 10px; text-align: center; font-size: 13px; border-top: 1px solid #ccc; padding-top: 5px;">
          Agradecemos pela preferência!<br>
          LANCHE FÁCIL - Seu restaurante completo
        </div>
        ` : ''}
      </div>
    `;
  };
  
  // Função para imprimir comprovante selecionado
  const imprimirComprovante = () => {
    if (!pedido || !Array.isArray(itensPedido) || itensPedido.length === 0) {
      alert("Dados do pedido não encontrados para impressão.");
      return;
    }
    
    // Usar método que funciona em todos os dispositivos
    imprimirNaPaginaAtual();
  };
  
  return (
    <>
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
                  {tiposDisponiveis.cozinha && (
                    <TabsTrigger value="cozinha" className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4" />
                      Cozinha
                    </TabsTrigger>
                  )}
                  {tiposDisponiveis.cliente && (
                    <TabsTrigger value="cliente" className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Cliente
                    </TabsTrigger>
                  )}
                  {tiposDisponiveis.conta && (
                    <TabsTrigger value="conta" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Conta
                    </TabsTrigger>
                  )}
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
                <Button onClick={imprimirComprovante} className="bg-primary">
                  <Printer className="mr-2 h-4 w-4" /> Imprimir Agora
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}