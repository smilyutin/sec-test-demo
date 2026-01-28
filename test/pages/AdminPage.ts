import { Page, Locator, expect } from '@playwright/test';

export class AdminPage {
  readonly page: Page;
  readonly adminTokenField: Locator;
  readonly adminButton: Locator;
  readonly adminResult: Locator;

  constructor(page: Page) {
    this.page = page;
    this.adminTokenField = page.locator('#adminToken');
    this.adminButton = page.locator('#adminForm button[type="submit"]');
    this.adminResult = page.locator('#adminResult');
  }

  async attemptPrivilegedAccess() {
    await this.adminButton.click();
  }

  async verifyAdminAccess() {
    await expect(this.adminResult).toBeVisible();
  }

  async accessAdminWithToken(token: string = '') {
    await this.adminTokenField.fill(token);
    
    const adminResponse = this.page.waitForResponse(
      (response) => response.url().includes('/api/admin') && response.request().method() === 'GET'
    );
    
    await this.adminButton.click();
    const response = await adminResponse;
    
    await expect(this.adminResult).toBeVisible();
    return response;
  }

  async accessAdminWithoutToken() {
    return await this.accessAdminWithToken('');
  }

  async accessAdminWithStoredToken() {
    // Leave token field empty to use localStorage token
    return await this.accessAdminWithToken('');
  }

  async getAdminResult(): Promise<string> {
    await expect(this.adminResult).toBeVisible();
    return await this.adminResult.textContent() || '';
  }

  async validateUnauthorizedAccess() {
    await expect(this.adminResult).toBeVisible();
    await expect(this.adminResult).toContainText('error');
  }

  async validateAuthorizedAccess() {
    await expect(this.adminResult).toBeVisible();
    await expect(this.adminResult).not.toContainText('error');
  }

  async craftMaliciousToken(payload: object): Promise<string> {
    // Simple JWT-like token crafting for testing
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payloadEncoded = btoa(JSON.stringify(payload));
    return `${header}.${payloadEncoded}.`;
  }

  async testTokenManipulation(maliciousPayload: object) {
    const maliciousToken = await this.craftMaliciousToken(maliciousPayload);
    return await this.accessAdminWithToken(maliciousToken);
  }

  async testPrivilegeEscalation(userToken: string) {
    // Test if a regular user token can access admin functions
    return await this.accessAdminWithToken(userToken);
  }
}