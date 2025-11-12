// Testar login do admin
testAdminLogin();

async function testAdminLogin() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@englishsas.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('Resposta do login:', data);
    
    if (data.success) {
      console.log('✅ LOGIN ADMIN FUNCIONANDO!');
      console.log('Usuário:', data.user);
    } else {
      console.log('❌ Login falhou:', data.error);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}

// Testar registro de professor
testProfessorRegister();

async function testProfessorRegister() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Professor Teste',
        email: 'professor@teste.com',
        password: 'teste123'
      })
    });

    const data = await response.json();
    console.log('Resposta do registro:', data);
    
    if (data.success) {
      console.log('✅ REGISTRO DE PROFESSOR FUNCIONANDO!');
      console.log('Usuário criado:', data.user);
    } else {
      console.log('❌ Registro falhou:', data.error);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}