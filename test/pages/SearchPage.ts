import { Page, Locator, expect } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly searchField: Locator;
  readonly searchButton: Locator;
  readonly searchResult: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchField = page.locator('#searchQuery');
    this.searchButton = page.locator('#searchForm button[type="submit"]');
    this.searchResult = page.locator('#searchResult');
  }

  async search(query: string) {
    await this.searchField.fill(query);
    
    const searchResponse = this.page.waitForResponse(
      (response) => response.url().includes('/api/search') && response.request().method() === 'GET',
      { timeout: 10000 }
    );
    
    await this.searchButton.click();
    const response = await searchResponse;
    
    await expect(this.searchResult).toBeVisible({ timeout: 10000 });
    return response;
  }

  async searchAndValidateResponse(query: string, expectedStatuses: number[] = [200, 500]) {
    const response = await this.search(query);
    expect(expectedStatuses).toContain(response.status());
    
    await expect(this.searchResult).toContainText('Search for:');
    return response;
  }

  async performXSSSearch(payload: string) {
    const response = await this.search(payload);
    await this.page.waitForSelector('#searchResult.show');
    return response;
  }

  async getSearchResultHTML(): Promise<string> {
    await expect(this.searchResult).toBeVisible();
    return await this.searchResult.innerHTML();
  }

  async getSearchResultText(): Promise<string> {
    await expect(this.searchResult).toBeVisible();
    return await this.searchResult.textContent() || '';
  }

  async performXSSAttack(payload: string) {
    await this.search(payload);
    return {
      success: true,
      payload
    };
  }

  async validateXSSReflection(payload: string) {
    const resultHTML = await this.getSearchResultHTML();
    expect(resultHTML).toContain(payload);
    console.log('XSS payload reflected in DOM');
  }

  async validateXSSPrevention(payload: string) {
    // In secure mode, XSS should be prevented
    const xssElements = this.page.locator(`[data-test="xss-sentinel"]`);
    await expect(xssElements).toHaveCount(0);
    console.log('XSS payload properly sanitized');
  }

  async testMultipleXSSVectors(vectors: string[]) {
    const results = [];
    
    for (const vector of vectors) {
      await this.search(vector);
      await this.page.waitForTimeout(500);
      
      const resultHTML = await this.getSearchResultHTML();
      const isReflected = resultHTML.includes(vector);
      
      results.push({
        vector,
        reflected: isReflected
      });
      
      if (isReflected) {
        console.log(`XSS vector reflected: ${vector}`);
      }
    }
    
    return results;
  }

  async validateSecureSearch(inputWithHTML: string) {
    await this.search(inputWithHTML);
    
    // In secure mode, HTML should be escaped/encoded
    const resultHTML = await this.getSearchResultHTML();
    
    // Check that dangerous HTML elements are not created
    const dangerousElements = this.page.locator('#searchResult script, #searchResult img[onerror], #searchResult iframe[src*="javascript:"]');
    await expect(dangerousElements).toHaveCount(0);
    
    return resultHTML;
  }
}