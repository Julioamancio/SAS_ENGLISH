import { eq, and, desc, sql } from "drizzle-orm";

// Mock database implementation for development
// Admin password: admin123 (hashed with bcrypt)
let mockData = {
  users: [{
    id: 1,
    openId: 'admin_openid',
    name: 'Administrador',
    email: 'admin@englishsas.com',
    loginMethod: 'local',
    role: 'admin',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123 hashed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString()
  }],
  professores: [{
    id: 1,
    userId: 1,
    nome: 'Administrador',
    email: 'admin@englishsas.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }],
  turmas: [],
  alunos: [],
  matriculas: [],
  etapas: [],
  atividades: [],
  notas: [],
  feedbacks: [],
  historicoFeedbacks: [],
  configuracoes: [],
  auditoria: [],
  questoesIngles: [{
    id: 1,
    titulo: 'Present Simple - Basic',
    tipo: 'grammar',
    nivel: 'A1',
    enunciado: 'Choose the correct verb form:',
    texto: 'She _____ to school every day.',
    alternativas: '["go", "goes", "going", "went"]',
    respostaCorreta: 'goes',
    explicacao: 'Third person singular adds -s to the verb.',
    tempoEstimado: 30,
    professorId: 1,
    ativa: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }],
  bancosQuestoes: [],
  bancoQuestoesRelacao: [],
  atividadesQuestoes: [],
  respostasAlunos: []
};

let nextId = 2;
import { 
  InsertUser, 
  users, 
  professores, 
  turmas, 
  alunos, 
  matriculas, 
  etapas, 
  atividades, 
  notas, 
  feedbacks, 
  historicoFeedbacks,
  configuracoes,
  auditoria,
  questoesIngles,
  bancosQuestoes,
  bancoQuestoesRelacao,
  atividadesQuestoes,
  respostasAlunos,
  Professor,
  Turma,
  Aluno,
  Matricula,
  Etapa,
  InsertEtapa,
  Atividade,
  Nota,
  Feedback,
  HistoricoFeedback,
  Configuracao,
  Auditoria,
  QuestaoIngles,
  InsertQuestaoIngles,
  BancoQuestoes,
  InsertBancoQuestoes,
  BancoQuestoesRelacao,
  InsertBancoQuestoesRelacao,
  AtividadeQuestoes,
  InsertAtividadeQuestoes,
  RespostaAluno,
  InsertRespostaAluno
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    console.log("[Mock Database] Using mock database for development");
    _db = {
      select: () => ({
        from: (table) => {
          const tableName = table._.name;
          const data = mockData[tableName] || [];
          return {
            where: (condition) => {
              let results = [...data];
              console.log("[Mock DB] Where condition:", condition);
              if (condition && condition.op === 'eq') {
                const [column, value] = condition.args;
                console.log("[Mock DB] Filtering by column:", column, "value:", value);
                console.log("[Mock DB] Available data:", results);
                results = results.filter(row => {
                  console.log("[Mock DB] Checking row:", row, "column value:", row[column]);
                  return row[column] === value;
                });
                console.log("[Mock DB] Filtered results:", results);
              }
              return {
                limit: (n) => {
                  const limited = results.slice(0, n);
                  console.log("[Mock DB] Limited results:", limited);
                  return limited;
                },
                then: async () => {
                  console.log("[Mock DB] Final results:", results);
                  return results;
                }
              };
            },
            leftJoin: (otherTable, condition) => ({ where: () => ({ limit: () => [], then: async () => [] }) }),
            innerJoin: (otherTable, condition) => ({ where: () => ({ then: async () => [] }), orderBy: () => ({ then: async () => [] }) }),
            orderBy: (order) => ({ then: async () => data }),
            then: async () => data
          };
        }
      }),
      insert: (table) => ({
        values: (data) => {
          const tableName = table._.name;
          if (Array.isArray(data)) {
            const results = [];
            for (const item of data) {
              const newItem = { ...item, id: nextId++ };
              mockData[tableName].push(newItem);
              results.push({ insertId: newItem.id });
            }
            return results;
          } else {
            const newItem = { ...data, id: nextId++ };
            mockData[tableName].push(newItem);
            return [{ insertId: newItem.id }];
          }
        }
      }),
      update: (table) => ({
        set: (data) => ({
          where: (condition) => {
            const tableName = table._.name;
            const items = mockData[tableName];
            if (condition && condition.op === 'eq') {
              const [column, value] = condition.args;
              const item = items.find(row => row[column] === value);
              if (item) {
                Object.assign(item, data);
              }
            }
            return Promise.resolve();
          }
        })
      }),
      delete: (table) => ({
        where: (condition) => {
          const tableName = table._.name;
          if (condition && condition.op === 'eq') {
            const [column, value] = condition.args;
            mockData[tableName] = mockData[tableName].filter(row => row[column] !== value);
          }
          return Promise.resolve();
        }
      })
    };
  }
  return _db;
}

// ============ USER MANAGEMENT ============

// Legacy function - no longer used with new auth system
export async function upsertUser(user: InsertUser): Promise<void> {
  return; // Disabled
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || `user_${user.openId}@sas.local`,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      if (field === 'email' && normalized) {
        values[field] = normalized;
        updateSet[field] = normalized;
      } else if (field !== 'email') {
        values[field] = normalized;
        updateSet[field] = normalized;
      }
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Check if user exists
    const existingUser = await db!.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existingUser.length > 0) {
      await db!.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      await db!.insert(users).values(values as any);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  console.log("[DB] getUserByEmail called with:", email);
  const db = await getDb();
  console.log("[DB] Database connection:", db ? "Available" : "Not available");
  if (!db) return undefined;
  
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    console.log("[DB] Query result:", result);
    console.log("[DB] Result length:", result.length);
    const user = result.length > 0 ? result[0] : undefined;
    console.log("[DB] Returning user:", user);
    return user;
  } catch (error) {
    console.error("[DB] Error in getUserByEmail:", error);
    return undefined;
  }
}

export async function createUser(user: {
  email: string;
  name: string | null;
  password?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin" | "professor";
  openId?: string | null;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(users).values({
    email: user.email,
    name: user.name,
    password: user.password || null,
    loginMethod: user.loginMethod || null,
    role: user.role || "professor",
    openId: user.openId || null,
    lastSignedIn: new Date(),
  });

  return Number(result.insertId);
}

export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

// ============ PROFESSORES ============

export async function createProfessor(data: { userId: number; nome: string; email?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(professores).values(data);
  return result.insertId;
}

export async function getProfessorByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(professores).where(eq(professores.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProfessores() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(professores);
}

// ============ TURMAS ============

export async function createTurma(data: { nome: string; nivel: string; ano: number; professorId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(turmas).values({ ...data, ativa: true });
  const turmaId = result.insertId;
  
  // Create default stages (30/35/35)
  await createDefaultEtapas(turmaId);
  
  return turmaId;
}

async function createDefaultEtapas(turmaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const defaultStages = [
    { turmaId, numero: 1, nome: "1ª Etapa", pontosMaximos: 30 },
    { turmaId, numero: 2, nome: "2ª Etapa", pontosMaximos: 35 },
    { turmaId, numero: 3, nome: "3ª Etapa", pontosMaximos: 35 },
  ];
  
  await db.insert(etapas).values(defaultStages);
}

export async function getTurmasByProfessorId(professorId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(turmas).where(eq(turmas.professorId, professorId));
}

export async function getAllTurmas() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(turmas);
}

export async function getTurmaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(turmas).where(eq(turmas.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTurma(id: number, data: Partial<Turma>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(turmas).set(data).where(eq(turmas.id, id));
}

// ============ ALUNOS ============

export async function createAluno(data: { ra: string; nome: string; nivel: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(alunos).values(data);
  return result.insertId;
}

export async function getAlunoByRA(ra: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(alunos).where(eq(alunos.ra, ra)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAlunoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(alunos).where(eq(alunos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAlunos() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(alunos);
}

// ============ MATRÍCULAS ============

export async function createMatricula(data: { alunoId: number; turmaId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(matriculas).values({
    ...data,
    ativa: true,
    dataInicio: new Date(),
  });
  return result.insertId;
}

export async function getMatriculasAtivasByTurmaId(turmaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(matriculas)
    .where(and(eq(matriculas.turmaId, turmaId), eq(matriculas.ativa, true)));
}

export async function getMatriculaAtivaByAlunoId(alunoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(matriculas)
    .where(and(eq(matriculas.alunoId, alunoId), eq(matriculas.ativa, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function encerrarMatricula(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(matriculas).set({
    ativa: false,
    dataFim: new Date(),
  }).where(eq(matriculas.id, id));
}

// ============ ETAPAS ============

export async function getEtapasByTurmaId(turmaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(etapas).where(eq(etapas.turmaId, turmaId));
}

export async function getEtapaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(etapas).where(eq(etapas.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ ATIVIDADES ============

export async function createAtividade(data: { etapaId: number; titulo: string; data: Date; pontuacaoMaxima: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validate stage points limit
  const etapa = await getEtapaById(data.etapaId);
  if (!etapa) throw new Error("Etapa not found");
  
  const currentTotal = await getTotalPontosAlocados(data.etapaId);
  const newTotal = currentTotal + data.pontuacaoMaxima;
  
  if (newTotal > etapa.pontosMaximos) {
    throw new Error(`A soma das pontuações desta etapa ficaria ${newTotal}/${etapa.pontosMaximos} e ultrapassa o limite.`);
  }
  
  const [result] = await db.insert(atividades).values(data);
  return result.insertId;
}

export async function updateAtividade(id: number, data: Partial<Atividade>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // If updating pontuacaoMaxima, validate limit
  if (data.pontuacaoMaxima !== undefined) {
    const atividade = await getAtividadeById(id);
    if (!atividade) throw new Error("Atividade not found");
    
    const etapa = await getEtapaById(atividade.etapaId);
    if (!etapa) throw new Error("Etapa not found");
    
    const currentTotal = await getTotalPontosAlocados(atividade.etapaId);
    const newTotal = currentTotal - atividade.pontuacaoMaxima + data.pontuacaoMaxima;
    
    if (newTotal > etapa.pontosMaximos) {
      throw new Error(`A soma das pontuações desta etapa ficaria ${newTotal}/${etapa.pontosMaximos} e ultrapassa o limite.`);
    }
  }
  
  await db.update(atividades).set(data).where(eq(atividades.id, id));
}

export async function getTotalPontosAlocados(etapaId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({
    total: sql<number>`COALESCE(SUM(${atividades.pontuacaoMaxima}), 0)`
  }).from(atividades).where(eq(atividades.etapaId, etapaId));
  
  return result[0]?.total || 0;
}

export async function getAtividadesByEtapaId(etapaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(atividades).where(eq(atividades.etapaId, etapaId));
}

export async function getAtividadeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(atividades).where(eq(atividades.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteAtividade(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete associated notas first
  await db.delete(notas).where(eq(notas.atividadeId, id));
  await db.delete(atividades).where(eq(atividades.id, id));
}

// ============ NOTAS ============

export async function upsertNota(data: { atividadeId: number; alunoId: number; nota: number; comentario?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validate nota range
  const atividade = await getAtividadeById(data.atividadeId);
  if (!atividade) throw new Error("Atividade not found");
  
  if (data.nota < 0 || data.nota > atividade.pontuacaoMaxima) {
    throw new Error("A nota deve estar entre 0 e a pontuação máxima da atividade.");
  }
  
  const existing = await db.select()
    .from(notas)
    .where(and(eq(notas.atividadeId, data.atividadeId), eq(notas.alunoId, data.alunoId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(notas).set({
      nota: data.nota,
      comentario: data.comentario,
    }).where(eq(notas.id, existing[0].id));
    return existing[0].id;
  } else {
    const [result] = await db.insert(notas).values(data);
    return result.insertId;
  }
}

export async function getNotasByAtividadeId(atividadeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notas).where(eq(notas.atividadeId, atividadeId));
}

export async function getNotasByAlunoId(alunoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: notas.id,
      atividadeId: notas.atividadeId,
      alunoId: notas.alunoId,
      nota: notas.nota,
      comentario: notas.comentario,
      createdAt: notas.createdAt,
      updatedAt: notas.updatedAt,
      etapaNumero: etapas.numero,
    })
    .from(notas)
    .leftJoin(atividades, eq(notas.atividadeId, atividades.id))
    .leftJoin(etapas, eq(atividades.etapaId, etapas.id))
    .where(eq(notas.alunoId, alunoId));
  
  return result;
}

// ============ ENGLISH QUESTIONS SYSTEM ============

export async function getAllQuestoesIngles() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(questoesIngles).where(eq(questoesIngles.ativa, true));
}

export async function getQuestoesInglesByProfessor(professorId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(questoesIngles).where(eq(questoesIngles.professorId, professorId));
}

export async function getQuestoesInglesByTipo(tipo: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(questoesIngles).where(and(eq(questoesIngles.tipo, tipo), eq(questoesIngles.ativa, true)));
}

export async function getQuestoesInglesByNivel(nivel: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(questoesIngles).where(and(eq(questoesIngles.nivel, nivel), eq(questoesIngles.ativa, true)));
}

export async function getQuestaoInglesById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(questoesIngles).where(eq(questoesIngles.id, id)).limit(1);
  return result[0] || null;
}

export async function createQuestaoIngles(data: InsertQuestaoIngles) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(questoesIngles).values(data);
  return Number(result.insertId);
}

export async function updateQuestaoIngles(id: number, data: Partial<QuestaoIngles>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(questoesIngles).set(data).where(eq(questoesIngles.id, id));
}

export async function deleteQuestaoIngles(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(questoesIngles).set({ ativa: false }).where(eq(questoesIngles.id, id));
}

// Question Banks
export async function getAllBancosQuestoes() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bancosQuestoes).where(eq(bancosQuestoes.ativo, true));
}

export async function getBancosQuestoesByProfessor(professorId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bancosQuestoes).where(eq(bancosQuestoes.professorId, professorId));
}

export async function getBancoQuestoesById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(bancosQuestoes).where(eq(bancosQuestoes.id, id)).limit(1);
  return result[0] || null;
}

export async function createBancoQuestoes(data: InsertBancoQuestoes) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bancosQuestoes).values(data);
  return Number(result.insertId);
}

export async function updateBancoQuestoes(id: number, data: Partial<BancoQuestoes>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bancosQuestoes).set(data).where(eq(bancosQuestoes.id, id));
}

export async function addQuestaoToBanco(bancoId: number, questaoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(bancoQuestoesRelacao).values({ bancoId, questaoId });
  } catch (error) {
    // Ignore duplicate entries
  }
}

export async function getQuestoesFromBanco(bancoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: questoesIngles.id,
      titulo: questoesIngles.titulo,
      tipo: questoesIngles.tipo,
      nivel: questoesIngles.nivel,
      enunciado: questoesIngles.enunciado,
      texto: questoesIngles.texto,
      alternativas: questoesIngles.alternativas,
      respostaCorreta: questoesIngles.respostaCorreta,
      explicacao: questoesIngles.explicacao,
      tempoEstimado: questoesIngles.tempoEstimado,
      professorId: questoesIngles.professorId,
      createdAt: questoesIngles.createdAt,
    })
    .from(bancoQuestoesRelacao)
    .innerJoin(questoesIngles, eq(bancoQuestoesRelacao.questaoId, questoesIngles.id))
    .where(eq(bancoQuestoesRelacao.bancoId, bancoId));
  
  return result;
}

// Student Answers
export async function createRespostaAluno(data: InsertRespostaAluno) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(respostasAlunos).values(data);
  return Number(result.insertId);
}

export async function getRespostasByAluno(alunoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: respostasAlunos.id,
      questaoId: respostasAlunos.questaoId,
      respostaSelecionada: respostasAlunos.respostaSelecionada,
      respostaTexto: respostasAlunos.respostaTexto,
      correta: respostasAlunos.correta,
      tempoResposta: respostasAlunos.tempoResposta,
      dataResposta: respostasAlunos.dataResposta,
      questaoTitulo: questoesIngles.titulo,
      questaoTipo: questoesIngles.tipo,
      questaoNivel: questoesIngles.nivel,
    })
    .from(respostasAlunos)
    .innerJoin(questoesIngles, eq(respostasAlunos.questaoId, questoesIngles.id))
    .where(eq(respostasAlunos.alunoId, alunoId))
    .orderBy(desc(respostasAlunos.dataResposta));
}

export async function getRespostasByAtividade(atividadeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      id: respostasAlunos.id,
      alunoId: respostasAlunos.alunoId,
      questaoId: respostasAlunos.questaoId,
      respostaSelecionada: respostasAlunos.respostaSelecionada,
      respostaTexto: respostasAlunos.respostaTexto,
      correta: respostasAlunos.correta,
      tempoResposta: respostasAlunos.tempoResposta,
      dataResposta: respostasAlunos.dataResposta,
      alunoNome: alunos.nome,
      questaoTitulo: questoesIngles.titulo,
      questaoTipo: questoesIngles.tipo,
      questaoNivel: questoesIngles.nivel,
    })
    .from(respostasAlunos)
    .innerJoin(alunos, eq(respostasAlunos.alunoId, alunos.id))
    .innerJoin(questoesIngles, eq(respostasAlunos.questaoId, questoesIngles.id))
    .where(eq(respostasAlunos.atividadeId, atividadeId))
    .orderBy(desc(respostasAlunos.dataResposta));
}

// ============ FEEDBACKS ============

export async function upsertFeedback(data: {
  etapaId: number;
  alunoId: number;
  desempenhoAcademico?: string;
  frequencia?: number;
  comportamento?: "Excelente" | "Ok" | "Inapropriado";
  observacoesGerais?: string;
  comentariosConselho?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Validate frequencia
  if (data.frequencia !== undefined && (data.frequencia < 0 || data.frequencia > 100)) {
    throw new Error("Frequência deve estar entre 0 e 100.");
  }
  
  const existing = await db.select()
    .from(feedbacks)
    .where(and(eq(feedbacks.etapaId, data.etapaId), eq(feedbacks.alunoId, data.alunoId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(feedbacks).set(data).where(eq(feedbacks.id, existing[0].id));
    return existing[0].id;
  } else {
    const [result] = await db.insert(feedbacks).values(data);
    return result.insertId;
  }
}

export async function getFeedbackByEtapaAndAluno(etapaId: number, alunoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(feedbacks)
    .where(and(eq(feedbacks.etapaId, etapaId), eq(feedbacks.alunoId, alunoId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFeedbacksByEtapaId(etapaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(feedbacks).where(eq(feedbacks.etapaId, etapaId));
}

// ============ HISTÓRICO DE FEEDBACKS ============

export async function createHistoricoFeedback(data: {
  feedbackId: number;
  autorId: number;
  autorNome: string;
  descricaoMudanca: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(historicoFeedbacks).values(data);
  return result.insertId;
}

export async function getHistoricoByFeedbackId(feedbackId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(historicoFeedbacks)
    .where(eq(historicoFeedbacks.feedbackId, feedbackId))
    .orderBy(desc(historicoFeedbacks.createdAt));
}

// ============ CONFIGURAÇÕES ============

export async function getConfiguracao(chave: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(configuracoes).where(eq(configuracoes.chave, chave)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setConfiguracao(chave: string, valor: string, descricao?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getConfiguracao(chave);
  
  if (existing) {
    await db.update(configuracoes).set({ valor, descricao }).where(eq(configuracoes.chave, chave));
  } else {
    await db.insert(configuracoes).values({ chave, valor, descricao });
  }
}

// ============ AUDITORIA ============

export async function logAuditoria(data: {
  userId: number;
  userName: string;
  acao: string;
  entidade: string;
  entidadeId?: number;
  detalhes?: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(auditoria).values(data);
  } catch (error) {
    console.error("[Auditoria] Failed to log:", error);
  }
}

export async function getAuditoriaByEntidade(entidade: string, entidadeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(auditoria)
    .where(and(eq(auditoria.entidade, entidade), eq(auditoria.entidadeId, entidadeId)))
    .orderBy(desc(auditoria.createdAt));
}


export async function createEtapa(data: InsertEtapa) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(etapas).values(data);
  return result.insertId;
}

export async function updateEtapa(id: number, data: Partial<Etapa>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(etapas).set(data).where(eq(etapas.id, id));
}

export async function deleteEtapa(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First delete related activities
  await db.delete(atividades).where(eq(atividades.etapaId, id));
  
  // Then delete the stage
  await db.delete(etapas).where(eq(etapas.id, id));
}

export async function deleteTurma(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete related data in order
  const etapasRelacionadas = await db.select().from(etapas).where(eq(etapas.turmaId, id));
  
  for (const etapa of etapasRelacionadas) {
    // Delete activities and their grades
    const atividadesRelacionadas = await db.select().from(atividades).where(eq(atividades.etapaId, etapa.id));
    for (const atividade of atividadesRelacionadas) {
      await db.delete(notas).where(eq(notas.atividadeId, atividade.id));
    }
    await db.delete(atividades).where(eq(atividades.etapaId, etapa.id));
    
    // Delete feedbacks
    await db.delete(historicoFeedbacks).where(eq(historicoFeedbacks.feedbackId, etapa.id));
    await db.delete(feedbacks).where(eq(feedbacks.etapaId, etapa.id));
  }
  
  // Delete stages
  await db.delete(etapas).where(eq(etapas.turmaId, id));
  
  // Delete enrollments
  await db.delete(matriculas).where(eq(matriculas.turmaId, id));
  
  // Finally delete the class
  await db.delete(turmas).where(eq(turmas.id, id));
}

export async function deleteAluno(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete related data
  await db.delete(notas).where(eq(notas.alunoId, id));
  await db.delete(feedbacks).where(eq(feedbacks.alunoId, id));
  await db.delete(matriculas).where(eq(matriculas.alunoId, id));
  
  // Finally delete the student
  await db.delete(alunos).where(eq(alunos.id, id));
}

export async function updateAluno(id: number, data: Partial<Aluno>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(alunos).set(data).where(eq(alunos.id, id));
}

export async function getFeedbacksByAlunoId(alunoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(feedbacks).where(eq(feedbacks.alunoId, alunoId));
}

export async function getMatriculasByAlunoId(alunoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: matriculas.id,
      alunoId: matriculas.alunoId,
      turmaId: matriculas.turmaId,
      dataInicio: matriculas.dataInicio,
      dataFim: matriculas.dataFim,
      ativa: matriculas.ativa,
      turmaNome: turmas.nome,
      turmaNivel: turmas.nivel,
    })
    .from(matriculas)
    .leftJoin(turmas, eq(matriculas.turmaId, turmas.id))
    .where(eq(matriculas.alunoId, alunoId))
    .orderBy(desc(matriculas.dataInicio));
  
  return result;
}
