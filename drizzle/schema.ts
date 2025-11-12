import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for admin/professor.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").unique(),
  password: text("password"),
  name: text("name"),
  email: text("email").notNull().unique(),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin", "professor"] }).default("user").notNull(),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
  lastSignedIn: text("lastSignedIn").default('CURRENT_TIMESTAMP').notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Professores - extends user with professor-specific data
 */
export const professores = sqliteTable("professores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  nome: text("nome").notNull(),
  email: text("email"),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Professor = typeof professores.$inferSelect;
export type InsertProfessor = typeof professores.$inferInsert;

/**
 * Turmas - Classes with automatic stage creation (30/35/35)
 */
export const turmas = sqliteTable("turmas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(), // Ex: "MED-1A"
  nivel: text("nivel").notNull(), // Ex: "Intermediário"
  ano: integer("ano").notNull(), // Ex: 2025
  professorId: integer("professorId").notNull(),
  ativa: integer("ativa").default(1).notNull(), // 1 for true, 0 for false
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Turma = typeof turmas.$inferSelect;
export type InsertTurma = typeof turmas.$inferInsert;

/**
 * Alunos - Students
 */
export const alunos = sqliteTable("alunos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ra: text("ra").notNull().unique(), // Registro Acadêmico
  nome: text("nome").notNull(),
  nivel: text("nivel").notNull(),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Aluno = typeof alunos.$inferSelect;
export type InsertAluno = typeof alunos.$inferInsert;

/**
 * Matrículas - Enrollment history (preserves transfers)
 */
export const matriculas = sqliteTable("matriculas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  alunoId: integer("alunoId").notNull(),
  turmaId: integer("turmaId").notNull(),
  ativa: integer("ativa").default(1).notNull(), // 1 for true, 0 for false
  dataInicio: text("dataInicio").default('CURRENT_TIMESTAMP').notNull(),
  dataFim: text("dataFim"),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Matricula = typeof matriculas.$inferSelect;
export type InsertMatricula = typeof matriculas.$inferInsert;

/**
 * Etapas - Stages per class (1ª=30, 2ª=35, 3ª=35 points)
 */
export const etapas = sqliteTable("etapas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  turmaId: integer("turmaId").notNull(),
  numero: integer("numero").notNull(), // 1, 2, or 3
  nome: text("nome").notNull(), // "1ª Etapa", "2ª Etapa", "3ª Etapa"
  pontosMaximos: integer("pontosMaximos").notNull(), // 30, 35, or 35
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Etapa = typeof etapas.$inferSelect;
export type InsertEtapa = typeof etapas.$inferInsert;

/**
 * Atividades - Activities per stage
 */
export const atividades = sqliteTable("atividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  etapaId: integer("etapaId").notNull(),
  titulo: text("titulo").notNull(),
  data: text("data").notNull(),
  pontuacaoMaxima: integer("pontuacaoMaxima").notNull(),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Atividade = typeof atividades.$inferSelect;
export type InsertAtividade = typeof atividades.$inferInsert;

/**
 * Notas - Grades per activity per student
 */
export const notas = sqliteTable("notas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  atividadeId: integer("atividadeId").notNull(),
  alunoId: integer("alunoId").notNull(),
  nota: integer("nota").notNull(), // 0 to pontuacaoMaxima (stored as integer, e.g., 85 = 8.5)
  comentario: text("comentario"),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Nota = typeof notas.$inferSelect;
export type InsertNota = typeof notas.$inferInsert;

/**
 * Feedbacks - Stage feedback per student (5 fields + history)
 */
export const feedbacks = sqliteTable("feedbacks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  etapaId: integer("etapaId").notNull(),
  alunoId: integer("alunoId").notNull(),
  desempenhoAcademico: text("desempenhoAcademico"),
  frequencia: integer("frequencia"), // 0-100 (stored as integer percentage)
  comportamento: text("comportamento", { enum: ["Excelente", "Ok", "Inapropriado"] }),
  observacoesGerais: text("observacoesGerais"),
  comentariosConselho: text("comentariosConselho"),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

/**
 * Histórico de Feedbacks - Audit trail for feedback changes
 */
export const historicoFeedbacks = sqliteTable("historicoFeedbacks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  feedbackId: integer("feedbackId").notNull(),
  autorId: integer("autorId").notNull(), // userId who made the change
  autorNome: text("autorNome").notNull(),
  descricaoMudanca: text("descricaoMudanca").notNull(),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type HistoricoFeedback = typeof historicoFeedbacks.$inferSelect;
export type InsertHistoricoFeedback = typeof historicoFeedbacks.$inferInsert;

/**
 * Configurações - School settings (stage points defaults)
 */
export const configuracoes = sqliteTable("configuracoes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chave: text("chave").notNull().unique(),
  valor: text("valor").notNull(),
  descricao: text("descricao"),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Configuracao = typeof configuracoes.$inferSelect;
export type InsertConfiguracao = typeof configuracoes.$inferInsert;

/**
 * Auditoria - General audit log
 */
export const auditoria = sqliteTable("auditoria", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  userName: text("userName").notNull(),
  acao: text("acao").notNull(),
  entidade: text("entidade").notNull(),
  entidadeId: integer("entidadeId"),
  detalhes: text("detalhes"),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type Auditoria = typeof auditoria.$inferSelect;
export type InsertAuditoria = typeof auditoria.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  professor: one(professores, {
    fields: [users.id],
    references: [professores.userId],
  }),
}));

export const professoresRelations = relations(professores, ({ one, many }) => ({
  user: one(users, {
    fields: [professores.userId],
    references: [users.id],
  }),
  turmas: many(turmas),
}));

export const turmasRelations = relations(turmas, ({ one, many }) => ({
  professor: one(professores, {
    fields: [turmas.professorId],
    references: [professores.id],
  }),
  etapas: many(etapas),
  matriculas: many(matriculas),
}));

export const alunosRelations = relations(alunos, ({ many }) => ({
  matriculas: many(matriculas),
  notas: many(notas),
  feedbacks: many(feedbacks),
}));

export const matriculasRelations = relations(matriculas, ({ one }) => ({
  aluno: one(alunos, {
    fields: [matriculas.alunoId],
    references: [alunos.id],
  }),
  turma: one(turmas, {
    fields: [matriculas.turmaId],
    references: [turmas.id],
  }),
}));

export const etapasRelations = relations(etapas, ({ one, many }) => ({
  turma: one(turmas, {
    fields: [etapas.turmaId],
    references: [turmas.id],
  }),
  atividades: many(atividades),
  feedbacks: many(feedbacks),
}));

export const atividadesRelations = relations(atividades, ({ one, many }) => ({
  etapa: one(etapas, {
    fields: [atividades.etapaId],
    references: [etapas.id],
  }),
  notas: many(notas),
}));

export const notasRelations = relations(notas, ({ one }) => ({
  atividade: one(atividades, {
    fields: [notas.atividadeId],
    references: [atividades.id],
  }),
  aluno: one(alunos, {
    fields: [notas.alunoId],
    references: [alunos.id],
  }),
}));

export const feedbacksRelations = relations(feedbacks, ({ one, many }) => ({
  etapa: one(etapas, {
    fields: [feedbacks.etapaId],
    references: [etapas.id],
  }),
  aluno: one(alunos, {
    fields: [feedbacks.alunoId],
    references: [alunos.id],
  }),
  historico: many(historicoFeedbacks),
}));

export const historicoFeedbacksRelations = relations(historicoFeedbacks, ({ one }) => ({
  feedback: one(feedbacks, {
    fields: [historicoFeedbacks.feedbackId],
    references: [feedbacks.id],
  }),
  autor: one(users, {
    fields: [historicoFeedbacks.autorId],
    references: [users.id],
  }),
}));

/**
 * Questões de Inglês - English Questions
 */
export const questoesIngles = sqliteTable("questoesIngles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titulo: text("titulo").notNull(),
  tipo: text("tipo", { enum: ["Reading", "Listening", "Grammar", "Writing", "Vocabulary"] }).notNull(),
  nivel: text("nivel", { enum: ["A1", "A2", "B1", "B2", "B2+"] }).notNull(),
  enunciado: text("enunciado").notNull(),
  texto: text("texto"), // Texto principal para Reading/Listening
  audioUrl: text("audioUrl"), // Para Listening
  imagemUrl: text("imagemUrl"), // Para questões visuais
  alternativas: text("alternativas").notNull(), // JSON array com as alternativas
  respostaCorreta: integer("respostaCorreta").notNull(), // Índice da resposta correta
  explicacao: text("explicacao"), // Explicação da resposta
  tempoEstimado: integer("tempoEstimado"), // Tempo em minutos
  ativa: integer("ativa").default(1).notNull(), // 1 for true, 0 for false
  tags: text("tags"), // Tags para busca (ex: "present simple", "business")
  professorId: integer("professorId").notNull(), // Professor que criou
  validada: integer("validada").default(0).notNull(), // 1 for true, 0 for false - Validação automática
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type QuestaoIngles = typeof questoesIngles.$inferSelect;
export type InsertQuestaoIngles = typeof questoesIngles.$inferInsert;

/**
 * Banco de Questões - Question Bank for organization
 */
export const bancosQuestoes = sqliteTable("bancosQuestoes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  professorId: integer("professorId").notNull(),
  turmaId: integer("turmaId"), // Opcional: associar a uma turma específica
  ativo: integer("ativo").default(1).notNull(), // 1 for true, 0 for false
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type BancoQuestoes = typeof bancosQuestoes.$inferSelect;
export type InsertBancoQuestoes = typeof bancosQuestoes.$inferInsert;

/**
 * Relação Banco-Questão - Many-to-many relationship
 */
export const bancoQuestoesRelacao = sqliteTable("bancoQuestoesRelacao", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bancoId: integer("bancoId").notNull(),
  questaoId: integer("questaoId").notNull(),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
}, (table) => ({
  unq: unique().on(table.bancoId, table.questaoId),
}));

export type BancoQuestoesRelacao = typeof bancoQuestoesRelacao.$inferSelect;
export type InsertBancoQuestoesRelacao = typeof bancoQuestoesRelacao.$inferInsert;

/**
 * Atividades de Questões - Question Activities
 */
export const atividadesQuestoes = sqliteTable("atividadesQuestoes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  atividadeId: integer("atividadeId").notNull(), // Relaciona com atividades existentes
  bancoId: integer("bancoId").notNull(), // Banco de questões usado
  tipoSelecao: text("tipoSelecao", { enum: ["aleatorio", "sequencial", "personalizado"] }).default("aleatorio").notNull(),
  quantidadeQuestoes: integer("quantidadeQuestoes").notNull(),
  configuracoes: text("configuracoes"), // JSON com configurações adicionais
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text("updatedAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type AtividadeQuestoes = typeof atividadesQuestoes.$inferSelect;
export type InsertAtividadeQuestoes = typeof atividadesQuestoes.$inferInsert;

/**
 * Respostas dos Alunos - Student Answers
 */
export const respostasAlunos = sqliteTable("respostasAlunos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  alunoId: integer("alunoId").notNull(),
  questaoId: integer("questaoId").notNull(),
  atividadeId: integer("atividadeId").notNull(),
  respostaSelecionada: integer("respostaSelecionada"), // Índice da alternativa escolhida
  respostaTexto: text("respostaTexto"), // Para questões dissertativas (Writing)
  correta: integer("correta"), // 1 for true, 0 for false
  tempoResposta: integer("tempoResposta"), // Tempo em segundos
  dataResposta: text("dataResposta").default('CURRENT_TIMESTAMP').notNull(),
  createdAt: text("createdAt").default('CURRENT_TIMESTAMP').notNull(),
});

export type RespostaAluno = typeof respostasAlunos.$inferSelect;
export type InsertRespostaAluno = typeof respostasAlunos.$inferInsert;

// English Questions Relations - Moved to end to avoid reference errors
export const questoesInglesRelations = relations(questoesIngles, ({ one, many }) => ({
  professor: one(professores, {
    fields: [questoesIngles.professorId],
    references: [professores.id],
  }),
  bancos: many(bancoQuestoesRelacao),
  respostas: many(respostasAlunos),
}));

export const bancosQuestoesRelations = relations(bancosQuestoes, ({ one, many }) => ({
  professor: one(professores, {
    fields: [bancosQuestoes.professorId],
    references: [professores.id],
  }),
  turma: one(turmas, {
    fields: [bancosQuestoes.turmaId],
    references: [turmas.id],
  }),
  questoes: many(bancoQuestoesRelacao),
  atividades: many(atividadesQuestoes),
}));

export const bancoQuestoesRelacaoRelations = relations(bancoQuestoesRelacao, ({ one }) => ({
  banco: one(bancosQuestoes, {
    fields: [bancoQuestoesRelacao.bancoId],
    references: [bancosQuestoes.id],
  }),
  questao: one(questoesIngles, {
    fields: [bancoQuestoesRelacao.questaoId],
    references: [questoesIngles.id],
  }),
}));

export const atividadesQuestoesRelations = relations(atividadesQuestoes, ({ one, many }) => ({
  atividade: one(atividades, {
    fields: [atividadesQuestoes.atividadeId],
    references: [atividades.id],
  }),
  banco: one(bancosQuestoes, {
    fields: [atividadesQuestoes.bancoId],
    references: [bancosQuestoes.id],
  }),
  respostas: many(respostasAlunos),
}));

export const respostasAlunosRelations = relations(respostasAlunos, ({ one }) => ({
  aluno: one(alunos, {
    fields: [respostasAlunos.alunoId],
    references: [alunos.id],
  }),
  questao: one(questoesIngles, {
    fields: [respostasAlunos.questaoId],
    references: [questoesIngles.id],
  }),
  atividade: one(atividadesQuestoes, {
    fields: [respostasAlunos.atividadeId],
    references: [atividadesQuestoes.id],
  }),
}));
