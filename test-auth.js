const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/auth/login', {
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
    console.log('Login response:', data);
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

const testRegistration = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/auth/register', {
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
    console.log('Registration response:', data);
    console.log('Status:', response.status);
    
    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

console.log('Testing authentication system...');
console.log('Testing admin login...');
await testLogin();
console.log('\nTesting professor registration...');
await testRegistration();