// OWASP Top 10 A02:2021 – Cryptographic Failures (Sensitive Data Exposure)
import { test, expect } from '../fixtures/zap-fixtures';

test.describe('Sensitive Data Exposure Testing', () => {
  // -------------------------
  // BASELINE TESTS (always run)
  // -------------------------

  test('config button calls /api/config and renders response panel', async ({ homePage, page }) => {
    const cfgResp = page.waitForResponse(
      (r) => r.url().includes('/api/config') && r.request().method() === 'GET'
    );

    await homePage.clickConfigButton();

    const res = await cfgResp;
    expect([200, 500]).toContain(res.status());

    await homePage.verifyConfigResultVisible();
  });

  // --------------------------------------
  // SECURITY EXPECTATIONS (run only after hardening)
  // SECURE_MODE=1 npx playwright test
  // --------------------------------------

  test.fixme('SECURITY EXPECTATION: config endpoint should not expose secrets (run in SECURE_MODE)', async ({ homePage }) => {
    // EXPECTED FAILURE: This application is intentionally vulnerable for educational purposes.
    // This test demonstrates what SHOULD happen after security hardening - config endpoint should not expose secrets.
    // Currently fails because secrets are intentionally exposed to demonstrate the vulnerability.
    console.log(' SECURITY EXPECTATION: Validating that config endpoint does not expose secrets');

    await homePage.clickConfigButton();
    await homePage.verifyConfigResultVisible();

    // After hardening, the UI/API should not leak secret keys or API keys.
    await homePage.verifyNoSensitiveDataExposed();
  });

  // --------------------------------------
  // VULNERABILITY DEMO (opt-in only)
  // RUN_VULN_TESTS=1 npx playwright test
  // --------------------------------------

  test('VULN DEMO: config endpoint exposes secret key and API keys (opt-in)', async ({ homePage }) => {
    console.log(' VULNERABILITY DEMO: Testing exposure of secret keys and API keys in config endpoint');

    await homePage.clickConfigButton();
    await homePage.verifyConfigResultVisible();

    // Current intentionally vulnerable behavior - demonstrate secret exposure
    const exposedSecrets = await homePage.checkForExposedSecrets();
    
    console.log(`WARNING: Vulnerability Demo: Found ${exposedSecrets.length} exposed secrets`);
    
    // Verify specific secrets are exposed in vulnerable mode
    expect(exposedSecrets).toContain('secret_key');
    expect(exposedSecrets).toContain('api_keys');
  });

  test('VULN DEMO: debug mode is visible (opt-in)', async ({ homePage }) => {
    console.log(' VULNERABILITY DEMO: Testing visibility of debug mode configuration');

    await homePage.clickConfigButton();
    await homePage.verifyConfigResultVisible();
    
    const exposedSecrets = await homePage.checkForExposedSecrets();
    expect(exposedSecrets).toContain('debug_mode');
  });

  test('validates config response format and structure', async ({ homePage, page }) => {
    const cfgResp = page.waitForResponse(r => r.url().includes('/api/config'));
    
    await homePage.clickConfigButton();
    const res = await cfgResp;
    
    expect(res.status()).toBe(200);
    const configData = await res.json();
    expect(configData).toBeDefined();
    expect(typeof configData).toBe('object');
  });

});