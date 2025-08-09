import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { z } from 'npm:zod@3.23.8';

// Request interface for meal logging
interface LogMealRequest {
  description: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // ISO date string
  existingAnalysis?: MealAnalysisWithTotals; // Optional existing analysis to skip re-analysis
}

/**
 * Parse numeric quantity from concatenated strings like "1 serving", "2.5 cups", etc.
 */
function parseNumericQuantity(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Extract first number from string like "1 serving" -> 1
    const match = value.match(/^([\d\.]+)/);
    if (match) {
      const num = parseFloat(match[1]);
      return isNaN(num) ? 1 : num;
    }
  }
  
  // Fallback to 1 if unable to parse
  return 1;
}

/**
 * Extract unit from concatenated strings like "1 serving" -> "serving", "2.5 cups" -> "cups"
 */
function extractUnit(value: any): string {
  if (typeof value === 'string') {
    // Extract unit part from string like "1 serving" -> "serving"
    const match = value.match(/^[\d\.]+\s*(.+)$/);
    if (match && match[1]) {
      const unit = match[1].trim();
      return unit || 'serving';
    }
    
    // If string doesn't match pattern, check if it's just a unit
    if (!/^[\d\.]+$/.test(value)) {
      return value;
    }
  }
  
  return 'serving';
}

/**
 * Preprocess existing analysis data to handle client-side transformed data
 */
function preprocessExistingAnalysis(analysis: any): any {
  if (!analysis || !analysis.foods) {
    return analysis;
  }

  // Deep clone to avoid mutating original
  const processed = JSON.parse(JSON.stringify(analysis));
  
  // Handle data structure mismatch - client sends totalNutrition, we need totalCalories etc
  if (processed.totalNutrition && !processed.totalCalories) {
    processed.totalCalories = processed.totalNutrition.calories || 0;
    processed.totalProtein = processed.totalNutrition.protein || 0;
    processed.totalCarbs = processed.totalNutrition.carbs || 0;
    processed.totalFat = processed.totalNutrition.fat || 0;
  }

  // Process each food item
  processed.foods = processed.foods.map((food: any) => {
    // Create a mutable copy of the food item
    let processedFood = { ...food };
    
    // Handle concatenated quantity strings like "1 serving"
    if (typeof processedFood.quantity === 'string') {
      const quantity = parseNumericQuantity(processedFood.quantity);
      const unit = extractUnit(processedFood.quantity);
      
      processedFood.quantity = quantity;
      processedFood.unit = unit || processedFood.unit || 'serving';
    }
    
    // CRITICAL FIX: Handle nested nutrition structure from client
    // Client sends: { nutrition: { calories, protein, ... } }
    // Server expects: { calories, protein, ... }
    if (processedFood.nutrition && typeof processedFood.nutrition === 'object') {
      // Flatten nutrition object to top level
      processedFood.calories = processedFood.nutrition.calories || 0;
      processedFood.protein = processedFood.nutrition.protein || 0;
      processedFood.carbs = processedFood.nutrition.carbs || 0;
      processedFood.fat = processedFood.nutrition.fat || 0;
      processedFood.fiber = processedFood.nutrition.fiber || 0;
      processedFood.sugar = processedFood.nutrition.sugar || 0;
      processedFood.sodium = processedFood.nutrition.sodium || 0;
      // Keep the nutrition object for backward compatibility
    }

    // Handle ingredients if present
    if (processedFood.ingredients && Array.isArray(processedFood.ingredients)) {
      processedFood.ingredients = processedFood.ingredients.map((ingredient: any) => {
        let processedIngredient = { ...ingredient };
        
        // Parse quantity if it's a string
        if (typeof processedIngredient.quantity === 'string') {
          const quantity = parseNumericQuantity(processedIngredient.quantity);
          const unit = extractUnit(processedIngredient.quantity);
          
          processedIngredient.quantity = quantity;
          processedIngredient.unit = unit || processedIngredient.unit || 'serving';
        }
        
        // Flatten nested nutrition for ingredients too
        if (processedIngredient.nutrition && typeof processedIngredient.nutrition === 'object') {
          processedIngredient.calories = processedIngredient.nutrition.calories || 0;
          processedIngredient.protein = processedIngredient.nutrition.protein || 0;
          processedIngredient.carbs = processedIngredient.nutrition.carbs || 0;
          processedIngredient.fat = processedIngredient.nutrition.fat || 0;
          processedIngredient.fiber = processedIngredient.nutrition.fiber || 0;
          processedIngredient.sugar = processedIngredient.nutrition.sugar || 0;
          processedIngredient.sodium = processedIngredient.nutrition.sodium || 0;
        }
        
        return processedIngredient;
      });
    }

    return processedFood;
  });

  return processed;
}

// Zod schema for validation with coercion and parsing for resilience
const NutritionSchema = z.object({
  calories: z.number().nonnegative().default(0),
  protein: z.number().nonnegative().default(0),
  carbs: z.number().nonnegative().default(0),
  fat: z.number().nonnegative().default(0),
  fiber: z.number().nonnegative().optional().default(0),
  sugar: z.number().nonnegative().optional().default(0),
  sodium: z.number().nonnegative().optional().default(0),
});

// Schema for validating existingAnalysis from client
const ExistingAnalysisSchema = z.object({
  foods: z.array(z.object({
    name: z.string().min(1),
    quantity: z.union([z.string(), z.number()]), // Can be string like "1 serving" or number
    unit: z.string().optional(),
    // Support both nested and flat nutrition structure
    nutrition: NutritionSchema.optional(),
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
    ingredients: z.array(z.any()).optional(),
  })),
  // Support both nested and flat total structure
  totalNutrition: NutritionSchema.optional(),
  totalCalories: z.number().optional(),
  totalProtein: z.number().optional(),
  totalCarbs: z.number().optional(),
  totalFat: z.number().optional(),
  confidence: z.number().optional(),
  notes: z.string().optional(),
  title: z.string().optional(),
});

const FoodItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.any().transform(val => {
    const parsed = parseNumericQuantity(val);
    if (parsed <= 0) throw new z.ZodError([{
      code: 'custom',
      message: 'Quantity must be positive',
      path: ['quantity']
    }]);
    return parsed;
  }),
  unit: z.any().transform(val => {
    // Handle the case where quantity might contain the unit (e.g., "1 serving")
    if (typeof val === 'string' && (val === '' || val === 'undefined' || val === 'null')) {
      return 'serving';
    }
    
    // Extract unit if it's in the quantity field
    const unit = extractUnit(val);
    const cleaned = unit.replace(/\bundefined\b/gi, '').trim();
    return cleaned || 'serving';
  }),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0).optional(),
  sugar: z.coerce.number().min(0).optional(),
  sodium: z.coerce.number().min(0).optional(),
  ingredients: z.array(z.lazy(() => FoodItemSchema)).optional()
});

const MealAnalysisSchema = z.object({
  foods: z.array(FoodItemSchema),
  confidence: z.coerce.number().min(0).max(1).default(0.9),
  notes: z.string().optional().default('AI-powered analysis'),
  title: z.string().min(1, "Title is required")
});

// Type inference from Zod schema
type FoodItem = z.infer<typeof FoodItemSchema>;
type MealAnalysis = z.infer<typeof MealAnalysisSchema>;

// Extended MealAnalysis type with calculated totals
interface MealAnalysisWithTotals extends MealAnalysis {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Response interface
interface LogMealResponse {
  success: boolean;
  mealAnalysis: MealAnalysisWithTotals;
  mealLogId?: string;
  error?: string;
}

/**
 * Analyze meal description using OpenAI GPT-4o-mini with standard completions
 * Returns structured nutrition data with hierarchical parent-child relationships
 */
async function analyzeMealWithAI(description: string, mealType?: string, date?: string): Promise<MealAnalysisWithTotals> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are a nutrition analysis assistant. Return ONLY valid JSON.

IMPORTANT GUIDELINES:
1. Common dish names containing "and" are single items (e.g., "mac and cheese", "fish and chips")
2. Distinct foods separated by "and" or "with" are multiple items (e.g., "burger and fries")
3. For unknown units, use "serving" - NEVER use the word "undefined"
4. NEVER include the text "undefined" in any field value
5. Generate a simple meal title based on the actual food names

TITLE GENERATION RULES - ABSOLUTELY CRITICAL:
The title MUST be a concise combination of the ACTUAL FOOD NAMES. 

✅ CORRECT TITLE EXAMPLES:
- "yogurt and berries" → "Yogurt & Berries"
- "burger and fries" → "Burger & Fries" 
- "chicken salad" → "Chicken Salad"
- "turkey sandwich with chips" → "Turkey Sandwich & Chips"
- "pizza slice" → "Pizza Slice"
- "apple" → "Apple"

❌ FORBIDDEN TITLE PATTERNS - NEVER DO THESE:
- "Two separate items" ❌
- "Three different items" ❌  
- "Multiple items" ❌
- "Various foods" ❌
- "Two food items" ❌
- "Several different things" ❌
- "Different foods" ❌
- "Separate items" ❌

RULES:
- Extract the main food names from the description
- Keep titles concise: 2-4 words maximum
- Capitalize each word properly
- For multiple items, use "&" to connect them
- Focus on the ACTUAL FOOD NAMES, not counts or descriptors
- NEVER use words like "items", "different", "separate", "various", "multiple", "several", "things"
- If you catch yourself about to write any of those forbidden words, STOP and use the actual food names instead

EXAMPLES:

Input: "yogurt and berries"
Output:
{
  "foods": [
    {
      "name": "Greek Yogurt",
      "quantity": 1,
      "unit": "serving",
      "calories": 100,
      "protein": 15,
      "carbs": 8,
      "fat": 0,
      "fiber": 0,
      "ingredients": []
    },
    {
      "name": "Mixed Berries",
      "quantity": 0.5,
      "unit": "cup",
      "calories": 40,
      "protein": 1,
      "carbs": 10,
      "fat": 0,
      "fiber": 4,
      "ingredients": []
    }
  ],
  "confidence": 0.9,
  "notes": "Greek yogurt with mixed berries",
  "title": "Yogurt & Berries"
}

Input: "mac and cheese"
Output:
{
  "foods": [
    {
      "name": "Macaroni and Cheese",
      "quantity": 1,
      "unit": "serving",
      "calories": 310,
      "protein": 12,
      "carbs": 35,
      "fat": 14,
      "fiber": 2,
      "ingredients": []
    }
  ],
  "confidence": 0.9,
  "notes": "Single dish",
  "title": "Mac & Cheese"
}

Input: "burger and fries"
Output:
{
  "foods": [
    {
      "name": "Burger",
      "quantity": 1,
      "unit": "serving",
      "calories": 550,
      "protein": 30,
      "carbs": 45,
      "fat": 25,
      "ingredients": [
        {"name": "Beef Patty", "quantity": 1, "unit": "patty", "calories": 250, "protein": 20, "carbs": 0, "fat": 18},
        {"name": "Bun", "quantity": 1, "unit": "serving", "calories": 150, "protein": 5, "carbs": 28, "fat": 2},
        {"name": "Cheese", "quantity": 1, "unit": "slice", "calories": 100, "protein": 5, "carbs": 1, "fat": 8},
        {"name": "Lettuce", "quantity": 1, "unit": "serving", "calories": 5, "protein": 0, "carbs": 1, "fat": 0}
      ]
    },
    {
      "name": "French Fries",
      "quantity": 1,
      "unit": "serving",
      "calories": 320,
      "protein": 4,
      "carbs": 43,
      "fat": 15,
      "ingredients": []
    }
  ],
  "confidence": 0.95,
  "notes": "Burger with side of french fries",
  "title": "Burger & Fries"
}

Input: "turkey sandwich with chips and pickle"
Output:
{
  "foods": [
    {
      "name": "Turkey Sandwich",
      "quantity": 1,
      "unit": "sandwich",
      "calories": 320,
      "protein": 24,
      "carbs": 35,
      "fat": 12,
      "ingredients": [
        {"name": "Turkey", "quantity": 3, "unit": "oz", "calories": 90, "protein": 18, "carbs": 0, "fat": 2},
        {"name": "Bread", "quantity": 2, "unit": "slice", "calories": 140, "protein": 4, "carbs": 26, "fat": 2},
        {"name": "Lettuce", "quantity": 1, "unit": "serving", "calories": 5, "protein": 0, "carbs": 1, "fat": 0},
        {"name": "Tomato", "quantity": 2, "unit": "slice", "calories": 10, "protein": 0, "carbs": 2, "fat": 0},
        {"name": "Mayo", "quantity": 1, "unit": "tbsp", "calories": 75, "protein": 0, "carbs": 0, "fat": 8}
      ]
    },
    {
      "name": "Potato Chips",
      "quantity": 1,
      "unit": "serving",
      "calories": 150,
      "protein": 2,
      "carbs": 15,
      "fat": 10,
      "ingredients": []
    },
    {
      "name": "Pickle",
      "quantity": 1,
      "unit": "serving",
      "calories": 5,
      "protein": 0,
      "carbs": 1,
      "fat": 0,
      "ingredients": []
    }
  ],
  "confidence": 0.9,
  "notes": "Turkey sandwich with chips and pickle as sides",
  "title": "Turkey Sandwich & Chips"
}`;

  // Get current time context for title generation
  const now = new Date();
  const hour = now.getHours();
  let timeContext = '';
  
  if (mealType) {
    timeContext = `Meal type: ${mealType}. `;
  } else {
    // Infer time context from current hour
    if (hour >= 5 && hour < 11) timeContext = 'Time context: Morning. ';
    else if (hour >= 11 && hour < 15) timeContext = 'Time context: Lunch time. ';
    else if (hour >= 15 && hour < 19) timeContext = 'Time context: Afternoon. ';
    else if (hour >= 19 && hour < 22) timeContext = 'Time context: Dinner time. ';
    else timeContext = 'Time context: Late night. ';
  }

  const userPrompt = `Analyze this meal: "${description}"

${timeContext}For the title, extract the ACTUAL FOOD NAMES mentioned:

CRITICAL TITLE INSTRUCTIONS:
- MUST use the actual food names from the description
- For "yogurt and berries" → title should be "Yogurt & Berries" 
- For "burger and fries" → title should be "Burger & Fries"
- For "chicken salad" → title should be "Chicken Salad"

❌ NEVER write titles like:
- "Two separate items"
- "Three different items" 
- "Multiple items"
- "Various foods"
- "Different foods"

✅ ALWAYS write titles using actual food names:
- Extract the food names mentioned in the description
- Use "&" to connect multiple foods
- Capitalize each word properly
- Keep it 2-4 words maximum

Follow the examples above. Remember:
- Common dishes like "mac and cheese" or "fish and chips" are single items
- Separate foods like "burger and fries" are multiple items
- NEVER use the word "undefined" in any field
- Use "serving" when unit is unknown
- Focus on FOOD NAMES, not item counts

Return ONLY valid JSON matching the structure shown in examples.`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText);
      
      // Fallback to regular completion if function calling fails
      return await analyzeMealWithFallback(description, mealType);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('No content in response, falling back');
      return await analyzeMealWithFallback(description, mealType);
    }

    // Parse and validate with Zod
    try {
      const rawAnalysis = JSON.parse(content);
      const validatedAnalysis = MealAnalysisSchema.parse(rawAnalysis);
      
      // Validate and fix title if it contains problematic words
      const fixedTitle = validateAndFixTitle(validatedAnalysis.title, validatedAnalysis.foods);
      
      // Calculate totals from top-level foods only (not ingredients)
      const totalCalories = validatedAnalysis.foods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = validatedAnalysis.foods.reduce((sum, food) => sum + food.protein, 0);
      const totalCarbs = validatedAnalysis.foods.reduce((sum, food) => sum + food.carbs, 0);
      const totalFat = validatedAnalysis.foods.reduce((sum, food) => sum + food.fat, 0);

      return {
        ...validatedAnalysis,
        title: fixedTitle,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      if (validationError instanceof z.ZodError) {
        console.error('Zod errors:', validationError.errors);
      }
      console.error('Raw AI response:', content);
      // Try fallback if validation fails
      return await analyzeMealWithFallback(description, mealType);
    }

  } catch (error) {
    console.error('AI analysis error:', error);
    // Try fallback method
    return await analyzeMealWithFallback(description, mealType);
  }
}

/**
 * Fallback method using regular completion with enhanced prompt
 */
async function analyzeMealWithFallback(description: string, mealType?: string): Promise<MealAnalysisWithTotals> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Get current time context for title generation
  const now = new Date();
  const hour = now.getHours();
  let timeContext = '';
  
  if (mealType) {
    timeContext = `Meal type: ${mealType}. `;
  } else {
    // Infer time context from current hour
    if (hour >= 5 && hour < 11) timeContext = 'Time context: Morning. ';
    else if (hour >= 11 && hour < 15) timeContext = 'Time context: Lunch time. ';
    else if (hour >= 15 && hour < 19) timeContext = 'Time context: Afternoon. ';
    else if (hour >= 19 && hour < 22) timeContext = 'Time context: Dinner time. ';
    else timeContext = 'Time context: Late night. ';
  }

  const enhancedPrompt = `You are a nutrition analysis assistant. Analyze the following meal description and return ONLY valid JSON.

CRITICAL: Parse "and", "&", and "with" as separators between DISTINCT items:
- "turkey sandwich and chips" = 2 items: Turkey Sandwich + Chips
- "turkey sandwich with chips" = 2 items: Turkey Sandwich + Chips
- "burger with fries and pickle" = 3 items: Burger + Fries + Pickle

Meal: "${description}"
${timeContext}

TITLE GENERATION - ABSOLUTELY CRITICAL:
The title MUST use the ACTUAL FOOD NAMES from the description.

✅ CORRECT TITLE EXAMPLES:
- "yogurt and berries" → "Yogurt & Berries"
- "burger and fries" → "Burger & Fries" 
- "chicken salad" → "Chicken Salad"
- "pizza slice" → "Pizza Slice"

❌ FORBIDDEN TITLE PATTERNS - NEVER DO THESE:
- "Two separate items" ❌
- "Three different items" ❌  
- "Multiple items" ❌
- "Various foods" ❌
- "Two food items" ❌
- "Different foods" ❌
- "Separate items" ❌

TITLE RULES:
- Extract the ACTUAL food names mentioned in the description
- Use "&" to connect multiple foods
- Capitalize each word properly
- Keep it 2-4 words maximum
- Focus on FOOD NAMES, not counts or descriptors
- NEVER use words like "items", "different", "separate", "various", "multiple"

Return this EXACT JSON structure (no other text):
{
  "foods": [
    {
      "name": "Item Name",
      "quantity": 1,
      "unit": "unit",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "sugar": 0,
      "sodium": 0,
      "ingredients": []
    }
  ],
  "confidence": 0.9,
  "notes": "Note",
  "title": "ACTUAL FOOD NAMES HERE"
}

For composite foods (sandwiches, salads), include ingredients array.
For simple foods (chips, drinks), use empty ingredients array.
Title MUST be actual food names, not generic descriptions.`;

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
            content: 'You are a JSON-only nutrition analyzer. Return ONLY valid JSON, no other text.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" }
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

    // Parse and validate with Zod
    try {
      const rawAnalysis = JSON.parse(content);
      const validatedAnalysis = MealAnalysisSchema.parse(rawAnalysis);
      
      // Post-process to ensure "and" items are separated if needed
      const processedFoods = postProcessFoods(validatedAnalysis.foods, description);
      
      // Validate and fix title if it contains problematic words
      const fixedTitle = validateAndFixTitle(validatedAnalysis.title, processedFoods);
      
      // Calculate totals
      const totalCalories = processedFoods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = processedFoods.reduce((sum, food) => sum + food.protein, 0);
      const totalCarbs = processedFoods.reduce((sum, food) => sum + food.carbs, 0);
      const totalFat = processedFoods.reduce((sum, food) => sum + food.fat, 0);

      return {
        foods: processedFoods,
        title: fixedTitle,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        confidence: validatedAnalysis.confidence,
        notes: validatedAnalysis.notes
      };
    } catch (validationError) {
      console.error('Fallback validation failed:', validationError);
      throw new Error('Failed to analyze meal after validation');
    }

  } catch (error) {
    console.error('Fallback analysis error:', error);
    throw new Error(`Failed to analyze meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Post-process foods to ensure proper separation of "and" items
 */
function postProcessFoods(foods: FoodItem[], description: string): FoodItem[] {
  const descLower = description.toLowerCase();
  
  // Count the number of "and"s in the description
  const andCount = (descLower.match(/\b(and|&)\b/g) || []).length;
  const expectedItems = andCount + 1; // Number of items should be andCount + 1
  
  // If we have fewer items than expected, try to extract missing ones
  if (foods.length < expectedItems) {
    console.log(`Expected ${expectedItems} items but got ${foods.length}. Description: "${description}"`);
    
    // If only one item returned but multiple expected
    if (foods.length === 1 && expectedItems > 1) {
    const food = foods[0];
    const foodNameLower = food.name.toLowerCase();
    
    // Check if the single food item contains "and"
    if (foodNameLower.includes(' and ') || foodNameLower.includes(' with ')) {
      // Try to split it
      const parts = foodNameLower.split(/\s+(and|with)\s+/);
      if (parts.length >= 3) {
        const mainItem = parts[0];
        const sideItem = parts[2];
        
        // Create two separate items
        const processedFoods: FoodItem[] = [];
        
        // Estimate nutrition split (60% main, 40% side as rough estimate)
        const mainCalories = Math.round(food.calories * 0.6);
        const sideCalories = Math.round(food.calories * 0.4);
        
        // Main item (e.g., sandwich)
        processedFoods.push({
          name: capitalizeWords(mainItem),
          quantity: 1,
          unit: 'item',
          calories: mainCalories,
          protein: Math.round(food.protein * 0.7),
          carbs: Math.round(food.carbs * 0.5),
          fat: Math.round(food.fat * 0.6),
          fiber: food.fiber ? Math.round(food.fiber * 0.7) : undefined,
          sugar: food.sugar ? Math.round(food.sugar * 0.5) : undefined,
          sodium: food.sodium ? Math.round(food.sodium * 0.7) : undefined,
          ingredients: food.ingredients || []
        });
        
        // Side item (e.g., chips)
        processedFoods.push({
          name: capitalizeWords(sideItem),
          quantity: 1,
          unit: 'serving',
          calories: sideCalories,
          protein: Math.round(food.protein * 0.3),
          carbs: Math.round(food.carbs * 0.5),
          fat: Math.round(food.fat * 0.4),
          fiber: food.fiber ? Math.round(food.fiber * 0.3) : undefined,
          sugar: food.sugar ? Math.round(food.sugar * 0.5) : undefined,
          sodium: food.sodium ? Math.round(food.sodium * 0.3) : undefined,
          ingredients: []
        });
        
        return processedFoods;
      }
    }
    }
  }
  
  return foods;
}

/**
 * Capitalize words in a string
 */
function capitalizeWords(str: string): string {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Validate and fix title if it contains problematic words
 */
function validateAndFixTitle(title: string, foods: FoodItem[]): string {
  const titleLower = title.toLowerCase().trim();
  
  // Comprehensive regex patterns to catch problematic titles
  const problematicPatterns = [
    // Number + items patterns
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(different\s+)?items?\b/i,
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+separate\s+items?\b/i,
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+distinct\s+items?\b/i,
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+various\s+items?\b/i,
    /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+multiple\s+items?\b/i,
    
    // Generic problematic phrases
    /\bdifferent\s+items?\b/i,
    /\bseparate\s+items?\b/i,
    /\bvarious\s+items?\b/i,
    /\bmultiple\s+items?\b/i,
    /\bdistinct\s+items?\b/i,
    /\bfood\s+items?\b/i,
    
    // Count-based descriptions
    /\b(several|many|multiple)\s+different\b/i,
    /\b(several|many|multiple)\s+separate\b/i,
    
    // Generic food descriptors instead of actual food names
    /^(meal|food|snack|dish|plate)$/i,
    /^(items?|things?|stuff)$/i,
  ];
  
  // Check if title matches any problematic pattern
  const isProblematic = problematicPatterns.some(pattern => pattern.test(titleLower));
  
  if (isProblematic) {
    console.log(`[title-validation] PROBLEMATIC TITLE DETECTED: "${title}"`);
    console.log(`[title-validation] Pattern matched. Regenerating from ${foods.length} food names.`);
    
    // Generate new title from actual food names
    if (!foods || foods.length === 0) {
      console.log(`[title-validation] No foods provided, using fallback: "Meal"`);
      return "Meal";
    }
    
    if (foods.length === 1) {
      const newTitle = cleanFoodName(foods[0].name);
      console.log(`[title-validation] Single food: "${newTitle}"`);
      return newTitle;
    } else if (foods.length === 2) {
      const food1 = cleanFoodName(foods[0].name);
      const food2 = cleanFoodName(foods[1].name);
      const newTitle = `${food1} & ${food2}`;
      console.log(`[title-validation] Two foods: "${newTitle}"`);
      return newTitle;
    } else {
      // For more than 2 items, take the first two main ones
      const food1 = cleanFoodName(foods[0].name);
      const food2 = cleanFoodName(foods[1].name);
      const newTitle = `${food1} & ${food2}`;
      console.log(`[title-validation] Multiple foods (${foods.length}), using first two: "${newTitle}"`);
      return newTitle;
    }
  }
  
  // Title looks good, return as-is
  console.log(`[title-validation] Title looks good: "${title}"`);
  return title;
}

/**
 * Clean and format food name for title use
 */
function cleanFoodName(foodName: string): string {
  // Remove common prefixes and suffixes that don't belong in titles
  let cleaned = foodName
    .replace(/^(fresh|organic|raw|cooked|grilled|fried|baked)\s+/i, '')
    .replace(/\s+(serving|portion|piece|item)$/i, '')
    .trim();
  
  // Ensure proper capitalization
  return capitalizeWords(cleaned);
}

/**
 * Save meal analysis to database using correct schema
 * Now handles hierarchical structure by flattening for database storage
 */
async function saveMealToDatabase(
  supabase: any,
  analysis: MealAnalysisWithTotals,
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
        .eq('serving_size', parseNumericQuantity(food.quantity))
        .eq('serving_unit', extractUnit(food.quantity) || food.unit || 'serving')
        .single();

      let foodItemId: string;
      
      if (existingFood) {
        foodItemId = existingFood.id;
      } else {
        // Log the exact data being sent to database
        const servingSize = parseNumericQuantity(food.quantity);
        const servingUnit = extractUnit(food.quantity) || food.unit || 'serving';
        
        console.log(`[log-meal-ai] Creating food_item for "${food.name}":`);
        console.log(`[log-meal-ai]   - Original quantity: ${JSON.stringify(food.quantity)}`);
        console.log(`[log-meal-ai]   - Parsed serving_size: ${servingSize} (type: ${typeof servingSize})`);
        console.log(`[log-meal-ai]   - Parsed serving_unit: ${servingUnit}`);
        
        // Ensure nutrition values are never null for food_items
        const foodCalories = food.calories ?? 0;
        const foodProtein = food.protein ?? 0;
        const foodCarbs = food.carbs ?? 0;
        const foodFat = food.fat ?? 0;
        
        const { data: newFoodItem, error: foodError } = await supabase
          .from('food_items')
          .insert({
            name: food.name,
            serving_size: servingSize,
            serving_unit: servingUnit,
            calories: foodCalories,
            protein: foodProtein,
            carbs: foodCarbs,
            fat: foodFat,
            fiber: food.fiber || 0,
            sugar: food.sugar || 0,
            sodium: food.sodium || 0,
            verified: false,
          })
          .select()
          .single();

        if (foodError) {
          console.error(`[log-meal-ai] Database error creating food_item:`);
          console.error(`[log-meal-ai]   - Error: ${foodError.message}`);
          console.error(`[log-meal-ai]   - Code: ${foodError.code}`);
          console.error(`[log-meal-ai]   - Details: ${JSON.stringify(foodError.details)}`);
          console.error(`[log-meal-ai]   - Hint: ${foodError.hint}`);
          console.error(`[log-meal-ai]   - Data attempted:`, {
            name: food.name,
            serving_size: servingSize,
            serving_unit: servingUnit,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat
          });
          throw new Error(`Failed to create food item: ${foodError.message}`);
        }
        foodItemId = newFoodItem.id;
      }

      // Create meal_entry with the full hierarchical data in correction_history
      const entryQuantity = parseNumericQuantity(food.quantity);
      const entryUnit = extractUnit(food.quantity) || food.unit || 'serving';
      
      // CRITICAL: Ensure nutrition values are never null
      const mealCalories = food.calories ?? 0;
      const mealProtein = food.protein ?? 0;
      const mealCarbs = food.carbs ?? 0;
      const mealFat = food.fat ?? 0;
      
      // Validate before insertion
      if (mealCalories === null || mealCalories === undefined) {
        console.error(`[log-meal-ai] CRITICAL ERROR: Calories is null/undefined for food "${food.name}"`);
        console.error(`[log-meal-ai] Food object:`, JSON.stringify(food));
        throw new Error(`Cannot save meal: Nutrition data missing for "${food.name}"`);
      }
      
      console.log(`[log-meal-ai] Creating meal_entry for "${food.name}":`);
      console.log(`[log-meal-ai]   - Original quantity: ${JSON.stringify(food.quantity)}`);
      console.log(`[log-meal-ai]   - Parsed quantity: ${entryQuantity} (type: ${typeof entryQuantity})`);
      console.log(`[log-meal-ai]   - Parsed unit: ${entryUnit}`);
      console.log(`[log-meal-ai]   - Nutrition: calories=${mealCalories}, protein=${mealProtein}, carbs=${mealCarbs}, fat=${mealFat}`);
      
      const { data: mealEntry, error: entryError } = await supabase
        .from('meal_entries')
        .insert({
          user_id: request.userId,
          daily_log_id: dailyLogId,
          food_item_id: foodItemId,
          meal_group_id: mealGroupId,
          meal_type: request.mealType,
          quantity: entryQuantity,
          unit: entryUnit,
          calories: mealCalories,
          protein: mealProtein,
          carbs: mealCarbs,
          fat: mealFat,
          notes: `${analysis.title} - ${analysis.notes}`,
          correction_history: [
            {
              role: 'assistant',
              content: JSON.stringify({ 
                ...food, 
                ingredients: food.ingredients || [], 
                title: analysis.title 
              })
            }
          ],
        })
        .select()
        .single();

      if (entryError) {
        console.error(`[log-meal-ai] Database error creating meal_entry:`);
        console.error(`[log-meal-ai]   - Error: ${entryError.message}`);
        console.error(`[log-meal-ai]   - Code: ${entryError.code}`);
        console.error(`[log-meal-ai]   - Details: ${JSON.stringify(entryError.details)}`);
        console.error(`[log-meal-ai]   - Hint: ${entryError.hint}`);
        console.error(`[log-meal-ai]   - Data attempted:`, {
          user_id: request.userId,
          food_item_id: foodItemId,
          meal_type: request.mealType,
          quantity: entryQuantity,
          unit: entryUnit
        });
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

    console.log(`[log-meal-ai] Successfully saved meal with group ID: ${mealGroupId}`);
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
    const { description, userId, mealType, date, existingAnalysis }: LogMealRequest = await req.json();

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

    // Use existing analysis if provided, otherwise analyze with AI
    let analysis: MealAnalysisWithTotals;
    
    if (existingAnalysis) {
      try {
        // Validate the existing analysis structure
        const validatedAnalysis = ExistingAnalysisSchema.parse(existingAnalysis);
        console.log(`[log-meal-ai] Validated existing analysis. ${validatedAnalysis.foods.length} foods`);
        
        // Preprocess the existing analysis to handle client-side transformed data
        const preprocessed = preprocessExistingAnalysis(validatedAnalysis);
        console.log(`[log-meal-ai] Preprocessed existing analysis data to handle concatenated quantities and nested nutrition`);
        
        // Ensure all required fields are present after preprocessing
        if (!preprocessed.foods || preprocessed.foods.length === 0) {
          throw new Error('No foods found in analysis after preprocessing');
        }
        
        // Validate each food has required nutrition data
        for (const food of preprocessed.foods) {
          if (food.calories === undefined || food.calories === null) {
            console.error(`[log-meal-ai] ERROR: Food "${food.name}" missing calories after preprocessing`);
            throw new Error(`Food item "${food.name}" is missing required nutrition data (calories)`);
          }
        }
        
        analysis = preprocessed;
      } catch (error) {
        console.error(`[log-meal-ai] ERROR: Invalid existingAnalysis structure:`, error);
        if (error instanceof z.ZodError) {
          const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
          throw new Error(`Invalid meal data structure: ${issues}`);
        }
        throw new Error(`Failed to process existing analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      // Analyze meal with AI using Function Calling
      analysis = await analyzeMealWithAI(description, mealType, date);
      console.log(`[log-meal-ai] AI analysis complete. ${analysis.foods.length} foods found, ${analysis.totalCalories} total calories, title: "${analysis.title}"`);
    }

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
        notes: 'Error occurred during analysis',
        title: 'Analysis failed'
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