// Navigation type definitions

import { MealAnalysis } from '../services/openai';
import { NavigatorScreenParams } from '@react-navigation/native';

// Root stack for auth and main app
export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList> | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  AppTabs: NavigatorScreenParams<AppTabParamList> | undefined;
  App: undefined;
  AddMealFlow: {
    screen: 'Camera' | 'ManualEntry' | 'BarcodeScanner';
    params?: AddMealStackParamList[keyof AddMealStackParamList];
  };
  MealDetails: {
    mealId?: string;
    mealGroupId?: string;
    imageUri?: string;
    analysisData?: MealAnalysis;
    uploadedImageUrl?: string;
    newFoodItems?: MealAnalysis['foods'];
    isAddingToExisting?: boolean;
  };
  RecipeStack: NavigatorScreenParams<RecipeStackParamList> | undefined;
  SettingsStack: NavigatorScreenParams<SettingsStackParamList> | undefined;
  MetricsStack: NavigatorScreenParams<MetricsStackParamList> | undefined;
  FoodInputStack: NavigatorScreenParams<FoodInputStackParamList> | undefined;
  Paywall: undefined;
  PaywallModal: undefined;
  SubscriptionSuccess: undefined;
  ManageSubscription: undefined;
  EditMeal: {
    mealId: string;
    meal: any;
  };
  Favorites: undefined;
  MealSaved: {
    meal: any;
  };
  FoodResultsScreen: {
    analysisData?: any;
    mealId?: string;
    description?: string;
    refinedAnalysisData?: any; // For returning from RefineWithAIScreen
  };
  RefineWithAIScreen: {
    analysisData?: any;
    mealId?: string;
    description?: string;
  };
  AddMoreScreen: {
    currentMealData?: any;
    description?: string;
    mealId?: string;
  };
  SearchResults: {
    query?: string;
    mealType?: string;
  };
  NutritionBreakdown: {
    food?: any;
    meal?: any;
    date?: string;
  };
  FoodDetails: {
    food: any;
    mealType?: string;
  };
  CreateFood: {
    searchQuery?: string;
  };
  // Food Input Screens
  TextInput: undefined;
  VoiceLog: undefined;
  CameraInput: undefined;
  BarcodeInput: undefined;
  AnalyzingScreen: {
    inputType: 'text' | 'voice' | 'camera' | 'barcode';
    inputData: string | { imageUri?: string; barcode?: string };
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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
};

// Auth stack for login/signup
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  DeleteAccount: undefined;
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

// Recipe stack for recipe-related screens
export type RecipeStackParamList = {
  RecipeList: undefined;
  RecipeDetail: {
    recipe: any; // TODO: Add proper Recipe type
  };
  CreateRecipe: undefined;
  EditRecipe: {
    recipe: any; // TODO: Add proper Recipe type
  };
};

// Main tab navigation (new bottom tabs)
export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Log: undefined;
  Insights: undefined;
  Profile: undefined;
};

// Onboarding flow
export type OnboardingStackParamList = {
  OnboardingFlow: { initialStep?: string } | undefined;
  Welcome: undefined;
  GoalSelection: undefined;
  PersonalInfo: undefined;
  DietaryPreferences: undefined;
  ActivityLevel: undefined;
  HeightWeight: undefined;
  NotificationSetup: undefined;
  OnboardingComplete: undefined;
};

// Settings stack
export type SettingsStackParamList = {
  Settings: undefined;
  PersonalInfo: undefined;
  HealthData: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  About: undefined;
  Help: undefined;
};

// Metrics stack
export type MetricsStackParamList = {
  WeightCheckIn: undefined;
  GoalProgressCelebration: undefined;
};

// Food input stack
export type FoodInputStackParamList = {
  Camera: undefined;
  Voice: undefined;
  Barcode: undefined;
  Text: undefined;
  Analyzing: undefined;
};
