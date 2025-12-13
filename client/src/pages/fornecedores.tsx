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
  Plus,
  Trash2,
  Edit,
  Search,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NovoFornecedorDialog } from "@/components/fornecedores/novo-fornecedor-dialog";
import { EditarFornecedorDialog } from "@/components/fornecedores/editar-fornecedor-dialog";
import { ExcluirFornecedorDialog } from "@/components/fornecedores/excluir-fornecedor-dialog";

interface Fornecedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cnpj: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export default function Fornecedores() {
  const [filtro, setFiltro] = useState("");
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null);
  const [fornecedorExcluindo, setFornecedorExcluindo] = useState<Fornecedor | null>(null);

  const { data: fornecedores = [], isLoading } = useQuery<Fornecedor[]>({
    queryKey: ['/api/fornecedores'],
  });

  // Filtrar fornecedores
  const fornecedoresFiltrados = fornecedores.filter(f => {
    return f.nome.toLowerCase().includes(filtro.toLowerCase()) ||
           f.email.toLowerCase().includes(filtro.toLowerCase()) ||
           f.cnpj.includes(filtro);
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Fornecedores</h1>
          <p className="text-neutral-dark">Gerencie os fornecedores do seu estoque</p>
        </div>
        <NovoFornecedorDialog />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome, email ou CNPJ..."
                className="pl-8"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-dark mb-2 block">&nbsp;</label>
            <Button
              variant="outline"
              onClick={() => setFiltro("")}
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))
        ) : fornecedoresFiltrados.length > 0 ? (
          fornecedoresFiltrados.map((fornecedor) => (
            <div
              key={fornecedor.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
            >
              <h3 className="text-lg font-heading font-bold text-neutral-darkest mb-3">
                {fornecedor.nome}
              </h3>

              <div className="space-y-2 mb-4 text-sm text-neutral-dark">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{fornecedor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span>{fornecedor.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{fornecedor.endereco}</span>
                </div>
                <div className="pt-2 border-t text-xs">
                  <span className="text-neutral-dark">CNPJ: </span>
                  <span className="font-mono">{fornecedor.cnpj}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => setFornecedorEditando(fornecedor)}
                  className="px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => setFornecedorExcluindo(fornecedor)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <Mail className="h-12 w-12 text-neutral-light mx-auto mb-4" />
            <p className="text-neutral-dark mb-4">Nenhum fornecedor encontrado</p>
            <NovoFornecedorDialog />
          </div>
        )}
      </div>

      {/* Tabela Complementar */}
      {fornecedoresFiltrados.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-lightest border-b">
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fornecedoresFiltrados.map((fornecedor) => (
                  <TableRow key={fornecedor.id}>
                    <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                    <TableCell className="text-sm text-neutral-dark">{fornecedor.email}</TableCell>
                    <TableCell className="text-sm text-neutral-dark">{fornecedor.telefone}</TableCell>
                    <TableCell className="text-sm text-neutral-dark font-mono">{fornecedor.cnpj}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setFornecedorEditando(fornecedor)}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setFornecedorExcluindo(fornecedor)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Diálogos */}
      {fornecedorEditando && (
        <EditarFornecedorDialog
          fornecedor={fornecedorEditando}
          onClose={() => setFornecedorEditando(null)}
        />
      )}
      {fornecedorExcluindo && (
        <ExcluirFornecedorDialog
          fornecedor={fornecedorExcluindo}
          onClose={() => setFornecedorExcluindo(null)}
        />
      )}
    </>
  );
}
