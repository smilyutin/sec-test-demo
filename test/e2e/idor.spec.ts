import { test, expect, Page } from '@playwright/test';

test.describe('/#/ (IDOR via User Data Form)', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
  });

  test('should access user 1 data without authentication', async ({ page }: { page: Page }) => {
    await page.fill('#userId', '1');
    await page.click('#idorForm button[type="submit"]');
    
    await page.waitForSelector('#idorResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#idorResult').textContent();
    expect(resultText).toContain('username');
    expect(resultText).toContain('email');
    expect(resultText).toContain('secret_data');
    
    console.log('✓ IDOR - Accessed user 1 data via UI');
  });

  test('should access user 2 data without authentication', async ({ page }: { page: Page }) => {
    await page.fill('#userId', '2');
    await page.click('#idorForm button[type="submit"]');
    
    await page.waitForSelector('#idorResult.show', { timeout: 5000 });
    
    const resultText = await page.locator('#idorResult').textContent();
    expect(resultText).toContain('user');
    
    console.log('✓ IDOR - Accessed user 2 data via UI');
  });

  test('should expose admin secret data', async ({ page }: { page: Page }) => {
    await page.fill('#userId', '1');
    await page.click('#idorForm button[type="submit"]');
    
    await page.waitForSelector('#idorResult.show', { timeout: 5000 });
    
    const resultHTML = await page.locator('#idorResult').innerHTML();
    expect(resultHTML).toContain('admin');
    expect(resultHTML).toContain('FLAG');
    
    console.log('✓ IDOR - Admin secret data exposed in UI');
  });

  test('should enumerate users by changing ID', async ({ page }: { page: Page }) => {
    const userIds = ['1', '2', '3'];
    
    for (const id of userIds) {
      await page.fill('#userId', id);
      await page.click('#idorForm button[type="submit"]');
      await page.waitForSelector('#idorResult.show', { timeout: 5000 });
      
      const resultText = await page.locator('#idorResult').textContent();
      if (resultText && resultText.includes('username')) {
        console.log(`✓ IDOR - User ${id} data accessible`);
      }
      
      await page.waitForTimeout(500);
    }
  });
});
