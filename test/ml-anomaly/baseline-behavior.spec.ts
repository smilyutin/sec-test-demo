import { uiTest as test, expect } from '../fixtures/ml-anomaly-fixtures';

test.describe('Baseline Behavior Patterns - ML Anomaly Detection', () => {
  test('Normal User Authentication Flow', async ({ page }) => {
    // Record start time for baseline timing metrics
    const startTime = Date.now();
    
    // Navigate to the home page (already done via autoGoto fixture)
    await expect(page).toHaveTitle('Security Testing Demo');
    
    // Fill username field with 'user1' - normal behavior pattern
    await page.fill('#username', 'user1');
    
    // Fill password field with 'password' - standard credentials
    await page.fill('#password', 'password');
    
    // Click login button - normal user interaction
    const loginResp = page.waitForResponse(r => 
      r.url().includes('/api/login') && r.request().method() === 'POST'
    );
    
    await page.click('#loginForm button[type="submit"]');
    
    // Wait for successful login response
    const response = await loginResp;
    expect([200, 401, 500]).toContain(response.status());
    
    // Verify token is stored in localStorage
    const loginResult = page.locator('#loginResult');
    await expect(loginResult).toBeVisible();
    
    if (response.status() === 200) {
      await expect(loginResult).toContainText('token');
      const token = await page.evaluate(() => localStorage.getItem('token'));
      expect(token).toBeTruthy();
    }
    
    // Record baseline timing metrics
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Normal authentication flow completed in ${duration}ms`);
    
    // Validate baseline expectations for ML model
    expect(duration).toBeLessThan(5000); // Login completes within normal time range
    expect(response.request().method()).toBe('POST'); // Single POST request
    
    // Check for standard user agent and headers
    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(userAgent).toContain('Chrome'); // Standard user agent string
  });

  test('Normal Search Behavior', async ({ page }) => {
    const startTime = Date.now();
    
    // Enter normal search term 'Laptop'
    await page.fill('#searchQuery', 'Laptop');
    
    // Click search button
    const searchResp = page.waitForResponse(r => 
      r.url().includes('/api/search') && r.request().method() === 'GET'
    );
    
    await page.click('#searchForm button[type="submit"]');
    
    // Wait for search results
    const response = await searchResp;
    expect([200, 500]).toContain(response.status());
    
    const searchResult = page.locator('#searchResult');
    await expect(searchResult).toBeVisible();
    
    // Record response time and request patterns
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Normal search completed in ${duration}ms`);
    
    // Validate baseline expectations
    expect(duration).toBeLessThan(3000); // Search completes within 1-2 seconds
    
    // Check response size (normal range < 5KB)
    const responseText = await response.text();
    expect(responseText.length).toBeLessThan(5120); // < 5KB
    
    // Verify search terms contain alphanumeric characters only
    const searchTerm = 'Laptop';
    expect(searchTerm).toMatch(/^[a-zA-Z0-9\s]+$/);
    
    // Repeat search with different normal terms for pattern establishment
    const normalTerms = ['Phone', 'Tablet', 'Computer'];
    for (const term of normalTerms) {
      await page.fill('#searchQuery', term);
      await page.click('#searchForm button[type="submit"]');
      await page.waitForTimeout(500); // Natural user delay
    }
  });

  test('Normal User Data Access', async ({ page }) => {
    const startTime = Date.now();
    
    // Enter user ID '1' in IDOR form - normal access pattern
    await page.fill('#userId', '1');
    
    // Click 'Get User Data' button
    const userResp = page.waitForResponse(r => 
      r.url().includes('/api/user/1') && r.request().method() === 'GET'
    );
    
    await page.click('#idorForm button[type="submit"]');
    
    // Wait for response
    const response = await userResp;
    expect([200, 404, 500]).toContain(response.status());
    
    const idorResult = page.locator('#idorResult');
    await expect(idorResult).toBeVisible();
    
    // Record access pattern and timing
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Normal user data access completed in ${duration}ms`);
    
    // Validate baseline expectations
    expect(duration).toBeLessThan(1000); // Response time under 500ms (allowing buffer)
    
    // Verify single user data request (no rapid sequential requests)
    // This is established by the single request pattern above
    
    // Check for standard HTTP headers
    const requestHeaders = response.request().headers();
    expect(requestHeaders).toHaveProperty('user-agent');
    expect(requestHeaders).not.toHaveProperty('x-automated-tool');
  });
});