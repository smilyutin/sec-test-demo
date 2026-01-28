#!/usr/bin/env node

/**
 * Test Results Generator
 * Runs ML anomaly detection tests and generates comprehensive results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting ML Anomaly Detection Test Suite...\n');

try {
  // Ensure test-results directory exists
  const testResultsDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  // Run ML anomaly detection tests with full reporting
  console.log('Running ML Anomaly Detection Tests...');
  const testCommand = 'npx playwright test test/ml-anomaly --project=ml-anomaly --reporter=html,json:test-results/ml-anomaly-results.json,list';
  
  const output = execSync(testCommand, { 
    encoding: 'utf8', 
    cwd: __dirname,
    stdio: 'inherit'
  });

  console.log('\nTests completed successfully!');
  
  // Generate summary report
  const summaryPath = path.join(testResultsDir, 'test-summary.md');
  const timestamp = new Date().toISOString();
  
  const summary = `# ML Anomaly Detection Test Results

**Generated:** ${timestamp}
**Project:** ML Anomaly Detection Suite
**Test Framework:** Playwright

## Test Coverage

This test suite covers the following ML-based anomaly detection scenarios:

### 1. Traffic Pattern Analysis
- **Baseline Behavior Monitoring**: Establishes normal traffic patterns
- **Behavioral Anomalies**: Detects deviations from normal user behavior  
- **Attack Pattern Recognition**: Identifies systematic attack patterns
- **Traffic Volume Analysis**: Monitors request rate anomalies
- **Error Pattern Detection**: Analyzes error clustering and systematic error generation

### 2. ML Validation Tests
- **Model Accuracy**: Validates ML model predictions
- **Feature Engineering**: Tests input feature processing
- **Threshold Tuning**: Validates anomaly detection thresholds
- **False Positive/Negative Analysis**: Measures detection accuracy

## Key Metrics Tracked

- **Request Patterns**: Normal vs anomalous traffic flows
- **Error Rates**: Baseline vs elevated error conditions  
- **Response Times**: Performance anomaly detection
- **Behavioral Signatures**: User interaction pattern analysis
- **Attack Vector Recognition**: Known attack pattern matching

## Test Results Files

- \`ml-anomaly-results.json\` - Detailed JSON test results
- \`playwright-report/index.html\` - Interactive HTML report
- \`test-results/\` - Screenshots, videos, and traces for failed tests

## Usage

Run the complete test suite:
\`\`\`bash
npm run test:ml-anomaly
\`\`\`

Or run individual test categories:
\`\`\`bash
npx playwright test test/ml-anomaly/traffic-patterns.spec.ts --project=ml-anomaly
npx playwright test test/ml-anomaly/behavioral-anomalies.spec.ts --project=ml-anomaly
\`\`\`

## Viewing Results

Open the HTML report:
\`\`\`bash
npx playwright show-report
\`\`\`
`;

  fs.writeFileSync(summaryPath, summary);
  console.log(`\nTest summary generated: ${summaryPath}`);
  
  // List available result files
  const resultFiles = fs.readdirSync(testResultsDir);
  if (resultFiles.length > 0) {
    console.log('\nGenerated test result files:');
    resultFiles.forEach(file => {
      console.log(`   - test-results/${file}`);
    });
  }

  console.log('\nTo view the interactive HTML report, run:');
  console.log('   npx playwright show-report');
  
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}