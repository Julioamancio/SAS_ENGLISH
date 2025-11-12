-- Create SQLite database tables for English SAS

-- Users table
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

-- Professores table
CREATE TABLE IF NOT EXISTS professores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Turmas table
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

-- Alunos table
CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ra TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  nivel TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Matriculas table
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

-- Etapas table
CREATE TABLE IF NOT EXISTS etapas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turmaId INTEGER NOT NULL,
  numero INTEGER NOT NULL,
  nome TEXT NOT NULL,
  pontosMaximos INTEGER NOT NULL,
  FOREIGN KEY (turmaId) REFERENCES turmas(id)
);

-- Atividades table
CREATE TABLE IF NOT EXISTS atividades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  etapaId INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  data TEXT NOT NULL,
  pontuacaoMaxima INTEGER NOT NULL,
  FOREIGN KEY (etapaId) REFERENCES etapas(id)
);

-- Notas table
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

-- Feedbacks table
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

-- Historico_feedbacks table
CREATE TABLE IF NOT EXISTS historico_feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feedbackId INTEGER NOT NULL,
  autorId INTEGER NOT NULL,
  autorNome TEXT NOT NULL,
  descricaoMudanca TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (feedbackId) REFERENCES feedbacks(id)
);

-- Configuracoes table
CREATE TABLE IF NOT EXISTS configuracoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT
);

-- Auditoria table
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

-- Questoes_ingles table
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

-- Bancos_questoes table
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

-- Banco_questoes_relacao table
CREATE TABLE IF NOT EXISTS banco_questoes_relacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bancoId INTEGER NOT NULL,
  questaoId INTEGER NOT NULL,
  FOREIGN KEY (bancoId) REFERENCES bancos_questoes(id),
  FOREIGN KEY (questaoId) REFERENCES questoes_ingles(id),
  UNIQUE(bancoId, questaoId)
);

-- Atividades_questoes table
CREATE TABLE IF NOT EXISTS atividades_questoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  atividadeId INTEGER NOT NULL,
  questaoId INTEGER NOT NULL,
  ordem INTEGER NOT NULL,
  FOREIGN KEY (atividadeId) REFERENCES atividades(id),
  FOREIGN KEY (questaoId) REFERENCES questoes_ingles(id),
  UNIQUE(atividadeId, questaoId)
);

-- Respostas_alunos table
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

-- Insert admin user
INSERT OR IGNORE INTO users (openId, email, name, role, password, loginMethod)
VALUES ('admin_openid', 'admin@englishsas.com', 'Administrador', 'admin', 'admin123', 'local');

-- Insert admin professor
INSERT OR IGNORE INTO professores (userId, nome, email)
SELECT id, 'Administrador', 'admin@englishsas.com' FROM users WHERE email = 'admin@englishsas.com';

-- Create some sample English questions
INSERT OR IGNORE INTO questoes_ingles (titulo, tipo, nivel, enunciado, texto, alternativas, respostaCorreta, explicacao, tempoEstimado, professorId)
VALUES 
('Present Simple - Basic', 'grammar', 'A1', 'Choose the correct verb form:', 'She _____ to school every day.', '["go", "goes", "going", "went"]', 'goes', 'Third person singular adds -s to the verb.', 30, 1),
('Reading Comprehension - Daily Routine', 'reading', 'A2', 'What time does John wake up?', 'John wakes up at 7:00 AM every morning. He takes a shower, eats breakfast, and leaves for work at 8:00 AM.', '["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"]', '7:00 AM', 'The text states "John wakes up at 7:00 AM".', 45, 1),
('Vocabulary - Family Members', 'vocabulary', 'A1', 'What do you call your father''s brother?', '', '["Cousin", "Uncle", "Nephew", "Grandfather"]', 'Uncle', 'Your father''s brother is your uncle.', 20, 1);