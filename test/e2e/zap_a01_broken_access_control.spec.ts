// OWASP Top 10 A01:2021 – Broken Access Control (IDOR)
import { test, expect } from '../fixtures/zap-fixtures';
import { IDORPage } from '../pages/IDORPage';

test.describe('IDOR Vulnerability Testing', () => {
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

  test.fixme('SECURITY EXPECTATION: validates secure access (run in SECURE_MODE)', async ({ page }) => {
    // EXPECTED FAILURE: This application is intentionally vulnerable for educational purposes.
    // This test demonstrates secure access control that should be implemented after hardening.
    console.log('SECURITY EXPECTATION: Validating secure access controls');
    
    const idorPage = new IDORPage(page);
    await idorPage.validateSecureAccess('1');
  });

  test.fixme('should prevent unauthorized user enumeration', async ({ page }) => {
    // EXPECTED FAILURE: This application is intentionally vulnerable for educational purposes.
    // This test demonstrates secure user enumeration prevention after hardening.
    console.log(' SECURITY EXPECTATION: Validating prevention of unauthorized user enumeration');
    
    const idorPage = new IDORPage(page);
    const results = await idorPage.enumerateUsers(1, 5);
    
    // In secure mode, user enumeration should be limited
    const successfulAccesses = results.filter(r => r.found);
    expect(successfulAccesses.length).toBeLessThanOrEqual(1); // Should only allow own user data
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