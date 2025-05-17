import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Schema de validação
const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  categoria: z.string().min(2, "Categoria é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  estoqueMinimo: z.coerce.number().min(0, "Estoque mínimo não pode ser negativo"),
  estoqueIdeal: z.coerce.number().min(0, "Estoque ideal não pode ser negativo"),
  precoUnitario: z.string().min(1, "Preço unitário é obrigatório"),
  descricao: z.string().optional(),
  localArmazenamento: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditarItemEstoqueDialogProps {
  item: any;
  children?: React.ReactNode;
}

export function EditarItemEstoqueDialog({ item, children }: EditarItemEstoqueDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: item.nome,
      categoria: item.categoria,
      unidade: item.unidade,
      estoqueMinimo: item.estoqueMinimo,
      estoqueIdeal: item.estoqueIdeal,
      precoUnitario: item.precoUnitario.toString(),
      descricao: item.descricao || "",
      localArmazenamento: item.localArmazenamento || "",
    },
  });
  
  // Atualizar valores do formulário quando o item mudar
  useEffect(() => {
    if (isOpen) {
      form.reset({
        nome: item.nome,
        categoria: item.categoria,
        unidade: item.unidade,
        estoqueMinimo: item.estoqueMinimo,
        estoqueIdeal: item.estoqueIdeal,
        precoUnitario: item.precoUnitario.toString(),
        descricao: item.descricao || "",
        localArmazenamento: item.localArmazenamento || "",
      });
    }
  }, [isOpen, item, form]);
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const dadosAtualizados = {
        ...data,
        // Garantir que o preço é uma string no formato correto para decimal
        precoUnitario: data.precoUnitario.replace(",", "."),
      };
      
      await apiRequest(`/api/estoque/${item.id}`, "PATCH", dadosAtualizados);
      
      toast({
        title: "Item atualizado",
        description: "As informações do item foram atualizadas com sucesso",
        variant: "success",
      });
      
      // Invalidar cache para atualizar listagens
      queryClient.invalidateQueries({ queryKey: ['/api/estoque'] });
      queryClient.invalidateQueries({ queryKey: ['/api/estoque/baixo'] });
      
      // Fechar dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item do estoque",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Item do Estoque</DialogTitle>
          <DialogDescription>
            Atualize as informações do item "{item.nome}".
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Item*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Batata Frita" {...field} />
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
                      <Input placeholder="Ex: Alimentos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Medida*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: kg, unidade, pacote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="precoUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Unitário*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 10,50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estoqueMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo*</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
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
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="localArmazenamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local de Armazenamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Freezer 1, Prateleira A" {...field} />
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
                    <Textarea 
                      placeholder="Descreva detalhes adicionais sobre o item" 
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
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-dark text-white"
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