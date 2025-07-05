/**
 * Shared types for NutriAI meal correction workflow
 * Used by both frontend and Supabase Edge Functions
 */

// A single food item in the analysis
export interface MealItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

// The complete analysis object, which will be stringified in the 'content' of assistant messages
export interface MealAnalysis {
  foods: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number;
  notes?: string;
}

// The structure for each message in our `correction_history` jsonb array
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string; // For 'assistant', this is stringified MealAnalysis. For 'user', it's their text correction.
}

// Request/Response types for the refine-meal-analysis Edge Function
export interface RefineMealRequest {
  mealId: string;
  correctionText: string;
}

export interface RefineMealResponse {
  success: boolean;
  newAnalysis?: MealAnalysis;
  newHistory?: ChatMessage[];
  error?: string;
}

// Type for meal entry with correction history
export interface MealEntryWithHistory {
  id: string;
  user_id: string;
  daily_log_id: string;
  food_item_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
  notes?: string;
  correction_history: ChatMessage[];
  logged_at: string;
  created_at: string;
  updated_at: string;
}