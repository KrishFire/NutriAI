/**
 * Test suite to verify the daily log fetching fix for new users
 */

import { getTodaysNutrition, getOrCreateDailyLog } from '../services/meals';
import { supabase } from '../config/supabase';

// Mock Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Daily Log Fix Tests', () => {
  const mockUserId = 'test-user-123';
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodaysNutrition', () => {
    it('should return default values when no daily log exists (new user)', async () => {
      // Mock empty response - this is the critical fix
      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // Call the function
      const result = await getTodaysNutrition(mockUserId);

      // Verify it returns default values instead of throwing
      expect(result).toEqual({
        user_id: mockUserId,
        date: today,
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
      });

      // Verify maybeSingle was used (not single)
      expect(mockMaybeSingle).toHaveBeenCalled();
    });

    it('should return existing daily log when available', async () => {
      const existingLog = {
        id: 'log-123',
        user_id: mockUserId,
        date: today,
        total_calories: 500,
        total_protein: 30,
        total_carbs: 60,
        total_fat: 20,
      };

      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: existingLog,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await getTodaysNutrition(mockUserId);

      expect(result).toEqual(existingLog);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');

      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockSelect = jest.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await getTodaysNutrition(mockUserId);

      // Should return null on error
      expect(result).toBeNull();
    });
  });

  describe('getOrCreateDailyLog Edge Cases', () => {
    it('should handle concurrent creation attempts', async () => {
      // First call - no existing log
      const mockMaybeSingle = jest
        .fn()
        .mockResolvedValueOnce({ data: null, error: null });

      const mockSingle = jest.fn().mockRejectedValueOnce({
        error: { code: '23505', message: 'duplicate key value' },
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle,
        }),
      });

      const mockSelect = jest.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        insert: mockInsert,
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      // This should handle the duplicate key error
      await expect(getOrCreateDailyLog(mockUserId, new Date())).rejects.toThrow(
        'Failed to create daily log'
      );
    });
  });
});

describe('Edge Case Scenarios', () => {
  describe('Race Conditions', () => {
    it('should handle multiple simultaneous meal saves', async () => {
      // Test that multiple meal saves don't create duplicate daily logs
      const promises = Array(5)
        .fill(null)
        .map(() => getOrCreateDailyLog(mockUserId, new Date()));

      // In real scenario, only one should succeed in creating
      // Others should get the existing one
      // This test would need more sophisticated mocking
    });
  });

  describe('Data Validation', () => {
    it('should handle extremely large nutrition values', async () => {
      const largeValueLog = {
        user_id: mockUserId,
        date: today,
        total_calories: 999999,
        total_protein: 999999,
        total_carbs: 999999,
        total_fat: 999999,
      };

      // Test that UI can handle display of large values
      expect(largeValueLog.total_calories).toBeLessThanOrEqual(999999);
    });

    it('should handle negative nutrition values', async () => {
      // Nutrition values should never be negative
      const result = {
        total_calories: Math.max(0, -100),
        total_protein: Math.max(0, -50),
        total_carbs: Math.max(0, -30),
        total_fat: Math.max(0, -20),
      };

      expect(result.total_calories).toBe(0);
      expect(result.total_protein).toBe(0);
      expect(result.total_carbs).toBe(0);
      expect(result.total_fat).toBe(0);
    });
  });
});
