import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useSubscriptionPlanSelection } from '../../hooks/useSubscription';
import type { SubscriptionPlan } from '../../contexts/SubscriptionContext';

/**
 * Enhanced SubscriptionScreen with bulletproof state management
 *
 * Key improvements:
 * - Uses centralized subscription state
 * - Prevents stale closures with ref-based state reading
 * - Debounces rapid plan changes
 * - Handles async operations with abort controllers
 * - Validates state before actions
 */
const SubscriptionScreen = () => {
  const onboardingContext = useOnboarding();

  // Use safe subscription plan selection hook
  const {
    selectedPlan,
    currentPlan,
    isConfirming,
    hasChanges,
    selectPlan,
    confirmSelection,
    cancelSelection,
  } = useSubscriptionPlanSelection('yearly' as SubscriptionPlan);

  // Extract values with defaults to prevent errors
  const goToNextStep = onboardingContext?.goToNextStep || (() => {});
  const goToPreviousStep = onboardingContext?.goToPreviousStep || (() => {});
  const updateUserData = onboardingContext?.updateUserData || (() => {});
  const userData = onboardingContext?.userData || { referralCode: '' };
  const hasReferralCode =
    userData.referralCode && userData.referralCode.length > 0;

  // Plan configurations
  const plans = useMemo(
    () => ({
      monthly: {
        price: 9.99,
        period: 'month',
        discount: null,
        trialDays: hasReferralCode ? 14 : 7,
      },
      yearly: {
        price: 59.99,
        period: 'year',
        discount: '50%',
        trialDays: hasReferralCode ? 30 : 14,
      },
    }),
    [hasReferralCode]
  );

  /**
   * Handle plan selection with haptic feedback
   */
  const handlePlanSelect = useCallback(
    (plan: 'monthly' | 'yearly') => {
      hapticFeedback.selection();
      selectPlan(plan as SubscriptionPlan);
    },
    [selectPlan]
  );

  /**
   * Handle continue with subscription
   * Now uses the safe confirmation method
   */
  const handleContinue = useCallback(async () => {
    if (!onboardingContext || isConfirming) return;

    hapticFeedback.impact();

    try {
      // Update onboarding data
      updateUserData('selectedPlan', selectedPlan);
      updateUserData('isSubscribed', true);

      // Confirm the selection (this handles the actual subscription)
      if (hasChanges) {
        await confirmSelection();
      }

      // Move to next step
      goToNextStep();
    } catch (error) {
      console.error('Error during subscription:', error);
      // The error is already handled in the context
      // We could show a toast or alert here if needed
    }
  }, [
    onboardingContext,
    isConfirming,
    selectedPlan,
    hasChanges,
    updateUserData,
    confirmSelection,
    goToNextStep,
  ]);

  /**
   * Handle skip with state cleanup
   */
  const handleSkip = useCallback(() => {
    if (!onboardingContext || isConfirming) return;

    hapticFeedback.selection();

    // Cancel any pending selection
    if (hasChanges) {
      cancelSelection();
    }

    updateUserData('selectedPlan', null);
    updateUserData('isSubscribed', false);
    goToNextStep();
  }, [
    onboardingContext,
    isConfirming,
    hasChanges,
    cancelSelection,
    updateUserData,
    goToNextStep,
  ]);

  /**
   * Handle back navigation with cleanup
   */
  const handleBack = useCallback(() => {
    if (!onboardingContext || isConfirming) return;

    hapticFeedback.selection();

    // Cancel any pending selection
    if (hasChanges) {
      cancelSelection();
    }

    goToPreviousStep();
  }, [
    onboardingContext,
    isConfirming,
    hasChanges,
    cancelSelection,
    goToPreviousStep,
  ]);

  /**
   * Memoize features list
   */
  const features = useMemo(
    () => [
      'Unlimited AI food recognition',
      'Personalized nutrition coaching',
      'Advanced analytics and insights',
      'Custom meal recommendations',
      'Progress tracking and reports',
      'Priority support',
    ],
    []
  );

  /**
   * Memoize the plan content to prevent unnecessary re-renders
   */
  const planContent = useMemo(() => {
    const isMonthly = selectedPlan === 'monthly';
    const planData = isMonthly ? plans.monthly : plans.yearly;

    if (isMonthly) {
      return (
        <View className="space-y-4">
          {/* Monthly Plan Card */}
          <View className="bg-primary/5 border-2 border-primary rounded-2xl p-6">
            <View className="flex-row items-center mb-4">
              <Zap size={24} color="#320DFF" />
              <Text className="text-xl font-bold ml-2">Premium Monthly</Text>
            </View>

            <View className="mb-4">
              <View className="flex-row items-baseline">
                <Text className="text-3xl font-bold">${planData.price}</Text>
                <Text className="text-gray-600 ml-1">/{planData.period}</Text>
              </View>
              {hasReferralCode && (
                <Text className="mt-1 text-sm text-green-600 font-medium">
                  Referral discount applied!
                </Text>
              )}
            </View>

            {/* Features List (Compact) */}
            <View className="mb-4">
              {features.slice(0, 3).map((feature, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <View className="mr-2 mt-0.5">
                    <Check size={14} color="#320DFF" />
                  </View>
                  <Text className="flex-1 text-sm text-gray-700">
                    {feature}
                  </Text>
                </View>
              ))}
              <Text className="text-xs text-gray-500 ml-5">
                + {features.length - 3} more features
              </Text>
            </View>

            {/* Trial Info */}
            <View className="bg-primary/10 p-3 rounded-xl mb-4">
              <Text className="text-primary font-medium text-center">
                {planData.trialDays}-day free trial
              </Text>
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-primary py-4 rounded-full items-center justify-center"
              activeOpacity={0.8}
              disabled={isConfirming}
            >
              <Text className="text-white font-semibold text-base">
                {isConfirming ? 'Processing...' : 'Start Free Trial'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Yearly Comparison Card */}
          <View className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-green-700 font-semibold">
                Save $
                {(plans.monthly.price * 12 - plans.yearly.price).toFixed(0)}{' '}
                with yearly
              </Text>
              <View className="bg-green-600 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">BEST VALUE</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handlePlanSelect('yearly')}
              className="flex-row items-center justify-between"
              disabled={isConfirming}
            >
              <View>
                <Text className="text-sm text-gray-700">
                  Only ${(plans.yearly.price / 12).toFixed(2)}/month
                </Text>
                <Text className="text-xs text-gray-500">
                  Billed annually at ${plans.yearly.price}
                </Text>
              </View>
              <Text className="text-green-600 font-medium">Switch →</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Yearly Plan Card
    return (
      <View className="bg-primary/5 border-2 border-primary rounded-2xl p-6 relative overflow-hidden">
        {planData.discount && (
          <View className="absolute top-0 right-0">
            <View className="bg-primary px-4 py-1 rounded-bl-lg">
              <Text className="text-white text-sm font-bold">
                SAVE {planData.discount}
              </Text>
            </View>
          </View>
        )}

        <View className="flex-row items-center mb-4">
          <Zap size={24} color="#320DFF" />
          <Text className="text-xl font-bold ml-2">
            Premium {selectedPlan === 'yearly' ? 'Annual' : 'Monthly'}
          </Text>
        </View>

        <View className="mb-6">
          <View className="flex-row items-baseline">
            <Text className="text-3xl font-bold">${planData.price}</Text>
            <Text className="text-gray-600 ml-1">/{planData.period}</Text>
          </View>
          {hasReferralCode && (
            <Text className="mt-1 text-sm text-green-600 font-medium">
              Referral discount applied!
            </Text>
          )}
        </View>

        {/* Features List */}
        <View className="mb-6">
          {features.map((feature, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <View className="mr-3 mt-0.5">
                <Check size={16} color="#320DFF" />
              </View>
              <Text className="flex-1 text-gray-700">{feature}</Text>
            </View>
          ))}
        </View>

        {/* Trial Info */}
        <View className="bg-primary/10 p-3 rounded-xl mb-6">
          <Text className="text-primary font-medium text-center">
            {planData.trialDays}-day free trial, cancel anytime
          </Text>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary py-4 rounded-full items-center justify-center"
          activeOpacity={0.8}
          disabled={isConfirming}
        >
          <Text className="text-white font-semibold text-base">
            {isConfirming ? 'Processing...' : 'Start Free Trial'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [
    selectedPlan,
    plans,
    hasReferralCode,
    features,
    handleContinue,
    handlePlanSelect,
    isConfirming,
  ]);

  // Early return if context is not available (during transitions)
  if (!onboardingContext) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-4">
            {/* Header with back button */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                testID="back-button"
                disabled={isConfirming}
              >
                <ArrowLeft size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Title and subtitle */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-3">
                Upgrade to Premium
              </Text>
              <Text className="text-gray-600 text-lg">
                Get the most out of your nutrition journey
              </Text>
            </View>

            {/* Plan Selector */}
            <View className="items-center mb-8">
              <View className="flex-row bg-gray-100 p-1 rounded-full">
                <TouchableOpacity
                  onPress={() => handlePlanSelect('monthly')}
                  className={`px-6 py-3 rounded-full ${
                    selectedPlan === 'monthly' ? 'bg-white shadow-sm' : ''
                  }`}
                  disabled={isConfirming}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedPlan === 'monthly'
                        ? 'text-primary'
                        : 'text-gray-600'
                    }`}
                  >
                    Monthly
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePlanSelect('yearly')}
                  className={`px-6 py-3 rounded-full ${
                    selectedPlan === 'yearly' ? 'bg-white shadow-sm' : ''
                  }`}
                  disabled={isConfirming}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedPlan === 'yearly'
                        ? 'text-primary'
                        : 'text-gray-600'
                    }`}
                  >
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Plan Card */}
            <MotiView
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                type: 'timing',
                duration: 200,
              }}
              style={{ marginBottom: 32 }}
            >
              {planContent}
            </MotiView>

            {/* Spacer to push skip button to bottom */}
            <View className="flex-1" />

            {/* Skip Option */}
            <View className="items-center mb-6">
              <TouchableOpacity onPress={handleSkip} disabled={isConfirming}>
                <Text className="text-gray-500 font-medium">
                  Continue with limited version
                </Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-400 mt-2">
                You can upgrade anytime from the app settings
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

export default SubscriptionScreen;
