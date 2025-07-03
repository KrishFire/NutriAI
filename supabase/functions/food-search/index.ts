import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Custom error class for API errors with context
class ApiError extends Error {
  public readonly statusCode: number;
  public readonly stage: string;
  public readonly originalError?: any;

  constructor(message: string, statusCode: number, stage: string, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.stage = stage;
    this.originalError = originalError;
  }
}

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

// USDA API Types - Updated to match actual API response structure
interface USDANutrient {
  type: string; // Always "FoodNutrient"
  id: number; // Entry ID
  nutrient: {
    id: number; // Nutrient ID
    number: string; // Nutrient code (e.g., "203" for protein)
    name: string; // Nutrient name
    rank: number;
    unitName: string; // Unit (g, mg, etc.)
  };
  amount: number; // The actual nutrient value
  foodNutrientDerivation?: any; // Optional derivation info
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

// Enhanced response types with progressive disclosure and categorization
interface FoodSearchResponse {
  resultGroups: FoodResultGroup[];
  nextPageToken?: string;
  totalRemaining: number;
  suggestedQueries: SearchSuggestion[];
  meta: {
    query: string;
    totalResults: number;
    currentPage: number;
    processingTime?: number;
  };
}

interface FoodResultGroup {
  title: string;
  items: FoodItemResponse[];
  maxDisplayed?: number;
}

interface SearchSuggestion {
  displayText: string;
  query: string;
  reasoning?: string;
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
  dataType: string;
  relevanceScore?: number;
}

// Request payload interface
interface SearchRequest {
  query: string;
  limit?: number;
  page?: number;
}

// Nutrient code mappings for USDA FoodData Central (using nutrient.number field)
const NUTRIENT_CODES = {
  CALORIES: "208",
  PROTEIN: "203", 
  FAT: "204",
  CARBS: "205",
  FIBER: "291",
  SUGAR: "269",
  SODIUM: "307"
} as const;

// Search ranking configuration
const RANKING_CONFIG = {
  // Base score boosts by data type
  DATA_TYPE_SCORES: {
    'SR Legacy': 1000,      // Government nutrition data - highest priority
    'Foundation': 900,      // Scientific foundation foods  
    'Branded': 100          // Commercial products - lower priority
  },
  
  // Penalty keywords for reducing relevance of non-food items
  PENALTY_KEYWORDS: {
    'broth': 300,
    'bouillon': 350,
    'stock': 250,
    'base': 200,
    'powder': 150,
    'mix': 100,
    'seasoning': 200,
    'flavoring': 250,
    'extract': 200,
    'sauce': 50,  // Light penalty - sauces are food
    'soup': 50    // Light penalty - soups are food
  },
  
  // Search suggestion mappings
  QUERY_SUGGESTIONS: {
    'chicken': ['chicken breast', 'chicken broth', 'grilled chicken'],
    'beef': ['ground beef', 'beef steak', 'beef broth'],
    'fish': ['salmon', 'tuna', 'cod'],
    'rice': ['brown rice', 'white rice', 'rice pilaf'],
    'bread': ['whole wheat bread', 'white bread', 'sourdough'],
    'milk': ['whole milk', 'skim milk', 'almond milk'],
    'cheese': ['cheddar cheese', 'mozzarella', 'cottage cheese']
  }
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
 * Extract nutrient value by code from USDA food nutrients array
 */
function getNutrientValue(nutrients: USDANutrient[], nutrientCode: string): number {
  // Some entries may have missing nutrient info; guard against undefined properties
  for (const entry of nutrients) {
    // Ensure the nested nutrient object with a number exists before comparing
    if (entry && entry.nutrient && entry.nutrient.number === nutrientCode) {
      // Ensure amount is a finite number; fallback to 0
      return typeof entry.amount === 'number' && isFinite(entry.amount) ? entry.amount : 0;
    }
  }
  return 0;
}

/**
 * Calculate relevance score for a food item based on query and characteristics
 */
function calculateRelevanceScore(food: USDAFood, query: string): number {
  let score = 0;
  const description = food.description.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // 1. Data type boost (most important factor)
  score += RANKING_CONFIG.DATA_TYPE_SCORES[food.dataType as keyof typeof RANKING_CONFIG.DATA_TYPE_SCORES] || 0;
  
  // 2. String relevance scoring (BM25-like)
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 1);
  
  for (const word of queryWords) {
    if (description.includes(word)) {
      // Exact word match bonus
      score += 200;
      
      // Position bonus (earlier in description = more relevant)
      const position = description.indexOf(word);
      const positionBonus = Math.max(0, 100 - (position * 2));
      score += positionBonus;
      
      // Word boundary bonus (whole word matches)
      const wordBoundaryRegex = new RegExp(`\\b${word}\\b`);
      if (wordBoundaryRegex.test(description)) {
        score += 100;
      }
    }
  }
  
  // 3. Exact phrase match bonus
  if (description.includes(queryLower)) {
    score += 300;
  }
  
  // 4. Penalty for non-food keywords
  for (const [keyword, penalty] of Object.entries(RANKING_CONFIG.PENALTY_KEYWORDS)) {
    if (description.includes(keyword)) {
      score -= penalty;
    }
  }
  
  // 5. Brand penalty for generic queries (prefer unbranded basics)
  if (food.brandOwner && queryWords.length === 1 && queryWords[0].length < 8) {
    score -= 50;
  }
  
  // 6. Length penalty (shorter descriptions are often more fundamental)
  const lengthPenalty = Math.max(0, (description.length - 50) * 0.5);
  score -= lengthPenalty;
  
  return Math.max(0, score);
}

/**
 * Generate search suggestions based on query
 */
function generateSearchSuggestions(query: string): SearchSuggestion[] {
  const queryLower = query.toLowerCase().trim();
  const suggestions: SearchSuggestion[] = [];
  
  // Check for predefined suggestions
  for (const [baseQuery, variants] of Object.entries(RANKING_CONFIG.QUERY_SUGGESTIONS)) {
    if (queryLower.includes(baseQuery)) {
      for (const variant of variants) {
        if (variant !== queryLower) {
          suggestions.push({
            displayText: `Try "${variant}" instead`,
            query: variant,
            reasoning: `More specific search for ${baseQuery}`
          });
        }
      }
      break; // Only show suggestions for first match
    }
  }
  
  // If no predefined suggestions, generate generic ones
  if (suggestions.length === 0 && queryLower.length > 3) {
    suggestions.push({
      displayText: `Search for "${queryLower} cooked"`,
      query: `${queryLower} cooked`,
      reasoning: 'Find prepared versions'
    });
    
    if (!queryLower.includes('raw')) {
      suggestions.push({
        displayText: `Search for "${queryLower} raw"`,
        query: `${queryLower} raw`,
        reasoning: 'Find unprocessed versions'
      });
    }
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

/**
 * Categorize and group search results for progressive disclosure
 */
function categorizeSearchResults(foods: FoodItemResponse[]): FoodResultGroup[] {
  const groups: FoodResultGroup[] = [];
  
  // Group 1: Common Foods (SR Legacy + Foundation, top 4)
  const commonFoods = foods
    .filter(food => food.dataType === 'SR Legacy' || food.dataType === 'Foundation')
    .slice(0, 4);
  
  if (commonFoods.length > 0) {
    groups.push({
      title: 'Common Foods',
      items: commonFoods,
      maxDisplayed: 4
    });
  }
  
  // Group 2: Branded Products (top 3)
  const brandedFoods = foods
    .filter(food => food.dataType === 'Branded' && !food.name.toLowerCase().includes('broth') && !food.name.toLowerCase().includes('bouillon'))
    .slice(0, 3);
  
  if (brandedFoods.length > 0) {
    groups.push({
      title: 'Branded Products',
      items: brandedFoods,
      maxDisplayed: 3
    });
  }
  
  // Group 3: Cooking Ingredients (if query might be looking for these)
  const ingredients = foods
    .filter(food => {
      const name = food.name.toLowerCase();
      return name.includes('broth') || name.includes('stock') || name.includes('bouillon') || name.includes('base');
    })
    .slice(0, 2);
  
  if (ingredients.length > 0) {
    groups.push({
      title: 'Cooking Ingredients',
      items: ingredients,
      maxDisplayed: 2
    });
  }
  
  return groups;
}

/**
 * Transform USDA food item to our FoodItem format with relevance scoring
 */
function transformUSDAFood(usdaFood: USDAFood, query: string): FoodItemResponse {
  const nutrients: USDANutrient[] = Array.isArray(usdaFood.foodNutrients) ? usdaFood.foodNutrients : [];
  
  // Default serving size handling
  let servingSize = usdaFood.servingSize || 100; // Default to 100g
  let servingUnit = usdaFood.servingSizeUnit || 'g';
  
  // Clean up serving size unit
  if (servingUnit.toLowerCase().includes('gram')) {
    servingUnit = 'g';
  } else if (servingUnit.toLowerCase().includes('ounce')) {
    servingUnit = 'oz';
  }

  const relevanceScore = calculateRelevanceScore(usdaFood, query);

  return {
    id: usdaFood.fdcId.toString(),
    name: usdaFood.description,
    brand: usdaFood.brandOwner || usdaFood.brandName,
    servingSize,
    servingUnit,
    calories: getNutrientValue(nutrients, NUTRIENT_CODES.CALORIES),
    protein: getNutrientValue(nutrients, NUTRIENT_CODES.PROTEIN),
    carbs: getNutrientValue(nutrients, NUTRIENT_CODES.CARBS),
    fat: getNutrientValue(nutrients, NUTRIENT_CODES.FAT),
    fiber: getNutrientValue(nutrients, NUTRIENT_CODES.FIBER) || undefined,
    sugar: getNutrientValue(nutrients, NUTRIENT_CODES.SUGAR) || undefined,
    sodium: getNutrientValue(nutrients, NUTRIENT_CODES.SODIUM) || undefined,
    verified: usdaFood.dataType === 'SR Legacy' || usdaFood.dataType === 'Foundation',
    dataType: usdaFood.dataType,
    relevanceScore
  };
}

/**
 * Call USDA FoodData Central API with retry logic and enhanced error handling
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
  
  // Request more results than needed so we can apply sophisticated ranking
  // We'll rank and filter on our end for better UX
  const searchLimit = Math.min(limit * 4, 200); // Request 4x more for ranking, cap at 200
  
  const payload = {
    query: query,
    pageSize: searchLimit,
    pageNumber: 1, // Always get first page for ranking
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
        
        // Throw structured error with status code preserved
        throw new ApiError(
          `USDA API error: ${errorText}`,
          response.status,
          'usda-api',
          { errorText, statusText: response.statusText }
        );
      }

      const data: USDASearchResponse = await response.json();
      log('success', { 
        attempt, 
        totalHits: data.totalHits, 
        foodsReturned: data.foods?.length || 0 
      });
      
      return data;

    } catch (error) {
      // If it's already an ApiError, preserve it
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Otherwise, wrap it
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

  // All retries failed - throw network error
  throw new ApiError(
    'Failed to connect to USDA API after retries',
    503,
    'usda-api-network',
    lastError
  );
}

/**
 * Main Edge Function handler with enhanced error handling and detailed step tracing
 */
Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const log = (stage: string, msg: unknown) =>
    console.log(`[food-search][${requestId}][${stage}]`, JSON.stringify(msg));

  // Track progress through the handler so that fatal errors can reveal where we stopped
  let currentStage = 'init';
  const checkpoint = (stage: string, extra?: unknown) => {
    currentStage = stage;
    log(stage, extra || 'checkpoint');
  };

  try {
    // 1. Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    checkpoint('start', { method: req.method, url: req.url });

    // Periodic cleanup
    if (Math.random() < 0.1) { // 10% chance
      cache.cleanup();
      rateLimiter.cleanup();
    }

    // 2. Parse request payload
    checkpoint('parse-payload-start');
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
          error: 'Invalid request format',
          details: {
            stage: 'payload-parsing',
            message: 'Request body must be valid JSON',
            requestId
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Validate environment variables
    checkpoint('env-check-start');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const usdaApiKey = Deno.env.get('USDA_API_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      log('env-error', { hasUrl: !!supabaseUrl, hasServiceKey: !!serviceRoleKey });
      return new Response(
        JSON.stringify({
          error: 'Service configuration error',
          details: {
            stage: 'environment',
            message: 'The service is not properly configured. Please contact support.',
            requestId
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!usdaApiKey) {
      log('env-error', 'Missing USDA API key');
      return new Response(
        JSON.stringify({
          error: 'Service configuration error',
          details: {
            stage: 'environment',
            message: 'Food database access is not configured. Please contact support.',
            requestId
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Authentication
    checkpoint('auth-start');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      log('auth-error', 'Missing Authorization header');
      return new Response(
        JSON.stringify({
          error: 'Authentication required',
          details: {
            stage: 'authorization',
            message: 'Please provide a valid authentication token',
            requestId
          }
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
            error: 'Authentication failed',
            details: {
              stage: 'authentication',
              message: 'Your session has expired. Please log in again.',
              requestId
            }
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
          error: 'Authentication service error',
          details: {
            stage: 'authentication',
            message: 'Unable to verify your identity. Please try again.',
            requestId
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Rate limiting check
    checkpoint('rate-limit');
    if (!rateLimiter.isAllowed(user.id)) {
      log('rate-limit-exceeded', { userId: user.id });
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          details: {
            stage: 'rate-limiting',
            message: 'You have exceeded the rate limit. Please wait a minute before trying again.',
            requestId
          }
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Input validation
    checkpoint('input-validation');
    const { query, limit = 20, page = 1 } = searchRequest;

    if (!query || typeof query !== 'string') {
      log('validation-error', 'Missing or invalid query');
      return new Response(
        JSON.stringify({
          error: 'Invalid search query',
          details: {
            stage: 'validation',
            message: 'Please provide a search term',
            requestId
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (query.length < 1 || query.length > 100) {
      log('validation-error', { queryLength: query.length });
      return new Response(
        JSON.stringify({
          error: 'Invalid search query',
          details: {
            stage: 'validation',
            message: 'Search term must be between 1 and 100 characters',
            requestId
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (limit < 1 || limit > 50) {
      log('validation-error', { limit });
      return new Response(
        JSON.stringify({
          error: 'Invalid limit parameter',
          details: {
            stage: 'validation',
            message: 'Limit must be between 1 and 50',
            requestId
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (page < 1) {
      log('validation-error', { page });
      return new Response(
        JSON.stringify({
          error: 'Invalid page parameter',
          details: {
            stage: 'validation',
            message: 'Page number must be 1 or greater',
            requestId
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Check cache first
    checkpoint('cache-check');
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

    // 8. Call USDA API with enhanced error handling
    checkpoint('usda-api-call');
    let usdaResponse: USDASearchResponse;
    try {
      usdaResponse = await searchUSDAFoods(query, limit, page, usdaApiKey, requestId);
    } catch (error) {
      if (error instanceof ApiError) {
        log('usda-api-error', { 
          stage: error.stage,
          statusCode: error.statusCode,
          message: error.message 
        });
        
        // Map USDA status codes to appropriate client responses
        let responseStatus = 502; // Default to Bad Gateway
        let userMessage = 'Unable to search food database. Please try again later.';
        
        switch (error.statusCode) {
          case 400:
            responseStatus = 400;
            userMessage = 'Invalid search query. Please check your input and try again.';
            break;
          case 401:
          case 403:
            // Don't expose API key issues to client
            responseStatus = 502;
            userMessage = 'Food database access error. Our team has been notified.';
            break;
          case 429:
            responseStatus = 429;
            userMessage = 'Food database rate limit exceeded. Please try again in a few minutes.';
            break;
          case 404:
            responseStatus = 404;
            userMessage = 'No foods found matching your search.';
            break;
          case 503:
            responseStatus = 503;
            userMessage = 'Food database is temporarily unavailable. Please try again later.';
            break;
        }
        
        return new Response(
          JSON.stringify({
            error: 'Food search failed',
            details: {
              stage: error.stage,
              message: userMessage,
              requestId,
              ...(error.statusCode === 429 ? { retryAfter: 60 } : {})
            }
          }),
          { status: responseStatus, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Unexpected error
      log('usda-api-unexpected-error', { error: error.message });
      return new Response(
        JSON.stringify({
          error: 'Food search error',
          details: {
            stage: 'usda-api',
            message: 'An unexpected error occurred while searching. Please try again.',
            requestId
          }
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 9. Transform and rank response data
    checkpoint('transform-start');
    let transformedFoods: FoodItemResponse[];
    try {
      // Transform all foods with relevance scoring
      transformedFoods = (usdaResponse.foods || []).map(food => transformUSDAFood(food, query));
      
      // Sort by relevance score (highest first)
      transformedFoods.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      
      log('transformation-success', { 
        originalCount: usdaResponse.foods?.length || 0,
        transformedCount: transformedFoods.length,
        topScores: transformedFoods.slice(0, 5).map(f => ({ name: f.name, score: f.relevanceScore }))
      });
    } catch (error) {
      log('transformation-error', { error: error.message });
      return new Response(
        JSON.stringify({
          error: 'Data processing error',
          details: {
            stage: 'data-transformation',
            message: 'Failed to process search results. Please try again.',
            requestId
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 10. Categorize results for progressive disclosure
    checkpoint('categorize-start');
    const resultGroups = categorizeSearchResults(transformedFoods);
    const displayedCount = resultGroups.reduce((sum, group) => sum + group.items.length, 0);
    const totalRemaining = Math.max(0, transformedFoods.length - displayedCount);
    
    // 11. Generate search suggestions
    checkpoint('suggestions');
    const suggestedQueries = generateSearchSuggestions(query);
    
    // 12. Build structured response
    checkpoint('build-response');
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    const response: FoodSearchResponse = {
      resultGroups,
      nextPageToken: totalRemaining > 0 ? `page_${page + 1}` : undefined,
      totalRemaining,
      suggestedQueries,
      meta: {
        query,
        totalResults: usdaResponse.totalHits || 0,
        currentPage: page,
        processingTime
      }
    };

    // 13. Cache the result
    checkpoint('cache-save');
    cache.set(cacheKey, response);

    checkpoint('success', {
      foodsReturned: transformedFoods.length,
      displayedCount,
      totalRemaining,
      groupCount: resultGroups.length,
      suggestions: suggestedQueries.length,
      processingTime: `${processingTime}ms`
    });

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Top-level catch-all error handler
    log('fatal-error', {
      atStage: currentStage,
      error: error.message,
      stack: error.stack?.slice(0, 500)
    });

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: {
          stage: 'fatal',
          lastStage: currentStage,
          message: 'An unexpected error occurred. Our team has been notified.',
          requestId
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});