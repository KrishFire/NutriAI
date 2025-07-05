import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Request interface for meal logging
interface LogMealRequest {
  description: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // ISO date string
}

// Individual food item extracted from meal description
interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // milligrams
}

// Response from AI meal analysis
interface MealAnalysis {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number; // 0-1, how confident the AI is in the estimates
  notes?: string;
}

// Response interface
interface LogMealResponse {
  success: boolean;
  mealAnalysis: MealAnalysis;
  mealLogId?: string;
  error?: string;
}

/**
 * Analyze meal description using OpenAI GPT-4o-mini
 * Returns structured nutrition data with natural units
 */
async function analyzeMealWithAI(description: string): Promise<MealAnalysis> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `You are a nutrition analysis assistant. Analyze the following meal description and return detailed nutrition information.

CRITICAL GUIDELINES:
- ALWAYS break down complex meals into individual food components
- Use natural, user-friendly units (1 burger, 1 slice, 2 tablespoons, 1 cup, etc.)
- For branded foods (Big Mac, Lay's chips), use exact nutrition data
- For generic foods, use standard USDA-style portions
- When foods are combined (like "bagel with cream cheese"), separate them into distinct items
- Be conservative with portion sizes if unclear
- Include all nutrients: calories, protein, carbs, fat, fiber, sugar, sodium

FOOD BREAKDOWN EXAMPLES:
- "bagel with cream cheese" → separate "Bagel" + "Cream Cheese"
- "sandwich with turkey and cheese" → separate "Bread", "Turkey", "Cheese"
- "pasta with marinara sauce" → separate "Pasta" + "Marinara Sauce"
- "salad with dressing" → separate "Salad" + "Dressing"

INPUT: "${description}"

Return a JSON object with this exact structure:
{
  "foods": [
    {
      "name": "Food name",
      "quantity": 1,
      "unit": "natural unit (slice, tablespoon, cup, piece, etc.)",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "sugar": 0,
      "sodium": 0
    }
  ],
  "confidence": 0.9,
  "notes": "Any relevant notes about assumptions made"
}

DETAILED EXAMPLES:

"1 Big Mac and large fries" →
{
  "foods": [
    {"name": "Big Mac", "quantity": 1, "unit": "burger", "calories": 563, "protein": 25, "carbs": 45, "fat": 33, "fiber": 3, "sugar": 5, "sodium": 1040},
    {"name": "McDonald's Large Fries", "quantity": 1, "unit": "serving", "calories": 365, "protein": 4, "carbs": 48, "fat": 17, "fiber": 4, "sugar": 0, "sodium": 400}
  ],
  "confidence": 0.95
}

"bagel with strawberry cream cheese" →
{
  "foods": [
    {"name": "Plain Bagel", "quantity": 1, "unit": "bagel", "calories": 289, "protein": 11, "carbs": 56, "fat": 2, "fiber": 2, "sugar": 5, "sodium": 561},
    {"name": "Strawberry Cream Cheese", "quantity": 2, "unit": "tablespoon", "calories": 100, "protein": 2, "carbs": 3, "fat": 9, "fiber": 0, "sugar": 3, "sodium": 85}
  ],
  "confidence": 0.90,
  "notes": "Assumed 2 tablespoons of cream cheese on 1 plain bagel"
}

"grilled chicken caesar salad" →
{
  "foods": [
    {"name": "Grilled Chicken Breast", "quantity": 4, "unit": "oz", "calories": 186, "protein": 35, "carbs": 0, "fat": 4, "fiber": 0, "sugar": 0, "sodium": 74},
    {"name": "Romaine Lettuce", "quantity": 2, "unit": "cup", "calories": 16, "protein": 1, "carbs": 3, "fat": 0, "fiber": 2, "sugar": 2, "sodium": 8},
    {"name": "Caesar Dressing", "quantity": 2, "unit": "tablespoon", "calories": 158, "protein": 1, "carbs": 1, "fat": 17, "fiber": 0, "sugar": 1, "sodium": 323},
    {"name": "Parmesan Cheese", "quantity": 2, "unit": "tablespoon", "calories": 43, "protein": 4, "carbs": 0, "fat": 3, "fiber": 0, "sugar": 0, "sodium": 192},
    {"name": "Croutons", "quantity": 0.25, "unit": "cup", "calories": 31, "protein": 1, "carbs": 6, "fat": 1, "fiber": 0, "sugar": 0, "sodium": 67}
  ],
  "confidence": 0.85,
  "notes": "Standard caesar salad portions with 4oz grilled chicken"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Temporarily revert to test if GPT-4o is causing issues
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition analysis assistant with extensive knowledge of food nutrition data from USDA, restaurant chains, and branded products. Always return valid JSON with the exact structure requested. Use your comprehensive training data to provide accurate nutrition information for both generic foods and specific branded items. When uncertain about exact values, use conservative estimates based on similar foods in your knowledge base.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Low temperature for consistent, factual responses
        max_tokens: 2000, // Increased for gpt-4o's more detailed responses
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Parse the JSON response
    const analysis = JSON.parse(content);
    
    // Calculate totals
    const totalCalories = analysis.foods.reduce((sum: number, food: FoodItem) => sum + food.calories, 0);
    const totalProtein = analysis.foods.reduce((sum: number, food: FoodItem) => sum + food.protein, 0);
    const totalCarbs = analysis.foods.reduce((sum: number, food: FoodItem) => sum + food.carbs, 0);
    const totalFat = analysis.foods.reduce((sum: number, food: FoodItem) => sum + food.fat, 0);

    return {
      ...analysis,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };

  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error(`Failed to analyze meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Save meal analysis to database using correct schema
 */
async function saveMealToDatabase(
  supabase: any,
  analysis: MealAnalysis,
  request: LogMealRequest
): Promise<string> {
  try {
    // 1. Get or create daily_logs record for user + date
    const { data: existingDailyLog } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', request.userId)
      .eq('date', request.date)
      .single();

    let dailyLogId: string;
    
    if (existingDailyLog) {
      dailyLogId = existingDailyLog.id;
    } else {
      const { data: newDailyLog, error: dailyLogError } = await supabase
        .from('daily_logs')
        .insert({
          user_id: request.userId,
          date: request.date,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
        })
        .select()
        .single();

      if (dailyLogError) {
        throw new Error(`Failed to create daily log: ${dailyLogError.message}`);
      }
      dailyLogId = newDailyLog.id;
    }

    // 2. Create food_items and meal_entries for each food in the analysis
    const mealEntryIds: string[] = [];
    
    for (const food of analysis.foods) {
      // Create or find food_item
      const { data: existingFood } = await supabase
        .from('food_items')
        .select('*')
        .eq('name', food.name)
        .eq('serving_size', food.quantity)
        .eq('serving_unit', food.unit)
        .single();

      let foodItemId: string;
      
      if (existingFood) {
        foodItemId = existingFood.id;
      } else {
        const { data: newFoodItem, error: foodError } = await supabase
          .from('food_items')
          .insert({
            name: food.name,
            serving_size: food.quantity,
            serving_unit: food.unit,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber || 0,
            sugar: food.sugar || 0,
            sodium: food.sodium || 0,
            verified: false, // AI-generated food items start as unverified
          })
          .select()
          .single();

        if (foodError) {
          throw new Error(`Failed to create food item: ${foodError.message}`);
        }
        foodItemId = newFoodItem.id;
      }

      // Create meal_entry with initial correction_history seeded
      const { data: mealEntry, error: entryError } = await supabase
        .from('meal_entries')
        .insert({
          user_id: request.userId,
          daily_log_id: dailyLogId,
          food_item_id: foodItemId,
          meal_type: request.mealType,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          notes: analysis.notes,
          correction_history: [
            {
              role: 'assistant',
              content: JSON.stringify(analysis)
            }
          ],
        })
        .select()
        .single();

      if (entryError) {
        throw new Error(`Failed to create meal entry: ${entryError.message}`);
      }
      
      mealEntryIds.push(mealEntry.id);
    }

    // 3. Update daily_logs totals (this could also be done via database triggers)
    const { error: updateError } = await supabase
      .from('daily_logs')
      .update({
        total_calories: (existingDailyLog?.total_calories || 0) + analysis.totalCalories,
        total_protein: (existingDailyLog?.total_protein || 0) + analysis.totalProtein,
        total_carbs: (existingDailyLog?.total_carbs || 0) + analysis.totalCarbs,
        total_fat: (existingDailyLog?.total_fat || 0) + analysis.totalFat,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dailyLogId);

    if (updateError) {
      throw new Error(`Failed to update daily totals: ${updateError.message}`);
    }

    console.log(`[log-meal-ai] Created ${mealEntryIds.length} meal entries for daily log ${dailyLogId}`);
    
    // Return the first meal entry ID for corrections (represents the primary meal entry)
    return mealEntryIds[0] || dailyLogId;

  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}

/**
 * Main Edge Function handler
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { description, userId, mealType, date }: LogMealRequest = await req.json();

    // Validate required fields
    if (!description?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Meal description is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[log-meal-ai] Processing meal: "${description}" for user ${userId}`);

    // Analyze meal with AI
    const analysis = await analyzeMealWithAI(description);
    console.log(`[log-meal-ai] AI analysis complete. ${analysis.foods.length} foods found, ${analysis.totalCalories} total calories`);

    let mealLogId: string | undefined;

    // Only save to database if not in preview mode
    if (userId !== 'preview') {
      mealLogId = await saveMealToDatabase(supabase, analysis, {
        description,
        userId,
        mealType: mealType || 'snack',
        date: date || new Date().toISOString().split('T')[0],
      });

      console.log(`[log-meal-ai] Meal saved successfully with ID: ${mealLogId}`);
    } else {
      console.log(`[log-meal-ai] Preview mode - not saving to database`);
    }

    // Return success response
    const response: LogMealResponse = {
      success: true,
      mealAnalysis: analysis,
      mealLogId,
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[log-meal-ai] Error:', error);
    
    const errorResponse: LogMealResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});