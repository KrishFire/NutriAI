import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utilities for NutriAI
 * Based on the haptic patterns defined in UI_prompt.md
 */
export const hapticFeedback = {
  /**
   * Light tap (10ms) for UI selections
   * Used for: button taps, selections, toggles
   */
  selection: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  },

  /**
   * Medium tap (20ms) for activations
   * Used for: confirmations, submissions, important actions
   */
  impact: async (
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
  ) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.impactAsync(style);
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  },

  /**
   * Success pattern [15, 50, 30]
   * Used for: successful operations, achievements, completions
   */
  success: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  },

  /**
   * Error pattern [10, 30, 10, 30, 10]
   * Used for: errors, invalid inputs, failures
   */
  error: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  },

  /**
   * Warning pattern [10, 50, 10]
   * Used for: warnings, cautions, important notices
   */
  warning: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  },
};

// Export individual functions for convenience
export const {
  selection: hapticSelection,
  impact: hapticImpact,
  success: hapticSuccess,
  error: hapticError,
  warning: hapticWarning,
} = hapticFeedback;
