import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bar, Line, Pie } from "recharts";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { RelatorioVendas, RelatorioFinanceiro, RelatorioEstoque } from "@shared/schema";
import { Loader2, Download, Mail, Printer, Share2, RefreshCcw } from "lucide-react";
import { RelatorioVendasPDF } from "@/components/relatorios/relatorio-vendas-pdf";
import { CompartilharRelatorioDialog } from "@/components/relatorios/compartilhar-relatorio-dialog";

export default function Relatorios() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tipoRelatorio = params.get("tipo") || "vendas";
  const [tabValue, setTabValue] = useState(tipoRelatorio);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Atualiza a URL quando a tab muda
  useEffect(() => {
    setLocation(`/relatorios?tipo=${tabValue}`, { replace: true });
  }, [tabValue, setLocation]);

  // Query para relatório de vendas
  const { 
    data: relatorioVendas, 
    isLoading: isLoadingVendas 
  } = useQuery({
    queryKey: ["/api/relatorios/vendas"],
    queryFn: () => apiRequest("/api/relatorios/vendas"),
    enabled: tabValue === "vendas",
  });

  // Query para relatório financeiro
  const { 
    data: relatorioFinanceiro, 
    isLoading: isLoadingFinanceiro 
  } = useQuery({
    queryKey: ["/api/relatorios/financeiro"],
    queryFn: () => apiRequest("/api/relatorios/financeiro"),
    enabled: tabValue === "financeiro",
  });

  // Query para relatório de estoque
  const { 
    data: relatorioEstoque, 
    isLoading: isLoadingEstoque 
  } = useQuery({
    queryKey: ["/api/relatorios/estoque"],
    queryFn: () => apiRequest("/api/relatorios/estoque"),
    enabled: tabValue === "estoque",
  });

  // Mutação para zerar dados de vendas
  const zerarVendasMutation = useMutation({
    mutationFn: () => apiRequest('/api/relatorios/vendas/zerar', 'POST'),
    onSuccess: () => {
      // Revalidar queries após zerar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/relatorios/vendas'] });
      toast({
        title: "Relatório zerado",
        description: "Os dados de vendas foram zerados. Novas contagens começarão a partir da próxima venda.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao zerar dados",
        description: "Não foi possível zerar os dados de vendas. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao zerar relatório:", error);
    }
  });

  const handleZerarRelatorio = () => {
    if (window.confirm("Tem certeza que deseja zerar todos os dados do relatório de vendas? Esta ação não pode ser desfeita.")) {
      zerarVendasMutation.mutate();
    }
  };

  const handleExportarPDF = () => {
    // Agora usamos PDFDownloadLink diretamente nos botões
    if (!relatorioVendas && tabValue === "vendas") {
      toast({
        title: "Sem dados para exportar",
        description: "Não há dados de vendas disponíveis para exportar.",
      });
      return;
    }
    
    // A exportação real acontecerá através do PDFDownloadLink
  };

  const handleImprimir = () => {
    if (tabValue === "vendas" && relatorioVendas) {
      // Usar a função de impressão do navegador
      window.print();
    } else {
      toast({
        title: "Sem dados para imprimir",
        description: "Não há dados disponíveis para impressão.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <div className="flex space-x-2">
          {tabValue === "vendas" && relatorioVendas && (
            <PDFDownloadLink
              document={<RelatorioVendasPDF relatorio={relatorioVendas} />}
              fileName={`relatorio-vendas-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`}
              className="inline-flex"
            >
              {({ loading }) => (
                <Button variant="outline" size="sm" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar PDF
                </Button>
              )}
            </PDFDownloadLink>
          )}
          {tabValue === "vendas" && !relatorioVendas && (
            <Button variant="outline" size="sm" onClick={handleExportarPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={handleImprimir}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          
          {tabValue === "vendas" && relatorioVendas && (
            <CompartilharRelatorioDialog 
              tipo="vendas" 
              dados={relatorioVendas}
            />
          )}
          
          {tabValue === "vendas" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZerarRelatorio} 
              disabled={zerarVendasMutation.isPending}
            >
              {zerarVendasMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              Zerar Relatório
            </Button>
          )}
        </div>
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        {/* Relatório de Vendas */}
        <TabsContent value="vendas">
          {isLoadingVendas ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : relatorioVendas ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Dia</CardTitle>
                  <CardDescription>Total de vendas registradas nos últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {/* Gráfico de vendas por dia */}
                  <div className="h-full w-full bg-neutral-light rounded-md flex items-center justify-center">
                    <p className="text-neutral-dark">Gráfico de Vendas por Dia</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Categoria</CardTitle>
                  <CardDescription>Distribuição de vendas por categoria de produto</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {/* Gráfico de vendas por categoria */}
                  <div className="h-full w-full bg-neutral-light rounded-md flex items-center justify-center">
                    <p className="text-neutral-dark">Gráfico de Vendas por Categoria</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                  <CardDescription>Top 10 produtos mais vendidos no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Produto</th>
                        <th className="text-right py-2">Quantidade</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorioVendas.produtosMaisVendidos.map((produto, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{produto.produto}</td>
                          <td className="text-right py-2">{produto.quantidade}</td>
                          <td className="text-right py-2">R$ {produto.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p>Nenhum dado disponível.</p>
            </div>
          )}
        </TabsContent>

        {/* Relatório Financeiro */}
        <TabsContent value="financeiro">
          {isLoadingFinanceiro ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : relatorioFinanceiro ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas por Dia</CardTitle>
                  <CardDescription>Total de receitas registradas nos últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {/* Gráfico de receitas por dia */}
                  <div className="h-full w-full bg-neutral-light rounded-md flex items-center justify-center">
                    <p className="text-neutral-dark">Gráfico de Receitas por Dia</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                  <CardDescription>Distribuição de despesas por categoria</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {/* Gráfico de despesas por categoria */}
                  <div className="h-full w-full bg-neutral-light rounded-md flex items-center justify-center">
                    <p className="text-neutral-dark">Gráfico de Despesas por Categoria</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Resumo Mensal</CardTitle>
                  <CardDescription>Balanço financeiro do mês atual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary-light/10 p-4 rounded-lg text-center">
                      <p className="text-neutral-dark mb-1">Receitas</p>
                      <p className="text-2xl font-bold text-success">
                        R$ {relatorioFinanceiro.resumoMensal.receitas.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-destructive/10 p-4 rounded-lg text-center">
                      <p className="text-neutral-dark mb-1">Despesas</p>
                      <p className="text-2xl font-bold text-destructive">
                        R$ {relatorioFinanceiro.resumoMensal.despesas.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg text-center">
                      <p className="text-neutral-dark mb-1">Lucro</p>
                      <p className="text-2xl font-bold text-primary">
                        R$ {relatorioFinanceiro.resumoMensal.lucro.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p>Nenhum dado disponível.</p>
            </div>
          )}
        </TabsContent>

        {/* Relatório de Estoque */}
        <TabsContent value="estoque">
          {isLoadingEstoque ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : relatorioEstoque ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Valor do estoque por categoria de produtos</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {/* Gráfico de distribuição por categoria */}
                  <div className="h-full w-full bg-neutral-light rounded-md flex items-center justify-center">
                    <p className="text-neutral-dark">Gráfico de Distribuição por Categoria</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Movimentações Recentes</CardTitle>
                  <CardDescription>Entradas e saídas de estoque nos últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  {/* Gráfico de movimentações recentes */}
                  <div className="h-full w-full bg-neutral-light rounded-md flex items-center justify-center">
                    <p className="text-neutral-dark">Gráfico de Movimentações Recentes</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Resumo do Estoque</CardTitle>
                    <CardDescription>Visão geral da situação atual do estoque</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-warning/10 p-4 rounded-lg text-center">
                      <p className="text-neutral-dark mb-1">Itens em Baixo Estoque</p>
                      <p className="text-2xl font-bold text-warning">
                        {relatorioEstoque.estoqueBaixo}
                      </p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-lg text-center">
                      <p className="text-neutral-dark mb-1">Valor Total do Estoque</p>
                      <p className="text-2xl font-bold text-primary">
                        R$ {relatorioEstoque.valorTotalEstoque.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-lg text-center">
                      <p className="text-neutral-dark mb-1">Categorias</p>
                      <p className="text-2xl font-bold text-accent-dark">
                        {relatorioEstoque.distribuicaoPorCategoria.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p>Nenhum dado disponível.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}