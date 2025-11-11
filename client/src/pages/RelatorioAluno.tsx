import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { exportarRelatorioAlunoDocx } from "@/lib/docxUtils";
import { toast } from "sonner";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RelatorioAluno() {
  const [, params] = useRoute("/aluno/:id/relatorio");
  const alunoId = params?.id ? parseInt(params.id) : 0;

  const { data: aluno, isLoading: loadingAluno } = trpc.alunos.getById.useQuery({ id: alunoId });
  const { data: matriculas, isLoading: loadingMatriculas } = trpc.matriculas.getByAluno.useQuery({ alunoId });
  
  // Buscar notas do aluno
  const { data: notas } = trpc.notas.getByAluno.useQuery({ alunoId });
  
  // Buscar feedbacks do aluno
  const { data: feedbacks } = trpc.feedbacks.getByAluno.useQuery({ alunoId });

  if (loadingAluno || loadingMatriculas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Aluno não encontrado</h2>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const notasArray = notas || [];
  const mediaGeral = notasArray.length > 0
    ? notasArray.reduce((sum, n) => sum + n.nota, 0) / notasArray.length
    : 0;

  // Dados para gráfico de notas por etapa
  const notasPorEtapa = {
    labels: ["Etapa 1", "Etapa 2", "Etapa 3"],
    datasets: [
      {
        label: "Pontuação",
        data: [
          notasArray.filter(n => n.etapaNumero === 1).reduce((sum, n) => sum + n.nota, 0),
          notasArray.filter(n => n.etapaNumero === 2).reduce((sum, n) => sum + n.nota, 0),
          notasArray.filter(n => n.etapaNumero === 3).reduce((sum, n) => sum + n.nota, 0),
        ],
        backgroundColor: ["rgba(37, 99, 235, 0.6)", "rgba(59, 130, 246, 0.6)", "rgba(96, 165, 250, 0.6)"],
        borderColor: ["rgb(37, 99, 235)", "rgb(59, 130, 246)", "rgb(96, 165, 250)"],
        borderWidth: 2,
      },
    ],
  };

  // Dados para gráfico de evolução
  const evolucaoData = {
    labels: notasArray.map((_, i) => `Atividade ${i + 1}`),
    datasets: [
      {
        label: "Evolução das Notas",
        data: notasArray.map(n => n.nota),
        fill: true,
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        borderColor: "rgb(37, 99, 235)",
        tension: 0.4,
        pointBackgroundColor: "rgb(37, 99, 235)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(37, 99, 235)",
      },
    ],
  };

  // Dados para gráfico de comportamento
  const feedbacksArray = feedbacks || [];
  const comportamentos = {
    Excelente: feedbacksArray.filter((f: any) => f.comportamento === "Excelente").length,
    Ok: feedbacksArray.filter((f: any) => f.comportamento === "Ok").length,
    Inapropriado: feedbacksArray.filter((f: any) => f.comportamento === "Inapropriado").length,
  };

  const comportamentoData = {
    labels: ["Excelente", "Ok", "Inapropriado"],
    datasets: [
      {
        data: [comportamentos.Excelente, comportamentos.Ok, comportamentos.Inapropriado],
        backgroundColor: ["#10b981", "#6b7280", "#ef4444"],
        borderColor: ["#059669", "#4b5563", "#dc2626"],
        borderWidth: 2,
      },
    ],
  };

  const mediaFrequencia = feedbacksArray.length > 0
    ? feedbacksArray.reduce((sum: number, f: any) => sum + (f.frequencia || 0), 0) / feedbacksArray.length
    : 0;

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatório Individual do Aluno</h1>
          </div>
          <Button
            onClick={() => {
              if (!aluno || !matriculas || matriculas.length === 0) {
                toast.error("Dados incompletos para exportação");
                return;
              }
              const matriculaAtiva = matriculas.find(m => m.ativa);
              if (!matriculaAtiva) {
                toast.error("Nenhuma matrícula ativa encontrada");
                return;
              }
              exportarRelatorioAlunoDocx({
                alunoNome: aluno.nome,
                alunoRa: aluno.ra,
                turmaNome: "Turma",
                turmaAno: new Date().getFullYear(),
                etapas: notas?.map((n: any) => ({
                  nome: `Etapa ${n.etapaNumero || 1}`,
                  nota: n.nota || 0,
                  pontosMaximos: 35,
                })) || [],
                mediaGeral: (notas && notas.length > 0) ? notas.reduce((acc: number, n: any) => acc + (n.nota || 0), 0) / notas.length : 0,
                frequencia: feedbacks?.[0]?.frequencia || 0,
                comportamento: feedbacks?.[0]?.comportamento || "Normal",
                observacoes: feedbacks?.[0]?.observacoesGerais || undefined,
              });
              toast.success("Relatório exportado com sucesso!");
            }}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar para Word
          </Button>
        </div>
        <p className="text-gray-600 mt-2">
          Desempenho completo do aluno
        </p>

      {/* Informações do Aluno */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{aluno.nome}</CardTitle>
          <CardDescription>RA: {aluno.ra} | Nível: {aluno.nivel}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Média Geral</p>
              <p className="text-2xl font-bold text-blue-600">{mediaGeral.toFixed(1)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Frequência Média</p>
              <p className="text-2xl font-bold text-green-600">{mediaFrequencia.toFixed(0)}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total de Atividades</p>
              <p className="text-2xl font-bold text-purple-600">{notasArray.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pontuação por Etapa</CardTitle>
            <CardDescription>Total de pontos obtidos em cada etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar
              data={notasPorEtapa}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução das Notas</CardTitle>
            <CardDescription>Progresso ao longo das atividades</CardDescription>
          </CardHeader>
          <CardContent>
            <Line
              data={evolucaoData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comportamento</CardTitle>
            <CardDescription>Distribuição de avaliações comportamentais</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-64 h-64">
              <Doughnut
                data={comportamentoData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Geral</CardTitle>
            <CardDescription>Principais indicadores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Melhor Nota</p>
                <p className="text-xl font-semibold text-gray-900">
                  {notasArray.length > 0 ? Math.max(...notasArray.map(n => n.nota)).toFixed(1) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nota Mais Baixa</p>
                <p className="text-xl font-semibold text-gray-900">
                  {notasArray.length > 0 ? Math.min(...notasArray.map(n => n.nota)).toFixed(1) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Turma Atual</p>
                <p className="text-xl font-semibold text-gray-900">
                  {matriculas && matriculas.length > 0 ? matriculas[0].turmaNome : "Sem turma"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button onClick={() => window.print()}>
          Imprimir Relatório
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar
        </Button>
      </div>
    </div>
    </MainLayout>
  );
}
