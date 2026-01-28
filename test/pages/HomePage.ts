import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly warningMessage: Locator;
  readonly sqlInjectionSection: Locator;
  readonly xssSection: Locator;
  readonly idorSection: Locator;
  readonly authSection: Locator;
  readonly sensitiveDataSection: Locator;
  readonly massAssignmentSection: Locator;
  readonly loginForm: Locator;
  readonly searchForm: Locator;
  readonly idorForm: Locator;
  readonly adminForm: Locator;
  readonly configBtn: Locator;
  readonly registerForm: Locator;
  readonly configResult: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Security Testing Demo' });
    this.warningMessage = page.locator('.warning');
    this.sqlInjectionSection = page.getByRole('heading', { name: 'SQL Injection' });
    this.xssSection = page.getByRole('heading', { name: 'Cross-Site Scripting (XSS)' });
    this.idorSection = page.getByRole('heading', { name: 'Insecure Direct Object Reference' });
    this.authSection = page.getByRole('heading', { name: 'Broken Authentication' });
    this.sensitiveDataSection = page.getByRole('heading', { name: 'Sensitive Data Exposure' });
    this.massAssignmentSection = page.getByRole('heading', { name: 'Mass Assignment' });
    this.loginForm = page.locator('#loginForm');
    this.searchForm = page.locator('#searchForm');
    this.idorForm = page.locator('#idorForm');
    this.adminForm = page.locator('#adminForm');
    this.configBtn = page.locator('#configBtn');
    this.registerForm = page.locator('#registerForm');
    this.configResult = page.locator('#configResult');
  }

  async goto() {
    const response = await this.page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(this.heading).toBeVisible();
    return response;
  }

  async checkConsoleErrors(): Promise<string[]> {
    const consoleErrors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Only ignore known favicon noise
        if (!text.toLowerCase().includes('favicon')) {
          consoleErrors.push(text);
        }
      }
    });

    return consoleErrors;
  }

  async validatePageStructure() {
    await expect(this.page).toHaveTitle('Security Testing Demo');
    await expect(this.heading).toBeVisible();
    await expect(this.warningMessage).toContainText('Educational purposes only');
    
    // Validate all vulnerability sections
    await expect(this.sqlInjectionSection).toBeVisible();
    await expect(this.xssSection).toBeVisible();
    await expect(this.idorSection).toBeVisible();
    await expect(this.authSection).toBeVisible();
    await expect(this.sensitiveDataSection).toBeVisible();
    await expect(this.massAssignmentSection).toBeVisible();
    
    // Validate all forms are present
    await expect(this.loginForm).toBeVisible();
    await expect(this.searchForm).toBeVisible();
    await expect(this.idorForm).toBeVisible();
    await expect(this.adminForm).toBeVisible();
    await expect(this.configBtn).toBeVisible();
    await expect(this.registerForm).toBeVisible();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.heading).toBeVisible();
  }

  async clickConfigButton() {
    await this.configBtn.click();
  }

  async verifyConfigResultVisible() {
    await expect(this.configResult).toBeVisible();
    await expect(this.configResult).toContainText('{');
  }

  async verifyNoSensitiveDataExposed() {
    await expect(this.configResult).not.toContainText('secret_key');
    await expect(this.configResult).not.toContainText('api_keys');
    await expect(this.configResult).not.toContainText('stripe');
    await expect(this.configResult).not.toContainText('aws');
  }

  async checkForExposedSecrets(): Promise<string[]> {
    const resultText = await this.configResult.textContent() || '';
    const secretPatterns = ['secret_key', 'api_keys', 'stripe', 'aws', 'debug_mode'];
    
    return secretPatterns.filter(pattern => 
      resultText.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  async navigateToRegistration() {
    await this.page.click('a[href="/register"]');
    await expect(this.page).toHaveURL('/register');
  }
}