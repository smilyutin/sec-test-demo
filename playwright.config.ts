import { defineConfig, devices } from '@playwright/test';

const APP_BASE_URL = process.env.STAGING_URL || 'http://localhost:3000';
const USE_EXTERNAL_SERVER = !!process.env.STAGING_URL;

// Check if allure-playwright is available
let hasAllureReporter = false;
try {
  require.resolve('allure-playwright');
  hasAllureReporter = true;
} catch (e) {
  console.warn('allure-playwright not installed. Install it with: npm install allure-playwright allure-commandline');
}

export default defineConfig({
  globalSetup: './test/global-setup',
  globalTeardown: './test/global-teardown',
  testDir: './test',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI 
    ? hasAllureReporter 
      ? [['html', { open: 'never' }], ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: 'Security Testing Suite' }], ['json', { outputFile: 'test-results.json' }]]
      : [['html', { open: 'never' }], ['json', { outputFile: 'test-results.json' }]]
    : hasAllureReporter
      ? [['html'], ['json', { outputFile: 'test-results.json' }], ['list'], ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: 'Security Testing Suite' }]]
      : [['html'], ['json', { outputFile: 'test-results.json' }], ['list']],

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
        baseURL: APP_BASE_URL,
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
        baseURL: APP_BASE_URL,
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
        baseURL: APP_BASE_URL,
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

  webServer: USE_EXTERNAL_SERVER
    ? undefined
    : {
        command: 'npm start',
        url: APP_BASE_URL,
        // In CI we may start the server in the workflow (health checks, etc.).
        // Reuse it if it's already listening to avoid port-in-use failures.
        reuseExistingServer: true,
        timeout: 120 * 1000,
      },
});
