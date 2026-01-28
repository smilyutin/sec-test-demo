import { test, expect } from '../fixtures/e2e-fixtures';
import { IDORPage } from '../pages/IDORPage';

test.describe('IDOR Vulnerability Testing', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('shows user data when requesting an existing ID (current vulnerable behavior)', async ({ page }) => {
    const idorPage = new IDORPage(page);
    await idorPage.validateUserDataAccess('1');
  });

  test('returns not found for non-existent user IDs', async ({ page }) => {
    const idorPage = new IDORPage(page);
    await idorPage.validateUserNotFound('9999');
  });

  test.fixme('SECURITY EXPECTATION: should not expose secret_data without auth (should fail until fixed)', async ({ page }) => {
    const idorPage = new IDORPage(page);
    
    // This test should fail in vulnerable mode and pass in secure mode
    const { hasSecretData } = await idorPage.testSecretDataLeakage('1');
    expect(hasSecretData).toBe(false);
  });

  test('SECURITY EXPECTATION: validates secure access (run in SECURE_MODE)', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const idorPage = new IDORPage(page);
    await idorPage.validateSecureAccess('1');
  });

  test('should prevent unauthorized user enumeration', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const idorPage = new IDORPage(page);
    const results = await idorPage.enumerateUsers(1, 5);
    
    // In secure mode, user enumeration should be limited
    const successfulAccesses = results.filter(r => r.found);
    expect(successfulAccesses.length).toBeLessThanOrEqual(1); // Should only allow own user data
  });

  test('VULN DEMO: demonstrates user data exposure (opt-in)', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const idorPage = new IDORPage(page);
    const results = await idorPage.testIDORVulnerability();
    
    // In vulnerable mode, demonstrate that user data is accessible
    const exposedUsers = results.filter(r => r.hasUserData);
    console.log(`WARNING: IDOR vulnerability exposed ${exposedUsers.length} user records`);
    
    const exposedSecrets = results.filter(r => r.hasSecretData);
    if (exposedSecrets.length > 0) {
      console.log(`WARNING: Secret data exposed for ${exposedSecrets.length} users`);
    }
  });

  test('handles edge case user IDs', async ({ page }) => {
    const idorPage = new IDORPage(page);
    const edgeCases = ['0', '-1', 'abc', 'null', 'undefined', '999999999'];
    
    for (const userId of edgeCases) {
      const { response } = await idorPage.getUserData(userId);
      expect(response).not.toBeNull();
      expect([200, 400, 404, 500]).toContain(response!.status());
    }
  });

  test('validates response time for user data access', async ({ page }) => {
    const idorPage = new IDORPage(page);
    
    const startTime = Date.now();
    await idorPage.accessUser('1');
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    console.log(`User data access took ${responseTime}ms`);
  });

});