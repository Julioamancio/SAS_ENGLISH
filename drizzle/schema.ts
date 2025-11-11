import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for admin/professor.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  password: varchar("password", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "professor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Professores - extends user with professor-specific data
 */
export const professores = mysqlTable("professores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Professor = typeof professores.$inferSelect;
export type InsertProfessor = typeof professores.$inferInsert;

/**
 * Turmas - Classes with automatic stage creation (30/35/35)
 */
export const turmas = mysqlTable("turmas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(), // Ex: "MED-1A"
  nivel: varchar("nivel", { length: 100 }).notNull(), // Ex: "Intermediário"
  ano: int("ano").notNull(), // Ex: 2025
  professorId: int("professorId").notNull(),
  ativa: boolean("ativa").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Turma = typeof turmas.$inferSelect;
export type InsertTurma = typeof turmas.$inferInsert;

/**
 * Alunos - Students
 */
export const alunos = mysqlTable("alunos", {
  id: int("id").autoincrement().primaryKey(),
  ra: varchar("ra", { length: 50 }).notNull().unique(), // Registro Acadêmico
  nome: varchar("nome", { length: 255 }).notNull(),
  nivel: varchar("nivel", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aluno = typeof alunos.$inferSelect;
export type InsertAluno = typeof alunos.$inferInsert;

/**
 * Matrículas - Enrollment history (preserves transfers)
 */
export const matriculas = mysqlTable("matriculas", {
  id: int("id").autoincrement().primaryKey(),
  alunoId: int("alunoId").notNull(),
  turmaId: int("turmaId").notNull(),
  ativa: boolean("ativa").default(true).notNull(),
  dataInicio: timestamp("dataInicio").defaultNow().notNull(),
  dataFim: timestamp("dataFim"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Matricula = typeof matriculas.$inferSelect;
export type InsertMatricula = typeof matriculas.$inferInsert;

/**
 * Etapas - Stages per class (1ª=30, 2ª=35, 3ª=35 points)
 */
export const etapas = mysqlTable("etapas", {
  id: int("id").autoincrement().primaryKey(),
  turmaId: int("turmaId").notNull(),
  numero: int("numero").notNull(), // 1, 2, or 3
  nome: varchar("nome", { length: 100 }).notNull(), // "1ª Etapa", "2ª Etapa", "3ª Etapa"
  pontosMaximos: int("pontosMaximos").notNull(), // 30, 35, or 35
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Etapa = typeof etapas.$inferSelect;
export type InsertEtapa = typeof etapas.$inferInsert;

/**
 * Atividades - Activities per stage
 */
export const atividades = mysqlTable("atividades", {
  id: int("id").autoincrement().primaryKey(),
  etapaId: int("etapaId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  data: timestamp("data").notNull(),
  pontuacaoMaxima: int("pontuacaoMaxima").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Atividade = typeof atividades.$inferSelect;
export type InsertAtividade = typeof atividades.$inferInsert;

/**
 * Notas - Grades per activity per student
 */
export const notas = mysqlTable("notas", {
  id: int("id").autoincrement().primaryKey(),
  atividadeId: int("atividadeId").notNull(),
  alunoId: int("alunoId").notNull(),
  nota: int("nota").notNull(), // 0 to pontuacaoMaxima (stored as integer, e.g., 85 = 8.5)
  comentario: text("comentario"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Nota = typeof notas.$inferSelect;
export type InsertNota = typeof notas.$inferInsert;

/**
 * Feedbacks - Stage feedback per student (5 fields + history)
 */
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  etapaId: int("etapaId").notNull(),
  alunoId: int("alunoId").notNull(),
  desempenhoAcademico: text("desempenhoAcademico"),
  frequencia: int("frequencia"), // 0-100 (stored as integer percentage)
  comportamento: mysqlEnum("comportamento", ["Excelente", "Ok", "Inapropriado"]),
  observacoesGerais: text("observacoesGerais"),
  comentariosConselho: text("comentariosConselho"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

/**
 * Histórico de Feedbacks - Audit trail for feedback changes
 */
export const historicoFeedbacks = mysqlTable("historicoFeedbacks", {
  id: int("id").autoincrement().primaryKey(),
  feedbackId: int("feedbackId").notNull(),
  autorId: int("autorId").notNull(), // userId who made the change
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  descricaoMudanca: text("descricaoMudanca").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoFeedback = typeof historicoFeedbacks.$inferSelect;
export type InsertHistoricoFeedback = typeof historicoFeedbacks.$inferInsert;

/**
 * Configurações - School settings (stage points defaults)
 */
export const configuracoes = mysqlTable("configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  chave: varchar("chave", { length: 100 }).notNull().unique(),
  valor: text("valor").notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Configuracao = typeof configuracoes.$inferSelect;
export type InsertConfiguracao = typeof configuracoes.$inferInsert;

/**
 * Auditoria - General audit log
 */
export const auditoria = mysqlTable("auditoria", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  acao: varchar("acao", { length: 255 }).notNull(),
  entidade: varchar("entidade", { length: 100 }).notNull(),
  entidadeId: int("entidadeId"),
  detalhes: text("detalhes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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
