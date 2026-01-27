import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

  test('shows user data when requesting an existing ID (current vulnerable behavior)', async ({ page }) => {
    await page.fill('#userId', '1');

    const userResp = page.waitForResponse(r => r.url().includes('/api/user/1') && r.request().method() === 'GET');
    await page.click('#idorForm button[type="submit"]');
    const res = await userResp;

    expect([200, 404, 500]).toContain(res.status());

    const result = page.locator('#idorResult');
    await expect(result).toBeVisible();
    await expect(result).toContainText('"username"');
    await expect(result).toContainText('"email"');
  });

  test('returns not found for non-existent user IDs (expected UX)', async ({ page }) => {
    await page.fill('#userId', '9999');

    const userResp = page.waitForResponse(r => r.url().includes('/api/user/9999') && r.request().method() === 'GET');
    await page.click('#idorForm button[type="submit"]');
    const res = await userResp;

    expect([404, 500]).toContain(res.status()); // depending on server behavior

    const result = page.locator('#idorResult');
    await expect(result).toBeVisible();
    // Your API returns { error: 'User not found' } on 404
    if (res.status() === 404) {
      await expect(result).toContainText('User not found');
    }
  });

  test.fixme('SECURITY EXPECTATION: should not expose secret_data without auth (should fail until fixed)', async ({ page }) => {
    await page.fill('#userId', '1');
    await page.click('#idorForm button[type="submit"]');

    const result = page.locator('#idorResult');
    await expect(result).toBeVisible();

    // This is the key "regression" expectation:
    // Once you fix IDOR, secret_data should not be returned to anonymous users.
    // Currently fails because the app intentionally has this vulnerability for demo purposes.
    await expect(result).not.toContainText('secret_data');
  });