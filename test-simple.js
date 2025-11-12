// Test simples de autenticação
console.log('Testando login admin...');

fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@englishsas.com',
    password: 'admin123'
  })
})
.then(response => response.text())
.then(text => {
  console.log('Resposta do login:', text);
})
.catch(error => {
  console.error('Erro:', error);
});

// Testar registro
setTimeout(() => {
  console.log('\nTestando registro...');
  fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Novo Professor',
      email: 'novo@teste.com',
      password: 'teste123'
    })
  })
  .then(response => response.text())
  .then(text => {
    console.log('Resposta do registro:', text);
  })
  .catch(error => {
    console.error('Erro:', error);
  });
}, 1000);