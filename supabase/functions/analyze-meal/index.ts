import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Helper: safely read JSON or text from response
async function safeJsonOrText(res: Response): Promise<{ isJson: boolean; body: any }> {
  const contentType = res.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const body = await res.json();
      return { isJson: true, body };
    } else {
      const body = await res.text();
      return { isJson: false, body };
    }
  } catch (error) {
    // Fallback to text if JSON parsing fails
    const body = await res.text();
    return { isJson: false, body };
  }
}

// Generate simple request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface RequestPayload {
  imageUrl?: string;
  imageBase64?: string;
  voiceTranscription?: string;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface FoodItem {
  name: string;
  quantity: string;
  nutrition: NutritionData;
  confidence: number;
}

interface MealAnalysis {
  foods: FoodItem[];
  totalNutrition: NutritionData;
  confidence: number;
  notes?: string;
}

const NUTRITION_ANALYSIS_PROMPT = `You are an expert nutrition analysis AI. Analyze the provided meal image and provide detailed nutrition information.

Your response MUST be a single, valid JSON object and nothing else. Do not include any explanatory text, markdown formatting, or comments before or after the JSON object.

The JSON object must conform to this exact structure:
{
  "foods": [
    {
      "name": "Food item name",
      "quantity": "Estimated portion size (e.g., '1 cup', '150g', '1 medium')",
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number
      },
      "confidence": number (0-1, how confident you are in this identification)
    }
  ],
  "totalNutrition": {
    "calories": total_calories,
    "protein": total_protein,
    "carbs": total_carbs,
    "fat": total_fat,
    "fiber": total_fiber,
    "sugar": total_sugar,
    "sodium": total_sodium
  },
  "confidence": overall_confidence (0-1),
  "notes": "Any relevant observations about the meal"
}

Guidelines:
- Be as accurate as possible with portion estimates
- Include all visible food items
- Provide nutrition values in grams (except calories)
- Consider cooking methods that affect nutrition
- Note if portion sizes are difficult to estimate
- Only include foods you can clearly identify
- If unsure, use lower confidence scores`;

Deno.serve(async (req) => {
  const requestId = generateRequestId();
  const log = (stage: string, msg: unknown) =>
    console.log(`[analyze-meal][${requestId}][${stage}]`, JSON.stringify(msg));
  
  try {
    // 1. Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    log('start', { method: req.method, url: req.url });

    // 2. Read request body FIRST (critical - can only read once)
    let requestPayload: RequestPayload;
    try {
      requestPayload = await req.json();
      log('payload', { 
        hasImageUrl: !!requestPayload.imageUrl,
        hasImageBase64: !!requestPayload.imageBase64,
        imageBase64Length: requestPayload.imageBase64?.length,
        hasVoice: !!requestPayload.voiceTranscription
      });
    } catch (error) {
      log('payload-error', { error: error.message });
      return new Response(
        JSON.stringify({ 
          stage: 'payload-parsing',
          error: 'Invalid or empty JSON payload',
          requestId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Environment variable validation (fail-fast)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      log('env-error', { hasUrl: !!supabaseUrl, hasServiceKey: !!serviceRoleKey });
      return new Response(
        JSON.stringify({ 
          stage: 'environment',
          error: 'Missing environment configuration',
          requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Authorization header validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      log('auth-error', 'Missing Authorization header');
      return new Response(
        JSON.stringify({ 
          stage: 'authorization',
          error: 'Missing Authorization header',
          requestId
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Create Supabase client and authenticate the user
    let user: any;
    try {
      const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser();

      if (userError || !authUser) {
        log('auth-validation-error', { error: userError?.message });
        return new Response(
          JSON.stringify({ 
            stage: 'authentication',
            error: 'Invalid or expired token',
            requestId
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      user = authUser;
      log('auth-success', { userId: user.id });
    } catch (error) {
      log('auth-fatal', { error: error.message });
      return new Response(
        JSON.stringify({ 
          stage: 'authentication',
          error: 'Authentication system error',
          requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Get data from the payload and validate business logic
    const { imageUrl, imageBase64, voiceTranscription } = requestPayload;

    if (!imageUrl && !imageBase64) {
      log('validation-error', 'No image provided');
      return new Response(
        JSON.stringify({ 
          stage: 'validation',
          error: 'Either imageUrl or imageBase64 must be provided',
          requestId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Validate OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      log('openai-config-error', 'Missing OpenAI API key');
      return new Response(
        JSON.stringify({ 
          stage: 'openai-config',
          error: 'OpenAI API key not configured',
          requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Validate and prepare image data
    let imageUrlForApi: string;
    
    if (imageUrl) {
      imageUrlForApi = imageUrl;
      console.log('Using image URL for OpenAI API');
    } else if (imageBase64) {
      // Log the size of the base64 string to check against OpenAI's 20MB limit
      console.log(`Received imageBase64 with length: ${imageBase64.length}`);
      
      // Validate that it's a proper data URI
      if (!imageBase64.startsWith('data:image/')) {
        return new Response(
          JSON.stringify({ error: 'Invalid imageBase64 format. Must be a data URI starting with data:image/' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if the base64 string might be too large (rough estimate)
      // Base64 adds ~33% overhead, so 20MB limit becomes ~15MB raw data
      if (imageBase64.length > 20000000) {
        return new Response(
          JSON.stringify({ error: 'Image too large. Please use a smaller image (under 15MB).' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      imageUrlForApi = imageBase64;
      console.log('Using base64 data URI for OpenAI API');
    } else {
      // This should never happen due to earlier validation, but as a safeguard
      return new Response(
        JSON.stringify({ error: 'No image provided.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Construct the OpenAI API payload
    let userPrompt = NUTRITION_ANALYSIS_PROMPT;
    if (voiceTranscription) {
      userPrompt += `\n\nADDITIONAL CONTEXT FROM USER:\n"${voiceTranscription}"\n\nUse this voice context to better identify foods and portion sizes in the image.`;
    }

    const imageContent = { 
      type: 'image_url', 
      image_url: { url: imageUrlForApi, detail: 'high' } 
    };

    const openAIPayload = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            imageContent,
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.1,
    };

    // 10. Call OpenAI API
    log('openai-request', { model: openAIPayload.model, hasImage: true });
    
    let openAIResponse: Response;
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openAIPayload),
      });
    } catch (error) {
      log('openai-fetch-error', { error: error.message });
      return new Response(
        JSON.stringify({ 
          stage: 'openai-fetch',
          error: 'Failed to connect to OpenAI API',
          requestId
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIResponse.ok) {
      // CRITICAL FIX: Safely handle OpenAI error responses (often plain text)
      const safeResponse = await safeJsonOrText(openAIResponse);
      const errorMessage = typeof safeResponse.body === 'string' 
        ? safeResponse.body.slice(0, 300) 
        : safeResponse.body;
      
      log('openai-error', { 
        status: openAIResponse.status, 
        isJson: safeResponse.isJson,
        error: errorMessage
      });
      
      return new Response(
        JSON.stringify({ 
          stage: 'openai',
          statusCode: openAIResponse.status,
          message: errorMessage,
          requestId
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Safely parse successful OpenAI response
    let responseData: any;
    let content: string;
    try {
      const safeResponse = await safeJsonOrText(openAIResponse);
      if (!safeResponse.isJson) {
        log('openai-response-not-json', { body: safeResponse.body });
        return new Response(
          JSON.stringify({ 
            stage: 'openai-response',
            error: 'OpenAI returned non-JSON response',
            requestId
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      responseData = safeResponse.body;
      content = responseData.choices?.[0]?.message?.content;
      
      if (!content) {
        log('openai-empty-content', responseData);
        return new Response(
          JSON.stringify({ 
            stage: 'openai-response',
            error: 'OpenAI returned empty content',
            requestId
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      log('openai-success', { contentLength: content.length });
    } catch (error) {
      log('openai-parse-error', { error: error.message });
      return new Response(
        JSON.stringify({ 
          stage: 'openai-response',
          error: 'Failed to parse OpenAI response',
          requestId
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 11. Parse and validate JSON response
    let mealAnalysis: MealAnalysis;
    try {
      // Try to extract JSON from the response
      let jsonContent = content.trim();
      
      // If response starts with markdown code block, extract the JSON
      const jsonMatch = jsonContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }

      log('meal-analysis-parse', { originalLength: content.length, jsonLength: jsonContent.length });
      
      mealAnalysis = JSON.parse(jsonContent);

      // Validate required fields
      if (!mealAnalysis.foods || !Array.isArray(mealAnalysis.foods)) {
        throw new Error('Invalid response format: missing foods array');
      }

      if (!mealAnalysis.totalNutrition) {
        throw new Error('Invalid response format: missing totalNutrition');
      }

      // Ensure confidence is a number between 0 and 1
      if (typeof mealAnalysis.confidence !== 'number') {
        mealAnalysis.confidence = 0.5; // Default confidence
      }

      log('success', { 
        foodCount: mealAnalysis.foods.length, 
        confidence: mealAnalysis.confidence,
        totalCalories: mealAnalysis.totalNutrition.calories
      });

      return new Response(
        JSON.stringify(mealAnalysis),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (parseError) {
      log('meal-analysis-parse-error', { 
        error: parseError.message, 
        contentSnippet: content.slice(0, 200)
      });
      
      return new Response(
        JSON.stringify({ 
          stage: 'meal-analysis-parse',
          error: 'Failed to parse meal analysis from OpenAI response',
          requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    // Top-level catch-all error handler
    // This catches ANY unexpected error that wasn't handled above
    log('fatal-error', { 
      error: error.message, 
      stack: error.stack?.slice(0, 500)
    });
    
    return new Response(
      JSON.stringify({ 
        stage: 'fatal',
        error: 'Unhandled server error occurred',
        requestId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});