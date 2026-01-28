import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('search calls /api/search and renders results panel', async ({ searchPage }) => {
    await searchPage.searchAndValidateResponse('Laptop');
  });

  test('SECURITY EXPECTATION: should not interpret user input as HTML (run in SECURE_MODE)', async ({ searchPage }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');

    const sentinel = `<img src=x data-test="xss-sentinel">`;
    await searchPage.validateSecureSearch(sentinel);
    await searchPage.validateXSSPrevention(sentinel);
  });

  test('VULN DEMO: user input is rendered as HTML (opt-in)', async ({ searchPage }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');

    const payload = '<strong>Bold Text</strong>';
    await searchPage.performXSSSearch(payload);
    await searchPage.validateXSSReflection(payload);
  });

  test('handles empty search query', async ({ searchPage }) => {
    const response = await searchPage.search('');
    expect([200, 400, 500]).toContain(response.status());
  });

  test('handles special characters in search', async ({ searchPage }) => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];
    
    for (const char of specialChars) {
      const response = await searchPage.search(char);
      expect([200, 400, 500]).toContain(response.status());
    }
  });

  test('search results contain query reference', async ({ searchPage }) => {
    const query = 'laptop computer';
    await searchPage.search(query);
    
    const resultText = await searchPage.getSearchResultText();
    expect(resultText).toContain('Search for:');
  });

});

test('VULN DEMO: direct DOM XSS injection (manual)', async ({ page }) => {
  test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
  
  // Ensure page is loaded and elements are available
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Wait for the search form to be available
  await page.waitForSelector('#searchQuery', { timeout: 10000 });
  
  const payload = `<img src=x data-test="xss-demo">`;

  await page.fill('#searchQuery', payload);
  await page.click('#searchForm button[type="submit"]');

  const result = page.locator('#searchResult');
  await expect(result).toBeVisible({ timeout: 10000 });

  // Vulnerable behavior: payload is inserted into DOM as an element.
  await expect(page.locator('#searchResult img[data-test="xss-demo"]')).toHaveCount(1);
});
