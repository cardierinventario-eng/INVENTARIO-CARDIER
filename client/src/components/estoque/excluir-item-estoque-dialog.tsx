import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ExcluirItemEstoqueDialogProps {
  itemId: number;
  itemNome: string;
  children?: React.ReactNode;
}

export function ExcluirItemEstoqueDialog({ 
  itemId, 
  itemNome,
  children 
}: ExcluirItemEstoqueDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleExcluir = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/estoque/${itemId}`, "DELETE");
      
      toast({
        title: "Item excluído",
        description: `O item "${itemNome}" foi removido do estoque com sucesso`,
        variant: "success",
      });
      
      // Invalidar cache para atualizar listagens
      queryClient.invalidateQueries({ queryKey: ['/api/estoque'] });
      queryClient.invalidateQueries({ queryKey: ['/api/estoque/baixo'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Fechar dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item do estoque",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o item "{itemNome}"?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 p-4 bg-destructive/10 rounded-md text-sm">
          <p>A exclusão deste item também removerá:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Todo o histórico de movimentações do item</li>
            <li>Registros de estoque relacionados</li>
          </ul>
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
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleExcluir}
          >
            {isSubmitting ? "Excluindo..." : "Excluir Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}