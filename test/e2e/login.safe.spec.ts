import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('Safe Login Testing', () => {
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
});