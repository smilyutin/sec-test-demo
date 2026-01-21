const { test, expect } = require('@playwright/test');

test.describe('/#/ (Sensitive Data Exposure via Config Button)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should expose configuration data', async ({ page }) => {
    await page.click('#configBtn');
    await page.waitForSelector('#configResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#configResult').textContent();
    expect(resultText).toContain('secret_key');
    expect(resultText).toContain('api_keys');
    
    console.log('✓ Configuration data exposed via UI');
  });

  test('should display secret key in config response', async ({ page }) => {
    await page.click('#configBtn');
    await page.waitForSelector('#configResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#configResult').textContent();
    expect(resultText).toContain('super-secret-key');
    
    console.log('✓ Secret key visible in UI response');
  });

  test('should expose API keys in config response', async ({ page }) => {
    await page.click('#configBtn');
    await page.waitForSelector('#configResult.show', { timeout: 5000 });
    
    const resultHTML = await page.locator('#configResult').innerHTML();
    expect(resultHTML).toContain('stripe');
    expect(resultHTML).toContain('aws');
    
    console.log('✓ API keys exposed in UI');
  });

  test('should show debug mode enabled', async ({ page }) => {
    await page.click('#configBtn');
    await page.waitForSelector('#configResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#configResult').textContent();
    expect(resultText).toContain('debug_mode');
    expect(resultText).toContain('true');
    
    console.log('✓ Debug mode status visible in UI');
  });
});
