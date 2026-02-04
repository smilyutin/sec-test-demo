#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generate simple Allure-style HTML report without Java dependency
 * Uses the allure-results JSON files to create a basic HTML report
 */

function generateSimpleReport() {
  const resultsDir = './allure-results';
  const outputDir = './allure-report-simple';
  
  if (!fs.existsSync(resultsDir)) {
    console.log('❌ No allure-results found. Run tests first.');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all JSON result files
  const resultFiles = fs.readdirSync(resultsDir)
    .filter(file => file.endsWith('-result.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(resultsDir, file), 'utf8');
      return JSON.parse(content);
    });

  // Aggregate statistics
  const stats = {
    total: resultFiles.length,
    passed: resultFiles.filter(r => r.status === 'passed').length,
    failed: resultFiles.filter(r => r.status === 'failed').length,
    broken: resultFiles.filter(r => r.status === 'broken').length,
    skipped: resultFiles.filter(r => r.status === 'skipped').length
  };

  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Results - Security Testing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .title { color: #333; text-align: center; margin-bottom: 20px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-card { text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .stat-label { color: #666; font-size: 0.9em; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .skipped { color: #FF9800; }
        .broken { color: #9C27B0; }
        .tests-grid { display: grid; gap: 15px; margin-top: 30px; }
        .test-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #ddd; }
        .test-card.passed { border-left-color: #4CAF50; }
        .test-card.failed { border-left-color: #f44336; }
        .test-card.skipped { border-left-color: #FF9800; }
        .test-card.broken { border-left-color: #9C27B0; }
        .test-name { font-weight: bold; margin-bottom: 10px; color: #333; }
        .test-suite { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .test-duration { color: #999; font-size: 0.8em; }
        .test-error { background: #ffebee; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; font-size: 0.9em; color: #c62828; }
        .timestamp { text-align: center; color: #999; margin-top: 30px; }
        .progress-bar { height: 6px; border-radius: 3px; background: #e0e0e0; margin: 20px 0; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s; }
        .java-notice { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .java-notice h4 { color: #856404; margin-bottom: 10px; }
        .java-notice p { color: #856404; margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🔒 Security Test Results</h1>
            <div class="java-notice">
                <h4>📋 Simple Report (Java-free)</h4>
                <p>This is a basic HTML report generated without Java dependency.</p>
                <p>For full Allure features, install Java and run: <code>npm run test:allure</code></p>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(stats.passed / stats.total * 100) || 0}%; background: linear-gradient(90deg, #4CAF50 ${(stats.passed / stats.total * 100) || 0}%, #f44336 ${(stats.passed / stats.total * 100) || 0}%)"></div>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total Tests</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number passed">${stats.passed}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number failed">${stats.failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number skipped">${stats.skipped}</div>
                    <div class="stat-label">Skipped</div>
                </div>
            </div>
        </div>

        <div class="tests-grid">
            ${resultFiles.map(test => `
                <div class="test-card ${test.status}">
                    <div class="test-name">${test.name}</div>
                    <div class="test-suite">${test.fullName || test.historyId || 'Unknown Suite'}</div>
                    <div class="test-duration">Duration: ${test.stop - test.start}ms</div>
                    ${test.statusDetails && test.statusDetails.message ? `
                        <div class="test-error">${test.statusDetails.message}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        <div class="timestamp">
            Generated: ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  
  console.log(`✅ Simple HTML report generated: ${outputDir}/index.html`);
  console.log(`📊 Results: ${stats.passed} passed, ${stats.failed} failed, ${stats.skipped} skipped`);
  console.log(`🌐 Open: file://${path.resolve(outputDir)}/index.html`);
  
  return outputDir;
}

if (require.main === module) {
  generateSimpleReport();
}

module.exports = { generateSimpleReport };