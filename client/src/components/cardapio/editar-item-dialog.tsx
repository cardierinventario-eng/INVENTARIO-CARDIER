import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ItemCardapio } from "@shared/schema";

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
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";

// Schema de validação
const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  preco: z.string().min(1, "Preço é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  categoriaId: z.number().default(1),
  disponivel: z.boolean().default(true),
  imagem: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditarItemDialogProps {
  item: ItemCardapio;
  categorias?: string[];
  trigger?: React.ReactNode;
}

export function EditarItemDialog({ item, categorias = [], trigger }: EditarItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: item.nome || "",
      descricao: item.descricao || "",
      preco: String(item.preco || ""),
      categoria: item.categoria || "",
      categoriaId: Number(item.categoriaId || 1),
      disponivel: Boolean(item.disponivel !== false),
      imagem: item.imagem || "",
    },
  });

  // Atualizar form quando o item mudar
  useEffect(() => {
    if (item) {
      form.reset({
        nome: item.nome || "",
        descricao: item.descricao || "",
        preco: String(item.preco || ""),
        categoria: item.categoria || "",
        categoriaId: Number(item.categoriaId || 1),
        disponivel: Boolean(item.disponivel !== false),
        imagem: item.imagem || "",
      });
    }
  }, [item, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Preparando os dados para envio
      const payloadData = {
        ...data,
        // Garantir que o preço é uma string no formato correto para decimal
        preco: data.preco.replace(",", "."),
        // Garantir que categoriaId é um número
        categoriaId: 1
      };
      
      console.log("Enviando dados para atualização:", payloadData);
      
      await apiRequest(`/api/cardapio/${item.id}`, "PATCH", payloadData);
      
      toast({
        title: "Item atualizado",
        description: "O item foi atualizado com sucesso.",
        variant: "success",
      });
      
      // Invalidar cache para atualizar listagem
      queryClient.invalidateQueries({ queryKey: ['/api/cardapio'] });
      
      // Fechar dialog
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item.",
        variant: "destructive",
      });
      console.error("Erro ao enviar formulário de edição:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Item do Cardápio</DialogTitle>
          <DialogDescription>
            Altere os detalhes do item selecionado.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: X-Burguer" {...field} />
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
                      placeholder="Detalhe os ingredientes e características do item" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria*</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.length > 0 ? (
                            categorias.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="Lanches">Lanches</SelectItem>
                              <SelectItem value="Porções">Porções</SelectItem>
                              <SelectItem value="Bebidas">Bebidas</SelectItem>
                              <SelectItem value="Sobremesas">Sobremesas</SelectItem>
                              <SelectItem value="Combos">Combos</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0,00" 
                        {...field} 
                        onChange={(e) => {
                          // Formatação para aceitar valores numéricos e vírgula
                          const value = e.target.value.replace(/[^0-9,.]/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="disponivel"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Disponível</FormLabel>
                    <FormDescription>
                      Indica se o item está disponível para pedidos
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}