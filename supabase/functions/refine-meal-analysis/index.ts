import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Request interface for meal refinement
interface RefineMealRequest {
  mealId: string; // This is actually the meal_group_id from log-meal-ai
  correctionText: string;
}

// Chat message interface (matches shared types)
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Response interface
interface RefineMealResponse {
  success: boolean;
  newAnalysis?: any;
  newHistory?: ChatMessage[];
  error?: string;
}

/**
 * System prompt for meal analysis refinement
 * Designed to be strict about JSON-only output
 */
const REFINEMENT_SYSTEM_PROMPT = `You are an expert nutrition analysis assistant. You will be given a conversation history. The history contains previous analyses you have provided (as stringified JSON) and user corrections. Your task is to provide a new, complete, and corrected meal analysis based on the entire conversation.

🚨 CRITICAL RULE #1 - BRANDED VS HOMEMADE RECOGNITION 🚨
BEFORE analyzing refinements, determine if items are BRANDED restaurant items or HOMEMADE food:

BRANDED ITEMS (use your trained knowledge):
- If you recognize this as a specific menu item from a restaurant/brand (e.g., "Big Mac", "Double Double Animal Style", "Whopper", "Chick-fil-A Spicy Deluxe")
- Use your TRAINED KNOWLEDGE of the ACTUAL nutrition values for that item
- Do NOT recalculate from ingredients - use the known values
- When providing ingredient breakdown, ensure totals match the known values
- Example: "In-N-Out Double Double Animal Style" = 670 cal, 39g carbs, 37g protein, 41g fat (use these, don't recalculate)

HOMEMADE ITEMS (calculate from ingredients):
- Generic descriptions like "turkey sandwich", "homemade burger"
- Calculate nutrition by summing individual ingredients

CRITICAL INSTRUCTIONS:
1. Your response MUST be a single, valid, stringified JSON object and nothing else.
2. The JSON object must represent the complete, updated list of food items for the meal, reflecting all user corrections.
3. Do NOT include any explanatory text, apologies, or conversational filler before or after the JSON object.
4. The JSON schema for your output must match the format of previous analyses in the conversation.
5. Base your response on the full history provided. The final user message is the most recent correction to apply.
6. Use natural, user-friendly units (1 burger, 1 slice, 2 tablespoons, 1 cup, etc.)
7. When foods are corrected or added, break them down into individual components if they are complex items.
8. For BRANDED items, preserve their known nutrition values and never recalculate from ingredients.

REFINEMENT RULES:
- MODIFY/REPLACE existing items based on refinements - DO NOT create duplicates
- If the refinement changes an item (e.g., "shake was blueberry not strawberry"), REPLACE the original item entirely
- Return the COMPLETE updated meal list with ALL items (both modified and unmodified)
- For replacements: Remove the old item and add the corrected one
- Keep all other unmentioned items exactly as they are
- Example: If meal has "strawberry protein shake" and refinement is "shake was blueberry", return "blueberry protein shake" INSTEAD OF "strawberry protein shake", not both.

PRESERVATION RULE FOR SIMPLE SUBSTITUTIONS:
- For simple substitutions (e.g., "X was Y not Z"), preserve ALL other ingredients, quantities, and nutritional values EXACTLY as they were
- Only change the specific item mentioned in the refinement
- If user says "shake was blueberry not strawberry", ONLY replace strawberry with blueberry
- Keep the same protein scoops, milk type, and all other ingredients unchanged
- Do NOT add typical ingredients or "improve" the recipe unless explicitly requested
- Example: If shake has 2 scoops protein, milk, and strawberries, and user says "shake was blueberry", keep the 2 scoops and milk exactly the same, only swap strawberries for blueberries.

Example expected JSON structure:
{
  "foods": [
    {
      "name": "Food name",
      "quantity": 1,
      "unit": "natural unit",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "sugar": 0,
      "sodium": 0
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "confidence": 0.9,
  "notes": "Any relevant observations"
}`;

/**
 * Refine meal analysis using OpenAI based on conversation history
 */
async function refineMealWithAI(messages: ChatMessage[]): Promise<any> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', // Text-only refinement, no image needed
        messages: [
          {
            role: 'system',
            content: REFINEMENT_SYSTEM_PROMPT
          },
          ...messages
        ],
        temperature: 0.2, // Low temperature for consistent, factual responses
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
    const refinedAnalysis = JSON.parse(content);
    
    return refinedAnalysis;

  } catch (error) {
    console.error('AI refinement error:', error);
    throw new Error(`Failed to refine meal analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const { mealId, correctionText }: RefineMealRequest = await req.json();

    // Validate required fields
    if (!mealId?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Meal ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!correctionText?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Correction text is required' }),
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

    console.log(`[refine-meal-analysis] Processing refinement for meal group ${mealId}: "${correctionText}"`);
    console.log(`[refine-meal-analysis] Looking up meal_entries with meal_group_id: ${mealId}`);

    // 1. Fetch all meal entries in this group and use the first one's correction history
    const { data: mealEntries, error: fetchError } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('meal_group_id', mealId);

    if (fetchError) {
      console.error('[refine-meal-analysis] Fetch error:', {
        error: fetchError,
        mealGroupId: mealId,
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details
      });
      return new Response(
        JSON.stringify({ success: false, error: 'Meal group not found', debug: { mealGroupId: mealId, fetchError } }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!mealEntries || mealEntries.length === 0) {
      console.error('[refine-meal-analysis] No meal entries found for group ID:', mealId);
      return new Response(
        JSON.stringify({ success: false, error: 'Meal group not found - no entries returned', debug: { mealGroupId: mealId } }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use the first entry's correction history (all entries in a group share the same conversation)
    const primaryEntry = mealEntries[0];
    let currentHistory: ChatMessage[] = primaryEntry.correction_history || [];
    
    console.log(`[refine-meal-analysis] Found ${mealEntries.length} meal entries in group`);

    // 2. Create the new user message
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: correctionText.trim() 
    };
    const newHistoryForAPI = [...currentHistory, userMessage];

    console.log(`[refine-meal-analysis] Current history has ${currentHistory.length} messages, adding user correction`);

    try {
      // 3. Call OpenAI with the full conversation history
      const refinedAnalysis = await refineMealWithAI(newHistoryForAPI);
      
      // 4. Create assistant message with the refined analysis
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: JSON.stringify(refinedAnalysis)
      };
      
      const updatedHistory = [...newHistoryForAPI, assistantMessage];

      // 5. Update all meal entries in the group with new analysis and history
      // First, update the shared correction history for all entries in the group
      const { error: historyUpdateError } = await supabase
        .from('meal_entries')
        .update({
          correction_history: updatedHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('meal_group_id', mealId);

      if (historyUpdateError) {
        throw new Error(`Failed to update correction history: ${historyUpdateError.message}`);
      }

      // 6. If we have individual foods in the refined analysis, we could optionally
      // update individual meal entries to match the new food breakdown
      // For now, we keep the original food breakdown but update the conversation history
      
      console.log(`[refine-meal-analysis] Successfully refined meal group ${mealId} with ${refinedAnalysis.foods?.length || 0} foods, updated ${mealEntries.length} entries`);

      // 6. Return success response
      const response: RefineMealResponse = {
        success: true,
        newAnalysis: refinedAnalysis,
        newHistory: updatedHistory,
      };

      return new Response(
        JSON.stringify(response),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (aiError) {
      console.error('[refine-meal-analysis] AI refinement failed:', aiError);
      
      // If AI fails, we don't save anything to maintain consistency
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: aiError instanceof Error ? aiError.message : 'AI refinement failed' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('[refine-meal-analysis] Error:', error);
    
    const errorResponse: RefineMealResponse = {
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
