import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Generate simple request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Cache for search results with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 15 * 60 * 1000; // 15 minutes

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: any): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.TTL
    });
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Rate limiting per user
class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS = 10; // 10 requests per minute per user

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.WINDOW_MS);
    
    if (recentRequests.length >= this.MAX_REQUESTS) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [userId, timestamps] of this.requests.entries()) {
      const recentRequests = timestamps.filter(timestamp => now - timestamp < this.WINDOW_MS);
      if (recentRequests.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, recentRequests);
      }
    }
  }
}

// Global instances for caching and rate limiting
const cache = new SimpleCache();
const rateLimiter = new RateLimiter();

// USDA API Types
interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber?: string;
  unitName: string;
  value: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
}

interface USDASearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

// Our response types matching FoodItem interface
interface FoodSearchResponse {
  foods: FoodItemResponse[];
  hasMore: boolean;
  total: number;
  page: number;
}

interface FoodItemResponse {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  verified: boolean;
}

// Request payload interface
interface SearchRequest {
  query: string;
  limit?: number;
  page?: number;
}

// Nutrient ID mappings for USDA FoodData Central
const NUTRIENT_IDS = {
  CALORIES: 208,
  PROTEIN: 203,
  FAT: 204,
  CARBS: 205,
  FIBER: 291,
  SUGAR: 269,
  SODIUM: 307
} as const;

/**
 * Normalize search query for consistent caching
 */
function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Generate cache key for search requests
 */
function getCacheKey(query: string, limit: number, page: number): string {
  const normalizedQuery = normalizeQuery(query);
  return `food-search:${normalizedQuery}:${limit}:${page}`;
}

/**
 * Extract nutrient value by ID from USDA food nutrients array
 */
function getNutrientValue(nutrients: USDANutrient[], nutrientId: number): number {
  const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
  return nutrient?.value || 0;
}

/**
 * Transform USDA food item to our FoodItem format
 */
function transformUSDAFood(usdaFood: USDAFood): FoodItemResponse {
  const nutrients = usdaFood.foodNutrients;
  
  // Default serving size handling
  let servingSize = usdaFood.servingSize || 100; // Default to 100g
  let servingUnit = usdaFood.servingSizeUnit || 'g';
  
  // Clean up serving size unit
  if (servingUnit.toLowerCase().includes('gram')) {
    servingUnit = 'g';
  } else if (servingUnit.toLowerCase().includes('ounce')) {
    servingUnit = 'oz';
  }

  return {
    id: usdaFood.fdcId.toString(),
    name: usdaFood.description,
    brand: usdaFood.brandOwner || usdaFood.brandName,
    servingSize,
    servingUnit,
    calories: getNutrientValue(nutrients, NUTRIENT_IDS.CALORIES),
    protein: getNutrientValue(nutrients, NUTRIENT_IDS.PROTEIN),
    carbs: getNutrientValue(nutrients, NUTRIENT_IDS.CARBS),
    fat: getNutrientValue(nutrients, NUTRIENT_IDS.FAT),
    fiber: getNutrientValue(nutrients, NUTRIENT_IDS.FIBER) || undefined,
    sugar: getNutrientValue(nutrients, NUTRIENT_IDS.SUGAR) || undefined,
    sodium: getNutrientValue(nutrients, NUTRIENT_IDS.SODIUM) || undefined,
    verified: usdaFood.dataType === 'SR Legacy' || usdaFood.dataType === 'Foundation', // Mark government data as verified
  };
}

/**
 * Call USDA FoodData Central API with retry logic
 */
async function searchUSDAFoods(
  query: string, 
  limit: number, 
  page: number,
  apiKey: string,
  requestId: string
): Promise<USDASearchResponse> {
  const log = (stage: string, msg: unknown) =>
    console.log(`[food-search][${requestId}][usda-api][${stage}]`, JSON.stringify(msg));

  const url = 'https://api.nal.usda.gov/fdc/v1/foods/search';
  const payload = {
    query: query,
    pageSize: limit,
    pageNumber: page,
    dataType: ['Foundation', 'SR Legacy', 'Branded'],
    sortBy: 'dataType.keyword',
    sortOrder: 'asc'
  };

  log('request', { url, payload });

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        log('error', { 
          attempt, 
          status: response.status, 
          statusText: response.statusText,
          error: errorText 
        });
        
        if (response.status === 429) {
          // Rate limit - exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          log('rate-limit-retry', { attempt, delay });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw new Error(`USDA API error ${response.status}: ${errorText}`);
      }

      const data: USDASearchResponse = await response.json();
      log('success', { 
        attempt, 
        totalHits: data.totalHits, 
        foodsReturned: data.foods?.length || 0 
      });
      
      return data;

    } catch (error) {
      lastError = error as Error;
      log('attempt-failed', { attempt, error: error.message });
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        log('retry', { attempt, delay });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to connect to USDA API after retries');
}

/**
 * Main Edge Function handler
 */
Deno.serve(async (req) => {
  const requestId = generateRequestId();
  const log = (stage: string, msg: unknown) =>
    console.log(`[food-search][${requestId}][${stage}]`, JSON.stringify(msg));

  try {
    // 1. Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    log('start', { method: req.method, url: req.url });

    // Periodic cleanup
    if (Math.random() < 0.1) { // 10% chance
      cache.cleanup();
      rateLimiter.cleanup();
    }

    // 2. Parse request payload
    let searchRequest: SearchRequest;
    try {
      searchRequest = await req.json();
      log('payload', {
        query: searchRequest.query,
        limit: searchRequest.limit,
        page: searchRequest.page
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

    // 3. Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const usdaApiKey = Deno.env.get('USDA_API_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      log('env-error', { hasUrl: !!supabaseUrl, hasServiceKey: !!serviceRoleKey });
      return new Response(
        JSON.stringify({
          stage: 'environment',
          error: 'Missing Supabase configuration',
          requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!usdaApiKey) {
      log('env-error', 'Missing USDA API key');
      return new Response(
        JSON.stringify({
          stage: 'environment',
          error: 'USDA API key not configured',
          requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Authentication
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

    // 5. Rate limiting check
    if (!rateLimiter.isAllowed(user.id)) {
      log('rate-limit-exceeded', { userId: user.id });
      return new Response(
        JSON.stringify({
          stage: 'rate-limiting',
          error: 'Rate limit exceeded. Please wait before making more requests.',
          requestId
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Input validation
    const { query, limit = 20, page = 1 } = searchRequest;

    if (!query || typeof query !== 'string') {
      log('validation-error', 'Missing or invalid query');
      return new Response(
        JSON.stringify({
          stage: 'validation',
          error: 'Query parameter is required and must be a string',
          requestId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (query.length < 1 || query.length > 100) {
      log('validation-error', { queryLength: query.length });
      return new Response(
        JSON.stringify({
          stage: 'validation',
          error: 'Query must be between 1 and 100 characters',
          requestId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (limit < 1 || limit > 50) {
      log('validation-error', { limit });
      return new Response(
        JSON.stringify({
          stage: 'validation',
          error: 'Limit must be between 1 and 50',
          requestId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (page < 1) {
      log('validation-error', { page });
      return new Response(
        JSON.stringify({
          stage: 'validation',
          error: 'Page must be 1 or greater',
          requestId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Check cache first
    const cacheKey = getCacheKey(query, limit, page);
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      log('cache-hit', { cacheKey });
      return new Response(
        JSON.stringify(cachedResult),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log('cache-miss', { cacheKey });

    // 8. Call USDA API
    let usdaResponse: USDASearchResponse;
    try {
      usdaResponse = await searchUSDAFoods(query, limit, page, usdaApiKey, requestId);
    } catch (error) {
      log('usda-api-error', { error: error.message });
      return new Response(
        JSON.stringify({
          stage: 'usda-api',
          error: 'Failed to search food database. Please try again.',
          requestId
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Transform response data
    let transformedFoods: FoodItemResponse[];
    try {
      transformedFoods = (usdaResponse.foods || []).map(transformUSDAFood);
      log('transformation-success', { 
        originalCount: usdaResponse.foods?.length || 0,
        transformedCount: transformedFoods.length
      });
    } catch (error) {
      log('transformation-error', { error: error.message });
      return new Response(
        JSON.stringify({
          stage: 'data-transformation',
          error: 'Failed to process search results',
          requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 10. Build response
    const response: FoodSearchResponse = {
      foods: transformedFoods,
      hasMore: page < (usdaResponse.totalPages || 1),
      total: usdaResponse.totalHits || 0,
      page
    };

    // 11. Cache the result
    cache.set(cacheKey, response);

    log('success', {
      foodsReturned: transformedFoods.length,
      totalAvailable: response.total,
      hasMore: response.hasMore,
      page: response.page
    });

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Top-level catch-all error handler
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