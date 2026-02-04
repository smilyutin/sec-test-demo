// OWASP Top 10 A04:2021 – Insecure Design
import { test, expect } from '../fixtures/zap-fixtures';

test.describe('Insecure Design Testing', () => {
  test('VULN DEMO: business logic bypass in user registration', async ({ registrationPage }) => {
    console.log(' VULNERABILITY DEMO: Testing business logic bypass in user registration');
    
    // Test if user can register with admin role by manipulating request
    const response = await registrationPage.attemptRoleEscalation('newuser', 'password', 'admin');
    
    if (response.status() === 200) {
      const result = await response.json();
      if (result.role === 'admin') {
        console.log('WARNING: Business logic bypass - user registered with admin role');
      }
    }
  });

  test('VULN DEMO: workflow bypass in order process', async ({ page }) => {
    console.log(' VULNERABILITY DEMO: Testing workflow bypass in order process');
    
    await page.goto('/');
    
    // Attempt to skip payment step and directly access order confirmation
    const response = await page.request.post('/api/order/confirm', {
      data: {
        orderId: '12345',
        items: [{ id: 1, quantity: 1, price: 0 }],
        total: 0
      }
    });
    
    if (response.status() === 200) {
      console.log('WARNING: Workflow bypass - order confirmed without payment');
    }
  });

  test('VULN DEMO: insufficient anti-automation controls', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    // Test for rate limiting on sensitive operations
    const rapidRequests = [];
    
    for (let i = 0; i < 10; i++) {
      rapidRequests.push(
        page.request.post('/api/login', {
          data: { username: 'testuser', password: 'wrongpass' }
        })
      );
    }
    
    const responses = await Promise.all(rapidRequests);
    const successfulRequests = responses.filter(r => r.status() !== 429);
    
    if (successfulRequests.length === 10) {
      console.log('WARNING: No rate limiting detected - automation possible');
    }
  });

  test('SECURITY EXPECTATION: validates business logic constraints', async ({ registrationPage }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    // User should not be able to register with privileged roles
    const response = await registrationPage.attemptRoleEscalation('testuser', 'password', 'admin');
    
    expect([400, 403, 422]).toContain(response.status());
    
    const result = await response.json();
    expect(result.role || 'user').not.toBe('admin');
    
    console.log('Business logic constraints properly enforced');
  });

  test('SECURITY EXPECTATION: implements proper workflow controls', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    // Should not allow order confirmation without proper workflow
    const response = await page.request.post('/api/order/confirm', {
      data: {
        orderId: '99999',
        items: [{ id: 1, quantity: 1, price: 0 }],
        total: 0
      }
    });
    
    expect([400, 401, 403, 404]).toContain(response.status());
    
    console.log('Workflow controls prevent unauthorized order confirmation');
  });

  test('SECURITY EXPECTATION: implements rate limiting and anti-automation', async ({ page, zapUtils }) => {
    test.skip(!zapUtils.shouldRunSecureMode(), 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    // Use fixture utility to test rate limiting
    const rateLimitDetected = await zapUtils.testRateLimit(`${page.url()}/api/login`, 6);
    
    expect(rateLimitDetected).toBe(true);
    console.log('Rate limiting properly implemented');
  });

  test('validates proper error handling in business flows', async ({ page }) => {
    const invalidScenarios = [
      { endpoint: '/api/order', data: { items: [], total: -100 } },
      { endpoint: '/api/user/update', data: { id: 'invalid', role: 'super-admin' } },
      { endpoint: '/api/discount', data: { code: 'FREE100', discount: 100 } }
    ];
    
    for (const scenario of invalidScenarios) {
      const response = await page.request.post(scenario.endpoint, {
        data: scenario.data
      });
      
      // Should return proper error codes, not 200
      expect([400, 401, 403, 404, 422, 500]).toContain(response.status());
      
      const responseText = await response.text();
      // Should not expose internal system details
      expect(responseText).not.toMatch(/stack|trace|internal|database|sql/i);
    }
  });

  test('VULN DEMO: tests for logic flaws in discount system', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    // Test if multiple discount codes can be applied
    const response1 = await page.request.post('/api/apply-discount', {
      data: { code: 'SAVE10', cartTotal: 100 }
    });
    
    const response2 = await page.request.post('/api/apply-discount', {
      data: { code: 'SAVE20', cartTotal: 90 }
    });
    
    if (response1.status() === 200 && response2.status() === 200) {
      console.log('WARNING: Multiple discount codes can be applied');
    }
    
    // Test negative pricing
    const negativeResponse = await page.request.post('/api/order', {
      data: { 
        items: [{ id: 1, quantity: -5, price: 50 }],
        total: -250 
      }
    });
    
    if (negativeResponse.status() === 200) {
      console.log('WARNING: Negative pricing accepted');
    }
  });

});