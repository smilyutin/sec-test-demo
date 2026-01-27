import { test, expect } from '@playwright/test';

// Set up common navigation for all tests
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('denies admin access when token is missing', async ({ page }) => {
  await page.fill('#adminToken', '');
  await page.click('#adminForm button[type="submit"]');

  const adminResult = page.locator('#adminResult');
  await expect(adminResult).toBeVisible(); // result.show in UI
  await expect(adminResult).toContainText('error');
});

test('stores token in localStorage after normal login', async ({ page }) => {
  // Use normal credentials from server.js seed data (user1/password)
  await page.fill('#username', 'user1');
  await page.fill('#password', 'password');
  await page.click('#loginForm button[type="submit"]');

  const loginResult = page.locator('#loginResult');
  await expect(loginResult).toBeVisible();
  await expect(loginResult).toContainText('"success"');

  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token, 'Expected token to be stored in localStorage after login').toBeTruthy();
});

test('denies admin access with a non-admin token (expected behavior after fix)', async ({ page }) => {
  // Get a normal user token
  await page.fill('#username', 'user1');
  await page.fill('#password', 'password');
  await page.click('#loginForm button[type="submit"]');

  await expect(page.locator('#loginResult')).toBeVisible();

  // Leave token field empty so UI uses localStorage token
  await page.fill('#adminToken', '');
  await page.click('#adminForm button[type="submit"]');

  const adminResult = page.locator('#adminResult');
  await expect(adminResult).toBeVisible();

  // Today your backend may still block this (403) — which is fine.
  // This assertion expresses the *correct* security expectation.
  await expect(adminResult).toContainText('error');
});

test('admin access should require verified JWT (regression expectation)', async ({ page }) => {
  // This is intentionally written as a "security expectation" test.
  // If the server incorrectly accepts unverified tokens, this test should FAIL until fixed.
  const suspiciousToken = 'dummy.invalid.token';

  await page.fill('#adminToken', suspiciousToken);
  await page.click('#adminForm button[type="submit"]');

  const adminResult = page.locator('#adminResult');
  await expect(adminResult).toBeVisible();
  await expect(adminResult).toContainText('error'); // should not grant admin
});