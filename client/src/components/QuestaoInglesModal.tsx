import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface QuestaoInglesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  questao?: any;
}

const QUESTION_TYPES = [
  { value: "Reading", label: "Reading Comprehension" },
  { value: "Listening", label: "Listening Comprehension" },
  { value: "Grammar", label: "Grammar & Usage" },
  { value: "Writing", label: "Writing Prompt" },
  { value: "Vocabulary", label: "Vocabulary in Context" },
];

const LEVELS = [
  { value: "A1", label: "A1 - Beginner" },
  { value: "A2", label: "A2 - Elementary" },
  { value: "B1", label: "B1 - Intermediate" },
  { value: "B2", label: "B2 - Upper Intermediate" },
  { value: "B2+", label: "B2+ - Advanced" },
];

export function QuestaoInglesModal({ isOpen, onClose, onSave, questao }: QuestaoInglesModalProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    nivel: "",
    enunciado: "",
    texto: "",
    alternativas: ["", "", "", ""],
    respostaCorreta: 0,
    explicacao: "",
    tempoEstimado: 5,
    tags: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (questao) {
      setFormData({
        titulo: questao.titulo || "",
        tipo: questao.tipo || "",
        nivel: questao.nivel || "",
        enunciado: questao.enunciado || "",
        texto: questao.texto || "",
        alternativas: questao.alternativas ? JSON.parse(questao.alternativas) : ["", "", "", ""],
        respostaCorreta: questao.respostaCorreta || 0,
        explicacao: questao.explicacao || "",
        tempoEstimado: questao.tempoEstimado || 5,
        tags: questao.tags || "",
      });
    } else {
      setFormData({
        titulo: "",
        tipo: "",
        nivel: "",
        enunciado: "",
        texto: "",
        alternativas: ["", "", "", ""],
        respostaCorreta: 0,
        explicacao: "",
        tempoEstimado: 5,
        tags: "",
      });
    }
    setErrors({});
  }, [questao, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    }

    if (!formData.tipo) {
      newErrors.tipo = "Tipo de questão é obrigatório";
    }

    if (!formData.nivel) {
      newErrors.nivel = "Nível é obrigatório";
    }

    if (!formData.enunciado.trim()) {
      newErrors.enunciado = "Enunciado é obrigatório";
    }

    // Validate alternatives for non-writing questions
    if (formData.tipo !== "Writing") {
      const validAlternatives = formData.alternativas.filter(alt => alt.trim() !== "");
      if (validAlternatives.length < 2) {
        newErrors.alternativas = "Pelo menos 2 alternativas são necessárias";
      }
      if (formData.respostaCorreta >= validAlternatives.length) {
        newErrors.respostaCorreta = "Resposta correta inválida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    const data = {
      ...formData,
      alternativas: JSON.stringify(formData.alternativas),
      professorId: 1, // This should come from auth context
    };

    onSave(data);
    onClose();
  };

  const addAlternative = () => {
    setFormData(prev => ({
      ...prev,
      alternativas: [...prev.alternativas, ""]
    }));
  };

  const removeAlternative = (index: number) => {
    if (formData.alternativas.length <= 2) {
      toast.error("Mínimo de 2 alternativas necessárias");
      return;
    }
    
    const newAlternatives = formData.alternativas.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      alternativas: newAlternatives,
      respostaCorreta: prev.respostaCorreta >= newAlternatives.length ? 0 : prev.respostaCorreta
    }));
  };

  const updateAlternative = (index: number, value: string) => {
    const newAlternatives = [...formData.alternativas];
    newAlternatives[index] = value;
    setFormData(prev => ({ ...prev, alternativas: newAlternatives }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {questao ? "Editar Questão" : "Nova Questão de Inglês"}
          </DialogTitle>
          <DialogDescription>
            Crie questões nos padrões Cambridge/TOEFL/ENEM com níveis A1-B2+
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Questão *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Present Simple - Daily Routine"
                className={errors.titulo ? "border-red-500" : ""}
              />
              {errors.titulo && <p className="text-sm text-red-500">{errors.titulo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Questão *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-sm text-red-500">{errors.tipo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nível (CEFR) *</Label>
              <Select value={formData.nivel} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel: value }))}>
                <SelectTrigger className={errors.nivel ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nivel && <p className="text-sm text-red-500">{errors.nivel}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempoEstimado">Tempo Estimado (minutos)</Label>
              <Input
                id="tempoEstimado"
                type="number"
                min="1"
                max="60"
                value={formData.tempoEstimado}
                onChange={(e) => setFormData(prev => ({ ...prev, tempoEstimado: parseInt(e.target.value) || 5 }))}
                placeholder="5"
              />
            </div>
          </div>

          {/* Question Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="enunciado">Enunciado da Questão *</Label>
              <Textarea
                id="enunciado"
                value={formData.enunciado}
                onChange={(e) => setFormData(prev => ({ ...prev, enunciado: e.target.value }))}
                placeholder="Digite o enunciado da questão..."
                rows={3}
                className={errors.enunciado ? "border-red-500" : ""}
              />
              {errors.enunciado && <p className="text-sm text-red-500">{errors.enunciado}</p>}
            </div>

            {(formData.tipo === "Reading" || formData.tipo === "Listening") && (
              <div className="space-y-2">
                <Label htmlFor="texto">Texto/Transcrição</Label>
                <Textarea
                  id="texto"
                  value={formData.texto}
                  onChange={(e) => setFormData(prev => ({ ...prev, texto: e.target.value }))}
                  placeholder="Digite o texto principal para leitura ou transcrição para listening..."
                  rows={6}
                />
              </div>
            )}
          </div>

          {/* Alternatives (for non-writing questions) */}
          {formData.tipo !== "Writing" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Alternativas *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAlternative}>
                  Adicionar Alternativa
                </Button>
              </div>
              
              {formData.alternativas.map((alternative, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="respostaCorreta"
                      checked={formData.respostaCorreta === index}
                      onChange={() => setFormData(prev => ({ ...prev, respostaCorreta: index }))}
                      className="mt-1"
                    />
                    <span className="text-sm font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                  </div>
                  <Input
                    value={alternative}
                    onChange={(e) => updateAlternative(index, e.target.value)}
                    placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  {formData.alternativas.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAlternative(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              ))}
              
              {errors.alternativas && (
                <p className="text-sm text-red-500">{errors.alternativas}</p>
              )}
              {errors.respostaCorreta && (
                <p className="text-sm text-red-500">{errors.respostaCorreta}</p>
              )}
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explicacao">Explicação da Resposta</Label>
            <Textarea
              id="explicacao"
              value={formData.explicacao}
              onChange={(e) => setFormData(prev => ({ ...prev, explicacao: e.target.value }))}
              placeholder="Explique por que esta é a resposta correta..."
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Ex: present simple, daily routine, beginner"
            />
            {formData.tags && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {questao ? "Atualizar" : "Criar"} Questão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}