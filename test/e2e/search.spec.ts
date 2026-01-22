import { test, expect } from '@playwright/test';

test.describe('Search (baseline + optional XSS demo)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // -------------------------
  // BASELINE TESTS (always run)
  // -------------------------

  test('search calls /api/search and renders results panel', async ({ page }) => {
    const searchResp = page.waitForResponse(
      (r) => r.url().includes('/api/search') && r.request().method() === 'GET'
    );

    await page.fill('#searchQuery', 'Laptop');
    await page.click('#searchForm button[type="submit"]');

    const res = await searchResp;
    expect([200, 500]).toContain(res.status());

    const result = page.locator('#searchResult');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Search for:');
  });

  test('SECURITY EXPECTATION: should not interpret user input as HTML (run in SECURE_MODE)', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');

    // Safe sentinel: if the UI injects it as HTML, we would see a real <img> element.
    const sentinel = `<img src=x data-test="xss-sentinel">`;

    await page.fill('#searchQuery', sentinel);
    await page.click('#searchForm button[type="submit"]');

    const result = page.locator('#searchResult');
    await expect(result).toBeVisible();

    // Secure behavior: user input should be encoded/escaped, so no element should be created in the DOM.
    await expect(page.locator('#searchResult img[data-test="xss-sentinel"]')).toHaveCount(0);
  });

  // --------------------------------------
  // VULNERABILITY DEMO (opt-in only)
  // RUN_VULN_TESTS=1 npx playwright test
  // --------------------------------------

  test('VULN DEMO: user input is rendered as HTML (opt-in)', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');

    const payload = `<img src=x data-test="xss-demo">`;

    await page.fill('#searchQuery', payload);
    await page.click('#searchForm button[type="submit"]');

    const result = page.locator('#searchResult');
    await expect(result).toBeVisible();

    // Vulnerable behavior: payload is inserted into DOM as an element.
    await expect(page.locator('#searchResult img[data-test="xss-demo"]')).toHaveCount(1);
  });
});
