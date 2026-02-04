import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('Home Page', () => {
  test('loads successfully with no console errors', async ({ homePage }) => {
    const consoleErrors = await homePage.checkConsoleErrors();
    
    await homePage.goto();
    await homePage.validatePageStructure();

    // Fail on console errors
    expect(consoleErrors, `Console errors detected:\n${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('shows all vulnerability sections and forms', async ({ homePage }) => {
    await homePage.validatePageStructure();
  });

  test('serves HTML over request API', async ({ page }) => {
    const response = await page.request.get('/');
    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Security Testing Demo</title>');
  });

  test('page loads within acceptable time', async ({ homePage, page }) => {
    const startTime = Date.now();
    
    await homePage.goto();
    await homePage.waitForPageLoad();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    
    console.log(`Page loaded in ${loadTime}ms`);
    const html = await page.content();
    expect(html).toContain('Educational Vulnerability Testing Platform');
  });

});

