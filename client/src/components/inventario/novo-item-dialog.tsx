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
import { Plus } from "lucide-react";

interface NovoItemDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  grupos?: any[];
}

export function NovoItemDialog({ isOpen: initialOpen = false, onOpenChange, grupos: propsGrupos }: NovoItemDialogProps = {}) {
  const [open, setOpen] = useState(initialOpen);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    grupoId: "",
    quantidade: "0",
    unidade: "",
    valorUnitario: "0",
    estoqueMinimo: "0",
    estoqueIdeal: "0",
    localizacao: "",
    sku: "",
    observacoes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: queryGrupos = [] } = useQuery({
    queryKey: ['/api/grupos'],
  });
  
  const grupos = propsGrupos || queryGrupos;

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Validação básica
      if (!data.nome.trim()) throw new Error('Nome é obrigatório');
      if (!data.grupoId) throw new Error('Grupo é obrigatório');
      if (!data.unidade.trim()) throw new Error('Unidade é obrigatória');

      const response = await fetch('/api/itens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.nome.trim(),
          descricao: data.descricao.trim() || null,
          grupoId: parseInt(data.grupoId),
          quantidade: parseFloat(data.quantidade) || 0,
          unidade: data.unidade.trim(),
          valorUnitario: parseFloat(data.valorUnitario) || 0,
          estoqueMinimo: data.estoqueMinimo ? parseFloat(data.estoqueMinimo) : null,
          estoqueIdeal: data.estoqueIdeal ? parseFloat(data.estoqueIdeal) : null,
          localizacao: data.localizacao.trim() || null,
          sku: data.sku.trim() || null,
          observacoes: data.observacoes.trim() || null,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itens'] });
      toast({
        title: "Sucesso",
        description: "Item criado com sucesso",
      });
      setOpen(false);
      onOpenChange?.(false);
      setFormData({
        nome: "",
        descricao: "",
        grupoId: "",
        quantidade: "0",
        unidade: "",
        valorUnitario: "0",
        estoqueMinimo: "0",
        estoqueIdeal: "0",
        localizacao: "",
        sku: "",
        observacoes: "",
      });
    },
    onError: (error: any) => {
      const errorMsg = error?.message || 'Erro ao criar item';
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.grupoId || !formData.unidade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
      >
        <Plus className="h-4 w-4" />
        Novo Item
      </button>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Item</DialogTitle>
          <DialogDescription>
            Adicione um novo item ao inventário
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
                  <SelectValue placeholder="Selecione" />
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
              <Label>Quantidade Inicial</Label>
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
                  <SelectValue placeholder="Selecione" />
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
            <Button variant="outline" type="button" onClick={() => {
              setOpen(false);
              onOpenChange?.(false);
            }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
