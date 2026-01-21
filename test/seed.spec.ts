import { test, expect } from '@playwright/test';

// This file is a placeholder for “seeding” the app with any state your tests need.
//
// Typical uses:
// - Warm up the server (open the home page once so slow startup fails early)
// - Create test data via the API (users, products, etc.)
// - Log in once and persist auth state with `page.context().storageState({ path })`
//
// Note: This test currently does not seed anything. It’s safe to delete if unused.
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // Example warm-up (uncomment if you want this to actually do something):
    // await page.goto('/');
    // await expect(page.getByText('Security Testing Demo')).toBeVisible();
    //
    // Example save auth state (after you perform a login flow):
    // await page.context().storageState({ path: 'test-results/storageState.json' });
  });
});
