import { supabase } from '../config/supabase';

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface FoodItem {
  name: string;
  quantity: string;
  nutrition: NutritionData;
  confidence: number;
}

export interface MealAnalysis {
  foods: FoodItem[];
  totalNutrition: NutritionData;
  confidence: number;
  notes?: string;
}

export async function analyzeMealImage(imageUri: string): Promise<MealAnalysis> {
  try {
    // Convert image to base64 for Edge Function
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result); // Keep the full data URL with prefix
      };
      reader.readAsDataURL(blob);
    });

    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    // Call the Supabase Edge Function with authentication
    const { data, error } = await supabase.functions.invoke('analyze-meal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        imageBase64: base64,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to analyze meal: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response from meal analysis service');
    }

    // Validate the response structure
    if (!data.foods || !Array.isArray(data.foods)) {
      throw new Error('Invalid response format: missing foods array');
    }

    if (!data.totalNutrition) {
      throw new Error('Invalid response format: missing totalNutrition');
    }

    return data as MealAnalysis;
  } catch (error) {
    console.error('Error analyzing meal image:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to analyze meal: ${error.message}`
        : 'Failed to analyze meal: Unknown error'
    );
  }
}

export async function analyzeWithVoiceContext(
  imageUri: string, 
  voiceTranscription: string
): Promise<MealAnalysis> {
  try {
    // Convert image to base64 for Edge Function
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result); // Keep the full data URL with prefix
      };
      reader.readAsDataURL(blob);
    });

    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    // Call the Supabase Edge Function with voice context and authentication
    const { data, error } = await supabase.functions.invoke('analyze-meal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        imageBase64: base64,
        voiceTranscription,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to analyze meal: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response from meal analysis service');
    }

    // Validate the response structure
    if (!data.foods || !Array.isArray(data.foods)) {
      throw new Error('Invalid response format: missing foods array');
    }

    if (!data.totalNutrition) {
      throw new Error('Invalid response format: missing totalNutrition');
    }

    return data as MealAnalysis;
  } catch (error) {
    console.error('Error analyzing meal with voice context:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to analyze meal: ${error.message}`
        : 'Failed to analyze meal: Unknown error'
    );
  }
}