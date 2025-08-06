// Application constants

export const APP_NAME = 'NutriAI';

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
} as const;

export const ACTIVITY_LEVELS = {
  SEDENTARY: { value: 'sedentary', label: 'Sedentary', multiplier: 1.2 },
  LIGHT: { value: 'light', label: 'Lightly Active', multiplier: 1.375 },
  MODERATE: { value: 'moderate', label: 'Moderately Active', multiplier: 1.55 },
  VERY: { value: 'very', label: 'Very Active', multiplier: 1.725 },
  EXTRA: { value: 'extra', label: 'Extra Active', multiplier: 1.9 },
} as const;

export const GOALS = {
  LOSE: { value: 'lose', label: 'Lose Weight', calorieAdjustment: -500 },
  MAINTAIN: {
    value: 'maintain',
    label: 'Maintain Weight',
    calorieAdjustment: 0,
  },
  GAIN: { value: 'gain', label: 'Gain Weight', calorieAdjustment: 500 },
} as const;

export const MACRO_COLORS = {
  CALORIES: '#FF6B6B',
  PROTEIN: '#4ECDC4',
  CARBS: '#FFD93D',
  FAT: '#95E1D3',
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  IMAGE_UPLOAD: 30000, // 30 seconds
  AI_ANALYSIS: 20000, // 20 seconds
} as const;

export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  DAILY_LOG: 'daily_log',
  RECENT_FOODS: 'recent_foods',
  STREAK_DATA: 'streak_data',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  UPLOAD_ERROR: 'Failed to upload image. Please try again.',
  AI_ANALYSIS_ERROR: 'Failed to analyze image. Please try manual entry.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Spacing constants for consistent layout
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24, // Header padding, progress rings container
  xl: 32,
  xxl: 36, // Big ring to macro rings
  xxxl: 40, // Main sections
  xxxxl: 48,
} as const;
