#!/bin/bash

# Pre-test configuration check script
# This script ensures the test environment is properly configured before running tests

echo "🔍 Performing pre-test configuration check..."

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    echo "❌ .env.test file not found"
    
    # Check if .env.test.example exists
    if [ -f ".env.test.example" ]; then
        echo "📋 Creating .env.test from .env.test.example..."
        cp .env.test.example .env.test
        echo "✅ .env.test created successfully"
    else
        echo "⚠️  Warning: .env.test.example not found"
        echo "   Please create .env.test manually for full test coverage"
    fi
else
    echo "✅ .env.test file exists"
fi

# Check for test dependencies
echo ""
echo "🔍 Checking test dependencies..."

# Check if @testing-library/react-native is installed
if ! npm list @testing-library/react-native >/dev/null 2>&1; then
    echo "❌ Missing dependency: @testing-library/react-native"
    MISSING_DEPS=true
else
    echo "✅ @testing-library/react-native is installed"
fi

# Check if jest is installed
if ! npm list jest >/dev/null 2>&1; then
    echo "❌ Missing dependency: jest"
    MISSING_DEPS=true
else
    echo "✅ jest is installed"
fi

# Check if msw is installed
if ! npm list msw >/dev/null 2>&1; then
    echo "❌ Missing dependency: msw"
    MISSING_DEPS=true
else
    echo "✅ msw is installed"
fi

if [ "$MISSING_DEPS" = true ]; then
    echo ""
    echo "⚠️  Missing test dependencies detected"
    echo "   Run: npm install --save-dev @testing-library/react-native jest msw"
    exit 1
fi

echo ""
echo "✅ Pre-test configuration check completed successfully"
exit 0