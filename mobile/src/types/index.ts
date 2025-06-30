// Core type definitions for NutriAI

export interface User {
  id: string;
  email: string;
  fullName?: string;
  dateOfBirth?: Date;
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
  goal?: 'lose' | 'maintain' | 'gain';
  dailyCalorieTarget?: number;
  macroTargets?: MacroTargets;
  createdAt: Date;
  updatedAt: Date;
}

export interface MacroTargets {
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  calories: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  imageUrl?: string;
  barcode?: string;
  verified: boolean;
}

export interface MealEntry {
  id: string;
  userId: string;
  foodItemId: string;
  foodItem?: FoodItem;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: Date;
  imageUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyLog {
  userId: string;
  date: string; // YYYY-MM-DD
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealEntries: MealEntry[];
  completedAt?: Date;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string;
  totalDaysLogged: number;
}

export interface AIFoodAnalysis {
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
  }>;
  totalCalories: number;
  imageUrl: string;
}
