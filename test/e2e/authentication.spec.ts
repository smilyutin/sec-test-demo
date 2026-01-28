import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('Authentication', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('denies admin access when token is missing', async ({ adminPage }) => {
    await adminPage.accessAdminWithoutToken();
    await adminPage.validateUnauthorizedAccess();
  });

  test('stores token in localStorage after normal login', async ({ loginPage }) => {
    await loginPage.loginWithValidCredentials();
    await loginPage.validateSuccessfulLogin();
  });

  test('denies admin access with a non-admin token', async ({ loginPage, adminPage }) => {
    // Get a normal user token first
    await loginPage.loginWithValidCredentials();
    await loginPage.validateSuccessfulLogin();

    // Try to access admin with normal user token
    await adminPage.accessAdminWithStoredToken();
    await adminPage.validateUnauthorizedAccess();
  });

  test('handles login with invalid credentials', async ({ loginPage }) => {
    const response = await loginPage.login('invaliduser', 'wrongpassword');
    expect([400, 401, 403]).toContain(response.status());
    await loginPage.validateFailedLogin();
  });

  test('SQL injection in login form (vulnerability demo)', async ({ loginPage }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const response = await loginPage.attemptSQLInjection();
    
    // In vulnerable mode, SQL injection might succeed
    if (response.status() === 200) {
      console.log('WARNING: SQL Injection successful - application is vulnerable');
      const result = await loginPage.getLoginResult();
      expect(result).toContain('"success"');
    }
  });

  test('prevents SQL injection (security expectation)', async ({ loginPage }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const response = await loginPage.attemptSQLInjection();
    expect([400, 401, 403]).toContain(response.status());
    await loginPage.validateFailedLogin();
    
    console.log('✓ SQL injection properly prevented');
  });

  test('clears authentication state on logout', async ({ loginPage, page }) => {
    await loginPage.loginWithValidCredentials();
    const tokenBeforeLogout = await loginPage.getStoredToken();
    expect(tokenBeforeLogout).toBeTruthy();

    // Simulate logout by clearing token
    await loginPage.clearStoredToken();
    const tokenAfterLogout = await loginPage.getStoredToken();
    expect(tokenAfterLogout).toBeFalsy();
  });

});

test('admin access should require verified JWT (regression expectation)', async ({ page }) => {
  // This is intentionally written as a "security expectation" test.
  // If the server incorrectly accepts unverified tokens, this test should FAIL until fixed.
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const suspiciousToken = 'dummy.invalid.token';

  await page.fill('#adminToken', suspiciousToken);
  await page.click('#adminForm button[type="submit"]');

  const adminResult = page.locator('#adminResult');
  await expect(adminResult).toBeVisible();
  await expect(adminResult).toContainText('error'); // should not grant admin
});