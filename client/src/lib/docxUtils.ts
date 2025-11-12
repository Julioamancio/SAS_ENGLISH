import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, HeadingLevel, AlignmentType, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

/**
 * Exportar relatório individual de aluno para DOCX
 */
export async function exportarRelatorioAlunoDocx(dados: {
  alunoNome: string;
  alunoRa: string;
  turmaNome: string;
  turmaAno: number;
  etapas: Array<{ nome: string; nota: number; pontosMaximos: number }>;
  mediaGeral: number;
  frequencia: number;
  comportamento: string;
  observacoes?: string;
}) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Cabeçalho
          new Paragraph({
            text: "English SAS - Sistema de Gestão Escolar com Questões de Inglês",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          
          new Paragraph({
            text: "Relatório Individual do Aluno",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Informações do Aluno
          new Paragraph({
            text: "Dados do Aluno",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Nome: ", bold: true }),
              new TextRun(dados.alunoNome),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "RA: ", bold: true }),
              new TextRun(dados.alunoRa),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Turma: ", bold: true }),
              new TextRun(`${dados.turmaNome} (${dados.turmaAno})`),
            ],
            spacing: { after: 300 },
          }),

          // Desempenho por Etapa
          new Paragraph({
            text: "Desempenho por Etapa",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 200 },
          }),

          // Tabela de Notas
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Cabeçalho
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Etapa", bold: true })] })],
                    shading: { fill: "2563EB" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Nota Obtida", bold: true })] })],
                    shading: { fill: "2563EB" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Pontos Máximos", bold: true })] })],
                    shading: { fill: "2563EB" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Percentual", bold: true })] })],
                    shading: { fill: "2563EB" },
                  }),
                ],
              }),
              // Dados
              ...dados.etapas.map(
                (etapa) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(etapa.nome)] }),
                      new TableCell({ children: [new Paragraph(etapa.nota.toFixed(1))] }),
                      new TableCell({ children: [new Paragraph(etapa.pontosMaximos.toString())] }),
                      new TableCell({
                        children: [
                          new Paragraph(
                            `${((etapa.nota / etapa.pontosMaximos) * 100).toFixed(1)}%`
                          ),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),

          // Resumo Geral
          new Paragraph({
            text: "Resumo Geral",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Média Geral: ", bold: true }),
              new TextRun({ text: dados.mediaGeral.toFixed(1), color: "2563EB", bold: true }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Frequência: ", bold: true }),
              new TextRun(`${dados.frequencia}%`),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Comportamento: ", bold: true }),
              new TextRun(dados.comportamento),
            ],
            spacing: { after: 300 },
          }),

          // Observações
          ...(dados.observacoes
            ? [
                new Paragraph({
                  text: "Observações",
                  heading: HeadingLevel.HEADING_3,
                  spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                  text: dados.observacoes,
                  spacing: { after: 200 },
                }),
              ]
            : []),

          // Rodapé
          new Paragraph({
            children: [new TextRun({ text: `Gerado em: ${new Date().toLocaleString("pt-BR")}`, italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `relatorio_${dados.alunoRa}_${Date.now()}.docx`);
}

/**
 * Exportar relatório geral da turma para DOCX
 */
export async function exportarRelatorioTurmaDocx(dados: {
  turmaNome: string;
  turmaNivel: string;
  turmaAno: number;
  totalAlunos: number;
  mediaGeralTurma: number;
  alunos: Array<{
    ra: string;
    nome: string;
    etapa1?: number;
    etapa2?: number;
    etapa3?: number;
    mediaGeral?: number;
    frequencia?: number;
    comportamento?: string;
  }>;
}) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Cabeçalho
          new Paragraph({
            text: "English SAS - Sistema de Gestão Escolar com Questões de Inglês",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Relatório Geral da Turma",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Informações da Turma
          new Paragraph({
            text: "Dados da Turma",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Turma: ", bold: true }),
              new TextRun(`${dados.turmaNome} - ${dados.turmaNivel}`),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Ano: ", bold: true }),
              new TextRun(dados.turmaAno.toString()),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Total de Alunos: ", bold: true }),
              new TextRun(dados.totalAlunos.toString()),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Média Geral da Turma: ", bold: true }),
              new TextRun({ text: dados.mediaGeralTurma.toFixed(1), color: "2563EB", bold: true }),
            ],
            spacing: { after: 300 },
          }),

          // Desempenho Individual
          new Paragraph({
            text: "Desempenho Individual dos Alunos",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 200 },
          }),

          // Tabela de Alunos
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Cabeçalho
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "RA", bold: true })] })], shading: { fill: "2563EB" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nome", bold: true })] })], shading: { fill: "2563EB" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Etapa 1", bold: true })] })], shading: { fill: "2563EB" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Etapa 2", bold: true })] })], shading: { fill: "2563EB" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Etapa 3", bold: true })] })], shading: { fill: "2563EB" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Média", bold: true })] })], shading: { fill: "2563EB" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Freq.", bold: true })] })], shading: { fill: "2563EB" } }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Comport.", bold: true })] })], shading: { fill: "2563EB" } }),
                ],
              }),
              // Dados
              ...dados.alunos.map(
                (aluno) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(aluno.ra)] }),
                      new TableCell({ children: [new Paragraph(aluno.nome)] }),
                      new TableCell({ children: [new Paragraph(aluno.etapa1?.toString() || "-")] }),
                      new TableCell({ children: [new Paragraph(aluno.etapa2?.toString() || "-")] }),
                      new TableCell({ children: [new Paragraph(aluno.etapa3?.toString() || "-")] }),
                      new TableCell({ children: [new Paragraph(aluno.mediaGeral?.toFixed(1) || "-")] }),
                      new TableCell({ children: [new Paragraph(aluno.frequencia ? `${aluno.frequencia}%` : "-")] }),
                      new TableCell({ children: [new Paragraph(aluno.comportamento || "-")] }),
                    ],
                  })
              ),
            ],
          }),

          // Rodapé
          new Paragraph({
            children: [new TextRun({ text: `Gerado em: ${new Date().toLocaleString("pt-BR")}`, italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `relatorio_turma_${dados.turmaNome}_${Date.now()}.docx`);
}
