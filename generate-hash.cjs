const bcrypt = require('bcrypt');

const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.log('Erro:', err);
  } else {
    console.log('Hash completo:', hash);
    console.log('Hash para copiar:', hash.replace(/\$/g, '\\$'));
  }
});