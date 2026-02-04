# Project Documentation

##  Table of Contents

- [ Architecture Overview](#architecture-overview)
- [ Testing Framework](#testing-framework)  
- [ Reporting System](#reporting-system)
- [ CI/CD Pipeline](#cicd-pipeline)
- [ Development Workflow](#development-workflow)
- [ API Reference](#api-reference)

##  Architecture Overview

### Core Technologies
- **Backend**: Node.js + Express.js (intentionally vulnerable)
- **Testing**: Playwright + TypeScript
- **ML Integration**: Custom anomaly detection algorithms
- **Reporting**: Allure + Playwright HTML + Custom dashboards
- **CI/CD**: GitHub Actions + GitHub Pages

### Security Testing Approach
```
┌─────────────────────────────────────────────────────────────┐
│                    Security Testing Pipeline                │
├─────────────────────────────────────────────────────────────┤
│  🟢 Baseline Tests     │  🟡 Security Tests  │  🔴 Vuln Demo  │
│  • Functional tests    │  • OWASP Top 10     │  • Exploit PoC  │
│  • API validation      │  • Security headers  │  • Attack chains│
│  • Safe CI/CD          │  • Auth bypasses    │  • Edu only     │
├─────────────────────────────────────────────────────────────┤
│  🤖 ML Enhancement     │  📊 Multi Reports   │  🔍 Deep Analysis│
│  • Pattern detection   │  • Allure dashboard │  • Root cause   │
│  • Behavioral analysis │  • HTML reports     │  • Trends       │
│  • Anomaly scoring     │  • JSON export      │  • History      │
└─────────────────────────────────────────────────────────────┘
```

##  Testing Framework

### Test Organization
```
test/
├──  api/           # Fast API-level security validation  
├──  e2e/           # Comprehensive browser-based testing
├──  ml-anomaly/    # ML-powered security analysis
├──  fixtures/      # Shared test utilities & data
├──  pages/         # Page Object Model classes
└──  utils/         # Testing utilities & helpers
```

### Test Categories

####  **Baseline Tests** (Always Safe)
-  Functional validation
-  API contract testing  
-  Performance baselines
-  CI/CD friendly

####  **Security Expectation Tests** (Post-Hardening)
-  Security controls validation
-  Input sanitization checks
-  Access control verification
-  Safe for staging/production validation

####  **Vulnerability Demonstrations** (Educational Only)
-  Active exploit demonstrations
-  Attack chain reproductions
-  Security research
-  NEVER run in production

### Page Object Model
```typescript
// Example: LoginPage.ts
export class LoginPage {
  async login(username: string, password: string) {...}
  async attemptSQLInjection(payload: string) {...}
  async verifyLoginRejected() {...}
  async validateSecureLogin() {...}
}
```

## 📊 Reporting System

### Report Types

| Type | Technology | Java Required | Use Case |
|------|------------|---------------|----------|
| **Playwright HTML** | Native Playwright | ❌ | Development, debugging, traces |
| **Simple Allure** | Custom HTML generator | ❌ | Quick overview, CI artifacts |
| **Full Allure** | Allure Framework | ☕ | Enterprise reporting, trends |
| **JSON Export** | Native JSON | ❌ | Automation, data analysis |
| **Test Dashboard** | Custom HTML | ❌ | Executive overview |

### Report Features

####  **Playwright HTML Reports**
-  Video recordings of failures
-  Step-by-step trace viewer  
-  Network activity logs
-  Screenshots at each step
-  Console output capture

####  **Allure Reports**
-  Test execution trends
-  Test categorization & tagging
-  Flaky test detection
-  Custom attachments
-  Historical data retention

####  **Test Dashboard**
-  Executive summary
-  Quick report navigation
-  Real-time statistics
-  Security coverage matrix

##  CI/CD Pipeline

### GitHub Actions Workflows

#### 1. **Security Testing** (`.github/workflows/security.yml`)
```yaml
Triggers: Push, PR, Schedule (daily 2AM UTC)
Steps:
   Checkout & setup Node.js
   Install dependencies & browsers  
   Security audit (npm audit)
   Run Playwright security tests
   Generate multiple report formats
   Upload artifacts (30-day retention)
   Trivy vulnerability scanning
```

#### 2. **Allure Report Deployment** (`.github/workflows/allure-report.yml`)  
```yaml
Triggers: Security workflow completion
Steps:
   Download test artifacts
   Setup Java for Allure CLI
   Generate Allure reports with history
   Deploy to GitHub Pages
   Update report history (90-day retention)
```

### Artifact Management
- **Test Reports**: 30-day retention
- **Allure History**: 90-day retention  
- **Failure Screenshots**: 7-day retention
- **GitHub Pages**: Live deployment with history

##  Development Workflow

### Local Development Setup
```bash
# 1. Initial setup
git clone <repo-url>
cd juice-shop
npm install
npx playwright install --with-deps

# 2. Start development server
npm start  # Application at http://localhost:3000

# 3. Run tests during development
npm run test:ui      # Interactive test runner
npm run test:report  # Generate & view reports
```

### Test Development Guidelines

####  **Best Practices**
- Use Page Object Model for maintainability
- Implement proper wait strategies  
- Add meaningful test descriptions
- Include security context in test names
- Use fixtures for common test setup

####  **Avoid**
- Hard-coded waits (`page.waitForTimeout()`)
- Accessing elements by position
- Testing implementation details
- Running vulnerable tests in CI

### Code Organization
```
├── Fixtures/        # Shared test utilities
│   └── Base fixtures with common page objects
├── Pages/           # Page Object Model  
│   └── One class per major page/component
├── Tests/           # Test specifications
│   └── Organized by security category
└── Utils/           # Helper functions
    └── Security testing utilities
```

##  API Reference

### NPM Scripts

#### Core Testing
```bash
npm test                    # Run all baseline tests
npm run test:api           # API security tests only  
npm run test:e2e           # Browser security tests only
npm run test:ml-anomaly    # ML-enhanced testing
npm run test:all           # Complete test suite
```

#### Report Generation  
```bash
npm run test:report          # Playwright HTML report
npm run test:allure-simple   # Java-free Allure-style report
npm run test:allure          # Full Allure report (requires Java)
npm run test:allure-open     # Generate & open Allure report
npm run test:allure-serve    # Live Allure server
npm run test:results         # JSON results export
npm run test:dashboard       # Test dashboard generator
```

#### Development Tools
```bash
npm run test:ui            # Interactive test runner
npm start                  # Start vulnerable application  
npm run dev                # Start with auto-restart
```

### Environment Variables

| Variable | Purpose | Values | Default |
|----------|---------|---------|---------|
| `CI` | Enables CI-specific behavior | `true/false` | `false` |
| `SECURE_MODE` | Runs security expectation tests | `1` | unset |
| `RUN_VULN_TESTS` | Enables vulnerability demos | `1` | unset |
| `STAGING_URL` | Override base URL for tests | URL | `http://localhost:3000` |

### Test Configuration

#### Playwright Config (`playwright.config.ts`)
```typescript
{
  projects: ['api', 'chromium', 'ml-anomaly', 'security'],
  reporter: [
    'html',                    // Always enabled  
    'allure-playwright',       // If available
    'json'                     // For automation
  ],
  retries: process.env.CI ? 2 : 0,
  workers: 1                   // Security tests need isolation
}
```

#### Report Configuration (`allure.config.json`)
```json
{
  "categories": [
    { "name": "Security Vulnerabilities", "matchedStatuses": ["failed"] },
    { "name": "Infrastructure Issues", "messageRegex": ".*timeout.*" }
  ],
  "environment": {
    "Stand": "Local/CI",
    "Browser": "Chrome", 
    "Framework": "Playwright"
  }
}
```

---

##  Quick Reference Card

###  **Start Here**
```bash
npm install && npx playwright install --with-deps
npm start                    # Start app
npm test                     # Run tests  
npm run test:report         # View results
```

###  **View Reports**
- **Dashboard**: `http://localhost:3000/test-dashboard.html`
- **Playwright**: `playwright-report/index.html`  
- **Simple Allure**: `allure-report-simple/index.html`
- **Full Allure**: `allure-report/index.html` (requires Java)

###  **Development**
- **Interactive Testing**: `npm run test:ui`
- **Debug Mode**: Add `await page.pause()` in tests
- **Network Logs**: Check browser dev tools during test runs
- **Screenshots**: Automatically captured on failures

###  **Security Notes**
-  Safe tests: `npm test`
-  Security validation: `SECURE_MODE=1 npm test`  
-  Vulnerability demos: `RUN_VULN_TESTS=1 npm test` (education only)

---

*For detailed setup instructions, see the main [README.md](README.md)*