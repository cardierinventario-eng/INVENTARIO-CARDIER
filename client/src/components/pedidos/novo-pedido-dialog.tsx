import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { calculateTotal } from "@/lib/utils";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Printer,
  CreditCard
} from "lucide-react";

// Schema de validação
const formSchema = z.object({
  tipo: z.string().min(1, "Tipo de pedido é obrigatório"),
  mesaId: z.number().optional(),
  clienteId: z.number().optional(),
  nomeCliente: z.string().optional(),
  formaPagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

// Schema para item
const itemSchema = z.object({
  id: z.number(),
  nome: z.string(),
  preco: z.string().or(z.number()),
  quantidade: z.number().min(1),
});

type FormValues = z.infer<typeof formSchema>;
type ItemPedido = z.infer<typeof itemSchema>;

interface NovoPedidoDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NovoPedidoDialog({ open = false, onOpenChange }: NovoPedidoDialogProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itensSelecionados, setItensSelecionados] = useState<ItemPedido[]>([]);
  const [pedidoCriado, setPedidoCriado] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Buscar itens do cardápio
  const { data: cardapioData = [] } = useQuery({
    queryKey: ['/api/cardapio'],
  });
  
  // Type-safe array of itens cardápio
  const itensCardapio = cardapioData as any[];

  // Buscar mesas disponíveis
  const { data: mesasData = [] } = useQuery({
    queryKey: ['/api/mesas'],
  });

  // Buscar clientes
  const { data: clientesData = [] } = useQuery({
    queryKey: ['/api/clientes'],
  });

  // Type-safe array of mesas and clientes
  const mesas = mesasData as any[];
  const clientes = clientesData as any[];
  
  const mesasDisponiveis = mesas.filter((mesa) => mesa.status === 'livre');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "balcao",
      mesaId: undefined,
      clienteId: undefined,
      nomeCliente: "",
      formaPagamento: "dinheiro",
      observacoes: "",
    },
  });

  // Sincronizar estado local e propriedade externa
  useEffect(() => {
    if (isOpen !== open) {
      setIsOpen(open);
    }
  }, [open]);
  
  // Quando o estado local muda, notificar o pai
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Resetar formulário quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setItensSelecionados([]);
      setPedidoCriado(null);
    }
  }, [isOpen, form]);

  // Adicionar item ao pedido
  const adicionarItem = (item: any) => {
    const itemExistente = itensSelecionados.find(i => i.id === item.id);
    
    if (itemExistente) {
      // Incrementar quantidade se já existe
      setItensSelecionados(prev => 
        prev.map(i => i.id === item.id 
          ? { ...i, quantidade: i.quantidade + 1 } 
          : i
        )
      );
    } else {
      // Adicionar novo item
      setItensSelecionados(prev => [
        ...prev, 
        { 
          id: item.id, 
          nome: item.nome, 
          preco: item.preco, 
          quantidade: 1 
        }
      ]);
    }
  };

  // Remover um item do pedido
  const removerItem = (itemId: number) => {
    setItensSelecionados(prev => prev.filter(item => item.id !== itemId));
  };

  // Aumentar quantidade de um item
  const aumentarQuantidade = (itemId: number) => {
    setItensSelecionados(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantidade: item.quantidade + 1 } 
          : item
      )
    );
  };

  // Diminuir quantidade de um item
  const diminuirQuantidade = (itemId: number) => {
    setItensSelecionados(prev => 
      prev.map(item => 
        item.id === itemId && item.quantidade > 1
          ? { ...item, quantidade: item.quantidade - 1 } 
          : item
      )
    );
  };

  // Calcular valor total do pedido
  const valorTotal = itensSelecionados.reduce((total, item) => {
    const preco = typeof item.preco === 'string' ? parseFloat(item.preco) : item.preco;
    return total + (preco * item.quantidade);
  }, 0);

  // Imprimir pedido
  const imprimirPedido = () => {
    if (!pedidoCriado) return;
    
    // Criar um elemento temporário para armazenar o conteúdo para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir a janela de impressão. Verifique se os pop-ups estão permitidos.",
        variant: "destructive",
      });
      return;
    }
    
    // Estilo para impressão
    const style = `
      <style>
        @page {
          size: 80mm 200mm;  /* Tamanho de papel de impressora térmica comum */
          margin: 5mm;      /* Margem reduzida */
        }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 0;
          width: 70mm;      /* Largura para impressora térmica */
          margin: 0 auto;   /* Centralizar conteúdo */
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
          font-size: 14px; 
          font-weight: bold; 
          margin-bottom: 3px; 
        }
        .subtitulo { 
          font-size: 12px; 
          margin-bottom: 3px; 
        }
        .info-row { 
          display: flex; 
          margin-bottom: 3px;
          font-size: 10px;
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
          font-size: 9px;
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
          font-size: 12px;
        }
        .observacoes { 
          margin-top: 8px;
          font-size: 9px;
        }
        .observacoes-titulo { 
          font-weight: bold; 
          margin-bottom: 2px; 
        }
        .footer { 
          margin-top: 10px; 
          text-align: center; 
          font-size: 9px; 
          border-top: 1px solid #ccc; 
          padding-top: 5px; 
        }
      </style>
    `;
    
    // Conteúdo do recibo
    const formaPagamentoTexto = 
      pedidoCriado.formaPagamento === 'dinheiro' ? 'Dinheiro' :
      pedidoCriado.formaPagamento === 'cartao_credito' ? 'Cartão de Crédito' :
      pedidoCriado.formaPagamento === 'cartao_debito' ? 'Cartão de Débito' :
      pedidoCriado.formaPagamento === 'pix' ? 'PIX' : pedidoCriado.formaPagamento;
    
    let tipoTexto = 'Balcão';
    if (pedidoCriado.tipo === 'mesa') {
      const mesa = mesas.find(m => m.id === pedidoCriado.mesaId);
      tipoTexto = `Mesa ${mesa?.numero || ''}`;
    } else if (pedidoCriado.tipo === 'delivery') {
      tipoTexto = 'Delivery';
    }
    
    const dataFormatada = new Date(pedidoCriado.data).toLocaleString('pt-BR');
    
    // Itens do pedido
    let itensHtml = '';
    itensSelecionados.forEach(item => {
      const precoUnitario = typeof item.preco === 'string' ? parseFloat(item.preco) : item.preco;
      const precoTotal = precoUnitario * item.quantidade;
      itensHtml += `
        <tr>
          <td>${item.nome}</td>
          <td style="text-align: center">${item.quantidade}</td>
          <td style="text-align: right">R$ ${precoUnitario.toFixed(2)}</td>
          <td style="text-align: right">R$ ${precoTotal.toFixed(2)}</td>
        </tr>
      `;
    });
    
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pedido #${pedidoCriado.numero}</title>
        ${style}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="titulo">LANCHE FÁCIL</div>
            <div class="subtitulo">COMPROVANTE DE PEDIDO</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Número:</div>
            <div class="info-value">${pedidoCriado.numero}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Data/Hora:</div>
            <div class="info-value">${dataFormatada}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Tipo:</div>
            <div class="info-value">${tipoTexto}</div>
          </div>
          
          ${pedidoCriado.nomeCliente ? `
          <div class="info-row">
            <div class="info-label">Cliente:</div>
            <div class="info-value">${pedidoCriado.nomeCliente}</div>
          </div>
          ` : ''}
          
          <div class="info-row">
            <div class="info-label">Pagamento:</div>
            <div class="info-value">${formaPagamentoTexto}</div>
          </div>
          
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
          
          <div class="total-row">
            TOTAL: R$ ${valorTotal.toFixed(2)}
          </div>
          
          ${pedidoCriado.observacoes ? `
          <div class="observacoes">
            <div class="observacoes-titulo">Observações:</div>
            <div>${pedidoCriado.observacoes}</div>
          </div>
          ` : ''}
          
          <div class="footer">
            Agradecemos pela preferência!<br>
            LANCHE FÁCIL - Seu restaurante completo
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Pequeno atraso para garantir que o conteúdo seja carregado
    setTimeout(() => {
      printWindow.print();
      // Após impressão, fechar a janela
      printWindow.close();
    }, 500);
  };

  const onSubmit = async (data: FormValues) => {
    if (itensSelecionados.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao pedido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Criar pedido
      const novoPedido = {
        ...data,
        numero: Math.floor(Math.random() * 10000), // Número aleatório para o pedido
        data: new Date(),
        valorTotal: valorTotal.toString(),
        status: "pendente",
      };

      console.log("Enviando pedido:", novoPedido);
      
      // Enviando pedido para o servidor
      const pedidoCriado = await apiRequest("POST", "/api/pedidos", novoPedido);
      
      console.log("Resposta do servidor:", pedidoCriado);
      
      if (!pedidoCriado || typeof pedidoCriado !== 'object' || !pedidoCriado.id) {
        console.error("Resposta inválida:", pedidoCriado);
        throw new Error("Erro ao criar pedido: resposta inválida");
      }
    
      // Adicionar itens ao pedido
      const pedidoId = pedidoCriado.id;
      
      try {
        // Usar endpoint simplificado com os campos corretos
        for (const item of itensSelecionados) {
          await apiRequest("POST", "/api/pedidos/itens", {
            pedidoId: pedidoId,
            itemCardapioId: item.id,  // Nome correto do campo conforme o schema
            nome: item.nome,
            preco: typeof item.preco === 'string' ? item.preco : item.preco.toString(),
            quantidade: item.quantidade,
            observacoes: ""  // Campo opcional mas incluído para completar o schema
          });
        }
      } catch (itemError) {
        console.error("Erro ao adicionar itens ao pedido:", itemError);
        // Mesmo com erro nos itens, consideramos que o pedido foi criado com sucesso
      }
      
      toast({
        title: "Pedido criado",
        description: "O pedido foi registrado com sucesso",
        variant: "success",
      });
      
      // Atualizar status da mesa se necessário
      if (data.tipo === "mesa" && data.mesaId) {
        await apiRequest("PATCH", `/api/mesas/${data.mesaId}/status`, {
          status: "ocupada"
        });
      }
      
      // Invalidar cache para atualizar listagens
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      
      // Guardar o pedido criado para impressão
      setPedidoCriado({...pedidoCriado, ...novoPedido});
      
      // Iniciar processo de impressão automaticamente
      setTimeout(() => {
        imprimirPedido();
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o pedido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-dark text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Registre um novo pedido adicionando itens e preenchendo as informações necessárias.
          </DialogDescription>
        </DialogHeader>
        
        {pedidoCriado ? (
          // Exibir tela de confirmação com opção de impressão quando o pedido for criado
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold mb-2 text-primary">Pedido Criado!</div>
              <p className="text-muted-foreground">Pedido #{pedidoCriado.numero} foi registrado com sucesso.</p>
            </div>
            
            <Button 
              onClick={imprimirPedido} 
              className="mb-4 bg-primary hover:bg-primary-dark text-white"
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimir Comprovante
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setIsOpen(false);
                // Garantir que o estado seja resetado para o próximo uso
                setTimeout(() => setPedidoCriado(null), 500);
              }}
            >
              Fechar
            </Button>
          </div>
        ) : (
          // Formulário de criação de pedido
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Seletor de itens */}
              <div className="md:col-span-5 border rounded-md p-4 h-[300px] overflow-y-auto">
                <h3 className="font-semibold mb-2">Itens do Cardápio</h3>
                <div className="space-y-2">
                  {itensCardapio.filter((item: any) => item.disponivel).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">R$ {typeof item.preco === 'number' ? item.preco.toFixed(2) : item.preco}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => adicionarItem(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Resumo do pedido */}
              <div className="md:col-span-7 border rounded-md p-4 h-[300px] flex flex-col">
                <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                <div className="flex-grow overflow-y-auto">
                  {itensSelecionados.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="mx-auto h-10 w-10 mb-2 opacity-30" />
                      <p>Selecione itens do cardápio para adicionar ao pedido</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Qtd</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itensSelecionados.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nome}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0" 
                                  onClick={() => diminuirQuantidade(item.id)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="mx-2">{item.quantidade}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 w-7 p-0" 
                                  onClick={() => aumentarQuantidade(item.id)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              R$ {(parseFloat(item.preco.toString()) * item.quantidade).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive" 
                                onClick={() => removerItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>R$ {valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Pedido*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="balcao">Balcão</SelectItem>
                            <SelectItem value="mesa">Mesa</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("tipo") === "mesa" && (
                    <FormField
                      control={form.control}
                      name="mesaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mesa*</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a mesa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mesasDisponiveis.map((mesa: any) => (
                                <SelectItem key={mesa.id} value={mesa.id.toString()}>
                                  Mesa {mesa.numero} - {mesa.capacidade} lugares
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="nomeCliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="formaPagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a forma de pagamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                            <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Observações sobre o pedido" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || itensSelecionados.length === 0}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    {isSubmitting ? "Enviando..." : "Criar Pedido"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}