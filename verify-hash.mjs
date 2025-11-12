import bcrypt from 'bcrypt';

// Verificar se o hash está correto
const hash = '$2b$10$rsAcdBQT.aGNofr1YqXnXOeZxZ7P1l8XyH5sNhYr9QjCwZo1RzlqO9jYcO2W';
const password = 'admin123';

async function verify() {
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash válido para admin123?', isValid);
  
  // Gerar novo hash se necessário
  if (!isValid) {
    const newHash = await bcrypt.hash(password, 10);
    console.log('Novo hash necessário:', newHash);
  }
}

verify();