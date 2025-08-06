import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllNotifications,
  checkDailyCalorieProgress,
  sendCalorieProgressNotification,
  isDailyReminderScheduled,
  updateNotificationSettings,
  sendTestNotification,
  NotificationResult,
} from '../services/notifications';

interface UseNotificationsReturn {
  // State
  isLoading: boolean;
  error: string | null;
  permissionStatus: string | null;
  isDailyReminderActive: boolean;

  // Actions
  requestPermissions: () => Promise<NotificationResult>;
  enableDailyReminder: () => Promise<NotificationResult>;
  disableDailyReminder: () => Promise<NotificationResult>;
  checkCalorieProgress: () => Promise<{
    shouldNotify: boolean;
    percentageLogged: number;
    caloriesLogged: number;
    calorieGoal: number;
  }>;
  sendProgressNotification: () => Promise<NotificationResult>;
  toggleNotifications: (enabled: boolean) => Promise<NotificationResult>;
  sendTestNotification: () => Promise<NotificationResult>;
  checkReminderStatus: () => Promise<void>;
}

/**
 * Hook for managing notifications in the app
 * Provides a simple interface to all notification functionality
 */
export function useNotifications(): UseNotificationsReturn {
  const { user, preferences } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [isDailyReminderActive, setIsDailyReminderActive] = useState(false);

  // Check reminder status on mount and when user changes
  useEffect(() => {
    if (user) {
      checkReminderStatus();
    }
  }, [user?.id]);

  // Check if daily reminder is scheduled
  const checkReminderStatus = useCallback(async () => {
    try {
      const isScheduled = await isDailyReminderScheduled();
      setIsDailyReminderActive(isScheduled);
    } catch (err) {
      console.error('Error checking reminder status:', err);
    }
  }, []);

  // Request notification permissions
  const requestPermissions =
    useCallback(async (): Promise<NotificationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await requestNotificationPermissions();

        if (!result.success) {
          setError(result.error || 'Failed to request permissions');
        } else {
          setPermissionStatus(result.data?.status || 'granted');
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    }, []);

  // Enable daily reminder
  const enableDailyReminder =
    useCallback(async (): Promise<NotificationResult> => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await scheduleDailyReminder(user.id);

        if (!result.success) {
          setError(result.error || 'Failed to schedule reminder');
        } else {
          setIsDailyReminderActive(true);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    }, [user]);

  // Disable daily reminder
  const disableDailyReminder =
    useCallback(async (): Promise<NotificationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await cancelAllNotifications();

        if (!result.success) {
          setError(result.error || 'Failed to cancel notifications');
        } else {
          setIsDailyReminderActive(false);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    }, []);

  // Check calorie progress
  const checkCalorieProgress = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return await checkDailyCalorieProgress(user.id);
  }, [user]);

  // Send progress notification
  const sendProgressNotification =
    useCallback(async (): Promise<NotificationResult> => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await sendCalorieProgressNotification(user.id);

        if (!result.success) {
          setError(result.error || 'Failed to send notification');
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    }, [user]);

  // Toggle notifications based on user preference
  const toggleNotifications = useCallback(
    async (enabled: boolean): Promise<NotificationResult> => {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await updateNotificationSettings(user.id, enabled);

        if (!result.success) {
          setError(result.error || 'Failed to update notification settings');
        } else {
          setIsDailyReminderActive(enabled);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Send test notification (for debugging)
  const testNotification =
    useCallback(async (): Promise<NotificationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sendTestNotification();

        if (!result.success) {
          setError(result.error || 'Failed to send test notification');
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    }, []);

  return {
    // State
    isLoading,
    error,
    permissionStatus,
    isDailyReminderActive,

    // Actions
    requestPermissions,
    enableDailyReminder,
    disableDailyReminder,
    checkCalorieProgress,
    sendProgressNotification,
    toggleNotifications,
    sendTestNotification: testNotification,
    checkReminderStatus,
  };
}
