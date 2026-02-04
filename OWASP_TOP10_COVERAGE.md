# OWASP ZAP Top 10 Test Coverage

This document maps the existing test files to OWASP Top 10 2021 vulnerabilities that ZAP typically scans for:

## Covered OWASP Top 10 Vulnerabilities

### A01:2021 – Broken Access Control
- **File**: [zap_a01_broken_access_control.spec.ts](e2e/zap_a01_broken_access_control.spec.ts)
- **Tests**: IDOR vulnerabilities, unauthorized access, user enumeration
- **ZAP Rules**: Access Control Testing, IDOR Detection

### A02:2021 – Cryptographic Failures
- **File**: [zap_a02_cryptographic_failures.spec.ts](e2e/zap_a02_cryptographic_failures.spec.ts)
- **Tests**: Sensitive data exposure, configuration data leaks, debug information
- **ZAP Rules**: Information Disclosure, Sensitive Data Detection

### A03:2021 – Injection
- **Files**: 
  - [zap_a03_injection.spec.ts](e2e/zap_a03_injection.spec.ts) - XSS Testing
  - [zap_a03_sql_injection.spec.ts](e2e/zap_a03_sql_injection.spec.ts) - SQL Injection Testing
- **Tests**: XSS (reflected, DOM-based), SQL Injection (boolean, union, time-based, error-based)
- **ZAP Rules**: XSS Detection, SQL Injection Detection, Script Injection

### A05:2021 – Security Misconfiguration  
- **File**: [zap_a05_security_misconfiguration.spec.ts](e2e/zap_a05_security_misconfiguration.spec.ts)
- **Tests**: Missing security headers, directory listing, exposed files, CORS issues
- **ZAP Rules**: Security Headers, Directory Browsing, Information Disclosure

### A07:2021 – Identification and Authentication Failures
- **File**: [zap_a07_identification_authentication_failures.spec.ts](e2e/zap_a07_identification_authentication_failures.spec.ts)
- **Tests**: Authentication bypass, credential validation, session management
- **ZAP Rules**: Authentication Testing, Session Management

## Integration with ZAP Baseline Scan

The [zap-baseline.spec.ts](security/zap-baseline.spec.ts) file provides:

- **Automated ZAP Baseline Scan**: Runs OWASP ZAP Docker container against staging URL
- **Security Headers Validation**: Complementary checks for proper header configuration
- **Misconfiguration Detection**: Additional checks for common security issues
- **CI/CD Integration**: Configurable thresholds and reporting

## Not Yet Covered (Opportunities for Extension)

### A04:2021 – Insecure Design
- **Missing**: Architecture and design flaw testing
- **Suggested**: Business logic testing, workflow bypass tests

### A06:2021 – Vulnerable and Outdated Components  
- **Missing**: Dependency vulnerability scanning
- **Suggested**: Package audit integration, known CVE testing

### A08:2021 – Software and Data Integrity Failures
- **Missing**: Code injection, CI/CD pipeline security
- **Suggested**: Serialization testing, update mechanism security

### A09:2021 – Security Logging and Monitoring Failures
- **Missing**: Logging validation, monitoring bypass
- **Suggested**: Security event logging tests, audit trail validation

### A10:2021 – Server-Side Request Forgery (SSRF)
- **Missing**: SSRF vulnerability testing
- **Suggested**: Internal service access tests, URL manipulation tests

## Running ZAP Tests

### Run All ZAP-Related Tests
```bash
# Run ZAP baseline scan
npm run test:security

# Run specific OWASP Top 10 tests
npx playwright test test/e2e/zap_*.spec.ts

# Run vulnerability demonstrations (opt-in)
RUN_VULN_TESTS=1 npx playwright test test/e2e/zap_*.spec.ts

# Run security expectations (after hardening)
SECURE_MODE=1 npx playwright test test/e2e/zap_*.spec.ts
```

### Environment Variables

- `STAGING_URL`: Target URL for ZAP scanning
- `ZAP_HIGH_THRESHOLD`: Max acceptable high-risk findings (default: 0)  
- `ZAP_MEDIUM_THRESHOLD`: Max acceptable medium-risk findings (default: 5)
- `RUN_VULN_TESTS`: Enable vulnerability demonstration tests
- `SECURE_MODE`: Enable security expectation tests (for hardened applications)

## ZAP Integration Benefits

1. **Comprehensive Coverage**: Combines manual test cases with automated ZAP scanning
2. **CI/CD Ready**: Configurable thresholds and failure conditions
3. **Evidence Collection**: Multiple report formats (HTML, JSON, XML)
4. **Progressive Testing**: Support for both vulnerable and hardened application states
5. **Compliance Ready**: Structured test organization aligned with OWASP standards

## Maintenance Notes

- **File Naming**: `zap_a##_descriptive_name.spec.ts` format for easy identification
- **Test Categories**: Vulnerability demos, security expectations, and baseline tests
- **Environment Flags**: Use appropriate flags to control test execution context
- **Regular Updates**: Keep ZAP Docker image updated for latest vulnerability detection rules