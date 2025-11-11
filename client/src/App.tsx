import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Turmas from "./pages/Turmas";
import TurmaDetalhe from "./pages/TurmaDetalhe";
import Atividades from "./pages/Atividades";
import Feedbacks from "./pages/Feedbacks";
import ImportarExcel from "./pages/ImportarExcel";
import Relatorios from "./pages/Relatorios";
import Estatisticas from "./pages/Estatisticas";
import Notificacoes from "./pages/Notificacoes";
import Configuracoes from "./pages/Configuracoes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RelatorioAluno from "./pages/RelatorioAluno";
import RelatorioTurma from "./pages/RelatorioTurma";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path={"/"} component={Dashboard} />
      <Route path={"/turmas"} component={Turmas} />
      <Route path={"/turmas/:id"} component={TurmaDetalhe} />
      <Route path={"/atividades"} component={Atividades} />
      <Route path={"/feedbacks"} component={Feedbacks} />
      <Route path={"/relatorios"} component={Relatorios} />
      <Route path={"/estatisticas"} component={Estatisticas} />
      <Route path="/notificacoes" component={Notificacoes} />
      <Route path="/configuracoes" component={Configuracoes} />
      <Route path="/aluno/:id/relatorio" component={RelatorioAluno} />
      <Route path="/turma/:id/relatorio" component={RelatorioTurma} />
      <Route path={"/importar"} component={ImportarExcel} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
