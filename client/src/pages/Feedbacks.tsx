import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardIcon, AlertCircleIcon } from "@/components/Icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MESSAGES } from "@/const";
import { Badge } from "@/components/ui/badge";

// Componente de botões de menu
function MenuButtons({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; color: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              value === option.value
                ? `${option.color} text-white shadow-md scale-105`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const COMPORTAMENTO_OPTIONS = [
  { value: "Ruim", label: "Ruim", color: "bg-red-600" },
  { value: "Normal", label: "Normal", color: "bg-blue-600" },
  { value: "Ótimo", label: "Ótimo", color: "bg-green-600" },
];

const NOTA_OPTIONS = [
  { value: "Ruim", label: "Ruim", color: "bg-red-600" },
  { value: "Normal", label: "Normal", color: "bg-blue-600" },
  { value: "Ótimo", label: "Ótimo", color: "bg-green-600" },
];

export default function Feedbacks() {
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);
  const [selectedEtapaId, setSelectedEtapaId] = useState<number | null>(null);
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    desempenhoAcademico: "",
    frequencia: 0,
    comportamento: "Normal", // Padrão: Normal
    nota: "Normal", // Padrão: Normal
    observacoesGerais: "",
    comentariosConselho: "",
  });

  const { data: turmas } = trpc.turmas.getAll.useQuery();
  const { data: etapas } = trpc.etapas.getByTurma.useQuery(
    { turmaId: selectedTurmaId! },
    { enabled: !!selectedTurmaId }
  );
  const { data: matriculas } = trpc.matriculas.getByTurma.useQuery(
    { turmaId: selectedTurmaId! },
    { enabled: !!selectedTurmaId }
  );
  const { data: feedback, refetch: refetchFeedback } = trpc.feedbacks.getByEtapaAndAluno.useQuery(
    { etapaId: selectedEtapaId!, alunoId: selectedAlunoId! },
    { enabled: !!selectedEtapaId && !!selectedAlunoId }
  );
  const { data: historico } = trpc.feedbacks.getHistorico.useQuery(
    { feedbackId: feedback?.id! },
    { enabled: !!feedback?.id }
  );

  const upsertFeedbackMutation = trpc.feedbacks.upsert.useMutation({
    onSuccess: () => {
      toast.success("Feedback salvo com sucesso!");
      refetchFeedback();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Load existing feedback when aluno/etapa selected
  useEffect(() => {
    if (feedback) {
      setFormData({
        desempenhoAcademico: feedback.desempenhoAcademico || "",
        frequencia: feedback.frequencia || 0,
        comportamento: feedback.comportamento || "Normal",
        nota: (feedback as any).nota || "Normal",
        observacoesGerais: feedback.observacoesGerais || "",
        comentariosConselho: feedback.comentariosConselho || "",
      });
    } else {
      // Reset to defaults when no feedback
      setFormData({
        desempenhoAcademico: "",
        frequencia: 0,
        comportamento: "Normal",
        nota: "Normal",
        observacoesGerais: "",
        comentariosConselho: "",
      });
    }
  }, [feedback]);

  const handleSave = () => {
    if (!selectedEtapaId || !selectedAlunoId) {
      toast.error("Selecione uma etapa e um aluno");
      return;
    }

    // Validate frequencia
    if (formData.frequencia < 0 || formData.frequencia > 100) {
      toast.error(MESSAGES.FREQUENCY_INVALID);
      return;
    }

    upsertFeedbackMutation.mutate({
      etapaId: selectedEtapaId,
      alunoId: selectedAlunoId,
      desempenhoAcademico: formData.desempenhoAcademico || undefined,
      frequencia: formData.frequencia || undefined,
      comportamento: formData.comportamento as any,
      observacoesGerais: formData.observacoesGerais || undefined,
      comentariosConselho: formData.comentariosConselho || undefined,
    });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Feedbacks por Etapa</h1>
          <p className="text-gray-600 mt-2">
            Registre feedbacks detalhados para cada aluno em cada etapa
          </p>
        </div>

        {/* Seleção de Turma, Etapa e Aluno */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardIcon className="h-5 w-5" />
              Seleção
            </CardTitle>
            <CardDescription>Escolha a turma, etapa e aluno</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Select
                  value={selectedTurmaId?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedTurmaId(parseInt(value));
                    setSelectedEtapaId(null);
                    setSelectedAlunoId(null);
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
                  onValueChange={(value) => {
                    setSelectedEtapaId(parseInt(value));
                    setSelectedAlunoId(null);
                  }}
                  disabled={!selectedTurmaId}
                >
                  <SelectTrigger id="etapa">
                    <SelectValue placeholder="Selecione uma etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {etapas?.map((etapa) => (
                      <SelectItem key={etapa.id} value={etapa.id.toString()}>
                        {etapa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno">Aluno</Label>
                <Select
                  value={selectedAlunoId?.toString() || ""}
                  onValueChange={(value) => setSelectedAlunoId(parseInt(value))}
                  disabled={!selectedEtapaId}
                >
                  <SelectTrigger id="aluno">
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {matriculas?.map((matricula) => (
                      <SelectItem key={matricula.id} value={matricula.alunoId.toString()}>
                        Aluno #{matricula.alunoId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        {selectedEtapaId && selectedAlunoId && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Formulário de Feedback</CardTitle>
                  <CardDescription>
                    Preencha os campos abaixo para registrar o feedback do aluno
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Desempenho Acadêmico */}
                  <div className="space-y-2">
                    <Label htmlFor="desempenho">Desempenho Acadêmico</Label>
                    <Textarea
                      id="desempenho"
                      placeholder="Descreva o desempenho acadêmico do aluno..."
                      rows={4}
                      value={formData.desempenhoAcademico}
                      onChange={(e) =>
                        setFormData({ ...formData, desempenhoAcademico: e.target.value })
                      }
                    />
                  </div>

                  {/* Frequência */}
                  <div className="space-y-2">
                    <Label htmlFor="frequencia">Frequência (%)</Label>
                    <Input
                      id="frequencia"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Ex: 95.5"
                      value={formData.frequencia}
                      onChange={(e) =>
                        setFormData({ ...formData, frequencia: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor entre 0 e 100 (aceita decimais)
                    </p>
                  </div>

                  {/* Comportamento - Botões de Menu */}
                  <MenuButtons
                    label="Comportamento em Sala"
                    value={formData.comportamento}
                    onChange={(value) => setFormData({ ...formData, comportamento: value })}
                    options={COMPORTAMENTO_OPTIONS}
                  />

                  {/* Nota - Botões de Menu */}
                  <MenuButtons
                    label="Avaliação de Nota"
                    value={formData.nota}
                    onChange={(value) => setFormData({ ...formData, nota: value })}
                    options={NOTA_OPTIONS}
                  />

                  {/* Observações Gerais */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações Gerais (Opcional)</Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Adicione observações gerais sobre o aluno..."
                      rows={4}
                      value={formData.observacoesGerais}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoesGerais: e.target.value })
                      }
                    />
                  </div>

                  {/* Comentários do Conselho de Classe */}
                  <div className="space-y-2">
                    <Label htmlFor="conselho">Comentários do Conselho de Classe (Opcional)</Label>
                    <Textarea
                      id="conselho"
                      placeholder="Adicione comentários do conselho de classe..."
                      rows={6}
                      value={formData.comentariosConselho}
                      onChange={(e) =>
                        setFormData({ ...formData, comentariosConselho: e.target.value })
                      }
                    />
                  </div>

                  {/* Botão Salvar */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={upsertFeedbackMutation.isPending}
                      className="flex-1"
                    >
                      {upsertFeedbackMutation.isPending ? "Salvando..." : "Salvar Feedback"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Histórico */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Alterações</CardTitle>
                  <CardDescription>Registro de modificações no feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  {historico && historico.length > 0 ? (
                    <div className="space-y-3">
                      {historico.map((item: any) => (
                        <div key={item.id} className="border-l-2 border-blue-500 pl-3 py-2">
                          <p className="text-sm font-medium text-gray-900">{item.userName}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(item.createdAt).toLocaleString("pt-BR")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{item.descricao}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma alteração registrada</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!selectedEtapaId && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <AlertCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Selecione uma turma, etapa e aluno para começar</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
