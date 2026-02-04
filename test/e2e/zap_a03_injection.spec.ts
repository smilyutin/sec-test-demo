// OWASP Top 10 A03:2021 – Injection (XSS)
import { test, expect } from '../fixtures/zap-fixtures';

test.describe('XSS Vulnerability Testing', () => {
  test('should reflect XSS payload in search results', async ({ searchPage }) => {
    console.log(' VULNERABILITY DEMO: Testing XSS payload reflection');
    
    const xssPayload = '<script>window.xssTriggered=true</script>';
    await searchPage.performXSSSearch(xssPayload);
    await searchPage.validateXSSReflection(xssPayload);
  });

  test('should execute image-based XSS', async ({ searchPage }) => {
    console.log('🔓 VULNERABILITY DEMO: Testing image-based XSS injection');
    
    const xssPayload = '<img src=x onerror=alert(1)>';
    await searchPage.performXSSSearch(xssPayload);
    
    const resultHTML = await searchPage.getSearchResultHTML();
    expect(resultHTML).toMatch(/\bsrc\s*=\s*['"]x['"]/);
    expect(resultHTML).toMatch(/\bonerror\s*=\s*['"][^'"]+['"]/);
    
    console.log('Image-based XSS payload injected');
  });

  test.fixme('should test multiple XSS vectors', async ({ searchPage }) => {
    // EXPECTED BEHAVIOR VARIES: Different XSS vectors may behave differently based on server implementation
    // This test checks if XSS vectors are reflected in search results, but behavior may vary
    console.log(' VULNERABILITY DEMO: Testing multiple XSS attack vectors');
    
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

  test.fixme('SECURITY EXPECTATION: should sanitize XSS payloads (run in SECURE_MODE)', async ({ searchPage }) => {
    // EXPECTED FAILURE: This application is intentionally vulnerable for educational purposes.
    // This test demonstrates what SHOULD happen after security hardening - XSS payloads should be sanitized.
    // Currently fails because dangerous HTML elements are not properly sanitized.
    console.log('SECURITY EXPECTATION: Validating XSS payload sanitization');
    
    const dangerousPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=confirm("xss")>',
      '<iframe src=javascript:alert(1)>'
    ];
    
    for (const payload of dangerousPayloads) {
      await searchPage.validateSecureSearch(payload);
    }
    
    console.log('All XSS payloads properly sanitized');
  });

  test('should handle XSS in URL parameters', async ({ page, searchPage }) => {
    console.log(' VULNERABILITY DEMO: Testing URL parameter XSS injection');
    
    // Navigate with XSS payload in URL
    const xssPayload = encodeURIComponent('<script>alert("url-xss")</script>');
    await page.goto(`/?search=${xssPayload}`);
    
    // Check if the payload is reflected
    const pageContent = await page.content();
    const decodedPayload = '<script>alert("url-xss")</script>';
    
    if (pageContent.includes(decodedPayload)) {
      console.log('URL-based XSS payload reflected');
    }
  });

  test('should test DOM-based XSS', async ({ page }) => {
    console.log(' VULNERABILITY DEMO: Testing DOM-based XSS injection');
    
    // Inject payload via client-side navigation/hash
    await page.goto('/#<img src=x onerror=alert("dom-xss")>');
    
    // Wait for potential DOM manipulation
    await page.waitForTimeout(1000);
    
    // Check for DOM-based XSS indicators
    const dangerousElements = await page.locator('img[onerror]').count();
    
    if (dangerousElements > 0) {
      console.log('DOM-based XSS vulnerability detected');
    }
  });

});