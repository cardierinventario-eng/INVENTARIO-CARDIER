import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Cliente } from "@shared/schema";
import { NovoClienteDialog } from "@/components/clientes/novo-cliente-dialog";
import { EditarClienteDialog } from "@/components/clientes/editar-cliente-dialog";
import { ExcluirClienteDialog } from "@/components/clientes/excluir-cliente-dialog";
import { VisualizarClienteDialog } from "@/components/clientes/visualizar-cliente-dialog";
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clientes = [], isLoading } = useQuery<Cliente[]>({
    queryKey: ['/api/clientes'],
  });

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-darkest">Clientes</h1>
        <NovoClienteDialog 
          trigger={
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por nome, email ou telefone..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">Carregando clientes...</div>
          ) : filteredClientes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum cliente encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>
                      {cliente.email ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-4 w-4 text-blue-600" />
                          {cliente.email}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {cliente.telefone ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-4 w-4 text-green-600" />
                          {cliente.telefone}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {cliente.endereco ? (
                        <>
                          {cliente.endereco}
                          {cliente.numero && ` nº ${cliente.numero}`}
                          {cliente.complemento && ` (${cliente.complemento})`}
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <VisualizarClienteDialog 
                          clienteId={cliente.id}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <EditarClienteDialog 
                          clienteId={cliente.id}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <ExcluirClienteDialog 
                          clienteId={cliente.id}
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
