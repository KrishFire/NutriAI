import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Enhanced CORS headers with debug support
const debugCorsHeaders = {
  ...corsHeaders,
  'Access-Control-Expose-Headers': 'X-Request-ID, X-Auth-Status, Server-Timing, X-Debug-Info',
};

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

// Helper function to create standardized API responses with debug headers
function createApiResponse(
  body: any,
  status: number,
  requestId: string,
  startTime: number,
  headers: Record<string, string> = {},
  debugInfo?: any
) {
  const isDebugMode = headers['X-Debug-Mode'] === 'true';
  const responseHeaders = {
    ...debugCorsHeaders,
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
    'Server-Timing': `total;dur=${Date.now() - startTime}`,
    ...headers,
  };

  // Add debug info to body if in debug mode
  const responseBody = isDebugMode && debugInfo
    ? { ...body, _debug: debugInfo }
    : body;

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: responseHeaders,
  });
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const isDebugMode = req.headers.get('X-Debug-Mode') === 'true';
  const log = (stage: string, msg: unknown) =>
    console.log(`[analyze-meal][${requestId}][${stage}]`, JSON.stringify(msg));
  
  try {
    // 1. Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: debugCorsHeaders });
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
      return createApiResponse(
        { 
          stage: 'payload-parsing',
          error: 'Invalid or empty JSON payload',
          requestId
        },
        400,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Pre-Auth' },
        isDebugMode ? { errorDetail: error.message } : undefined
      );
    }

    // 3. Environment variable validation (fail-fast)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      log('env-error', { hasUrl: !!supabaseUrl, hasServiceKey: !!serviceRoleKey });
      return createApiResponse(
        { 
          stage: 'environment',
          error: 'Missing environment configuration',
          requestId
        },
        500,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Pre-Auth' },
        isDebugMode ? { missingVars: { hasUrl: !!supabaseUrl, hasServiceKey: !!serviceRoleKey } } : undefined
      );
    }

    // 4. Authorization header validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      log('auth-error', 'Missing Authorization header');
      return createApiResponse(
        { 
          stage: 'authorization',
          error: 'Missing Authorization header',
          requestId
        },
        401,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Missing-Token' }
      );
    }

    // Validate auth header format
    if (!authHeader.startsWith('Bearer ')) {
      log('auth-error', 'Malformed Authorization header');
      return createApiResponse(
        { 
          stage: 'authorization',
          error: 'Malformed Authorization header - must use Bearer scheme',
          requestId
        },
        401,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Malformed-Token' },
        isDebugMode ? { receivedPrefix: authHeader.substring(0, 10) } : undefined
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
        log('auth-validation-error', { error: userError?.message, code: userError?.code });
        
        // Determine specific auth failure reason
        let authStatus = 'Invalid-Token';
        if (userError?.message?.includes('expired')) {
          authStatus = 'Expired-Token';
        } else if (userError?.message?.includes('malformed')) {
          authStatus = 'Malformed-JWT';
        } else if (userError?.code === 'PGRST301') {
          authStatus = 'Invalid-Signature';
        }
        
        return createApiResponse(
          { 
            stage: 'authentication',
            error: 'Invalid or expired token',
            requestId,
            details: userError?.message || 'Token validation failed'
          },
          401,
          requestId,
          startTime,
          { 'X-Auth-Status': authStatus },
          isDebugMode ? { 
            errorCode: userError?.code,
            errorMessage: userError?.message,
            authTiming: Date.now() - startTime
          } : undefined
        );
      }
      
      user = authUser;
      log('auth-success', { userId: user.id });
    } catch (error) {
      log('auth-fatal', { error: error.message });
      return createApiResponse(
        { 
          stage: 'authentication',
          error: 'Authentication system error',
          requestId
        },
        500,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Auth-System-Error' },
        isDebugMode ? { 
          errorType: error.name,
          errorMessage: error.message,
          stack: error.stack?.slice(0, 500)
        } : undefined
      );
    }

    // 6. Get data from the payload and validate business logic
    const { imageUrl, imageBase64, voiceTranscription } = requestPayload;

    if (!imageUrl && !imageBase64) {
      log('validation-error', 'No image provided');
      return createApiResponse(
        { 
          stage: 'validation',
          error: 'Either imageUrl or imageBase64 must be provided',
          requestId
        },
        400,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Authenticated' },
        isDebugMode ? { userId: user.id, timing: Date.now() - startTime } : undefined
      );
    }

    // 7. Validate OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      log('openai-config-error', 'Missing OpenAI API key');
      return createApiResponse(
        { 
          stage: 'openai-config',
          error: 'OpenAI API key not configured',
          requestId
        },
        500,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Authenticated' }
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
        return createApiResponse(
          { 
            stage: 'validation',
            error: 'Invalid imageBase64 format. Must be a data URI starting with data:image/',
            requestId
          },
          400,
          requestId,
          startTime,
          { 'X-Auth-Status': 'Authenticated' }
        );
      }
      
      // Check if the base64 string might be too large (rough estimate)
      // Base64 adds ~33% overhead, so 20MB limit becomes ~15MB raw data
      if (imageBase64.length > 20000000) {
        return createApiResponse(
          { 
            stage: 'validation',
            error: 'Image too large. Please use a smaller image (under 15MB).',
            requestId,
            imageSizeMB: Math.round(imageBase64.length / 1048576)
          },
          400,
          requestId,
          startTime,
          { 'X-Auth-Status': 'Authenticated' }
        );
      }
      
      imageUrlForApi = imageBase64;
      console.log('Using base64 data URI for OpenAI API');
    } else {
      // This should never happen due to earlier validation, but as a safeguard
      return createApiResponse(
        { 
          stage: 'validation',
          error: 'No image provided.',
          requestId
        },
        400,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Authenticated' }
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
      model: 'gpt-4.1-mini',
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
      return createApiResponse(
        { 
          stage: 'openai-fetch',
          error: 'Failed to connect to OpenAI API',
          requestId
        },
        502,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Authenticated' },
        isDebugMode ? { 
          errorType: error.name,
          errorMessage: error.message,
          timing: Date.now() - startTime
        } : undefined
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
      
      return createApiResponse(
        { 
          stage: 'openai',
          statusCode: openAIResponse.status,
          message: errorMessage,
          requestId
        },
        502,
        requestId,
        startTime,
        { 
          'X-Auth-Status': 'Authenticated',
          'X-OpenAI-Status': openAIResponse.status.toString()
        },
        isDebugMode ? { 
          openAIResponseHeaders: Object.fromEntries(openAIResponse.headers.entries()),
          timing: Date.now() - startTime
        } : undefined
      );
    }

    // Safely parse successful OpenAI response
    let responseData: any;
    let content: string;
    try {
      const safeResponse = await safeJsonOrText(openAIResponse);
      if (!safeResponse.isJson) {
        log('openai-response-not-json', { body: safeResponse.body });
        return createApiResponse(
          { 
            stage: 'openai-response',
            error: 'OpenAI returned non-JSON response',
            requestId
          },
          502,
          requestId,
          startTime,
          { 'X-Auth-Status': 'Authenticated' },
          isDebugMode ? { responseSnippet: safeResponse.body?.slice(0, 200) } : undefined
        );
      }
      
      responseData = safeResponse.body;
      content = responseData.choices?.[0]?.message?.content;
      
      if (!content) {
        log('openai-empty-content', responseData);
        return createApiResponse(
          { 
            stage: 'openai-response',
            error: 'OpenAI returned empty content',
            requestId
          },
          502,
          requestId,
          startTime,
          { 'X-Auth-Status': 'Authenticated' },
          isDebugMode ? { openAIResponse: responseData } : undefined
        );
      }
      
      log('openai-success', { contentLength: content.length });
    } catch (error) {
      log('openai-parse-error', { error: error.message });
      return createApiResponse(
        { 
          stage: 'openai-response',
          error: 'Failed to parse OpenAI response',
          requestId
        },
        502,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Authenticated' },
        isDebugMode ? { 
          errorType: error.name,
          errorMessage: error.message
        } : undefined
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

      // Success response with debug timing
      return createApiResponse(
        mealAnalysis,
        200,
        requestId,
        startTime,
        { 
          'X-Auth-Status': 'Authenticated',
          'X-Processing-Status': 'Success'
        },
        isDebugMode ? { 
          processingTimeMs: Date.now() - startTime,
          foodCount: mealAnalysis.foods.length,
          totalCalories: mealAnalysis.totalNutrition.calories,
          confidence: mealAnalysis.confidence
        } : undefined
      );

    } catch (parseError) {
      log('meal-analysis-parse-error', { 
        error: parseError.message, 
        contentSnippet: content.slice(0, 200)
      });
      
      return createApiResponse(
        { 
          stage: 'meal-analysis-parse',
          error: 'Failed to parse meal analysis from OpenAI response',
          requestId
        },
        500,
        requestId,
        startTime,
        { 'X-Auth-Status': 'Authenticated' },
        isDebugMode ? { 
          parseError: parseError.message,
          contentSnippet: content.slice(0, 200)
        } : undefined
      );
    }

  } catch (error) {
    // Top-level catch-all error handler
    // This catches ANY unexpected error that wasn't handled above
    log('fatal-error', { 
      error: error.message, 
      stack: error.stack?.slice(0, 500)
    });
    
    return createApiResponse(
      { 
        stage: 'fatal',
        error: 'Unhandled server error occurred',
        requestId
      },
      500,
      requestId,
      startTime,
      { 'X-Auth-Status': 'Unknown' },
      isDebugMode ? { 
        errorType: error.name,
        errorMessage: error.message,
        stack: error.stack?.slice(0, 500),
        timing: Date.now() - startTime
      } : undefined
    );
  }
});