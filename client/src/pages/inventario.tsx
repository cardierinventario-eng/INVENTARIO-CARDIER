import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  PackageX,
  Plus,
  Search,
  Trash2,
  Edit,
  ArrowUpDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { type Item } from "@shared/schema";
import { NovoItemDialog } from "@/components/inventario/novo-item-dialog";
import { EditarItemDialog } from "@/components/inventario/editar-item-dialog";
import { ExcluirItemDialog } from "@/components/inventario/excluir-item-dialog";
import { AjustarQuantidadeDialog } from "@/components/inventario/ajustar-quantidade-dialog";

interface ItemComGrupo extends Item {
  grupoNome?: string;
}

export default function Inventario() {
  const [filtro, setFiltro] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [itemEditando, setItemEditando] = useState<ItemComGrupo | null>(null);
  const [itemExcluindo, setItemExcluindo] = useState<ItemComGrupo | null>(null);
  const [itemAjustando, setItemAjustando] = useState<ItemComGrupo | null>(null);

  const { data: itens = [], isLoading } = useQuery<ItemComGrupo[]>({
    queryKey: ['/api/itens'],
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['/api/grupos'],
  });

  // Filtrar itens
  const itensFiltrados = itens.filter(item => {
    const textoMatch = item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                       item.descricao?.toLowerCase().includes(filtro.toLowerCase());
    
    const grupoMatch = grupoFiltro === "todos" || item.grupoId === parseInt(grupoFiltro);
    
    let statusMatch = true;
    if (statusFiltro === "baixo") {
      statusMatch = !!(item.estoqueMinimo && item.quantidade <= item.estoqueMinimo);
    } else if (statusFiltro === "normal") {
      statusMatch = !!(item.estoqueMinimo && item.quantidade > item.estoqueMinimo && 
                   (!item.estoqueIdeal || item.quantidade < item.estoqueIdeal));
    } else if (statusFiltro === "ideal") {
      statusMatch = !!(item.estoqueIdeal && item.quantidade >= item.estoqueIdeal);
    }
    
    return textoMatch && grupoMatch && statusMatch;
  });

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
          <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Inventário</h1>
          <p className="text-neutral-dark">Gerencie os itens do seu inventário</p>
        </div>
        <NovoItemDialog />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome ou descrição..."
                className="pl-8"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">Grupo</label>
            <Select value={grupoFiltro} onValueChange={setGrupoFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os grupos</SelectItem>
                {(grupos as any[]).map((g: any) => (
                  <SelectItem key={g.id} value={g.id.toString()}>
                    {g.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">Status</label>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="baixo">Estoque Baixo</SelectItem>
                <SelectItem value="normal">Estoque Normal</SelectItem>
                <SelectItem value="ideal">Estoque Ideal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">&nbsp;</label>
            <Button
              variant="outline"
              onClick={() => {
                setFiltro("");
                setGrupoFiltro("todos");
                setStatusFiltro("todos");
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
                <TableHead className="w-8"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Mín/Ideal</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : itensFiltrados.length > 0 ? (
                itensFiltrados.map((item) => (
                  <TableRow key={item.id} className={getStatusClass(item)}>
                    <TableCell>{getStatusIcon(item)}</TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>{item.grupoNome}</TableCell>
                    <TableCell className="text-right font-medium">{item.quantidade}</TableCell>
                    <TableCell>{item.unidade}</TableCell>
                    <TableCell className="text-right">
                      R$ {item.valorUnitario.toFixed(2).replace(".", ",")}
                    </TableCell>
                    <TableCell className="text-right text-sm text-neutral-dark">
                      {item.estoqueMinimo}/{item.estoqueIdeal}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setItemAjustando(item)}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600"
                          title="Ajustar quantidade"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setItemEditando(item)}
                          className="p-1 hover:bg-yellow-100 rounded text-yellow-600"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setItemExcluindo(item)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-neutral-dark">
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Diálogos */}
      {itemEditando && (
        <EditarItemDialog
          item={itemEditando}
          onClose={() => setItemEditando(null)}
        />
      )}
      {itemExcluindo && (
        <ExcluirItemDialog
          item={itemExcluindo}
          onClose={() => setItemExcluindo(null)}
        />
      )}
      {itemAjustando && (
        <AjustarQuantidadeDialog
          item={itemAjustando}
          onClose={() => setItemAjustando(null)}
        />
      )}
    </>
  );
}
