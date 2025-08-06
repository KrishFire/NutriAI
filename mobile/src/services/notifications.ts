import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserPreferences } from './userPreferences';
import { getTodaysNutrition } from './meals';
import { registerBackgroundNotificationCheck } from './notificationChecker';

// Constants
const NOTIFICATION_STORAGE_KEY = '@nutriai_notification_id';
const DAILY_REMINDER_IDENTIFIER = 'daily-nutrition-reminder';
const DAILY_REMINDER_HOUR = 20; // 8 PM
const CALORIE_THRESHOLD = 0.75; // 75%

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Request permission to send notifications
 * @returns Promise with permission status
 */
export async function requestNotificationPermissions(): Promise<NotificationResult> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return {
        success: false,
        error: 'Notification permissions denied',
      };
    }

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Daily Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        description: 'Daily nutrition tracking reminders',
      });
    }

    return {
      success: true,
      data: { status: finalStatus },
    };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to request permissions',
    };
  }
}

/**
 * Schedule daily nutrition reminder at 8 PM
 * @param userId - User ID for fetching preferences and nutrition data
 * @returns Promise with scheduling result
 */
export async function scheduleDailyReminder(
  userId: string
): Promise<NotificationResult> {
  try {
    // First check if user has notifications enabled
    const preferencesResult = await getUserPreferences(userId);
    if (preferencesResult.error || !preferencesResult.data) {
      return {
        success: false,
        error: 'Failed to fetch user preferences',
      };
    }

    const preferences = preferencesResult.data;

    // Check if notifications are enabled
    if (!preferences.notifications_enabled) {
      return {
        success: false,
        error: 'Notifications are disabled in user preferences',
      };
    }

    // Request permissions if needed
    const permissionResult = await requestNotificationPermissions();
    if (!permissionResult.success) {
      return permissionResult;
    }

    // Cancel existing reminder before scheduling new one
    await cancelDailyReminder();

    // Create trigger for 8 PM daily
    const trigger: Notifications.NotificationTriggerInput = {
      type: 'daily',
      hour: DAILY_REMINDER_HOUR,
      minute: 0,
    } as any; // Type assertion needed due to expo-notifications type issue

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to log your meals! 📝',
        body: 'How was your nutrition today? Log your meals to track your progress.',
        data: {
          type: 'daily_reminder',
          userId,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: 'reminder',
      },
      trigger,
      identifier: DAILY_REMINDER_IDENTIFIER,
    });

    // Store the notification ID
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, notificationId);

    console.log('Daily reminder scheduled successfully:', notificationId);

    return {
      success: true,
      data: { notificationId },
    };
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to schedule reminder',
    };
  }
}

/**
 * Check if user has logged less than 75% of daily calories
 * @param userId - User ID
 * @returns Promise with check result
 */
export async function checkDailyCalorieProgress(userId: string): Promise<{
  shouldNotify: boolean;
  percentageLogged: number;
  caloriesLogged: number;
  calorieGoal: number;
}> {
  try {
    // Get user preferences for calorie goal
    const preferencesResult = await getUserPreferences(userId);
    if (preferencesResult.error || !preferencesResult.data) {
      console.error('Failed to fetch user preferences');
      return {
        shouldNotify: false,
        percentageLogged: 0,
        caloriesLogged: 0,
        calorieGoal: 2000,
      };
    }

    const preferences = preferencesResult.data;
    const calorieGoal = preferences.daily_calorie_goal;

    // Get today's nutrition data
    const todaysNutrition = await getTodaysNutrition(userId);
    if (!todaysNutrition) {
      return {
        shouldNotify: true,
        percentageLogged: 0,
        caloriesLogged: 0,
        calorieGoal,
      };
    }

    const caloriesLogged = todaysNutrition.total_calories;
    const percentageLogged = caloriesLogged / calorieGoal;

    return {
      shouldNotify: percentageLogged < CALORIE_THRESHOLD,
      percentageLogged: percentageLogged * 100,
      caloriesLogged,
      calorieGoal,
    };
  } catch (error) {
    console.error('Error checking daily calorie progress:', error);
    return {
      shouldNotify: false,
      percentageLogged: 0,
      caloriesLogged: 0,
      calorieGoal: 2000,
    };
  }
}

/**
 * Send a custom notification based on calorie progress
 * @param userId - User ID
 * @returns Promise with notification result
 */
export async function sendCalorieProgressNotification(
  userId: string
): Promise<NotificationResult> {
  try {
    const progress = await checkDailyCalorieProgress(userId);

    if (!progress.shouldNotify) {
      return {
        success: false,
        error: 'User has already logged sufficient calories',
      };
    }

    // Check if notifications are enabled
    const preferencesResult = await getUserPreferences(userId);
    if (!preferencesResult.data?.notifications_enabled) {
      return {
        success: false,
        error: 'Notifications are disabled',
      };
    }

    const remainingCalories = progress.calorieGoal - progress.caloriesLogged;

    const notificationContent = {
      title: `You've logged ${Math.round(progress.percentageLogged)}% of your daily calories`,
      body: `${remainingCalories} calories left to reach your ${progress.calorieGoal} calorie goal!`,
      data: {
        type: 'calorie_reminder',
        userId,
        progress: {
          caloriesLogged: progress.caloriesLogged,
          calorieGoal: progress.calorieGoal,
          percentageLogged: progress.percentageLogged,
        },
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    };

    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // Send immediately
    });

    return {
      success: true,
      data: progress,
    };
  } catch (error) {
    console.error('Error sending calorie progress notification:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to send notification',
    };
  }
}

/**
 * Cancel all scheduled notifications
 * @returns Promise with cancellation result
 */
export async function cancelAllNotifications(): Promise<NotificationResult> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error canceling notifications:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to cancel notifications',
    };
  }
}

/**
 * Cancel daily reminder specifically
 * @returns Promise with cancellation result
 */
export async function cancelDailyReminder(): Promise<NotificationResult> {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      DAILY_REMINDER_IDENTIFIER
    );
    await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error canceling daily reminder:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to cancel reminder',
    };
  }
}

/**
 * Handle notification response when user taps on notification
 * @param response - Notification response object
 */
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse
): Promise<void> {
  try {
    const { notification } = response;
    const data = notification.request.content.data;

    console.log('Notification response received:', data);

    // Handle different notification types
    switch (data?.type) {
      case 'daily_reminder':
        // Navigate to home screen or meal logging screen
        // This would typically be handled by navigation in the app
        console.log('Daily reminder tapped - navigate to meal logging');
        break;

      case 'calorie_reminder':
        // Navigate to nutrition summary or quick add screen
        console.log('Calorie reminder tapped - show nutrition summary');
        break;

      default:
        console.log('Unknown notification type:', data?.type);
    }

    // Track analytics event
    if (data?.userId) {
      // You could track this interaction in your analytics
      console.log('Notification interaction tracked for user:', data.userId);
    }
  } catch (error) {
    console.error('Error handling notification response:', error);
  }
}

/**
 * Get scheduled notifications
 * @returns Promise with array of scheduled notifications
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Check if daily reminder is scheduled
 * @returns Promise with boolean indicating if reminder is scheduled
 */
export async function isDailyReminderScheduled(): Promise<boolean> {
  try {
    const notifications = await getScheduledNotifications();
    return notifications.some(n => n.identifier === DAILY_REMINDER_IDENTIFIER);
  } catch (error) {
    console.error('Error checking if daily reminder is scheduled:', error);
    return false;
  }
}

/**
 * Initialize notification service and set up listeners
 * Should be called when app starts
 * @returns Cleanup function to remove listeners
 */
export function initializeNotificationService(): () => void {
  // Set up notification received listener (when app is in foreground)
  const notificationListener = Notifications.addNotificationReceivedListener(
    notification => {
      console.log('Notification received in foreground:', notification);
    }
  );

  // Set up notification response listener (when user taps notification)
  const responseListener =
    Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

  // Register background notification check task
  registerBackgroundNotificationCheck().then(result => {
    if (result.success) {
      console.log('Background notification check registered successfully');
    } else {
      console.error(
        'Failed to register background notification check:',
        result.error
      );
    }
  });

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

/**
 * Update notification settings based on user preferences
 * @param userId - User ID
 * @param notificationsEnabled - Whether notifications should be enabled
 * @returns Promise with update result
 */
export async function updateNotificationSettings(
  userId: string,
  notificationsEnabled: boolean
): Promise<NotificationResult> {
  try {
    if (notificationsEnabled) {
      // Schedule notifications
      return await scheduleDailyReminder(userId);
    } else {
      // Cancel all notifications
      return await cancelAllNotifications();
    }
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update settings',
    };
  }
}

/**
 * Send a test notification for debugging
 * @returns Promise with test result
 */
export async function sendTestNotification(): Promise<NotificationResult> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        error: 'Notification permissions not granted',
      };
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification 🧪',
        body: 'This is a test notification from NutriAI!',
        data: { type: 'test' },
        sound: true,
      },
      trigger: null, // Send immediately
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error sending test notification:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to send test notification',
    };
  }
}
