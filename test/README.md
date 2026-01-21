# Security Testing with Playwright

This project uses **Playwright** for comprehensive security testing, organized similar to OWASP Juice Shop's test structure.

## Test Structure

```
test/
├── global-setup.ts            # Global Playwright setup (warm-up)
├── global-teardown.ts         # Global Playwright teardown
├── api/          # API endpoint tests (similar to Juice Shop's Frisby tests)
│   ├── api.spec.ts             # SQL injection & XSS API tests
│   ├── idor.spec.ts            # IDOR vulnerability tests
│   ├── authentication.spec.ts  # JWT & authentication bypass tests
│   └── vulnerabilities.spec.ts # Data exposure & mass assignment tests
└── e2e/          # End-to-end browser tests (similar to Juice Shop's Cypress tests)
    ├── login.spec.ts          # SQL injection via login form
    ├── search.spec.ts         # XSS via search form
    ├── idor.spec.ts           # IDOR via user data form
    ├── authentication.spec.ts # JWT manipulation via UI
    ├── sensitiveData.spec.ts  # Config exposure via UI
    ├── registration.spec.ts   # Mass assignment via registration form
    ├── xss.spec.ts            # Additional XSS tests
    └── vulnerabilities.spec.ts # Full exploit chains
```

## Running Tests

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Run all tests (API + E2E)
npm test

# Run only API tests
npm run test:api

# Run only E2E tests
npm run test:e2e

# Run with UI mode (interactive debugging)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# View HTML report
npm run test:report
```

## Test Categories

### API Tests (test/api/)
Direct HTTP requests to test API vulnerabilities:
- **api.spec.ts** - SQL injection in login/search endpoints (calls `/api/login` and `/api/search`)
- **idor.spec.ts** - User enumeration without authentication
- **authentication.spec.ts** - JWT forgery and weak verification
- **vulnerabilities.spec.ts** - Config exposure & privilege escalation

### E2E Tests (test/e2e/)
Browser-based tests for UI vulnerabilities:
- **xss.spec.ts** - Cross-site scripting attacks
- **vulnerabilities.spec.ts** - Full exploit chains via browser

## Global Setup/Teardown

This repo uses Playwright's `globalSetup`/`globalTeardown` (see `playwright.config.ts`) to warm up the app once at the start of a run and to clean up at the end.

## Why Playwright?

Compared to Juice Shop's Cypress + Frisby approach:
- **Single framework** - Playwright handles both API and E2E tests
- **Better performance** - Faster execution and parallel testing
- **Modern API** - Better TypeScript support and debugging tools
- **Cross-browser** - Test on Chromium, Firefox, and WebKit
- **API testing** - Native request context, no need for Frisby

## Test Output

Each test demonstrates:
```
✓ SQL Injection successful - Authentication bypassed
✓ IDOR vulnerability confirmed - Accessed user 1 data
✓ Admin bypass successful with forged JWT!
✓ XSS payload reflected in DOM
✓ Mass assignment successful - Registered as admin
```

## Similar to Juice Shop

This structure mirrors [OWASP Juice Shop's test organization](https://github.com/juice-shop/juice-shop):
- Separated API and E2E tests
- Descriptive test names with challenge context
- Console output showing successful exploits
- Similar test patterns and assertions
