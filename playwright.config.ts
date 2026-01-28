import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: './test/global-setup',
  globalTeardown: './test/global-teardown',
  testDir: './test',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'blob' : [['html'], ['json', { outputFile: 'test-results.json' }], ['list']],

  outputDir: './test-results',

  use: {
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },

  projects: [
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: 'http://localhost:3000',
        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
    },
    {
      name: 'chromium',
      testMatch: '**/e2e/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
        trace: 'off',
        screenshot: 'off',
        video: 'off',
      },
    },
    {
      name: 'ml-anomaly',
      testMatch: '**/ml-anomaly/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      metadata: {
        description: 'ML-based anomaly detection tests for security patterns',
        tags: ['ml', 'anomaly-detection', 'security']
      },
    },
  ],

  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
