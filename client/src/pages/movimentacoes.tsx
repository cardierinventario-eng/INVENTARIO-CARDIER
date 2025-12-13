import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Edit3,
  Search,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Movimentacao {
  id: number;
  itemId: number;
  itemNome: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  quantidadeAnterior?: number;
  quantidadeNova?: number;
  motivo?: string;
  observacoes?: string;
  usuario?: string;
  dataCriacao: string;
}

export default function Movimentacoes() {
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: movimentacoes = [], isLoading } = useQuery<Movimentacao[]>({
    queryKey: ['/api/movimentacoes'],
    queryFn: async () => {
      const res = await fetch("/api/movimentacoes");
      if (!res.ok) throw new Error("Erro ao buscar movimentações");
      const data = await res.json();
      // Enriquecer dados com nome do item
      const itensRes = await fetch("/api/itens");
      const itens = itensRes.ok ? await itensRes.json() : [];
      return data.map((mov: any) => ({
        ...mov,
        itemNome: itens.find((i: any) => i.id === mov.itemId)?.nome || `Item ${mov.itemId}`,
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/movimentacoes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar movimentação");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movimentacoes'] });
      setDeletingId(null);
      toast({
        title: "Sucesso",
        description: "Movimentação deletada e quantidade revertida",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao deletar movimentação",
        variant: "destructive",
      });
    },
  });

  // Filtrar movimentações
  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const tipoMatch = filtroTipo === "todos" || mov.tipo === filtroTipo;
    const buscaMatch = mov.itemNome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
                      mov.motivo?.toLowerCase().includes(filtroBusca.toLowerCase());
    
    let dataMatch = true;
    if (filtroData) {
      const dataMovimento = new Date(mov.dataCriacao).toLocaleDateString("pt-BR");
      const dataFiltro = new Date(filtroData).toLocaleDateString("pt-BR");
      dataMatch = dataMovimento === dataFiltro;
    }
    
    return tipoMatch && buscaMatch && dataMatch;
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "entrada":
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case "saida":
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      case "ajuste":
        return <Edit3 className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "entrada":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Entrada</span>;
      case "saida":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Saída</span>;
      case "ajuste":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Ajuste</span>;
      default:
        return null;
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Movimentações</h1>
        <p className="text-neutral-dark">Histórico de todas as movimentações de estoque</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome do item ou motivo..."
                className="pl-8"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">Tipo</label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">Data</label>
            <Input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">&nbsp;</label>
            <Button
              variant="outline"
              onClick={() => {
                setFiltroBusca("");
                setFiltroTipo("todos");
                setFiltroData("");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-lightest border-b">
                <TableHead>Data/Hora</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : movimentacoesFiltradas.length > 0 ? (
                movimentacoesFiltradas.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell className="font-medium text-sm">
                      {formatarData(mov.dataCriacao)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(mov.tipo)}
                        <span>{mov.itemNome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(mov.tipo)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {mov.tipo === "entrada" ? "+" : "-"}{mov.quantidade}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-dark">
                      {mov.motivo || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-dark">
                      {mov.usuario || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-dark max-w-xs truncate">
                      {mov.observacoes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {deletingId === mov.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(mov.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeletingId(null)}
                            disabled={deleteMutation.isPending}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingId(mov.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-neutral-dark">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
