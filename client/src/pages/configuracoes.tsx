import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Save,
  Building,
  User,
  Receipt,
  Percent,
  CreditCard,
  Printer,
  Palette,
  Shield,
  HelpCircle,
  Plus
} from "lucide-react";

export default function Configuracoes() {
  const [temaAtual, setTemaAtual] = useState<string>("claro");

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-neutral-darkest">Configurações</h1>
        <p className="text-neutral-dark">Personalize o sistema de acordo com suas necessidades</p>
      </div>
      
      <Tabs defaultValue="empresa" className="mb-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-2">
          <TabsTrigger value="empresa">
            <Building className="mr-2 h-4 w-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <User className="mr-2 h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="fiscal">
            <Receipt className="mr-2 h-4 w-4" /> Fiscal
          </TabsTrigger>
          <TabsTrigger value="pagamentos">
            <CreditCard className="mr-2 h-4 w-4" /> Pagamentos
          </TabsTrigger>
          <TabsTrigger value="impressao">
            <Printer className="mr-2 h-4 w-4" /> Impressão
          </TabsTrigger>
          <TabsTrigger value="aparencia">
            <Palette className="mr-2 h-4 w-4" /> Aparência
          </TabsTrigger>
        </TabsList>
        
        {/* Configurações da Empresa */}
        <TabsContent value="empresa" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Configure os dados cadastrais da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input id="nomeEmpresa" placeholder="Lanche Fácil" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="contato@lanchefacil.com.br" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea id="endereco" placeholder="Rua, número, bairro, etc." />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" placeholder="Lins" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select defaultValue="SP">
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      {/* Outros estados */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" placeholder="00000-000" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configurações de Aparência */}
        <TabsContent value="aparencia" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência do Sistema</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex space-x-4">
                  <div 
                    className={`border-2 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition ${temaAtual === 'claro' ? 'border-primary' : 'border-neutral-light'}`}
                    onClick={() => setTemaAtual('claro')}
                  >
                    <div className="h-1/2 bg-white"></div>
                    <div className="h-1/2 bg-neutral-lightest"></div>
                    <div className="mt-1 text-center text-xs">Claro</div>
                  </div>
                  
                  <div 
                    className={`border-2 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition ${temaAtual === 'escuro' ? 'border-primary' : 'border-neutral-light'}`}
                    onClick={() => setTemaAtual('escuro')}
                  >
                    <div className="h-1/2 bg-neutral-darkest"></div>
                    <div className="h-1/2 bg-neutral-dark"></div>
                    <div className="mt-1 text-center text-xs">Escuro</div>
                  </div>
                  
                  <div 
                    className={`border-2 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition ${temaAtual === 'sistema' ? 'border-primary' : 'border-neutral-light'}`}
                    onClick={() => setTemaAtual('sistema')}
                  >
                    <div className="h-1/2 bg-gradient-to-r from-white to-neutral-darkest"></div>
                    <div className="h-1/2 bg-gradient-to-r from-neutral-lightest to-neutral-dark"></div>
                    <div className="mt-1 text-center text-xs">Sistema</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Cores Primárias</Label>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary cursor-pointer border-2 border-white shadow-md"></div>
                  <div className="w-10 h-10 rounded-full bg-secondary cursor-pointer border-2 border-white shadow-md"></div>
                  <div className="w-10 h-10 rounded-full bg-accent cursor-pointer border-2 border-white shadow-md"></div>
                  <div className="w-10 h-10 rounded-full bg-neutral-dark cursor-pointer border-2 border-white shadow-md"></div>
                  <div className="w-10 h-10 rounded-full cursor-pointer border-2 border-dashed border-neutral-dark flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="animacoes" defaultChecked />
                <Label htmlFor="animacoes">Ativar animações</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tamanhoFonte">Tamanho da Fonte</Label>
                <Select defaultValue="medio">
                  <SelectTrigger id="tamanhoFonte" className="w-[180px]">
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pequeno">Pequeno</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                className="mr-auto"
              >
                Restaurar Padrão
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Placeholder para as outras abas */}
        <TabsContent value="usuarios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Adicione, edite e remova usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-10 text-center text-neutral-dark">
                Conteúdo de configuração de usuários
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fiscal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Fiscais</CardTitle>
              <CardDescription>
                Configure informações fiscais e tributárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-10 text-center text-neutral-dark">
                Conteúdo de configurações fiscais
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pagamentos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>
                Configure as formas de pagamento aceitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-10 text-center text-neutral-dark">
                Conteúdo de configurações de pagamento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="impressao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Impressão</CardTitle>
              <CardDescription>
                Configure impressoras e modelos de impressão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-10 text-center text-neutral-dark">
                Conteúdo de configurações de impressão
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
