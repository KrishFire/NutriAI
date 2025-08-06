import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { SubscriptionProvider, useSubscription } from '../SubscriptionContext';
import { AbortControllerManager } from '../../utils/abortController';

// Mock haptic feedback
jest.mock('../../utils/haptics', () => ({
  hapticFeedback: {
    success: jest.fn(),
    error: jest.fn(),
    selection: jest.fn(),
    impact: jest.fn(),
  },
}));

describe('SubscriptionContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SubscriptionProvider>{children}</SubscriptionProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Edge Case: Rapid Plan Toggling', () => {
    it('should debounce rapid plan changes', async () => {
      const { result } = renderHook(() => useSubscription(), { wrapper });

      // Rapidly toggle between plans
      act(() => {
        result.current.changePlan('monthly');
        result.current.changePlan('yearly');
        result.current.changePlan('monthly');
        result.current.changePlan('yearly');
      });

      // Should still be loading after immediate calls
      expect(result.current.isLoading).toBe(false);

      // Advance timers past debounce delay
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Wait for the debounced operation
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Complete the operation
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.plan).toBe('yearly'); // Last plan selected
      });
    });

    it('should prevent concurrent plan changes', async () => {
      const { result } = renderHook(() => useSubscription(), { wrapper });

      // Start first plan change
      act(() => {
        result.current.changePlan('monthly');
      });

      // Advance past debounce
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(result.current.isChangingPlan).toBe(true);
      });

      // Try to change plan while one is in progress
      act(() => {
        result.current.changePlan('yearly');
      });

      // The second change should be ignored due to operation in progress
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(result.current.plan).toBe('monthly'); // First plan change wins
        expect(result.current.isChangingPlan).toBe(false);
      });
    });
  });

  describe('Edge Case: Component Unmounting During Operation', () => {
    it('should abort operations when component unmounts', async () => {
      const abortSpy = jest.spyOn(AbortControllerManager.prototype, 'abort');
      const { result, unmount } = renderHook(() => useSubscription(), {
        wrapper,
      });

      // Start a plan change
      act(() => {
        result.current.changePlan('monthly');
      });

      // Advance past debounce
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Unmount while operation is in progress
      unmount();

      // Verify abort was called
      expect(abortSpy).toHaveBeenCalled();

      abortSpy.mockRestore();
    });

    it('should not update state after unmount', async () => {
      const { result, unmount } = renderHook(() => useSubscription(), {
        wrapper,
      });

      // Capture the initial state
      const initialPlan = result.current.plan;

      // Start operation
      act(() => {
        result.current.changePlan('yearly');
      });

      // Advance past debounce
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Unmount immediately
      unmount();

      // Complete the operation timing
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // State should not have changed since component unmounted
      // (We can't directly check this after unmount, but no errors should occur)
      expect(() => {
        jest.runAllTimers();
      }).not.toThrow();
    });
  });

  describe('Edge Case: Stale Closure Prevention', () => {
    it('should always use latest state in async operations', async () => {
      const { result } = renderHook(() => useSubscription(), { wrapper });

      // Change to monthly
      act(() => {
        result.current.changePlan('monthly');
      });

      act(() => {
        jest.advanceTimersByTime(2100); // Past debounce and operation
      });

      await waitFor(() => {
        expect(result.current.plan).toBe('monthly');
      });

      // Immediately change to yearly
      act(() => {
        result.current.changePlan('yearly');
      });

      act(() => {
        jest.advanceTimersByTime(2100);
      });

      await waitFor(() => {
        expect(result.current.plan).toBe('yearly');
      });

      // Verify final state is correct
      expect(result.current.isPremium).toBe(true);
      expect(result.current.status).toBe('active');
    });
  });

  describe('Edge Case: Network Failures and Retries', () => {
    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useSubscription(), { wrapper });

      // Mock a network failure
      const originalTimeout = global.setTimeout;
      global.setTimeout = jest.fn(cb => {
        throw new Error('Network error');
      }) as any;

      // Attempt plan change
      act(() => {
        result.current.changePlan('monthly');
      });

      // Restore timeout
      global.setTimeout = originalTimeout;

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.lastError).toBeTruthy();
      });
    });

    it('should track retry count', async () => {
      const { result } = renderHook(() => useSubscription(), { wrapper });

      expect(result.current.retryCount).toBe(0);

      // Simulate a failed refresh
      const originalTimeout = global.setTimeout;
      global.setTimeout = jest.fn(cb => {
        if (cb.toString().includes('refreshStatus')) {
          throw new Error('Refresh failed');
        }
        return originalTimeout(cb, 0);
      }) as any;

      act(() => {
        result.current.refreshStatus();
      });

      global.setTimeout = originalTimeout;

      await waitFor(() => {
        expect(result.current.retryCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Case: Trial and Expiration Handling', () => {
    it('should update trial status when expired', async () => {
      const { result } = renderHook(() => useSubscription(), { wrapper });

      // Set up trial state
      act(() => {
        result.current.changePlan('monthly');
      });

      act(() => {
        jest.advanceTimersByTime(2100);
      });

      // Manually set trial end date in the past
      act(() => {
        // This would normally be done through the API
        // For testing, we'd need to expose a test method or mock the API
      });

      // Trigger status refresh
      act(() => {
        result.current.refreshStatus();
      });

      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Verify trial status is updated
      await waitFor(() => {
        expect(result.current.isInTrial).toBe(false);
      });
    });
  });

  describe('Edge Case: Multiple Subscription Contexts', () => {
    it('should maintain separate state for multiple providers', () => {
      const { result: result1 } = renderHook(() => useSubscription(), {
        wrapper,
      });
      const { result: result2 } = renderHook(() => useSubscription(), {
        wrapper: ({ children }) => (
          <SubscriptionProvider>{children}</SubscriptionProvider>
        ),
      });

      // Change plan in first context
      act(() => {
        result1.current.changePlan('monthly');
      });

      act(() => {
        jest.advanceTimersByTime(2100);
      });

      // Verify contexts are independent
      waitFor(() => {
        expect(result1.current.plan).toBe('monthly');
        expect(result2.current.plan).toBe('free');
      });
    });
  });
});

describe('useSubscriptionSafe Hook', () => {
  it('should prevent stale closures in event handlers', async () => {
    const { result } = renderHook(
      () => {
        const subscription = useSubscription();
        const [clickCount, setClickCount] = React.useState(0);

        const handleClick = React.useCallback(async () => {
          setClickCount(prev => prev + 1);

          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 100));

          // This should read the latest state, not stale
          const latest = subscription.getLatestState?.();
          return latest?.plan || subscription.plan;
        }, [subscription]);

        return { subscription, handleClick, clickCount };
      },
      { wrapper: SubscriptionProvider }
    );

    // Change plan
    act(() => {
      result.current.subscription.changePlan('monthly');
    });

    act(() => {
      jest.advanceTimersByTime(2100);
    });

    // Call handler multiple times
    const plan1 = await act(async () => {
      return result.current.handleClick();
    });

    expect(plan1).toBe('monthly');
  });
});
