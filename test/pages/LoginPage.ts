import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;
  readonly loginResult: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.locator('#username');
    this.passwordField = page.locator('#password');
    this.loginButton = page.locator('#loginForm button[type="submit"]');
    this.loginResult = page.locator('#loginResult');
  }

  async login(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    
    const loginResponse = this.page.waitForResponse(
      (response) => response.url().includes('/api/login') && response.request().method() === 'POST'
    );
    
    await this.loginButton.click();
    return await loginResponse;
  }

  async loginWithValidCredentials(username: string = 'user1', password: string = 'password') {
    const response = await this.login(username, password);
    await expect(this.loginResult).toBeVisible();
    await expect(this.loginResult).toContainText('"success"');
    return response;
  }

  async attemptSQLInjection(payload: string = "admin' OR '1'='1'--", password: string = 'anything') {
    return await this.login(payload, password);
  }

  async getLoginResult(): Promise<string> {
    await expect(this.loginResult).toBeVisible();
    return await this.loginResult.textContent() || '';
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.page.evaluate(() => localStorage.getItem('token'));
    return !!token;
  }

  async getStoredToken(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem('token'));
  }

  async clearStoredToken() {
    await this.page.evaluate(() => localStorage.removeItem('token'));
  }

  async validateSuccessfulLogin() {
    await expect(this.loginResult).toBeVisible();
    await expect(this.loginResult).toContainText('"success"');
    
    const token = await this.getStoredToken();
    expect(token, 'Token should be stored in localStorage after successful login').toBeTruthy();
  }

  async validateFailedLogin() {
    await expect(this.loginResult).toBeVisible();
    await expect(this.loginResult).toContainText('error');
  }

  async verifyLoginRejected() {
    await expect(this.loginResult).toBeVisible();
    await expect(this.loginResult).toContainText('error');
    
    // Ensure no token was stored for rejected login
    const token = await this.getStoredToken();
    expect(token, 'No token should be stored after rejected login').toBeFalsy();
  }

  // Alias methods for backwards compatibility
  async verifyLoginResult() {
    return this.validateSuccessfulLogin();
  }

  async verifyLoginError() {
    return this.validateFailedLogin();
  }
}