import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads successfully with no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Only ignore known favicon noise
        const t = msg.text();
        if (!t.toLowerCase().includes('favicon')) consoleErrors.push(t);
      }
    });

    const resp = await page.goto('/');
    expect(resp?.status(), 'Home page should return 200').toBe(200);

    await expect(page).toHaveTitle('Security Testing Demo');
    await expect(page.getByRole('heading', { name: 'Security Testing Demo' })).toBeVisible();
    await expect(page.locator('.warning')).toContainText('Educational purposes only');

    // Fail on console errors
    expect(consoleErrors, `Console errors detected:\n${consoleErrors.join('\n')}`).toEqual([]);
  });

  test('shows all vulnerability sections and forms', async ({ page }) => {
    await page.goto('/');

    // Cards (stable headings)
    await expect(page.getByRole('heading', { name: 'SQL Injection' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cross-Site Scripting (XSS)' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Insecure Direct Object Reference' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Broken Authentication' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sensitive Data Exposure' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mass Assignment' })).toBeVisible();

    // Forms/controls by ID (super stable)
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#searchForm')).toBeVisible();
    await expect(page.locator('#idorForm')).toBeVisible();
    await expect(page.locator('#adminForm')).toBeVisible();
    await expect(page.locator('#configBtn')).toBeVisible();
    await expect(page.locator('#registerForm')).toBeVisible();
  });

  test('serves HTML over request API', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status(), 'Expected 200 from GET /').toBe(200);

    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Security Testing Demo</title>');
    expect(html).toContain('Demonstrating OWASP Top 10 Vulnerabilities');
  });
});