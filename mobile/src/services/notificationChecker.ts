import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { getTodaysNutrition, getUserStats } from './meals';
import { supabase } from '../config/supabase';

const BACKGROUND_FETCH_TASK = 'nutrition-check-task';
const CALORIE_THRESHOLD_PERCENTAGE = 0.75; // 75% of daily goal

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('[Background Task] Checking nutrition status...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[Background Task] No user found, skipping check');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!preferences?.notifications_enabled) {
      console.log('[Background Task] Notifications disabled for user');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Get today's nutrition data
    const todaysLog = await getTodaysNutrition(user.id);
    const dailyCalorieGoal = preferences.daily_calorie_goal || 2000;
    const currentCalories = todaysLog?.total_calories || 0;
    const percentageComplete = currentCalories / dailyCalorieGoal;

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();

    // Only send notification if it's after 8 PM and user hasn't met 75% of their goal
    if (currentHour >= 20 && percentageComplete < CALORIE_THRESHOLD_PERCENTAGE) {
      // Get streak data to add to notification
      const statsResult = await getUserStats(user.id);
      const currentStreak = statsResult.success ? statsResult.data.currentStreak : 0;
      
      // Prepare notification content
      let title = '🍽️ Don\'t forget to log your meals!';
      let body = `You've only logged ${Math.round(percentageComplete * 100)}% of your daily calories.`;
      
      if (currentStreak > 0) {
        body += ` Don't lose your ${currentStreak}-day streak! 🔥`;
      } else {
        body += ' Start building your streak today! 💪';
      }

      // Send the notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { 
            type: 'low_calorie_reminder',
            userId: user.id,
            currentCalories,
            dailyGoal: dailyCalorieGoal,
            currentStreak,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      console.log('[Background Task] Low calorie reminder sent');
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    console.log('[Background Task] No notification needed');
    return BackgroundFetch.BackgroundFetchResult.NoData;
    
  } catch (error) {
    console.error('[Background Task] Error checking nutrition:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background task
export async function registerBackgroundNotificationCheck() {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    
    if (isRegistered) {
      console.log('[Background Task] Already registered');
      return { success: true };
    }

    // Register the task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 60, // Check every hour
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('[Background Task] Registered successfully');
    return { success: true };
    
  } catch (error) {
    console.error('[Background Task] Registration failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to register background task' 
    };
  }
}

// Unregister the background task
export async function unregisterBackgroundNotificationCheck() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log('[Background Task] Unregistered successfully');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('[Background Task] Unregistration failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to unregister background task' 
    };
  }
}

// Manually trigger the background check (for testing)
export async function triggerNotificationCheck() {
  try {
    // Note: fetchAsync is not available in expo-background-fetch
    // This function would need to be implemented differently or removed
    console.log('[Background Task] Manual trigger not available in expo-background-fetch');
    return { 
      success: false, 
      error: 'Manual trigger not supported' 
    };
  } catch (error) {
    console.error('[Background Task] Manual trigger failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to trigger check' 
    };
  }
}