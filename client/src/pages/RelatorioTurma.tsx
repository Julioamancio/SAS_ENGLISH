import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { exportarRelatorioTurmaDocx } from "@/lib/docxUtils";
import { toast } from "sonner";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RelatorioTurma() {
  const [, params] = useRoute("/turma/:id/relatorio");
  const turmaId = params?.id ? parseInt(params.id) : 0;

  const { data: turma, isLoading: loadingTurma } = trpc.turmas.getById.useQuery({ id: turmaId });
  const { data: matriculas, isLoading: loadingMatriculas } = trpc.matriculas.getByTurma.useQuery({ turmaId });
  const { data: etapas } = trpc.etapas.getByTurma.useQuery({ turmaId });

  if (loadingTurma || loadingMatriculas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Turma não encontrada</h2>
        </div>
      </div>
    );
  }

  const alunos = matriculas || [];
  
  // Calcular estatísticas gerais
  const totalAlunos = alunos.length;
  const mediaGeralTurma = alunos.length > 0
    ? alunos.reduce((sum: number, a: any) => sum + (a.mediaGeral || 0), 0) / alunos.length
    : 0;

  // Dados para gráfico de distribuição de notas
  const distribuicaoNotas = {
    labels: alunos.map((a: any) => a.alunoNome),
    datasets: [
      {
        label: "Média Geral",
        data: alunos.map((a: any) => a.mediaGeral || 0),
        backgroundColor: "rgba(37, 99, 235, 0.6)",
        borderColor: "rgb(37, 99, 235)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatório Geral da Turma</h1>
          </div>
          <Button
            onClick={() => {
              if (!turma || !matriculas) {
                toast.error("Dados incompletos para exportação");
                return;
              }
              // Preparar dados dos alunos
              const alunosData = matriculas.map((m: any) => ({
                ra: m.alunoId.toString(),
                nome: `Aluno ${m.alunoId}`,
                etapa1: undefined,
                etapa2: undefined,
                etapa3: undefined,
                mediaGeral: undefined,
                frequencia: undefined,
                comportamento: undefined,
              }));
              exportarRelatorioTurmaDocx({
                turmaNome: turma.nome,
                turmaNivel: turma.nivel,
                turmaAno: turma.ano,
                totalAlunos: matriculas.length,
                mediaGeralTurma: 0,
                alunos: alunosData,
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
          {turma.nome} - {turma.nivel} | Ano: {turma.ano}
        </p>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Alunos</p>
              <p className="text-3xl font-bold text-blue-600">{totalAlunos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Média Geral da Turma</p>
              <p className="text-3xl font-bold text-green-600">{mediaGeralTurma.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Etapas Configuradas</p>
              <p className="text-3xl font-bold text-purple-600">{etapas?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Distribuição */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Distribuição de Médias</CardTitle>
          <CardDescription>Média geral de cada aluno da turma</CardDescription>
        </CardHeader>
        <CardContent>
          <Bar
            data={distribuicaoNotas}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Tabela de Alunos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Desempenho Individual</CardTitle>
          <CardDescription>Detalhamento de todos os alunos da turma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-700">RA</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Nome</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Etapa 1</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Etapa 2</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Etapa 3</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Média</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Frequência</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Comportamento</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-gray-500">
                      Nenhum aluno matriculado nesta turma
                    </td>
                  </tr>
                ) : (
                  alunos.map((aluno: any) => (
                    <tr key={aluno.alunoId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-gray-900">{aluno.alunoRa}</td>
                      <td className="p-3 text-gray-900">{aluno.alunoNome}</td>
                      <td className="p-3 text-center text-gray-700">{aluno.etapa1 || "-"}</td>
                      <td className="p-3 text-center text-gray-700">{aluno.etapa2 || "-"}</td>
                      <td className="p-3 text-center text-gray-700">{aluno.etapa3 || "-"}</td>
                      <td className="p-3 text-center font-semibold text-blue-600">
                        {aluno.mediaGeral ? aluno.mediaGeral.toFixed(1) : "-"}
                      </td>
                      <td className="p-3 text-center text-gray-700">{aluno.frequencia || "-"}%</td>
                      <td className="p-3 text-center">
                        {aluno.comportamento === "Excelente" && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Excelente
                          </span>
                        )}
                        {aluno.comportamento === "Ok" && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Ok
                          </span>
                        )}
                        {aluno.comportamento === "Inapropriado" && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inapropriado
                          </span>
                        )}
                        {!aluno.comportamento && <span className="text-gray-400">-</span>}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/aluno/${aluno.alunoId}/relatorio`}
                        >
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button onClick={() => window.print()}>
          Imprimir Relatório
        </Button>
        <Button variant="outline">
          Exportar para Word
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar
        </Button>
      </div>
    </div>
    </MainLayout>
  );
}
