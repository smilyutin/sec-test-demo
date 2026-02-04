#  Quick Reference

##  Essential Commands

###  **Setup** 
```bash
npm install && npx playwright install --with-deps
npm start                           # Start application
```

###  **Testing**
```bash
npm test                            # Run core suites (API + E2E + ML-Anomaly) and generate Allure UI (Java required)
npm run test:api                    # API security tests
npm run test:e2e                    # Browser security tests  
npm run test:ml-anomaly            # ML-enhanced testing
npm run test:ui                     # Interactive test runner
```

###  **Reports**
```bash
npm run test:report                 # Playwright HTML (recommended)
npm run test:allure-simple         # Allure-style (no Java)
npm run test:complete-report        # Java-free grouped HTML report
npm run test:allure                 # Full Allure (requires Java)
npm run test:dashboard              # Test results overview
```

###  **URLs**
- **App**: http://localhost:3000
- **Dashboard**: http://localhost:3000/test-dashboard.html  
- **Playwright Report**: `playwright-report/index.html`
- **Full Allure**: `allure-report/index.html`
- **Complete (Java-free)**: `allure-report-complete/index.html`
- **Simple Allure**: `allure-report-simple/index.html`

##  **Test Categories**

| Category | Command | Safety |
|----------|---------|--------|
| Baseline Tests | `npm test` |  Always safe |
| Security Validation | `SECURE_MODE=1 npm test` |  Post-hardening |
| Vulnerability Demo | `RUN_VULN_TESTS=1 npm test` |  Education only |
| ML Enhancement | `npm run test:ml-anomaly` |  Safe analysis |

##  **Key Files**

```
 Root Files
├── package.json              # Dependencies & scripts
├── playwright.config.ts      # Test configuration
├── server.js                 # Vulnerable application
├── README.md                 # Main documentation
├── PROJECT_DOCS.md           # Detailed architecture
└── allure.config.json        # Report configuration

 Test Structure  
├── test/api/                 # API security tests
├── test/e2e/                 # Browser security tests
├── test/ml-anomaly/          # ML-enhanced tests
├── test/pages/               # Page Object Model
├── test/fixtures/            # Test utilities
└── test/utils/               # Helper functions

 Reports & Scripts
├── check-java-allure.js      # Java dependency checker
├── generate-simple-report.js # Java-free Allure report
├── generate-test-dashboard.js # Dashboard generator
└── install-allure.sh         # Setup script
```

## ⚡ **Quick Troubleshooting**

### Java Issues
```bash
# Check if Java is needed
npm run test:allure           # Shows Java installation help

# Alternatives (no Java required)
npm run test:report           # Playwright HTML
npm run test:allure-simple    # Simple Allure-style
```

### Test Failures
```bash
# Debug interactively
npm run test:ui               # Visual test runner
npx playwright test --debug   # Step through tests
```

### Reports Not Working
```bash
# Check test results exist
ls allure-results/            # Should have JSON files
ls test-results/              # Should have artifacts

# Regenerate reports  
npm run test:dashboard        # Generate dashboard
npm run test:allure-simple    # Generate simple report
```

##  **Security Notes**

###  **Safe for CI/CD**
- `npm test` - Baseline functionality tests
- `npm run test:api` - API security validation
- `npm run test:e2e` - Browser security tests
- `npm run test:ml-anomaly` - ML pattern analysis

###  **Controlled Environment Only**
- `SECURE_MODE=1 npm test` - Post-hardening validation
- Security expectation tests

###  **Never in Production**
- `RUN_VULN_TESTS=1 npm test` - Active exploit demonstrations
- Vulnerability reproduction tests

---

##  **Documentation Links**

- **Main Guide**: [README.md](README.md)
- **Architecture**: [PROJECT_DOCS.md](PROJECT_DOCS.md)
- **Security Coverage**: [test/security/OWASP_TOP10_COVERAGE.md](test/security/OWASP_TOP10_COVERAGE.md)
- **Presentation Guide**: [PRESENTATION_GUIDE.md](PRESENTATION_GUIDE.md)

---

*Need help? Check the documentation or create an issue on GitHub.*