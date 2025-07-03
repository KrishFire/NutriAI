#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * 
 * This script runs both MSW integration tests and real user experience tests
 * in the correct order with proper reporting.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log('\n🔍 Checking test environment...', 'cyan');
  
  // Check if .env.test exists
  const envTestPath = path.join(__dirname, '../.env.test');
  const hasTestEnv = fs.existsSync(envTestPath);
  
  if (!hasTestEnv) {
    log('⚠️  No .env.test file found', 'yellow');
    log('   MSW integration tests will run, but real user experience tests may fail', 'yellow');
    log('   Copy .env.test.example to .env.test and configure for full testing', 'yellow');
  } else {
    log('✅ .env.test file found', 'green');
  }
  
  // Check required dependencies
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = [
    '@testing-library/react-native',
    'jest',
    'msw',
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
  );
  
  if (missingDeps.length > 0) {
    log(`❌ Missing dependencies: ${missingDeps.join(', ')}`, 'red');
    log('   Run: npm install --save-dev @testing-library/react-native msw', 'yellow');
    process.exit(1);
  } else {
    log('✅ All required dependencies found', 'green');
  }
  
  return hasTestEnv;
}

function runTests(testType, hasRealEnv) {
  const testCommands = {
    'unit': 'jest src/__tests__/food-search-fix.test.ts src/__tests__/daily-log-fix.test.ts',
    'msw': 'jest src/__tests__/msw-integration.test.ts',
    'real': 'jest src/__tests__/real-user-experience.test.ts',
    'all': 'jest src/__tests__/',
  };
  
  if (testType === 'real' && !hasRealEnv) {
    log('⚠️  Skipping real user experience tests - no .env.test configuration', 'yellow');
    return true;
  }
  
  const command = testCommands[testType];
  if (!command) {
    log(`❌ Unknown test type: ${testType}`, 'red');
    return false;
  }
  
  try {
    log(`\n🧪 Running ${testType} tests...`, 'cyan');
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        TEST_TYPE: testType,
      }
    });
    log(`✅ ${testType} tests passed!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${testType} tests failed!`, 'red');
    log(`   Exit code: ${error.status}`, 'red');
    return false;
  }
}

function generateReport(results) {
  log('\n📊 Test Results Summary', 'bright');
  log('================================', 'bright');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
    if (result.notes) {
      log(`   ${result.notes}`, 'yellow');
    }
  });
  
  log(`\nOverall: ${passed}/${total} test suites passed`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('\n🎉 All tests passed! Your app should work correctly for users.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
  }
}

function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'comprehensive';
  
  log('🧪 NutriAI Mobile App Test Suite', 'bright');
  log('==================================', 'bright');
  
  const hasRealEnv = checkEnvironment();
  const results = [];
  
  switch (testType) {
    case 'unit':
      log('\n📝 Running unit tests only...', 'cyan');
      results.push({
        name: 'Unit Tests',
        passed: runTests('unit', hasRealEnv),
        notes: 'Legacy unit tests with mocks'
      });
      break;
      
    case 'msw':
      log('\n🔧 Running MSW integration tests only...', 'cyan');
      results.push({
        name: 'MSW Integration Tests',
        passed: runTests('msw', hasRealEnv),
        notes: 'Fast, reliable integration tests with controlled responses'
      });
      break;
      
    case 'real':
      log('\n🌐 Running real user experience tests only...', 'cyan');
      results.push({
        name: 'Real User Experience Tests',
        passed: runTests('real', hasRealEnv),
        notes: 'Full end-to-end tests with real network calls'
      });
      break;
      
    case 'comprehensive':
    default:
      log('\n🎯 Running comprehensive test suite...', 'cyan');
      
      // Run in order: unit -> MSW -> real
      results.push({
        name: 'Unit Tests',
        passed: runTests('unit', hasRealEnv),
        notes: 'Basic functionality tests'
      });
      
      results.push({
        name: 'MSW Integration Tests',
        passed: runTests('msw', hasRealEnv),
        notes: 'Integration tests with mocked network'
      });
      
      if (hasRealEnv) {
        results.push({
          name: 'Real User Experience Tests',
          passed: runTests('real', hasRealEnv),
          notes: 'End-to-end tests with real API calls'
        });
      } else {
        results.push({
          name: 'Real User Experience Tests',
          passed: false,
          notes: 'Skipped - configure .env.test to enable'
        });
      }
      break;
  }
  
  generateReport(results);
  
  // Exit with error code if any tests failed
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}