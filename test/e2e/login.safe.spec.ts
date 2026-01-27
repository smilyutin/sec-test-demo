import { test, expect } from '@playwright/test';

//npx playwright test test/e2e/login.spec.ts
//RUN_VULN_TESTS=1 npx playwright test test/e2e/login.spec.ts

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

  // -------------------------
  // BASELINE TESTS (always run)
  // -------------------------

  test('logs in with valid credentials and stores token', async ({ page }) => {
    const loginResp = page.waitForResponse(
      (r) => r.url().includes('/api/login') && r.request().method() === 'POST'
    );

    await page.fill('#username', 'user1');
    await page.fill('#password', 'password');
    await page.click('#loginForm button[type="submit"]');

    const res = await loginResp;
    expect([200, 401, 500]).toContain(res.status());

    const result = page.locator('#loginResult');
    await expect(result).toBeVisible();
    await expect(result).toContainText('token');

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token, 'Expected token stored in localStorage after login').toBeTruthy();
  });

  test('rejects invalid credentials', async ({ page }) => {
    const loginResp = page.waitForResponse(
      (r) => r.url().includes('/api/login') && r.request().method() === 'POST'
    );

    await page.fill('#username', 'user1');
    await page.fill('#password', 'wrong-password');
    await page.click('#loginForm button[type="submit"]');

    const res = await loginResp;
    expect([401, 500]).toContain(res.status());

    const result = page.locator('#loginResult');
    await expect(result).toBeVisible();
    await expect(result).toContainText('error');
  });

  // --------------------------------------
  // VULNERABILITY DEMO (opt-in only)
  // RUN_VULN_TESTS=1 npx playwright test
  // --------------------------------------

  test('VULN DEMO: login bypass possible (opt-in)', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');

    const loginResp = page.waitForResponse(
      (r) => r.url().includes('/api/login') && r.request().method() === 'POST'
    );

    // Minimal demonstration string (avoid printing “how-to” logs)
    await page.fill('#username', "admin' OR 'x'='x");
    await page.fill('#password', 'anything');
    await page.click('#loginForm button[type="submit"]');

    const res = await loginResp;
    expect([200, 401, 500]).toContain(res.status());

    const result = page.locator('#loginResult');
    await expect(result).toBeVisible();

    // If bypass succeeds, token should appear
    await expect(result).toContainText('token');

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });