#!/usr/bin/env node

const { execSync, spawn } = require('child_process');

function checkJava() {
  try {
    execSync('java -version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function runAllureCommand(command) {
  if (!checkJava()) {
    console.log('❌ Java not found!');
    console.log('');
    console.log('Allure CLI requires Java to run. Install Java using:');
    
    const os = process.platform;
    if (os === 'darwin') {
      console.log('  🍎 macOS: brew install openjdk@11');
    } else if (os === 'linux') {
      console.log('  🐧 Linux: sudo apt install openjdk-11-jdk');
    } else if (os === 'win32') {
      console.log('  🪟 Windows: Download from https://adoptium.net/');
    }
    
    console.log('');
    console.log('Alternative (no Java required):');
    console.log('  npm run test:report          # Playwright HTML report');
    console.log('  npm run test:allure-simple   # Simple Allure-style report');
    console.log('');
    process.exit(1);
  }

  console.log('✅ Java found, running Allure command...');
  
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Allure command failed:', error.message);
    process.exit(1);
  }
}

// Get command from command line args
const args = process.argv.slice(2);
const command = args.join(' ');

if (!command) {
  console.error('Usage: node check-java-allure.js <allure-command>');
  process.exit(1);
}

runAllureCommand(command);