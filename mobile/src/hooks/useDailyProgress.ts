import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentUser } from '../services/auth';
import { getTodaysNutrition, getTodaysMeals } from '../services/meals';
import { getOrCreateUserPreferences } from '../services/userPreferences';
import { getUserStats } from '../services/meals';
import type { GroupedMeal } from '../services/meals';

export interface DailyProgressData {
  calories: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  macros: {
    protein: {
      consumed: number;
      goal: number;
      percentage: number;
    };
    carbs: {
      consumed: number;
      goal: number;
      percentage: number;
    };
    fat: {
      consumed: number;
      goal: number;
      percentage: number;
    };
  };
  meals: Array<{
    id: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    time: string;
    calories: number;
    image?: string;
    macros: {
      carbs: number;
      protein: number;
      fat: number;
    };
    foods?: Array<{ name: string; calories: number }>; // Added for grouped meals
    mealGroupId?: string; // Added for meal group identification
  }>;
  streak: number;
  notifications: number;
  userName: string;
}

export function useDailyProgress() {
  const [data, setData] = useState<DailyProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDailyProgress = useCallback(async (isRefresh: boolean = false) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user preferences or create with defaults
      const prefsResult = await getOrCreateUserPreferences(user.id);
      if (prefsResult.error) {
        throw new Error(prefsResult.error.message);
      }

      const preferences = prefsResult.data!;

      // Get today's nutrition data
      const dailyLog = await getTodaysNutrition(user.id);

      // Get today's meals
      const meals = await getTodaysMeals(user.id);

      // Get user stats for streak
      const statsResult = await getUserStats(user.id);
      const streak = statsResult.success ? statsResult.data.currentStreak : 0;

      // Calculate calories data
      const caloriesConsumed = dailyLog?.total_calories || 0;
      const caloriesGoal = preferences.daily_calorie_goal;
      const caloriesRemaining = Math.max(0, caloriesGoal - caloriesConsumed);
      const caloriesPercentage = Math.min(
        100,
        Math.round((caloriesConsumed / caloriesGoal) * 100)
      );

      // Calculate macros data
      const proteinConsumed = dailyLog?.total_protein || 0;
      const proteinGoal = preferences.daily_protein_goal;
      const proteinPercentage = Math.min(
        100,
        Math.round((proteinConsumed / proteinGoal) * 100)
      );

      const carbsConsumed = dailyLog?.total_carbs || 0;
      const carbsGoal = preferences.daily_carb_goal;
      const carbsPercentage = Math.min(
        100,
        Math.round((carbsConsumed / carbsGoal) * 100)
      );

      const fatConsumed = dailyLog?.total_fat || 0;
      const fatGoal = preferences.daily_fat_goal;
      const fatPercentage = Math.min(
        100,
        Math.round((fatConsumed / fatGoal) * 100)
      );

      // Transform grouped meals data
      const transformedMeals = meals.map((meal: GroupedMeal) => ({
        id: meal.id,
        type: meal.mealType,
        time: meal.logged_at
          ? new Date(meal.logged_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          : '',
        calories: meal.totalCalories,
        image: meal.imageUrl,
        macros: {
          carbs: meal.totalCarbs,
          protein: meal.totalProtein,
          fat: meal.totalFat,
        },
        foods: meal.foods,
        mealGroupId: meal.mealGroupId,
        title: meal.title,
      }));

      // Get user name
      const userName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Friend';

      setData({
        calories: {
          consumed: caloriesConsumed,
          goal: caloriesGoal,
          remaining: caloriesRemaining,
          percentage: caloriesPercentage,
        },
        macros: {
          protein: {
            consumed: proteinConsumed,
            goal: proteinGoal,
            percentage: proteinPercentage,
          },
          carbs: {
            consumed: carbsConsumed,
            goal: carbsGoal,
            percentage: carbsPercentage,
          },
          fat: {
            consumed: fatConsumed,
            goal: fatGoal,
            percentage: fatPercentage,
          },
        },
        meals: transformedMeals,
        streak,
        notifications: 0, // TODO: Implement notification count
        userName,
      });
    } catch (err) {
      // Only handle error if not aborted
      if (!abortController.signal.aborted) {
        console.error('Error fetching daily progress:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load daily progress'
        );
      }
    } finally {
      // Only update state if not aborted
      if (!abortController.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchDailyProgress();

    // Cleanup function to cancel ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDailyProgress]); // Now safe to include since useCallback has stable deps

  // Refresh function
  const refresh = useCallback(() => {
    return fetchDailyProgress(true);
  }, [fetchDailyProgress]);

  return {
    data,
    loading,
    error,
    refreshing,
    refresh,
  };
}
