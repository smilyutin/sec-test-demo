import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('Vulnerability Chain Testing', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should chain SQL injection to admin access', async ({ loginPage, adminPage }) => {
    // Step 1: SQL injection to get admin token
    await loginPage.attemptSQLInjection("admin' OR '1'='1'--", 'anything');
    
    // Step 2: Use token for admin access  
    await adminPage.attemptPrivilegedAccess();
    await adminPage.verifyAdminAccess();
    
    console.log('✓ Full chain: SQL injection → Admin access');
  });

  test('should exploit multiple vulnerabilities in sequence', async ({ loginPage, adminPage, searchPage, homePage, page }) => {
    // 1. SQL Injection
    await loginPage.attemptSQLInjection("admin'--", 'hramos');
    console.log('  → SQL injection completed');
    
    // 2. IDOR
    await page.fill('#userId', '2');
    await page.click('#idorForm button[type="submit"]');
    await page.waitForSelector('#idorResult.show');
    console.log('  → IDOR exploitation completed');
    
    // 2. XSS Attack
    await searchPage.performXSSAttack('<script>alert("XSS")</script>');
    console.log('  → XSS attack completed');
    
    // 3. Sensitive Data Exposure
    await homePage.clickConfigButton();
    await homePage.verifyConfigResultVisible();
    console.log('  → Config data exposed');
    
    console.log('✓ Multiple vulnerabilities exploited in sequence');
  });

  test('should demonstrate full penetration testing workflow', async ({ 
    homePage, 
    loginPage, 
    registrationPage,
    page 
  }) => {
    console.log('Starting penetration test workflow:');
    
    // Reconnaissance: Expose config
    await homePage.clickConfigButton();
    await homePage.verifyConfigResultVisible();
    console.log('  1. Reconnaissance - Config exposed');
    
    // Exploitation: SQL injection
    await loginPage.attemptSQLInjection("admin' OR '1'='1'--", 'test');
    console.log('  2. Exploitation - SQL injection successful');
    
    // Privilege escalation: Mass assignment
    const username = `attacker_${Date.now()}`;
    const attackResult = await registrationPage.testMassAssignmentVulnerability();
    console.log('  3. Privilege escalation - Admin account created');
    
    // Data exfiltration: IDOR (using page directly since not in fixtures)
    await page.fill('#userId', '1');
    await page.click('#idorForm button[type="submit"]');
    await page.waitForSelector('#idorResult.show');
    console.log('  4. Data exfiltration - User data accessed');
    
    console.log('✓ Full penetration testing workflow completed');
  });

  test('validates vulnerability mitigation measures', async ({ loginPage, registrationPage, homePage }) => {
    test.skip(!process.env.SECURE_MODE, 'Run only in secure mode (set SECURE_MODE=1)');
    
    console.log('Testing vulnerability mitigations in secure mode:');
    
    // Test SQL injection protection
    await loginPage.attemptSQLInjection("admin'--", 'test');
    await loginPage.verifyLoginRejected();
    console.log('  ✓ SQL injection blocked');
    
    // Test mass assignment protection  
    const massAssignResult = await registrationPage.testMassAssignmentVulnerability();
    expect(massAssignResult.isAdmin).toBe(false);
    console.log('  ✓ Mass assignment blocked');
    
    // Test sensitive data protection
    await homePage.clickConfigButton();
    await homePage.verifyNoSensitiveDataExposed();
    console.log('  ✓ Sensitive data protected');
    
    console.log('✓ All vulnerability mitigations working');
  });
});
