import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Plus, Minus } from "lucide-react";
import { type ItemEstoque as ItemEstoqueType } from "@shared/schema";

interface ItemEstoqueProps {
  item: ItemEstoqueType;
}

export function ItemEstoque({ item }: ItemEstoqueProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantidade, setQuantidade] = useState<string>("0");
  const [tipoMovimentacao, setTipoMovimentacao] = useState<"entrada" | "saida">("entrada");
  const [error, setError] = useState<string>("");

  // Determinar status do estoque
  const getEstoqueStatus = (): { status: string, style: string } => {
    if (item.quantidade <= item.estoqueMinimo) {
      return { 
        status: "Baixo", 
        style: "bg-destructive/20 text-destructive"
      };
    } else if (item.quantidade < item.estoqueIdeal) {
      return { 
        status: "Normal", 
        style: "bg-warning/20 text-warning"
      };
    } else {
      return { 
        status: "Ideal", 
        style: "bg-success/20 text-success"
      };
    }
  };

  const { status, style } = getEstoqueStatus();

  const handleAjustarEstoque = async () => {
    // Validação básica
    const qtd = parseFloat(quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      setError("Quantidade deve ser um número maior que zero");
      return;
    }

    // Se for saída, verificar se há estoque suficiente
    if (tipoMovimentacao === "saida" && qtd > parseFloat(item.quantidade.toString())) {
      setError("Quantidade de saída maior que o estoque disponível");
      return;
    }

    try {
      // A quantidade já estará negativa para operações de saída
      const valorAjuste = tipoMovimentacao === "entrada" ? qtd : -qtd;
      
      await apiRequest("PATCH", `/api/estoque/${item.id}/ajustar`, { 
        quantidade: valorAjuste 
      });
      
      // Atualizar cache
      await queryClient.invalidateQueries({ queryKey: ['/api/estoque'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/estoque/baixo'] });
      
      // Fechar modal
      setIsDialogOpen(false);
      setQuantidade("0");
      setError("");
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error);
      setError("Erro ao ajustar estoque. Tente novamente.");
    }
  };

  return (
    <>
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.nome}</TableCell>
        <TableCell>{item.categoria}</TableCell>
        <TableCell>{item.quantidade.toString()}</TableCell>
        <TableCell>{item.unidade}</TableCell>
        <TableCell>{item.estoqueMinimo.toString()}</TableCell>
        <TableCell>{item.estoqueIdeal.toString()}</TableCell>
        <TableCell>
          <span className={`px-2 py-1 rounded-full text-xs ${style}`}>
            {status}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setTipoMovimentacao("entrada");
                setIsDialogOpen(true);
              }}
              title="Adicionar ao estoque"
            >
              <Plus className="h-4 w-4 text-success" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setTipoMovimentacao("saida");
                setIsDialogOpen(true);
              }}
              title="Remover do estoque"
            >
              <Minus className="h-4 w-4 text-destructive" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              title="Editar item"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Dialog para ajustar estoque */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tipoMovimentacao === "entrada" 
                ? "Adicionar ao Estoque" 
                : "Remover do Estoque"}
            </DialogTitle>
            <DialogDescription>
              {tipoMovimentacao === "entrada"
                ? "Informe a quantidade a ser adicionada ao estoque."
                : "Informe a quantidade a ser removida do estoque."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Input id="item" value={item.nome} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estoque-atual">Estoque Atual</Label>
              <Input 
                id="estoque-atual" 
                value={`${item.quantidade} ${item.unidade}`} 
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantidade">
                {tipoMovimentacao === "entrada" ? "Quantidade a Adicionar" : "Quantidade a Remover"}
              </Label>
              <div className="flex items-center">
                <Input 
                  id="quantidade" 
                  type="number" 
                  min="0.01" 
                  step="0.01"
                  value={quantidade} 
                  onChange={(e) => {
                    setQuantidade(e.target.value);
                    setError("");
                  }}
                />
                <span className="ml-2">{item.unidade}</span>
              </div>
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant={tipoMovimentacao === "entrada" ? "default" : "destructive"}
              onClick={handleAjustarEstoque}
            >
              {tipoMovimentacao === "entrada" ? "Adicionar" : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
