# Security Testing with Playwright

This project uses **Playwright** for comprehensive security testing, organized similar to OWASP Juice Shop's test structure.

## Test Structure

```
test/
├── global-setup.ts            # Global Playwright setup (warm-up)
├── global-teardown.ts         # Global Playwright teardown
├── api/                       # API-level security tests
│   ├── login.spec.ts          # SQL injection & auth API tests
│   ├── idor.spec.ts           # IDOR API tests
│   ├── authentication.spec.ts # JWT verification weaknesses
│   └── sensitiveData.spec.ts  # Config / secret exposure tests
└── e2e/                       # Browser-based security tests
    ├── home.spec.ts           # Smoke & UI wiring tests
    ├── login.spec.ts          # Login baseline + SQLi demo
    ├── search.spec.ts         # Search baseline + XSS demo
    ├── idor.spec.ts           # IDOR baseline + demo
    ├── authentication.spec.ts # Broken auth via UI
    ├── registration.spec.ts   # Mass assignment baseline + demo
    ├── sensitiveData.spec.ts  # Config exposure baseline + demo
    └── vulnerabilities.spec.ts # Full exploit chains (opt-in only)
```

## Running Tests

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Run all baseline E2E tests
npm run test:e2e

# Run only API tests
npm run test:api

# Run with UI mode (interactive debugging)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# View HTML report
npm run test:report

# Run vulnerability demos (opt-in)
npm run test:vuln

# Run secure-behavior assertions (after fixes)
npm run test:secure
```

## Testing Modes

This project intentionally separates **baseline tests**, **security expectations**, and **vulnerability demonstrations**.

### 1) Baseline (default)
Safe tests that should always pass in CI.

```bash
npm run test:e2e
```

Includes:
- Smoke tests
- Normal login & registration flows
- API availability checks

---

### 2) Security Expectations (after hardening)
Assertions for *secure behavior*. These are expected to fail until the application is fixed.

```bash
npm run test:secure
```

Enabled by:
- `SECURE_MODE=1`

Examples:
- No XSS execution
- No secret leakage from `/api/config`

---

### 3) Vulnerability Demos (opt-in)
Intentional exploit demonstrations and chained attacks.

```bash
npm run test:vuln
```

Enabled by:
- `RUN_VULN_TESTS=1`

**⚠️ CI Safety**: These exploit tests are **never run automatically in CI**. The GitHub Actions workflow intentionally omits `RUN_VULN_TESTS=1` to prevent accidental execution of exploit code in automated environments.

> ⚠️ These tests are skipped by default and never run automatically in CI.

## Test Categories

### API Tests (test/api/)
Direct HTTP requests to test API vulnerabilities:
- **login.spec.ts** - SQL injection & authentication API tests
- **idor.spec.ts** - IDOR API tests
- **authentication.spec.ts** - JWT verification weaknesses
- **sensitiveData.spec.ts** - Config and secret exposure tests

### E2E Tests (test/e2e/)
Browser-based tests for UI vulnerabilities:
- **home.spec.ts** - Smoke and UI wiring tests
- **login.spec.ts** - Login baseline and SQL injection demonstration
- **search.spec.ts** - Search baseline and XSS demonstration
- **idor.spec.ts** - IDOR baseline and demonstration
- **authentication.spec.ts** - Broken authentication via UI
- **registration.spec.ts** - Mass assignment baseline and demonstration
- **sensitiveData.spec.ts** - Config exposure baseline and demonstration
- **vulnerabilities.spec.ts** - Full exploit chains (opt-in only)

## Global Setup/Teardown

This repo uses Playwright's `globalSetup`/`globalTeardown` (see `playwright.config.ts`) to warm up the app once at the start of a run and to clean up at the end.

## Why Playwright?

Compared to Juice Shop's Cypress + Frisby approach:
- **Single framework** - Playwright handles both API and E2E tests
- **Better performance** - Faster execution and parallel testing
- **Modern API** - Better TypeScript support and debugging tools
- **Cross-browser** - Test on Chromium, Firefox, and WebKit
- **API testing** - Native request context, no need for Frisby

## Test Output Philosophy

Baseline tests verify correct wiring and functionality.

Security expectation tests validate **how the system should behave once hardened**.

Vulnerability demo tests intentionally prove weaknesses for educational and portfolio purposes.

## CI / GitHub Actions

By default, GitHub Actions runs **baseline tests only**.

- `SECURE_MODE` is not set → secure expectations are skipped
- `RUN_VULN_TESTS` is not set → vulnerability demos are skipped

This ensures:
- CI remains green
- No exploit demonstrations run automatically
- Intentional test design is clear to reviewers

Vulnerability demos should only be run via manual workflows or local execution.
