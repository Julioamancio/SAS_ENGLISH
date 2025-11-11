import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, UsersIcon, BookOpenIcon, FileTextIcon } from "@/components/Icons";
import { Link, useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { STAGE_DEFAULTS } from "@/const";

export default function TurmaDetalhe() {
  const [, params] = useRoute("/turmas/:id");
  const turmaId = params?.id ? parseInt(params.id) : 0;

  const { data: turma, isLoading: turmaLoading } = trpc.turmas.getById.useQuery(
    { id: turmaId },
    { enabled: turmaId > 0 }
  );
  
  const { data: etapas, isLoading: etapasLoading } = trpc.etapas.getByTurma.useQuery(
    { turmaId },
    { enabled: turmaId > 0 }
  );
  
  const { data: matriculas, isLoading: matriculasLoading } = trpc.matriculas.getByTurma.useQuery(
    { turmaId },
    { enabled: turmaId > 0 }
  );

  if (turmaLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!turma) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-lg font-medium mb-2">Turma não encontrada</p>
          <Link href="/turmas">
            <Button variant="outline">Voltar para Turmas</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/turmas">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeftIcon className="mr-2" size={18} />
              Voltar
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{turma.nome}</h1>
              <p className="text-muted-foreground mt-2">
                {turma.nivel} • Ano {turma.ano}
              </p>
            </div>
            <Badge variant={turma.ativa ? "default" : "secondary"}>
              {turma.ativa ? "Ativa" : "Inativa"}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="alunos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alunos">
              <UsersIcon className="mr-2" size={18} />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="etapas">
              <BookOpenIcon className="mr-2" size={18} />
              Etapas
            </TabsTrigger>
            <TabsTrigger value="atividades">
              <BookOpenIcon className="mr-2" size={18} />
              Atividades
            </TabsTrigger>
            <TabsTrigger value="relatorios">
              <FileTextIcon className="mr-2" size={18} />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Alunos Tab */}
          <TabsContent value="alunos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alunos Matriculados</CardTitle>
                <CardDescription>
                  Lista de alunos ativos nesta turma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matriculasLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : matriculas && matriculas.length > 0 ? (
                  <div className="space-y-2">
                    {matriculas.map((matricula) => (
                      <div
                        key={matricula.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">Aluno #{matricula.alunoId}</p>
                          <p className="text-sm text-muted-foreground">
                            Matrícula desde {new Date(matricula.dataInicio).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state py-8">
                    <UsersIcon className="h-10 w-10 mb-3" />
                    <p className="font-medium">Nenhum aluno matriculado</p>
                    <p className="text-sm">Importe alunos via Excel ou adicione manualmente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Etapas Tab */}
          <TabsContent value="etapas" className="space-y-4">
            {etapasLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : etapas && etapas.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {etapas.map((etapa) => (
                  <EtapaCard key={etapa.id} etapa={etapa} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="empty-state">
                    <BookOpenIcon className="h-10 w-10 mb-3" />
                    <p className="font-medium">Nenhuma etapa encontrada</p>
                    <p className="text-sm">As etapas padrão devem ser criadas automaticamente</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Atividades Tab */}
          <TabsContent value="atividades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividades por Etapa</CardTitle>
                <CardDescription>
                  Gerencie as atividades de cada etapa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="empty-state py-8">
                  <BookOpenIcon className="h-10 w-10 mb-3" />
                  <p className="font-medium">Selecione uma etapa para ver as atividades</p>
                  <p className="text-sm">Acesse a aba "Etapas" para gerenciar atividades</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Tab */}
          <TabsContent value="relatorios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Exportações</CardTitle>
                <CardDescription>
                  Exporte dados consolidados da turma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <FileTextIcon className="mr-2" size={18} />
                    Exportar Consolidado (XLSX)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <FileTextIcon className="mr-2" size={18} />
                    Relatório de Frequência (em breve)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <FileTextIcon className="mr-2" size={18} />
                    Relatório de Comportamento (em breve)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function EtapaCard({ etapa }: { etapa: any }) {
  const { data: pontosAlocados } = trpc.atividades.getTotalPontosAlocados.useQuery({
    etapaId: etapa.id,
  });

  const total = pontosAlocados || 0;
  const max = etapa.pontosMaximos;
  const percentage = (total / max) * 100;
  const isExceeded = total > max;
  const isWarning = percentage > 80 && !isExceeded;

  return (
    <Card className={isExceeded ? "border-destructive" : ""}>
      <CardHeader>
        <CardTitle className="text-lg">{etapa.nome}</CardTitle>
        <CardDescription>
          {total}/{max} pontos alocados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress
            value={Math.min(percentage, 100)}
            className={
              isExceeded
                ? "stage-progress-danger"
                : isWarning
                ? "stage-progress-warning"
                : "stage-progress-ok"
            }
          />
          <p className="text-xs text-muted-foreground">
            {percentage.toFixed(0)}% utilizado
          </p>
        </div>
        
        {isExceeded && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            ⚠️ Limite excedido! Ajuste as atividades.
          </div>
        )}
        
        <Button variant="outline" size="sm" className="w-full">
          Gerenciar Atividades
        </Button>
      </CardContent>
    </Card>
  );
}
