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
