import { useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { NotificationCenter, useNotifications } from "@/components/NotificationCenter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Notificacoes() {
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotifications();

  // Simulate some initial notifications
  useEffect(() => {
    // Add sample notifications on mount
    const timer = setTimeout(() => {
      addNotification({
        type: "warning",
        title: "Limite de pontos excedido",
        message: "A turma MED-1A ultrapassou o limite de pontos na 2ª Etapa (37/35).",
        action: {
          label: "Ver Detalhes",
          onClick: () => alert("Navegando para detalhes da turma..."),
        },
      });

      addNotification({
        type: "info",
        title: "Feedback pendente",
        message: "5 alunos da turma BAS-1A ainda não têm feedback da 1ª Etapa.",
        action: {
          label: "Ir para Feedbacks",
          onClick: () => (window.location.href = "/feedbacks"),
        },
      });

      addNotification({
        type: "success",
        title: "Importação concluída",
        message: "23 alunos foram importados com sucesso para a turma ADV-1A.",
      });

      addNotification({
        type: "error",
        title: "Erro na exportação",
        message: "Falha ao gerar relatório consolidado. Tente novamente.",
        action: {
          label: "Tentar Novamente",
          onClick: () => alert("Tentando novamente..."),
        },
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddTestNotification = () => {
    addNotification({
      type: "info",
      title: "Notificação de teste",
      message: `Criada em ${new Date().toLocaleTimeString("pt-BR")}`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Central de Notificações</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe alertas e atualizações importantes do sistema
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Notification Center */}
          <div className="lg:col-span-2">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onClear={clearNotification}
            />
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Notificação</CardTitle>
                <CardDescription>
                  O sistema envia alertas automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-yellow-600">⚠️ Avisos</p>
                  <p className="text-muted-foreground">
                    Limites de pontos excedidos, prazos próximos
                  </p>
                </div>
                <div>
                  <p className="font-medium text-blue-600">ℹ️ Informações</p>
                  <p className="text-muted-foreground">
                    Feedbacks pendentes, tarefas a fazer
                  </p>
                </div>
                <div>
                  <p className="font-medium text-green-600">✓ Sucesso</p>
                  <p className="text-muted-foreground">
                    Importações, exportações concluídas
                  </p>
                </div>
                <div>
                  <p className="font-medium text-red-600">✕ Erros</p>
                  <p className="text-muted-foreground">
                    Falhas em operações, problemas críticos
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teste de Notificação</CardTitle>
                <CardDescription>
                  Adicione uma notificação de teste
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleAddTestNotification} className="w-full">
                  Adicionar Notificação
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>
                  Personalize suas notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Notificações por email (em breve)</p>
                <p>• Notificações push (em breve)</p>
                <p>• Filtros personalizados (em breve)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
