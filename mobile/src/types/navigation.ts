// Navigation type definitions

import { MealAnalysis } from '../services/openai';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  MealDetails: {
    mealId?: string;
    imageUri?: string;
    analysisData?: MealAnalysis;
    uploadedImageUrl?: string;
  };
  Profile: undefined;
  History: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
};
