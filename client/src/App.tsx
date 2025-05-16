import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Pedidos from "@/pages/pedidos";
import Mesas from "@/pages/mesas";
import Estoque from "@/pages/estoque";
import Clientes from "@/pages/clientes";
import Cardapio from "@/pages/cardapio";
import Relatorios from "@/pages/relatorios";
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
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/pedidos">
        <Layout>
          <Pedidos />
        </Layout>
      </Route>
      <Route path="/mesas">
        <Layout>
          <Mesas />
        </Layout>
      </Route>
      <Route path="/estoque">
        <Layout>
          <Estoque />
        </Layout>
      </Route>
      <Route path="/clientes">
        <Layout>
          <Clientes />
        </Layout>
      </Route>
      <Route path="/cardapio">
        <Layout>
          <Cardapio />
        </Layout>
      </Route>
      <Route path="/relatorios">
        <Layout>
          <Relatorios />
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
