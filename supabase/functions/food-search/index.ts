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
  // Include full foods list for client-side progressive loading
  allFoods?: FoodItemResponse[];
  meta: {
    query: string;
    totalResults: number;
    currentPage: number;
    processingTime?: number;
    totalAvailable?: number;
    initialDisplayed?: number;
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
  // Base score boosts by data type (prioritizing Foundation per GPT-o3's strategy)
  DATA_TYPE_SCORES: {
    'Foundation': 1000,     // Primary generics (1k items) - highest priority
    'SR Legacy': 900,       // Fallback generics (7k items)
    'Survey (FNDDS)': 500,  // Mixed dishes (26k items) 
    'Branded': 100          // Commercial products (430k items) - only on brand intent
  },
  
  // Brand intent detection keywords
  BRAND_KEYWORDS: [
    'mcdonald', 'mcdonalds', 'burger king', 'kfc', 'taco bell', 'subway',
    'starbucks', 'dunkin', 'pizza hut', 'dominos', 'papa johns',
    'tyson', 'perdue', 'foster farms', 'oscar mayer', 'hebrew national',
    'kraft', 'heinz', 'campbells', 'progresso', 'hunts',
    'lays', 'doritos', 'cheetos', 'pringles', 'ruffles',
    'coca cola', 'pepsi', 'sprite', 'fanta', 'dr pepper',
    'nestle', 'hershey', 'mars', 'snickers', 'kit kat',
    'kellogg', 'general mills', 'quaker', 'post', 'nabisco'
  ],
  
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
    'soup': 50,   // Light penalty - soups are food
    // NEW: processed food penalties
    'juice': 300,
    'spread': 300,
    'canned': 150,
    'bottled': 150,
    'unsweetened': 100,
    'sweetened': 200,
    'concentrate': 250,
    'frozen': 50,    // Light penalty - frozen can be good
    'dried': 75,     // Light penalty - dried can be good
    // NEW: problematic food parts and processed items
    'feet': 400,     // Chicken feet should not be top results
    'giblets': 400,  // Organ meats are niche
    'organ': 300,    // General organ penalty
    'offal': 400,    // Organ meat penalty
    'ground': 200,   // Ground versions are less common for basic searches
    'meatless': 300  // Meat substitutes should be clearly marked
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
 * Detect brand intent in search query using GPT-o3's strategy
 */
function detectBrandIntent(query: string): boolean {
  const queryLower = normalizeQuery(query);
  
  // Check for explicit brand keywords
  for (const brand of RANKING_CONFIG.BRAND_KEYWORDS) {
    if (queryLower.includes(brand.toLowerCase())) {
      return true;
    }
  }
  
  // Check for uppercase words longer than 2 characters (likely brand names)
  const words = query.split(/\s+/);
  for (const word of words) {
    if (word.length > 2 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) {
      return true;
    }
  }
  
  return false;
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
  for (const entry of nutrients) {
    if (!entry) continue;

    // Two possible shapes:
    // 1. Search API: { nutrientNumber: "208", value: 239, unitName: "kcal" }
    // 2. Details API: { nutrient: { number: "208", ... }, amount: 239 }

    // Shape 1 – flat
    // @ts-ignore – runtime check for optional field
    if (entry.nutrientNumber === nutrientCode) {
      // @ts-ignore – value field only in search payload
      const val = entry.value ?? entry.amount;
      return typeof val === 'number' && isFinite(val) ? val : 0;
    }

    // Shape 2 – nested
    if (entry.nutrient && entry.nutrient.number === nutrientCode) {
      const val = entry.amount;
      return typeof val === 'number' && isFinite(val) ? val : 0;
    }
  }
  return 0;
}

/**
 * HYBRID RELEVANCE SCORING MODEL
 * Uses USDA's original ranking as base score with gentle multiplicative modifiers.
 * This preserves USDA's sophisticated ranking while allowing targeted adjustments.
 */
function calculateRelevanceScore(
  food: USDAFood, 
  query: string, 
  index: number, 
  totalResults: number
): number {
  // 1. Base score from USDA's rank - preserves their sophisticated relevance algorithm
  let score = totalResults - index;
  
  const description = food.description.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // 2. Conservative data type multipliers (gentle nudges, not sledgehammers)
  const dataTypeMultipliers = {
    'Foundation': 1.05,       // 5% boost - highest quality generic foods
    'SR Legacy': 1.02,        // 2% boost - established generic foods
    'Survey (FNDDS)': 1.0,    // Neutral - mixed dishes
    'Branded': 0.98           // 2% penalty - prioritize generics for basic searches
  };
  
  const multiplier = dataTypeMultipliers[food.dataType as keyof typeof dataTypeMultipliers] || 1.0;
  score *= multiplier;
  
  // 3. Small bonus for exact prefix match (users often type incrementally)
  if (description.startsWith(queryLower)) {
    score *= 1.05; // 5% boost
  }
  
  // 4. Penalty for undesirable food parts/preparations
  const penaltyKeywords = ['feet', 'giblets', 'neck', 'back', 'gizzard', 'offal'];
  const hasPenaltyKeyword = penaltyKeywords.some(keyword => description.includes(keyword));
  if (hasPenaltyKeyword) {
    score *= 0.80; // 20% penalty
  }
  
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
 * Updated for GPT-o3's prioritized data type strategy
 */
function categorizeSearchResults(foods: FoodItemResponse[], query: string): FoodResultGroup[] {
  const groups: FoodResultGroup[] = [];
  
  // Check if this is a branded search using our brand intent detection
  const hasBrandIntent = detectBrandIntent(query);
  
  if (hasBrandIntent) {
    // For branded searches, prioritize branded items first
    const brandedMatches = foods
      .filter(food => food.dataType === 'Branded')
      .slice(0, 6); // Show more branded items when intent is detected
    
    if (brandedMatches.length > 0) {
      groups.push({
        title: 'Best Matches',
        items: brandedMatches,
        maxDisplayed: 6
      });
    }
    
    // Show Foundation/SR Legacy as alternatives (2-3 items)
    const genericAlternatives = foods
      .filter(food => food.dataType === 'Foundation' || food.dataType === 'SR Legacy')
      .slice(0, 3);
    
    if (genericAlternatives.length > 0) {
      groups.push({
        title: 'Generic Alternatives',
        items: genericAlternatives,
        maxDisplayed: 3
      });
    }
  } else {
    // For generic searches, prioritize Foundation then SR Legacy
    const foundationFoods = foods.filter(f => f.dataType === 'Foundation');
    const srLegacyFoods = foods.filter(f => f.dataType === 'SR Legacy');
    const surveyFoods = foods.filter(f => f.dataType === 'Survey (FNDDS)');
    const brandedFoods = foods.filter(f => f.dataType === 'Branded');
    
    // Best Matches: Top Foundation + SR Legacy (prioritizing Foundation)
    const bestMatches = [
      ...foundationFoods.slice(0, 3),
      ...srLegacyFoods.slice(0, 2)
    ].slice(0, 4); // Cap at 4 total
    
    if (bestMatches.length > 0) {
      groups.push({
        title: 'Best Matches',
        items: bestMatches,
        maxDisplayed: 4
      });
    }
    
    // Remaining Foundation and SR Legacy foods
    const remainingGenerics = [
      ...foundationFoods.slice(3),
      ...srLegacyFoods.slice(2)
    ];
    
    if (remainingGenerics.length > 0) {
      groups.push({
        title: `More Results (${remainingGenerics.length} items)`,
        items: [], // Empty - will be loaded on demand
        maxDisplayed: 0
      });
    }
    
    // Survey foods (mixed dishes) as separate group
    if (surveyFoods.length > 0) {
      groups.push({
        title: `Mixed Dishes (${surveyFoods.length} items)`,
        items: [], // Empty - will be loaded on demand
        maxDisplayed: 0
      });
    }
    
    // Branded foods only if we fetched them (due to low generic results)
    if (brandedFoods.length > 0) {
      groups.push({
        title: `Branded Products (${brandedFoods.length} items)`,
        items: [], // Empty - will be loaded on demand
        maxDisplayed: 0
      });
    }
  }
  
  // Cooking ingredients detection (lower priority items)
  const ingredients = foods
    .filter(food => {
      const name = food.name.toLowerCase();
      return name.includes('broth') || name.includes('stock') || 
             name.includes('bouillon') || name.includes('base') ||
             name.includes('seasoning') || name.includes('powder') ||
             name.includes('mix');
    });
  
  if (ingredients.length > 0 && !hasBrandIntent) {
    groups.push({
      title: `Cooking Ingredients (${ingredients.length} items)`,
      items: [], // Empty - will be loaded on demand
      maxDisplayed: 0
    });
  }
  
  return groups;
}

/**
 * Transform USDA food item to our FoodItem format with relevance scoring
 */
function transformUSDAFood(usdaFood: USDAFood, query: string, index: number, totalResults: number): FoodItemResponse {
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

  const relevanceScore = calculateRelevanceScore(usdaFood, query, index, totalResults);

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

// Add helper utilities for server-side de-duplication of near-duplicate items

/**
 * Canonicalize a food description so that visually similar items collapse to a single key.
 * Heuristics:
 *  • Lower-case
 *  • Remove everything in parentheses
 *  • Include second comma segment for food cuts (e.g., "chicken breast" vs "chicken drumstick")
 *  • Collapse multiple spaces and non-alphanumeric characters
 */
function canonicalizeFoodName(name: string): string {
  let cleaned = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '');           // drop parenthetical notes
  
  const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);

  // If the first part is only the bare query word (e.g. "chicken"),
  // include the next descriptor ("breast", "drumstick", etc.) so
  // different cuts don't collapse into one key.
  let key = parts[0];
  if (parts.length > 1 && key.split(/\s+/).length === 1) {
    key = `${key} ${parts[1]}`;             // "chicken breast"
  }

  return key
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Priority rank for dataType – higher is better */
function getDataTypePriority(dataType: string): number {
  switch (dataType) {
    case 'Foundation':
      return 3;
    case 'SR Legacy':
      return 2;
    default:
      return 1; // Branded, Survey, etc.
  }
}

/**
 * Select the highest-quality representative for each canonical food name.
 * Quality order:
 *   1. dataType priority (Foundation > SR Legacy > others)
 *   2. Number of non-null macro nutrient fields present
 *   3. Higher relevanceScore (already computed)
 */
function deduplicateFoods(foods: FoodItemResponse[]): FoodItemResponse[] {
  const map = new Map<string, FoodItemResponse>();

  const macroCount = (f: FoodItemResponse) => {
    let count = 0;
    if (f.calories !== undefined) count++;
    if (f.protein !== undefined) count++;
    if (f.carbs !== undefined) count++;
    if (f.fat !== undefined) count++;
    return count;
  };

  for (const food of foods) {
    const key = canonicalizeFoodName(food.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, food);
      continue;
    }

    // Compare quality between current and existing entry
    const aPriority = getDataTypePriority(food.dataType);
    const bPriority = getDataTypePriority(existing.dataType);

    if (aPriority !== bPriority) {
      if (aPriority > bPriority) map.set(key, food);
      continue;
    }

    const aMacro = macroCount(food);
    const bMacro = macroCount(existing);
    if (aMacro !== bMacro) {
      if (aMacro > bMacro) map.set(key, food);
      continue;
    }

    const aScore = food.relevanceScore || 0;
    const bScore = existing.relevanceScore || 0;
    if (aScore > bScore) {
      map.set(key, food);
    }
  }

  return Array.from(map.values());
}

/**
 * Call USDA API for a specific data type with retry logic
 */
async function searchUSDAByDataType(
  query: string,
  dataTypes: string[],
  limit: number,
  page: number,
  apiKey: string,
  requestId: string,
  testVariant?: string
): Promise<USDASearchResponse> {
  const log = (stage: string, msg: unknown) =>
    console.log(`[food-search][${requestId}][usda-api][${stage}]`, JSON.stringify(msg));

  const url = 'https://api.nal.usda.gov/fdc/v1/foods/search';
  
  // RELEASE: Always use USDA's natural relevance scoring (removes alphabetical override)
  const payload: any = {
    query: query,
    pageSize: limit,
    pageNumber: Math.max(page, 1),
    dataType: dataTypes
    // No sortBy/sortOrder - let USDA's relevance algorithm work naturally
  };
  
  // Log the fix for monitoring
  if (testVariant === 'usda_relevance') {
    log('test-variant-active', 'Using USDA relevance (test mode)');
  }
  
  log('request', { url, payload, dataTypes, usingUSDARelevance: true });

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
          error: errorText,
          dataTypes
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
        foodsReturned: data.foods?.length || 0,
        dataTypes 
      });
      
      return data;

    } catch (error) {
      // If it's already an ApiError, preserve it
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Otherwise, wrap it
      lastError = error as Error;
      log('attempt-failed', { attempt, error: error.message, dataTypes });
      
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
 * Prioritised fetching strategy (2025-07 refactor)
 * 1. SR Legacy (core generics users expect)
 * 2. Survey/FNDDS (mixed dishes) – if still needed
 * 3. Foundation (only as a tiny fallback when very few hits)
 * 4. Branded (only on brand intent or very few total hits)
 */
async function searchUSDAFoodsPrioritized(
  query: string, 
  limit: number, 
  page: number,
  apiKey: string,
  requestId: string,
  testVariant?: string
): Promise<USDASearchResponse> {
  const log = (stage: string, msg: unknown) =>
    console.log(`[food-search][${requestId}][prioritized-search][${stage}]`, JSON.stringify(msg));

  const hasBrandIntent = detectBrandIntent(query);
  log('brand-intent-detection', { query, hasBrandIntent });

  let allFoods: USDAFood[] = [];
  let totalHits = 0;
  let currentPage = page;
  const targetResults = Math.min(limit * 2, 200); // Get 2x what we need for better ranking

  try {
    // Step 1: SR Legacy – primary generic foods (~7k items)
    log('step-1-sr-legacy', 'Fetching SR Legacy Foods');
    const legacyResponse = await searchUSDAByDataType(
      query,
      ['SR Legacy'],
      Math.min(targetResults, 100),
      currentPage,
      apiKey,
      requestId,
      testVariant
    );

    if (legacyResponse.foods && legacyResponse.foods.length > 0) {
      allFoods.push(...legacyResponse.foods);
      totalHits += legacyResponse.totalHits || 0;
    }

    log('sr-legacy-results', {
      found: legacyResponse.foods?.length || 0,
      totalSoFar: allFoods.length
    });

    // Step 2: Survey/FNDDS – mixed dishes, if we still need more breadth
    if (allFoods.length < targetResults / 2) {
      log('step-2-survey', 'Fetching Survey (FNDDS) Foods');
      try {
        const surveyResponse = await searchUSDAByDataType(
          query,
          ['Survey (FNDDS)'],
          Math.min(targetResults - allFoods.length, 100),
          currentPage,
          apiKey,
          requestId,
          testVariant
        );

        if (surveyResponse.foods && surveyResponse.foods.length > 0) {
          allFoods.push(...surveyResponse.foods);
          totalHits += surveyResponse.totalHits || 0;
        }

        log('survey-results', {
          found: surveyResponse.foods?.length || 0,
          totalSoFar: allFoods.length
        });
      } catch (error) {
        log('survey-optional-error', 'Survey fetch failed, continuing without it');
      }
    }

    // Step 3: Foundation fallback – only when we still have < 10 results total
    if (allFoods.length < 10) {
      log('step-3-foundation-fallback', 'Fetching Foundation Foods as fallback');
      try {
        const foundationResponse = await searchUSDAByDataType(
          query,
          ['Foundation'],
          Math.min(targetResults - allFoods.length, 50),
          currentPage,
          apiKey,
          requestId,
          testVariant
        );

        if (foundationResponse.foods && foundationResponse.foods.length > 0) {
          allFoods.push(...foundationResponse.foods);
          totalHits += foundationResponse.totalHits || 0;
        }

        log('foundation-fallback-results', {
          found: foundationResponse.foods?.length || 0,
          totalSoFar: allFoods.length
        });
      } catch (error) {
        log('foundation-optional-error', 'Foundation fetch failed, continuing without it');
      }
    }

    // Step 4: Branded (only if brand intent detected OR we have very few results)
    if (hasBrandIntent || allFoods.length < 10) {
      log('step-4-branded', { reason: hasBrandIntent ? 'brand-intent' : 'few-results' });
      try {
        const brandedResponse = await searchUSDAByDataType(
          query,
          ['Branded'],
          Math.min(hasBrandIntent ? targetResults : 20, 100), // More if brand intent
          currentPage,
          apiKey,
          requestId,
          testVariant
        );
        
        if (brandedResponse.foods && brandedResponse.foods.length > 0) {
          allFoods.push(...brandedResponse.foods);
          totalHits += brandedResponse.totalHits || 0;
        }
        
        log('branded-results', { 
          found: brandedResponse.foods?.length || 0,
          totalSoFar: allFoods.length 
        });
      } catch (error) {
        log('branded-optional-error', 'Branded fetch failed, continuing without it');
        // Continue without Branded data if it fails
      }
    } else {
      log('step-4-skipped', 'Skipping branded foods (no brand intent, sufficient results)');
    }

    log('prioritized-search-complete', {
      totalFoods: allFoods.length,
      totalHits,
      hasBrandIntent,
      dataTypeDistribution: allFoods.reduce((acc, food) => {
        acc[food.dataType] = (acc[food.dataType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    // Return in the expected format
    return {
      totalHits,
      currentPage,
      totalPages: Math.ceil(totalHits / limit),
      foods: allFoods
    };

  } catch (error) {
    log('prioritized-search-error', { error: error.message });
    throw error;
  }
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

    // 2. Parse request payload and check test variant
    checkpoint('parse-payload-start');
    let searchRequest: SearchRequest;
    
    // 2.5. Check for test variant header (dark deployment)
    const testVariant = req.headers.get('X-NutriAI-Test-Variant');
    if (testVariant) {
      log('test-variant-detected', { variant: testVariant });
    }
    
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

    // 8. Call USDA API with GPT-o3's prioritized sequential fetching
    checkpoint('usda-api-call');
    let usdaResponse: USDASearchResponse;
    try {
      usdaResponse = await searchUSDAFoodsPrioritized(query, limit, page, usdaApiKey, requestId, testVariant);
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
      // Transform all foods with relevance scoring using hybrid model
      const totalResults = (usdaResponse.foods || []).length;
      transformedFoods = (usdaResponse.foods || []).map((food, index) => 
        transformUSDAFood(food, query, index, totalResults)
      );
      
      // Filter out items with no calorie info (broths, seasonings, etc.)
      const meaningfulFoods = transformedFoods.filter(f => (f.calories ?? 0) > 0);

      // If filtering removes everything, fall back to original list to avoid empty results
      transformedFoods = meaningfulFoods.length > 0 ? meaningfulFoods : transformedFoods;

      // Sort by relevance score (highest first)
      transformedFoods.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      
      // De-duplicate similar items to reduce result noise
      const beforeDedup = transformedFoods.length;
      transformedFoods = deduplicateFoods(transformedFoods);
      const afterDedup = transformedFoods.length;

      log('deduplication', { beforeDedup, afterDedup });

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
    const resultGroups = categorizeSearchResults(transformedFoods, query);
    const displayedCount = resultGroups.reduce((sum, group) => sum + group.items.length, 0);
    const totalRemaining = Math.max(0, transformedFoods.length - displayedCount);
    
    // 11. Generate search suggestions
    checkpoint('suggestions');
    const suggestedQueries = generateSearchSuggestions(query);
    
    // 12. Build structured response
    checkpoint('build-response');
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Enhanced response with pagination support for each category
    const response: FoodSearchResponse = {
      resultGroups,
      nextPageToken: totalRemaining > 0 ? `page_${page + 1}` : undefined,
      totalRemaining,
      suggestedQueries,
      // Include the full food list for client-side progressive loading
      allFoods: transformedFoods,
      meta: {
        query,
        totalResults: usdaResponse.totalHits || 0,
        currentPage: page,
        processingTime,
        totalAvailable: transformedFoods.length,
        initialDisplayed: displayedCount
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