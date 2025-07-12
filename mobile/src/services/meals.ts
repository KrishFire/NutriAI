import { supabase } from '../config/supabase';
import { MealAnalysis, FoodItem } from './openai';

export interface MealEntry {
  id?: string;
  user_id: string;
  daily_log_id?: string;
  food_item_id?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  notes?: string;
  logged_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyLog {
  id?: string;
  user_id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  completed_at?: string;
}

/**
 * Get or create daily log for a user on a specific date
 */
export async function getOrCreateDailyLog(
  userId: string,
  date: Date
): Promise<DailyLog> {
  const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Check if daily log exists
  const { data: existingLog, error: fetchError } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch daily log: ${fetchError.message}`);
  }

  if (existingLog) {
    return existingLog;
  }

  // Create new daily log
  const { data: newLog, error: createError } = await supabase
    .from('daily_logs')
    .insert({
      user_id: userId,
      date: dateStr,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create daily log: ${createError.message}`);
  }

  return newLog;
}

/**
 * Save meal analysis to database
 */
export async function saveMealAnalysis(
  userId: string,
  mealType: MealEntry['meal_type'],
  analysis: MealAnalysis,
  imageUrl?: string,
  notes?: string
): Promise<{ success: boolean; error?: string; mealEntries?: MealEntry[] }> {
  try {
    const today = new Date();

    // Get or create daily log
    const dailyLog = await getOrCreateDailyLog(userId, today);

    // Prepare meal entries
    const mealEntries: Omit<MealEntry, 'id' | 'created_at' | 'updated_at'>[] =
      [];

    for (const food of analysis.foods) {
      // First, check if food item exists or create it
      const { data: foodItem, error: foodError } = await supabase
        .from('food_items')
        .upsert({
          name: food.name,
          serving_size: 1,
          serving_unit: food.quantity,
          calories: food.nutrition.calories,
          protein: food.nutrition.protein,
          carbs: food.nutrition.carbs,
          fat: food.nutrition.fat,
          fiber: food.nutrition.fiber || 0,
          sugar: food.nutrition.sugar || 0,
          sodium: food.nutrition.sodium || 0,
          verified: false,
        })
        .select()
        .single();

      if (foodError) {
        console.error('Error creating food item:', foodError);
        continue;
      }

      // Create meal entry
      mealEntries.push({
        user_id: userId,
        daily_log_id: dailyLog.id!,
        food_item_id: foodItem.id,
        meal_type: mealType,
        quantity: 1,
        unit: food.quantity,
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        carbs: food.nutrition.carbs,
        fat: food.nutrition.fat,
        image_url: imageUrl,
        notes: notes,
        logged_at: new Date().toISOString(),
      });
    }

    // Insert all meal entries
    const { data: insertedEntries, error: insertError } = await supabase
      .from('meal_entries')
      .insert(mealEntries)
      .select();

    if (insertError) {
      throw new Error(`Failed to save meal entries: ${insertError.message}`);
    }

    // Update daily log totals
    const { error: updateError } = await supabase
      .from('daily_logs')
      .update({
        total_calories:
          dailyLog.total_calories + analysis.totalNutrition.calories,
        total_protein: dailyLog.total_protein + analysis.totalNutrition.protein,
        total_carbs: dailyLog.total_carbs + analysis.totalNutrition.carbs,
        total_fat: dailyLog.total_fat + analysis.totalNutrition.fat,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dailyLog.id);

    if (updateError) {
      console.error('Error updating daily totals:', updateError);
    }

    // Track analytics event
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_name: 'meal_logged',
      properties: {
        method: 'photo',
        items: analysis.foods.length,
        total_kcal: analysis.totalNutrition.calories,
        meal_type: mealType,
      },
    });

    // Update user streak
    await updateUserStreak(userId);

    return {
      success: true,
      mealEntries: insertedEntries || [],
    };
  } catch (error) {
    console.error('Error saving meal analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save meal',
    };
  }
}

/**
 * Update user's logging streak
 */
async function updateUserStreak(userId: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get current streak
    const { data: streak, error: fetchError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching streak:', fetchError);
      return;
    }

    if (!streak) {
      // Create new streak record
      await supabase.from('user_streaks').insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_log_date: today,
        total_days_logged: 1,
      });
      return;
    }

    // Check if already logged today
    if (streak.last_log_date === today) {
      return;
    }

    // Calculate streak
    const lastLogDate = new Date(streak.last_log_date);
    const todayDate = new Date(today);
    const daysDiff = Math.floor(
      (todayDate.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newCurrentStreak = streak.current_streak;
    if (daysDiff === 1) {
      // Consecutive day
      newCurrentStreak = streak.current_streak + 1;
    } else {
      // Streak broken
      newCurrentStreak = 1;
    }

    // Update streak
    await supabase
      .from('user_streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: Math.max(newCurrentStreak, streak.longest_streak),
        last_log_date: today,
        total_days_logged: streak.total_days_logged + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

/**
 * Get today's meals for a user
 */
export async function getTodaysMeals(userId: string): Promise<MealEntry[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('meal_entries')
    .select(
      `
      *,
      food_items (*)
    `
    )
    .eq('user_id', userId)
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: false });

  if (error) {
    console.error('Error fetching meals:', error);
    return [];
  }

  return data || [];
}

/**
 * Get today's nutrition summary
 */
export async function getTodaysNutrition(
  userId: string
): Promise<DailyLog | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows gracefully

  if (error) {
    console.error('Error fetching daily log:', error);
    return null;
  }

  // If no daily log exists yet, return a default one
  if (!data) {
    return {
      user_id: userId,
      date: today,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
    };
  }

  return data;
}

/**
 * Get meal history for a user (last 30 days)
 */
export async function getMealHistory(userId: string, daysBack: number = 30) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get daily logs for the date range
    const { data: dailyLogs, error: dailyError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (dailyError) {
      throw new Error(`Failed to fetch daily logs: ${dailyError.message}`);
    }

    // Get all meal entries for the date range with food items
    const { data: mealEntries, error: mealsError } = await supabase
      .from('meal_entries')
      .select(
        `
        *,
        food_items (
          id,
          name,
          serving_size,
          serving_unit,
          calories,
          protein,
          carbs,
          fat
        )
      `
      )
      .eq('user_id', userId)
      .gte('logged_at', `${startDate.toISOString().split('T')[0]}T00:00:00`)
      .lte('logged_at', `${endDate.toISOString().split('T')[0]}T23:59:59`)
      .order('logged_at', { ascending: false });

    if (mealsError) {
      throw new Error(`Failed to fetch meal entries: ${mealsError.message}`);
    }

    // Group meal entries by date
    const mealsByDate: { [key: string]: any[] } = {};

    (mealEntries || []).forEach(entry => {
      const date = entry.logged_at?.split('T')[0] || '';
      if (!mealsByDate[date]) {
        mealsByDate[date] = [];
      }
      mealsByDate[date].push(entry);
    });

    // Create history data structure
    const historyData = (dailyLogs || []).map(dailyLog => {
      const dayMeals = mealsByDate[dailyLog.date] || [];

      // Group meals by meal type for the day
      const mealsByType: { [key: string]: any[] } = {};
      dayMeals.forEach(meal => {
        if (!mealsByType[meal.meal_type]) {
          mealsByType[meal.meal_type] = [];
        }
        mealsByType[meal.meal_type].push(meal);
      });

      // Create meal entries for each meal type
      const meals = Object.entries(mealsByType).map(([mealType, entries]) => {
        const foods = entries.map(entry => ({
          name: entry.food_items?.name || 'Unknown Food',
          calories: entry.calories || 0,
        }));

        const totalCalories = entries.reduce(
          (sum, entry) => sum + (entry.calories || 0),
          0
        );
        const totalProtein = entries.reduce(
          (sum, entry) => sum + (entry.protein || 0),
          0
        );
        const totalCarbs = entries.reduce(
          (sum, entry) => sum + (entry.carbs || 0),
          0
        );
        const totalFat = entries.reduce(
          (sum, entry) => sum + (entry.fat || 0),
          0
        );

        return {
          id: `${dailyLog.date}-${mealType}`,
          date: dailyLog.date,
          mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          foods,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
          imageUrl: entries.find(e => e.image_url)?.image_url,
        };
      });

      return {
        date: dailyLog.date,
        totalCalories: dailyLog.total_calories || 0,
        totalMeals: meals.length,
        meals: meals.sort((a, b) => {
          // Sort meals by preferred order: breakfast, lunch, dinner, snack
          const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
          return order[a.mealType] - order[b.mealType];
        }),
      };
    });

    return {
      success: true,
      data: historyData,
    };
  } catch (error) {
    console.error('Error fetching meal history:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch meal history',
      data: [],
    };
  }
}

/**
 * Get user statistics based on meal history
 */
export async function getUserStats(userId: string) {
  try {
    // Get user streak data
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get meal entries for the last 30 days to calculate averages
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentMeals, error: mealsError } = await supabase
      .from('meal_entries')
      .select('calories, protein, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', thirtyDaysAgo.toISOString())
      .order('logged_at', { ascending: false });

    // Get total meal count
    const { count: totalMeals, error: countError } = await supabase
      .from('meal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get unique days with meals for "days active"
    const { data: uniqueDays, error: daysError } = await supabase
      .from('daily_logs')
      .select('date')
      .eq('user_id', userId)
      .gt('total_calories', 0); // Only count days with actual meals logged

    if (streakError || mealsError || countError || daysError) {
      console.error('Error fetching user stats:', {
        streakError,
        mealsError,
        countError,
        daysError,
      });
    }

    // Calculate averages
    const avgCalories = recentMeals?.length
      ? Math.round(
          recentMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0) /
            recentMeals.length
        )
      : 0;

    const avgProtein = recentMeals?.length
      ? Math.round(
          recentMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0) /
            recentMeals.length
        )
      : 0;

    return {
      success: true,
      data: {
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        totalMeals: totalMeals || 0,
        avgCalories,
        avgProtein,
        daysActive: uniqueDays?.length || 0,
        totalDaysLogged: streakData?.total_days_logged || 0,
      },
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch user stats',
      data: {
        currentStreak: 0,
        longestStreak: 0,
        totalMeals: 0,
        avgCalories: 0,
        avgProtein: 0,
        daysActive: 0,
        totalDaysLogged: 0,
      },
    };
  }
}

/**
 * Delete a meal entry
 */
export async function deleteMealEntry(
  mealId: string,
  userId: string
): Promise<boolean> {
  try {
    // Get meal entry to update daily totals
    const { data: meal, error: fetchError } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('id', mealId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !meal) {
      throw new Error('Meal not found');
    }

    // Delete the meal entry
    const { error: deleteError } = await supabase
      .from('meal_entries')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error('Failed to delete meal');
    }

    // Update daily log totals
    if (meal.daily_log_id) {
      const { data: dailyLog } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('id', meal.daily_log_id)
        .single();

      if (dailyLog) {
        await supabase
          .from('daily_logs')
          .update({
            total_calories: Math.max(
              0,
              dailyLog.total_calories - meal.calories
            ),
            total_protein: Math.max(0, dailyLog.total_protein - meal.protein),
            total_carbs: Math.max(0, dailyLog.total_carbs - meal.carbs),
            total_fat: Math.max(0, dailyLog.total_fat - meal.fat),
            updated_at: new Date().toISOString(),
          })
          .eq('id', meal.daily_log_id);
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    return false;
  }
}
