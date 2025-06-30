// Navigation type definitions

import { MealAnalysis } from '../services/openai';

// Root stack for auth and main app
export type RootStackParamList = {
  AuthStack: undefined;
  AppTabs: undefined;
  Camera: undefined;
  ManualEntry: undefined;
  MealDetails: {
    mealId?: string;
    imageUri?: string;
    analysisData?: MealAnalysis;
    uploadedImageUrl?: string;
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
  MealDetails: {
    mealId?: string;
    imageUri?: string;
    analysisData?: MealAnalysis;
    uploadedImageUrl?: string;
  };
};

// History stack for history-related screens
export type HistoryStackParamList = {
  HistoryScreen: undefined;
  MealDetails: {
    mealId?: string;
    imageUri?: string;
    analysisData?: MealAnalysis;
    uploadedImageUrl?: string;
  };
};

// Profile stack for profile-related screens
export type ProfileStackParamList = {
  ProfileScreen: undefined;
};
