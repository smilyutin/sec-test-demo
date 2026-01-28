import { test, expect } from '@playwright/test';

// This file is a placeholder for "seeding" the app with any state your tests need.
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // Warm up the application for ML anomaly detection testing
    await page.goto('/');
    await expect(page).toHaveTitle('Security Testing Demo');
    await expect(page.getByRole('heading', { name: 'Security Testing Demo' })).toBeVisible();
  });
});
