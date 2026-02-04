#!/bin/bash

echo "🧹 Cleaning old results and reports..."
rm -rf allure-results allure-report allure-report-simple allure-report-complete

echo "🚀 Running full test suite and generating Allure UI report (requires Java)..."
npm test

echo "🤖 Generating complete (all projects) HTML report (Java-free fallback)..."
node generate-complete-report.js

echo "✅ Report generation complete!"
echo "🌐 Allure UI report: allure-report/index.html"
echo "🌐 Complete report:  allure-report-complete/index.html"