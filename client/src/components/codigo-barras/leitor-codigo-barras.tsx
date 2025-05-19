import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { QrCode, Barcode, Camera, X, RefreshCw } from "lucide-react";

// Propriedades do componente
interface LeitorCodigoBarrasProps {
  onScan: (data: string) => void;
  onClose?: () => void;
  titulo?: string;
  descricao?: string;
}

// Configurações do scanner
const qrConfig = { 
  fps: 15, // Taxa de quadros mais alta para melhor detecção
  qrbox: { width: 250, height: 150 },
  // Configuração mais simples para melhor compatibilidade
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true
  }
};
const aspectRatio = 1.33; // 4:3 para melhor visualização da câmera

export function LeitorCodigoBarras({
  onScan,
  onClose,
  titulo = "Leitor de Código de Barras/QR Code",
  descricao = "Escaneie um código de barras ou QR code para continuar"
}: LeitorCodigoBarrasProps) {
  const [activeTab, setActiveTab] = useState<string>("camera");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerStarted, setScannerStarted] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calcular largura e altura com base no container
  const getScannnerDimensions = () => {
    if (!containerRef.current) return { width: 300, height: 170 };
    
    const width = Math.min(containerRef.current.offsetWidth - 32, 500);
    const height = Math.floor(width / aspectRatio);
    
    return { width, height };
  };
  
  // Iniciar o scanner de câmera
  const startScanner = async () => {
    try {
      if (!containerRef.current) return;
      
      // Verificar se o elemento reader já existe
      let readerElement = document.getElementById("reader");
      
      // Se não existir, criar dinamicamente
      if (!readerElement) {
        console.log("Criando elemento reader dinamicamente");
        readerElement = document.createElement("div");
        readerElement.id = "reader";
        readerElement.style.width = "100%";
        readerElement.style.height = "100%";
        
        // Limpar o conteúdo do container e adicionar o elemento reader
        const scannerContainer = document.querySelector("#scanner-container");
        if (scannerContainer) {
          // Limpar qualquer conteúdo existente
          scannerContainer.innerHTML = "";
          scannerContainer.appendChild(readerElement);
        } else {
          console.error("Container para scanner não encontrado");
          return;
        }
      }
      
      // Se o scanner já estiver em uso, pare-o primeiro
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          console.log("Erro ao parar scanner existente:", err);
        }
      }
      
      const dimensions = getScannnerDimensions();
      
      // Criar o scanner
      scannerRef.current = new Html5Qrcode("reader");
      setIsScanning(true);
      
      // Solicitar dispositivos de câmera
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Usar a câmera traseira preferencialmente
        const cameraId = devices.length > 1 
          ? devices[1].id  // Segunda câmera (geralmente traseira)
          : devices[0].id; // Ou primeira câmera disponível
          
        // Iniciar escaneamento com configurações otimizadas
        await scannerRef.current.start(
          cameraId,
          {
            fps: qrConfig.fps,
            qrbox: {
              width: Math.min(dimensions.width - 50, qrConfig.qrbox.width),
              height: Math.min(dimensions.height - 50, qrConfig.qrbox.height)
            },
            experimentalFeatures: qrConfig.experimentalFeatures
          },
          (decodedText) => {
            // Processamento de sucesso
            handleScan(decodedText);
          },
          (errorMessage) => {
            // Logar apenas erros importantes - não mostrar pequenos erros de leitura
            if (errorMessage.includes("Permission") || 
                errorMessage.includes("not found") || 
                errorMessage.includes("failed")) {
              console.error("Erro de scanner:", errorMessage);
            }
          }
        );
        
        setScannerStarted(true);
      } else {
        toast({
          title: "Erro de câmera",
          description: "Nenhuma câmera encontrada no dispositivo",
          variant: "destructive"
        });
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Erro ao iniciar scanner:", error);
      toast({
        title: "Erro ao iniciar scanner",
        description: "Verifique as permissões de câmera e tente novamente",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };
  
  // Função para parar o scanner
  const stopScanner = async () => {
    if (scannerRef.current && scannerStarted) {
      try {
        await scannerRef.current.stop();
        setScannerStarted(false);
      } catch (error) {
        console.error("Erro ao parar scanner:", error);
      }
    }
    setIsScanning(false);
  };
  
  // Processar código escaneado
  const handleScan = (data: string) => {
    // Emitir o código lido
    onScan(data);
    
    // Notificar o usuário
    toast({
      title: "Código lido com sucesso",
      description: data,
      variant: "success"
    });
    
    // Parar o scanner automaticamente
    stopScanner();
  };
  
  // Processar entrada manual
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleScan(inputValue.trim());
      setInputValue("");
    }
  };
  
  // Alternar entre modos
  useEffect(() => {
    if (activeTab === "camera") {
      if (!isScanning) {
        startScanner();
      }
    } else {
      stopScanner();
    }
    
    // Limpar ao desmontar
    return () => {
      stopScanner();
    };
  }, [activeTab]);
  
  // Limpar ao desmontar componente
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{titulo}</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>{descricao}</CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 mx-4">
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>Câmera</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Barcode className="h-4 w-4" />
            <span>Manual</span>
          </TabsTrigger>
        </TabsList>
        
        <CardContent ref={containerRef}>
          <TabsContent value="camera" className="mt-0">
            <div id="scanner-container" className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md overflow-hidden">
              {isScanning ? (
                <div id="reader" className="w-full h-full" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {scannerStarted 
                      ? "Scanner ativo..." 
                      : "Iniciando scanner..."}
                  </p>
                </div>
              )}
            </div>
            
            {/* Botão para reiniciar o scanner */}
            <div className="flex justify-center mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  stopScanner();
                  setTimeout(() => startScanner(), 500);
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reiniciar câmera</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="mt-0">
            <div className="space-y-4">
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="codigo" className="text-sm font-medium">
                    Digite o código de barras:
                  </label>
                  <input
                    id="codigo"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ex: 7894561235412"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" disabled={!inputValue.trim()}>
                  Confirmar
                </Button>
              </form>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Dica: Para melhor leitura, mantenha o código bem iluminado e centralizado.
        </p>
        <p className="text-xs text-muted-foreground">
          Se a câmera não funcionar, tente usar o botão "Reiniciar câmera" ou digite o código manualmente na aba "Manual".
        </p>
      </CardFooter>
    </Card>
  );
}