import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import {
  AbortControllerManager,
  createAbortablePromise,
} from '../utils/abortController';
import { useDebouncedCallback } from '../utils/debounce';
import { hapticFeedback } from '../utils/haptics';

/**
 * Subscription Plan Types
 */
export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'expired'
  | 'cancelled';

/**
 * Subscription State Interface
 */
export interface SubscriptionState {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  expiresAt: Date | null;
  trialEndsAt: Date | null;
  isInTrial: boolean;
  canAccessPremiumFeatures: boolean;
}

/**
 * Subscription Context Type
 */
interface SubscriptionContextType extends SubscriptionState {
  // Actions
  changePlan: (plan: SubscriptionPlan) => Promise<void>;
  restorePurchases: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshStatus: () => Promise<void>;

  // State helpers
  isChangingPlan: boolean;
  lastError: Error | null;
  retryCount: number;
}

/**
 * Default subscription state
 */
const defaultState: SubscriptionState = {
  plan: 'free',
  status: 'inactive',
  isPremium: false,
  isLoading: false,
  error: null,
  expiresAt: null,
  trialEndsAt: null,
  isInTrial: false,
  canAccessPremiumFeatures: false,
};

/**
 * Subscription Context
 */
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

/**
 * Subscription Provider Component
 */
export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Core state
  const [state, setState] = useState<SubscriptionState>(defaultState);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for tracking component lifecycle
  const isMountedRef = useRef(true);
  const abortManagerRef = useRef(new AbortControllerManager());
  const stateRef = useRef(state);

  // Keep state ref updated
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Safe state update that checks if component is still mounted
   */
  const safeSetState = useCallback((updates: Partial<SubscriptionState>) => {
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        ...updates,
      }));
    }
  }, []);

  /**
   * Calculate derived state
   */
  const canAccessPremiumFeatures = useMemo(() => {
    return (
      state.isPremium ||
      state.isInTrial ||
      (state.status === 'active' && state.plan !== 'free')
    );
  }, [state.isPremium, state.isInTrial, state.status, state.plan]);

  /**
   * Update derived state when dependencies change
   */
  useEffect(() => {
    safeSetState({ canAccessPremiumFeatures });
  }, [canAccessPremiumFeatures, safeSetState]);

  /**
   * Simulate API call to change subscription plan
   * In production, this would call your payment processor API
   */
  const changePlanInternal = useCallback(
    async (newPlan: SubscriptionPlan) => {
      // Create abort controller for this operation
      const controller = abortManagerRef.current.create('changePlan');

      try {
        setIsChangingPlan(true);
        setLastError(null);
        safeSetState({ isLoading: true, error: null });

        // Simulate API delay
        await createAbortablePromise(
          new Promise(resolve => setTimeout(resolve, 1500)),
          controller.signal,
          'Plan change cancelled'
        );

        // Check if operation was aborted
        if (controller.signal.aborted) {
          return;
        }

        // Update state with new plan
        const isPremium = newPlan !== 'free';
        const newStatus: SubscriptionStatus = isPremium ? 'active' : 'inactive';

        safeSetState({
          plan: newPlan,
          status: newStatus,
          isPremium,
          isLoading: false,
          error: null,
          expiresAt: isPremium
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
        });

        // Reset retry count on success
        setRetryCount(0);

        await hapticFeedback.success();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Plan change aborted');
          return;
        }

        console.error('Error changing plan:', error);
        setLastError(error as Error);
        safeSetState({
          isLoading: false,
          error: 'Failed to change subscription plan. Please try again.',
        });

        await hapticFeedback.error();
        throw error;
      } finally {
        if (isMountedRef.current) {
          setIsChangingPlan(false);
        }
      }
    },
    [safeSetState]
  );

  /**
   * Debounced plan change to prevent rapid toggling
   */
  const changePlan = useDebouncedCallback(
    changePlanInternal,
    500, // 500ms debounce delay
    []
  );

  /**
   * Restore purchases
   */
  const restorePurchases = useCallback(async () => {
    const controller = abortManagerRef.current.create('restorePurchases');

    try {
      safeSetState({ isLoading: true, error: null });

      // Simulate API call
      await createAbortablePromise(
        new Promise(resolve => setTimeout(resolve, 2000)),
        controller.signal
      );

      if (controller.signal.aborted) {
        return;
      }

      // In production, check with payment processor
      // For now, we'll just refresh the status
      await refreshStatus();

      await hapticFeedback.success();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error('Error restoring purchases:', error);
      safeSetState({
        isLoading: false,
        error: 'Failed to restore purchases. Please try again.',
      });

      await hapticFeedback.error();
    }
  }, [safeSetState]);

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(async () => {
    const controller = abortManagerRef.current.create('cancelSubscription');

    try {
      safeSetState({ isLoading: true, error: null });

      // Simulate API call
      await createAbortablePromise(
        new Promise(resolve => setTimeout(resolve, 1000)),
        controller.signal
      );

      if (controller.signal.aborted) {
        return;
      }

      safeSetState({
        status: 'cancelled',
        isLoading: false,
        error: null,
      });

      await hapticFeedback.success();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error('Error cancelling subscription:', error);
      safeSetState({
        isLoading: false,
        error: 'Failed to cancel subscription. Please try again.',
      });

      await hapticFeedback.error();
    }
  }, [safeSetState]);

  /**
   * Refresh subscription status
   */
  const refreshStatus = useCallback(async () => {
    const controller = abortManagerRef.current.create('refreshStatus');

    try {
      // Don't show loading state for refresh
      setLastError(null);

      // Simulate API call
      await createAbortablePromise(
        new Promise(resolve => setTimeout(resolve, 500)),
        controller.signal
      );

      if (controller.signal.aborted) {
        return;
      }

      // In production, fetch actual status from server
      // For now, we'll just validate current state
      const currentState = stateRef.current;

      // Check if trial has expired
      if (currentState.isInTrial && currentState.trialEndsAt) {
        const now = new Date();
        if (now > currentState.trialEndsAt) {
          safeSetState({
            isInTrial: false,
            status: currentState.isPremium ? 'active' : 'inactive',
          });
        }
      }

      // Check if subscription has expired
      if (currentState.expiresAt) {
        const now = new Date();
        if (now > currentState.expiresAt) {
          safeSetState({
            status: 'expired',
            isPremium: false,
          });
        }
      }

      setRetryCount(0);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error('Error refreshing status:', error);
      setRetryCount(prev => prev + 1);
    }
  }, [safeSetState]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortManagerRef.current.abortAll();
      changePlan.cancel();
    };
  }, [changePlan]);

  /**
   * Refresh status on mount and periodically
   */
  useEffect(() => {
    refreshStatus();

    // Refresh every 5 minutes
    const interval = setInterval(refreshStatus, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [refreshStatus]);

  /**
   * Context value
   */
  const contextValue = useMemo<SubscriptionContextType>(
    () => ({
      ...state,
      changePlan,
      restorePurchases,
      cancelSubscription,
      refreshStatus,
      isChangingPlan,
      lastError,
      retryCount,
    }),
    [
      state,
      changePlan,
      restorePurchases,
      cancelSubscription,
      refreshStatus,
      isChangingPlan,
      lastError,
      retryCount,
    ]
  );

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/**
 * Hook to use subscription context
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }

  return context;
}

/**
 * Hook to check if a feature requires premium
 */
export function useRequiresPremium(featureName: string): {
  canAccess: boolean;
  reason?: string;
} {
  const { canAccessPremiumFeatures, isInTrial, plan } = useSubscription();

  if (canAccessPremiumFeatures) {
    return { canAccess: true };
  }

  let reason = `${featureName} requires a premium subscription`;

  if (plan === 'free' && !isInTrial) {
    reason += '. Upgrade to unlock this feature.';
  }

  return { canAccess: false, reason };
}
