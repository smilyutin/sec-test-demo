import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('Safe Login Testing', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // -------------------------
  // BASELINE TESTS (always run)
  // -------------------------

  test('logs in with valid credentials and stores token', async ({ loginPage, page }) => {
    const loginResp = page.waitForResponse(
      (r) => r.url().includes('/api/login') && r.request().method() === 'POST'
    );

    await loginPage.login('user1', 'password');

    const res = await loginResp;
    expect([200, 401, 500]).toContain(res.status());

    await loginPage.verifyLoginResult();

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token, 'Expected token stored in localStorage after login').toBeTruthy();
  });

  test('rejects invalid credentials', async ({ loginPage, page }) => {
    const loginResp = page.waitForResponse(
      (r) => r.url().includes('/api/login') && r.request().method() === 'POST'
    );

    await loginPage.login('user1', 'wrong-password');

    const res = await loginResp;
    expect([401, 500]).toContain(res.status());

    await loginPage.verifyLoginError();
    
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
});