import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Inventario from "@/pages/inventario";
import Estoque from "@/pages/estoque";
import Grupos from "@/pages/grupos";
import Movimentacoes from "@/pages/movimentacoes";
import Fornecedores from "@/pages/fornecedores";
import Configuracoes from "@/pages/configuracoes";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-lightest">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <Inventario />
        </Layout>
      </Route>
      <Route path="/estoque">
        <Layout>
          <Estoque />
        </Layout>
      </Route>
      <Route path="/grupos">
        <Layout>
          <Grupos />
        </Layout>
      </Route>
      <Route path="/movimentacoes">
        <Layout>
          <Movimentacoes />
        </Layout>
      </Route>
      <Route path="/fornecedores">
        <Layout>
          <Fornecedores />
        </Layout>
      </Route>
      <Route path="/configuracoes">
        <Layout>
          <Configuracoes />
        </Layout>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
