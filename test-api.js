// Simple API test script
const testAPI = async () => {
    const baseURL = 'http://localhost:8000';
    
    try {
        // Test health endpoint
        console.log('Testing health endpoint...');
        const healthResponse = await fetch(`${baseURL}/health`);
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
        
        // Test user registration
        console.log('\nTesting user registration...');
        const registerResponse = await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'customer',
                phone: '+1234567890'
            })
        });
        const registerData = await registerResponse.json();
        console.log('Registration response:', registerData);
        
        // Test user login
        console.log('\nTesting user login...');
        const loginResponse = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};

// Run the test
testAPI();
