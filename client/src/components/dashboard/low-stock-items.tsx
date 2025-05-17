import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertTriangle, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type ItemEstoque } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LowStockItems() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: itensEstoqueBaixo, isLoading } = useQuery<ItemEstoque[]>({
    queryKey: ['/api/estoque/baixo'],
  });

  // Função para ajustar o estoque diretamente
  const ajustarEstoque = async (itemId: number) => {
    if (!quantidade || quantidade <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Informe uma quantidade válida para ajustar o estoque",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiRequest(`/api/estoque/${itemId}/ajustar`, 'PATCH', { 
        quantidade 
      });
      
      // Atualizar os dados após o ajuste
      queryClient.invalidateQueries({ queryKey: ['/api/estoque'] });
      queryClient.invalidateQueries({ queryKey: ['/api/estoque/baixo'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Registra a movimentação de estoque
      await apiRequest(`/api/estoque/movimentacoes`, 'POST', {
        itemEstoqueId: itemId,
        tipo: "entrada",
        quantidade,
        responsavel: "Usuário",
        observacoes: "Ajuste rápido via dashboard"
      });
      
      toast({
        title: "Estoque ajustado",
        description: `O estoque foi ajustado com sucesso!`,
      });
      
      setOpenDialog(null);
    } catch (error) {
      toast({
        title: "Erro ao ajustar estoque",
        description: "Não foi possível ajustar o estoque do item",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemById = (id: number) => {
    if (!itensEstoqueBaixo) return null;
    return itensEstoqueBaixo.find(item => item.id === id);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-5 border-b border-neutral-light flex justify-between items-center">
          <h2 className="font-heading font-bold text-lg">Estoque Baixo</h2>
          <Link href="/estoque" className="text-sm text-primary hover:text-primary-dark">
            Ver todos
          </Link>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, index) => (
                <div key={index} className="p-3 bg-neutral-lightest rounded-lg">
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {itensEstoqueBaixo && itensEstoqueBaixo.length > 0 ? (
                itensEstoqueBaixo.map((item) => {
                  // Define o estilo com base no nível de estoque
                  const qtd = Number(item.quantidade);
                  const minimo = Number(item.estoqueMinimo);
                  const isVeryLow = qtd <= minimo * 0.5;
                  const dotColor = isVeryLow ? "bg-destructive" : "bg-warning";
                  const textColor = isVeryLow ? "text-destructive" : "text-warning";
                  const percent = Math.round((qtd / minimo) * 100);
                  
                  return (
                    <li 
                      key={item.id} 
                      className="flex justify-between items-center p-3 bg-neutral-lightest rounded-lg hover:bg-neutral-light transition-colors"
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 ${dotColor} rounded-full mr-3`}></div>
                        <div>
                          <span className="block">{item.nome}</span>
                          <span className="text-xs text-neutral-medium">Mínimo: {item.estoqueMinimo} {item.unidade}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className={`text-sm ${textColor} font-medium`}>
                          {item.quantidade} {item.unidade}
                          <span className="text-xs block text-center">({percent}%)</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setOpenDialog(item.id);
                            setQuantidade(1);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="p-5 text-center text-neutral-dark flex flex-col items-center">
                  <AlertTriangle className="h-8 w-8 mb-2 text-success" />
                  <span>Nenhum item com estoque baixo</span>
                </li>
              )}
            </ul>
          )}
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              asChild
            >
              <Link href="/estoque/novo">
                <Plus className="mr-1 h-4 w-4" />
                Novo Item
              </Link>
            </Button>
            
            <Button 
              className="w-full py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition"
              asChild
            >
              <Link href="/estoque">
                <ArrowUpCircle className="mr-1 h-4 w-4" />
                Ajustar Estoque
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de Ajuste Rápido de Estoque */}
      <Dialog open={openDialog !== null} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          {openDialog !== null && (
            <>
              <DialogHeader>
                <DialogTitle>Ajustar Estoque</DialogTitle>
                <DialogDescription>
                  {(() => {
                    const item = getItemById(openDialog);
                    if (!item) return "Carregando informações do item...";
                    return `Adicionar unidades ao estoque de ${item.nome}. Nível atual: ${item.quantidade} ${item.unidade}`;
                  })()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade a adicionar</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setOpenDialog(null)} 
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => ajustarEstoque(openDialog)} 
                  disabled={isSubmitting || quantidade <= 0}
                >
                  {isSubmitting ? "Ajustando..." : "Confirmar Ajuste"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
