import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Download, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ExportarEstoqueDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/relatorio/estoque-pdf");
      if (!response.ok) {
        throw new Error("Erro ao gerar PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-estoque-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      setIsLoading(true);
      
      // Gera o PDF primeiro
      const response = await fetch("/api/relatorio/estoque-pdf");
      if (!response.ok) {
        throw new Error("Erro ao gerar PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const mensagem = encodeURIComponent(
        `📊 *RELATÓRIO DE ESTOQUE*\n\n` +
        `Segue em anexo o relatório completo de estoque com todas as entradas, saídas e quantidades.\n\n` +
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")}\n` +
        `Horário: ${new Date().toLocaleTimeString("pt-BR")}`
      );

      // Abre WhatsApp Web com mensagem pré-preenchida
      // Para enviar arquivo, o usuário precisará fazer manualmente via WhatsApp
      const whatsappUrl = `https://web.whatsapp.com/send?text=${mensagem}`;
      window.open(whatsappUrl, "_blank");

      // Também faz download automático do PDF
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-estoque-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Estoque
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Relatório de Estoque</DialogTitle>
          <DialogDescription>
            Escolha como deseja exportar o relatório de estoque com todos os produtos, entradas e saídas.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Relatório incluirá:</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ Todos os produtos organizados por categoria</li>
              <li>✓ Quantidade em estoque</li>
              <li>✓ Valor unitário</li>
              <li>✓ Valor total por produto</li>
              <li>✓ Histórico de entradas e saídas</li>
              <li>✓ Resumo geral com totais</li>
            </ul>
          </div>

          <div className="flex gap-2 flex-col">
            <Button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isLoading ? "Gerando..." : "Baixar PDF"}
            </Button>

            <Button
              onClick={handleShareWhatsApp}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {isLoading ? "Preparando..." : "Compartilhar no WhatsApp"}
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
            💡 <strong>Dica:</strong> Ao clicar em "Compartilhar no WhatsApp", o PDF será baixado automaticamente e você poderá enviar via WhatsApp Web.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
