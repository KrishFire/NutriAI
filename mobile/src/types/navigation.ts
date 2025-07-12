// Navigation type definitions

import { MealAnalysis } from '../services/openai';

// Root stack for auth and main app
export type RootStackParamList = {
  AuthStack: undefined;
  AppTabs: undefined;
  AddMealFlow: {
    screen: 'Camera' | 'ManualEntry' | 'MealDetails' | 'BarcodeScanner';
    params?: AddMealStackParamList[keyof AddMealStackParamList];
  };
};

// Add Meal stack for the modal flow
export type AddMealStackParamList = {
  Camera:
    | {
        addToMeal?: {
          mealId: string;
          existingAnalysis: MealAnalysis;
        };
      }
    | undefined;
  ManualEntry:
    | {
        addToMeal?: {
          mealId: string;
          existingAnalysis: MealAnalysis;
        };
        openVoiceRecording?: boolean;
      }
    | undefined;
  BarcodeScanner:
    | {
        addToMeal?: {
          mealId: string;
          existingAnalysis: MealAnalysis;
        };
      }
    | undefined;
  VoiceLog: undefined;
  MealDetails: {
    mealId?: string;
    imageUri?: string;
    analysisData?: MealAnalysis;
    uploadedImageUrl?: string;
    newFoodItems?: MealAnalysis['foods'];
  };
};

// Auth stack for login/signup
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// Bottom tabs navigation
export type AppTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

// Home stack for home-related screens
export type HomeStackParamList = {
  HomeScreen: undefined;
};

// History stack for history-related screens
export type HistoryStackParamList = {
  HistoryScreen: undefined;
};

// Profile stack for profile-related screens
export type ProfileStackParamList = {
  ProfileScreen: undefined;
};
