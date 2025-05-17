import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type ItemEstoque } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

// Schema de validação para o formulário
const formSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  categoria: z.string().min(1, { message: "Categoria é obrigatória" }),
  descricao: z.string().optional(),
  quantidade: z.string().or(z.number()).transform(val => val.toString()),
  unidade: z.string().min(1, { message: "Unidade é obrigatória" }),
  valorUnitario: z.string().min(1, { message: "Valor unitário é obrigatório" }),
  estoqueMinimo: z.string().or(z.number()).transform(val => val.toString()),
  estoqueIdeal: z.string().or(z.number()).transform(val => val.toString()),
});

type FormValues = z.infer<typeof formSchema>;

interface EditarItemEstoqueDialogProps {
  item: ItemEstoque;
  children?: React.ReactNode;
}

export function EditarItemEstoqueDialog({ item, children }: EditarItemEstoqueDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: item.nome,
      categoria: item.categoria,
      descricao: item.descricao || "",
      quantidade: item.quantidade,
      unidade: item.unidade,
      valorUnitario: item.valorUnitario,
      estoqueMinimo: item.estoqueMinimo,
      estoqueIdeal: item.estoqueIdeal
    },
  });

  // Atualizar o formulário quando o item mudar
  useEffect(() => {
    if (item) {
      form.reset({
        nome: item.nome,
        categoria: item.categoria,
        descricao: item.descricao || "",
        quantidade: item.quantidade,
        unidade: item.unidade,
        valorUnitario: item.valorUnitario,
        estoqueMinimo: item.estoqueMinimo,
        estoqueIdeal: item.estoqueIdeal
      });
    }
  }, [item, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const itemAtualizado = {
        nome: data.nome,
        categoria: data.categoria,
        descricao: data.descricao || "",
        quantidade: data.quantidade,
        unidade: data.unidade,
        valorUnitario: data.valorUnitario.replace(",", "."),
        estoqueMinimo: data.estoqueMinimo,
        estoqueIdeal: data.estoqueIdeal
      };
      
      await apiRequest(`/api/estoque/${item.id}`, "PATCH", itemAtualizado);
      
      queryClient.invalidateQueries({ queryKey: ['/api/estoque'] });
      queryClient.invalidateQueries({ queryKey: ['/api/estoque/baixo'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Item atualizado",
        description: "O item foi atualizado com sucesso!",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Item de Estoque</DialogTitle>
          <DialogDescription>
            Atualize as informações do item no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria*</FormLabel>
                  <FormControl>
                    <Input placeholder="Categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="1" 
                        placeholder="Quantidade"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade*</FormLabel>
                    <FormControl>
                      <Input placeholder="un, kg, l, etc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="valorUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0,00" 
                        {...field}
                        onChange={(e) => {
                          // Formatar para formato monetário
                          let value = e.target.value.replace(/[^0-9,]/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estoqueMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="1" 
                        placeholder="Mínimo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estoqueIdeal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Ideal*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="1" 
                        placeholder="Ideal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
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