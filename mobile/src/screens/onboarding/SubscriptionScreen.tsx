import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const SubscriptionScreen = () => {
  const onboardingContext = useOnboarding();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(
    null
  );

  // Early return if context is not available
  if (!onboardingContext) {
    console.warn('SubscriptionScreen: OnboardingContext not available');
    return null;
  }

  // Extract values from context (guaranteed to exist after early return)
  const { goToNextStep, goToPreviousStep, updateUserData, userData } =
    onboardingContext;
  const hasReferralCode =
    userData.referralCode && userData.referralCode.length > 0;

  const plans = {
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
  };

  const handleSubscribe = useCallback(
    async (plan: 'monthly' | 'yearly') => {
      try {
        hapticFeedback.impact();
        setLoadingPlan(plan);

        // Simulate subscription process - replace with actual Supabase/payment integration
        await new Promise(resolve => setTimeout(resolve, 1000));

        updateUserData('selectedPlan', plan);
        updateUserData('isSubscribed', true);
        goToNextStep();
      } catch (error) {
        Alert.alert(
          'Subscription Failed',
          'Unable to process your subscription. Please try again or contact support.',
          [
            { text: 'Try Again', onPress: () => handleSubscribe(plan) },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        console.error('Subscription error:', error);
      } finally {
        setLoadingPlan(null);
      }
    },
    [updateUserData, goToNextStep]
  );

  const handleSubscribeMonthly = useCallback(() => {
    handleSubscribe('monthly');
  }, [handleSubscribe]);

  const handleSubscribeYearly = useCallback(() => {
    handleSubscribe('yearly');
  }, [handleSubscribe]);

  const handleSkip = useCallback(() => {
    hapticFeedback.selection();
    updateUserData('selectedPlan', null);
    updateUserData('isSubscribed', false);
    goToNextStep();
  }, [updateUserData, goToNextStep]);

  const handleBack = useCallback(() => {
    hapticFeedback.selection();
    goToPreviousStep();
  }, [goToPreviousStep]);

  const features = [
    'Unlimited AI food recognition',
    'Personalized nutrition coaching',
    'Advanced analytics and insights',
    'Custom meal recommendations',
    'Progress tracking and reports',
    'Priority support',
  ];

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
              <Pressable
                onPress={handleBack}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                testID="back-button"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                accessibilityHint="Returns to the previous screen"
              >
                <ArrowLeft size={20} color="#000" />
              </Pressable>
            </View>

            {/* Title and subtitle */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-3">
                Choose Your Plan
              </Text>
              <Text className="text-gray-600 text-lg">
                Start your free trial today
              </Text>
            </View>

            {/* Plans Container - Side by Side with increased spacing */}
            <View className="mb-8">
              {/* Monthly Plan Card */}
              <MotiView
                from={{
                  opacity: 0,
                  translateY: 20,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: 'timing',
                  duration: 300,
                  delay: 100,
                }}
              >
                <View className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  <View className="flex-row items-center mb-4">
                    <Zap size={20} color="#6B7280" />
                    <Text className="text-lg font-semibold ml-2">Monthly</Text>
                  </View>

                  <View className="mb-4">
                    <View className="flex-row items-baseline">
                      <Text className="text-2xl font-bold">
                        ${plans.monthly.price}
                      </Text>
                      <Text className="text-gray-600 ml-1">/month</Text>
                    </View>
                    {hasReferralCode && (
                      <Text className="mt-1 text-sm text-green-600 font-medium">
                        Referral discount applied!
                      </Text>
                    )}
                  </View>

                  {/* Features List - Same for both plans */}
                  <View className="mb-4">
                    {features.map((feature, index) => (
                      <View
                        key={index}
                        className="flex-row items-start mb-2"
                        accessibilityRole="text"
                        accessibilityLabel={`Feature: ${feature}`}
                      >
                        <View className="mr-2 mt-0.5">
                          <Check size={14} color="#6B7280" />
                        </View>
                        <Text className="flex-1 text-sm text-gray-700">
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Trial Info */}
                  <View
                    className="bg-gray-100 p-2 rounded-lg mb-4"
                    accessibilityRole="text"
                    accessibilityLabel={`${plans.monthly.trialDays} day free trial`}
                  >
                    <Text className="text-gray-700 font-medium text-center text-sm">
                      {plans.monthly.trialDays}-day free trial
                    </Text>
                  </View>

                  {/* Subscribe Button */}
                  <Pressable
                    onPress={handleSubscribeMonthly}
                    className="bg-gray-800 py-3 rounded-full items-center justify-center"
                    disabled={loadingPlan !== null}
                    style={({ pressed }) => ({
                      opacity: pressed || loadingPlan !== null ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                    accessibilityRole="button"
                    accessibilityLabel="Start monthly free trial"
                    accessibilityHint="Starts your free trial with monthly billing"
                  >
                    {loadingPlan === 'monthly' ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-semibold text-sm">
                        Start Free Trial
                      </Text>
                    )}
                  </Pressable>
                </View>
              </MotiView>

              {/* Spacing between cards */}
              <View className="h-5" />

              {/* Yearly Plan Card - Highlighted */}
              <MotiView
                from={{
                  opacity: 0,
                  translateY: 20,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: 'timing',
                  duration: 300,
                  delay: 200,
                }}
              >
                <View className="bg-primary/5 border-2 border-primary rounded-2xl p-5 relative overflow-hidden">
                  {/* Best Value Badge */}
                  <View
                    className="absolute top-0 right-0"
                    accessibilityRole="text"
                    accessibilityLabel="Save 50% discount badge"
                  >
                    <View className="bg-primary px-4 py-1 rounded-bl-lg">
                      <Text className="text-white text-sm font-bold">
                        SAVE 50%
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-4">
                    <Zap size={20} color="#320DFF" />
                    <Text className="text-lg font-semibold ml-2">Yearly</Text>
                  </View>

                  <View className="mb-4">
                    <View className="flex-row items-baseline">
                      <Text className="text-2xl font-bold">
                        ${plans.yearly.price}
                      </Text>
                      <Text className="text-gray-600 ml-1">/year</Text>
                    </View>
                    <Text className="text-sm text-gray-600">
                      Only ${(plans.yearly.price / 12).toFixed(2)}/month
                    </Text>
                    {hasReferralCode && (
                      <Text className="mt-1 text-sm text-green-600 font-medium">
                        Referral discount applied!
                      </Text>
                    )}
                  </View>

                  {/* Features List - Same as monthly for cognitive clarity */}
                  <View className="mb-4">
                    {features.map((feature, index) => (
                      <View
                        key={index}
                        className="flex-row items-start mb-2"
                        accessibilityRole="text"
                        accessibilityLabel={`Feature: ${feature}`}
                      >
                        <View className="mr-2 mt-0.5">
                          <Check size={14} color="#320DFF" />
                        </View>
                        <Text className="flex-1 text-sm text-gray-700">
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Trial Info */}
                  <View
                    className="bg-primary/10 p-2 rounded-lg mb-4"
                    accessibilityRole="text"
                    accessibilityLabel={`${plans.yearly.trialDays} day free trial, cancel anytime`}
                  >
                    <Text className="text-primary font-medium text-center text-sm">
                      {plans.yearly.trialDays}-day free trial, cancel anytime
                    </Text>
                  </View>

                  {/* Subscribe Button */}
                  <Pressable
                    onPress={handleSubscribeYearly}
                    className="bg-primary py-3 rounded-full items-center justify-center"
                    disabled={loadingPlan !== null}
                    style={({ pressed }) => ({
                      opacity: pressed || loadingPlan !== null ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                    accessibilityRole="button"
                    accessibilityLabel="Start yearly free trial"
                    accessibilityHint="Starts your free trial with yearly billing and save 50%"
                  >
                    {loadingPlan === 'yearly' ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-semibold text-sm">
                        Start Free Trial
                      </Text>
                    )}
                  </Pressable>
                </View>
              </MotiView>

              {/* Spacing after yearly card */}
              <View className="h-5" />

              {/* Savings Info */}
              <View className="bg-green-50 border border-green-200 rounded-xl p-3">
                <Text className="text-green-700 text-center text-sm font-medium">
                  💰 Save $
                  {(plans.monthly.price * 12 - plans.yearly.price).toFixed(0)}{' '}
                  per year with the annual plan
                </Text>
              </View>
            </View>

            {/* Spacer to push skip button to bottom */}
            <View className="flex-1" />

            {/* Skip Option */}
            <View className="items-center mb-6">
              <Pressable
                onPress={handleSkip}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Continue with limited version"
                accessibilityHint="Skip subscription and continue with basic features"
              >
                <Text className="text-gray-500 font-medium">
                  Continue with limited version
                </Text>
              </Pressable>
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
