/**
 * Debug Test Script
 * 
 * Run this to verify debug logging is working correctly
 * Usage: Add to a test file or run in your app
 */

import foodSearchService from '../services/foodSearch';

// Mock Supabase for testing (remove in real app)
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
            user: { id: 'test-user-123' }
          }
        },
        error: null
      })
    },
    functions: {
      invoke: jest.fn().mockResolvedValue({
        data: {
          resultGroups: [{
            title: 'Common Foods',
            items: [{
              id: '123',
              name: 'Apple',
              servingSize: 100,
              servingUnit: 'g',
              calories: 52,
              protein: 0.3,
              carbs: 14,
              fat: 0.2
            }]
          }],
          totalRemaining: 0,
          suggestedQueries: [],
          meta: {
            query: 'apple',
            totalResults: 1,
            currentPage: 1,
            processingTime: 150
          }
        },
        error: null
      })
    }
  }
}));

describe('Debug Logging Test', () => {
  beforeEach(() => {
    // Enable debug mode
    process.env.EXPO_PUBLIC_DEBUG_FOOD_SEARCH = 'true';
    
    // Capture console logs
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should produce debug logs with correlation ID', async () => {
    const result = await foodSearchService.searchFoods('apple');
    
    // Verify we got a result
    expect(result.success).toBe(true);
    
    // Check that debug logs were produced
    const logs = (console.log as jest.Mock).mock.calls;
    
    // Find logs with correlation ID
    const correlationLogs = logs.filter(call => 
      call[0].includes('[SEARCH_START]') ||
      call[0].includes('[VALIDATION]') ||
      call[0].includes('[AUTH_CHECK]') ||
      call[0].includes('[API_CALL_START]')
    );
    
    console.log('Debug logs captured:', correlationLogs.length);
    
    // Verify we have logs for key stages
    expect(correlationLogs.length).toBeGreaterThan(0);
    
    // Extract correlation ID from first log
    const firstLog = logs.find(call => call[0].includes('[SEARCH_START]'));
    if (firstLog && firstLog[1]) {
      const correlationId = firstLog[1].correlationId;
      console.log('Correlation ID:', correlationId);
      
      // Verify correlation ID format (UUID v4)
      expect(correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    }
  });

  test('should log authentication errors', async () => {
    // Mock auth failure
    const { supabase } = require('../config/supabase');
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null
    });

    const result = await foodSearchService.searchFoods('apple');
    
    expect(result.success).toBe(false);
    expect(result.error?.stage).toBe('authentication');
    
    // Check error logs
    const errorLogs = (console.error as jest.Mock).mock.calls;
    const authErrorLog = errorLogs.find(call => 
      call[0].includes('[AUTH_MISSING]')
    );
    
    expect(authErrorLog).toBeDefined();
  });

  test('should log API errors with details', async () => {
    // Mock API error
    const { supabase } = require('../config/supabase');
    const mockError = {
      message: 'Function returned error',
      status: 500,
      response: {
        json: async () => ({
          error: 'Internal server error',
          details: {
            stage: 'usda-api',
            message: 'USDA API unavailable',
            requestId: 'server-req-123'
          }
        })
      }
    };
    
    supabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: mockError
    });

    const result = await foodSearchService.searchFoods('apple');
    
    expect(result.success).toBe(false);
    
    // Check that detailed error was logged
    const errorLogs = (console.error as jest.Mock).mock.calls;
    const apiErrorLog = errorLogs.find(call => 
      call[0].includes('[API_ERROR_DETAILS]')
    );
    
    expect(apiErrorLog).toBeDefined();
    if (apiErrorLog && apiErrorLog[1]) {
      expect(apiErrorLog[1].errorBody).toEqual({
        error: 'Internal server error',
        details: {
          stage: 'usda-api',
          message: 'USDA API unavailable',
          requestId: 'server-req-123'
        }
      });
    }
  });
});