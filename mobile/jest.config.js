module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testEnvironment: 'jsdom',

  // Module resolution
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Module mapping for React Native modules
  moduleNameMapping: {
    '^react-native$': 'react-native-web',
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
    'node_modules/(?!(react-native|@react-native|@expo|expo|@supabase|msw)/)',
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
};
