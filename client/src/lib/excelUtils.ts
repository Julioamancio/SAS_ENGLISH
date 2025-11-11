import * as XLSX from "xlsx";

export interface ExcelImportRow {
  linha: number;
  nome: string;
  nivel: string;
  turma: string;
  professor: string;
}

export interface ExcelExportData {
  turma: string;
  alunos: Array<{
    ra: string;
    nome: string;
    etapa1: number;
    etapa2: number;
    etapa3: number;
    total: number;
    frequencia: number;
    comportamento: string;
  }>;
}

/**
 * Parse Excel file and extract data
 */
export async function parseExcelFile(file: File): Promise<ExcelImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        // Skip header row (index 0)
        const rows: ExcelImportRow[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row[0]) continue; // Skip empty rows

          rows.push({
            linha: i + 1,
            nome: String(row[0] || ""),
            nivel: String(row[1] || ""),
            turma: String(row[2] || ""),
            professor: String(row[3] || ""),
          });
        }

        resolve(rows);
      } catch (error) {
        reject(new Error(`Erro ao processar arquivo: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler arquivo"));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Generate Excel template for import
 */
export function generateImportTemplate(): void {
  const data = [
    ["Nome", "Nível", "Turma", "Professor"],
    ["João Silva", "Básico", "BAS-1A", "Prof. Maria Santos"],
    ["Ana Costa", "Intermediário", "MED-1A", "Prof. João Silva"],
    ["Pedro Oliveira", "Avançado", "ADV-1A", "Prof. Carlos Lima"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Importação");

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 }, // Nome
    { wch: 15 }, // Nível
    { wch: 15 }, // Turma
    { wch: 25 }, // Professor
  ];

  XLSX.writeFile(workbook, "template_importacao_sas.xlsx");
}

/**
 * Generate consolidated report Excel
 */
export function generateConsolidatedReport(data: ExcelExportData): void {
  const rows = [
    [
      "RA",
      "Nome",
      "1ª Etapa",
      "2ª Etapa",
      "3ª Etapa",
      "Total",
      "Frequência (%)",
      "Comportamento",
    ],
  ];

  data.alunos.forEach((aluno) => {
    rows.push([
      aluno.ra,
      aluno.nome,
      aluno.etapa1.toString(),
      aluno.etapa2.toString(),
      aluno.etapa3.toString(),
      aluno.total.toString(),
      aluno.frequencia.toFixed(1),
      aluno.comportamento,
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidado");

  // Set column widths
  worksheet["!cols"] = [
    { wch: 12 }, // RA
    { wch: 25 }, // Nome
    { wch: 10 }, // 1ª Etapa
    { wch: 10 }, // 2ª Etapa
    { wch: 10 }, // 3ª Etapa
    { wch: 10 }, // Total
    { wch: 15 }, // Frequência
    { wch: 15 }, // Comportamento
  ];

  const fileName = `consolidado_${data.turma}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Generate error report Excel
 */
export function generateErrorReport(
  errors: Array<{ linha: number; nome: string; erro: string }>
): void {
  const rows = [["Linha", "Nome", "Erro"]];

  errors.forEach((error) => {
    rows.push([error.linha.toString(), error.nome, error.erro]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Erros");

  worksheet["!cols"] = [
    { wch: 8 }, // Linha
    { wch: 25 }, // Nome
    { wch: 50 }, // Erro
  ];

  XLSX.writeFile(workbook, `erros_importacao_${Date.now()}.xlsx`);
}
