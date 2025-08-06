import { signIn } from '../services/auth';
import { supabase } from '../config/supabase';

// Mock Supabase
jest.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      upsert: jest.fn(),
    })),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should handle preferences error gracefully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      // Mock successful sign in
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: {} },
        error: null,
      });

      // Mock preferences error (not PGRST116)
      const mockPrefsError = { code: 'PGRST500', message: 'Database error' };
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: mockPrefsError,
      });
      const mockEq = jest.fn().mockReturnValueOnce({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValueOnce({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValueOnce({ select: mockSelect });

      // Mock upsert error
      const mockUpsertError = { message: 'Upsert failed' };
      const mockUpsert = jest.fn().mockResolvedValueOnce({
        data: null,
        error: mockUpsertError,
      });
      (supabase.from as jest.Mock).mockReturnValueOnce({ upsert: mockUpsert });

      // Call signIn
      const result = await signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      // Should still return successful user despite preferences errors
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle missing preferences correctly', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      // Mock successful sign in
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: {} },
        error: null,
      });

      // Mock no preferences found (PGRST116)
      const mockPrefsError = { code: 'PGRST116', message: 'No rows found' };
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: mockPrefsError,
      });
      const mockEq = jest.fn().mockReturnValueOnce({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValueOnce({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValueOnce({ select: mockSelect });

      // Mock successful upsert
      const mockUpsert = jest.fn().mockResolvedValueOnce({
        data: { user_id: mockUser.id, has_completed_onboarding: true },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValueOnce({ upsert: mockUpsert });

      // Call signIn
      const result = await signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      // Should return successful user
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();

      // Should have attempted to create preferences
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          has_completed_onboarding: true,
        }),
        { onConflict: 'user_id' }
      );
    });
  });
});
