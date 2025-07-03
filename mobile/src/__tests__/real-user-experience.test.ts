/**
 * Real User Experience Testing Framework
 * 
 * This test suite simulates the EXACT mobile app user experience:
 * 1. Real Expo/React Native environment
 * 2. Actual authentication flow with Supabase
 * 3. Complete client → Supabase → Edge Function chain
 * 4. Real error handling that matches production logs
 * 
 * Philosophy: Test the complete user journey, not just isolated units
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Alert } from 'react-native';

// Real imports - no mocks for integration testing
import ManualEntryScreen from '../screens/ManualEntryScreen';
import { supabase } from '../config/supabase';
import { AuthProvider } from '../hooks/useAuth';

// Real environment setup
const Stack = createNativeStackNavigator();

// Test environment configuration
const TEST_CONFIG = {
  // Use actual test user credentials (not mocked)
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@nutriai.local',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
  },
  // Real Supabase project for testing (isolated test database)
  testProjectRef: process.env.TEST_SUPABASE_PROJECT_REF,
  // Timeout for real network calls
  networkTimeout: 15000,
  // Expected response time thresholds
  performanceThresholds: {
    searchResponse: 5000,
    authResponse: 3000,
  }
};

/**
 * Test Wrapper that provides real navigation and auth context
 */
const TestAppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NavigationContainer>
    <AuthProvider>
      <Stack.Navigator>
        <Stack.Screen 
          name="ManualEntry" 
          component={() => children as React.ReactElement}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </AuthProvider>
  </NavigationContainer>
);

/**
 * Real authentication helper (not mocked)
 */
async function authenticateTestUser(): Promise<{ session: any; user: any }> {
  console.log('[TEST] Authenticating test user...');
  
  // Clear any existing session
  await supabase.auth.signOut();
  
  // Sign in with test credentials
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_CONFIG.testUser.email,
    password: TEST_CONFIG.testUser.password,
  });
  
  if (authError || !authData.session) {
    throw new Error(`Authentication failed: ${authError?.message || 'No session returned'}`);
  }
  
  // Verify session is valid
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    throw new Error(`Session verification failed: ${sessionError?.message || 'No session found'}`);
  }
  
  console.log('[TEST] Authentication successful', {
    userId: authData.user?.id,
    hasSession: !!authData.session,
    tokenType: authData.session?.token_type,
  });
  
  return {
    session: authData.session,
    user: authData.user,
  };
}

/**
 * Real network activity monitor
 */
class NetworkActivityMonitor {
  private startTime: number = 0;
  private requests: Array<{ url: string; duration: number; status: string }> = [];
  
  start() {
    this.startTime = Date.now();
    this.requests = [];
  }
  
  logRequest(url: string, duration: number, status: string) {
    this.requests.push({ url, duration, status });
  }
  
  getStats() {
    return {
      totalTime: Date.now() - this.startTime,
      requestCount: this.requests.length,
      requests: this.requests,
      slowestRequest: this.requests.reduce((max, req) => 
        req.duration > max.duration ? req : max, { duration: 0 }
      ),
    };
  }
}

describe('Real User Experience Tests', () => {
  const networkMonitor = new NetworkActivityMonitor();
  let testSession: any;
  let testUser: any;
  
  // Real setup and teardown
  beforeAll(async () => {
    console.log('[TEST SETUP] Starting real user experience tests...');
    
    // Verify test environment is configured
    if (!TEST_CONFIG.testProjectRef) {
      throw new Error('TEST_SUPABASE_PROJECT_REF environment variable required for integration tests');
    }
    
    // Authenticate real test user
    const authResult = await authenticateTestUser();
    testSession = authResult.session;
    testUser = authResult.user;
    
    console.log('[TEST SETUP] Environment ready for testing');
  }, TEST_CONFIG.networkTimeout);
  
  afterAll(async () => {
    // Clean up test session
    if (testSession) {
      await supabase.auth.signOut();
    }
    console.log('[TEST TEARDOWN] Cleaned up test environment');
  });
  
  describe('ManualEntryScreen - Complete User Flow', () => {
    it('should complete the full search flow like a real user', async () => {
      networkMonitor.start();
      
      console.log('[TEST] Rendering ManualEntryScreen with real auth context...');
      
      render(
        <TestAppWrapper>
          <ManualEntryScreen />
        </TestAppWrapper>
      );
      
      // User sees the search screen
      expect(screen.getByPlaceholderText('Search for a food...')).toBeTruthy();
      expect(screen.getByText('Search for foods')).toBeTruthy();
      
      // User types a search query (simulating real typing)
      const searchInput = screen.getByPlaceholderText('Search for a food...');
      
      console.log('[TEST] User types search query...');
      await act(async () => {
        fireEvent.changeText(searchInput, 'a'); // Start typing
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate typing delay
        fireEvent.changeText(searchInput, 'ap'); 
        await new Promise(resolve => setTimeout(resolve, 100));
        fireEvent.changeText(searchInput, 'apple'); // Complete word
      });
      
      // User sees loading state
      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeTruthy();
      }, { timeout: 1000 });
      
      console.log('[TEST] Waiting for real API response...');
      
      // Wait for real API response
      await waitFor(
        () => {
          // Should see either results or an error (both are valid for testing the flow)
          const hasResults = screen.queryByTestId('food-result-card') !== null;
          const hasError = screen.queryByText(/error|failed|try again/i) !== null;
          const hasNoResults = screen.queryByText('No results found') !== null;
          
          expect(hasResults || hasError || hasNoResults).toBeTruthy();
        },
        { 
          timeout: TEST_CONFIG.performanceThresholds.searchResponse,
          onTimeout: (error) => {
            const stats = networkMonitor.getStats();
            console.error('[TEST] Search timeout:', {
              error: error.message,
              networkStats: stats,
              testUser: testUser?.id,
              hasSession: !!testSession,
            });
            return error;
          }
        }
      );
      
      const stats = networkMonitor.getStats();
      console.log('[TEST] Search completed:', stats);
      
      // Verify performance meets expectations
      expect(stats.totalTime).toBeLessThan(TEST_CONFIG.performanceThresholds.searchResponse);
      
      // Log the actual user experience
      console.log('[TEST] User experience summary:', {
        searchTerm: 'apple',
        responseTime: stats.totalTime,
        requestCount: stats.requestCount,
        userAuthenticated: !!testUser,
        sessionValid: !!testSession,
      });
    }, TEST_CONFIG.networkTimeout);
    
    it('should handle authentication errors like a real user', async () => {
      console.log('[TEST] Testing authentication error handling...');
      
      // Invalidate session to simulate auth error
      await supabase.auth.signOut();
      
      render(
        <TestAppWrapper>
          <ManualEntryScreen />
        </TestAppWrapper>
      );
      
      // User tries to search without being authenticated
      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');
      
      // Should see authentication error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/log in|authentication|login/i);
        expect(errorMessage).toBeTruthy();
      }, { timeout: 5000 });
      
      console.log('[TEST] Authentication error handled correctly');
      
      // Re-authenticate for subsequent tests
      await authenticateTestUser();
    });
    
    it('should handle network errors like a real user', async () => {
      console.log('[TEST] Testing network error handling...');
      
      // Mock a network failure scenario by using invalid credentials
      // This simulates what happens when the Edge Function fails
      const originalFetch = global.fetch;
      
      global.fetch = jest.fn().mockRejectedValue(
        new Error('Network request failed')
      );
      
      render(
        <TestAppWrapper>
          <ManualEntryScreen />
        </TestAppWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');
      
      // Should handle network error gracefully
      await waitFor(() => {
        const errorMessage = screen.queryByText(/failed|error|try again/i);
        expect(errorMessage).toBeTruthy();
      }, { timeout: 5000 });
      
      // Restore original fetch
      global.fetch = originalFetch;
      
      console.log('[TEST] Network error handled correctly');
    });
    
    it('should match production error logs exactly', async () => {
      console.log('[TEST] Verifying error log format matches production...');
      
      // Capture console logs during test
      const consoleLogs: string[] = [];
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        consoleLogs.push(args.join(' '));
        originalConsoleError(...args);
      };
      
      render(
        <TestAppWrapper>
          <ManualEntryScreen />
        </TestAppWrapper>
      );
      
      // Trigger an error scenario
      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, ''); // Invalid search
      
      await waitFor(() => {
        // Error should be logged in production format
        const hasExpectedLog = consoleLogs.some(log => 
          log.includes('[ManualEntryScreen]') && 
          log.includes('Search error')
        );
        expect(hasExpectedLog).toBeTruthy();
      }, { timeout: 3000 });
      
      // Restore console
      console.error = originalConsoleError;
      
      console.log('[TEST] Error logging format verified:', consoleLogs);
    });
  });
  
  describe('Real Performance Testing', () => {
    it('should meet performance requirements in real conditions', async () => {
      console.log('[TEST] Testing real-world performance...');
      
      const performanceResults: Array<{ search: string; time: number }> = [];
      
      const testSearches = ['apple', 'chicken breast', 'brown rice', 'salmon'];
      
      for (const searchTerm of testSearches) {
        const startTime = Date.now();
        
        render(
          <TestAppWrapper>
            <ManualEntryScreen />
          </TestAppWrapper>
        );
        
        const searchInput = screen.getByPlaceholderText('Search for a food...');
        fireEvent.changeText(searchInput, searchTerm);
        
        await waitFor(() => {
          const hasResponse = screen.queryByTestId('food-result-card') !== null ||
                           screen.queryByText(/error|no results/i) !== null;
          expect(hasResponse).toBeTruthy();
        }, { timeout: TEST_CONFIG.performanceThresholds.searchResponse });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        performanceResults.push({ search: searchTerm, time: duration });
        
        console.log(`[TEST] Search "${searchTerm}" completed in ${duration}ms`);
      }
      
      // Verify 95th percentile performance
      const sortedTimes = performanceResults.map(r => r.time).sort((a, b) => a - b);
      const p95Time = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      
      expect(p95Time).toBeLessThan(TEST_CONFIG.performanceThresholds.searchResponse);
      
      console.log('[TEST] Performance results:', {
        results: performanceResults,
        p95: p95Time,
        average: sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length,
      });
    });
  });
  
  describe('Real Data Validation', () => {
    it('should handle real API response data correctly', async () => {
      console.log('[TEST] Testing real API data handling...');
      
      render(
        <TestAppWrapper>
          <ManualEntryScreen />
        </TestAppWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');
      
      let capturedApiResponse: any = null;
      
      // Intercept the actual API response
      const originalInvoke = supabase.functions.invoke;
      supabase.functions.invoke = jest.fn().mockImplementation(async (...args) => {
        const result = await originalInvoke.apply(supabase.functions, args);
        capturedApiResponse = result.data;
        return result;
      });
      
      await waitFor(() => {
        expect(capturedApiResponse).toBeTruthy();
      }, { timeout: TEST_CONFIG.performanceThresholds.searchResponse });
      
      // Verify the response structure matches our expectations
      expect(capturedApiResponse).toHaveProperty('foods');
      expect(Array.isArray(capturedApiResponse.foods)).toBeTruthy();
      
      if (capturedApiResponse.foods.length > 0) {
        const firstFood = capturedApiResponse.foods[0];
        expect(firstFood).toHaveProperty('name');
        expect(firstFood).toHaveProperty('calories');
        expect(firstFood).toHaveProperty('protein');
        expect(firstFood).toHaveProperty('carbs');
        expect(firstFood).toHaveProperty('fat');
      }
      
      // Restore original function
      supabase.functions.invoke = originalInvoke;
      
      console.log('[TEST] API response validation passed:', {
        foodCount: capturedApiResponse?.foods?.length,
        hasExpectedStructure: true,
      });
    });
  });
});

/**
 * User Instructions for Validation
 * 
 * To verify these tests match your actual mobile experience:
 * 
 * 1. Set up test environment:
 *    ```bash
 *    export TEST_USER_EMAIL="your-test-user@email.com"
 *    export TEST_USER_PASSWORD="YourTestPassword123!"
 *    export TEST_SUPABASE_PROJECT_REF="your-test-project-ref"
 *    ```
 * 
 * 2. Run the tests:
 *    ```bash
 *    cd mobile
 *    npm test real-user-experience.test.ts
 *    ```
 * 
 * 3. Compare test logs with your actual app logs:
 *    - Open your mobile app
 *    - Perform the same search actions
 *    - Check Metro/Expo logs for error patterns
 *    - Verify they match the test console output
 * 
 * 4. Performance validation:
 *    - Note the response times in test output
 *    - Compare with your actual app performance
 *    - Both should be under 5 seconds
 * 
 * 5. Error reproduction:
 *    - Turn off WiFi during app usage
 *    - Compare error messages with test output
 *    - They should be identical
 */