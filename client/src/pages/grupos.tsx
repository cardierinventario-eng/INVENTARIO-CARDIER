import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Search, AlertCircle, FolderOpen } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Grupo {
  id: number;
  nome: string;
  descricao: string | null;
  cor: string;
  ativo: number;
}

export default function Grupos() {
  const [searchText, setSearchText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState({ nome: "", descricao: "", cor: "#3B82F6" });
  const { toast } = useToast();

  // Buscar grupos
  const { data: grupos = [], isLoading } = useQuery<Grupo[]>({
    queryKey: ["/api/grupos"],
    queryFn: async () => {
      const res = await fetch("/api/grupos");
      if (!res.ok) throw new Error("Erro ao buscar grupos");
      return res.json();
    },
  });

  // Buscar itens para contar por grupo
  const { data: itens = [] } = useQuery({
    queryKey: ["/api/itens"],
    queryFn: async () => {
      const res = await fetch("/api/itens");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Criar/Editar grupo
  const mutationGrupo = useMutation({
    mutationFn: async (data: any) => {
      if (grupoEditando) {
        const res = await fetch(`/api/grupos/${grupoEditando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Erro ao atualizar grupo");
        return res.json();
      }
      const res = await fetch("/api/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar grupo");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: grupoEditando ? "Grupo atualizado!" : "Grupo criado!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grupos"] });
      setIsDialogOpen(false);
      setGrupoEditando(null);
      setFormData({ nome: "", descricao: "", cor: "#3B82F6" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar grupo",
        variant: "destructive",
      });
    },
  });

  // Deletar grupo
  const mutationDelete = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/grupos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao deletar grupo");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deletado", description: "Grupo removido com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/grupos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar grupo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.nome) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive",
      });
      return;
    }
    mutationGrupo.mutate(formData);
  };

  const handleEdit = (grupo: Grupo) => {
    setGrupoEditando(grupo);
    setFormData({
      nome: grupo.nome,
      descricao: grupo.descricao || "",
      cor: grupo.cor,
    });
    setIsDialogOpen(true);
  };

  const handleNovoGrupo = () => {
    setGrupoEditando(null);
    setFormData({ nome: "", descricao: "", cor: "#3B82F6" });
    setIsDialogOpen(true);
  };

  const gruposFiltrados = grupos.filter((g) =>
    g.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  const contarItensGrupo = (grupoId: number) => {
    return itens.filter((i: any) => i.grupoId === grupoId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="w-8 h-8" /> Grupos/Setores
          </h1>
          <p className="text-gray-600 mt-2">Gerencie os grupos/setores do seu inventário</p>
        </div>
        <Button onClick={handleNovoGrupo} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Grupo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Grupos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Search className="w-5 h-5 text-gray-400 mt-2.5" />
            <Input
              placeholder="Buscar por nome..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-10">Carregando...</div>
      ) : gruposFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p>Nenhum grupo encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gruposFiltrados.map((grupo) => (
            <Card key={grupo.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: grupo.cor }}
                      />
                      <CardTitle className="text-lg">{grupo.nome}</CardTitle>
                    </div>
                    {grupo.descricao && (
                      <p className="text-sm text-gray-600 mt-2">{grupo.descricao}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-2xl font-bold">{contarItensGrupo(grupo.id)}</p>
                  <p className="text-sm text-gray-600">itens neste grupo</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(grupo)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => mutationDelete.mutate(grupo.id)}
                    disabled={mutationDelete.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {grupoEditando ? "Editar Grupo" : "Novo Grupo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Almoxarifado"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do grupo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cor</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="w-12 h-10 cursor-pointer"
                />
                <Input value={formData.cor} readOnly className="flex-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={mutationGrupo.isPending}>
              {grupoEditando ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
