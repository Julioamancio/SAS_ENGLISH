import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  BookOpenIcon,
  HeadphonesIcon,
  PenToolIcon,
  Edit3Icon,
  FileTextIcon,
} from "@/components/Icons";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QuestaoInglesModal } from "@/components/QuestaoInglesModal";

interface QuestaoIngles {
  id: number;
  titulo: string;
  tipo: "Reading" | "Listening" | "Grammar" | "Writing" | "Vocabulary";
  nivel: "A1" | "A2" | "B1" | "B2" | "B2+";
  enunciado: string;
  texto?: string;
  alternativas: string;
  respostaCorreta: number;
  explicacao?: string;
  tempoEstimado?: number;
  tags?: string;
  professorId: number;
  createdAt: string;
}

const tipoIcons = {
  Reading: BookOpenIcon,
  Listening: HeadphonesIcon,
  Grammar: PenToolIcon,
  Writing: Edit3Icon,
  Vocabulary: FileTextIcon,
};

const nivelColors = {
  A1: "bg-green-100 text-green-800",
  A2: "bg-blue-100 text-blue-800",
  B1: "bg-yellow-100 text-yellow-800",
  B2: "bg-orange-100 text-orange-800",
  "B2+": "bg-red-100 text-red-800",
};

export default function QuestoesIngles() {
  const [questoes, setQuestoes] = useState<QuestaoIngles[]>([]);
  const [filteredQuestoes, setFilteredQuestoes] = useState<QuestaoIngles[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [selectedNivel, setSelectedNivel] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestao, setEditingQuestao] = useState<QuestaoIngles | null>(null);

  const { data: questoesData, isLoading } = trpc.questoesIngles.getAll.useQuery();
  const createMutation = trpc.questoesIngles.create.useMutation();
  const updateMutation = trpc.questoesIngles.update.useMutation();

  useEffect(() => {
    if (questoesData) {
      setQuestoes(questoesData);
      setFilteredQuestoes(questoesData);
    }
  }, [questoesData]);

  useEffect(() => {
    let filtered = questoes;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.enunciado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.tags && q.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTipo) {
      filtered = filtered.filter(q => q.tipo === selectedTipo);
    }

    if (selectedNivel) {
      filtered = filtered.filter(q => q.nivel === selectedNivel);
    }

    setFilteredQuestoes(filtered);
  }, [questoes, searchTerm, selectedTipo, selectedNivel]);

  const handleCreateQuestao = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Questão criada com sucesso!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Erro ao criar questão");
    }
  };

  const handleUpdateQuestao = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id: editingQuestao!.id, ...data });
      toast.success("Questão atualizada com sucesso!");
      setIsModalOpen(false);
      setEditingQuestao(null);
    } catch (error) {
      toast.error("Erro ao atualizar questão");
    }
  };

  const handleEdit = (questao: QuestaoIngles) => {
    setEditingQuestao(questao);
    setIsModalOpen(true);
  };

  const parseAlternativas = (alternativasJson: string): string[] => {
    try {
      return JSON.parse(alternativasJson);
    } catch {
      return [];
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Questões de Inglês</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie questões de inglês nos padrões Cambridge/TOEFL/ENEM
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="mr-2" size={18} />
            Nova Questão
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre as questões por tipo, nível ou palavra-chave
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar questões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Listening">Listening</SelectItem>
                  <SelectItem value="Grammar">Grammar</SelectItem>
                  <SelectItem value="Writing">Writing</SelectItem>
                  <SelectItem value="Vocabulary">Vocabulary</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedNivel} onValueChange={setSelectedNivel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os níveis</SelectItem>
                  <SelectItem value="A1">A1 - Básico</SelectItem>
                  <SelectItem value="A2">A2 - Pré-intermediário</SelectItem>
                  <SelectItem value="B1">B1 - Intermediário</SelectItem>
                  <SelectItem value="B2">B2 - Avançado</SelectItem>
                  <SelectItem value="B2+">B2+ - Muito avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Questões ({filteredQuestoes.length})</CardTitle>
            <CardDescription>
              {filteredQuestoes.length === 0 
                ? "Nenhuma questão encontrada com os filtros aplicados"
                : "Clique em uma questão para editar"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestoes.map((questao) => {
                  const IconComponent = tipoIcons[questao.tipo];
                  const alternativas = parseAlternativas(questao.alternativas);
                  
                  return (
                    <div
                      key={questao.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleEdit(questao)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="text-primary" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{questao.titulo}</h3>
                              <Badge className={nivelColors[questao.nivel]}>
                                {questao.nivel}
                              </Badge>
                              <Badge variant="outline">{questao.tipo}</Badge>
                              {questao.tempoEstimado && (
                                <Badge variant="secondary">
                                  {questao.tempoEstimado}min
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {questao.enunciado}
                            </p>
                            {alternativas.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Alternativas:</p>
                                <div className="grid gap-1 text-sm">
                                  {alternativas.slice(0, 3).map((alt, index) => (
                                    <div 
                                      key={index}
                                      className={`flex items-center space-x-2 ${
                                        index === questao.respostaCorreta ? 'text-green-600 font-medium' : 'text-muted-foreground'
                                      }`}
                                    >
                                      <span className="text-xs">
                                        {String.fromCharCode(65 + index)}.
                                      </span>
                                      <span>{alt}</span>
                                      {index === questao.respostaCorreta && (
                                        <Badge variant="success" className="text-xs">Correta</Badge>
                                      )}
                                    </div>
                                  ))}
                                  {alternativas.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{alternativas.length - 3} alternativas
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            {questao.tags && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {questao.tags.split(',').map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag.trim()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <QuestaoInglesModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingQuestao(null);
          }}
          onSave={editingQuestao ? handleUpdateQuestao : handleCreateQuestao}
          questao={editingQuestao}
        />
      </div>
    </MainLayout>
  );
}