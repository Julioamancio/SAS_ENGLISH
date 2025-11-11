import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NotasDistributionChart,
  ComportamentoChart,
  FrequenciaChart,
  DesempenhoGeralChart,
} from "@/components/Charts";

export default function Estatisticas() {
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);

  const { data: turmas } = trpc.turmas.getAll.useQuery();

  // Mock data for demonstration - in production, fetch from backend
  const mockNotasData = {
    etapa1: 26.5,
    etapa2: 29.8,
    etapa3: 27.3,
  };

  const mockComportamentoData = {
    excelente: 15,
    ok: 8,
    inapropriado: 2,
  };

  const mockFrequenciaData = [
    { mes: "Jan", frequencia: 92 },
    { mes: "Fev", frequencia: 88 },
    { mes: "Mar", frequencia: 95 },
    { mes: "Abr", frequencia: 91 },
    { mes: "Mai", frequencia: 94 },
    { mes: "Jun", frequencia: 96 },
  ];

  const mockDesempenhoData = [
    { aluno: "João Silva", total: 92 },
    { aluno: "Ana Costa", total: 88 },
    { aluno: "Pedro Santos", total: 85 },
    { aluno: "Maria Oliveira", total: 95 },
    { aluno: "Carlos Lima", total: 78 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Estatísticas e Gráficos</h1>
          <p className="text-muted-foreground mt-2">
            Visualize o desempenho e comportamento dos alunos
          </p>
        </div>

        {/* Turma Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione a Turma</CardTitle>
            <CardDescription>
              Escolha uma turma para visualizar as estatísticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="turma">Turma</Label>
              <Select
                value={selectedTurmaId?.toString() || ""}
                onValueChange={(value) => setSelectedTurmaId(parseInt(value))}
              >
                <SelectTrigger id="turma">
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas?.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id.toString()}>
                      {turma.nome} - {turma.nivel} ({turma.ano})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedTurmaId && (
          <>
            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Notas Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Média de Notas</CardTitle>
                  <CardDescription>
                    Distribuição das médias por etapa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotasDistributionChart data={mockNotasData} />
                </CardContent>
              </Card>

              {/* Comportamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Comportamento</CardTitle>
                  <CardDescription>
                    Distribuição do comportamento em sala
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComportamentoChart data={mockComportamentoData} />
                </CardContent>
              </Card>

              {/* Frequência */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequência</CardTitle>
                  <CardDescription>
                    Evolução da frequência ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FrequenciaChart data={mockFrequenciaData} />
                </CardContent>
              </Card>

              {/* Desempenho Geral */}
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho Geral</CardTitle>
                  <CardDescription>
                    Pontuação total dos alunos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DesempenhoGeralChart data={mockDesempenhoData} />
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">83.6</p>
                  <p className="text-xs text-muted-foreground mt-1">de 100 pontos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">92.7%</p>
                  <p className="text-xs text-muted-foreground mt-1">presença geral</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Aprovação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">92%</p>
                  <p className="text-xs text-muted-foreground mt-1">23 de 25 alunos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Comportamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">Excelente</p>
                  <p className="text-xs text-muted-foreground mt-1">60% excelente</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Empty State */}
        {!selectedTurmaId && (
          <Card>
            <CardContent className="py-12">
              <div className="empty-state">
                <p className="text-lg font-medium mb-2">Selecione uma turma</p>
                <p className="text-sm">
                  Use o filtro acima para visualizar as estatísticas
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
