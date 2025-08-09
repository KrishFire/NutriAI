import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Request interface for meal logging
interface LogMealRequest {
  description: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // ISO date string
}

// Individual food item or ingredient
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
  ingredients?: FoodItem[]; // For hierarchical structure
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
 * Returns structured nutrition data with hierarchical parent-child relationships
 */
async function analyzeMealWithAI(description: string): Promise<MealAnalysis> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `You are a nutrition analysis assistant. Analyze the following meal description and return detailed nutrition information with hierarchical structure.

CRITICAL GUIDELINES:
- For composite foods (sandwiches, salads, bowls, wraps, burgers, etc.), create a parent item with total nutrition AND list ingredients separately
- Parent items should have their total nutrition values and an "ingredients" array
- Individual ingredients within a parent should have their own nutrition values
- For simple foods (apple, banana, milk), just list them without ingredients
- Use natural, user-friendly units (1 burger, 1 slice, 2 tablespoons, 1 cup, etc.)
- For branded foods (Big Mac, Lay's chips), use exact nutrition data
- Be conservative with portion sizes if unclear
- Include all nutrients: calories, protein, carbs, fat, fiber, sugar, sodium

HIERARCHICAL STRUCTURE:
- Composite foods have "ingredients" array with nested items
- Simple foods have empty or no "ingredients" array
- Each item at any level has complete nutrition information

INPUT: "${description}"

Return a JSON object with this exact structure:
{
  "foods": [
    {
      "name": "Food name",
      "quantity": 1,
      "unit": "unit",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "sugar": 0,
      "sodium": 0,
      "ingredients": [
        {
          "name": "Ingredient name",
          "quantity": 1,
          "unit": "unit",
          "calories": 0,
          "protein": 0,
          "carbs": 0,
          "fat": 0,
          "fiber": 0,
          "sugar": 0,
          "sodium": 0
        }
      ]
    }
  ],
  "confidence": 0.9,
  "notes": "Any relevant notes"
}

DETAILED EXAMPLES:

"turkey sandwich" →
{
  "foods": [
    {
      "name": "Turkey Sandwich",
      "quantity": 1,
      "unit": "sandwich",
      "calories": 380,
      "protein": 25,
      "carbs": 45,
      "fat": 12,
      "fiber": 4,
      "sugar": 5,
      "sodium": 890,
      "ingredients": [
        {"name": "Whole Wheat Bread", "quantity": 2, "unit": "slices", "calories": 140, "protein": 6, "carbs": 24, "fat": 2, "fiber": 3, "sugar": 2, "sodium": 280},
        {"name": "Turkey Breast", "quantity": 3, "unit": "oz", "calories": 90, "protein": 19, "carbs": 0, "fat": 1, "fiber": 0, "sugar": 0, "sodium": 450},
        {"name": "Lettuce", "quantity": 0.5, "unit": "cup", "calories": 4, "protein": 0, "carbs": 1, "fat": 0, "fiber": 0.5, "sugar": 0.5, "sodium": 5},
        {"name": "Tomato", "quantity": 2, "unit": "slices", "calories": 5, "protein": 0, "carbs": 1, "fat": 0, "fiber": 0.3, "sugar": 1, "sodium": 2},
        {"name": "Mayonnaise", "quantity": 1, "unit": "tablespoon", "calories": 90, "protein": 0, "carbs": 0, "fat": 10, "fiber": 0, "sugar": 0, "sodium": 88},
        {"name": "Mustard", "quantity": 1, "unit": "teaspoon", "calories": 3, "protein": 0, "carbs": 0.3, "fat": 0.2, "fiber": 0.2, "sugar": 0.1, "sodium": 65}
      ]
    }
  ],
  "confidence": 0.90
}

"grilled chicken caesar salad" →
{
  "foods": [
    {
      "name": "Grilled Chicken Caesar Salad",
      "quantity": 1,
      "unit": "salad",
      "calories": 434,
      "protein": 41,
      "carbs": 10,
      "fat": 25,
      "fiber": 2,
      "sugar": 3,
      "sodium": 664,
      "ingredients": [
        {"name": "Grilled Chicken Breast", "quantity": 4, "unit": "oz", "calories": 186, "protein": 35, "carbs": 0, "fat": 4, "fiber": 0, "sugar": 0, "sodium": 74},
        {"name": "Romaine Lettuce", "quantity": 2, "unit": "cup", "calories": 16, "protein": 1, "carbs": 3, "fat": 0, "fiber": 2, "sugar": 2, "sodium": 8},
        {"name": "Caesar Dressing", "quantity": 2, "unit": "tablespoon", "calories": 158, "protein": 1, "carbs": 1, "fat": 17, "fiber": 0, "sugar": 1, "sodium": 323},
        {"name": "Parmesan Cheese", "quantity": 2, "unit": "tablespoon", "calories": 43, "protein": 4, "carbs": 0, "fat": 3, "fiber": 0, "sugar": 0, "sodium": 192},
        {"name": "Croutons", "quantity": 0.25, "unit": "cup", "calories": 31, "protein": 1, "carbs": 6, "fat": 1, "fiber": 0, "sugar": 0, "sodium": 67}
      ]
    }
  ],
  "confidence": 0.85
}

"apple and banana" →
{
  "foods": [
    {"name": "Apple", "quantity": 1, "unit": "medium", "calories": 95, "protein": 0, "carbs": 25, "fat": 0, "fiber": 4, "sugar": 19, "sodium": 2, "ingredients": []},
    {"name": "Banana", "quantity": 1, "unit": "medium", "calories": 105, "protein": 1, "carbs": 27, "fat": 0, "fiber": 3, "sugar": 14, "sodium": 1, "ingredients": []}
  ],
  "confidence": 0.95
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition analysis assistant with extensive knowledge of food nutrition data. Always return valid JSON with hierarchical structure for composite foods. Parent items should contain total nutrition AND an ingredients array with individual nutrition values for each component.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
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
    
    // Calculate totals from top-level foods only (not ingredients)
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
 * Now handles hierarchical structure by flattening for database storage
 */
async function saveMealToDatabase(
  supabase: any,
  analysis: MealAnalysis,
  request: LogMealRequest
): Promise<string> {
  try {
    // Generate unique meal group ID for this analysis
    const mealGroupId = crypto.randomUUID();
    console.log(`[log-meal-ai] Generated meal group ID: ${mealGroupId} for ${analysis.foods.length} foods`);

    // Get or create daily_logs record
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

    // Flatten hierarchical structure for database storage
    // Store parent items with their totals, not individual ingredients
    const mealEntryIds: string[] = [];
    
    for (const food of analysis.foods) {
      // Only save the parent item with its total nutrition
      // The ingredients are for UI display only
      
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
            verified: false,
          })
          .select()
          .single();

        if (foodError) {
          throw new Error(`Failed to create food item: ${foodError.message}`);
        }
        foodItemId = newFoodItem.id;
      }

      // Create meal_entry with the full hierarchical data in correction_history
      const { data: mealEntry, error: entryError } = await supabase
        .from('meal_entries')
        .insert({
          user_id: request.userId,
          daily_log_id: dailyLogId,
          food_item_id: foodItemId,
          meal_group_id: mealGroupId,
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
              content: JSON.stringify({ ...food, ingredients: food.ingredients || [] })
            }
          ],
        })
        .select()
        .single();

      if (entryError) {
        throw new Error(`Failed to create meal entry: ${entryError.message}`);
      }
      
      console.log(`[log-meal-ai] Created meal entry with ID: ${mealEntry.id} for food: ${food.name}`);
      mealEntryIds.push(mealEntry.id);
    }

    // Update daily_logs totals
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
    return mealGroupId;

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
      mealAnalysis: {
        foods: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        confidence: 0,
      },
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