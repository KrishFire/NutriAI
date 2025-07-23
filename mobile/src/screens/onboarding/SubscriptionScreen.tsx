import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const SubscriptionScreen = () => {
  const { goToNextStep, goToPreviousStep, updateUserData, userData } = useOnboarding();
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  
  const hasReferralCode = userData.referralCode && userData.referralCode.length > 0;

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

  const handlePlanSelect = (plan: 'monthly' | 'yearly') => {
    hapticFeedback.selection();
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    hapticFeedback.impact();
    updateUserData('selectedPlan', selectedPlan);
    updateUserData('isSubscribed', true);
    goToNextStep();
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    updateUserData('selectedPlan', null);
    updateUserData('isSubscribed', false);
    goToNextStep();
  };

  const features = [
    'Unlimited AI food recognition',
    'Personalized nutrition coaching',
    'Advanced analytics and insights',
    'Custom meal recommendations',
    'Progress tracking and reports',
    'Priority support',
  ];

  return (
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
              onPress={() => {
                hapticFeedback.selection();
                goToPreviousStep();
              }}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
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
                  selectedPlan === 'monthly' 
                    ? 'bg-white shadow-sm' 
                    : ''
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedPlan === 'monthly' 
                    ? 'text-primary' 
                    : 'text-gray-600'
                }`}>
                  Monthly
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handlePlanSelect('yearly')}
                className={`px-6 py-3 rounded-full ${
                  selectedPlan === 'yearly' 
                    ? 'bg-white shadow-sm' 
                    : ''
                }`}
              >
                <Text className={`text-sm font-medium ${
                  selectedPlan === 'yearly' 
                    ? 'text-primary' 
                    : 'text-gray-600'
                }`}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plan Card */}
          <MotiView
            from={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
            className="mb-8"
          >
            <View className="bg-primary/5 border-2 border-primary rounded-2xl p-6 relative overflow-hidden">
              {selectedPlan === 'yearly' && plans.yearly.discount && (
                <View className="absolute top-0 right-0">
                  <View className="bg-primary px-4 py-1 rounded-bl-lg">
                    <Text className="text-white text-sm font-bold">
                      SAVE {plans.yearly.discount}
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
                  <Text className="text-3xl font-bold">
                    ${plans[selectedPlan].price}
                  </Text>
                  <Text className="text-gray-600 ml-1">
                    /{plans[selectedPlan].period}
                  </Text>
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
                  {plans[selectedPlan].trialDays}-day free trial, cancel anytime
                </Text>
              </View>

              {/* Subscribe Button */}
              <TouchableOpacity
                onPress={handleContinue}
                className="bg-primary py-4 rounded-full items-center justify-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-base">
                  Start Free Trial
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>

          {/* Spacer to push skip button to bottom */}
          <View className="flex-1" />

          {/* Skip Option */}
          <View className="items-center mb-6">
            <TouchableOpacity onPress={handleSkip}>
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
  );
};

export default SubscriptionScreen;