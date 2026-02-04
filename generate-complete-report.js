#!/usr/bin/env node

/**
 * Complete Allure Report Generator
 * Generates comprehensive report from all test projects including ml-anomaly
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Generating complete test report with all projects...\n');

function generateCompleteReport() {
  const resultsDir = './allure-results';
  const outputDir = './allure-report-complete';
  
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
      try {
        const content = fs.readFileSync(path.join(resultsDir, file), 'utf8');
        return JSON.parse(content);
      } catch (e) {
        console.log(`Warning: Could not parse ${file}`);
        return null;
      }
    })
    .filter(result => result !== null);

  // Group by project
  const projectGroups = {
    api: [],
    chromium: [],
    'ml-anomaly': []
  };

  resultFiles.forEach(result => {
    const projectParam = result.parameters?.find(p => p.name === 'Project');
    const project = projectParam ? projectParam.value : 'unknown';
    
    if (projectGroups[project]) {
      projectGroups[project].push(result);
    } else {
      projectGroups[project] = [result];
    }
  });

  // Calculate statistics
  const projectStats = {};
  let totalStats = { total: 0, passed: 0, failed: 0, skipped: 0, broken: 0 };

  Object.keys(projectGroups).forEach(project => {
    const results = projectGroups[project];
    const stats = {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      broken: results.filter(r => r.status === 'broken').length,
      skipped: results.filter(r => r.status === 'skipped').length
    };
    projectStats[project] = stats;
    
    totalStats.total += stats.total;
    totalStats.passed += stats.passed;
    totalStats.failed += stats.failed;
    totalStats.skipped += stats.skipped;
    totalStats.broken += stats.broken;
  });

  console.log('📈 Test Results Summary:');
  console.log('========================');
  console.log(`Total Tests: ${totalStats.total}`);
  console.log(`✅ Passed: ${totalStats.passed}`);
  console.log(`❌ Failed: ${totalStats.failed}`);
  console.log(`⏭️  Skipped: ${totalStats.skipped}`);
  console.log(`💥 Broken: ${totalStats.broken}`);
  console.log();

  Object.keys(projectStats).forEach(project => {
    if (projectStats[project].total > 0) {
      const stats = projectStats[project];
      console.log(`🎯 ${project.toUpperCase()} Project:`);
      console.log(`   Total: ${stats.total}, Passed: ${stats.passed}, Failed: ${stats.failed}, Skipped: ${stats.skipped}`);
    }
  });

  // Generate comprehensive HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Test Results - All Projects</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { 
            background: white; 
            padding: 40px; 
            border-radius: 16px; 
            margin-bottom: 30px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        .title { 
            color: #2c3e50; 
            font-size: 2.5em; 
            margin-bottom: 20px; 
            font-weight: 700;
        }
        .subtitle {
            color: #7f8c8d;
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .projects-overview { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .project-card { 
            background: white; 
            padding: 30px; 
            border-radius: 16px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .project-card:hover {
            transform: translateY(-5px);
        }
        .project-title { 
            font-size: 1.5em; 
            font-weight: 700; 
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .project-icon {
            font-size: 1.2em;
        }
        .api .project-icon { color: #3498db; }
        .chromium .project-icon { color: #e74c3c; }
        .ml-anomaly .project-icon { color: #9b59b6; }
        
        .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .stat-item { 
            text-align: center; 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 12px; 
            transition: background 0.3s ease;
        }
        .stat-item:hover { background: #e9ecef; }
        .stat-number { 
            font-size: 2em; 
            font-weight: bold; 
            margin-bottom: 5px; 
        }
        .stat-label { 
            color: #6c757d; 
            font-size: 0.9em; 
            font-weight: 500;
        }
        .passed { color: #27ae60; }
        .failed { color: #e74c3c; }
        .skipped { color: #f39c12; }
        .broken { color: #8e44ad; }
        
        .global-stats {
            background: white;
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .global-stats h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
            font-size: 1.8em;
        }
        .global-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }
        .global-stat {
            text-align: center;
            padding: 20px;
            border-radius: 12px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .global-stat .number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .global-stat .label {
            font-size: 1.1em;
            font-weight: 600;
            color: #495057;
        }
        
        .progress-bar { 
            height: 8px; 
            border-radius: 4px; 
            background: #e9ecef; 
            margin: 20px 0; 
            overflow: hidden; 
        }
        .progress-fill { 
            height: 100%; 
            transition: width 0.5s ease;
            background: linear-gradient(90deg, #27ae60, #2ecc71);
        }
        
        .test-details {
            background: white;
            padding: 30px;
            border-radius: 16px;
            margin-top: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .test-details h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        .project-section {
            margin-bottom: 30px;
            padding-bottom: 30px;
            border-bottom: 1px solid #dee2e6;
        }
        .project-section:last-child {
            border-bottom: none;
        }
        .test-list {
            display: grid;
            gap: 10px;
            margin-top: 15px;
        }
        .test-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #dee2e6;
            transition: all 0.3s ease;
        }
        .test-item:hover {
            background: #e9ecef;
            transform: translateX(5px);
        }
        .test-item.passed { border-left-color: #27ae60; }
        .test-item.failed { border-left-color: #e74c3c; }
        .test-item.skipped { border-left-color: #f39c12; }
        .test-name {
            font-weight: 600;
            margin-bottom: 5px;
            color: #2c3e50;
        }
        .test-suite {
            font-size: 0.9em;
            color: #6c757d;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: rgba(255,255,255,0.8);
        }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .project-card, .global-stats, .test-details { padding: 20px; }
            .title { font-size: 2em; }
            .stats { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🔒 Complete Security Test Results</h1>
            <p class="subtitle">Comprehensive test coverage across API, UI, and ML Anomaly Detection</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.round((totalStats.passed / totalStats.total) * 100) || 0}%"></div>
            </div>
            <p><strong>Success Rate: ${Math.round((totalStats.passed / totalStats.total) * 100) || 0}%</strong></p>
        </div>
        
        <div class="global-stats">
            <h2>📊 Overall Statistics</h2>
            <div class="global-grid">
                <div class="global-stat">
                    <div class="number">${totalStats.total}</div>
                    <div class="label">Total Tests</div>
                </div>
                <div class="global-stat">
                    <div class="number passed">${totalStats.passed}</div>
                    <div class="label">Passed</div>
                </div>
                <div class="global-stat">
                    <div class="number failed">${totalStats.failed}</div>
                    <div class="label">Failed</div>
                </div>
                <div class="global-stat">
                    <div class="number skipped">${totalStats.skipped}</div>
                    <div class="label">Skipped</div>
                </div>
            </div>
        </div>

        <div class="projects-overview">
            ${Object.keys(projectStats).filter(p => projectStats[p].total > 0).map(project => {
              const stats = projectStats[project];
              const icons = {
                'api': '🔌',
                'chromium': '🌐', 
                'ml-anomaly': '🤖'
              };
              return `
              <div class="project-card ${project}">
                <div class="project-title">
                  <span class="project-icon">${icons[project] || '📋'}</span>
                  ${project.toUpperCase().replace('-', ' ')}
                </div>
                <div class="stats">
                  <div class="stat-item">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number passed">${stats.passed}</div>
                    <div class="stat-label">Passed</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number failed">${stats.failed}</div>
                    <div class="stat-label">Failed</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number skipped">${stats.skipped}</div>
                    <div class="stat-label">Skipped</div>
                  </div>
                </div>
              </div>`;
            }).join('')}
        </div>

        <div class="test-details">
            <h3>📋 Detailed Test Results</h3>
            ${Object.keys(projectGroups).filter(p => projectGroups[p].length > 0).map(project => `
              <div class="project-section">
                <h4>🎯 ${project.toUpperCase().replace('-', ' ')} Tests (${projectGroups[project].length})</h4>
                <div class="test-list">
                  ${projectGroups[project].slice(0, 10).map(test => `
                    <div class="test-item ${test.status}">
                      <div class="test-name">${test.name}</div>
                      <div class="test-suite">${test.fullName?.split('#')[0] || 'Unknown Suite'}</div>
                    </div>
                  `).join('')}
                  ${projectGroups[project].length > 10 ? `<div class="test-item"><em>... and ${projectGroups[project].length - 10} more tests</em></div>` : ''}
                </div>
              </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Test Framework: Playwright | Report Type: Complete Coverage</p>
        </div>
    </div>
</body>
</html>`;

  // Write HTML report
  const htmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(htmlPath, html);

  // Generate JSON summary
  const jsonSummary = {
    generated: new Date().toISOString(),
    totalStats,
    projectStats,
    projects: Object.keys(projectGroups).filter(p => projectGroups[p].length > 0),
    testCount: totalStats.total
  };

  const jsonPath = path.join(outputDir, 'summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonSummary, null, 2));

  console.log();
  console.log('✅ Complete report generated successfully!');
  console.log(`🌐 Open: file://${path.resolve(htmlPath)}`);
  console.log(`📄 JSON Summary: ${path.resolve(jsonPath)}`);
  console.log();
  
  return outputDir;
}

if (require.main === module) {
  generateCompleteReport();
}

module.exports = { generateCompleteReport };