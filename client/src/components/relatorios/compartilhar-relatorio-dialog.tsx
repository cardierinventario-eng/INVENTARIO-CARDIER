import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Share2, 
  Mail, 
  Copy, 
  Download,
  Smartphone,
  Check,
  Loader2
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { RelatorioVendasPDF } from "./relatorio-vendas-pdf";
import { RelatorioVendas } from "@shared/schema";

interface CompartilharRelatorioDialogProps {
  tipo: 'vendas' | 'financeiro' | 'estoque';
  dados: any;
  children?: React.ReactNode;
}

export function CompartilharRelatorioDialog({ 
  tipo, 
  dados, 
  children 
}: CompartilharRelatorioDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [compartilhamentoTab, setCompartilhamentoTab] = useState("email");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const { toast } = useToast();

  const resetarFormulario = () => {
    setCompartilhamentoTab("email");
    setEmail("");
    setTelefone("");
    setCopiado(false);
    setEnviando(false);
  };

  const handleEnviarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    // Simular envio
    setTimeout(() => {
      setEnviando(false);
      toast({
        title: "E-mail enviado",
        description: `Relatório enviado para ${email} com sucesso!`,
      });
      setIsOpen(false);
    }, 1500);
  };

  const handleCompartilharWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    // Simular envio
    setTimeout(() => {
      setEnviando(false);
      toast({
        title: "Compartilhamento no WhatsApp",
        description: `Link de compartilhamento enviado para ${telefone}`,
      });
      setIsOpen(false);
    }, 1500);
  };

  const handleCopiarLink = () => {
    // Simular cópia de link
    setCopiado(true);
    
    setTimeout(() => {
      setCopiado(false);
    }, 2000);
    
    toast({
      title: "Link copiado",
      description: "Link do relatório copiado para a área de transferência",
    });
  };

  const getDocumentTitle = () => {
    const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    switch (tipo) {
      case 'vendas':
        return `relatorio-vendas-${data}`;
      case 'financeiro':
        return `relatorio-financeiro-${data}`;
      case 'estoque':
        return `relatorio-estoque-${data}`;
      default:
        return `relatorio-${data}`;
    }
  };

  const getRelatorioComponent = () => {
    switch (tipo) {
      case 'vendas':
        return <RelatorioVendasPDF relatorio={dados as RelatorioVendas} />;
      // Implementar outros tipos de relatório conforme necessário
      default:
        return <RelatorioVendasPDF relatorio={dados as RelatorioVendas} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetarFormulario();
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compartilhar Relatório</DialogTitle>
          <DialogDescription>
            Escolha como deseja compartilhar o relatório de {
              tipo === 'vendas' ? 'vendas' : 
              tipo === 'financeiro' ? 'financeiro' : 'estoque'
            }.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="email" value={compartilhamentoTab} onValueChange={setCompartilhamentoTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">E-mail</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4 py-4">
            <form onSubmit={handleEnviarEmail}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    placeholder="email@exemplo.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <div className="flex space-x-2">
                    <Button type="button" size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Visualização
                    </Button>
                    <Button type="button" size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Anexo
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={enviando}>
                  {enviando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar E-mail
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="whatsapp" className="space-y-4 py-4">
            <form onSubmit={handleCompartilharWhatsApp}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Número do WhatsApp</Label>
                  <Input
                    id="telefone"
                    placeholder="(99) 99999-9999"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Informe o número com DDD, apenas números.
                  </p>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={enviando}>
                  {enviando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-2 h-4 w-4" />
                      Enviar WhatsApp
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Link para compartilhamento</Label>
                <div className="flex space-x-2">
                  <Input
                    value="https://lanche-facil.app/relatorios/compartilhados/ABC123"
                    readOnly
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleCopiarLink}>
                    {copiado ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Este link permite visualizar o relatório por 7 dias.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Download do PDF</Label>
                <div>
                  <PDFDownloadLink
                    document={getRelatorioComponent()}
                    fileName={`${getDocumentTitle()}.pdf`}
                    className="w-full"
                  >
                    {({ loading }) => (
                      <Button className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Preparando PDF...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar PDF
                          </>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}