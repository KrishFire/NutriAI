#!/usr/bin/env node

/**
 * Testing Setup Validation Script
 *
 * This script helps you verify that the comprehensive testing framework
 * is properly configured and working before running actual tests.
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const icon = exists ? '✅' : '❌';
  const color = exists ? 'green' : 'red';
  log(`${icon} ${description}`, color);
  return exists;
}

function checkPackageJson() {
  log('\n📦 Checking package.json configuration...', 'cyan');

  const packageJsonPath = path.join(__dirname, '../package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json not found', 'red');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Check test scripts
  const requiredScripts = ['test', 'test:unit', 'test:msw', 'test:real'];

  let allScriptsPresent = true;
  requiredScripts.forEach(script => {
    if (packageJson.scripts?.[script]) {
      log(`✅ Script "${script}" configured`, 'green');
    } else {
      log(`❌ Script "${script}" missing`, 'red');
      allScriptsPresent = false;
    }
  });

  return allScriptsPresent;
}

function checkTestFiles() {
  log('\n🧪 Checking test files...', 'cyan');

  const testFiles = [
    { path: '../src/__tests__/setup.ts', desc: 'Test setup configuration' },
    {
      path: '../src/__tests__/msw-integration.test.ts',
      desc: 'MSW integration tests',
    },
    {
      path: '../src/__tests__/real-user-experience.test.ts',
      desc: 'Real user experience tests',
    },
    { path: '../jest.config.js', desc: 'Jest configuration' },
  ];

  let allFilesExist = true;
  testFiles.forEach(file => {
    const fullPath = path.join(__dirname, file.path);
    const exists = checkFile(fullPath, file.desc);
    if (!exists) allFilesExist = false;
  });

  return allFilesExist;
}

function checkEnvironmentSetup() {
  log('\n🌍 Checking environment setup...', 'cyan');

  const envTestPath = path.join(__dirname, '../.env.test');
  const envExamplePath = path.join(__dirname, '../.env.test.example');

  checkFile(envExamplePath, '.env.test.example (template)');

  const hasTestEnv = checkFile(envTestPath, '.env.test (your configuration)');

  if (!hasTestEnv) {
    log('💡 To enable real user experience tests:', 'yellow');
    log('   1. Copy .env.test.example to .env.test', 'yellow');
    log('   2. Configure with your test Supabase project details', 'yellow');
    log('   3. Create a dedicated test user account', 'yellow');
  }

  return true; // Not required for basic functionality
}

function checkDependencies() {
  log('\n📚 Checking dependencies...', 'cyan');

  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const requiredDeps = [
    '@testing-library/react-native',
    'jest',
    'msw',
    'cross-fetch',
  ];

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  let allDepsPresent = true;
  requiredDeps.forEach(dep => {
    if (allDeps[dep]) {
      log(`✅ ${dep}`, 'green');
    } else {
      log(`❌ ${dep} - run: npm install --save-dev ${dep}`, 'red');
      allDepsPresent = false;
    }
  });

  return allDepsPresent;
}

function checkSourceFiles() {
  log('\n📁 Checking source files being tested...', 'cyan');

  const sourceFiles = [
    {
      path: '../src/screens/ManualEntryScreen.tsx',
      desc: 'ManualEntryScreen component',
    },
    { path: '../src/services/foodSearch.ts', desc: 'Food search service' },
    { path: '../src/config/supabase.ts', desc: 'Supabase configuration' },
  ];

  let allSourcesExist = true;
  sourceFiles.forEach(file => {
    const fullPath = path.join(__dirname, file.path);
    const exists = checkFile(fullPath, file.desc);
    if (!exists) allSourcesExist = false;
  });

  return allSourcesExist;
}

function generateRecommendations(results) {
  log('\n🎯 Recommendations:', 'cyan');

  if (results.every(r => r)) {
    log('🎉 Perfect! Your testing setup is complete.', 'green');
    log('You can now run: npm test', 'green');
    return;
  }

  log("⚠️  Some issues found. Here's how to fix them:", 'yellow');

  if (!results[1]) {
    // dependencies
    log('1. Install missing dependencies:', 'yellow');
    log(
      '   npm install --save-dev @testing-library/react-native @testing-library/jest-native jest msw cross-fetch',
      'yellow'
    );
  }

  if (!results[0]) {
    // package.json
    log(
      '2. Update package.json scripts - check the test script additions',
      'yellow'
    );
  }

  if (!results[2]) {
    // test files
    log(
      '3. Test files missing - ensure all test files were created properly',
      'yellow'
    );
  }

  if (!results[4]) {
    // source files
    log('4. Source files missing - ensure your app components exist', 'yellow');
  }

  log('\nAfter fixing issues, run this script again to validate.', 'yellow');
}

function main() {
  log('🔍 Validating NutriAI Testing Setup', 'cyan');
  log('====================================', 'cyan');

  const results = [
    checkPackageJson(),
    checkDependencies(),
    checkTestFiles(),
    checkEnvironmentSetup(),
    checkSourceFiles(),
  ];

  log('\n📊 Validation Summary:', 'cyan');
  log('===================', 'cyan');

  const passed = results.filter(Boolean).length;
  const total = results.length;

  if (passed === total) {
    log(`✅ All checks passed (${passed}/${total})`, 'green');
  } else {
    log(`⚠️  ${passed}/${total} checks passed`, 'yellow');
  }

  generateRecommendations(results);

  return passed === total;
}

if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}
