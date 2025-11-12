import bcrypt from 'bcrypt';

// Simple mock database for testing
const mockUsers = [
  {
    id: 1,
    openId: 'admin_openid',
    name: 'Administrador',
    email: 'admin@englishsas.com',
    loginMethod: 'local',
    role: 'admin',
    password: '$2b$10$re.OW/E/HOgTNqdrHyeqI.69X7quumi0L.T70gUwHNX9.yfR5dtyYu', // admin123 hashed CORRETAMENTE
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString()
  }
];

export async function getUserByEmail(email: string) {
  console.log("[Simple DB] getUserByEmail called with:", email);
  const user = mockUsers.find(u => u.email === email);
  console.log("[Simple DB] User found:", user ? "Yes" : "No");
  return user;
}

export async function createUser(user: any) {
  console.log("[Simple DB] createUser called with:", user);
  const newUser = {
    id: mockUsers.length + 1,
    ...user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString()
  };
  mockUsers.push(newUser);
  console.log("[Simple DB] New user created with ID:", newUser.id);
  return newUser.id;
}

export async function updateUserLastSignedIn(userId: number) {
  console.log("[Simple DB] updateUserLastSignedIn called for userId:", userId);
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.lastSignedIn = new Date().toISOString();
    console.log("[Simple DB] Updated lastSignedIn for user:", userId);
  }
}