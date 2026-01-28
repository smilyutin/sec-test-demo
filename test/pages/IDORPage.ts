import { Page, Locator, expect } from '@playwright/test';

export class IDORPage {
  readonly page: Page;
  readonly userIdField: Locator;
  readonly submitButton: Locator;
  readonly idorResult: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userIdField = page.locator('#userId');
    this.submitButton = page.locator('#idorForm button[type="submit"]');
    this.idorResult = page.locator('#idorResult');
  }

  async accessUser(userId: string) {
    // For number inputs, we need to clear first and use pressSequentially for non-numeric values
    await this.userIdField.clear();
    
    if (/^\d+$/.test(userId)) {
      // If it's a valid number, fill normally
      await this.userIdField.fill(userId);
    } else {
      // For non-numeric values, use pressSequentially to simulate typing
      await this.userIdField.pressSequentially(userId);
    }
    
    // Set up response wait with extended timeout for edge cases
    const userResponsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/api/user/') && response.request().method() === 'GET',
      { timeout: 10000 }
    );
    
    await this.submitButton.click();
    const response = await userResponsePromise;
    
    await expect(this.idorResult).toBeVisible();
    return response;
  }

  async getUserData(userId: string) {
    const response = await this.accessUser(userId);
    const resultText = await this.getResultText();
    
    return {
      response,
      data: resultText,
      status: response?.status() || 0
    };
  }

  async getResultText(): Promise<string> {
    await expect(this.idorResult).toBeVisible();
    return await this.idorResult.textContent() || '';
  }

  async validateUserDataAccess(userId: string) {
    const { response, data } = await this.getUserData(userId);
    
    expect([200, 404, 500]).toContain(response.status());
    await expect(this.idorResult).toContainText('"username"');
    await expect(this.idorResult).toContainText('"email"');
    
    return { response, data };
  }

  async validateUserNotFound(userId: string) {
    const { response } = await this.getUserData(userId);
    
    expect([404, 500]).toContain(response.status());
    
    if (response.status() === 404) {
      await expect(this.idorResult).toContainText('User not found');
    }
  }

  async testSecretDataLeakage(userId: string) {
    const { data } = await this.getUserData(userId);
    
    // Check if sensitive data is leaked
    const hasSecretData = data.includes('secret_data');
    
    return {
      hasSecretData,
      userData: data
    };
  }

  async validateSecureAccess(userId: string) {
    // In secure mode, secret_data should not be exposed
    const { hasSecretData } = await this.testSecretDataLeakage(userId);
    
    expect(hasSecretData).toBe(false);
    console.log('✓ IDOR vulnerability fixed: secret_data not exposed');
  }

  async enumerateUsers(startId: number = 1, endId: number = 10) {
    const results = [];
    
    for (let id = startId; id <= endId; id++) {
      try {
        const { response, data } = await this.getUserData(id.toString());
        
        results.push({
          id,
          status: response.status(),
          found: response.status() === 200,
          data: data
        });
        
        // Add small delay to avoid overwhelming the server
        await this.page.waitForTimeout(100);
        
      } catch (error) {
        results.push({
          id,
          status: 0,
          found: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  async testIDORVulnerability() {
    // Test accessing different user IDs without authentication
    const testIds = ['1', '2', '3', '999', '0', '-1'];
    const results = [];
    
    for (const id of testIds) {
      const { response, data, status } = await this.getUserData(id);
      
      results.push({
        userId: id,
        status,
        accessible: status === 200,
        hasUserData: data.includes('"username"'),
        hasSecretData: data.includes('secret_data'),
        rawData: data
      });
    }
    
    return results;
  }
}