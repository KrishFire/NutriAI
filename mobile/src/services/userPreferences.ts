import { supabase } from '../config/supabase';

/**
 * USER PREFERENCES DATABASE SCHEMA
 * 
 * Table: user_preferences
 * ----------------------
 * id: UUID (primary key)
 * user_id: UUID (references auth.users.id, unique)
 * daily_calorie_goal: INTEGER (default: 2000)
 * daily_protein_goal: INTEGER (default: 150)
 * daily_carb_goal: INTEGER (default: 200)
 * daily_fat_goal: INTEGER (default: 65)
 * weight_goal: TEXT ('lose_weight' | 'maintain_weight' | 'gain_weight')
 * activity_level: TEXT ('sedentary' | 'light' | 'moderate' | 'active' | 'very_active')
 * notifications_enabled: BOOLEAN (default: true)
 * streak_notifications: BOOLEAN (default: true)
 * meal_reminders: BOOLEAN (default: false)
 * privacy_analytics: BOOLEAN (default: true)
 * unit_system: TEXT ('metric' | 'imperial', default: 'metric')
 * created_at: TIMESTAMP WITH TIME ZONE
 * updated_at: TIMESTAMP WITH TIME ZONE
 * 
 * RLS Policies:
 * - Users can only view/edit their own preferences
 * - Authenticated users can insert their preferences
 */

export interface UserPreferences {
  id?: string;
  user_id: string;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carb_goal: number;
  daily_fat_goal: number;
  weight_goal: 'lose_weight' | 'maintain_weight' | 'gain_weight';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  notifications_enabled: boolean;
  streak_notifications: boolean;
  meal_reminders: boolean;
  privacy_analytics: boolean;
  unit_system: 'metric' | 'imperial';
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferencesInput {
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carb_goal?: number;
  daily_fat_goal?: number;
  weight_goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  notifications_enabled?: boolean;
  streak_notifications?: boolean;
  meal_reminders?: boolean;
  privacy_analytics?: boolean;
  unit_system?: 'metric' | 'imperial';
}

export interface PreferencesError {
  message: string;
  code?: string;
}

export interface PreferencesResult<T = UserPreferences> {
  data: T | null;
  error: PreferencesError | null;
}

/**
 * Default user preferences
 */
export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  daily_calorie_goal: 2000,
  daily_protein_goal: 150,
  daily_carb_goal: 200,
  daily_fat_goal: 65,
  weight_goal: 'maintain_weight',
  activity_level: 'moderate',
  notifications_enabled: true,
  streak_notifications: true,
  meal_reminders: false,
  privacy_analytics: true,
  unit_system: 'metric',
};

/**
 * Get user preferences from database
 * @param userId - User ID
 * @returns User preferences or null if not found
 */
export const getUserPreferences = async (
  userId: string
): Promise<PreferencesResult> => {
  try {
    if (!userId) {
      return {
        data: null,
        error: { message: 'User ID is required' }
      };
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no preferences found, return default preferences
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: null
        };
      }

      return {
        data: null,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }

    return {
      data: data as UserPreferences,
      error: null
    };
  } catch (err) {
    console.error('Error getting user preferences:', err);
    return {
      data: null,
      error: {
        message: 'An unexpected error occurred while fetching preferences'
      }
    };
  }
};

/**
 * Create initial user preferences
 * @param userId - User ID
 * @param preferences - Partial preferences (will be merged with defaults)
 * @returns Created preferences
 */
export const createUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferencesInput> = {}
): Promise<PreferencesResult> => {
  try {
    if (!userId) {
      return {
        data: null,
        error: { message: 'User ID is required' }
      };
    }

    const newPreferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      ...DEFAULT_PREFERENCES,
      ...preferences,
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .insert([newPreferences])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }

    return {
      data: data as UserPreferences,
      error: null
    };
  } catch (err) {
    console.error('Error creating user preferences:', err);
    return {
      data: null,
      error: {
        message: 'An unexpected error occurred while creating preferences'
      }
    };
  }
};

/**
 * Update user preferences
 * @param userId - User ID
 * @param preferences - Preferences to update
 * @returns Updated preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: UserPreferencesInput
): Promise<PreferencesResult> => {
  try {
    if (!userId) {
      return {
        data: null,
        error: { message: 'User ID is required' }
      };
    }

    const updateData = {
      ...preferences,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code
        }
      };
    }

    return {
      data: data as UserPreferences,
      error: null
    };
  } catch (err) {
    console.error('Error updating user preferences:', err);
    return {
      data: null,
      error: {
        message: 'An unexpected error occurred while updating preferences'
      }
    };
  }
};

/**
 * Get or create user preferences (ensures preferences exist)
 * @param userId - User ID
 * @returns User preferences (creates with defaults if none exist)
 */
export const getOrCreateUserPreferences = async (
  userId: string
): Promise<PreferencesResult> => {
  try {
    // First try to get existing preferences
    const existingResult = await getUserPreferences(userId);
    
    // If preferences exist, return them
    if (existingResult.data) {
      return existingResult;
    }

    // If there was an error other than "not found", return the error
    if (existingResult.error && existingResult.error.message !== 'No preferences found') {
      return existingResult;
    }

    // Create new preferences with defaults
    return await createUserPreferences(userId);
  } catch (err) {
    console.error('Error getting or creating user preferences:', err);
    return {
      data: null,
      error: {
        message: 'An unexpected error occurred while fetching or creating preferences'
      }
    };
  }
};

/**
 * Delete user preferences (for account deletion)
 * @param userId - User ID
 * @returns Success or error
 */
export const deleteUserPreferences = async (
  userId: string
): Promise<{ error: PreferencesError | null }> => {
  try {
    if (!userId) {
      return {
        error: { message: 'User ID is required' }
      };
    }

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return {
        error: {
          message: error.message,
          code: error.code
        }
      };
    }

    return { error: null };
  } catch (err) {
    console.error('Error deleting user preferences:', err);
    return {
      error: {
        message: 'An unexpected error occurred while deleting preferences'
      }
    };
  }
};

/**
 * Calculate daily calorie needs based on user preferences
 * @param preferences - User preferences
 * @param userAge - User age (optional, defaults to 30)
 * @param userWeight - User weight in kg (optional, defaults to 70)
 * @param userHeight - User height in cm (optional, defaults to 170)
 * @param userGender - User gender (optional, defaults to 'male')
 * @returns Calculated daily calorie needs
 */
export const calculateDailyCaloricNeeds = (
  preferences: UserPreferences,
  userAge: number = 30,
  userWeight: number = 70,
  userHeight: number = 170,
  userGender: 'male' | 'female' = 'male'
): number => {
  // Harris-Benedict Equation for BMR (Basal Metabolic Rate)
  let bmr: number;
  
  if (userGender === 'male') {
    bmr = 88.362 + (13.397 * userWeight) + (4.799 * userHeight) - (5.677 * userAge);
  } else {
    bmr = 447.593 + (9.247 * userWeight) + (3.098 * userHeight) - (4.330 * userAge);
  }

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  const tdee = bmr * activityMultipliers[preferences.activity_level];

  // Adjust based on weight goal
  const goalAdjustments = {
    lose_weight: -500, // 500 calorie deficit for ~1 lb/week loss
    maintain_weight: 0,
    gain_weight: 300 // 300 calorie surplus for gradual weight gain
  };

  return Math.round(tdee + goalAdjustments[preferences.weight_goal]);
};

/**
 * Validate user preferences input
 * @param preferences - Preferences to validate
 * @returns Validation errors or null if valid
 */
export const validateUserPreferences = (
  preferences: UserPreferencesInput
): PreferencesError | null => {
  const errors: string[] = [];

  // Validate calorie goal
  if (preferences.daily_calorie_goal !== undefined) {
    if (preferences.daily_calorie_goal < 800 || preferences.daily_calorie_goal > 5000) {
      errors.push('Daily calorie goal must be between 800 and 5000');
    }
  }

  // Validate protein goal
  if (preferences.daily_protein_goal !== undefined) {
    if (preferences.daily_protein_goal < 20 || preferences.daily_protein_goal > 400) {
      errors.push('Daily protein goal must be between 20 and 400 grams');
    }
  }

  // Validate carb goal
  if (preferences.daily_carb_goal !== undefined) {
    if (preferences.daily_carb_goal < 20 || preferences.daily_carb_goal > 800) {
      errors.push('Daily carb goal must be between 20 and 800 grams');
    }
  }

  // Validate fat goal
  if (preferences.daily_fat_goal !== undefined) {
    if (preferences.daily_fat_goal < 10 || preferences.daily_fat_goal > 200) {
      errors.push('Daily fat goal must be between 10 and 200 grams');
    }
  }

  if (errors.length > 0) {
    return { message: errors.join(', ') };
  }

  return null;
};