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
│   ├── ml-anomaly-fixtures.ts  # ML anomaly detection test fixtures
│   └── zap-fixtures.ts         # ZAP suite fixtures and payload helpers
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
│   ├── home.spec.ts           # Homepage functionality and smoke tests
│   ├── login.safe.spec.ts     # Safe login functionality (baseline)
│   ├── registration.spec.ts   # User registration, validation, and mass assignment
│   ├── search.spec.ts         # Search baseline + secure expectations + opt-in DOM XSS demo
│   ├── vulnerabilities.spec.ts # Placeholder (chain moved; spec is skipped)
│   ├── zap_a01_broken_access_control.spec.ts      # OWASP A01
│   ├── zap_a02_cryptographic_failures.spec.ts     # OWASP A02 (config exposure)
│   ├── zap_a03_injection.spec.ts                  # OWASP A03 (XSS)
│   ├── zap_a03_sql_injection.spec.ts             # OWASP A03 (SQLi)
│   ├── zap_a04_insecure_design.spec.ts           # OWASP A04
│   ├── zap_a05_security_misconfiguration.spec.ts # OWASP A05
│   ├── zap_a06_vulnerable_components.spec.ts     # OWASP A06
│   ├── zap_a07_identification_authentication_failures.spec.ts # OWASP A07
│   ├── zap_a08_software_data_integrity_failures.spec.ts       # OWASP A08
│   ├── zap_a09_security_logging_monitoring_failures.spec.ts   # OWASP A09
│   ├── zap_a10_server_side_request_forgery.spec.ts           # OWASP A10
│   └── zap_workflow_chain.spec.ts # Canonical chained workflow demo (single scenario)
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
# Equivalent to: RUN_VULN_TESTS=1 npm test

# Run security expectation tests (post-hardening validation)
npm run test:secure
# Equivalent to: SECURE_MODE=1 npm test

# === TARGETED TEST EXECUTION ===
# Run specific test suites
npx playwright test test/e2e/login.safe.spec.ts
npx playwright test test/e2e/zap_a03_sql_injection.spec.ts
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
# or: SECURE_MODE=1 npm test
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
# or: RUN_VULN_TESTS=1 npm test
```

Enabled by:
- `RUN_VULN_TESTS=1`

**CI Safety**: The most explicit exploit-style demos are guarded behind `RUN_VULN_TESTS=1`. CI should run only baseline suites unless you intentionally opt-in.

## Test Categories

### API Tests (test/api/)
Direct HTTP requests to test API vulnerabilities:
- **api.spec.ts** - `/api/search` injection probing (SQLi-style payload)
- **idor.spec.ts** - IDOR and user enumeration (`/api/user/:id`)
- **authentication.spec.ts** - Broken JWT verification / forged token access (`/api/admin`)
- **vulnerabilities.spec.ts** - Mass assignment role escalation (`/api/register`)

### E2E Tests (test/e2e/)
Browser-based tests for UI vulnerabilities:
- **home.spec.ts** - Smoke and UI wiring tests
- **login.safe.spec.ts** - Normal login flows + token storage baseline
- **search.spec.ts** - Search baseline + secure expectations + opt-in DOM XSS demo
- **registration.spec.ts** - Mass assignment baseline and demonstration
- **zap_* suites** - Canonical OWASP Top 10 vulnerability demos and expectations
- **zap_workflow_chain.spec.ts** - Single canonical chained workflow demo

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
npm run test:secure
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
