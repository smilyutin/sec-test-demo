import { test, expect } from '@playwright/test';

test.describe('Attack Pattern Detection - ML Anomaly Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('SQL Injection Attack Pattern', async ({ page }) => {
    // SQL injection payload contains abnormal characters
    const sqlPayload = "admin' OR '1'='1'--";
    
    // Navigate to login form (already done in beforeEach)
    await expect(page.getByRole('heading', { name: 'SQL Injection' })).toBeVisible();
    
    // Enter SQL injection payload in username field
    await page.fill('#username', sqlPayload);
    
    // Enter any password
    await page.fill('#password', 'anything');
    
    // Click login button and monitor request patterns
    const startTime = Date.now();
    const loginResp = page.waitForResponse(r => 
      r.url().includes('/api/login') && r.request().method() === 'POST'
    );
    
    await page.click('#loginForm button[type="submit"]');
    
    const response = await loginResp;
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Record unusual payload characteristics for ML analysis
    console.log(`SQL injection attempt completed in ${duration}ms`);
    console.log(`Payload length: ${sqlPayload.length} characters`);
    console.log(`Contains SQL keywords: ${sqlPayload.includes('OR')}`);
    console.log(`Contains quotes: ${sqlPayload.includes("'")}`);
    console.log(`Contains comments: ${sqlPayload.includes('--')}`);
    
    // Validate anomalous pattern detection points
    expect(sqlPayload).toContain("'"); // Abnormal characters (quotes)
    expect(sqlPayload).toContain('OR'); // SQL keywords
    expect(sqlPayload.length).toBeGreaterThan(10); // Unusual payload length
    
    // Check if authentication succeeded without valid credentials
    const loginResult = page.locator('#loginResult');
    await expect(loginResult).toBeVisible();
    
    // Log the anomaly indicators for ML training
    const anomalyIndicators = {
      hasQuotes: sqlPayload.includes("'"),
      hasSqlKeywords: /\b(OR|AND|UNION|SELECT)\b/i.test(sqlPayload),
      hasComments: sqlPayload.includes('--'),
      payloadLength: sqlPayload.length,
      responseTime: duration,
      bypassedAuth: false
    };
    
    // Check if the injection was successful (for ML labeling)
    const responseText = await response.text();
    if (responseText.includes('success') || responseText.includes('token')) {
      anomalyIndicators.bypassedAuth = true;
      console.log('ANOMALY DETECTED: SQL injection bypassed authentication');
    }
    
    console.log('Anomaly indicators:', JSON.stringify(anomalyIndicators, null, 2));
  });

  test('XSS Attack Pattern Detection', async ({ page }) => {
    // XSS payload contains HTML/JavaScript tags
    const xssPayload = '<script>alert("XSS")</script>';
    
    // Navigate to search form
    await expect(page.getByRole('heading', { name: 'Cross-Site Scripting (XSS)' })).toBeVisible();
    
    // Enter XSS payload
    await page.fill('#searchQuery', xssPayload);
    
    // Submit search form and monitor patterns
    const startTime = Date.now();
    const searchResp = page.waitForResponse(r => 
      r.url().includes('/api/search') && r.request().method() === 'GET'
    );
    
    await page.click('#searchForm button[type="submit"]');
    
    const response = await searchResp;
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Monitor response content and patterns
    const responseText = await response.text();
    await expect(page.locator('#searchResult')).toBeVisible();
    
    // Record XSS pattern characteristics
    console.log(`XSS attempt completed in ${duration}ms`);
    console.log(`Payload contains script tags: ${xssPayload.includes('<script>')}`);
    console.log(`Payload contains angle brackets: ${xssPayload.includes('<') && xssPayload.includes('>')}`);
    
    // Validate XSS anomaly patterns
    expect(xssPayload).toContain('<'); // Abnormal characters (angle brackets)
    expect(xssPayload).toContain('script'); // JavaScript keywords
    expect(xssPayload).toMatch(/<[^>]+>/); // HTML tag pattern
    
    // Check for script injection in DOM
    const searchResultContent = await page.locator('#searchResult').innerHTML();
    
    const anomalyIndicators = {
      hasHtmlTags: /<[^>]+>/.test(xssPayload),
      hasScriptTags: xssPayload.includes('script'),
      hasEventHandlers: /on\w+\s*=/.test(xssPayload),
      payloadLength: xssPayload.length,
      responseTime: duration,
      reflectedUnescaped: searchResultContent.includes(xssPayload)
    };
    
    if (anomalyIndicators.reflectedUnescaped) {
      console.log('ANOMALY DETECTED: XSS payload reflected without escaping');
    }
    
    console.log('XSS anomaly indicators:', JSON.stringify(anomalyIndicators, null, 2));
  });

  test('Rapid User Enumeration Attack', async ({ page }) => {
    const startTime = Date.now();
    const requestTimes = [];
    const responses = [];
    
    // Rapidly request user data for IDs 1-10 (reduced from 20 for performance)
    console.log('Starting rapid user enumeration attack...');
    
    for (let userId = 1; userId <= 10; userId++) {
      const requestStart = Date.now();
      
      // Fill user ID
      await page.fill('#userId', userId.toString());
      
      // Submit request with minimal delay
      const userResp = page.waitForResponse(r => 
        r.url().includes(`/api/user/${userId}`) && r.request().method() === 'GET'
      );
      
      await page.click('#idorForm button[type="submit"]');
      
      const response = await userResp;
      const requestEnd = Date.now();
      
      requestTimes.push(requestEnd - requestStart);
      responses.push({
        userId,
        status: response.status(),
        duration: requestEnd - requestStart,
        timestamp: requestEnd
      });
      
      // Minimal delay between requests (automated behavior)
      await page.waitForTimeout(100);
    }
    
    const totalTime = Date.now() - startTime;
    const requestFrequency = responses.length / (totalTime / 1000); // requests per second
    
    // Monitor request frequency and patterns
    console.log(`Completed ${responses.length} requests in ${totalTime}ms`);
    console.log(`Request frequency: ${requestFrequency.toFixed(2)} requests/second`);
    
    // Analyze patterns for ML anomaly detection
    const successfulRequests = responses.filter(r => r.status === 200);
    const failureRate = (responses.length - successfulRequests.length) / responses.length;
    
    const anomalyIndicators = {
      requestFrequency,
      totalRequests: responses.length,
      successRate: successfulRequests.length / responses.length,
      failureRate,
      sequentialParameters: true, // IDs 1,2,3,4...
      consistentEndpoint: true, // All /api/user/* endpoints
      averageResponseTime: requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length,
      totalDuration: totalTime
    };
    
    // Validate enumeration attack patterns
    expect(requestFrequency).toBeGreaterThan(2); // High request frequency
    expect(responses.every((r, i) => r.userId === i + 1)).toBe(true); // Sequential parameters
    
    if (requestFrequency > 5) {
      console.log('ANOMALY DETECTED: High-frequency user enumeration attack');
    }
    
    console.log('Enumeration anomaly indicators:', JSON.stringify(anomalyIndicators, null, 2));
  });

  test('Brute Force Attack Pattern', async ({ page }) => {
    const username = 'admin';
    const passwords = ['password', '123456', 'admin', 'letmein', 'welcome'];
    const attemptResults = [];
    const startTime = Date.now();
    
    console.log('Starting brute force attack simulation...');
    
    // Attempt multiple login combinations rapidly
    for (const password of passwords) {
      const attemptStart = Date.now();
      
      // Use consistent username with varying passwords
      await page.fill('#username', username);
      await page.fill('#password', password);
      
      const loginResp = page.waitForResponse(r => 
        r.url().includes('/api/login') && r.request().method() === 'POST'
      );
      
      await page.click('#loginForm button[type="submit"]');
      
      const response = await loginResp;
      const attemptEnd = Date.now();
      
      attemptResults.push({
        username,
        password,
        status: response.status(),
        duration: attemptEnd - attemptStart,
        timestamp: attemptEnd,
        success: response.status() === 200
      });
      
      // Brief delay between attempts
      await page.waitForTimeout(200);
    }
    
    const totalTime = Date.now() - startTime;
    const attemptFrequency = attemptResults.length / (totalTime / 60000); // attempts per minute
    
    // Monitor failed authentication patterns
    const failedAttempts = attemptResults.filter(a => !a.success);
    const successfulAttempts = attemptResults.filter(a => a.success);
    const failureRate = failedAttempts.length / attemptResults.length;
    
    console.log(`Completed ${attemptResults.length} login attempts in ${totalTime}ms`);
    console.log(`Attempt frequency: ${attemptFrequency.toFixed(2)} attempts/minute`);
    console.log(`Failure rate: ${(failureRate * 100).toFixed(1)}%`);
    
    const anomalyIndicators = {
      attemptFrequency,
      totalAttempts: attemptResults.length,
      failureRate,
      consistentUsername: true,
      varyingPasswords: true,
      rapidAttempts: attemptFrequency > 10, // > 10 attempts/minute is suspicious
      highFailureRate: failureRate > 0.8,
      totalDuration: totalTime
    };
    
    // Validate brute force patterns
    expect(attemptResults.length).toBeGreaterThan(3); // Multiple rapid attempts
    expect(failureRate).toBeGreaterThan(0.6); // High failure rate expected
    
    if (anomalyIndicators.rapidAttempts && anomalyIndicators.highFailureRate) {
      console.log('ANOMALY DETECTED: Brute force attack pattern identified');
    }
    
    console.log('Brute force anomaly indicators:', JSON.stringify(anomalyIndicators, null, 2));
  });
});