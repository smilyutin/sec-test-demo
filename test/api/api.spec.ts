/* eslint-disable no-console */
import { test, expect } from '@playwright/test';

test.describe('/api/search', () => {
  test('GET search with SQL injection payload', async ({ request }) => {
    // `/api/search` is vulnerable to SQL injection via string concatenation in a LIKE clause.
    // Use a payload that closes the LIKE string and comments out the trailing `%`.
    const payload = "test%' OR '1'='1'--";
    const response = await request.get(`/api/search?q=${encodeURIComponent(payload)}`);
    expect(response.ok()).toBeTruthy();
    
    await response.json();
    console.log('Search injection executed');
  });
});
