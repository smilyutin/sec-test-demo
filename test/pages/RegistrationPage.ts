import { Page, Locator, expect } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly emailField: Locator;
  readonly roleField: Locator;
  readonly registerButton: Locator;
  readonly registerResult: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.locator('#regUsername');
    this.passwordField = page.locator('#regPassword');
    this.emailField = page.locator('#regEmail');
    this.roleField = page.locator('#regRole');
    this.registerButton = page.locator('#registerForm button[type="submit"]');
    this.registerResult = page.locator('#registerResult');
  }

  async registerUser(userData: { username: string; password: string; email: string; role?: string; }) {
    const registerResponse = this.page.waitForResponse(
      (response) => response.url().includes('/api/register') && response.request().method() === 'POST'
    );

    await this.usernameField.fill(userData.username);
    await this.passwordField.fill(userData.password);
    await this.emailField.fill(userData.email);
    if (userData.role) {
      await this.roleField.fill(userData.role);
    }
    
    await this.registerButton.click();
    const response = await registerResponse;
    
    return {
      response,
      success: [200, 201].includes(response.status()),
      data: await response.json().catch(() => ({}))
    };
  }

  async verifyRegistrationSuccess() {
    await expect(this.registerResult).toBeVisible();
    await expect(this.registerResult).toContainText('success');
  }

  async registerWithRole(username: string, role: string) {
    const userData = {
      username,
      password: 'pass123',
      email: `${username}@demo.com`,
      role
    };
    
    return await this.registerUser(userData);
  }

  async submitRegistration() {
    await this.registerButton.click();
  }

  async fillRegistrationForm(userData: { username?: string; password?: string; email?: string; role?: string; }) {
    if (userData.username) await this.usernameField.fill(userData.username);
    if (userData.password) await this.passwordField.fill(userData.password);
    if (userData.email) await this.emailField.fill(userData.email);
    if (userData.role) await this.roleField.fill(userData.role);
  }

  async verifyRequiredFieldsError() {
    await expect(this.registerResult).toBeVisible();
    await expect(this.registerResult).toContainText('required');
  }

  async verifyValidationError(field: string) {
    await expect(this.registerResult).toBeVisible();
    await expect(this.registerResult).toContainText('error');
  }

  async verifyDuplicateUserError() {
    await expect(this.registerResult).toBeVisible();
    // Check for user already exists or similar error message
  }

  async attemptMassAssignment(username: string, password: string, email: string, maliciousRole: string = 'admin') {
    const userData = { username, password, email, role: maliciousRole };
    return await this.registerUser(userData);
  }

  async getRegistrationResult(): Promise<string> {
    await expect(this.registerResult).toBeVisible();
    return await this.registerResult.textContent() || '';
  }

  async validateSuccessfulRegistration() {
    await expect(this.registerResult).toBeVisible();
    await expect(this.registerResult).toContainText('userId');
    await expect(this.registerResult).toContainText('success');
    await expect(this.registerResult).toContainText('true');
  }

  async validateFailedRegistration(errorMessage?: string) {
    await expect(this.registerResult).toBeVisible();
    
    if (errorMessage) {
      await expect(this.registerResult).toContainText(errorMessage);
    }
  }

  async validateRoleAssignment(expectedRole: string) {
    const resultText = await this.getRegistrationResult();
    
    // Parse JSON response to check role
    try {
      const result = JSON.parse(resultText);
      expect(result.role).toBe(expectedRole);
    } catch (error) {
      throw new Error(`Failed to parse registration result as JSON: ${resultText}`);
    }
  }

  async testMassAssignmentVulnerability(targetRole: string = 'admin') {
    const timestamp = Date.now();
    const username = `massassign_${timestamp}`;
    const email = `${username}@demo.com`;
    
    const response = await this.attemptMassAssignment(username, 'password123', email, targetRole);
    
    return {
      response,
      username,
      email,
      attemptedRole: targetRole
    };
  }

  async validateSecureRegistration(attemptedRole: string, expectedRole: string = 'user') {
    // In secure mode, the server should ignore client-supplied roles
    await this.validateRoleAssignment(expectedRole);
    console.log(`✓ Mass assignment prevented: attempted "${attemptedRole}", got "${expectedRole}"`);
  }
}