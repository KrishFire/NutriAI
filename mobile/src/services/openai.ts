import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system';

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
  title?: string;
  description?: string;
}

export async function analyzeMealImage(
  imageUri: string
): Promise<MealAnalysis> {
  try {
    // Convert image to base64 for Edge Function
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result); // Keep the full data URL with prefix
      };
      reader.readAsDataURL(blob);
    });

    // Get current session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    // Call the Supabase Edge Function with authentication and debug mode
    const { data, error } = await supabase.functions.invoke('analyze-meal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'X-Debug-Mode': 'true', // Enable debug mode for detailed error info
      },
      body: {
        imageBase64: base64,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);

      // Try to extract detailed error information
      let errorMessage = error.message;
      try {
        // @ts-ignore - runtime check for FunctionsHttpError
        if (error.response && typeof error.response.json === 'function') {
          const errorBody = await error.response.json();
          console.error('Edge Function error details:', errorBody);

          // Extract specific error info from Edge Function response
          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
          if (errorBody.stage) {
            errorMessage = `[${errorBody.stage}] ${errorMessage}`;
          }
          if (errorBody.requestId) {
            errorMessage += ` (Request ID: ${errorBody.requestId})`;
          }
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }

      throw new Error(`Failed to analyze meal: ${errorMessage}`);
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
  imageBase64: string,
  voiceTranscription: string
): Promise<MealAnalysis> {
  try {
    // Get current session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    // Call the Supabase Edge Function with both image and voice context
    const { data, error } = await supabase.functions.invoke('analyze-meal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'X-Debug-Mode': 'true',
      },
      body: {
        imageBase64,
        voiceContext: voiceTranscription,
      },
    });

    if (error) {
      console.error('Supabase function error:', error);

      // Try to extract detailed error information
      let errorMessage = error.message;
      try {
        // @ts-ignore - runtime check for FunctionsHttpError
        if (error.response && typeof error.response.json === 'function') {
          const errorBody = await error.response.json();
          console.error('Edge Function error details:', errorBody);

          // Extract specific error info from Edge Function response
          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
          if (errorBody.stage) {
            errorMessage = `[${errorBody.stage}] ${errorMessage}`;
          }
          if (errorBody.requestId) {
            errorMessage += ` (Request ID: ${errorBody.requestId})`;
          }
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }

      throw new Error(`Failed to analyze meal: ${errorMessage}`);
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

export async function transcribeAudio(
  audioUri: string
): Promise<{ transcription: string; confidence?: number }> {
  // Note: The transcribe-audio Edge Function accepts both:
  // - multipart/form-data (not working with React Native FormData polyfill)
  // - application/json with base64 audio (current implementation)
  try {
    // Get current session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    // Read audio file and convert to base64
    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Call the Supabase Edge Function with JSON payload
    const { data, error } = await supabase.functions.invoke(
      'transcribe-audio',
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'X-Debug-Mode': 'true', // Enable debug mode for detailed error info
          // Do NOT set Content-Type - supabase.functions.invoke() handles it automatically
        },
        body: {
          audio: base64Audio,
          mimeType: 'audio/m4a', // expo-av default format
        },
      }
    );

    if (error) {
      console.error('Supabase function error:', error);

      // Try to extract detailed error information
      let errorMessage = error.message;
      try {
        // @ts-ignore - runtime check for FunctionsHttpError
        if (error.response && typeof error.response.json === 'function') {
          const errorBody = await error.response.json();
          console.error('Edge Function error details:', errorBody);

          if (errorBody.error) {
            errorMessage = errorBody.error;
          }
          if (errorBody.stage) {
            errorMessage = `[${errorBody.stage}] ${errorMessage}`;
          }
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }

      throw new Error(`Failed to transcribe audio: ${errorMessage}`);
    }

    if (!data) {
      throw new Error('No response from transcription service');
    }

    // Validate the response structure
    if (!data.transcription || typeof data.transcription !== 'string') {
      throw new Error('Invalid response format: missing transcription');
    }

    console.log('[OpenAI Service] Transcription successful:', {
      length: data.transcription.length,
      confidence: data.confidence,
    });

    return {
      transcription: data.transcription,
      confidence: data.confidence || 1.0,
    };
  } catch (error) {
    console.error('[OpenAI Service] Transcription error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to transcribe audio: ${error.message}`
        : 'Failed to transcribe audio: Unknown error'
    );
  }
}
