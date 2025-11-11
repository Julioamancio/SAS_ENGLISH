import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, EditIcon, TrashIcon, ClipboardIcon, AlertCircleIcon } from "@/components/Icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MESSAGES } from "@/const";
import { useLocation } from "wouter";

export default function Atividades() {
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);
  const [selectedEtapaId, setSelectedEtapaId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLancamentoDialogOpen, setIsLancamentoDialogOpen] = useState(false);
  const [selectedAtividadeId, setSelectedAtividadeId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    titulo: "",
    data: new Date().toISOString().split("T")[0],
    pontuacaoMaxima: 0,
  });

  const { data: turmas } = trpc.turmas.getAll.useQuery();
  const { data: etapas } = trpc.etapas.getByTurma.useQuery(
    { turmaId: selectedTurmaId! },
    { enabled: !!selectedTurmaId }
  );
  const { data: atividades, refetch: refetchAtividades } = trpc.atividades.getByEtapa.useQuery(
    { etapaId: selectedEtapaId! },
    { enabled: !!selectedEtapaId }
  );
  const { data: pontosAlocados } = trpc.atividades.getTotalPontosAlocados.useQuery(
    { etapaId: selectedEtapaId! },
    { enabled: !!selectedEtapaId }
  );

  const createAtividadeMutation = trpc.atividades.create.useMutation({
    onSuccess: () => {
      toast.success("Atividade criada com sucesso!");
      setIsCreateDialogOpen(false);
      refetchAtividades();
      setFormData({ titulo: "", data: new Date().toISOString().split("T")[0], pontuacaoMaxima: 0 });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteAtividadeMutation = trpc.atividades.delete.useMutation({
    onSuccess: () => {
      toast.success("Atividade excluída com sucesso!");
      refetchAtividades();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir atividade: ${error.message}`);
    },
  });

  const selectedEtapa = etapas?.find((e) => e.id === selectedEtapaId);
  const pontosDisponiveis = selectedEtapa ? selectedEtapa.pontosMaximos - (pontosAlocados || 0) : 0;
  const isLimitExceeded = pontosDisponiveis < 0;

  const handleCreateAtividade = () => {
    if (!selectedEtapaId) {
      toast.error("Selecione uma etapa");
      return;
    }
    if (!formData.titulo || formData.pontuacaoMaxima <= 0) {
      toast.error("Preencha todos os campos corretamente");
      return;
    }

    createAtividadeMutation.mutate({
      etapaId: selectedEtapaId,
      titulo: formData.titulo,
      data: new Date(formData.data),
      pontuacaoMaxima: formData.pontuacaoMaxima,
    });
  };

  const handleDeleteAtividade = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta atividade? As notas associadas também serão excluídas.")) {
      deleteAtividadeMutation.mutate({ id });
    }
  };

  const handleLancamentoMassa = (atividadeId: number) => {
    setSelectedAtividadeId(atividadeId);
    setIsLancamentoDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Atividades</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie atividades e lance notas por etapa
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione a Turma e Etapa</CardTitle>
            <CardDescription>
              Escolha uma turma e etapa para visualizar e gerenciar atividades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Select
                  value={selectedTurmaId?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedTurmaId(parseInt(value));
                    setSelectedEtapaId(null);
                  }}
                >
                  <SelectTrigger id="turma">
                    <SelectValue placeholder="Selecione uma turma" />
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

              <div className="space-y-2">
                <Label htmlFor="etapa">Etapa</Label>
                <Select
                  value={selectedEtapaId?.toString() || ""}
                  onValueChange={(value) => setSelectedEtapaId(parseInt(value))}
                  disabled={!selectedTurmaId}
                >
                  <SelectTrigger id="etapa">
                    <SelectValue placeholder="Selecione uma etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {etapas?.map((etapa) => (
                      <SelectItem key={etapa.id} value={etapa.id.toString()}>
                        {etapa.nome} ({etapa.pontosMaximos} pontos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedEtapa && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pontos da Etapa:</span>
                  <span className="text-sm">
                    {pontosAlocados || 0} / {selectedEtapa.pontosMaximos}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pontos Disponíveis:</span>
                  <span className={`text-sm font-bold ${isLimitExceeded ? "text-destructive" : "text-green-600"}`}>
                    {pontosDisponiveis}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limit Exceeded Alert */}
        {isLimitExceeded && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Limite de Pontos Excedido!</AlertTitle>
            <AlertDescription>
              {MESSAGES.STAGE_LIMIT_EXCEEDED(pontosAlocados || 0, selectedEtapa?.pontosMaximos || 0)}
            </AlertDescription>
          </Alert>
        )}

        {/* Atividades List */}
        {selectedEtapaId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Atividades</CardTitle>
                  <CardDescription>
                    Lista de atividades da {selectedEtapa?.nome}
                  </CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusIcon className="mr-2" size={18} />
                      Nova Atividade
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Atividade</DialogTitle>
                      <DialogDescription>
                        Pontos disponíveis: {pontosDisponiveis}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título *</Label>
                        <Input
                          id="titulo"
                          placeholder="Ex: Prova de Vocabulário"
                          value={formData.titulo}
                          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data">Data *</Label>
                        <Input
                          id="data"
                          type="date"
                          value={formData.data}
                          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pontuacao">Pontuação Máxima *</Label>
                        <Input
                          id="pontuacao"
                          type="number"
                          min="0"
                          max={pontosDisponiveis}
                          value={formData.pontuacaoMaxima}
                          onChange={(e) => setFormData({ ...formData, pontuacaoMaxima: parseInt(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Máximo disponível: {pontosDisponiveis} pontos
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateAtividade} disabled={createAtividadeMutation.isPending}>
                        {createAtividadeMutation.isPending ? "Criando..." : "Criar Atividade"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {atividades && atividades.length > 0 ? (
                <div className="space-y-2">
                  {atividades.map((atividade) => (
                    <div
                      key={atividade.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{atividade.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(atividade.data).toLocaleDateString("pt-BR")} • {atividade.pontuacaoMaxima} pontos
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLancamentoMassa(atividade.id)}
                        >
                          <ClipboardIcon className="mr-2" size={16} />
                          Lançar Notas
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAtividade(atividade.id)}
                        >
                          <TrashIcon size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state py-8">
                  <ClipboardIcon className="h-10 w-10 mb-3" />
                  <p className="font-medium">Nenhuma atividade cadastrada nesta etapa</p>
                  <p className="text-sm">Crie uma nova atividade para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lançamento em Massa Dialog */}
        {selectedAtividadeId && (
          <LancamentoMassaDialog
            atividadeId={selectedAtividadeId}
            turmaId={selectedTurmaId!}
            isOpen={isLancamentoDialogOpen}
            onClose={() => {
              setIsLancamentoDialogOpen(false);
              setSelectedAtividadeId(null);
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}

function LancamentoMassaDialog({
  atividadeId,
  turmaId,
  isOpen,
  onClose,
}: {
  atividadeId: number;
  turmaId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notas, setNotas] = useState<Record<number, { nota: number; comentario: string }>>({});

  const { data: atividade } = trpc.atividades.getById.useQuery({ id: atividadeId });
  const { data: matriculas } = trpc.matriculas.getByTurma.useQuery({ turmaId });
  const { data: notasExistentes } = trpc.notas.getByAtividade.useQuery({ atividadeId });

  const upsertBatchMutation = trpc.notas.upsertBatch.useMutation({
    onSuccess: (data) => {
      const successCount = data.results.filter((r) => r.success).length;
      const errorCount = data.results.filter((r) => !r.success).length;
      
      if (errorCount === 0) {
        toast.success(`${successCount} notas lançadas com sucesso!`);
        onClose();
      } else {
        toast.warning(`${successCount} notas salvas, ${errorCount} com erro`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao lançar notas: ${error.message}`);
    },
  });

  const handleSave = () => {
    const notasArray = Object.entries(notas).map(([alunoId, data]) => ({
      alunoId: parseInt(alunoId),
      nota: data.nota,
      comentario: data.comentario || undefined,
    }));

    if (notasArray.length === 0) {
      toast.error("Nenhuma nota foi preenchida");
      return;
    }

    upsertBatchMutation.mutate({
      atividadeId,
      notas: notasArray,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lançamento em Massa - {atividade?.titulo}</DialogTitle>
          <DialogDescription>
            Pontuação máxima: {atividade?.pontuacaoMaxima} pontos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {matriculas?.map((matricula) => {
            const notaExistente = notasExistentes?.find((n) => n.alunoId === matricula.alunoId);
            const currentNota = notas[matricula.alunoId] || {
              nota: notaExistente?.nota || 0,
              comentario: notaExistente?.comentario || "",
            };

            return (
              <div key={matricula.id} className="grid grid-cols-12 gap-4 items-center p-3 border rounded-lg">
                <div className="col-span-4">
                  <p className="font-medium">Aluno #{matricula.alunoId}</p>
                  <p className="text-xs text-muted-foreground">RA: {matricula.alunoId}</p>
                </div>
                <div className="col-span-3">
                  <Label htmlFor={`nota-${matricula.alunoId}`} className="sr-only">
                    Nota
                  </Label>
                  <Input
                    id={`nota-${matricula.alunoId}`}
                    type="number"
                    min="0"
                    max={atividade?.pontuacaoMaxima || 100}
                    placeholder="Nota"
                    value={currentNota.nota}
                    onChange={(e) =>
                      setNotas({
                        ...notas,
                        [matricula.alunoId]: {
                          ...currentNota,
                          nota: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div className="col-span-5">
                  <Label htmlFor={`comentario-${matricula.alunoId}`} className="sr-only">
                    Comentário
                  </Label>
                  <Input
                    id={`comentario-${matricula.alunoId}`}
                    placeholder="Comentário (opcional)"
                    value={currentNota.comentario}
                    onChange={(e) =>
                      setNotas({
                        ...notas,
                        [matricula.alunoId]: {
                          ...currentNota,
                          comentario: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={upsertBatchMutation.isPending}>
            {upsertBatchMutation.isPending ? "Salvando..." : "Salvar Notas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
