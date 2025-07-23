import React, { useState, createContext, useContext } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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
import GoalAccomplishmentScreen from './GoalAccomplishmentScreen';
import ReferralSourceScreen from './ReferralSourceScreen';
import ReferralCodeScreen from './ReferralCodeScreen';
import NutritionPlanLoadingScreen from './NutritionPlanLoadingScreen';
import MacroTargetsScreen from './MacroTargetsScreen';
import NotificationsPermissionScreen from './NotificationsPermissionScreen';
import AuthScreen from './AuthScreen';
import SubscriptionScreen from './SubscriptionScreen';
import TutorialOverlay from './TutorialOverlay';

// Define the complete onboarding steps for progress calculation
const ONBOARDING_STEPS = [
  'welcome',
  'carousel',
  'gender', 
  'activity',
  'referral-source',
  'height-weight',
  'birth-date',
  'goal-selection',
  'target-weight',
  'weight-speed',
  'weight-transition',
  'goal-accomplishment',
  'referral-code',
  'nutrition-loading',
  'macros',
  'auth',
  'subscription',
  'notifications',
  'success',
  'tutorial'
];

// Context for onboarding data
interface OnboardingData {
  gender: string;
  activityLevel: string;
  referralSource: string;
  height: { feet: string; inches: string; cm: string };
  weight: { value: string; unit: 'lbs' | 'kg' };
  currentWeight?: { value: string; unit: 'lbs' | 'kg' }; // Alias for weight
  birthDate: { month: string; day: string; year: string };
  goal: string;
  targetWeight: { value: string; unit: 'lbs' | 'kg' };
  weightChangeSpeed: number;
  accomplishmentGoals: string[];
  referralCode: string;
  dailyCalories: number;
  macroTargets: { carbs: number; protein: number; fat: number };
  email: string;
  authMethod: string;
  selectedPlan: 'monthly' | 'yearly' | null;
  isSubscribed: boolean;
  notificationsEnabled: boolean;
}

interface OnboardingContextType {
  currentStep: string;
  userData: Partial<OnboardingData>;
  updateUserData: (field: string, value: any) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  progress: number;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userData, setUserData] = useState<Partial<OnboardingData>>({});

  // Calculate progress percentage based on current step
  const getProgressPercentage = (step: string) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(step);
    if (currentIndex === -1) return 0;
    return Math.round((currentIndex / (ONBOARDING_STEPS.length - 1)) * 100);
  };

  const progress = getProgressPercentage(currentStep);

  const updateUserData = (field: string, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    // Also update currentWeight if weight is updated
    if (field === 'weight') {
      setUserData(prev => ({ ...prev, currentWeight: value }));
    }
  };

  const transitionToStep = (step: string) => {
    Haptics.selectionAsync();
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    Haptics.selectionAsync();
    
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
          transitionToStep('goal-accomplishment');
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
        transitionToStep('tutorial');
        break;
      case 'tutorial':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete();
        break;
    }
  };

  const goToPreviousStep = () => {
    Haptics.selectionAsync();
    
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
      case 'goal-accomplishment':
        // Branch back correctly based on goal
        if (userData.goal === 'maintain') {
          transitionToStep('goal-selection');
        } else {
          transitionToStep('weight-transition');
        }
        break;
      case 'referral-code':
        transitionToStep('goal-accomplishment');
        break;
      case 'nutrition-loading':
        transitionToStep('referral-code');
        break;
      case 'macros':
        transitionToStep('nutrition-loading');
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
  };

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
      case 'goal-accomplishment':
        return <GoalAccomplishmentScreen />;
      case 'referral-code':
        return <ReferralCodeScreen />;
      case 'nutrition-loading':
        return <NutritionPlanLoadingScreen />;
      case 'macros':
        return <MacroTargetsScreen />;
      case 'auth':
        return <AuthScreen mode="signup" />;
      case 'subscription':
        return <SubscriptionScreen />;
      case 'notifications':
        return <NotificationsPermissionScreen />;
      case 'success':
        return <SuccessScreen />;
      case 'tutorial':
        return <TutorialOverlay />;
      default:
        return null;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        userData,
        updateUserData,
        goToNextStep,
        goToPreviousStep,
        progress,
      }}
    >
      <View className="flex-1">
        <Animated.View
          key={currentStep}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          className="flex-1"
        >
          {renderCurrentStep()}
        </Animated.View>
      </View>
    </OnboardingContext.Provider>
  );
}