#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running Onboarding Screen Tests...\n');

// List of onboarding test files
const testFiles = [
  'src/__tests__/WelcomeScreen.test.tsx',
  'src/__tests__/OnboardingCarousel.test.tsx',
  'src/__tests__/GenderSelectionScreen.test.tsx',
  'src/__tests__/ActivityLevelScreen.test.tsx',
  'src/__tests__/ReferralSourceScreen.test.tsx',
];

// Run jest with minimal config
const jest = spawn(
  'npx',
  [
    'jest',
    ...testFiles,
    '--no-coverage',
    '--testEnvironment=jsdom',
    '--setupFiles=./src/__tests__/setup.ts',
    '--verbose',
  ],
  {
    stdio: 'inherit',
    cwd: __dirname,
  }
);

jest.on('close', code => {
  if (code === 0) {
    console.log('\n✅ All onboarding tests passed!');
  } else {
    console.log('\n❌ Some tests failed');
  }
  process.exit(code);
});
