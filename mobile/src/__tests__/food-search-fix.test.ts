/**
 * Test suite to verify the food search functionality fix
 */

import { searchFoods, foodItemToMealAnalysis } from '../services/foodSearch';
import { supabase } from '../config/supabase';

// Mock Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('Food Search Fix Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Export/Import', () => {
    it('should export searchFoods function', () => {
      expect(typeof searchFoods).toBe('function');
    });

    it('should export foodItemToMealAnalysis function', () => {
      expect(typeof foodItemToMealAnalysis).toBe('function');
    });
  });

  describe('searchFoods Function', () => {
    const mockSession = {
      access_token: 'mock-token-123',
      user: { id: 'user-123' },
    };

    beforeEach(() => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
    });

    it('should handle successful food search', async () => {
      const mockResponse = {
        foods: [
          {
            fdcId: '123',
            name: 'Apple',
            brand: null,
            calories: 95,
            protein: 0.5,
            carbs: 25,
            fat: 0.3,
            servingSize: 1,
            servingUnit: 'medium',
            verified: false,
          },
        ],
        hasMore: false,
        total: 1,
        page: 1,
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const result = await searchFoods({ query: 'apple', limit: 10 });

      expect(result).toEqual(mockResponse);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('food-search', {
        body: { query: 'apple', limit: 10, page: 1 },
        headers: { Authorization: `Bearer ${mockSession.access_token}` },
      });
    });

    it('should handle empty search query', async () => {
      await expect(searchFoods({ query: '' })).rejects.toThrow(
        'Please check your search terms and try again.'
      );
    });

    it('should handle whitespace-only query', async () => {
      await expect(searchFoods({ query: '   ' })).rejects.toThrow(
        'Please check your search terms and try again.'
      );
    });

    it('should handle authentication errors', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(searchFoods({ query: 'apple' })).rejects.toThrow(
        'Please log in to search for foods.'
      );
    });

    it('should handle Edge Function errors', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Edge Function error'),
      });

      await expect(searchFoods({ query: 'apple' })).rejects.toThrow(
        'Failed to search foods. Please try again.'
      );
    });

    it('should handle rate limiting', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: {
          stage: 'rate-limited',
          error: 'Too many requests',
          requestId: 'req_123',
        },
        error: null,
      });

      await expect(searchFoods({ query: 'apple' })).rejects.toThrow(
        'Too many searches. Please wait a moment before trying again.'
      );
    });
  });

  describe('foodItemToMealAnalysis Function', () => {
    it('should convert food item to meal analysis format', () => {
      const foodItem = {
        fdcId: '123',
        name: 'Apple',
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
        verified: false,
      };

      const result = foodItemToMealAnalysis(foodItem);

      expect(result).toEqual({
        mealName: 'Apple',
        totalCalories: 95,
        nutrients: {
          protein: 1,
          carbs: 25,
          fat: 0,
          fiber: 4,
          sugar: 19,
          sodium: 2,
        },
        servingInfo: {
          amount: 1,
          unit: 'medium',
        },
        items: [
          {
            name: 'Apple',
            brand: null,
            calories: 95,
            protein: 1,
            carbs: 25,
            fat: 0,
            servingSize: '1 medium',
            verified: false,
          },
        ],
        confidence: 0.85,
        source: 'manual',
      });
    });

    it('should handle missing optional nutrients', () => {
      const foodItem = {
        fdcId: '123',
        name: 'Test Food',
        calories: 100,
        protein: 10,
        carbs: 20,
        fat: 5,
        servingSize: 100,
        servingUnit: 'g',
        verified: true,
      };

      const result = foodItemToMealAnalysis(foodItem);

      expect(result.nutrients.fiber).toBe(0);
      expect(result.nutrients.sugar).toBe(0);
      expect(result.nutrients.sodium).toBe(0);
      expect(result.confidence).toBe(0.95); // Higher for verified items
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in search', async () => {
      const specialQueries = [
        '2% milk',
        'mac & cheese',
        "M&M's",
        'Häagen-Dazs',
        '🍎', // emoji
      ];

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { foods: [], hasMore: false, total: 0, page: 1 },
        error: null,
      });

      for (const query of specialQueries) {
        await expect(searchFoods({ query })).resolves.toBeDefined();
      }
    });

    it('should handle very long search queries', async () => {
      const longQuery = 'a'.repeat(101); // Over 100 chars

      await expect(searchFoods({ query: longQuery })).rejects.toThrow(
        'Please check your search terms and try again.'
      );
    });

    it('should handle pagination correctly', async () => {
      const mockPage1 = {
        foods: Array(25).fill({ name: 'Food' }),
        hasMore: true,
        total: 50,
        page: 1,
      };

      const mockPage2 = {
        foods: Array(25).fill({ name: 'Food' }),
        hasMore: false,
        total: 50,
        page: 2,
      };

      (supabase.functions.invoke as jest.Mock)
        .mockResolvedValueOnce({ data: mockPage1, error: null })
        .mockResolvedValueOnce({ data: mockPage2, error: null });

      const result1 = await searchFoods({ query: 'food', page: 1 });
      const result2 = await searchFoods({ query: 'food', page: 2 });

      expect(result1.hasMore).toBe(true);
      expect(result2.hasMore).toBe(false);
    });
  });
});
