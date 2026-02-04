#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate comprehensive test dashboard with links to all report types
 */

const reportPaths = {
  allure: './allure-report/index.html',
  playwright: './playwright-report/index.html', 
  json: './test-results.json',
  dashboard: './public/test-dashboard.html'
};

function generateReportIndex() {
  const timestamp = new Date().toISOString();
  
  // Check which reports exist
  const availableReports = {};
  for (const [type, reportPath] of Object.entries(reportPaths)) {
    if (type === 'dashboard') continue;
    availableReports[type] = fs.existsSync(reportPath);
  }

  const indexContent = `
# Test Reports Index

Generated: ${timestamp}

## Available Reports

${availableReports.allure ? '✅' : '❌'} **Allure Report** - [Open Report](${reportPaths.allure})
  Interactive test execution report with detailed analytics and trends

${availableReports.playwright ? '✅' : '❌'} **Playwright HTML Report** - [Open Report](${reportPaths.playwright})
  Native Playwright test report with trace viewer and execution logs

${availableReports.json ? '✅' : '❌'} **JSON Test Results** - [View JSON](${reportPaths.json})
  Raw test results in JSON format for programmatic analysis

📊 **Test Dashboard** - [Open Dashboard](${reportPaths.dashboard})
  Comprehensive overview of all test reports and security analysis

## Quick Commands

\`\`\`bash
# Generate all reports
npm run test:allure
npm run test:report

# Open reports
npm run test:allure-open
npm run test:report

# Serve reports
npm run test:allure-serve
\`\`\`

## CI/CD Integration

Reports are automatically published as GitHub Actions artifacts:
- Allure Report: \`allure-report\` artifact  
- Playwright Report: \`playwright-html-report\` artifact
- JSON Results: \`test-results-json\` artifact
- Test Screenshots: \`test-results\` artifact (on failure)

---
*For questions about these reports, check the documentation or create an issue.*
`;

  fs.writeFileSync('TEST_REPORTS.md', indexContent);
  console.log('✅ Generated TEST_REPORTS.md index file');
  
  // Update package.json with report links in description
  const packagePath = './package.json';
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    pkg.homepage = pkg.homepage || "https://your-github-pages-url.github.io/repo-name";
    pkg.repository = pkg.repository || {
      "type": "git", 
      "url": "https://github.com/your-username/repo-name.git"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log('✅ Updated package.json with report links');
  }

  console.log('\\n📊 Test Reports Status:');
  console.log(`Allure Report: ${availableReports.allure ? '✅ Available' : '❌ Not Generated'}`);
  console.log(`Playwright Report: ${availableReports.playwright ? '✅ Available' : '❌ Not Generated'}`);  
  console.log(`JSON Results: ${availableReports.json ? '✅ Available' : '❌ Not Generated'}`);
  console.log(`Test Dashboard: ✅ Ready at ${reportPaths.dashboard}`);
  
  if (!availableReports.allure) {
    console.log('\\n💡 To generate Allure report: npm run test:allure');
  }
  if (!availableReports.playwright) {
    console.log('💡 To generate Playwright report: npm run test:report');
  }
}

if (require.main === module) {
  generateReportIndex();
}

module.exports = { generateReportIndex };