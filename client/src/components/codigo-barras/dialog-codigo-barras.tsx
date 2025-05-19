import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LeitorCodigoBarras } from "./leitor-codigo-barras";
import { Barcode } from "lucide-react";

interface DialogCodigoBarrasProps {
  onScan: (data: string) => void;
  trigger?: React.ReactNode;
  titulo?: string;
  descricao?: string;
}

export function DialogCodigoBarras({
  onScan,
  trigger,
  titulo = "Leitor de Código de Barras",
  descricao = "Utilize a câmera ou digite o código manualmente"
}: DialogCodigoBarrasProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleScan = (data: string) => {
    onScan(data);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Barcode className="h-4 w-4" />
            <span>Ler Código de Barras</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <LeitorCodigoBarras 
          onScan={handleScan}
          onClose={() => setIsOpen(false)}
          titulo={titulo}
          descricao={descricao}
        />
      </DialogContent>
    </Dialog>
  );
}