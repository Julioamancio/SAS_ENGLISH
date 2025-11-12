import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a administradores",
    });
  }
  return next({ ctx });
});

// Professor or Admin procedure
const professorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "professor") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito a professores e administradores",
    });
  }
  return next({ ctx });
});

// Middleware para verificar se é admin ou professor responsável pela turma
const canEditTurma = async (userId: number, turmaId: number): Promise<boolean> => {
  const user = await db.getUserById(userId);
  if (!user) return false;
  if (user.role === "admin") return true;
  
  // Verificar se é professor responsável pela turma
  const turma = await db.getTurmaById(turmaId);
  if (!turma) return false;
  
  const professor = await db.getProfessorByUserId(userId);
  if (!professor) return false;
  
  return turma.professorId === professor.id;
};



export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Professores
  professores: router({
    getAll: adminProcedure.query(async () => {
      return await db.getAllProfessores();
    }),
    
    getByUserId: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProfessorByUserId(input.userId);
      }),
    
    create: adminProcedure
      .input(z.object({
        userId: z.number(),
        nome: z.string(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createProfessor(input);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "criar_professor",
          entidade: "professores",
          entidadeId: id,
          detalhes: JSON.stringify(input),
        });
        return { id };
      }),
  }),

  // Turmas
  turmas: router({
    getAll: professorProcedure.query(async ({ ctx }) => {
      // Admin sees all, professor sees only their classes
      if (ctx.user.role === "admin") {
        return await db.getAllTurmas();
      } else {
        const professor = await db.getProfessorByUserId(ctx.user.id);
        if (!professor) return [];
        return await db.getTurmasByProfessorId(professor.id);
      }
    }),
    
    getById: professorProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const turma = await db.getTurmaById(input.id);
        if (!turma) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Turma não encontrada" });
        }
        
        // Check permission
        if (ctx.user.role === "professor") {
          const professor = await db.getProfessorByUserId(ctx.user.id);
          if (!professor || turma.professorId !== professor.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
          }
        }
        
        return turma;
      }),
    
    create: adminProcedure
      .input(z.object({
        nome: z.string(),
        nivel: z.string(),
        ano: z.number(),
        professorId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createTurma(input);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "criar_turma",
          entidade: "turmas",
          entidadeId: id,
          detalhes: JSON.stringify(input),
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        nivel: z.string().optional(),
        ano: z.number().optional(),
        professorId: z.number().optional(),
        ativa: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updateTurma(id, data);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "atualizar_turma",
          entidade: "turmas",
          entidadeId: id,
          detalhes: JSON.stringify(data),
        });
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteTurma(input.id);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "deletar_turma",
          entidade: "turmas",
          entidadeId: input.id,
          detalhes: "",
        });
        return { success: true };
      }),
  }),

  // Alunos
  alunos: router({
    getAll: professorProcedure.query(async () => {
      return await db.getAllAlunos();
    }),
    
    getById: professorProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAlunoById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        ra: z.string(),
        nome: z.string(),
        nivel: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createAluno(input);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "criar_aluno",
          entidade: "alunos",
          entidadeId: id,
          detalhes: JSON.stringify(input),
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        ra: z.string().optional(),
        nome: z.string().optional(),
        nivel: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updateAluno(id, data);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "atualizar_aluno",
          entidade: "alunos",
          entidadeId: id,
          detalhes: JSON.stringify(data),
        });
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteAluno(input.id);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "deletar_aluno",
          entidade: "alunos",
          entidadeId: input.id,
          detalhes: "",
        });
        return { success: true };
      }),
  }),

  // Matrículas
  matriculas: router({
    getByTurma: professorProcedure
      .input(z.object({ turmaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMatriculasAtivasByTurmaId(input.turmaId);
      }),
    
    getByAluno: professorProcedure
      .input(z.object({ alunoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMatriculasByAlunoId(input.alunoId);
      }),
    
    create: adminProcedure
      .input(z.object({
        alunoId: z.number(),
        turmaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createMatricula(input);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "criar_matricula",
          entidade: "matriculas",
          entidadeId: id,
          detalhes: JSON.stringify(input),
        });
        return { id };
      }),
    
    transferir: adminProcedure
      .input(z.object({
        alunoId: z.number(),
        novaTurmaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get current enrollment
        const matriculaAtual = await db.getMatriculaAtivaByAlunoId(input.alunoId);
        if (!matriculaAtual) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Matrícula ativa não encontrada" });
        }
        
        // End current enrollment
        await db.encerrarMatricula(matriculaAtual.id);
        
        // Create new enrollment
        const novaMatriculaId = await db.createMatricula({
          alunoId: input.alunoId,
          turmaId: input.novaTurmaId,
        });
        
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "transferir_aluno",
          entidade: "matriculas",
          entidadeId: novaMatriculaId,
          detalhes: JSON.stringify({
            alunoId: input.alunoId,
            turmaAnterior: matriculaAtual.turmaId,
            novaTurma: input.novaTurmaId,
          }),
        });
        
        return { 
          success: true, 
          message: "Histórico preservado e matrícula anterior encerrada." 
        };
      }),
  }),

  // Etapas
  etapas: router({
    getByTurma: professorProcedure
      .input(z.object({ turmaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEtapasByTurmaId(input.turmaId);
      }),
    
    getById: professorProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEtapaById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        turmaId: z.number(),
        numero: z.number(),
        nome: z.string(),
        pontosMaximos: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createEtapa(input);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "criar_etapa",
          entidade: "etapas",
          entidadeId: id,
          detalhes: JSON.stringify(input),
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        pontosMaximos: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updateEtapa(id, data);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "atualizar_etapa",
          entidade: "etapas",
          entidadeId: id,
          detalhes: JSON.stringify(data),
        });
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteEtapa(input.id);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "deletar_etapa",
          entidade: "etapas",
          entidadeId: input.id,
          detalhes: "",
        });
        return { success: true };
      }),
  }),

  // Atividades
  atividades: router({
    getByEtapa: professorProcedure
      .input(z.object({ etapaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAtividadesByEtapaId(input.etapaId);
      }),
    
    getById: professorProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAtividadeById(input.id);
      }),
    
    create: professorProcedure
      .input(z.object({
        etapaId: z.number(),
        titulo: z.string(),
        data: z.date(),
        pontuacaoMaxima: z.number().min(0),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const id = await db.createAtividade(input);
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "criar_atividade",
            entidade: "atividades",
            entidadeId: id,
            detalhes: JSON.stringify(input),
          });
          return { id };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    update: professorProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        data: z.date().optional(),
        pontuacaoMaxima: z.number().min(0).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { id, ...data } = input;
          await db.updateAtividade(id, data);
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "atualizar_atividade",
            entidade: "atividades",
            entidadeId: id,
            detalhes: JSON.stringify(data),
          });
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    delete: professorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteAtividade(input.id);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "excluir_atividade",
          entidade: "atividades",
          entidadeId: input.id,
        });
        return { success: true };
      }),
    
    getTotalPontosAlocados: professorProcedure
      .input(z.object({ etapaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTotalPontosAlocados(input.etapaId);
      }),
  }),

  // Notas
  notas: router({
    getByAtividade: professorProcedure
      .input(z.object({ atividadeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotasByAtividadeId(input.atividadeId);
      }),
    
    getByAluno: professorProcedure
      .input(z.object({ alunoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotasByAlunoId(input.alunoId);
      }),
    
    upsert: professorProcedure
      .input(z.object({
        atividadeId: z.number(),
        alunoId: z.number(),
        nota: z.number().min(0),
        comentario: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const id = await db.upsertNota(input);
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "lancar_nota",
            entidade: "notas",
            entidadeId: id,
            detalhes: JSON.stringify(input),
          });
          return { id };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    upsertBatch: professorProcedure
      .input(z.object({
        atividadeId: z.number(),
        notas: z.array(z.object({
          alunoId: z.number(),
          nota: z.number().min(0),
          comentario: z.string().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const results = [];
        for (const nota of input.notas) {
          try {
            const id = await db.upsertNota({
              atividadeId: input.atividadeId,
              ...nota,
            });
            results.push({ alunoId: nota.alunoId, success: true, id });
          } catch (error: any) {
            results.push({ alunoId: nota.alunoId, success: false, error: error.message });
          }
        }
        
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "lancamento_massa",
          entidade: "notas",
          detalhes: JSON.stringify({ atividadeId: input.atividadeId, count: input.notas.length }),
        });
        
        return { results };
      }),
  }),

  // Feedbacks
  feedbacks: router({
    getByEtapaAndAluno: professorProcedure
      .input(z.object({
        etapaId: z.number(),
        alunoId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getFeedbackByEtapaAndAluno(input.etapaId, input.alunoId);
      }),
    
    getByEtapa: professorProcedure
      .input(z.object({ etapaId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFeedbacksByEtapaId(input.etapaId);
      }),
    
    getByAluno: professorProcedure
      .input(z.object({ alunoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getFeedbacksByAlunoId(input.alunoId);
      }),
    
    upsert: professorProcedure
      .input(z.object({
        etapaId: z.number(),
        alunoId: z.number(),
        desempenhoAcademico: z.string().optional(),
        frequencia: z.number().min(0).max(100).optional(),
        comportamento: z.enum(["Excelente", "Ok", "Inapropriado"]).optional(),
        observacoesGerais: z.string().optional(),
        comentariosConselho: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const feedbackId = await db.upsertFeedback(input);
          
          // Create history entry
          const changes = [];
          if (input.desempenhoAcademico) changes.push("Desempenho Acadêmico");
          if (input.frequencia !== undefined) changes.push("Frequência");
          if (input.comportamento) changes.push("Comportamento");
          if (input.observacoesGerais) changes.push("Observações Gerais");
          if (input.comentariosConselho) changes.push("Comentários do Conselho");
          
          await db.createHistoricoFeedback({
            feedbackId,
            autorId: ctx.user.id,
            autorNome: ctx.user.name || "Sistema",
            descricaoMudanca: `Alteração em: ${changes.join(", ")}`,
          });
          
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "atualizar_feedback",
            entidade: "feedbacks",
            entidadeId: feedbackId,
            detalhes: JSON.stringify(input),
          });
          
          return { id: feedbackId };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    getHistorico: professorProcedure
      .input(z.object({ feedbackId: z.number() }))
      .query(async ({ input }) => {
        return await db.getHistoricoByFeedbackId(input.feedbackId);
      }),
  }),

  // Configurações
  configuracoes: router({
    get: adminProcedure
      .input(z.object({ chave: z.string() }))
      .query(async ({ input }) => {
        return await db.getConfiguracao(input.chave);
      }),
    
    set: adminProcedure
      .input(z.object({
        chave: z.string(),
        valor: z.string(),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.setConfiguracao(input.chave, input.valor, input.descricao);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "atualizar_configuracao",
          entidade: "configuracoes",
          detalhes: JSON.stringify(input),
        });
        return { success: true };
      }),
  }),

  // Questões de Inglês
  questoesIngles: router({
    getAll: professorProcedure.query(async () => {
      return await db.getAllQuestoesIngles();
    }),
    
    getByProfessor: professorProcedure
      .input(z.object({ professorId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestoesInglesByProfessor(input.professorId);
      }),
    
    getByTipo: professorProcedure
      .input(z.object({ tipo: z.string() }))
      .query(async ({ input }) => {
        return await db.getQuestoesInglesByTipo(input.tipo);
      }),
    
    getByNivel: professorProcedure
      .input(z.object({ nivel: z.string() }))
      .query(async ({ input }) => {
        return await db.getQuestoesInglesByNivel(input.nivel);
      }),
    
    getById: professorProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestaoInglesById(input.id);
      }),
    
    create: professorProcedure
      .input(z.object({
        titulo: z.string(),
        tipo: z.enum(["Reading", "Listening", "Grammar", "Writing", "Vocabulary"]),
        nivel: z.enum(["A1", "A2", "B1", "B2", "B2+"]),
        enunciado: z.string(),
        texto: z.string().optional(),
        audioUrl: z.string().optional(),
        imagemUrl: z.string().optional(),
        alternativas: z.string(), // JSON array
        respostaCorreta: z.number().min(0),
        explicacao: z.string().optional(),
        tempoEstimado: z.number().optional(),
        tags: z.string().optional(),
        professorId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const id = await db.createQuestaoIngles(input);
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "criar_questao_ingles",
            entidade: "questoesIngles",
            entidadeId: id,
            detalhes: JSON.stringify(input),
          });
          return { id };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    update: professorProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        tipo: z.enum(["Reading", "Listening", "Grammar", "Writing", "Vocabulary"]).optional(),
        nivel: z.enum(["A1", "A2", "B1", "B2", "B2+"]).optional(),
        enunciado: z.string().optional(),
        texto: z.string().optional(),
        audioUrl: z.string().optional(),
        imagemUrl: z.string().optional(),
        alternativas: z.string().optional(),
        respostaCorreta: z.number().min(0).optional(),
        explicacao: z.string().optional(),
        tempoEstimado: z.number().optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { id, ...data } = input;
          await db.updateQuestaoIngles(id, data);
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "atualizar_questao_ingles",
            entidade: "questoesIngles",
            entidadeId: id,
            detalhes: JSON.stringify(data),
          });
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    delete: professorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteQuestaoIngles(input.id);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "excluir_questao_ingles",
          entidade: "questoesIngles",
          entidadeId: input.id,
          detalhes: "",
        });
        return { success: true };
      }),
  }),

  // Bancos de Questões
  bancosQuestoes: router({
    getAll: professorProcedure.query(async () => {
      return await db.getAllBancosQuestoes();
    }),
    
    getByProfessor: professorProcedure
      .input(z.object({ professorId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBancosQuestoesByProfessor(input.professorId);
      }),
    
    getById: professorProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBancoQuestoesById(input.id);
      }),
    
    create: professorProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        professorId: z.number(),
        turmaId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const id = await db.createBancoQuestoes(input);
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "criar_banco_questoes",
            entidade: "bancosQuestoes",
            entidadeId: id,
            detalhes: JSON.stringify(input),
          });
          return { id };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    update: professorProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        turmaId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { id, ...data } = input;
          await db.updateBancoQuestoes(id, data);
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "atualizar_banco_questoes",
            entidade: "bancosQuestoes",
            entidadeId: id,
            detalhes: JSON.stringify(data),
          });
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    addQuestao: professorProcedure
      .input(z.object({
        bancoId: z.number(),
        questaoId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addQuestaoToBanco(input.bancoId, input.questaoId);
        await db.logAuditoria({
          userId: ctx.user.id,
          userName: ctx.user.name || "Sistema",
          acao: "adicionar_questao_banco",
          entidade: "bancoQuestoesRelacao",
          detalhes: JSON.stringify(input),
        });
        return { success: true };
      }),
    
    getQuestoes: professorProcedure
      .input(z.object({ bancoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQuestoesFromBanco(input.bancoId);
      }),
  }),

  // Respostas dos Alunos
  respostasAlunos: router({
    create: protectedProcedure
      .input(z.object({
        alunoId: z.number(),
        questaoId: z.number(),
        atividadeId: z.number(),
        respostaSelecionada: z.number().optional(),
        respostaTexto: z.string().optional(),
        correta: z.boolean(),
        tempoResposta: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const id = await db.createRespostaAluno(input);
          await db.logAuditoria({
            userId: ctx.user.id,
            userName: ctx.user.name || "Sistema",
            acao: "criar_resposta_aluno",
            entidade: "respostasAlunos",
            entidadeId: id,
            detalhes: JSON.stringify(input),
          });
          return { id };
        } catch (error: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
      }),
    
    getByAluno: protectedProcedure
      .input(z.object({ alunoId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRespostasByAluno(input.alunoId);
      }),
    
    getByAtividade: professorProcedure
      .input(z.object({ atividadeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRespostasByAtividade(input.atividadeId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
