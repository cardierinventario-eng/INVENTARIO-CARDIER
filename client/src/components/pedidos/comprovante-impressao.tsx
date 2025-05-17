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
  
  // Função para imprimir comprovante selecionado
  const imprimirComprovante = () => {
    if (!pedido || itensPedido.length === 0) return;
    
    // Determinar título e conteúdo específico para cada tipo
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
    
    // Cria uma janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Não foi possível abrir a janela de impressão. Verifique se os pop-ups estão permitidos.");
      return;
    }
    
    // Estilo CSS do comprovante
    const style = `
      <style>
        @page {
          size: 80mm 200mm;
          margin: 5mm;
        }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 0;
          width: 70mm;
          margin: 0 auto;
        }
        .container {
          width: 100%;
          max-width: 70mm;
          margin: 0 auto;
        }
        .header { 
          text-align: center; 
          margin-bottom: 10px; 
          border-bottom: 1px solid #ccc; 
          padding-bottom: 5px; 
        }
        .titulo { 
          font-size: 18px; 
          font-weight: bold; 
          margin-bottom: 3px; 
        }
        .subtitulo { 
          font-size: 16px; 
          margin-bottom: 3px; 
        }
        .info-row { 
          display: flex; 
          margin-bottom: 5px;
          font-size: 14px;
        }
        .info-label { 
          font-weight: bold; 
          width: 80px; 
        }
        .info-value { 
          flex: 1; 
        }
        .tabela { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 8px 0;
          font-size: 13px;
        }
        .tabela th, .tabela td { 
          border-bottom: 1px solid #eee; 
          padding: 4px; 
          text-align: left; 
        }
        .tabela th { 
          font-weight: bold; 
          border-bottom: 1px solid #ddd; 
        }
        .total-row { 
          font-weight: bold; 
          margin-top: 8px;
          margin-bottom: 8px;
          text-align: right;
          font-size: 16px;
        }
        .observacoes { 
          margin-top: 8px;
          font-size: 13px;
        }
        .observacoes-titulo { 
          font-weight: bold; 
          margin-bottom: 2px; 
        }
        .footer { 
          margin-top: 10px; 
          text-align: center; 
          font-size: 13px; 
          border-top: 1px solid #ccc; 
          padding-top: 5px; 
        }
        .emphasis {
          font-weight: bold;
          font-size: 15px;
        }
        .grande {
          font-size: 18px;
          font-weight: bold;
        }
        .destaque {
          background-color: #f5f5f5;
          padding: 3px;
          border-radius: 3px;
        }
      </style>
    `;
    
    // Variáveis para exibição
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
    itensPedido.forEach((item: any) => {
      const precoUnitario = parseFloat(item.preco);
      const precoTotal = precoUnitario * item.quantidade;
      
      if (tipoComprovante === "cozinha") {
        // Formato simplificado para cozinha
        itensHtml += `
          <tr>
            <td class="emphasis">${item.quantidade}x</td>
            <td class="emphasis">${item.nome}</td>
            ${item.observacoes ? `<td>${item.observacoes}</td>` : '<td></td>'}
          </tr>
        `;
      } else {
        // Formato completo com preços
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
    
    // Cabeçalho customizado por tipo
    let cabecalhoPersonalizado = '';
    if (tipoComprovante === "cozinha") {
      cabecalhoPersonalizado = `
        <div style="text-align: center; margin: 10px 0; padding: 5px; border: 1px dashed #000;">
          <div class="grande">PEDIDO PARA PREPARO</div>
          <div class="grande">${tipoTexto}</div>
        </div>
      `;
    }
    
    // Conteúdo do comprovante
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprovante #${pedido.numero}</title>
        ${style}
      </head>
      <body>
        <div class="container">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="font-size: 14px;">${dataFormatada.split(' ')[0]}</div>
            <div style="font-size: 14px;">Pedido</div>
          </div>
          
          <div style="text-align: right; margin-bottom: 10px;">
            <div style="font-size: 14px; margin-right: 5px;">Pedido</div>
          </div>
          
          <div class="header">
            <div class="titulo">${titulo}</div>
            <div class="subtitulo">${subtitulo}</div>
          </div>
          
          ${cabecalhoPersonalizado}
          
          <div class="info-row">
            <div class="info-label">Número:</div>
            <div class="info-value">${pedido.numero}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Data/Hora:</div>
            <div class="info-value">${dataFormatada}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Tipo:</div>
            <div class="info-value">${tipoTexto}</div>
          </div>
          
          ${pedido.nomeCliente ? `
          <div class="info-row">
            <div class="info-label">Cliente:</div>
            <div class="info-value">${pedido.nomeCliente}</div>
          </div>
          ` : ''}
          
          ${incluirPrecos ? `
          <div class="info-row">
            <div class="info-label">Pagamento:</div>
            <div class="info-value">${formaPagamentoTexto}</div>
          </div>
          ` : ''}
          
          ${tipoComprovante === "cozinha" ? `
          <table class="tabela">
            <thead>
              <tr>
                <th>Qtd</th>
                <th>Item</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${itensHtml}
            </tbody>
          </table>
          ` : `
          <table class="tabela">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center">Qtd</th>
                <th style="text-align: right">Preço</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itensHtml}
            </tbody>
          </table>
          `}
          
          ${incluirTotais ? `
          <div class="total-row">
            TOTAL: R$ ${parseFloat(pedido.valorTotal).toFixed(2)}
          </div>
          ` : ''}
          
          ${incluirObservacoes && pedido.observacoes ? `
          <div class="observacoes">
            <div class="observacoes-titulo">Observações:</div>
            <div>${pedido.observacoes}</div>
          </div>
          ` : ''}
          
          ${incluirRodape ? `
          <div class="footer">
            Agradecemos pela preferência!<br>
            LANCHE FÁCIL - Seu restaurante completo
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
    
    // Escrever o conteúdo e imprimir
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Pequeno atraso para garantir que o conteúdo seja carregado
    setTimeout(() => {
      printWindow.print();
      // Não fechar automaticamente para permitir que o usuário veja a visualização
    }, 500);
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