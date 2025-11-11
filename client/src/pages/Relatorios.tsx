import { useState } from "react";
import { generateConsolidatedReport } from "@/lib/excelUtils";
import { MainLayout } from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileTextIcon, DownloadIcon, UsersIcon, AlertCircleIcon } from "@/components/Icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MESSAGES } from "@/const";

export default function Relatorios() {
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null);
  const [novaTurmaId, setNovaTurmaId] = useState<number | null>(null);

  const { data: user } = trpc.auth.me.useQuery();
  const { data: turmas } = trpc.turmas.getAll.useQuery();
  const { data: matriculas } = trpc.matriculas.getByTurma.useQuery(
    { turmaId: selectedTurmaId! },
    { enabled: !!selectedTurmaId }
  );

  const transferirMutation = trpc.matriculas.transferir.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || MESSAGES.TRANSFER_SUCCESS);
      setIsTransferDialogOpen(false);
      setSelectedAlunoId(null);
      setNovaTurmaId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao transferir aluno: ${error.message}`);
    },
  });

  const isAdmin = user?.role === "admin";

  const handleExportConsolidado = () => {
    if (!selectedTurmaId) {
      toast.error("Selecione uma turma");
      return;
    }

    try {
      const turmaData = turmas?.find((t) => t.id === selectedTurmaId);
      if (!turmaData) {
        toast.error("Turma não encontrada");
        return;
      }

      // Mock data - in production, fetch real data from backend
      const exportData = {
        turma: turmaData.nome,
        alunos: [
          {
            ra: "2024001",
            nome: "Aluno Exemplo 1",
            etapa1: 28,
            etapa2: 32,
            etapa3: 30,
            total: 90,
            frequencia: 95.5,
            comportamento: "Excelente",
          },
          {
            ra: "2024002",
            nome: "Aluno Exemplo 2",
            etapa1: 25,
            etapa2: 30,
            etapa3: 28,
            total: 83,
            frequencia: 88.0,
            comportamento: "Ok",
          },
        ],
      };

      generateConsolidatedReport(exportData);
      toast.success("Relatório consolidado exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    }
  };

  const handleTransferir = () => {
    if (!selectedAlunoId || !novaTurmaId) {
      toast.error("Selecione o aluno e a turma de destino");
      return;
    }

    if (confirm("Tem certeza que deseja transferir este aluno? O histórico será preservado.")) {
      transferirMutation.mutate({
        alunoId: selectedAlunoId,
        novaTurmaId,
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Relatórios e Transferências</h1>
          <p className="text-muted-foreground mt-2">
            Exporte dados consolidados e gerencie transferências de alunos
          </p>
        </div>

        {/* Exportação */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Relatório Consolidado</CardTitle>
            <CardDescription>
              Gere um arquivo Excel com todas as informações da turma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="turma-export">Selecione a Turma</Label>
              <Select
                value={selectedTurmaId?.toString() || ""}
                onValueChange={(value) => setSelectedTurmaId(parseInt(value))}
              >
                <SelectTrigger id="turma-export">
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

            <Alert>
              <FileTextIcon className="h-4 w-4" />
              <AlertTitle>Conteúdo do Relatório</AlertTitle>
              <AlertDescription>
                O relatório incluirá: lista de alunos, notas por etapa, frequência,
                comportamento, feedbacks e estatísticas gerais.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleExportConsolidado}
              disabled={!selectedTurmaId}
              className="w-full"
            >
              <DownloadIcon className="mr-2" size={18} />
              Exportar Consolidado (XLSX)
            </Button>
          </CardContent>
        </Card>

        {/* Transferência de Alunos */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Transferência de Alunos</CardTitle>
              <CardDescription>
                Transfira alunos entre turmas preservando o histórico completo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="turma-origem">Turma de Origem</Label>
                <Select
                  value={selectedTurmaId?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedTurmaId(parseInt(value));
                    setSelectedAlunoId(null);
                  }}
                >
                  <SelectTrigger id="turma-origem">
                    <SelectValue placeholder="Selecione a turma de origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {turmas?.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id.toString()}>
                        {turma.nome} - {turma.nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTurmaId && matriculas && matriculas.length > 0 && (
                <div className="space-y-2">
                  <Label>Alunos da Turma</Label>
                  <div className="border rounded-lg divide-y">
                    {matriculas.map((matricula) => (
                      <div
                        key={matricula.id}
                        className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">Aluno #{matricula.alunoId}</p>
                          <p className="text-sm text-muted-foreground">
                            Matrícula desde {new Date(matricula.dataInicio).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Dialog
                          open={isTransferDialogOpen && selectedAlunoId === matricula.alunoId}
                          onOpenChange={(open) => {
                            setIsTransferDialogOpen(open);
                            if (!open) {
                              setSelectedAlunoId(null);
                              setNovaTurmaId(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAlunoId(matricula.alunoId)}
                            >
                              <UsersIcon className="mr-2" size={16} />
                              Transferir
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Transferir Aluno</DialogTitle>
                              <DialogDescription>
                                Selecione a turma de destino. O histórico de notas e feedbacks será preservado.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Alert>
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle>Atenção</AlertTitle>
                                <AlertDescription>
                                  A matrícula atual será encerrada e uma nova será criada na turma de destino.
                                  Todas as notas e feedbacks serão mantidos.
                                </AlertDescription>
                              </Alert>

                              <div className="space-y-2">
                                <Label htmlFor="turma-destino">Turma de Destino</Label>
                                <Select
                                  value={novaTurmaId?.toString() || ""}
                                  onValueChange={(value) => setNovaTurmaId(parseInt(value))}
                                >
                                  <SelectTrigger id="turma-destino">
                                    <SelectValue placeholder="Selecione a turma de destino" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {turmas
                                      ?.filter((t) => t.id !== selectedTurmaId)
                                      .map((turma) => (
                                        <SelectItem key={turma.id} value={turma.id.toString()}>
                                          {turma.nome} - {turma.nivel} ({turma.ano})
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsTransferDialogOpen(false);
                                  setSelectedAlunoId(null);
                                  setNovaTurmaId(null);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleTransferir}
                                disabled={!novaTurmaId || transferirMutation.isPending}
                              >
                                {transferirMutation.isPending ? "Transferindo..." : "Confirmar Transferência"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTurmaId && (!matriculas || matriculas.length === 0) && (
                <div className="empty-state py-8">
                  <UsersIcon className="h-10 w-10 mb-3" />
                  <p className="font-medium">Nenhum aluno nesta turma</p>
                  <p className="text-sm">Selecione outra turma ou importe alunos</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Outros Relatórios */}
        <Card>
          <CardHeader>
            <CardTitle>Outros Relatórios</CardTitle>
            <CardDescription>
              Relatórios adicionais disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileTextIcon className="mr-2" size={18} />
              Relatório de Frequência Geral (em breve)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileTextIcon className="mr-2" size={18} />
              Relatório de Comportamento (em breve)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileTextIcon className="mr-2" size={18} />
              Estatísticas por Etapa (em breve)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <FileTextIcon className="mr-2" size={18} />
              Relatório Individual por Aluno (em breve)
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
