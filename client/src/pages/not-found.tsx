import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-lightest">
      <Card className="w-full max-w-md mx-4 border-red-200 shadow-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-gray-900">404 - Página Não Encontrada</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <div className="mt-6">
            <Link href="/">
              <Button variant="default" className="w-full">Voltar ao Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
