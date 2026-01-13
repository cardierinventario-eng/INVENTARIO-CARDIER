import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Mesa } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditarMesaDialogProps {
  mesaId: number;
  trigger?: React.ReactNode;
}

export function EditarMesaDialog({ mesaId, trigger }: EditarMesaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mesa } = useQuery<Mesa>({
    queryKey: ['/api/mesas', mesaId],
    enabled: isOpen,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const numero = formData.get("numero") as string;
      const capacidade = parseInt(formData.get("capacidade") as string);

      await apiRequest("PATCH", `/api/mesas/${mesaId}`, {
        numero: parseInt(numero),
        capacidade,
      });

      toast({
        title: "Sucesso",
        description: "Mesa atualizada com sucesso!",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/mesas'] });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a mesa",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Mesa</DialogTitle>
          <DialogDescription>
            Atualize os dados da mesa.
          </DialogDescription>
        </DialogHeader>

        {mesa && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="numero">Número da Mesa</Label>
              <Input 
                id="numero"
                name="numero" 
                type="number" 
                defaultValue={mesa.numero}
                required
              />
            </div>

            <div>
              <Label htmlFor="capacidade">Capacidade (Pessoas)</Label>
              <Input 
                id="capacidade"
                name="capacidade" 
                type="number" 
                defaultValue={mesa.capacidade}
                required
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Atualizando..." : "Atualizar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
