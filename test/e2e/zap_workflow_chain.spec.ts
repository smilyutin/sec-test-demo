// ZAP workflow suite: chained vulnerability demo (single canonical scenario)
import { test, expect } from '../fixtures/zap-fixtures';

test.describe('Chained Vulnerability Workflow', () => {
  test('VULN DEMO: chains config exposure -> SQLi login -> admin access -> IDOR', async ({
    homePage,
    loginPage,
    adminPage,
    idorPage,
    page
  }) => {
    test.skip(process.env.SECURE_MODE === '1', 'Workflow demo runs only in vulnerable mode');

    await homePage.goto();

    // 1) Recon: config exposure (UI proof)
    await homePage.clickConfigButton();
    await homePage.verifyConfigResultVisible();

    // 2) Exploit: SQL injection login bypass (token should be stored)
    const loginResp = await loginPage.attemptSQLInjection();
    expect(loginResp.status()).toBe(200);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token, 'Expected token stored after SQLi login in vulnerable mode').toBeTruthy();

    // 3) Privileged action: admin access using stored token
    const adminResp = await adminPage.accessAdminWithStoredToken();
    expect(adminResp.status()).toBe(200);
    await adminPage.validateAuthorizedAccess();

    // 4) Data exfiltration: IDOR user data access
    await idorPage.validateUserDataAccess('1');
  });
});
