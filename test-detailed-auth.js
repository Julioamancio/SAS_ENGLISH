const testDetailedAuth = async () => {
  console.log('Testing detailed authentication...');
  
  // First, let's test if the server is responding
  try {
    console.log('1. Testing server health...');
    const healthResponse = await fetch('http://localhost:3004/api/auth/me');
    console.log('Health check status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health data:', healthData);
  } catch (error) {
    console.error('❌ Server health check failed:', error);
    return;
  }
  
  // Test login with detailed error handling
  try {
    console.log('\n2. Testing admin login...');
    console.log('Email: admin@englishsas.com');
    console.log('Password: admin123');
    
    const loginResponse = await fetch('http://localhost:3004/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@englishsas.com',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    console.log('Login headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const responseText = await loginResponse.text();
    console.log('Raw response:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Login data:', data);
    } catch (e) {
      console.log('Could not parse JSON response');
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
  
  // Test registration
  try {
    console.log('\n3. Testing professor registration...');
    const regResponse = await fetch('http://localhost:3004/api/auth/register', {
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
    
    console.log('Registration status:', regResponse.status);
    const regText = await regResponse.text();
    console.log('Registration raw response:', regText);
    
    try {
      const regData = JSON.parse(regText);
      console.log('Registration data:', regData);
    } catch (e) {
      console.log('Could not parse registration JSON');
    }
    
  } catch (error) {
    console.error('❌ Registration test failed:', error);
  }
};

await testDetailedAuth();