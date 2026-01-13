import { useRef } from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer,
  PDFDownloadLink,
  pdf
} from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #ccc',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 10,
    width: '30%',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 10,
    width: '70%',
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 5,
    fontSize: 10,
  },
  itemCol: {
    width: '50%',
  },
  qtyCol: {
    width: '15%',
    textAlign: 'center',
  },
  priceCol: {
    width: '15%',
    textAlign: 'right',
  },
  totalCol: {
    width: '20%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    fontWeight: 'bold',
    fontSize: 11,
  },
  totalLabel: {
    width: '80%',
    textAlign: 'right',
  },
  totalValue: {
    width: '20%',
    textAlign: 'right',
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
    fontSize: 9,
    textAlign: 'center',
  },
  observations: {
    marginTop: 10,
    fontSize: 10,
  },
  observationsTitle: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  observationsText: {
    paddingLeft: 5,
  },
});

// Componente de documento PDF
const PedidoPDF = ({ pedido, itensPedido }: any) => (
  <Document>
    <Page size="A6" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>KARUK RESTAURANTE</Text>
        <Text style={styles.subtitle}>COMPROVANTE DE PEDIDO</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Número:</Text>
        <Text style={styles.infoValue}>{pedido.numero}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Data/Hora:</Text>
        <Text style={styles.infoValue}>{formatDateTime(new Date(pedido.data))}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Tipo:</Text>
        <Text style={styles.infoValue}>
          {pedido.tipo === 'balcao' ? 'Balcão' : 
           pedido.tipo === 'mesa' ? `Mesa ${pedido.mesaNumero || ''}` : 
           'Delivery'}
        </Text>
      </View>
      
      {pedido.nomeCliente && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>{pedido.nomeCliente}</Text>
        </View>
      )}
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Pagamento:</Text>
        <Text style={styles.infoValue}>
          {pedido.formaPagamento === 'dinheiro' ? 'Dinheiro' : 
           pedido.formaPagamento === 'cartao_credito' ? 'Cartão de Crédito' : 
           pedido.formaPagamento === 'cartao_debito' ? 'Cartão de Débito' : 
           pedido.formaPagamento === 'pix' ? 'PIX' : 
           pedido.formaPagamento}
        </Text>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.itemCol}>Item</Text>
          <Text style={styles.qtyCol}>Qtd</Text>
          <Text style={styles.priceCol}>Preço</Text>
          <Text style={styles.totalCol}>Total</Text>
        </View>
        
        {itensPedido.map((item: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.itemCol}>{item.nome}</Text>
            <Text style={styles.qtyCol}>{item.quantidade}</Text>
            <Text style={styles.priceCol}>
              {formatCurrency(parseFloat(item.preco))}
            </Text>
            <Text style={styles.totalCol}>
              {formatCurrency(parseFloat(item.preco) * item.quantidade)}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>TOTAL:</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(parseFloat(pedido.valorTotal))}
        </Text>
      </View>
      
      {pedido.observacoes && (
        <View style={styles.observations}>
          <Text style={styles.observationsTitle}>Observações:</Text>
          <Text style={styles.observationsText}>{pedido.observacoes}</Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text>Agradecemos pela preferência!</Text>
        <Text>LANCHE FÁCIL - Seu restaurante completo</Text>
      </View>
    </Page>
  </Document>
);

interface ImprimirPedidoProps {
  pedido: any;
  itensPedido: any[];
  buttonLabel?: string;
  autoImprimir?: boolean;
}

export const ImprimirPedido = ({ 
  pedido, 
  itensPedido, 
  buttonLabel = "Imprimir Pedido",
  autoImprimir = false
}: ImprimirPedidoProps) => {
  const printRef = useRef<HTMLIFrameElement>(null);

  // Função para impressão automática via iframe
  const imprimirAutomaticamente = async () => {
    try {
      // Gerar o PDF em blob
      const blob = await pdf(
        <PedidoPDF pedido={pedido} itensPedido={itensPedido} />
      ).toBlob();
      
      // Criar URL para o blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Criar um iframe temporário para imprimir
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      
      // Adicionar ao DOM e imprimir quando carregado
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print();
          
          // Remover o iframe após um tempo
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(blobUrl);
          }, 1000);
        } catch (e) {
          console.error('Erro ao imprimir:', e);
        }
      };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  // Auto-imprimir se a propriedade for true
  if (autoImprimir && pedido && itensPedido.length > 0) {
    // Usar setTimeout para garantir que o componente foi montado
    setTimeout(() => {
      imprimirAutomaticamente();
    }, 500);
  }

  return (
    <>
      <PDFDownloadLink
        document={<PedidoPDF pedido={pedido} itensPedido={itensPedido} />}
        fileName={`pedido-${pedido.numero}.pdf`}
        style={{ textDecoration: 'none' }}
      >
        {({ loading }) => (
          <Button 
            disabled={loading} 
            variant="outline" 
            className="gap-2"
            onClick={() => setTimeout(imprimirAutomaticamente, 100)}
          >
            <Printer className="h-4 w-4" />
            {loading ? "Gerando..." : buttonLabel}
          </Button>
        )}
      </PDFDownloadLink>
      
      {/* iframe escondido para impressão automática */}
      <iframe 
        ref={printRef} 
        style={{ display: 'none', height: '0', width: '0' }} 
      />
    </>
  );
};

// Exibir preview do PDF em uma visualização completa
export const PedidoPDFViewer = ({ pedido, itensPedido }: any) => (
  <PDFViewer style={{ width: '100%', height: '70vh' }}>
    <PedidoPDF pedido={pedido} itensPedido={itensPedido} />
  </PDFViewer>
);