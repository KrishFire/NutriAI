/**
 * Meal Correction Service
 * 
 * Handles AI-powered meal analysis corrections using natural language
 */

import { supabase, supabaseConfig } from '../config/supabase';
import { RefineMealRequest, RefineMealResponse } from '../../shared/types';

/**
 * Service class for meal corrections
 */
class MealCorrectionService {
  /**
   * Submit a correction for a meal analysis
   */
  async submitCorrection(
    mealId: string,
    correctionText: string
  ): Promise<RefineMealResponse> {
    try {
      console.log(`[MealCorrection] Submitting correction for meal ${mealId}: "${correctionText}"`);

      // Get current auth session
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return {
          success: false,
          error: 'Authentication required. Please log in and try again.',
        };
      }

      const requestPayload: RefineMealRequest = {
        mealId,
        correctionText: correctionText.trim()
      };

      const response = await fetch(`${supabaseConfig.url}/functions/v1/refine-meal-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MealCorrection] HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        
        // Handle specific error cases
        if (response.status === 401) {
          return {
            success: false,
            error: 'Authentication expired. Please refresh and try again.',
          };
        }
        
        if (response.status === 404) {
          return {
            success: false,
            error: 'Meal not found. It may have been deleted.',
          };
        }
        
        return {
          success: false,
          error: 'Failed to process correction. Please try again.',
        };
      }

      const result: RefineMealResponse = await response.json();
      
      if (!result.success) {
        console.error('[MealCorrection] Edge Function returned error:', result.error);
        return result;
      }

      console.log(`[MealCorrection] Correction successful for meal ${mealId}`);
      return result;

    } catch (error) {
      console.error('[MealCorrection] Network/service error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

// Export singleton instance
export const mealCorrectionService = new MealCorrectionService();
export default mealCorrectionService;