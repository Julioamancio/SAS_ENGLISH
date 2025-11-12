// Banco de dados mock definitivo para English SAS
export const mockDatabase = {
  users: [
    {
      id: 1,
      openId: 'admin_openid',
      name: 'Administrador',
      email: 'admin@englishsas.com',
      loginMethod: 'local',
      role: 'admin',
      password: '$2b$10$RzSI6dXFsMGwGtp/Y6g6aekCM5xPWLlHcDgWXwwxIBN2LZwGin4SW', // admin123
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      lastSignedIn: '2024-01-01T00:00:00.000Z'
    }
  ],
  professores: [
    {
      id: 1,
      userId: 1,
      nome: 'Administrador',
      email: 'admin@englishsas.com',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ],
  turmas: [],
  alunos: [],
  questoesIngles: [
    {
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
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ]
};

let nextId = 2;

// Funções de banco de dados definitivas
export async function getUserByEmail(email) {
  console.log(`[DB] Buscando usuário por email: ${email}`);
  const user = mockDatabase.users.find(u => u.email === email);
  console.log(`[DB] Usuário encontrado: ${user ? 'SIM' : 'NÃO'}`);
  return user;
}

export async function getUserById(id) {
  console.log(`[DB] Buscando usuário por ID: ${id}`);
  const user = mockDatabase.users.find(u => u.id === id);
  return user;
}

export async function createUser(userData) {
  console.log(`[DB] Criando novo usuário: ${userData.email}`);
  const newUser = {
    id: nextId++,
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString()
  };
  mockDatabase.users.push(newUser);
  console.log(`[DB] Usuário criado com ID: ${newUser.id}`);
  return newUser.id;
}

export async function updateUserLastSignedIn(userId) {
  console.log(`[DB] Atualizando lastSignedIn para usuário: ${userId}`);
  const user = mockDatabase.users.find(u => u.id === userId);
  if (user) {
    user.lastSignedIn = new Date().toISOString();
    console.log(`[DB] lastSignedIn atualizado com sucesso`);
  }
}

export async function createProfessor(professorData) {
  console.log(`[DB] Criando professor: ${professorData.nome}`);
  const newProfessor = {
    id: nextId++,
    ...professorData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockDatabase.professores.push(newProfessor);
  return newProfessor.id;
}