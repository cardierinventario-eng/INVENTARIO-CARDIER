import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Schema de validação
const formSchema = z.object({
  formaPagamento: z.string().min(1, "Forma de pagamento é obrigatória"),
  observacoes: z.string().optional(),
  status: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditarPedidoDialogProps {
  pedido: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarPedidoDialog({ pedido, isOpen, onOpenChange }: EditarPedidoDialogProps) {
  // Prevenção contra props undefined
  if (!pedido || !onOpenChange) {
    return null;
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      formaPagamento: pedido?.formaPagamento || "dinheiro",
      observacoes: pedido?.observacoes || "",
      status: pedido?.status || "pendente",
    },
  });

  // Resetar formulário quando o pedido mudar
  useEffect(() => {
    if (pedido) {
      form.reset({
        formaPagamento: pedido.formaPagamento || "dinheiro",
        observacoes: pedido.observacoes || "",
        status: pedido.status || "pendente",
      });
    }
  }, [pedido, form]);

  const onSubmit = async (data: FormValues) => {
    if (!pedido?.id) return;

    setIsSubmitting(true);
    try {
      // Atualizar o pedido
      await apiRequest("PATCH", `/api/pedidos/${pedido.id}`, data);
      
      toast({
        title: "Pedido atualizado",
        description: "As informações do pedido foram atualizadas com sucesso",
        variant: "success",
      });
      
      // Invalidar cache para atualizar listagens
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pedidos/recentes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Fechar modal
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pedido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Pedido #{pedido?.numero}</DialogTitle>
          <DialogDescription>
            Atualize as informações deste pedido conforme necessário.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="fiado">Fiado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do Pedido</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_preparo">Em Preparo</SelectItem>
                      <SelectItem value="pronto">Pronto</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o pedido"
                      {...field}
                      rows={3}
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
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-primary"
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}