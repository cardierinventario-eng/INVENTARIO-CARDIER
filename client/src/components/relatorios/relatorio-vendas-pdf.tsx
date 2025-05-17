import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { type RelatorioVendas } from '@shared/schema';

// Definição de estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666666',
  },
  date: {
    fontSize: 12,
    color: '#999999',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  productCol: {
    width: '60%',
    borderRightWidth: 1,
    borderRightColor: '#CCCCCC',
  },
  quantityCol: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#CCCCCC',
    textAlign: 'right',
  },
  totalCol: {
    width: '20%',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 10,
  },
  summary: {
    marginTop: 20,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555555',
  },
  summaryValue: {
    fontSize: 12,
    color: '#333333',
  },
  emptyState: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 14,
    color: '#999999',
  }
});

interface RelatorioVendasPDFProps {
  relatorio: RelatorioVendas;
  periodo?: { inicio: Date; fim: Date };
}

export const RelatorioVendasPDF = ({ relatorio, periodo }: RelatorioVendasPDFProps) => {
  // Calcular totais para resumo
  const totalQuantidade = relatorio.produtosMaisVendidos.reduce((sum, produto) => sum + produto.quantidade, 0);
  const totalVendas = relatorio.produtosMaisVendidos.reduce((sum, produto) => sum + produto.total, 0);
  
  // Formatação de valores monetários
  const formatMoeda = (valor: number) => `R$ ${valor.toFixed(2).replace('.', ',')}`;
  
  // Formatação de data
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const periodoFormatado = periodo 
    ? `${periodo.inicio.toLocaleDateString('pt-BR')} a ${periodo.fim.toLocaleDateString('pt-BR')}`
    : 'Todo o período';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Vendas</Text>
          <Text style={styles.subtitle}>Lanche Fácil - Sistema de Gestão</Text>
          <Text style={styles.date}>Período: {periodoFormatado}</Text>
          <Text style={styles.date}>Gerado em: {dataAtual}</Text>
        </View>

        {/* Seção de Produtos Mais Vendidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos Mais Vendidos</Text>
          
          {relatorio.produtosMaisVendidos.length > 0 ? (
            <>
              <View style={[styles.table]}>
                {/* Cabeçalho da tabela */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={[styles.tableCell, styles.productCol]}>
                    <Text>Produto</Text>
                  </View>
                  <View style={[styles.tableCell, styles.quantityCol]}>
                    <Text>Quantidade</Text>
                  </View>
                  <View style={[styles.tableCell, styles.totalCol]}>
                    <Text>Total</Text>
                  </View>
                </View>
                
                {/* Linhas da tabela */}
                {relatorio.produtosMaisVendidos.map((produto, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.productCol]}>
                      <Text>{produto.produto}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.quantityCol]}>
                      <Text>{produto.quantidade}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.totalCol]}>
                      <Text>{formatMoeda(produto.total)}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              {/* Resumo */}
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total de Itens Vendidos:</Text>
                  <Text style={styles.summaryValue}>{totalQuantidade}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total em Vendas:</Text>
                  <Text style={styles.summaryValue}>{formatMoeda(totalVendas)}</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text>Nenhum dado de venda disponível no período selecionado.</Text>
              <Text>As vendas serão registradas a partir da primeira venda realizada no sistema.</Text>
            </View>
          )}
        </View>

        {/* Seção de Vendas por Categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendas por Categoria</Text>
          
          {relatorio.vendasPorCategoria.length > 0 ? (
            <View style={styles.table}>
              {/* Cabeçalho da tabela */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={[styles.tableCell, styles.productCol]}>
                  <Text>Categoria</Text>
                </View>
                <View style={[styles.tableCell, styles.quantityCol]}>
                  <Text>Quantidade</Text>
                </View>
                <View style={[styles.tableCell, styles.totalCol]}>
                  <Text>Total</Text>
                </View>
              </View>
              
              {/* Linhas da tabela */}
              {relatorio.vendasPorCategoria.map((categoria, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.productCol]}>
                    <Text>{categoria.categoria}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.quantityCol]}>
                    <Text>{categoria.quantidade}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.totalCol]}>
                    <Text>{formatMoeda(categoria.total)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text>Nenhum dado de venda por categoria disponível.</Text>
            </View>
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>
            Lanche Fácil - Sistema de Gestão para Restaurantes | Documento gerado automaticamente
          </Text>
        </View>
      </Page>
    </Document>
  );
};