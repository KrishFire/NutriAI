/**
 * AI-Powered Meal Logging Service
 *
 * Provides natural language meal logging using GPT-4o-mini
 * Users can simply describe their meal and get structured nutrition data
 */

import { supabase, supabaseConfig } from '../config/supabase';

// Types for AI meal analysis
export interface AIFoodItem {
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
  ingredients?: AIFoodItem[]; // For hierarchical structure (sandwiches, salads, etc.)
}

export interface AIMealAnalysis {
  foods: AIFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number; // 0-1, how confident the AI is in the estimates
  notes?: string;
  title?: string; // AI-generated meal title
}

export interface LogMealRequest {
  description: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string; // ISO date string
}

export interface LogMealResponse {
  success: boolean;
  mealAnalysis: AIMealAnalysis;
  mealLogId?: string;
  error?: string;
}

/**
 * AI Meal Logging Service Class
 */
class MealAIService {
  private cache = new Map<
    string,
    { data: AIMealAnalysis; timestamp: number }
  >();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache for meal descriptions

  /**
   * Save meal directly with existing analysis (no re-analysis)
   */
  public async saveMealDirectly(
    analysis: AIMealAnalysis,
    description: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack',
    date?: string
  ): Promise<LogMealResponse> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: 'Please log in to save meals',
          mealAnalysis: analysis,
        };
      }

      // Save to database via Edge Function with existing analysis
      const requestPayload = {
        description: description.trim(),
        userId: user.id,
        mealType,
        date: date || new Date().toISOString().split('T')[0],
        existingAnalysis: analysis, // Pass the existing analysis
      };

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return {
          success: false,
          error: 'Authentication required',
          mealAnalysis: analysis,
        };
      }

      const response = await fetch(
        `${supabaseConfig.url}/functions/v1/log-meal-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify(requestPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[MealAI] Edge Function error:', errorData);
        return {
          success: false,
          error: 'Failed to save meal. Please try again.',
          mealAnalysis: analysis,
        };
      }

      const result: LogMealResponse = await response.json();

      console.log('[MealAI] Meal saved successfully:', result.mealLogId);
      return result;
    } catch (error) {
      console.error('[MealAI] Error saving meal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save meal',
        mealAnalysis: analysis,
      };
    }
  }

  /**
   * Analyze meal description using AI and save to database
   */
  public async logMeal(
    description: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack',
    date?: string
  ): Promise<LogMealResponse> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: 'Please log in to save meals',
          mealAnalysis: {
            foods: [],
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            confidence: 0,
          },
        };
      }

      // Check cache first
      const cacheKey = this.getCacheKey(description.trim().toLowerCase());
      const cachedResult = this.getFromCache(cacheKey);

      let mealAnalysis: AIMealAnalysis;

      if (cachedResult) {
        console.log('[MealAI] Using cached result for:', description);
        mealAnalysis = cachedResult;
      } else {
        // Analyze with AI
        console.log('[MealAI] Analyzing meal with AI:', description);
        mealAnalysis = await this.analyzeMealWithAI(description);

        // Cache the result
        this.setCache(cacheKey, mealAnalysis);
      }

      // Save to database via Edge Function
      const requestPayload: LogMealRequest = {
        description: description.trim(),
        userId: user.id,
        mealType,
        date: date || new Date().toISOString().split('T')[0],
      };

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return {
          success: false,
          error: 'Authentication required',
          mealAnalysis,
        };
      }

      const response = await fetch(
        `${supabaseConfig.url}/functions/v1/log-meal-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify(requestPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[MealAI] Edge Function error:', errorData);
        return {
          success: false,
          error: 'Failed to save meal. Please try again.',
          mealAnalysis,
        };
      }

      const result: LogMealResponse = await response.json();

      console.log('[MealAI] Meal logged successfully:', result.mealLogId);

      return result;
    } catch (error) {
      console.error('[MealAI] Error logging meal:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        mealAnalysis: {
          foods: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          confidence: 0,
        },
      };
    }
  }

  /**
   * Analyze meal description without saving (for preview)
   */
  public async analyzeMeal(description: string): Promise<AIMealAnalysis> {
    const cacheKey = this.getCacheKey(description.trim().toLowerCase());
    const cachedResult = this.getFromCache(cacheKey);

    if (cachedResult) {
      console.log('[MealAI] Using cached analysis for:', description);
      return cachedResult;
    }

    console.log('[MealAI] Analyzing meal preview:', description);
    const analysis = await this.analyzeMealWithAI(description);

    // Cache the result
    this.setCache(cacheKey, analysis);

    return analysis;
  }

  /**
   * Preprocess description to help AI understand multiple items
   */
  private preprocessDescription(description: string): string {
    // Count "and"s to help AI understand how many items to extract
    const andMatches = description.toLowerCase().match(/\b(and|&)\b/g);
    const andCount = andMatches ? andMatches.length : 0;
    
    if (andCount >= 2) {
      // Multiple "and"s detected - add hint for AI
      return `${description} (Note: This contains ${andCount + 1} separate items)`;
    }
    
    return description;
  }

  /**
   * Private method to call AI for meal analysis
   */
  private async analyzeMealWithAI(
    description: string
  ): Promise<AIMealAnalysis> {
    // Preprocess description for better AI understanding
    const processedDescription = this.preprocessDescription(description);
    
    // Call the actual Edge Function for real AI analysis
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${supabaseConfig.url}/functions/v1/log-meal-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            description: processedDescription,
            userId: 'preview', // Special preview mode
            mealType: 'snack',
            date: new Date().toISOString().split('T')[0],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MealAI] HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
        });
        throw new Error(
          `Analysis failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        console.error('[MealAI] API Error:', result);
        throw new Error(result.error || 'Analysis failed');
      }

      return result.mealAnalysis;
    } catch (error) {
      console.error('[MealAI] Error calling AI analysis:', error);

      // Fallback to simple local analysis for demo/offline use
      return this.getFallbackAnalysis(description);
    }
  }

  /**
   * Fallback analysis when AI service is unavailable
   */
  private getFallbackAnalysis(description: string): AIMealAnalysis {
    const descLower = description.toLowerCase();
    const mockFoods: AIFoodItem[] = [];

    // Simple pattern matching for common foods (fallback only)
    if (descLower.includes('big mac')) {
      mockFoods.push({
        name: 'Big Mac',
        quantity: 1,
        unit: 'burger',
        calories: 563,
        protein: 25,
        carbs: 45,
        fat: 33,
        fiber: 3,
        sugar: 5,
        sodium: 1040,
      });
    }

    if (descLower.includes('fries') || descLower.includes('french fries')) {
      const isLarge = descLower.includes('large');
      mockFoods.push({
        name: isLarge ? 'Large French Fries' : 'Medium French Fries',
        quantity: 1,
        unit: 'serving',
        calories: isLarge ? 365 : 320,
        protein: isLarge ? 4 : 3,
        carbs: isLarge ? 48 : 43,
        fat: isLarge ? 17 : 15,
        fiber: 4,
        sugar: 0,
        sodium: isLarge ? 400 : 350,
      });
    }

    if (descLower.includes('apple') && !descLower.includes('juice')) {
      const isMedium =
        !descLower.includes('large') && !descLower.includes('small');
      mockFoods.push({
        name: 'Apple',
        quantity: 1,
        unit: isMedium
          ? 'medium'
          : descLower.includes('large')
            ? 'large'
            : 'small',
        calories: isMedium ? 95 : descLower.includes('large') ? 116 : 77,
        protein: 0,
        carbs: isMedium ? 25 : descLower.includes('large') ? 31 : 20,
        fat: 0,
        fiber: 4,
        sugar: 19,
        sodium: 2,
      });
    }

    if (descLower.includes('chicken')) {
      const isGrilled =
        descLower.includes('grilled') || descLower.includes('baked');
      mockFoods.push({
        name: isGrilled ? 'Chicken Breast, Grilled' : 'Chicken Breast',
        quantity: descLower.includes('2') ? 2 : 1,
        unit: 'piece',
        calories: isGrilled ? 186 : 195,
        protein: isGrilled ? 35 : 36,
        carbs: 0,
        fat: isGrilled ? 4 : 4.3,
        fiber: 0,
        sugar: 0,
        sodium: 74,
      });
    }

    // Fallback for unrecognized foods
    if (mockFoods.length === 0) {
      mockFoods.push({
        name: 'Unknown Food',
        quantity: 1,
        unit: 'serving',
        calories: 250,
        protein: 10,
        carbs: 25,
        fat: 10,
        fiber: 3,
        sugar: 5,
        sodium: 300,
      });
    }

    // Calculate totals
    const totalCalories = mockFoods.reduce(
      (sum, food) => sum + food.calories,
      0
    );
    const totalProtein = mockFoods.reduce((sum, food) => sum + food.protein, 0);
    const totalCarbs = mockFoods.reduce((sum, food) => sum + food.carbs, 0);
    const totalFat = mockFoods.reduce((sum, food) => sum + food.fat, 0);

    return {
      foods: mockFoods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      confidence: 0.5, // Lower confidence for fallback
      notes: 'Offline analysis. Please check accuracy and adjust if needed.',
    };
  }

  /**
   * Clear the client-side cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // Private helper methods

  private getCacheKey(description: string): string {
    return `meal-analysis:${description}`;
  }

  private getFromCache(key: string): AIMealAnalysis | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: AIMealAnalysis): void {
    // Limit cache size
    if (this.cache.size >= 20) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

/**
 * Clean unit string to remove any "undefined" text
 */
function cleanUnit(unit: string | undefined): string {
  if (!unit || unit === '' || unit === 'undefined' || unit === 'null') {
    return 'serving';
  }
  // Remove the word "undefined" from unit strings
  const cleaned = unit.replace(/\bundefined\b/gi, '').trim();
  return cleaned || 'serving';
}

/**
 * Convert AI meal analysis to the MealAnalysis format expected by MealDetailsScreen
 */
export function aiMealToMealAnalysis(aiMeal: AIMealAnalysis): any {
  return {
    foods: aiMeal.foods.map(food => {
      // Clean the unit to ensure no "undefined" appears
      const cleanedUnit = cleanUnit(food.unit);
      const quantityStr = cleanedUnit ? `${food.quantity} ${cleanedUnit}` : `${food.quantity}`;
      
      return {
        name: food.name,
        quantity: quantityStr,
        nutrition: {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber || 0,
          sugar: food.sugar || 0,
          sodium: food.sodium || 0,
        },
        confidence: aiMeal.confidence,
        // Include ingredients for hierarchical structure
        ingredients: food.ingredients ? food.ingredients.map(ingredient => {
          const cleanedIngredientUnit = cleanUnit(ingredient.unit);
          const ingredientQuantityStr = cleanedIngredientUnit ? `${ingredient.quantity} ${cleanedIngredientUnit}` : `${ingredient.quantity}`;
          
          return {
            name: ingredient.name,
            quantity: ingredientQuantityStr,
            nutrition: {
              calories: ingredient.calories,
              protein: ingredient.protein,
              carbs: ingredient.carbs,
              fat: ingredient.fat,
              fiber: ingredient.fiber || 0,
              sugar: ingredient.sugar || 0,
              sodium: ingredient.sodium || 0,
            },
          };
        }) : undefined,
      };
    }),
    totalNutrition: {
      calories: aiMeal.totalCalories,
      protein: aiMeal.totalProtein,
      carbs: aiMeal.totalCarbs,
      fat: aiMeal.totalFat,
      fiber: aiMeal.foods.reduce((sum, food) => sum + (food.fiber || 0), 0),
      sugar: aiMeal.foods.reduce((sum, food) => sum + (food.sugar || 0), 0),
      sodium: aiMeal.foods.reduce((sum, food) => sum + (food.sodium || 0), 0),
    },
    confidence: aiMeal.confidence,
    notes: aiMeal.notes || 'AI-powered meal analysis',
    title: aiMeal.title || 'Meal', // ADD THIS LINE to preserve the AI-generated title
  };
}

/**
 * Single instance of the meal AI service
 */
const mealAIService = new MealAIService();

export default mealAIService;
