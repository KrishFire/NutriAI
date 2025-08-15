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
  fiber?: number;
  sugar?: number;
  sodium?: number;
  food_name?: string;
  meal_group_id?: string;
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
/**
 * Helper function to convert FoodItem to flat format for correction_history storage
 * This ensures ingredients have flat macro structure that the loader expects
 */
/**
 * Parse a quantity string like "2 slices" into number and unit parts
 * Handles formats: "2", "2 servings", "2 slices", "1.5 cups", bare "serving"
 */
function parseQuantityString(q: string): { quantity: number; unit: string } {
  if (!q) return { quantity: 1, unit: 'serving' };
  
  // Handle bare "serving" or "servings"
  if (q.toLowerCase() === 'serving' || q.toLowerCase() === 'servings') {
    return { quantity: 1, unit: 'serving' };
  }
  
  // Try to match number at start
  const match = q.match(/^([0-9.]+)\s*(.*)$/);
  if (match) {
    const quantity = parseFloat(match[1]) || 1;
    let unit = match[2].trim() || 'serving';
    
    // Normalize common units
    if (unit === '') unit = 'serving';
    if (unit === 'servings') unit = 'serving';
    
    return { quantity, unit };
  }
  
  // No number found, treat as unit only
  return { quantity: 1, unit: q };
}

function toFlatFoodForHistory(food: any, title?: string) {
  // Parse quantity string like "1 serving" → {quantity: 1, unit: "serving"}
  const parseQuantity = (qty: string | undefined) => {
    if (!qty) return { number: 1, unit: 'serving' };
    const match = qty.match(/^([\d.]+)\s*(.*)$/);
    return {
      number: match ? parseFloat(match[1]) : 1,
      unit: match?.[2] || 'serving'
    };
  };
  
  const { number: qtyNum, unit: qtyUnit } = parseQuantity(food.quantity);
  
  return {
    name: food.name,
    quantity: qtyNum,
    unit: qtyUnit,
    // Flatten nutrition to top level
    calories: food.nutrition?.calories ?? food.calories ?? 0,
    protein: food.nutrition?.protein ?? food.protein ?? 0,
    carbs: food.nutrition?.carbs ?? food.carbs ?? 0,
    fat: food.nutrition?.fat ?? food.fat ?? 0,
    fiber: food.nutrition?.fiber ?? food.fiber ?? 0,
    sugar: food.nutrition?.sugar ?? food.sugar ?? 0,
    sodium: food.nutrition?.sodium ?? food.sodium ?? 0,
    title: title || 'Meal',
    ingredients: (food.ingredients || []).map((ing: any) => {
      const { number: iNum, unit: iUnit } = parseQuantity(ing.quantity);
      return {
        name: ing.name,
        quantity: iNum,
        unit: iUnit,
        // Flatten ingredient nutrition too
        calories: ing.nutrition?.calories ?? ing.calories ?? 0,
        protein: ing.nutrition?.protein ?? ing.protein ?? 0,
        carbs: ing.nutrition?.carbs ?? ing.carbs ?? 0,
        fat: ing.nutrition?.fat ?? ing.fat ?? 0,
        fiber: ing.nutrition?.fiber ?? ing.fiber ?? 0,
        sugar: ing.nutrition?.sugar ?? ing.sugar ?? 0,
        sodium: ing.nutrition?.sodium ?? ing.sodium ?? 0,
      };
    }),
  };
}

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
        quantity: parseQuantityString(food.quantity).quantity,
        unit: parseQuantityString(food.quantity).unit,
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
 * Generate a UUID compatible with React Native
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Update an existing meal by deleting old entries and creating new ones
 */
export async function updateExistingMeal(
  mealId: string,
  userId: string,
  analysis: MealAnalysis,
  imageUrl?: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Parse synthetic meal ID to get date and meal type
    const parts = mealId.split('-');
    if (parts.length < 4) {
      return { success: false, error: 'Invalid meal ID format' };
    }

    const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
    const mealType = parts[3] as MealEntry['meal_type'];

    // Start a transaction-like operation
    // 1. First, get the meal_group_id for existing entries
    const { data: existingEntries } = await supabase
      .from('meal_entries')
      .select('meal_group_id')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lte('logged_at', `${date}T23:59:59`)
      .eq('meal_type', mealType)
      .limit(1);

    const existingGroupId = existingEntries?.[0]?.meal_group_id;

    // 2. Delete existing meal entries for this date/mealType
    const { error: deleteError } = await supabase
      .from('meal_entries')
      .delete()
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lte('logged_at', `${date}T23:59:59`)
      .eq('meal_type', mealType);

    if (deleteError) {
      throw new Error(
        `Failed to delete existing entries: ${deleteError.message}`
      );
    }

    // 3. Create new entries with updated data
    // Use existing group ID if available, otherwise generate new one
    const mealGroupId = existingGroupId || generateUUID();
    const loggedAt = new Date(
      `${date}T${new Date().toTimeString().slice(0, 8)}`
    ).toISOString();

    // Get or create daily log for this date
    const { data: dailyLog } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    const dailyLogId = dailyLog?.id;

    // Prepare meal entries following the working pattern
    const mealEntries: Omit<MealEntry, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const food of analysis.foods) {
      // First, check if food item exists or create it
      const { data: foodItem, error: foodError } = await supabase
        .from('food_items')
        .upsert({
          name: food.name,
          serving_size: 1,
          serving_unit: food.quantity || 'serving',
          calories: food.nutrition?.calories || 0,
          protein: food.nutrition?.protein || 0,
          carbs: food.nutrition?.carbs || 0,
          fat: food.nutrition?.fat || 0,
          fiber: food.nutrition?.fiber || 0,
          sugar: food.nutrition?.sugar || 0,
          sodium: food.nutrition?.sodium || 0,
          verified: false,
        })
        .select()
        .single();

      if (foodError) {
        console.error('Error creating food item:', foodError);
        continue;
      }

      // Create meal entry matching working pattern
      mealEntries.push({
        user_id: userId,
        daily_log_id: dailyLogId,
        food_item_id: foodItem.id,
        meal_type: mealType,
        meal_group_id: mealGroupId,
        quantity: parseQuantityString(food.quantity || 'serving').quantity,
        unit: parseQuantityString(food.quantity || 'serving').unit,
        calories: Math.round(food.nutrition?.calories || 0),
        protein: Math.round(food.nutrition?.protein || 0),
        carbs: Math.round(food.nutrition?.carbs || 0),
        fat: Math.round(food.nutrition?.fat || 0),
        image_url: imageUrl,
        notes: notes,
        logged_at: loggedAt,
      });
    }

    // Insert new meal entries
    const { error: insertError } = await supabase
      .from('meal_entries')
      .insert(mealEntries);

    if (insertError) {
      throw new Error(
        `Failed to insert updated entries: ${insertError.message}`
      );
    }

    // 4. Recalculate and update daily totals
    const { data: allMealsToday } = await supabase
      .from('meal_entries')
      .select('calories, protein, carbs, fat')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lte('logged_at', `${date}T23:59:59`);

    if (allMealsToday && allMealsToday.length > 0) {
      const dailyTotals = allMealsToday.reduce(
        (acc, meal) => ({
          total_calories: acc.total_calories + (meal.calories || 0),
          total_protein: acc.total_protein + (meal.protein || 0),
          total_carbs: acc.total_carbs + (meal.carbs || 0),
          total_fat: acc.total_fat + (meal.fat || 0),
        }),
        { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 }
      );

      // Update or create daily log
      const { error: dailyLogError } = await supabase.from('daily_logs').upsert(
        {
          user_id: userId,
          date: date,
          ...dailyTotals,
        },
        {
          onConflict: 'user_id,date',
        }
      );

      if (dailyLogError) {
        console.error('Error updating daily log:', dailyLogError);
      }
    }

    console.log(
      `[updateExistingMeal] Successfully updated meal for ${date} ${mealType}`
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating existing meal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update meal',
    };
  }
}

/**
 * Update an existing meal by meal_group_id (UUID)
 * Used when updating from EditMealScreen where we have the actual group ID
 */
export async function updateMealByGroupId(
  mealGroupId: string,
  userId: string,
  analysis: MealAnalysis,
  imageUrl?: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate UUID format
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(mealGroupId)) {
      return { success: false, error: 'Invalid meal group ID format' };
    }

    // 1. Get existing meal entries to extract metadata
    const { data: existingEntries, error: fetchError } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('meal_group_id', mealGroupId)
      .eq('user_id', userId);

    if (fetchError) {
      throw new Error(`Failed to fetch existing entries: ${fetchError.message}`);
    }

    if (!existingEntries || existingEntries.length === 0) {
      return { success: false, error: 'Meal not found' };
    }

    // Extract metadata from first entry
    const firstEntry = existingEntries[0];
    const mealType = firstEntry.meal_type;
    const loggedAt = firstEntry.logged_at;
    const date = loggedAt.split('T')[0];

    // 2. Delete existing meal entries for this group
    const { error: deleteError } = await supabase
      .from('meal_entries')
      .delete()
      .eq('meal_group_id', mealGroupId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Failed to delete existing entries: ${deleteError.message}`);
    }

    // 3. Create new entries with updated data
    // First need to get or create daily_log
    // date is already declared above from loggedAt.split('T')[0]
    const { data: dailyLog } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    const dailyLogId = dailyLog?.id || firstEntry.daily_log_id;

    // Create entries following the working pattern from logMeal
    const mealEntries: Omit<MealEntry, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const food of analysis.foods) {
      // First, check if food item exists or create it
      const { data: foodItem, error: foodError } = await supabase
        .from('food_items')
        .upsert({
          name: food.name,
          serving_size: 1,
          serving_unit: food.quantity || 'serving',
          calories: food.nutrition?.calories || food.calories || 0,
          protein: food.nutrition?.protein || food.protein || 0,
          carbs: food.nutrition?.carbs || food.carbs || 0,
          fat: food.nutrition?.fat || food.fat || 0,
          fiber: food.nutrition?.fiber || food.fiber || 0,
          sugar: food.nutrition?.sugar || food.sugar || 0,
          sodium: food.nutrition?.sodium || food.sodium || 0,
          verified: false,
        })
        .select()
        .single();

      if (foodError) {
        console.error('Error creating food item:', foodError);
        continue;
      }

      // Create meal entry matching working pattern with correction_history
      mealEntries.push({
        user_id: userId,
        daily_log_id: dailyLogId,
        food_item_id: foodItem.id,
        meal_type: mealType,
        meal_group_id: mealGroupId, // Keep the same group ID
        quantity: parseQuantityString(food.quantity || 'serving').quantity,
        unit: parseQuantityString(food.quantity || 'serving').unit,
        calories: Math.round(food.nutrition?.calories || food.calories || 0),
        protein: Math.round(food.nutrition?.protein || food.protein || 0),
        carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
        fat: Math.round(food.nutrition?.fat || food.fat || 0),
        image_url: imageUrl || firstEntry.image_url, // Keep existing image if not provided
        notes: `${analysis.title || 'Meal'} - ${notes || 'AI-powered analysis'}`,
        logged_at: loggedAt,
        correction_history: [
          {
            role: 'assistant',
            content: JSON.stringify(toFlatFoodForHistory(food, analysis.title)),
          },
        ],
      });
    }

    // Insert new meal entries
    const { error: insertError } = await supabase
      .from('meal_entries')
      .insert(mealEntries);

    if (insertError) {
      throw new Error(`Failed to insert updated entries: ${insertError.message}`);
    }

    // 4. Recalculate and update daily totals
    const { data: allMealsToday } = await supabase
      .from('meal_entries')
      .select('calories, protein, carbs, fat')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lte('logged_at', `${date}T23:59:59`);

    if (allMealsToday && allMealsToday.length > 0) {
      const dailyTotals = allMealsToday.reduce(
        (acc, meal) => ({
          total_calories: acc.total_calories + (meal.calories || 0),
          total_protein: acc.total_protein + (meal.protein || 0),
          total_carbs: acc.total_carbs + (meal.carbs || 0),
          total_fat: acc.total_fat + (meal.fat || 0),
        }),
        { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 }
      );

      // Update or create daily log
      const { error: dailyLogError } = await supabase.from('daily_logs').upsert(
        {
          user_id: userId,
          date: date,
          ...dailyTotals,
        },
        {
          onConflict: 'user_id,date',
        }
      );

      if (dailyLogError) {
        console.error('Error updating daily log:', dailyLogError);
      }
    }

    console.log(
      `[updateMealByGroupId] Successfully updated meal ${mealGroupId}`
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating meal by group ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update meal',
    };
  }
}

/**
 * Append new foods to an existing meal
 * Used when adding more food items from EditMealScreen
 */
export async function appendFoodsToMeal(
  mealGroupId: string,
  userId: string,
  newFoods: MealAnalysis['foods']
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Get existing meal entries to determine meal type and date
    const { data: existingEntries, error: fetchError } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('meal_group_id', mealGroupId)
      .eq('user_id', userId);

    if (fetchError) {
      return { success: false, error: `Failed to fetch existing meal: ${fetchError.message}` };
    }

    if (!existingEntries || existingEntries.length === 0) {
      return { success: false, error: 'Meal not found' };
    }

    // Extract meal metadata from first entry
    const firstEntry = existingEntries[0];
    const mealType = firstEntry.meal_type;
    const loggedAt = firstEntry.logged_at;
    const dailyLogId = firstEntry.daily_log_id;

    // 2. Prepare new meal entries with the same group ID
    const newMealEntries: Omit<MealEntry, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const food of newFoods) {
      // Check if food item exists or create it
      const { data: foodItem, error: foodError } = await supabase
        .from('food_items')
        .upsert({
          name: food.name,
          serving_size: 1,
          serving_unit: food.quantity || 'serving',
          calories: food.nutrition?.calories || food.calories || 0,
          protein: food.nutrition?.protein || food.protein || 0,
          carbs: food.nutrition?.carbs || food.carbs || 0,
          fat: food.nutrition?.fat || food.fat || 0,
          fiber: food.nutrition?.fiber || food.fiber || 0,
          sugar: food.nutrition?.sugar || food.sugar || 0,
          sodium: food.nutrition?.sodium || food.sodium || 0,
          verified: false,
        })
        .select()
        .single();

      if (foodError) {
        console.error('Error creating food item:', foodError);
        continue;
      }

      // Create new meal entry with same group ID
      newMealEntries.push({
        user_id: userId,
        daily_log_id: dailyLogId,
        food_item_id: foodItem.id,
        meal_type: mealType,
        meal_group_id: mealGroupId, // Use same group ID
        quantity: parseQuantityString(food.quantity || 'serving').quantity,
        unit: parseQuantityString(food.quantity || 'serving').unit,
        calories: food.nutrition?.calories || food.calories || 0,
        protein: food.nutrition?.protein || food.protein || 0,
        carbs: food.nutrition?.carbs || food.carbs || 0,
        fat: food.nutrition?.fat || food.fat || 0,
        // Note: fiber, sugar, sodium are not tracked in the meal_entries table
        logged_at: loggedAt, // Keep original logged_at time
      });
    }

    // 3. Insert the new meal entries
    const { error: insertError } = await supabase
      .from('meal_entries')
      .insert(newMealEntries);

    if (insertError) {
      return { success: false, error: `Failed to add foods: ${insertError.message}` };
    }

    // 4. Update daily log totals (calculate total nutrition from new foods)
    const totalNewCalories = newFoods.reduce((sum, food) => 
      sum + (food.nutrition?.calories || food.calories || 0), 0);
    const totalNewProtein = newFoods.reduce((sum, food) => 
      sum + (food.nutrition?.protein || food.protein || 0), 0);
    const totalNewCarbs = newFoods.reduce((sum, food) => 
      sum + (food.nutrition?.carbs || food.carbs || 0), 0);
    const totalNewFat = newFoods.reduce((sum, food) => 
      sum + (food.nutrition?.fat || food.fat || 0), 0);

    // Get current daily log totals
    const { data: dailyLog, error: dailyLogError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('id', dailyLogId)
      .single();

    if (!dailyLogError && dailyLog) {
      await supabase
        .from('daily_logs')
        .update({
          total_calories: dailyLog.total_calories + totalNewCalories,
          total_protein: dailyLog.total_protein + totalNewProtein,
          total_carbs: dailyLog.total_carbs + totalNewCarbs,
          total_fat: dailyLog.total_fat + totalNewFat,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dailyLogId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error appending foods to meal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add foods to meal',
    };
  }
}

/**
 * Interface for grouped meal data (similar to HistoryScreen format)
 */
export interface GroupedMeal {
  id: string;
  mealGroupId?: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{ name: string; calories: number }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  imageUrl?: string;
  hasMealGroupId: boolean;
  logged_at: string; // For time display
  title?: string; // AI-generated meal title
}

/**
 * Get today's meals for a user (grouped by meal_group_id)
 */
export async function getTodaysMeals(userId: string): Promise<GroupedMeal[]> {
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

  if (!data || data.length === 0) {
    return [];
  }

  // Group meal entries by meal_group_id or by meal_type + logged_at if no meal_group_id
  const mealGroups: { [key: string]: any[] } = {};

  data.forEach(entry => {
    let groupKey: string;

    if (entry.meal_group_id) {
      // Use meal_group_id if available
      groupKey = entry.meal_group_id;
    } else {
      // Fallback: group by meal_type and date (for legacy entries without meal_group_id)
      const entryDate = entry.logged_at?.split('T')[0] || today;
      groupKey = `${entryDate}-${entry.meal_type}`;
    }

    if (!mealGroups[groupKey]) {
      mealGroups[groupKey] = [];
    }
    mealGroups[groupKey].push(entry);
  });

  // Transform grouped entries into GroupedMeal format
  const groupedMeals: GroupedMeal[] = Object.entries(mealGroups).map(
    ([_groupKey, entries]) => {
      const firstEntry = entries[0];

      // Calculate totals
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

      // Create foods array
      const foods = entries.map(entry => ({
        name: entry.food_items?.name || entry.food_name || 'Unknown Food',
        calories: entry.calories || 0,
      }));

      // Create synthetic ID (similar to HistoryScreen)
      // Use timestamp to ensure uniqueness when multiple meals of same type exist
      const syntheticId =
        firstEntry.meal_group_id ||
        `${today}-${firstEntry.meal_type}-${firstEntry.logged_at}`;

      // Extract title from notes field if available
      // Notes format: "Title - AI-powered analysis" or just "Title"
      let title: string | undefined;
      if (firstEntry.notes) {
        const titleMatch = firstEntry.notes.match(/^([^-]+)(?:\s*-\s*)?/);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
      }

      return {
        id: syntheticId,
        mealGroupId: firstEntry.meal_group_id,
        date: today,
        mealType: firstEntry.meal_type,
        foods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        imageUrl: entries.find(e => e.image_url)?.image_url,
        hasMealGroupId: !!firstEntry.meal_group_id,
        logged_at: firstEntry.logged_at,
        title,
      };
    }
  );

  // Sort by logged_at (most recent first)
  return groupedMeals.sort((a, b) => {
    const timeA = new Date(a.logged_at).getTime();
    const timeB = new Date(b.logged_at).getTime();
    return timeB - timeA;
  });
}

/**
 * Get today's meals for a user (raw entries - kept for backward compatibility)
 */
export async function getTodaysMealsRaw(userId: string): Promise<MealEntry[]> {
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

      // Group meals by meal_group_id first, then by meal_type for legacy entries
      const mealGroups: { [key: string]: any[] } = {};

      dayMeals.forEach(meal => {
        let groupKey: string;

        if (meal.meal_group_id) {
          // Use meal_group_id if available (new entries)
          groupKey = meal.meal_group_id;
        } else {
          // Fallback to meal_type grouping for legacy entries
          groupKey = `${dailyLog.date}-${meal.meal_type}`;
        }

        if (!mealGroups[groupKey]) {
          mealGroups[groupKey] = [];
        }
        mealGroups[groupKey].push(meal);
      });

      // Create meal entries for each group
      const meals = Object.entries(mealGroups).map(([_groupKey, entries]) => {
        const mealType = entries[0].meal_type;
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

        // Use the meal_group_id from the first entry if available
        const mealGroupId = entries[0]?.meal_group_id;
        // Use timestamp to ensure uniqueness when multiple meals of same type exist
        const syntheticId =
          mealGroupId ||
          `${dailyLog.date}-${mealType}-${entries[0]?.logged_at}`;

        // Extract title from notes field if available
        let title: string | undefined;
        const firstEntry = entries[0];
        if (firstEntry?.notes) {
          const titleMatch = firstEntry.notes.match(/^([^-]+)(?:\s*-\s*)?/);
          if (titleMatch) {
            title = titleMatch[1].trim();
          }
        }

        return {
          id: syntheticId,
          mealGroupId: mealGroupId, // Pass the real UUID separately
          date: dailyLog.date,
          mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          foods,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
          imageUrl: entries.find(e => e.image_url)?.image_url,
          hasMealGroupId: !!mealGroupId, // Flag to indicate if this meal can be refined
          title, // Add the extracted title
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

/**
 * Delete a meal by group ID (deletes all entries in the group)
 */
export async function deleteMealByGroupId(
  mealGroupId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate ID format
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(mealGroupId)) {
      return { success: false, error: 'Invalid meal group ID' };
    }

    // 1) Lookup entries for metadata
    const { data: existingEntries, error: fetchError } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('meal_group_id', mealGroupId)
      .eq('user_id', userId);

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }
    
    if (!existingEntries || existingEntries.length === 0) {
      return { success: false, error: 'Meal not found' };
    }

    const date = (existingEntries[0].logged_at || '').split('T')[0];

    // 2) Delete the group entries
    const { error: deleteError } = await supabase
      .from('meal_entries')
      .delete()
      .eq('meal_group_id', mealGroupId)
      .eq('user_id', userId);
      
    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // 3) Recalculate daily totals for that date
    const { data: remainingMeals, error: remainingError } = await supabase
      .from('meal_entries')
      .select('calories, protein, carbs, fat')
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lte('logged_at', `${date}T23:59:59`);

    if (remainingError) {
      // Not fatal; just log
      console.warn('Failed to recalc daily totals after delete:', remainingError.message);
    } else {
      const totals = (remainingMeals || []).reduce(
        (acc, m) => ({
          total_calories: acc.total_calories + (m.calories || 0),
          total_protein: acc.total_protein + (m.protein || 0),
          total_carbs: acc.total_carbs + (m.carbs || 0),
          total_fat: acc.total_fat + (m.fat || 0),
        }),
        { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 }
      );

      await supabase.from('daily_logs').upsert(
        { user_id: userId, date, ...totals },
        { onConflict: 'user_id,date' }
      );
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete meal',
    };
  }
}

/**
 * Get meal details by date and meal type (for grouped meals)
 * This is used when navigating from History screen with synthetic meal IDs
 */
export async function getMealDetailsByDateAndType(
  userId: string,
  date: string,
  mealType: string
): Promise<{
  success: boolean;
  data?: MealAnalysis;
  mealGroupId?: string;
  error?: string;
}> {
  try {
    // Query all meal entries for this date and meal type
    const { data: mealEntries, error } = await supabase
      .from('meal_entries')
      .select(
        `
        *,
        food_items (
          id,
          name,
          brand,
          serving_size,
          serving_unit,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium
        )
      `
      )
      .eq('user_id', userId)
      .gte('logged_at', `${date}T00:00:00`)
      .lte('logged_at', `${date}T23:59:59`)
      .eq('meal_type', mealType)
      .order('logged_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch meal entries: ${error.message}`);
    }

    if (!mealEntries || mealEntries.length === 0) {
      return {
        success: false,
        error: 'No meal found for this date and type',
      };
    }

    // Transform meal entries into MealAnalysis format
    const foods: FoodItem[] = mealEntries.map(entry => ({
      name: entry.food_items?.name || entry.food_name || 'Unknown Food',
      quantity: entry.unit || `${entry.quantity || 1} serving`,
      nutrition: {
        calories: Number(entry.calories) || 0,
        protein: Number(entry.protein) || 0,
        carbs: Number(entry.carbs) || 0,
        fat: Number(entry.fat) || 0,
        fiber: entry.food_items?.fiber
          ? Number(entry.food_items.fiber)
          : undefined,
        sugar: entry.food_items?.sugar
          ? Number(entry.food_items.sugar)
          : undefined,
        sodium: entry.food_items?.sodium
          ? Number(entry.food_items.sodium)
          : undefined,
      },
      confidence: 0.95, // High confidence since this is from database
    }));

    // Calculate total nutrition
    const totalNutrition = foods.reduce(
      (total, food) => ({
        calories: total.calories + (food.nutrition.calories || 0),
        protein: total.protein + (food.nutrition.protein || 0),
        carbs: total.carbs + (food.nutrition.carbs || 0),
        fat: total.fat + (food.nutrition.fat || 0),
        fiber: (total.fiber || 0) + (food.nutrition.fiber || 0),
        sugar: (total.sugar || 0) + (food.nutrition.sugar || 0),
        sodium: (total.sodium || 0) + (food.nutrition.sodium || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );

    const mealAnalysis: MealAnalysis = {
      foods,
      totalNutrition,
      confidence: 0.95, // High confidence since this is from database
    };

    // Get the meal_group_id from the first entry
    const mealGroupId = mealEntries[0]?.meal_group_id;

    return {
      success: true,
      data: mealAnalysis,
      mealGroupId,
    };
  } catch (error) {
    console.error('Error fetching meal details:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch meal details',
    };
  }
}

/**
 * Fetches meal details by meal_group_id (UUID)
 * This is used when viewing a specific meal from history or home screen
 */
export async function getMealDetailsByGroupId(
  groupId: string,
  userId: string
): Promise<{
  success: boolean;
  data?: MealAnalysis;
  imageUrl?: string;
  error?: string;
}> {
  try {
    // Validate UUID format
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(groupId)) {
      return {
        success: false,
        error: 'Invalid meal ID format',
      };
    }

    // Query all meal entries for this meal group
    const { data: mealEntries, error } = await supabase
      .from('meal_entries')
      .select(
        `
        *,
        food_items (
          id,
          name,
          brand,
          serving_size,
          serving_unit,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          sugar,
          sodium
        )
      `
      )
      .eq('meal_group_id', groupId)
      .eq('user_id', userId) // Security: ensure user owns this meal
      .order('logged_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch meal entries: ${error.message}`);
    }

    if (!mealEntries || mealEntries.length === 0) {
      return {
        success: false,
        error: 'Meal not found',
      };
    }

    // Transform meal entries into MealAnalysis format
    // Extract ingredients from correction_history if available
    const foods: FoodItem[] = mealEntries.map(entry => {
      // Try to extract ingredient data from correction_history
      let ingredients: FoodItem[] = [];
      if (entry.correction_history && Array.isArray(entry.correction_history) && entry.correction_history.length > 0) {
        try {
          // Read from LAST assistant message, not first
          const history = [...entry.correction_history].reverse();
          const lastAssistant = history.find(h => h.role === 'assistant' && h.content);
          
          if (lastAssistant && lastAssistant.content) {
            const parsedContent = JSON.parse(lastAssistant.content);
            if (parsedContent.ingredients && Array.isArray(parsedContent.ingredients)) {
              ingredients = parsedContent.ingredients.map((ing: any) => ({
                name: ing.name,
                quantity: `${ing.quantity || 1} ${ing.unit || 'serving'}`,
                nutrition: {
                  // Support both flat (new) and nested (old) formats
                  calories: ing.calories ?? ing.nutrition?.calories ?? 0,
                  protein: ing.protein ?? ing.nutrition?.protein ?? 0,
                  carbs: ing.carbs ?? ing.nutrition?.carbs ?? 0,
                  fat: ing.fat ?? ing.nutrition?.fat ?? 0,
                  fiber: ing.fiber ?? ing.nutrition?.fiber,
                  sugar: ing.sugar ?? ing.nutrition?.sugar,
                  sodium: ing.sodium ?? ing.nutrition?.sodium,
                },
              }));
            }
          }
        } catch (error) {
          console.log('[getMealDetailsByGroupId] Could not parse correction_history:', error);
        }
      }
      
      return {
        name: entry.food_items?.name || entry.food_name || 'Unknown Food',
        quantity: `${entry.quantity || 1} ${entry.unit || 'serving'}`,
        nutrition: {
          calories: Number(entry.calories) || 0,
          protein: Number(entry.protein) || 0,
          carbs: Number(entry.carbs) || 0,
          fat: Number(entry.fat) || 0,
          fiber: entry.food_items?.fiber
            ? Number(entry.food_items.fiber)
            : undefined,
          sugar: entry.food_items?.sugar
            ? Number(entry.food_items.sugar)
            : undefined,
          sodium: entry.food_items?.sodium
            ? Number(entry.food_items.sodium)
            : undefined,
        },
        confidence: 0.95, // High confidence since this is from database
        ingredients, // Add ingredients if found
      };
    });

    // Calculate total nutrition
    const totalNutrition = foods.reduce(
      (total, food) => ({
        calories: total.calories + (food.nutrition.calories || 0),
        protein: total.protein + (food.nutrition.protein || 0),
        carbs: total.carbs + (food.nutrition.carbs || 0),
        fat: total.fat + (food.nutrition.fat || 0),
        fiber: (total.fiber || 0) + (food.nutrition.fiber || 0),
        sugar: (total.sugar || 0) + (food.nutrition.sugar || 0),
        sodium: (total.sodium || 0) + (food.nutrition.sodium || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );

    // Get the image URL if available
    const imageUrl = mealEntries[0]?.image_url || undefined;
    
    // Extract title from correction_history or notes
    let title: string | undefined;
    try {
      // First try to get title from the last correction_history entry
      const firstEntry = mealEntries[0];
      if (firstEntry?.correction_history && Array.isArray(firstEntry.correction_history) && firstEntry.correction_history.length > 0) {
        const history = [...firstEntry.correction_history].reverse();
        const lastAssistant = history.find(h => h.role === 'assistant' && h.content);
        
        if (lastAssistant && lastAssistant.content) {
          const parsed = JSON.parse(lastAssistant.content);
          title = parsed.title;
        }
      }
      
      // Fallback: Try to extract title from notes if not found in correction_history
      if (!title && firstEntry?.notes) {
        const titleMatch = firstEntry.notes.match(/^([^-]+)(?:\s*-\s*)?/);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
      }
    } catch (error) {
      console.error('[getMealDetailsByGroupId] Could not parse title:', error);
    }

    const mealAnalysis: MealAnalysis = {
      foods,
      totalNutrition,
      confidence: 0.95, // High confidence since this is from database
      title, // Add title to the analysis
    };

    return {
      success: true,
      data: mealAnalysis,
      imageUrl,
    };
  } catch (error) {
    console.error('Error fetching meal details by group ID:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch meal details',
    };
  }
}

/**
 * Update a meal entry
 */
export async function updateMealEntry(
  entryId: string,
  updates: {
    quantity?: number;
    unit?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    notes?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('meal_entries')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (error) {
      console.error('Error updating meal entry:', error);
      return false;
    }

    // TODO: Update daily_logs totals if macros changed

    return true;
  } catch (error) {
    console.error('Error updating meal entry:', error);
    return false;
  }
}

