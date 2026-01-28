import { test, expect } from '../fixtures/e2e-fixtures';

test.describe('XSS Vulnerability Testing', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should reflect XSS payload in search results', async ({ searchPage }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const xssPayload = '<script>window.xssTriggered=true</script>';
    await searchPage.performXSSSearch(xssPayload);
    await searchPage.validateXSSReflection(xssPayload);
  });

  test('should execute image-based XSS', async ({ searchPage }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const xssPayload = '<img src=x onerror=alert(1)>';
    await searchPage.performXSSSearch(xssPayload);
    
    const resultHTML = await searchPage.getSearchResultHTML();
    expect(resultHTML).toMatch(/\bsrc\s*=\s*['"]x['"]/);
    expect(resultHTML).toMatch(/\bonerror\s*=\s*['"][^'"]+['"]/);
    
    console.log('✓ Image-based XSS payload injected');
  });

  test('should test multiple XSS vectors', async ({ searchPage }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const vectors = [
      '<svg/onload=alert(1)>',
      '<iframe src=javascript:alert(1)>',
      '<body onload=alert(1)>'
    ];
    
    const results = await searchPage.testMultipleXSSVectors(vectors);
    
    // Validate at least one vector was reflected
    const reflectedVectors = results.filter(r => r.reflected);
    expect(reflectedVectors.length).toBeGreaterThan(0);
  });

  test('SECURITY EXPECTATION: should sanitize XSS payloads (run in SECURE_MODE)', async ({ searchPage }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const dangerousPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=confirm("xss")>',
      '<iframe src=javascript:alert(1)>'
    ];
    
    for (const payload of dangerousPayloads) {
      await searchPage.validateSecureSearch(payload);
    }
    
    console.log('✓ All XSS payloads properly sanitized');
  });

  test('should handle XSS in URL parameters', async ({ page, searchPage }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    // Navigate with XSS payload in URL
    const xssPayload = encodeURIComponent('<script>alert("url-xss")</script>');
    await page.goto(`/?search=${xssPayload}`);
    
    // Check if the payload is reflected
    const pageContent = await page.content();
    const decodedPayload = '<script>alert("url-xss")</script>';
    
    if (pageContent.includes(decodedPayload)) {
      console.log('✓ URL-based XSS payload reflected');
    }
  });

  test('should test DOM-based XSS', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    // Inject payload via client-side navigation/hash
    await page.goto('/#<img src=x onerror=alert("dom-xss")>');
    
    // Wait for potential DOM manipulation
    await page.waitForTimeout(1000);
    
    // Check for DOM-based XSS indicators
    const dangerousElements = await page.locator('img[onerror]').count();
    
    if (dangerousElements > 0) {
      console.log('✓ DOM-based XSS vulnerability detected');
    }
  });

});
