import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

interface AjustarEstoqueDialogProps {
  item: any;
  children?: React.ReactNode;
}

export function AjustarEstoqueDialog({ item, children }: AjustarEstoqueDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoMovimentacao, setTipoMovimentacao] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [observacoes, setObservacoes] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Status do estoque
  const estoqueStatus = 
    item.quantidade <= item.estoqueMinimo ? "baixo" : 
    item.quantidade >= item.estoqueIdeal ? "ideal" : "normal";

  // Resetar quando o diálogo é fechado
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTipoMovimentacao("entrada");
      setQuantidade(1);
      setObservacoes("");
    }
  };

  // Ajustar estoque
  const handleAjustarEstoque = async () => {
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
      // 1. Ajustar a quantidade do item no estoque
      // Na saída, a quantidade é negativa, na entrada é positiva
      const ajuste = tipoMovimentacao === "entrada" ? quantidade : -quantidade;
      
      await apiRequest(`/api/estoque/${item.id}/ajustar`, "PATCH", { 
        quantidade: ajuste.toString() 
      });
      
      // 2. Registrar a movimentação no histórico
      await apiRequest(`/api/estoque/movimentacoes`, "POST", {
        itemEstoqueId: item.id,
        tipo: tipoMovimentacao,
        quantidade,
        responsavel: "Usuário",
        observacoes: observacoes || `Ajuste manual de estoque: ${tipoMovimentacao}`
      });
      
      // Atualizar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/estoque'] });
      queryClient.invalidateQueries({ queryKey: ['/api/estoque/baixo'] });
      queryClient.invalidateQueries({ queryKey: ['/api/estoque/movimentacoes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Estoque ajustado",
        description: `${tipoMovimentacao === "entrada" ? "Entrada" : "Saída"} de ${quantidade} ${item.unidade}(s) registrada com sucesso`,
        variant: "success"
      });
      
      // Fechar o diálogo
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error);
      toast({
        title: "Erro",
        description: "Não foi possível ajustar o estoque",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            Ajustar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Estoque</DialogTitle>
          <DialogDescription>
            Registre entradas ou saídas de itens no estoque.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Informações do Item */}
          <div className="bg-neutral-50 p-4 rounded-md">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{item.nome}</h3>
              <Badge 
                variant={estoqueStatus === "baixo" ? "destructive" : estoqueStatus === "ideal" ? "success" : "secondary"}
              >
                {estoqueStatus === "baixo" && <AlertCircle className="mr-1 h-3 w-3" />}
                {estoqueStatus === "baixo" ? "Estoque Baixo" : 
                 estoqueStatus === "ideal" ? "Estoque Ideal" : "Estoque Normal"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Categoria:</span>
                <span>{item.categoria}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Unidade:</span>
                <span>{item.unidade}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Quantidade Atual:</span>
                <span className="font-semibold">{item.quantidade} {item.unidade}(s)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Preço Unitário:</span>
                <span>{formatCurrency(item.valorUnitario || 0)}</span>
              </div>
            </div>
          </div>

          {/* Ajuste de Quantidade */}
          <div className="space-y-3">
            <div className="flex space-x-2 justify-between">
              <Button 
                type="button" 
                className={`flex-1 ${tipoMovimentacao === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-muted text-muted-foreground hover:bg-muted"}`}
                onClick={() => setTipoMovimentacao("entrada")}
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                Entrada
              </Button>
              <Button 
                type="button" 
                className={`flex-1 ${tipoMovimentacao === "saida" ? "bg-red-600 hover:bg-red-700" : "bg-muted text-muted-foreground hover:bg-muted"}`}
                onClick={() => setTipoMovimentacao("saida")}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Saída
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade ({item.unidade})</Label>
              <div className="flex">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-r-none"
                  onClick={() => setQuantidade(prev => Math.max(1, prev - 1))}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Input 
                  id="quantidade"
                  type="number" 
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                  className="rounded-none text-center"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="rounded-l-none"
                  onClick={() => setQuantidade(prev => prev + 1)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes"
                placeholder="Registre detalhes sobre esta movimentação"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            disabled={isSubmitting}
            className={tipoMovimentacao === "entrada" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            onClick={handleAjustarEstoque}
          >
            {isSubmitting ? "Processando..." : `Confirmar ${tipoMovimentacao === "entrada" ? "Entrada" : "Saída"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}