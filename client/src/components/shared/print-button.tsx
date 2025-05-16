import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  contentId: string;
  title: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function PrintButton({ contentId, title, variant = "outline" }: PrintButtonProps) {
  const printRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    const content = document.getElementById(contentId);
    if (!content) {
      console.error(`Elemento com id ${contentId} não encontrado`);
      return;
    }

    // Criar um iframe oculto para impressão
    if (printRef.current) {
      const iframe = printRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Estilos básicos
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
                h1 {
                  font-size: 18px;
                  text-align: center;
                  margin-bottom: 20px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
                }
                th {
                  background-color: #f2f2f2;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 10px;
                }
                .logo {
                  font-weight: bold;
                  font-size: 16px;
                }
                .info {
                  text-align: right;
                  font-size: 12px;
                }
                .footer {
                  margin-top: 20px;
                  border-top: 1px solid #ddd;
                  padding-top: 10px;
                  text-align: center;
                  font-size: 12px;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 15px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">Lanche Fácil</div>
                <div class="info">
                  Data: ${new Date().toLocaleDateString('pt-BR')}<br>
                  Hora: ${new Date().toLocaleTimeString('pt-BR')}
                </div>
              </div>
              <h1>${title}</h1>
              ${content.outerHTML}
              <div class="footer">
                Este relatório foi gerado pelo sistema Lanche Fácil.<br>
                © ${new Date().getFullYear()} Lanche Fácil - Todos os direitos reservados.
              </div>
            </body>
          </html>
        `);
        iframeDoc.close();

        // Imprimir o iframe
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 500);
      }
    }
  };

  return (
    <>
      <Button variant={variant} onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" /> Imprimir
      </Button>
      <iframe
        ref={printRef}
        style={{ display: 'none' }}
        title="Impressão"
      />
    </>
  );
}
