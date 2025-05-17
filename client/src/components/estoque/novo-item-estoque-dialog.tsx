import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

// Schema de validação
const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  categoria: z.string().min(2, "Categoria é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  quantidade: z.coerce.number().min(0, "Quantidade não pode ser negativa"),
  estoqueMinimo: z.coerce.number().min(0, "Estoque mínimo não pode ser negativo"),
  estoqueIdeal: z.coerce.number().min(0, "Estoque ideal não pode ser negativo"),
  precoUnitario: z.string().min(1, "Preço unitário é obrigatório"),
  descricao: z.string().optional(),
  localArmazenamento: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NovoItemEstoqueDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      categoria: "",
      unidade: "unidade",
      quantidade: 0,
      estoqueMinimo: 5,
      estoqueIdeal: 20,
      precoUnitario: "",
      descricao: "",
      localArmazenamento: "",
    },
  });
  
  // Reset form quando o diálogo é fechado
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const novoItem = {
        nome: data.nome,
        categoria: data.categoria,
        descricao: data.descricao || "",
        quantidade: data.quantidade,
        unidade: data.unidade,
        valorUnitario: data.precoUnitario.replace(",", "."),
        estoqueMinimo: data.estoqueMinimo,
        estoqueIdeal: data.estoqueIdeal
      };
      
      await apiRequest("/api/estoque", "POST", novoItem);
      
      toast({
        title: "Item adicionado",
        description: "O item foi adicionado ao estoque com sucesso",
        variant: "success",
      });
      
      // Registrar a movimentação de estoque será implementada depois
      // Pois estamos focando em corrigir o cadastro de itens primeiro
      
      // Invalidar cache para atualizar listagens
      queryClient.invalidateQueries({ queryKey: ['/api/estoque'] });
      queryClient.invalidateQueries({ queryKey: ['/api/estoque/baixo'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Fechar dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item ao estoque",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-dark text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item ao Estoque</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo item que será adicionado ao estoque.
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
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Inicial*</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
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
                    <FormLabel>Unidade de Medida*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: kg, unidade, pacote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
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
                {isSubmitting ? "Adicionando..." : "Adicionar Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}