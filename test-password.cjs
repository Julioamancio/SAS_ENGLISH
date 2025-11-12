const bcrypt = require('bcrypt');

const hash = '$2b$10$re.OW/E/HOgTNqdrHyeqI.69X7quumi0L.T70gUwHNX9.yfR5dtyYu';
const password = 'admin123';

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.log('Erro:', err);
  } else {
    console.log('Senha válida:', result);
  }
});