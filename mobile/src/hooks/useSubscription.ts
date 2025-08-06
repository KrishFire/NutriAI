import React, { useCallback, useRef, useEffect } from 'react';
import { useSubscription as useSubscriptionContext } from '../contexts/SubscriptionContext';
import type { SubscriptionPlan } from '../contexts/SubscriptionContext';

/**
 * Enhanced subscription hook with additional safeguards
 *
 * This hook wraps the subscription context and adds:
 * - Latest state reading for button handlers
 * - Automatic retry logic
 * - Operation tracking
 * - Stale closure prevention
 */
export function useSubscriptionSafe() {
  const subscription = useSubscriptionContext();
  const latestSubscriptionRef = useRef(subscription);
  const operationInProgressRef = useRef(false);

  // Keep ref updated with latest subscription state
  useEffect(() => {
    latestSubscriptionRef.current = subscription;
  }, [subscription]);

  /**
   * Safe plan change that always reads the latest state
   */
  const changePlanSafe = useCallback(async (plan: SubscriptionPlan) => {
    // Read latest state from ref to avoid stale closures
    const latest = latestSubscriptionRef.current;

    // Prevent concurrent operations
    if (operationInProgressRef.current || latest.isChangingPlan) {
      console.warn('Plan change already in progress, ignoring request');
      return;
    }

    // Prevent changing to the same plan
    if (latest.plan === plan) {
      console.log('Already on this plan, no change needed');
      return;
    }

    try {
      operationInProgressRef.current = true;
      await latest.changePlan(plan);
    } finally {
      operationInProgressRef.current = false;
    }
  }, []);

  /**
   * Safe restore purchases with operation tracking
   */
  const restorePurchasesSafe = useCallback(async () => {
    const latest = latestSubscriptionRef.current;

    if (operationInProgressRef.current || latest.isLoading) {
      console.warn('Operation already in progress, ignoring restore request');
      return;
    }

    try {
      operationInProgressRef.current = true;
      await latest.restorePurchases();
    } finally {
      operationInProgressRef.current = false;
    }
  }, []);

  /**
   * Safe cancel subscription with confirmation
   */
  const cancelSubscriptionSafe = useCallback(async () => {
    const latest = latestSubscriptionRef.current;

    if (operationInProgressRef.current || latest.isLoading) {
      console.warn('Operation already in progress, ignoring cancel request');
      return;
    }

    // Only allow cancellation if user has an active subscription
    if (latest.plan === 'free' || latest.status !== 'active') {
      console.warn('No active subscription to cancel');
      return;
    }

    try {
      operationInProgressRef.current = true;
      await latest.cancelSubscription();
    } finally {
      operationInProgressRef.current = false;
    }
  }, []);

  /**
   * Get the latest subscription state
   * Useful for event handlers to avoid stale closures
   */
  const getLatestState = useCallback(() => {
    return latestSubscriptionRef.current;
  }, []);

  /**
   * Check if any operation is in progress
   */
  const isOperationInProgress = useCallback(() => {
    const latest = latestSubscriptionRef.current;
    return (
      operationInProgressRef.current ||
      latest.isChangingPlan ||
      latest.isLoading
    );
  }, []);

  return {
    ...subscription,
    // Enhanced methods
    changePlanSafe,
    restorePurchasesSafe,
    cancelSubscriptionSafe,
    getLatestState,
    isOperationInProgress,
  };
}

/**
 * Hook for subscription plan selection with debouncing
 */
export function useSubscriptionPlanSelection(initialPlan?: SubscriptionPlan) {
  const { plan: currentPlan, changePlanSafe } = useSubscriptionSafe();
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan>(
    initialPlan || currentPlan
  );
  const [isConfirming, setIsConfirming] = React.useState(false);

  // Update selected plan when current plan changes
  useEffect(() => {
    if (!initialPlan) {
      setSelectedPlan(currentPlan);
    }
  }, [currentPlan, initialPlan]);

  /**
   * Handle plan selection with confirmation
   */
  const selectPlan = useCallback((plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsConfirming(false);
  }, []);

  /**
   * Confirm and apply the selected plan
   */
  const confirmSelection = useCallback(async () => {
    if (selectedPlan === currentPlan) {
      return;
    }

    setIsConfirming(true);
    try {
      await changePlanSafe(selectedPlan);
    } finally {
      setIsConfirming(false);
    }
  }, [selectedPlan, currentPlan, changePlanSafe]);

  /**
   * Cancel selection and revert to current plan
   */
  const cancelSelection = useCallback(() => {
    setSelectedPlan(currentPlan);
    setIsConfirming(false);
  }, [currentPlan]);

  return {
    selectedPlan,
    currentPlan,
    isConfirming,
    hasChanges: selectedPlan !== currentPlan,
    selectPlan,
    confirmSelection,
    cancelSelection,
  };
}
