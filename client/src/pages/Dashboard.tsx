import { MainLayout } from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, BookOpenIcon, FileTextIcon, AlertCircleIcon } from "@/components/Icons";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { data: turmas, isLoading: turmasLoading } = trpc.turmas.getAll.useQuery();
  const { data: user } = trpc.auth.me.useQuery();

  const isAdmin = user?.role === "admin";

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao SAS English - Sistema de Gestão Escolar
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Turmas Card */}
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {turmasLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{turmas?.length || 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {isAdmin ? "Total de turmas" : "Suas turmas"}
              </p>
            </CardContent>
          </Card>

          {/* Atividades Card */}
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando lançamento
              </p>
            </CardContent>
          </Card>

          {/* Relatórios Card */}
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-1">
                Disponíveis para exportação
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Turmas List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Minhas Turmas</h2>
            {isAdmin && (
              <Link href="/turmas">
                <a className="text-sm text-primary hover:underline">Ver todas →</a>
              </Link>
            )}
          </div>

          {turmasLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : turmas && turmas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {turmas.map((turma) => (
                <Link key={turma.id} href={`/turmas/${turma.id}`}>
                  <Card className="card-hover cursor-pointer">
                    <CardHeader>
                      <CardTitle>{turma.nome}</CardTitle>
                      <CardDescription>
                        {turma.nivel} • {turma.ano}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Clique para ver detalhes
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="empty-state">
                  <UsersIcon className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium mb-2">Nenhuma turma encontrada</p>
                  <p className="text-sm">
                    {isAdmin
                      ? "Crie uma nova turma ou importe alunos via Excel"
                      : "Você ainda não possui turmas atribuídas"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Alerts Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Alertas e Notificações</h2>
          <div className="space-y-4">
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Sistema em funcionamento</AlertTitle>
              <AlertDescription>
                Todos os sistemas estão operacionais. Nenhum alerta no momento.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Quick Actions */}
        {isAdmin && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Ações Rápidas</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/turmas">
                <Card className="card-hover cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Gerenciar Turmas</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/importar">
                <Card className="card-hover cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Importar Excel</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/relatorios">
                <Card className="card-hover cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Relatórios</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/configuracoes">
                <Card className="card-hover cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">Configurações</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
