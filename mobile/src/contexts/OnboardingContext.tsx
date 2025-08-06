import React, { createContext, useContext } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// Define the complete onboarding steps for progress calculation
export const ONBOARDING_STEPS = [
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
  'diet-selection',
  'goal-accomplishment',
  'referral-code',
  'nutrition-loading',
  'macros',
  'auth',
  'subscription',
  'notifications',
  'success',
  'tutorial',
];

// Context for onboarding data
export interface OnboardingData {
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
  diet: string;
  accomplishmentGoals: string[];
  referralCode: string;
  dailyCalories: number;
  macroTargets: { carbs: number; protein: number; fat: number };
  email: string;
  authMethod: string;
  selectedPlan: 'monthly' | 'yearly' | null;
  isSubscribed: boolean;
  notificationsEnabled: boolean;
  authMode?: 'signin' | 'signup';
}

import { OnboardingStackParamList } from '../navigation/OnboardingStack';

export interface OnboardingContextType {
  currentStep: string;
  userData: Partial<OnboardingData>;
  updateUserData: (field: string, value: any) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  transitionToStep: (step: string) => void;
  progress: number;
  navigation: NativeStackNavigationProp<
    OnboardingStackParamList,
    'OnboardingFlow'
  >;
  route: RouteProp<OnboardingStackParamList, 'OnboardingFlow'>;
  isLoading: boolean;
}

export const OnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  return context;
};

// Export type for test utilities
export type { OnboardingContextType };
