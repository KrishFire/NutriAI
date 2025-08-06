import React, { useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// Import context
import {
  OnboardingContext,
  OnboardingContextType,
  OnboardingData,
  ONBOARDING_STEPS,
} from '../../contexts/OnboardingContext';

// Import all onboarding screens
import WelcomeScreen from './WelcomeScreen';
import OnboardingCarousel from './OnboardingCarousel';
import GenderSelectionScreen from './GenderSelectionScreen';
import ActivityLevelScreen from './ActivityLevelScreen';
import HeightWeightScreen from './HeightWeightScreen';
import GoalSelectionScreen from './GoalSelectionScreen';
import SuccessScreen from './SuccessScreen';
import BirthDateScreen from './BirthDateScreen';
import TargetWeightScreen from './TargetWeightScreen';
import WeightSpeedScreen from './WeightSpeedScreen';
import WeightTransitionScreen from './WeightTransitionScreen';
import DietSelectionScreen from './DietSelectionScreen';
import GoalAccomplishmentScreen from './GoalAccomplishmentScreen';
import ReferralSourceScreen from './ReferralSourceScreen';
import ReferralCodeScreen from './ReferralCodeScreen';
import NutritionPlanLoadingScreen from './NutritionPlanLoadingScreen';
import MacroTargetsScreen from './MacroTargetsScreen';
import NotificationsPermissionScreen from './NotificationsPermissionScreen';
import AuthScreen from './AuthScreen';
import SubscriptionScreen from './SubscriptionScreen';
import TutorialOverlay from './TutorialOverlay';

import { OnboardingStackParamList } from '../../navigation/OnboardingStack';

type OnboardingFlowProps = {
  onComplete: () => void;
  navigation: NativeStackScreenProps<
    OnboardingStackParamList,
    'OnboardingFlow'
  >['navigation'];
  route: NativeStackScreenProps<
    OnboardingStackParamList,
    'OnboardingFlow'
  >['route'];
};

export default function OnboardingFlow({
  onComplete,
  navigation,
  route,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(
    route.params?.initialStep || 'welcome'
  );
  const [userData, setUserData] = useState<Partial<OnboardingData>>({
    authMode: route.params?.authMode || 'signup',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Calculate progress percentage based on current step
  const getProgressPercentage = (step: string) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(step);
    if (currentIndex === -1) return 0;
    return Math.round((currentIndex / (ONBOARDING_STEPS.length - 1)) * 100);
  };

  const progress = getProgressPercentage(currentStep);

  const updateUserData = useCallback((field: string, value: any) => {
    setUserData(prev => {
      const newData = { ...prev, [field]: value };
      // Also update currentWeight if weight is updated
      if (field === 'weight') {
        newData.currentWeight = value;
      }
      return newData;
    });
  }, []);

  const transitionToStep = useCallback((step: string) => {
    try {
      Haptics.selectionAsync();
      setCurrentStep(step);
    } catch (error) {
      console.error('Error transitioning to step:', error);
      // Still transition even if haptics fail
      setCurrentStep(step);
    }
  }, []);

  const goToNextStep = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.error('Haptics error:', error);
    }

    // State-based navigation logic
    switch (currentStep) {
      case 'welcome':
        transitionToStep('carousel');
        break;
      case 'carousel':
        transitionToStep('gender');
        break;
      case 'gender':
        transitionToStep('activity');
        break;
      case 'activity':
        transitionToStep('referral-source');
        break;
      case 'referral-source':
        transitionToStep('height-weight');
        break;
      case 'height-weight':
        transitionToStep('birth-date');
        break;
      case 'birth-date':
        transitionToStep('goal-selection');
        break;
      case 'goal-selection':
        // Branching logic: skip target weight if goal is maintain
        if (userData.goal === 'maintain') {
          transitionToStep('diet-selection');
        } else {
          transitionToStep('target-weight');
        }
        break;
      case 'target-weight':
        transitionToStep('weight-speed');
        break;
      case 'weight-speed':
        transitionToStep('weight-transition');
        break;
      case 'weight-transition':
        transitionToStep('diet-selection');
        break;
      case 'diet-selection':
        transitionToStep('goal-accomplishment');
        break;
      case 'goal-accomplishment':
        transitionToStep('referral-code');
        break;
      case 'referral-code':
        transitionToStep('nutrition-loading');
        break;
      case 'nutrition-loading':
        transitionToStep('macros');
        break;
      case 'macros':
        transitionToStep('auth');
        break;
      case 'auth':
        transitionToStep('subscription');
        break;
      case 'subscription':
        transitionToStep('notifications');
        break;
      case 'notifications':
        transitionToStep('success');
        break;
      case 'success':
        // Complete onboarding when user clicks "Start Tracking"
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.error('Haptics error:', error);
        }
        // Only update state - let RootNavigator handle navigation
        onComplete();
        break;
      case 'tutorial':
        // Tutorial is optional, complete onboarding here too
        onComplete();
        break;
    }
  }, [currentStep, userData, transitionToStep, onComplete]);

  const goToPreviousStep = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.error('Haptics error:', error);
    }

    // State-based back navigation
    switch (currentStep) {
      case 'carousel':
        transitionToStep('welcome');
        break;
      case 'gender':
        transitionToStep('carousel');
        break;
      case 'activity':
        transitionToStep('gender');
        break;
      case 'referral-source':
        transitionToStep('activity');
        break;
      case 'height-weight':
        transitionToStep('referral-source');
        break;
      case 'birth-date':
        transitionToStep('height-weight');
        break;
      case 'goal-selection':
        transitionToStep('birth-date');
        break;
      case 'target-weight':
        transitionToStep('goal-selection');
        break;
      case 'weight-speed':
        transitionToStep('target-weight');
        break;
      case 'weight-transition':
        transitionToStep('weight-speed');
        break;
      case 'diet-selection':
        // Branch back correctly based on goal
        if (userData.goal === 'maintain') {
          transitionToStep('goal-selection');
        } else {
          transitionToStep('weight-transition');
        }
        break;
      case 'goal-accomplishment':
        transitionToStep('diet-selection');
        break;
      case 'referral-code':
        transitionToStep('goal-accomplishment');
        break;
      case 'nutrition-loading':
        transitionToStep('referral-code');
        break;
      case 'macros':
        transitionToStep('referral-code');
        break;
      case 'auth':
        transitionToStep('macros');
        break;
      case 'subscription':
        transitionToStep('auth');
        break;
      case 'notifications':
        transitionToStep('subscription');
        break;
      case 'success':
        transitionToStep('notifications');
        break;
      case 'tutorial':
        transitionToStep('success');
        break;
    }
  }, [currentStep, userData, transitionToStep]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'carousel':
        return <OnboardingCarousel />;
      case 'gender':
        return <GenderSelectionScreen />;
      case 'activity':
        return <ActivityLevelScreen />;
      case 'referral-source':
        return <ReferralSourceScreen />;
      case 'height-weight':
        return <HeightWeightScreen />;
      case 'birth-date':
        return <BirthDateScreen />;
      case 'goal-selection':
        return <GoalSelectionScreen />;
      case 'target-weight':
        return <TargetWeightScreen />;
      case 'weight-speed':
        return <WeightSpeedScreen />;
      case 'weight-transition':
        return <WeightTransitionScreen />;
      case 'diet-selection':
        return <DietSelectionScreen />;
      case 'goal-accomplishment':
        return <GoalAccomplishmentScreen />;
      case 'referral-code':
        return <ReferralCodeScreen />;
      case 'nutrition-loading':
        return <NutritionPlanLoadingScreen />;
      case 'macros':
        return <MacroTargetsScreen />;
      case 'auth':
        // Use authMode from userData, which is initialized from route params
        return <AuthScreen mode={userData.authMode || 'signup'} />;
      case 'subscription':
        return <SubscriptionScreen />;
      case 'notifications':
        return <NotificationsPermissionScreen />;
      case 'success':
        return <SuccessScreen onContinue={goToNextStep} />;
      case 'tutorial':
        return <TutorialOverlay />;
      default:
        return null;
    }
  };

  const contextValue = useMemo<OnboardingContextType>(
    () => ({
      currentStep,
      userData,
      updateUserData,
      goToNextStep,
      goToPreviousStep,
      transitionToStep,
      progress,
      navigation,
      route,
      isLoading,
    }),
    [
      currentStep,
      userData,
      updateUserData,
      goToNextStep,
      goToPreviousStep,
      transitionToStep,
      progress,
      navigation,
      route,
      isLoading,
    ]
  );

  // Navigation and route are now guaranteed to be provided by OnboardingStack

  return (
    <ErrorBoundary>
      <OnboardingContext.Provider value={contextValue}>
        <View className="flex-1">{renderCurrentStep()}</View>
      </OnboardingContext.Provider>
    </ErrorBoundary>
  );
}
