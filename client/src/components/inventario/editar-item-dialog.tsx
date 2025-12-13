import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { type Item } from "@shared/schema";

interface EditarItemDialogProps {
  item: Item;
  onClose: () => void;
}

export function EditarItemDialog({ item, onClose }: EditarItemDialogProps) {
  const [formData, setFormData] = useState({
    nome: item.nome,
    descricao: item.descricao || "",
    grupoId: item.grupoId.toString(),
    quantidade: item.quantidade.toString(),
    unidade: item.unidade,
    valorUnitario: item.valorUnitario.toString(),
    estoqueMinimo: item.estoqueMinimo?.toString() || "0",
    estoqueIdeal: item.estoqueIdeal?.toString() || "0",
    localizacao: item.localizacao || "",
    sku: item.sku || "",
    observacoes: item.observacoes || "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: grupos = [] } = useQuery({
    queryKey: ['/api/grupos'],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/itens/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          grupoId: parseInt(data.grupoId),
          quantidade: parseFloat(data.quantidade),
          valorUnitario: parseFloat(data.valorUnitario),
          estoqueMinimo: parseFloat(data.estoqueMinimo),
          estoqueIdeal: parseFloat(data.estoqueIdeal),
        }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itens'] });
      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>
            Atualize os dados do item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do item"
              />
            </div>
            <div>
              <Label>Grupo *</Label>
              <Select value={formData.grupoId} onValueChange={(v) => setFormData({ ...formData, grupoId: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(grupos as any[]).map((g: any) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Unidade *</Label>
              <Select value={formData.unidade} onValueChange={(v) => setFormData({ ...formData, unidade: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="un">un</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="m2">m²</SelectItem>
                  <SelectItem value="m3">m³</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor Unitário (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorUnitario}
                onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Estoque Mínimo</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.estoqueMinimo}
                onChange={(e) => setFormData({ ...formData, estoqueMinimo: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Estoque Ideal</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.estoqueIdeal}
                onChange={(e) => setFormData({ ...formData, estoqueIdeal: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Código do item"
              />
            </div>

            <div className="col-span-2">
              <Label>Localização</Label>
              <Input
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                placeholder="Onde está armazenado"
              />
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do item"
                className="h-20"
              />
            </div>

            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais"
                className="h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Atualizando..." : "Atualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
