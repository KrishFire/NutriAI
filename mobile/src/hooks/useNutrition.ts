import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTodaysNutrition, getTodaysMeals } from '../services/meals';
import { DailyLog, MealEntry } from '../services/meals';

interface NutritionData {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNutrition(): NutritionData {
  const { user } = useAuth();
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNutritionData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const todaysLog = await getTodaysNutrition(user.id);
      setDailyLog(todaysLog);
    } catch (err) {
      console.error('Error fetching nutrition data:', err);
      setError('Failed to load nutrition data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, [user]);

  // Get user's targets from their profile or use defaults
  const getUserTargets = () => {
    // TODO: Get actual targets from user profile
    // For now, using standard defaults based on 2000 calorie diet
    return {
      calories: user?.user_metadata?.daily_calorie_target || 2000,
      protein: user?.user_metadata?.protein_target || 150, // ~30% of calories
      carbs: user?.user_metadata?.carbs_target || 250, // ~50% of calories
      fat: user?.user_metadata?.fat_target || 67, // ~30% of calories
    };
  };

  const targets = getUserTargets();

  return {
    calories: {
      current: Math.round(dailyLog?.total_calories || 0),
      target: targets.calories,
    },
    protein: {
      current: Math.round(dailyLog?.total_protein || 0),
      target: targets.protein,
    },
    carbs: {
      current: Math.round(dailyLog?.total_carbs || 0),
      target: targets.carbs,
    },
    fat: {
      current: Math.round(dailyLog?.total_fat || 0),
      target: targets.fat,
    },
    isLoading,
    error,
    refresh: fetchNutritionData,
  };
}

interface MealData {
  meals: MealEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTodaysMeals(): MealData {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const todaysMeals = await getTodaysMeals(user.id);
      setMeals(todaysMeals);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [user]);

  return {
    meals,
    isLoading,
    error,
    refresh: fetchMeals,
  };
}
