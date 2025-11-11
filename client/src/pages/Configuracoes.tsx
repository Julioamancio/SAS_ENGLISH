import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Configuracoes() {
  const [schoolName, setSchoolName] = useState("SAS English");
  const [schoolLogo, setSchoolLogo] = useState("/logo.svg");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString());
  const [etapa1Weight, setEtapa1Weight] = useState("30");
  const [etapa2Weight, setEtapa2Weight] = useState("35");
  const [etapa3Weight, setEtapa3Weight] = useState("35");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    // Validar pesos
    const total = parseInt(etapa1Weight) + parseInt(etapa2Weight) + parseInt(etapa3Weight);
    if (total !== 100) {
      toast.error(`A soma dos pesos deve ser 100. Atual: ${total}`);
      setSaving(false);
      return;
    }

    try {
      // Aqui você salvaria no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular salvamento
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Gerencie as configurações gerais do sistema
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Informações da Escola */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Escola</CardTitle>
            <CardDescription>
              Configure o nome e logo da instituição
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schoolName">Nome da Escola</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Nome da instituição"
              />
            </div>
            <div>
              <Label htmlFor="schoolLogo">URL do Logo</Label>
              <Input
                id="schoolLogo"
                value={schoolLogo}
                onChange={(e) => setSchoolLogo(e.target.value)}
                placeholder="/logo.svg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Coloque o arquivo do logo em <code className="bg-gray-100 px-1 rounded">client/public/</code> e referencie aqui
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ano Letivo */}
        <Card>
          <CardHeader>
            <CardTitle>Ano Letivo</CardTitle>
            <CardDescription>
              Configure o ano letivo ativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="currentYear">Ano Letivo Atual</Label>
              <Input
                id="currentYear"
                type="number"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                placeholder="2024"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pesos das Etapas */}
        <Card>
          <CardHeader>
            <CardTitle>Pesos das Etapas</CardTitle>
            <CardDescription>
              Configure os pesos percentuais de cada etapa (total deve ser 100%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="etapa1">Etapa 1 (%)</Label>
                <Input
                  id="etapa1"
                  type="number"
                  min="0"
                  max="100"
                  value={etapa1Weight}
                  onChange={(e) => setEtapa1Weight(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="etapa2">Etapa 2 (%)</Label>
                <Input
                  id="etapa2"
                  type="number"
                  min="0"
                  max="100"
                  value={etapa2Weight}
                  onChange={(e) => setEtapa2Weight(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="etapa3">Etapa 3 (%)</Label>
                <Input
                  id="etapa3"
                  type="number"
                  min="0"
                  max="100"
                  value={etapa3Weight}
                  onChange={(e) => setEtapa3Weight(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Total:</strong> {parseInt(etapa1Weight) + parseInt(etapa2Weight) + parseInt(etapa3Weight)}%
                {parseInt(etapa1Weight) + parseInt(etapa2Weight) + parseInt(etapa3Weight) === 100 && " ✓"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
