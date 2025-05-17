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

export function NovoPedidoDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itensSelecionados, setItensSelecionados] = useState<ItemPedido[]>([]);
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

  // Resetar formulário quando modal é fechado
  useEffect(() => {
    if (!open) {
      form.reset();
      setItensSelecionados([]);
    }
  }, [open, form]);

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
      // Criar o pedido primeiro
      const novoPedido = {
        ...data,
        numero: Math.floor(Math.random() * 10000), // Número aleatório para o pedido
        valorTotal: valorTotal.toString(),
        status: "pendente",
      };

      console.log("Enviando pedido:", novoPedido);
      
      const pedidoCriado = await apiRequest("POST", "/api/pedidos", novoPedido);
      
      // Adicionar itens ao pedido
      const pedidoId = pedidoCriado.id;
      const promisesItens = itensSelecionados.map(item => 
        apiRequest("POST", `/api/pedidos/${pedidoId}/itens`, {
          pedidoId,
          itemId: item.id,
          nome: item.nome,
          preco: typeof item.preco === 'string' ? item.preco : item.preco.toString(),
          quantidade: item.quantidade
        })
      );
      
      await Promise.all(promisesItens);
      
      toast({
        title: "Pedido criado",
        description: "O pedido foi registrado com sucesso",
        variant: "success",
      });
      
      // Invalidar cache para atualizar listagens
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      
      // Fechar modal e resetar form
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-dark text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Registre um novo pedido adicionando itens e preenchendo as informações necessárias.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Seletor de itens */}
          <div className="md:col-span-5 border rounded-md p-4 h-[400px] overflow-y-auto">
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
          <div className="md:col-span-7 border rounded-md p-4 h-[400px] flex flex-col">
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
                        <SelectItem value="credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="debito">Cartão de Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Alguma observação sobre o pedido..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || itensSelecionados.length === 0}
                className="bg-primary"
              >
                {isSubmitting ? "Finalizando..." : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Finalizar Pedido
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}