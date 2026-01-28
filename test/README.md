# Security Testing with Playwright

This project uses **Playwright** for comprehensive security testing with advanced ML-based anomaly detection, organized similar to OWASP Juice Shop's test structure but with modern enterprise-grade architecture.

## Advanced Test Architecture

### Directory Structure
```
test/
├── global-setup.ts              # Global Playwright setup and app warm-up
├── global-teardown.ts           # Global Playwright teardown and cleanup
├── seed.spec.ts                 # Test data initialization and seeding
├── fixtures/                    # Shared test infrastructure
│   ├── e2e-fixtures.ts         # Browser-based test fixtures and utilities
│   └── ml-anomaly-fixtures.ts  # ML anomaly detection test fixtures
├── pages/                       # Page Object Model (POM) classes
│   ├── HomePage.ts             # Homepage navigation and interactions
│   ├── LoginPage.ts            # Authentication flows and login
│   ├── RegistrationPage.ts     # User registration and validation
│   ├── SearchPage.ts           # Search functionality and XSS testing
│   ├── AdminPage.ts            # Admin panel operations and access
│   ├── IDORPage.ts             # IDOR vulnerability testing helpers
│   └── AnomalyDetectionAPI.ts  # ML anomaly detection API interface
├── utils/                       # Advanced testing utilities
│   ├── AttackPatternDetector.ts # ML-based attack pattern recognition
│   ├── BehaviorAnalyzer.ts     # User behavior analysis and profiling
│   ├── MLModelValidator.ts     # ML model performance validation
│   └── TrafficAnalyzer.ts      # Network traffic pattern analysis
├── api/                         # API-level security tests (fast feedback)
│   ├── api.spec.ts            # General API functionality and availability
│   ├── authentication.spec.ts # JWT vulnerabilities and auth bypass
│   ├── idor.spec.ts           # Insecure Direct Object Reference tests
│   └── vulnerabilities.spec.ts # Combined API vulnerability validation
├── e2e/                         # Browser-based security tests (realistic scenarios)
│   ├── authentication.spec.ts # Browser-based authentication flows and bypasses
│   ├── home.spec.ts           # Homepage functionality and smoke tests
│   ├── idor.spec.ts           # IDOR vulnerabilities via browser interface
│   ├── login.safe.spec.ts     # Safe login functionality (baseline)
│   ├── registration.spec.ts   # User registration, validation, and mass assignment
│   ├── search.spec.ts         # Search functionality with XSS demonstrations
│   ├── sensitiveData.spec.ts  # Sensitive data exposure testing
│   ├── vulnerabilities.spec.ts # Chained exploit demonstrations
│   └── xss.spec.ts            # Cross-site scripting attack validation
└── ml-anomaly/                  # ML-enhanced security testing
    ├── attack-patterns.spec.ts    # ML-based attack pattern detection
    ├── baseline-behavior.spec.ts  # Normal user behavior pattern establishment
    ├── behavioral-anomalies.spec.ts # Advanced behavioral anomaly detection
    ├── ml-validation.spec.ts      # ML model performance and accuracy validation
    ├── traffic-patterns.spec.ts   # Network traffic analysis and anomaly detection
    └── README.md                  # Comprehensive ML testing documentation
```

### Three-Tier Testing Strategy

This project implements a sophisticated three-tier testing approach that balances security validation with CI/CD safety:

#### 1. Baseline Tests (Always Safe for CI)
- **Purpose**: Functional validation and smoke testing
- **When**: Every commit, pull request, and CI build
- **Safety**: Contains no exploit code or unsafe operations
- **Examples**: Login flows, navigation, form submissions

#### 2. Security Expectation Tests (Post-Hardening Validation)
- **Purpose**: Validate that security fixes are working correctly
- **When**: After implementing security controls
- **Trigger**: `SECURE_MODE=1` environment variable
- **Examples**: XSS prevention, SQL injection mitigation, proper authorization

#### 3. Vulnerability Demonstration Tests (Opt-in Only)
- **Purpose**: Controlled exploit demonstrations for educational purposes
- **When**: Manual execution only, never in CI
- **Trigger**: `RUN_VULN_TESTS=1` environment variable
- **Safety**: Explicit opt-in prevents accidental execution

### ML-Enhanced Security Testing

This project includes advanced ML-based anomaly detection capabilities:

- **Behavioral Analysis**: Detect unusual user interaction patterns
- **Attack Pattern Recognition**: ML-based identification of known exploit signatures
- **Real-time Monitoring**: Live traffic analysis and threat detection
- **Model Validation**: Performance benchmarks and accuracy metrics

## Comprehensive Test Execution Guide

```bash
# === INITIAL SETUP ===
npm install
npx playwright install

# === SAFE BASELINE TESTS (CI-friendly) ===
# Run all baseline tests (recommended for CI)
npm run test:e2e

# Run only API security tests (fast feedback)
npm run test:api

# Run ML anomaly detection tests
npm run test:ml-anomaly

# === DEVELOPMENT & DEBUGGING ===
# Interactive UI mode with debugging capabilities
npm run test:ui

# Run tests with visible browser (debugging mode)
npm run test:headed

# Run with comprehensive tracing for analysis
npm run test:debug

# Generate and view detailed HTML reports
npm run test:report

# === SECURITY TESTING (CONTROLLED ENVIRONMENTS ONLY) ===
# Run vulnerability demonstrations (NEVER in CI)
npm run test:vuln
# Equivalent to: RUN_VULN_TESTS=1 npx playwright test

# Run security expectation tests (post-hardening validation)
npm run test:secure
# Equivalent to: SECURE_MODE=1 npx playwright test

# === TARGETED TEST EXECUTION ===
# Run specific test suites
npx playwright test test/e2e/authentication.spec.ts
npx playwright test test/api/idor.spec.ts
npx playwright test test/ml-anomaly/

# Run tests matching specific patterns
npx playwright test --grep "SQL injection"
npx playwright test --grep "XSS"
npx playwright test --grep "authentication"

# Run tests with specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# === PERFORMANCE & MONITORING ===
# Run with performance monitoring
npx playwright test --reporter=json

# Run with custom timeout for complex tests
npx playwright test --timeout=60000

# Run tests in parallel (adjust workers as needed)
npx playwright test --workers=4
```

## Advanced Testing Features

### Page Object Model (POM) Architecture
Maintainable test code through object-oriented page interactions:

```typescript
// Example: LoginPage.ts provides reusable login methods
const loginPage = new LoginPage(page);
await loginPage.login('admin', 'password123');
await loginPage.verifySuccessfulLogin();

// SQL Injection testing with controlled payloads
await loginPage.attemptSQLInjection("admin' OR '1'='1'--");
```

### ML-Enhanced Anomaly Detection
Advanced threat detection using machine learning:

```typescript
// Behavioral analysis
const behaviorAnalyzer = new BehaviorAnalyzer();
const anomalyScore = await behaviorAnalyzer.analyzeUserBehavior(sessionData);

// Attack pattern recognition
const attackDetector = new AttackPatternDetector();
const threatLevel = await attackDetector.detectAttackPatterns(requestData);
```

### Comprehensive Test Fixtures
Shared utilities for consistent test execution:

```typescript
// E2E fixtures provide pre-configured page objects
test('SQL injection demo', async ({ loginPage, homePage }) => {
  await homePage.goto();
  await loginPage.performSQLInjectionAttack();
});

// ML anomaly fixtures provide analysis tools
test('behavioral anomaly detection', async ({ behaviorAnalyzer }) => {
  const anomalies = await behaviorAnalyzer.detectAnomalies(trafficData);
  expect(anomalies.length).toBeGreaterThan(0);
});
```

### Global Setup and Teardown
Efficient test execution with proper environment management:

- **Global Setup**: Application warm-up and initial data seeding
- **Global Teardown**: Cleanup and resource deallocation
- **Test Isolation**: Each test runs in a clean environment

## Testing Modes Deep Dive

This project intentionally separates **baseline tests**, **security expectations**, and **vulnerability demonstrations** for maximum safety and flexibility.

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

**CI Safety**: These exploit tests are **never run automatically in CI**. The GitHub Actions workflow intentionally omits `RUN_VULN_TESTS=1` to prevent accidental execution of exploit code in automated environments.

> WARNING: These tests are skipped by default and never run automatically in CI.

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

## CI/CD Integration Strategy

### GitHub Actions Configuration
The project includes sophisticated CI/CD integration that prioritizes safety:

```yaml
# .github/workflows/security-tests.yml example
name: Security Testing
on: [push, pull_request]
jobs:
  baseline-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install
      - name: Run baseline tests (CI-safe)
        run: npm run test:e2e
      # Note: SECURE_MODE and RUN_VULN_TESTS are intentionally omitted
```

### Environment Variable Safety
- **Default behavior**: Only baseline tests run
- **Explicit opt-in**: Security demonstrations require explicit environment variables
- **CI protection**: Exploit tests are never triggered accidentally

### Test Result Integration
- **HTML Reports**: Comprehensive test result visualization
- **Trace Files**: Detailed execution traces for debugging
- **JSON Output**: Machine-readable results for integration
- **Slack/Teams**: Automated notifications for test failures

## ML Model Integration

### Real-time Analysis Pipeline
```typescript
// Example: Integrating ML anomaly detection
const mlPipeline = {
  preprocessData: (rawRequest) => extractFeatures(rawRequest),
  detectAnomalies: (features) => mlModel.predict(features),
  scoreThreats: (anomalies) => calculateThreatLevel(anomalies),
  triggerResponse: (threatLevel) => securityResponse(threatLevel)
};
```

### Performance Benchmarks
- **Detection Latency**: < 100ms per request
- **Throughput**: 1000+ requests/minute
- **Accuracy**: > 95% detection rate
- **False Positives**: < 5% rate

## Troubleshooting Guide

### Common Issues and Solutions

#### Test Execution Problems
```bash
# Browser installation issues
npx playwright install --force

# Port conflicts
PORT=3001 npm run test:e2e

# Timeout issues with complex tests
npx playwright test --timeout=60000
```

#### ML Model Issues
```bash
# Model validation failures
DEBUG=ml-anomaly npm run test:ml-anomaly

# Performance degradation
npx playwright test test/ml-anomaly --workers=1
```

#### Security Test Gating
```bash
# Accidentally running exploit tests
unset RUN_VULN_TESTS
npm run test:e2e  # Now runs safely

# Validating security fixes
SECURE_MODE=1 npm run test:secure
```

### Debug Mode Options
```bash
# Enable comprehensive logging
DEBUG=pw:api npm run test:debug

# Visual debugging with inspector
npx playwright test --debug

# Generate traces for analysis
npx playwright test --trace=on
```

### Performance Optimization
```bash
# Adjust parallel execution
npx playwright test --workers=2

# Run specific browser only
npx playwright test --project=chromium

# Skip time-intensive ML tests during development
npx playwright test --grep-invert "ML anomaly"
```
