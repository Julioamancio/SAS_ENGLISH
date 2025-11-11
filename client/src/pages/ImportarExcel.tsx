import { useState, useRef } from "react";
import { parseExcelFile, generateImportTemplate, generateErrorReport } from "@/lib/excelUtils";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadIcon, DownloadIcon, AlertCircleIcon, CheckCircleIcon } from "@/components/Icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EXCEL_COLUMNS } from "@/const";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ImportRow {
  linha: number;
  nome: string;
  nivel: string;
  turma: string;
  professor: string;
  status: "pendente" | "sucesso" | "erro";
  erro?: string;
}

export default function ImportarExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    total: number;
    sucesso: number;
    erro: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      toast.error("Formato inválido. Use arquivos .xlsx ou .xls");
      return;
    }

    setFile(selectedFile);
    setPreview([]);
    setImportResult(null);

    try {
      toast.info("Processando arquivo...");
      const rows = await parseExcelFile(selectedFile);
      
      const previewData: ImportRow[] = rows.map((row) => ({
        linha: row.linha,
        nome: row.nome,
        nivel: row.nivel,
        turma: row.turma,
        professor: row.professor,
        status: "pendente" as const,
      }));
      
      setPreview(previewData);
      toast.success(`${previewData.length} registros carregados. Clique em 'Processar' para importar.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar arquivo");
    }
  };

  const handleProcess = async () => {
    if (!file || preview.length === 0) {
      toast.error("Nenhum arquivo para processar");
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock results
    const processedPreview = preview.map((row, index) => {
      if (index === 1) {
        return { ...row, status: "erro" as const, erro: "Turma não encontrada" };
      }
      return { ...row, status: "sucesso" as const };
    });

    setPreview(processedPreview);
    setImportResult({
      total: processedPreview.length,
      sucesso: processedPreview.filter((r) => r.status === "sucesso").length,
      erro: processedPreview.filter((r) => r.status === "erro").length,
    });
    setIsProcessing(false);
    
    toast.success("Importação concluída!");
  };

  const handleDownloadTemplate = () => {
    try {
      generateImportTemplate();
      toast.success("Template baixado! Verifique sua pasta de downloads.");
    } catch (error) {
      toast.error("Erro ao gerar template");
    }
  };

  const handleDownloadErrors = () => {
    const errors = preview.filter((r) => r.status === "erro");
    if (errors.length === 0) {
      toast.info("Nenhum erro para baixar");
      return;
    }
    
    try {
      const errorData = errors.map((e) => ({
        linha: e.linha,
        nome: e.nome,
        erro: e.erro || "Erro desconhecido",
      }));
      generateErrorReport(errorData);
      toast.success("Relatório de erros baixado!");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Importar Excel</h1>
          <p className="text-muted-foreground mt-2">
            Importe alunos, turmas e professores via planilha Excel
          </p>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções de Importação</CardTitle>
            <CardDescription>
              Siga o formato exato para garantir uma importação bem-sucedida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Formato da Planilha:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <strong>Coluna A:</strong> Nome do aluno (obrigatório)
                </li>
                <li>
                  <strong>Coluna B:</strong> Nível (ex: Básico, Intermediário, Avançado)
                </li>
                <li>
                  <strong>Coluna C:</strong> Nome da turma (ex: MED-1A)
                </li>
                <li>
                  <strong>Coluna D:</strong> Nome do professor
                </li>
              </ul>
            </div>

            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                A primeira linha deve conter os cabeçalhos. Os dados começam na linha 2.
                Turmas e professores inexistentes serão criados automaticamente.
              </AlertDescription>
            </Alert>

            <Button onClick={handleDownloadTemplate} variant="outline">
              <DownloadIcon className="mr-2" size={18} />
              Baixar Modelo de Planilha
            </Button>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Arquivo</CardTitle>
            <CardDescription>
              Escolha um arquivo .xlsx ou .xls para importar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild variant="outline">
                  <span className="cursor-pointer">
                    <UploadIcon className="mr-2" size={18} />
                    Escolher Arquivo
                  </span>
                </Button>
              </label>
              {file && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                </div>
              )}
            </div>

            {preview.length > 0 && !importResult && (
              <Button onClick={handleProcess} disabled={isProcessing} className="w-full">
                {isProcessing ? "Processando..." : "Processar Importação"}
              </Button>
            )}

            {importResult && (
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Nova Importação
                </Button>
                {importResult.erro > 0 && (
                  <Button onClick={handleDownloadErrors} variant="outline">
                    <DownloadIcon className="mr-2" size={18} />
                    Baixar Erros
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        {importResult && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{importResult.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600">
                  Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{importResult.sucesso}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600">
                  Erros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{importResult.erro}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview Table */}
        {preview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
              <CardDescription>
                {importResult
                  ? "Resultado da importação"
                  : "Dados que serão importados"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Linha</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Professor</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row) => (
                      <TableRow key={row.linha}>
                        <TableCell className="font-mono text-sm">{row.linha}</TableCell>
                        <TableCell className="font-medium">{row.nome}</TableCell>
                        <TableCell>{row.nivel}</TableCell>
                        <TableCell>{row.turma}</TableCell>
                        <TableCell>{row.professor}</TableCell>
                        <TableCell>
                          {row.status === "pendente" && (
                            <Badge variant="secondary">Pendente</Badge>
                          )}
                          {row.status === "sucesso" && (
                            <Badge className="bg-green-600 hover:bg-green-700">
                              <CheckCircleIcon className="mr-1" size={14} />
                              Sucesso
                            </Badge>
                          )}
                          {row.status === "erro" && (
                            <div className="space-y-1">
                              <Badge variant="destructive">
                                <AlertCircleIcon className="mr-1" size={14} />
                                Erro
                              </Badge>
                              {row.erro && (
                                <p className="text-xs text-destructive">{row.erro}</p>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
