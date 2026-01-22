import { test, expect } from '@playwright/test';

test.describe('Registration (baseline + optional mass-assignment demo)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // -------------------------
  // BASELINE TESTS (always run)
  // -------------------------

  test('registers a new user successfully', async ({ page }) => {
    const username = `user_${Date.now()}`;

    const registerResp = page.waitForResponse(
      (r) => r.url().includes('/api/register') && r.request().method() === 'POST'
    );

    await page.fill('#regUsername', username);
    await page.fill('#regPassword', 'pass123');
    await page.fill('#regEmail', `${username}@demo.com`);
    await page.fill('#regRole', 'user'); // normal

    await page.click('#registerForm button[type="submit"]');

    const res = await registerResp;
    expect([200, 400]).toContain(res.status());

    const result = page.locator('#registerResult');
    await expect(result).toBeVisible();

    // On success, your API responds with: success, userId, message, role
    await expect(result).toContainText('userId');
    await expect(result).toContainText('success');
    await expect(result).toContainText('true');
  });

  test.fixme('SECURITY EXPECTATION: ignores client-supplied role (should fail until fixed)', async ({ page }) => {
    const username = `role_expect_${Date.now()}`;

    const registerResp = page.waitForResponse(
      (r) => r.url().includes('/api/register') && r.request().method() === 'POST'
    );

    await page.fill('#regUsername', username);
    await page.fill('#regPassword', 'pass123');
    await page.fill('#regEmail', `${username}@demo.com`);
    await page.fill('#regRole', 'admin'); // attacker-controlled input

    await page.click('#registerForm button[type="submit"]');

    const res = await registerResp;
    expect([200, 400]).toContain(res.status());

    const result = page.locator('#registerResult');
    await expect(result).toBeVisible();

    // Correct secure behavior: server should force role to "user" regardless of input.
    // Currently fails because the app intentionally has this vulnerability for demo purposes.
    await expect(result).toContainText('"role"');
    await expect(result).not.toContainText('admin');
  });

  // --------------------------------------
  // VULNERABILITY DEMO (opt-in only)
  // RUN_VULN_TESTS=1 npx playwright test
  // --------------------------------------

  test('VULN DEMO: accepts arbitrary role from client (opt-in)', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');

    const username = `vuln_role_${Date.now()}`;

    const registerResp = page.waitForResponse(
      (r) => r.url().includes('/api/register') && r.request().method() === 'POST'
    );

    await page.fill('#regUsername', username);
    await page.fill('#regPassword', 'pass123');
    await page.fill('#regEmail', `${username}@demo.com`);
    await page.fill('#regRole', 'admin');

    await page.click('#registerForm button[type="submit"]');

    const res = await registerResp;
    expect([200, 400]).toContain(res.status());

    const result = page.locator('#registerResult');
    await expect(result).toBeVisible();

    // If vulnerability is present, the response reflects the supplied role.
    await expect(result).toContainText('admin');
    await expect(result).toContainText('success');
  });
});