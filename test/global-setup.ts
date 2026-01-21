import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';

const STATE_DIR = path.join(process.cwd(), '.playwright');
const STATE_FILE = path.join(STATE_DIR, 'global-browser.json');

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch({ headless: true });

  // Warm up the app once so early connection issues fail fast.
  const baseURL =
    (config.projects[0]?.use as any)?.baseURL ??
    process.env.PLAYWRIGHT_BASE_URL ??
    'http://localhost:3000';

  const page = await browser.newPage();
  await page.goto(String(baseURL));
  await page.close();

  // Keep the browser open for the duration of the run.
  (globalThis as any).__GLOBAL_BROWSER__ = browser;

  // The Playwright Browser object does not expose a process or pid.
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(
      {
        browserVersion: await browser.version(),
      },
      null,
      2
    ),
    'utf-8'
  );
}
