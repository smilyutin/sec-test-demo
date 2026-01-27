import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

  // -------------------------
  // BASELINE TESTS (always run)
  // -------------------------

  test('config button calls /api/config and renders response panel', async ({ page }) => {
    const cfgResp = page.waitForResponse(
      (r) => r.url().includes('/api/config') && r.request().method() === 'GET'
    );

    await page.click('#configBtn');

    const res = await cfgResp;
    expect([200, 500]).toContain(res.status());

    const result = page.locator('#configResult');
    await expect(result).toBeVisible();
    await expect(result).toContainText('{');
  });

  // --------------------------------------
  // SECURITY EXPECTATIONS (run only after hardening)
  // SECURE_MODE=1 npx playwright test
  // --------------------------------------

  test('SECURITY EXPECTATION: config endpoint should not expose secrets (run in SECURE_MODE)', async ({ page }) => {
    test.skip(process.env.SECURE_MODE !== '1', 'Run security expectations only after hardening (set SECURE_MODE=1)');

    await page.click('#configBtn');

    const result = page.locator('#configResult');
    await expect(result).toBeVisible();

    // After hardening, the UI/API should not leak secret keys or API keys.
    await expect(result).not.toContainText('secret_key');
    await expect(result).not.toContainText('api_keys');
    await expect(result).not.toContainText('stripe');
    await expect(result).not.toContainText('aws');
  });

  // --------------------------------------
  // VULNERABILITY DEMO (opt-in only)
  // RUN_VULN_TESTS=1 npx playwright test
  // --------------------------------------

  test('VULN DEMO: config endpoint exposes secret key and API keys (opt-in)', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');

    await page.click('#configBtn');

    const result = page.locator('#configResult');
    await expect(result).toBeVisible();

    // Current intentionally vulnerable behavior
    await expect(result).toContainText('secret_key');
    await expect(result).toContainText('api_keys');
    await expect(result).toContainText('stripe');
    await expect(result).toContainText('aws');
  });

  test('VULN DEMO: debug mode is visible (opt-in)', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');

    await page.click('#configBtn');

    const result = page.locator('#configResult');
    await expect(result).toBeVisible();
    await expect(result).toContainText('debug_mode');
  });