#!/bin/bash

# Install Allure dependencies and check Java requirement
echo "Setting up Allure reporting..."

# Check if Java is installed
if command -v java &> /dev/null; then
    java_version=$(java -version 2>&1 | head -n 1)
    echo "✅ Java found: $java_version"
else
    echo "❌ Java not found. Allure CLI requires Java to run."
    echo ""
    echo "Install Java using one of these methods:"
    echo ""
    
    # Detect OS and provide appropriate instructions
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 macOS:"
        echo "  brew install openjdk@11"
        echo "  export PATH=\"/opt/homebrew/opt/openjdk@11/bin:\$PATH\""
        echo ""
        echo "Or download from: https://adoptium.net/"
    elif [[ "$OSTYPE" == "linux"* ]]; then
        echo "🐧 Linux:"
        echo "  sudo apt update && sudo apt install openjdk-11-jdk  # Ubuntu/Debian"
        echo "  sudo yum install java-11-openjdk-devel           # CentOS/RHEL"
        echo ""
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        echo "🪟 Windows:"
        echo "  Download from: https://adoptium.net/"
        echo "  Or use: winget install EclipseAdoptium.Temurin.11"
        echo ""
    fi
    
    echo "Alternative: Use Playwright HTML reports instead:"
    echo "  npm run test:report"
    echo ""
fi

# Install NPM dependencies
echo "Installing Allure NPM packages..."
npm install allure-playwright@^2.15.1 allure-commandline@^2.36.0

echo ""
echo "✅ Allure NPM packages installed!"
echo ""
echo "Available commands:"
echo "  npm run test:report         # Playwright HTML report (no Java required)"
echo "  npm run test:allure         # Generate Allure report (requires Java)"
echo "  npm run test:allure-serve   # Serve Allure report (requires Java)"
echo ""

# Test if everything works
if command -v java &> /dev/null; then
    echo "🔬 Testing Allure setup..."
    if npx allure --version &> /dev/null; then
        echo "✅ Allure CLI working correctly!"
    else
        echo "❌ Allure CLI test failed"
    fi
else
    echo "⚠️  Allure commands will not work until Java is installed"
fi