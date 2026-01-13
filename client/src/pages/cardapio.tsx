import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { type ItemCardapio } from "@shared/schema";
import { NovoItemDialog } from "@/components/cardapio/novo-item-dialog";
import { EditarItemDialog } from "@/components/cardapio/editar-item-dialog";
import { ExcluirItemDialog } from "@/components/cardapio/excluir-item-dialog";
import { Plus, Search, Edit, Trash2, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Cardapio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("todos");

  const { data: itens = [], isLoading } = useQuery<ItemCardapio[]>({
    queryKey: ['/api/cardapio'],
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['/api/grupos'],
  });

  const filteredItens = itens.filter(item => {
    const matchSearch = 
      item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchGrupo = 
      selectedGrupo === "todos" || 
      item.grupoId?.toString() === selectedGrupo;
    
    return matchSearch && matchGrupo;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-darkest">Cardápio</h1>
        <NovoItemDialog 
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" />
              Novo Item
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por nome ou descrição..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Grupo</label>
            <select 
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
              className="w-full mt-1 border rounded-md p-2"
            >
              <option value="todos">Todos os Grupos</option>
              {grupos.map((grupo: any) => (
                <option key={grupo.id} value={grupo.id.toString()}>
                  {grupo.nome}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">Carregando itens...</div>
          ) : filteredItens.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum item encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {item.descricao || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        {formatCurrency(parseFloat(item.preco?.toString() || '0'))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={item.disponivel 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'}
                      >
                        {item.disponivel ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EditarItemDialog 
                          itemId={item.id}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <ExcluirItemDialog 
                          itemId={item.id}
                          trigger={
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
