import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  AlertTriangle,
  Package,
  PackageCheck,
  Plus,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type Item } from "@shared/schema";
import { NovoItemDialog } from "@/components/inventario/novo-item-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ItemComGrupo extends Item {
  grupoNome?: string;
}

interface MovimentacaoData {
  itemId: number;
  tipo: "entrada" | "saida";
  quantidade: number;
  motivo: string;
  observacoes?: string;
}

export default function Estoque() {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState("todos");
  const [itemNovo, setItemNovo] = useState(false);
  const [movimentacaoItem, setMovimentacaoItem] = useState<{ item: ItemComGrupo; tipo: "entrada" | "saida" } | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: itens = [], isLoading } = useQuery<ItemComGrupo[]>({
    queryKey: ['/api/itens'],
  });

  const { data: grupos = [] } = useQuery<any[]>({
    queryKey: ['/api/grupos'],
  });

  // Filtrar itens
  const itensFiltrados = itens.filter(item => {
    const textoMatch = item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                       item.sku?.toLowerCase().includes(filtro.toLowerCase());
    
    const grupoMatch = grupoFiltro === "todos" || item.grupoId === parseInt(grupoFiltro);
    
    return textoMatch && grupoMatch;
  });

  const getGrupoNome = (grupoId: number) => {
    return (grupos as any[]).find((g: any) => g.id === grupoId)?.nome || "Sem grupo";
  };

  // Adicionar movimentação
  const movimentacaoMutation = useMutation({
    mutationFn: async (data: MovimentacaoData) => {
      const response = await fetch("/api/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          usuario: "Sistema",
        }),
      });
      if (!response.ok) throw new Error("Erro ao registrar movimentação");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/itens'] });
      setMovimentacaoItem(null);
      setQuantidade("");
      setMotivo("");
      setObservacoes("");
      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação",
        variant: "destructive",
      });
    },
  });

  const handleMovimentacao = () => {
    if (!movimentacaoItem || !quantidade || !motivo) {
      toast({
        title: "Erro",
        description: "Preencha quantidade e motivo",
        variant: "destructive",
      });
      return;
    }

    movimentacaoMutation.mutate({
      itemId: movimentacaoItem.item.id,
      tipo: movimentacaoItem.tipo,
      quantidade: parseFloat(quantidade),
      motivo,
      observacoes,
    });
  };

  const getStatusIcon = (item: ItemComGrupo) => {
    if (item.estoqueMinimo && item.quantidade <= item.estoqueMinimo) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (item.estoqueIdeal && item.quantidade >= item.estoqueIdeal) {
      return <PackageCheck className="h-4 w-4 text-green-500" />;
    }
    return <Package className="h-4 w-4 text-blue-500" />;
  };

  const getStatusClass = (item: ItemComGrupo) => {
    if (item.estoqueMinimo && item.quantidade <= item.estoqueMinimo) {
      return "bg-red-50";
    } else if (item.estoqueIdeal && item.quantidade >= item.estoqueIdeal) {
      return "bg-green-50";
    }
    return "";
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Estoque</h1>
          <p className="text-neutral-dark mt-1">Gerenciar entradas e saídas de produtos</p>
        </div>
        <Button onClick={() => setItemNovo(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Buscar por nome ou SKU..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-1"
        />
        <Select value={grupoFiltro} onValueChange={setGrupoFiltro}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os grupos</SelectItem>
            {(grupos as any[]).map((grupo: any) => (
              <SelectItem key={grupo.id} value={String(grupo.id)}>
                {grupo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Estoque */}
      <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-lightest border-b">
              <TableHead className="w-8"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead className="text-right">Qtd Atual</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Valor Unit.</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                </TableRow>
              ))
            ) : itensFiltrados.length > 0 ? (
              itensFiltrados.map((item) => (
                <TableRow key={item.id} className={getStatusClass(item)}>
                  <TableCell>{getStatusIcon(item)}</TableCell>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-sm text-neutral-dark">{item.sku}</TableCell>
                  <TableCell>{getGrupoNome(item.grupoId)}</TableCell>
                  <TableCell className="text-right font-bold">{item.quantidade}</TableCell>
                  <TableCell>{item.unidade}</TableCell>
                  <TableCell className="text-right">
                    R$ {item.valorUnitario.toFixed(2).replace(".", ",")}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setMovimentacaoItem({ item, tipo: "entrada" })}
                        className="p-1.5 hover:bg-green-100 rounded text-green-600 font-medium text-xs flex items-center gap-1"
                        title="Entrada"
                      >
                        <ArrowDown className="h-4 w-4" />
                        Entrada
                      </button>
                      <button
                        onClick={() => setMovimentacaoItem({ item, tipo: "saida" })}
                        className="p-1.5 hover:bg-red-100 rounded text-red-600 font-medium text-xs flex items-center gap-1"
                        title="Saída"
                      >
                        <ArrowUp className="h-4 w-4" />
                        Saída
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-neutral-dark">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Novo Item */}
      {itemNovo && (
        <NovoItemDialog
          isOpen={itemNovo}
          onOpenChange={setItemNovo}
          grupos={grupos}
        />
      )}

      {/* Dialog Movimentação */}
      {movimentacaoItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {movimentacaoItem.tipo === "entrada" ? "📥 Entrada" : "📤 Saída"} de Produtos
            </h2>
            
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm font-medium">{movimentacaoItem.item.nome}</p>
              <p className="text-xs text-neutral-dark">
                Qtd Atual: {movimentacaoItem.item.quantidade} {movimentacaoItem.item.unidade}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivo *</label>
                <Select value={motivo} onValueChange={setMotivo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {movimentacaoItem.tipo === "entrada" ? (
                      <>
                        <SelectItem value="compra">Compra</SelectItem>
                        <SelectItem value="devolucao">Devolução</SelectItem>
                        <SelectItem value="ajuste">Ajuste de Estoque</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="venda">Venda</SelectItem>
                        <SelectItem value="perda">Perda</SelectItem>
                        <SelectItem value="uso">Uso</SelectItem>
                        <SelectItem value="ajuste">Ajuste de Estoque</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <Input
                  placeholder="Observações adicionais..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setMovimentacaoItem(null)}
                className="flex-1 px-4 py-2 border border-neutral-light rounded text-neutral-dark hover:bg-neutral-lightest"
              >
                Cancelar
              </button>
              <button
                onClick={handleMovimentacao}
                disabled={movimentacaoMutation.isPending}
                className={`flex-1 px-4 py-2 rounded text-white font-medium ${
                  movimentacaoItem.tipo === "entrada"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {movimentacaoMutation.isPending ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
