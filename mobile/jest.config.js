const fs = require('fs');
const path = require('path');

class TddGuardReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const historyDir = path.join(process.cwd(), '.tdd-guard-history');
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    const report = {
      status: results.numFailedTests > 0 ? 'failed' : 'passed',
      numFailedTests: results.numFailedTests,
      numPassedTests: results.numPassedTests,
      numTotalTests: results.numTotalTests,
      startTime: results.startTime,
      // We can add more details from the results object if needed
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(historyDir, `${timestamp}.json`);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    if (report.status === 'failed') {
      console.log(
        `\n🔴 TDD Guard: ${results.numFailedTests} test(s) failed. Commit will be blocked.`
      );
    } else {
      console.log('\n🟢 TDD Guard: All tests passed. You are clear to commit.');
    }
  }
}

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testEnvironment: 'jsdom',

  // Module resolution
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Module mapping for React Native modules
  moduleNameMapper: {
    // Removed react-native-web mapping to fix StyleSheet runtime error
    // '^react-native$': 'react-native-web',
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.js',
    '^react-native-safe-area-context$':
      '<rootDir>/__mocks__/react-native-safe-area-context.js',
    '^react-native-reanimated$':
      '<rootDir>/__mocks__/react-native-reanimated.js',
    '^moti$': '<rootDir>/__mocks__/moti.js',
    '^lucide-react-native$': '<rootDir>/__mocks__/lucide-react-native.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/ios/',
    '/android/',
    '/web-build/',
  ],

  // Transform ignore patterns - ensure MSW and other ES modules are transformed
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|expo-.*|@supabase|msw|@react-navigation|react-native-.*|moti|lucide-react-native|react-native-safe-area-context|react-native-reanimated)/)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/types/**',
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost',
  },

  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Test timeout
  testTimeout: 30000,

  // Verbose output for debugging
  verbose: process.env.TEST_VERBOSE === 'true',

  // Custom test environment variables
  globals: {
    __DEV__: true,
    __TEST__: true,
  },

  // Test results processor
  testResultsProcessor: undefined,

  // Watch plugins for better development experience
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  reporters: [
    'default', // This keeps your standard console output
    '<rootDir>/jest.tdd-guard.reporter.js', // This adds our new TDD Guard reporter
  ],
};
