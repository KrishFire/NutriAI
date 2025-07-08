/**
 * Test Setup Configuration
 *
 * This file configures the testing environment to match your actual mobile app experience.
 * It sets up both MSW integration tests and real user experience tests.
 */

import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage for authentication persistence
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl:
        process.env.TEST_SUPABASE_URL || 'https://test-project.supabase.co',
      supabaseAnonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key',
    },
  },
  default: {
    expoConfig: {
      extra: {
        supabaseUrl:
          process.env.TEST_SUPABASE_URL || 'https://test-project.supabase.co',
        supabaseAnonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key',
      },
    },
  },
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    NavigationContainer: ({ children }: { children: React.ReactNode }) =>
      children,
  };
});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock lodash debounce for controlled testing
jest.mock('lodash', () => ({
  debounce: (fn: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    const debounced = (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timeoutId);
    return debounced;
  },
}));

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly testing logging
  log: process.env.TEST_VERBOSE === 'true' ? console.log : jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Global fetch mock setup for MSW
import { fetch, Headers, Request, Response } from 'cross-fetch';

global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Error handling for unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Test timeout configuration
jest.setTimeout(30000); // 30 seconds for real network tests

// Custom matchers for better test assertions
expect.extend({
  toBeWithinResponseTime(received: number, maxTime: number) {
    const pass = received <= maxTime;
    if (pass) {
      return {
        message: () => `Expected ${received}ms to be greater than ${maxTime}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected ${received}ms to be within ${maxTime}ms`,
        pass: false,
      };
    }
  },

  toHaveValidNutritionData(received: any) {
    const hasRequiredFields =
      received &&
      typeof received.calories === 'number' &&
      typeof received.protein === 'number' &&
      typeof received.carbs === 'number' &&
      typeof received.fat === 'number';

    const hasValidValues =
      received.calories >= 0 &&
      received.protein >= 0 &&
      received.carbs >= 0 &&
      received.fat >= 0;

    const pass = hasRequiredFields && hasValidValues;

    if (pass) {
      return {
        message: () => `Expected nutrition data to be invalid`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected valid nutrition data but received: ${JSON.stringify(received)}`,
        pass: false,
      };
    }
  },
});

// Environment validation for real user experience tests
export function validateTestEnvironment() {
  const requiredEnvVars = ['TEST_SUPABASE_URL', 'TEST_SUPABASE_ANON_KEY'];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`
⚠️  Warning: Missing environment variables for real user experience tests:
${missingVars.map(v => `   - ${v}`).join('\n')}

To run complete integration tests, create a .env.test file with:
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=your-test-anon-key
TEST_USER_EMAIL=test@yourapp.com
TEST_USER_PASSWORD=TestPassword123!

The MSW integration tests will still run without these.
    `);
  }

  return missingVars.length === 0;
}

// Performance monitoring utilities
export class TestPerformanceMonitor {
  private static instance: TestPerformanceMonitor;
  private measurements: Map<string, number[]> = new Map();

  static getInstance(): TestPerformanceMonitor {
    if (!TestPerformanceMonitor.instance) {
      TestPerformanceMonitor.instance = new TestPerformanceMonitor();
    }
    return TestPerformanceMonitor.instance;
  }

  startMeasurement(name: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMeasurement(name, duration);
      return duration;
    };
  }

  recordMeasurement(name: string, duration: number) {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);
  }

  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }

  reset() {
    this.measurements.clear();
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name] of this.measurements) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }
}

// Console log capture utility for testing error handling
export class ConsoleCapture {
  private originalConsole: Console;
  private logs: Array<{ level: string; args: any[] }> = [];

  constructor() {
    this.originalConsole = { ...console };
  }

  start() {
    this.logs = [];
    console.log = (...args) => this.capture('log', args);
    console.error = (...args) => this.capture('error', args);
    console.warn = (...args) => this.capture('warn', args);
    console.info = (...args) => this.capture('info', args);
  }

  stop() {
    Object.assign(console, this.originalConsole);
  }

  private capture(level: string, args: any[]) {
    this.logs.push({ level, args });
    // Still output to original console in test verbose mode
    if (process.env.TEST_VERBOSE === 'true') {
      this.originalConsole[level as keyof Console](...args);
    }
  }

  getLogs() {
    return [...this.logs];
  }

  getLogsForLevel(level: string) {
    return this.logs.filter(log => log.level === level);
  }

  hasLogMatching(pattern: string | RegExp) {
    return this.logs.some(log => {
      const message = log.args.join(' ');
      return typeof pattern === 'string'
        ? message.includes(pattern)
        : pattern.test(message);
    });
  }

  clear() {
    this.logs = [];
  }
}

// Initialize environment validation
validateTestEnvironment();

console.log(
  '🧪 Test environment configured for comprehensive mobile app testing'
);
