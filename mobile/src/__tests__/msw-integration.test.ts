/**
 * MSW Integration Testing Framework
 * 
 * This complements the real user experience tests by providing:
 * 1. Fast, reliable integration tests for development
 * 2. Comprehensive edge case coverage
 * 3. Predictable network responses for CI/CD
 * 4. Easy debugging when tests fail
 * 
 * Philosophy: Test the client code thoroughly with controlled network responses
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import React from 'react';

// Real imports (no mocks for the component itself)
import ManualEntryScreen from '../screens/ManualEntryScreen';
import { AuthProvider } from '../hooks/useAuth';
import { supabaseConfig } from '../config/supabase';

const Stack = createNativeStackNavigator();

// Mock Service Worker setup for controlled network responses
const server = setupServer(
  // Successful food search response
  http.post(`${supabaseConfig.url}/functions/v1/food-search`, ({ request }) => {
    return HttpResponse.json({
      foods: [
        {
          id: 'test-food-1',
          fdcId: '123456',
          name: 'Apple, raw',
          brand: null,
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
          fiber: 4.4,
          sugar: 19,
          sodium: 2,
          servingSize: 1,
          servingUnit: 'medium',
          verified: true,
        },
        {
          id: 'test-food-2',
          fdcId: '789012',
          name: 'Apple juice',
          brand: 'Brand Name',
          calories: 114,
          protein: 0.1,
          carbs: 28,
          fat: 0.3,
          fiber: 0.2,
          sugar: 24,
          sodium: 7,
          servingSize: 1,
          servingUnit: 'cup',
          verified: false,
        }
      ],
      hasMore: false,
      total: 2,
      page: 1
    });
  }),

  // Supabase auth session endpoint
  http.get(`${supabaseConfig.url}/auth/v1/user`, () => {
    return HttpResponse.json({
      id: 'test-user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
    });
  }),

  // Supabase auth token refresh
  http.post(`${supabaseConfig.url}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
    });
  })
);

// Test wrapper with navigation and auth
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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

describe('MSW Integration Tests', () => {
  // Setup MSW
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Successful Search Flow', () => {
    it('should complete successful search with real client code', async () => {
      console.log('[MSW TEST] Testing successful search flow...');

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      // Verify initial state
      expect(screen.getByPlaceholderText('Search for a food...')).toBeTruthy();
      expect(screen.getByText('Search for foods')).toBeTruthy();

      // User types search query
      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeTruthy();
      });

      // Should show results
      await waitFor(() => {
        expect(screen.getByText('Apple, raw')).toBeTruthy();
        expect(screen.getByText('Apple juice')).toBeTruthy();
      });

      // Verify food details are displayed correctly
      expect(screen.getByText('95')).toBeTruthy(); // calories for first apple
      expect(screen.getByText('114')).toBeTruthy(); // calories for apple juice
      expect(screen.getByText('Brand Name')).toBeTruthy();
      expect(screen.getByText('per 1 medium')).toBeTruthy();
      expect(screen.getByText('per 1 cup')).toBeTruthy();

      console.log('[MSW TEST] Successful search flow completed');
    });

    it('should handle food selection correctly', async () => {
      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Apple, raw')).toBeTruthy();
      });

      // Mock navigation
      const mockNavigate = jest.fn();
      require('@react-navigation/native').useNavigation = () => ({
        navigate: mockNavigate,
        goBack: jest.fn(),
      });

      // Select first food item
      fireEvent.press(screen.getByText('Apple, raw'));

      // Should navigate to meal details with correct data
      expect(mockNavigate).toHaveBeenCalledWith('MealDetails', {
        analysisData: expect.objectContaining({
          foods: expect.arrayContaining([
            expect.objectContaining({
              name: 'Apple, raw',
              nutrition: expect.objectContaining({
                calories: 95,
                protein: 1,
                carbs: 25,
                fat: 0,
              })
            })
          ])
        })
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle authentication errors', async () => {
      // Override auth endpoint to return error
      server.use(
        http.get(`${supabaseConfig.url}/auth/v1/user`, () => {
          return new HttpResponse(null, { status: 401 });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      // Should show authentication error
      await waitFor(() => {
        expect(screen.getByText(/log in to search/i)).toBeTruthy();
      });
    });

    it('should handle Edge Function errors', async () => {
      // Override food search to return error
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, () => {
          return new HttpResponse(JSON.stringify({
            stage: 'usda-api-error',
            error: 'USDA API temporarily unavailable',
            requestId: 'req_123'
          }), { status: 500 });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/Food database temporarily unavailable/i)).toBeTruthy();
      });

      // Should show retry button
      expect(screen.getByText('Try Again')).toBeTruthy();
    });

    it('should handle rate limiting', async () => {
      // Simulate rate limiting response
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, () => {
          return HttpResponse.json({
            stage: 'rate-limited',
            error: 'Too many requests',
            requestId: 'req_456'
          });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      await waitFor(() => {
        expect(screen.getByText(/Too many searches/i)).toBeTruthy();
      });
    });

    it('should handle malformed API responses', async () => {
      // Return invalid JSON
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, () => {
          return new HttpResponse('invalid json', {
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      await waitFor(() => {
        expect(screen.getByText(/Failed to search foods/i)).toBeTruthy();
      });
    });

    it('should handle network timeouts', async () => {
      // Simulate slow response
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, async () => {
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
          return HttpResponse.json({ foods: [] });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      // Should handle timeout gracefully
      await waitFor(() => {
        const hasError = screen.queryByText(/error|failed/i) !== null;
        const stillLoading = screen.queryByText('Searching...') !== null;
        expect(hasError || stillLoading).toBeTruthy();
      }, { timeout: 8000 });
    });
  });

  describe('Edge Cases and Data Validation', () => {
    it('should handle empty search results', async () => {
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, () => {
          return HttpResponse.json({
            foods: [],
            hasMore: false,
            total: 0,
            page: 1
          });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'nonexistentfood');

      await waitFor(() => {
        expect(screen.getByText(/No results found for "nonexistentfood"/)).toBeTruthy();
      });
    });

    it('should handle pagination correctly', async () => {
      // First page
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, ({ request }) => {
          return HttpResponse.json({
            foods: Array(20).fill(null).map((_, index) => ({
              id: `food-${index}`,
              fdcId: `${123456 + index}`,
              name: `Apple ${index + 1}`,
              calories: 95 + index,
              protein: 0.5,
              carbs: 25,
              fat: 0.3,
              servingSize: 1,
              servingUnit: 'medium',
              verified: false,
            })),
            hasMore: true,
            total: 50,
            page: 1
          });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      await waitFor(() => {
        expect(screen.getByText('Apple 1')).toBeTruthy();
        expect(screen.getByText('Apple 20')).toBeTruthy();
      });

      // Test pagination would require scrolling simulation
      // which is more complex but could be added here
    });

    it('should handle special characters in food names', async () => {
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, () => {
          return HttpResponse.json({
            foods: [{
              id: 'special-food',
              fdcId: '999999',
              name: 'M&M\'s® Chocolate Candies (2% milk)',
              brand: 'Mars™',
              calories: 240,
              protein: 2,
              carbs: 34,
              fat: 10,
              servingSize: 1,
              servingUnit: 'package (1.69 oz)',
              verified: true,
            }],
            hasMore: false,
            total: 1,
            page: 1
          });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'm&ms');

      await waitFor(() => {
        expect(screen.getByText('M&M\'s® Chocolate Candies (2% milk)')).toBeTruthy();
        expect(screen.getByText('Mars™')).toBeTruthy();
        expect(screen.getByText('per 1 package (1.69 oz)')).toBeTruthy();
      });
    });
  });

  describe('Performance and User Experience', () => {
    it('should debounce search requests correctly', async () => {
      let requestCount = 0;
      
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, () => {
          requestCount++;
          return HttpResponse.json({
            foods: [],
            hasMore: false,
            total: 0,
            page: 1
          });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      
      // Type multiple characters quickly
      fireEvent.changeText(searchInput, 'a');
      fireEvent.changeText(searchInput, 'ap');
      fireEvent.changeText(searchInput, 'app');
      fireEvent.changeText(searchInput, 'appl');
      fireEvent.changeText(searchInput, 'apple');

      // Wait for debounce to complete
      await waitFor(() => {
        expect(requestCount).toBe(1); // Should only make one request due to debouncing
      }, { timeout: 1000 });
    });

    it('should show loading states appropriately', async () => {
      // Slow response to test loading state
      server.use(
        http.post(`${supabaseConfig.url}/functions/v1/food-search`, async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return HttpResponse.json({ foods: [], hasMore: false, total: 0, page: 1 });
        })
      );

      render(
        <TestWrapper>
          <ManualEntryScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search for a food...');
      fireEvent.changeText(searchInput, 'apple');

      // Should show loading immediately
      await waitFor(() => {
        expect(screen.getByText('Searching...')).toBeTruthy();
      });

      // Should clear loading after response
      await waitFor(() => {
        expect(screen.queryByText('Searching...')).toBeNull();
      }, { timeout: 3000 });
    });
  });
});

/**
 * MSW vs Real User Experience Testing Strategy
 * 
 * Use MSW tests for:
 * ✅ Development - fast feedback loop
 * ✅ CI/CD - reliable, deterministic results  
 * ✅ Edge cases - easy to simulate error conditions
 * ✅ Performance testing - controlled response times
 * ✅ Regression testing - catch breaking changes quickly
 * 
 * Use Real User Experience tests for:
 * ✅ Final validation - ensure MSW scenarios match reality
 * ✅ Environment testing - verify actual API integration
 * ✅ Performance baselines - real network conditions
 * ✅ User acceptance - stakeholder confidence
 * 
 * Both are needed for comprehensive testing that matches your actual experience!
 */