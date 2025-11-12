import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../drizzle/schema";

const sqlite = new Database("dev.db");
const db = drizzle(sqlite, { schema });

console.log("Creating SQLite database tables...");

// Create users table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openId TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  loginMethod TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  password TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

// Create professores table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS professores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
`);

// Create turmas table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS turmas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  nivel TEXT NOT NULL,
  ano INTEGER NOT NULL,
  professorId INTEGER NOT NULL,
  ativa INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professorId) REFERENCES professores(id)
);
`);

// Create alunos table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ra TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  nivel TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

// Create matriculas table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS matriculas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alunoId INTEGER NOT NULL,
  turmaId INTEGER NOT NULL,
  ativa INTEGER NOT NULL DEFAULT 1,
  dataInicio TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dataFim TEXT,
  FOREIGN KEY (alunoId) REFERENCES alunos(id),
  FOREIGN KEY (turmaId) REFERENCES turmas(id)
);
`);

// Create etapas table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS etapas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turmaId INTEGER NOT NULL,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  pontosMaximos INTEGER NOT NULL,
  FOREIGN KEY (turmaId) REFERENCES turmas(id)
);
`);

// Create atividades table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS atividades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  etapaId INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  data TEXT NOT NULL,
  pontuacaoMaxima INTEGER NOT NULL,
  FOREIGN KEY (etapaId) REFERENCES etapas(id)
);
`);

// Create notas table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  atividadeId INTEGER NOT NULL,
  alunoId INTEGER NOT NULL,
  nota REAL NOT NULL,
  comentario TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (atividadeId) REFERENCES atividades(id),
  FOREIGN KEY (alunoId) REFERENCES alunos(id)
);
`);

// Create feedbacks table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  etapaId INTEGER NOT NULL,
  alunoId INTEGER NOT NULL,
  desempenhoAcademico TEXT,
  frequencia REAL,
  comportamento TEXT,
  observacoesGerais TEXT,
  comentariosConselho TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (etapaId) REFERENCES etapas(id),
  FOREIGN KEY (alunoId) REFERENCES alunos(id)
);
`);

// Create historico_feedbacks table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS historico_feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feedbackId INTEGER NOT NULL,
  autorId INTEGER NOT NULL,
  autorNome TEXT NOT NULL,
  descricaoMudanca TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (feedbackId) REFERENCES feedbacks(id)
);
`);

// Create configuracoes table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS configuracoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT
);
`);

// Create auditoria table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  userName TEXT NOT NULL,
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidadeId INTEGER,
  detalhes TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
`);

// Create questoes_ingles table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS questoes_ingles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  nivel TEXT NOT NULL,
  enunciado TEXT NOT NULL,
  texto TEXT,
  alternativas TEXT,
  respostaCorreta TEXT,
  explicacao TEXT,
  tempoEstimado INTEGER,
  professorId INTEGER NOT NULL,
  ativa INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professorId) REFERENCES professores(id)
);
`);

// Create bancos_questoes table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS bancos_questoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  professorId INTEGER NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professorId) REFERENCES professores(id)
);
`);

// Create banco_questoes_relacao table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS banco_questoes_relacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bancoId INTEGER NOT NULL,
  questaoId INTEGER NOT NULL,
  FOREIGN KEY (bancoId) REFERENCES bancos_questoes(id),
  FOREIGN KEY (questaoId) REFERENCES questoes_ingles(id),
  UNIQUE(bancoId, questaoId)
);
`);

// Create atividades_questoes table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS atividades_questoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  atividadeId INTEGER NOT NULL,
  questaoId INTEGER NOT NULL,
  ordem INTEGER NOT NULL,
  FOREIGN KEY (atividadeId) REFERENCES atividades(id),
  FOREIGN KEY (questaoId) REFERENCES questoes_ingles(id),
  UNIQUE(atividadeId, questaoId)
);
`);

// Create respostas_alunos table
sqlite.exec(`
CREATE TABLE IF NOT EXISTS respostas_alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alunoId INTEGER NOT NULL,
  questaoId INTEGER NOT NULL,
  atividadeId INTEGER,
  respostaSelecionada TEXT,
  respostaTexto TEXT,
  correta INTEGER,
  tempoResposta INTEGER,
  dataResposta TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alunoId) REFERENCES alunos(id),
  FOREIGN KEY (questaoId) REFERENCES questoes_ingles(id),
  FOREIGN KEY (atividadeId) REFERENCES atividades(id)
);
`);

console.log("Database tables created successfully!");

// Create admin user
const adminEmail = "admin@englishsas.com";
const adminName = "Administrador";
const adminPassword = "admin123"; // You should change this

console.log("Creating admin user...");

sqlite.exec(`
INSERT OR IGNORE INTO users (openId, email, name, role, password, loginMethod)
VALUES ('admin_openid', '${adminEmail}', '${adminName}', 'admin', '${adminPassword}', 'local');
`);

// Get admin user ID
const adminUser = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
if (adminUser) {
  sqlite.exec(`
  INSERT OR IGNORE INTO professores (userId, nome, email)
  VALUES (${adminUser.id}, '${adminName}', '${adminEmail}');
  `);
  console.log("Admin user created successfully!");
  console.log("Email:", adminEmail);
  console.log("Password:", adminPassword);
} else {
  console.log("Admin user already exists or failed to create");
}

sqlite.close();
console.log("Database setup completed!");