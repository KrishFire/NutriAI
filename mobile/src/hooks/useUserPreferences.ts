import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getUserPreferences,
  getOrCreateUserPreferences,
  updateUserPreferences,
  UserPreferences,
  UserPreferencesInput,
  PreferencesError,
  DEFAULT_PREFERENCES,
} from '../services/userPreferences';

interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: PreferencesError | null;
  refreshPreferences: () => Promise<void>;
  updatePreferences: (updates: UserPreferencesInput) => Promise<boolean>;
  hasUnsavedChanges: boolean;
  resetToDefaults: () => void;
}

/**
 * Hook for managing user preferences
 * @returns User preferences state and management functions
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PreferencesError | null>(null);
  const [originalPreferences, setOriginalPreferences] =
    useState<UserPreferences | null>(null);

  /**
   * Load user preferences
   */
  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getOrCreateUserPreferences(user.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        setPreferences(result.data);
        setOriginalPreferences(result.data);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError({
        message: 'Failed to load preferences',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Refresh preferences from server
   */
  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(
    async (updates: UserPreferencesInput): Promise<boolean> => {
      if (!user?.id || !preferences) {
        return false;
      }

      try {
        setError(null);

        const result = await updateUserPreferences(user.id, updates);

        if (result.error) {
          setError(result.error);
          return false;
        }

        if (result.data) {
          setPreferences(result.data);
          setOriginalPreferences(result.data);
          return true;
        }

        return false;
      } catch (err) {
        console.error('Error updating preferences:', err);
        setError({
          message: 'Failed to update preferences',
        });
        return false;
      }
    },
    [user?.id, preferences]
  );

  /**
   * Reset preferences to defaults
   */
  const resetToDefaults = useCallback(() => {
    if (!user?.id) return;

    const defaultPrefs: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      user_id: user.id,
    };

    setPreferences(defaultPrefs);
  }, [user?.id]);

  /**
   * Check if there are unsaved changes
   */
  const hasUnsavedChanges = Boolean(
    preferences &&
      originalPreferences &&
      JSON.stringify(preferences) !== JSON.stringify(originalPreferences)
  );

  // Load preferences when user changes
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    refreshPreferences,
    updatePreferences,
    hasUnsavedChanges,
    resetToDefaults,
  };
}

/**
 * Hook to get daily nutrition goals from user preferences
 * @returns Daily nutrition goals
 */
export function useDailyGoals() {
  const { preferences } = useUserPreferences();

  return {
    calories:
      preferences?.daily_calorie_goal || DEFAULT_PREFERENCES.daily_calorie_goal,
    protein:
      preferences?.daily_protein_goal || DEFAULT_PREFERENCES.daily_protein_goal,
    carbs: preferences?.daily_carb_goal || DEFAULT_PREFERENCES.daily_carb_goal,
    fat: preferences?.daily_fat_goal || DEFAULT_PREFERENCES.daily_fat_goal,
  };
}

/**
 * Hook to get user activity and weight goals
 * @returns User goals and preferences
 */
export function useUserGoals() {
  const { preferences } = useUserPreferences();

  return {
    weightGoal: preferences?.weight_goal || DEFAULT_PREFERENCES.weight_goal,
    activityLevel:
      preferences?.activity_level || DEFAULT_PREFERENCES.activity_level,
    unitSystem: preferences?.unit_system || DEFAULT_PREFERENCES.unit_system,
  };
}

/**
 * Hook to get notification preferences
 * @returns Notification settings
 */
export function useNotificationPreferences() {
  const { preferences } = useUserPreferences();

  return {
    notificationsEnabled:
      preferences?.notifications_enabled ??
      DEFAULT_PREFERENCES.notifications_enabled,
    streakNotifications:
      preferences?.streak_notifications ??
      DEFAULT_PREFERENCES.streak_notifications,
    mealReminders:
      preferences?.meal_reminders ?? DEFAULT_PREFERENCES.meal_reminders,
  };
}

/**
 * Hook to get privacy preferences
 * @returns Privacy settings
 */
export function usePrivacyPreferences() {
  const { preferences } = useUserPreferences();

  return {
    analyticsEnabled:
      preferences?.privacy_analytics ?? DEFAULT_PREFERENCES.privacy_analytics,
  };
}
