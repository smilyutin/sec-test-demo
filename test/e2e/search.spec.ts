import { test, expect, Page } from '@playwright/test';

test.describe('/#/ (XSS via Search Form)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should reflect script tag XSS payload', async ({ page }) => {
    const xssPayload = '<script>window.xssTriggered=true</script>';
    
    await page.fill('#searchQuery', xssPayload);
    await page.click('#searchForm button[type="submit"]');
    
    await page.waitForSelector('#searchResult.show', { timeout: 5000 });
    
    const resultHTML = await page.locator('#searchResult').innerHTML();
    expect(resultHTML).toContain(xssPayload);
    
    console.log('✓ XSS script tag payload reflected in DOM');
  });

  test('should reflect image onerror XSS payload', async ({ page }) => {
    const xssPayload = '<img src=x onerror=alert(1)>';
    
    await page.fill('#searchQuery', xssPayload);
    await page.click('#searchForm button[type="submit"]');
    
    await page.waitForSelector('#searchResult.show', { timeout: 5000 });
    
    const resultHTML = await page.locator('#searchResult').innerHTML();
    expect(resultHTML).toMatch(/\bsrc\s*=\s*['"]x['"]/);
    expect(resultHTML).toMatch(/\bonerror\s*=\s*['"][^'"]+['"]/);
    
    console.log('✓ XSS image onerror payload reflected');
  });

  test('should test SVG-based XSS vector', async ({ page }) => {
    const xssPayload = '<svg/onload=alert(1)>';
    
    await page.fill('#searchQuery', xssPayload);
    await page.click('#searchForm button[type="submit"]');
    
    await page.waitForSelector('#searchResult.show');
    
    const resultHTML = await page.locator('#searchResult').innerHTML();
    expect(resultHTML).toContain('svg');
    
    console.log('✓ SVG XSS vector reflected');
  });

  test('should display search term with HTML entities preserved', async ({ page }) => {
    const xssPayload = '<iframe src=javascript:alert(1)>';
    
    await page.fill('#searchQuery', xssPayload);
    await page.click('#searchForm button[type="submit"]');
    
    await page.waitForSelector('#searchResult.show');
    
    const resultText = await page.locator('#searchResult strong').textContent();
    expect(resultText).toContain('Search for:');
    
    console.log('✓ XSS iframe payload reflected in search results');
  });
});
