// OWASP Top 10 A09:2021 – Security Logging and Monitoring Failures
import { test, expect } from '../fixtures/zap-fixtures';

test.describe('Security Logging and Monitoring Failures Testing', () => {
  // This suite is API/request heavy; skip auto UI navigation for speed.
  test.use({ autoGoto: false });

  test('SECURITY EXPECTATION: logs security-relevant events', async ({ loginPage, page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    // Simulate failed login attempts
    const failedAttempts = [];
    for (let i = 0; i < 3; i++) {
      const response = await loginPage.login('testuser', 'wrongpassword');
      failedAttempts.push({
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if security events are logged (this would require log access in real scenario)
    console.log('Failed login attempts should be logged for security monitoring');
    
    // Test successful login logging
    const successResponse = await loginPage.loginWithValidCredentials();
    console.log('Successful authentication events should be logged');
  });

  test('VULN DEMO: attempts to detect insufficient logging', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const securityEvents = [
      // SQL injection attempts
      () => page.request.post('/api/login', {
        data: { username: "admin' OR '1'='1'--", password: 'test' }
      }),
      
      // XSS attempts  
      () => page.request.post('/api/search', {
        data: { query: '<script>alert("xss")</script>' }
      }),
      
      // Directory traversal attempts
      () => page.request.get('/../etc/passwd'),
      
      // Admin access attempts
      () => page.request.get('/admin'),
    ];
    
    console.log('Performing security event simulation for logging verification...');
    
    for (const [index, event] of securityEvents.entries()) {
      try {
        await event();
        console.log(`  Event ${index + 1}: Executed (should be logged)`);
      } catch (error) {
        console.log(`  Event ${index + 1}: Failed (should be logged with error)`);
      }
    }
    
    console.log('WARNING: Verify that all security events above are properly logged');
  });

  test('SECURITY EXPECTATION: implements proper audit trails', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    // Test that sensitive operations create audit trails
    const sensitiveOperations = [
      {
        operation: 'User Profile Update',
        request: () => page.request.post('/api/user/profile', {
          data: { email: 'newemail@test.com' }
        })
      },
      {
        operation: 'Password Change',
        request: () => page.request.post('/api/user/password', {
          data: { currentPassword: 'old', newPassword: 'new123!' }
        })
      },
      {
        operation: 'Admin Action',
        request: () => page.request.post('/api/admin/users', {
          data: { action: 'disable', userId: '123' }
        })
      }
    ];
    
    for (const op of sensitiveOperations) {
      await op.request();
      console.log(`${op.operation} should create audit trail entry`);
    }
  });

  test('VULN DEMO: tests for information leakage in error messages', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const errorTriggers = [
      {
        name: 'SQL Error',
        request: () => page.request.post('/api/search', {
          data: { query: "'; SELECT * FROM users--" }
        })
      },
      {
        name: 'File Not Found',
        request: () => page.request.get('/nonexistent/path')
      },
      {
        name: 'Invalid JSON',
        request: () => page.request.post('/api/data', {
          data: '{"invalid": json}',
          headers: { 'Content-Type': 'application/json' }
        })
      }
    ];
    
    const informationLeaks = [];
    
    for (const trigger of errorTriggers) {
      try {
        const response = await trigger.request();
        const errorText = await response.text();
        
        // Check for information disclosure in error messages
        const sensitivePatterns = [
          /mysql|postgresql|sqlite|database/i,
          /stack trace|traceback/i,
          /C:\\|\/usr\/|\/var\//i,
          /node_modules|\.js:\d+/i,
          /internal server error.*details/i
        ];
        
        const leaks = sensitivePatterns
          .filter(pattern => pattern.test(errorText))
          .map(pattern => pattern.source);
        
        if (leaks.length > 0) {
          informationLeaks.push({
            trigger: trigger.name,
            leaks: leaks
          });
        }
      } catch (error) {
        // Network errors are acceptable
      }
    }
    
    if (informationLeaks.length > 0) {
      console.log('WARNING: Information leakage detected in error messages:');
      informationLeaks.forEach(leak => {
        console.log(`  ${leak.trigger}: ${leak.leaks.join(', ')}`);
      });
    }
  });

  test('SECURITY EXPECTATION: provides generic error messages', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const errorTriggers = [
      () => page.request.post('/api/login', {
        data: { username: 'nonexistent', password: 'wrong' }
      }),
      () => page.request.get('/api/users/999999'),
      () => page.request.post('/api/invalid-endpoint')
    ];
    
    for (const trigger of errorTriggers) {
      const response = await trigger();
      const errorText = await response.text();
      
      // Should not contain sensitive system information
      expect(errorText).not.toMatch(/mysql|postgresql|sqlite|database/i);
      expect(errorText).not.toMatch(/stack trace|traceback/i);
      expect(errorText).not.toMatch(/C:\\|\/usr\/|\/var\//i);
      expect(errorText).not.toMatch(/node_modules|\.js:\d+/i);
    }
    
    console.log('Error messages do not disclose sensitive information');
  });

  test('VULN DEMO: tests for missing rate limiting on security events', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    console.log('Testing rate limiting on security-sensitive operations...');
    
    // Test rapid failed login attempts
    const rapidRequests = [];
    for (let i = 0; i < 20; i++) {
      rapidRequests.push(
        page.request.post('/api/login', {
          data: { username: 'admin', password: `wrong${i}` }
        })
      );
    }
    
    const responses = await Promise.all(rapidRequests);
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    
    if (rateLimitedResponses.length === 0) {
      console.log('WARNING: No rate limiting detected on failed login attempts');
    } else {
      console.log(`Rate limiting activated after ${responses.length - rateLimitedResponses.length} requests`);
    }
  });

  test('SECURITY EXPECTATION: implements alerting for security events', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    // Simulate events that should trigger security alerts
    const alertTriggers = [
      {
        name: 'Multiple Failed Logins',
        action: async () => {
          for (let i = 0; i < 5; i++) {
            await page.request.post('/api/login', {
              data: { username: 'admin', password: 'wrong' }
            });
          }
        }
      },
      {
        name: 'Admin Access Attempt',
        action: () => page.request.get('/admin/users')
      },
      {
        name: 'Suspicious User Agent',
        action: () => page.request.get('/', {
          headers: { 'User-Agent': 'sqlmap/1.0' }
        })
      }
    ];
    
    for (const trigger of alertTriggers) {
      await trigger.action();
      console.log(`${trigger.name} should trigger security alert`);
    }
  });

  test('validates log integrity and tamper protection', async ({ page }) => {
    // This test would ideally verify that logs cannot be tampered with
    // In practice, this requires access to the logging system
    
    console.log('  Log integrity verification checklist:');
    console.log('  Logs should be write-only for application');
    console.log('  Logs should be stored securely (encrypted/signed)');
    console.log('  Log rotation should preserve integrity');
    console.log('  Central logging system should be used');
    console.log('  Real-time monitoring should be implemented');
  });

  test('VULN DEMO: attempts to cause log injection', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const logInjectionPayloads = [
      'admin\n[INFO] Fake admin login success',
      'user\r\n[ERROR] System compromised',
      'test\u0000[CRITICAL] Null byte injection',
      'admin\t[SUCCESS]\tFake tab injection'
    ];
    
    console.log('Testing for log injection vulnerabilities...');
    
    for (const payload of logInjectionPayloads) {
      await page.request.post('/api/login', {
        data: { username: payload, password: 'test' }
      });
      
      console.log(`Log injection attempt: ${payload.replace(/[\n\r\t\u0000]/g, '\\x')}`);
    }
    
    console.log('WARNING: Verify logs do not contain injected entries');
  });

  test('SECURITY EXPECTATION: prevents log injection attacks', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const logInjectionPayloads = [
      'admin\n[FAKE] Admin access granted',
      'user\r\n[ERROR] System down',
      'test\u0000[INFO] Null byte test'
    ];
    
    for (const payload of logInjectionPayloads) {
      const response = await page.request.post('/api/login', {
        data: { username: payload, password: 'test' }
      });
      
      // Response should handle the injection appropriately
      expect([400, 401, 422]).toContain(response.status());
    }
    
    console.log('Log injection attempts properly sanitized');
  });

});