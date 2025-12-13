import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Edit, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { AjustarEstoqueDialog } from "./ajustar-estoque-dialog";
import { EditarItemEstoqueDialog } from "./editar-item-estoque-dialog";
import { ExcluirItemEstoqueDialog } from "./excluir-item-estoque-dialog";

interface ItemEstoqueProps {
  item: any;
}

export function ItemEstoque({ item }: ItemEstoqueProps) {
  // Calcular status do estoque
  const estoqueStatus = 
    item.quantidade <= item.estoqueMinimo ? "baixo" : 
    item.quantidade >= item.estoqueIdeal ? "ideal" : "normal";
  
  // Calcular valor total
  const valorTotal = parseFloat(item.quantidade) * parseFloat(item.valorUnitario || '0');
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold mb-1">
            {item.nome}
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {item.categoria}
          </div>
        </div>
        <Badge 
          variant={
            estoqueStatus === "baixo" ? "destructive" : 
            estoqueStatus === "ideal" ? "success" : 
            "secondary"
          }
          className="ml-auto"
        >
          {estoqueStatus === "baixo" && <AlertCircle className="mr-1 h-3 w-3" />}
          {estoqueStatus === "baixo" ? "Estoque Baixo" : 
           estoqueStatus === "ideal" ? "Estoque Ideal" : 
           "Estoque Normal"}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Quantidade</span>
            <span className="font-medium">
              {item.quantidade} {item.unidade}(s)
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Preço Unitário</span>
            <span className="font-medium">
              {formatCurrency(item.valorUnitario || 0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Estoque Mínimo</span>
            <span>{item.estoqueMinimo} {item.unidade}(s)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Valor Total</span>
            <span className="font-medium">
              {formatCurrency(valorTotal)}
            </span>
          </div>
        </div>
        
        {item.localArmazenamento && (
          <div className="mt-3 text-xs">
            <span className="text-muted-foreground">Local: </span>
            <span>{item.localArmazenamento}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-2 bg-muted/10 border-t">        
        <div className="flex items-center space-x-2">
          <AjustarEstoqueDialog item={item}>
            <Button variant="outline" size="sm" className="h-8">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Ajustar Estoque
            </Button>
          </AjustarEstoqueDialog>
        </div>
        <div className="flex items-center space-x-1">
          <EditarItemEstoqueDialog item={item} />
          <ExcluirItemEstoqueDialog item={item}>
            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </ExcluirItemEstoqueDialog>
        </div>
      </CardFooter>
    </Card>
  );
}