/**
 * Food Search Service
 * 
 * Client service for interacting with the USDA Food Search Edge Function.
 * Provides type-safe methods for searching foods, handling errors, and caching.
 */

// Debug log to verify module loading
console.log('[FoodSearchService] Module loading...');

import { supabase, supabaseConfig } from '../config/supabase';
import {
  FoodSearchRequest,
  FoodSearchResponse,
  FoodSearchError,
  FoodSearchItem,
  FoodSearchOptions,
  FoodSearchResult,
  FoodSearchMeta,
  FOOD_SEARCH_CONSTRAINTS,
  FOOD_SEARCH_ERROR_CODES,
  isFoodSearchResponse,
  isFoodSearchError
} from '../types/foodSearch';
import { MealAnalysis, FoodItem as MealFoodItem } from '../services/openai';

/**
 * Generates a correlation ID for request tracking.
 * Uses timestamp + random string for uniqueness without requiring crypto APIs.
 * This avoids the React Native crypto.getRandomValues() issue.
 * Format: "fs-<timestamp>-<random>"
 * Example: "fs-1a2b3c4d-x7y8z9"
 */
function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36); // Base36 timestamp
  const random = Math.random().toString(36).substring(2, 8); // 6-char random string
  const counter = Math.floor(Math.random() * 1000).toString(36); // Additional uniqueness
  return `fs-${timestamp}-${random}-${counter}`;
}

/**
 * Custom error class for food search operations
 */
export class FoodSearchApiError extends Error {
  constructor(
    public code: string,
    public stage: string,
    public requestId: string,
    message: string
  ) {
    super(message);
    this.name = 'FoodSearchApiError';
  }
}

/**
 * Result type for service methods
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: FoodSearchApiError;
}

/**
 * Debug mode detection - can be toggled via env variable
 */
const DEBUG_MODE = process.env.EXPO_PUBLIC_DEBUG_FOOD_SEARCH === 'true' || __DEV__;

/**
 * Structured logger for better debugging
 */
const logger = {
  debug: (correlationId: string, stage: string, message: string, context?: any) => {
    if (!DEBUG_MODE) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      correlationId,
      stage,
      message,
      ...context
    };
    
    if (__DEV__) {
      // Pretty print for development
      console.log(`🔍 [${stage}] ${message}`, context || '');
    } else {
      // Structured JSON for production debugging
      console.log(JSON.stringify(logEntry));
    }
  },
  
  error: (correlationId: string, stage: string, message: string, error?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      correlationId,
      stage,
      level: 'error',
      message,
      error: error?.message || error,
      stack: error?.stack
    };
    
    if (__DEV__) {
      console.error(`❌ [${stage}] ${message}`, error || '');
    } else {
      console.error(JSON.stringify(logEntry));
    }
  },
  
  info: (correlationId: string, stage: string, message: string, context?: any) => {
    if (!DEBUG_MODE && !__DEV__) return;
    
    if (__DEV__) {
      console.log(`ℹ️ [${stage}] ${message}`, context || '');
    } else {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        correlationId,
        stage,
        level: 'info',
        message,
        ...context
      }));
    }
  }
};

/**
 * Food Search Service Class
 */
class FoodSearchService {
  private cache = new Map<string, { data: FoodSearchResponse; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes client-side cache

  /**
   * Search for foods using the USDA database
   */
  public async searchFoods(
    query: string,
    options: FoodSearchOptions = {}
  ): Promise<ServiceResult<FoodSearchResult>> {
    // Generate correlation ID for this request
    const correlationId = generateCorrelationId();
    const startTime = Date.now();
    
    logger.info(correlationId, 'SEARCH_START', 'Starting food search', {
      query,
      options,
      debugMode: DEBUG_MODE
    });
    
    try {
      // Validate input
      logger.debug(correlationId, 'VALIDATION', 'Validating search input');
      const validationError = this.validateSearchInput(query, options);
      if (validationError) {
        logger.error(correlationId, 'VALIDATION_FAILED', validationError);
        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.INVALID_QUERY,
            'validation',
            correlationId,
            validationError
          )
        };
      }
      logger.debug(correlationId, 'VALIDATION_PASSED', 'Input validation successful');

      const limit = options.limit || FOOD_SEARCH_CONSTRAINTS.DEFAULT_LIMIT;
      const page = options.page || FOOD_SEARCH_CONSTRAINTS.DEFAULT_PAGE;

      // Check cache first
      const cacheKey = this.getCacheKey(query, limit, page);
      logger.debug(correlationId, 'CACHE_CHECK', 'Checking cache', { cacheKey });
      
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        logger.info(correlationId, 'CACHE_HIT', 'Found cached result', {
          cacheKey,
          resultCount: cachedResult.foods?.length
        });
        return {
          success: true,
          data: this.createSearchResult(cachedResult, query, true)
        };
      }
      logger.debug(correlationId, 'CACHE_MISS', 'No cached result found');

      // Get current session
      logger.debug(correlationId, 'AUTH_CHECK', 'Checking authentication status');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error(correlationId, 'AUTH_ERROR', 'Session error', sessionError);
        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.MISSING_AUTH,
            'authentication',
            correlationId,
            'Authentication error. Please log in again.'
          )
        };
      }
      
      if (!session) {
        logger.error(correlationId, 'AUTH_MISSING', 'No active session found');
        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.MISSING_AUTH,
            'authentication',
            correlationId,
            'Not authenticated. Please log in.'
          )
        };
      }
      
      logger.info(correlationId, 'AUTH_SUCCESS', 'Authentication successful', {
        userId: session.user?.id,
        tokenType: session.access_token ? 'present' : 'missing'
      });

      // Prepare request payload
      const requestPayload: FoodSearchRequest = {
        query: query.trim(),
        limit,
        page
      };
      
      logger.debug(correlationId, 'REQUEST_BUILD', 'Built request payload', {
        payload: requestPayload
      });

      // Make API call
      const apiStartTime = Date.now();
      logger.info(correlationId, 'API_CALL_START', 'Calling food-search Edge Function', {
        functionName: 'food-search',
        hasToken: !!session.access_token
      });
      
      // Call Edge Function via fetch so we can always read body, even on 500
      const edgeUrl = `${supabaseConfig.url}/functions/v1/food-search`;

      const resp = await fetch(edgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          'X-Correlation-ID': correlationId,
          ...(DEBUG_MODE ? { 'X-Debug-Mode': 'true' } : {})
        },
        body: JSON.stringify(requestPayload)
      });

      const apiProcessingTime = Date.now() - apiStartTime;
      logger.info(correlationId, 'API_CALL_COMPLETE', 'Edge Function call completed', {
        duration: apiProcessingTime,
        status: resp.status
      });

      const rawText = await resp.text();
      let parsedBody: any = null;
      try {
        parsedBody = rawText ? JSON.parse(rawText) : null;
      } catch {
        /* non-JSON body */
      }

      if (!resp.ok) {
        console.error('⚠️  Edge Function error details', {
          status: resp.status,
          parsedBody,
          rawBody: parsedBody ? undefined : rawText?.slice(0, 500)
        });

        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.SERVER_ERROR,
            parsedBody?.details?.lastStage || 'api-call',
            parsedBody?.details?.requestId || correlationId,
            parsedBody?.details?.message || 'Failed to search foods. Please try again.'
          )
        };
      }

      // At this point resp.ok === true, parsedBody must contain data
      const data = parsedBody;

      // Validate response format
      logger.debug(correlationId, 'RESPONSE_PARSE', 'Parsing API response', {
        dataType: typeof data,
        hasResultGroups: data && 'resultGroups' in data,
        hasFoods: data && 'foods' in data
      });
      
      if (isFoodSearchError(data)) {
        logger.error(correlationId, 'RESPONSE_ERROR', 'API returned error response', data);
        return {
          success: false,
          error: new FoodSearchApiError(
            data.stage,
            data.stage,
            data.requestId,
            data.error
          )
        };
      }

      const isStructuredResponse = data && 'resultGroups' in data && Array.isArray((data as any).resultGroups);

      if (!isFoodSearchResponse(data) && !isStructuredResponse) {
        logger.error(correlationId, 'RESPONSE_INVALID', 'Invalid response format', {
          actualKeys: data ? Object.keys(data) : null
        });
        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.TRANSFORMATION_ERROR,
            'response-validation',
            correlationId,
            'Invalid response format from search API'
          )
        };
      }
      
      logger.info(correlationId, 'RESPONSE_VALID', 'Response validation successful', {
        totalResults: data.total || data.meta?.totalResults,
        foodCount: data.foods?.length || data.resultGroups?.reduce((sum: number, g: any) => sum + (g.items?.length || 0), 0)
      });

      // Cache successful result
      this.setCache(cacheKey, data);
      logger.debug(correlationId, 'CACHE_SET', 'Cached successful result');

      // Calculate total processing time
      const totalProcessingTime = Date.now() - startTime;
      
      // Return structured result
      const result = this.createSearchResult(data, query, false, totalProcessingTime);
      
      logger.info(correlationId, 'SEARCH_SUCCESS', 'Food search completed successfully', {
        totalDuration: totalProcessingTime,
        apiDuration: apiProcessingTime,
        resultCount: result.foods.length,
        fromCache: false
      });
      
      return {
        success: true,
        data: result
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(correlationId, 'SEARCH_FATAL_ERROR', 'Unexpected error in food search', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        duration
      });
      
      return {
        success: false,
        error: new FoodSearchApiError(
          FOOD_SEARCH_ERROR_CODES.FATAL_ERROR,
          'client-error',
          correlationId,
          'Unexpected error occurred during search'
        )
      };
    }
  }

  /**
   * Search with automatic retry on rate limit
   */
  public async searchFoodsWithRetry(
    query: string,
    options: FoodSearchOptions = {},
    maxRetries: number = 2
  ): Promise<ServiceResult<FoodSearchResult>> {
    let lastError: FoodSearchApiError | undefined;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      const result = await this.searchFoods(query, options);
      
      if (result.success) {
        return result;
      }

      lastError = result.error;

      // Only retry on rate limit errors
      if (result.error?.stage === FOOD_SEARCH_ERROR_CODES.RATE_LIMITED && attempt <= maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Don't retry other errors
      break;
    }

    return {
      success: false,
      error: lastError!
    };
  }

  /**
   * Get food by specific ID (for detailed view)
   */
  public async getFoodById(fdcId: string): Promise<ServiceResult<FoodSearchItem>> {
    // This would require a separate endpoint or could be implemented
    // as a search with exact FDC ID matching
    return this.searchFoods(`fdcId:${fdcId}`, { limit: 1 }).then(result => {
      if (result.success && result.data && result.data.foods.length > 0) {
        return {
          success: true,
          data: result.data.foods[0]
        };
      }
      return {
        success: false,
        error: new FoodSearchApiError(
          'not-found',
          'food-lookup',
          'unknown',
          'Food not found'
        )
      };
    });
  }

  /**
   * Clear the client-side cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Private helper methods

  private validateSearchInput(query: string, options: FoodSearchOptions): string | null {
    if (!query || typeof query !== 'string') {
      return 'Search query is required';
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < FOOD_SEARCH_CONSTRAINTS.QUERY_MIN_LENGTH) {
      return `Query must be at least ${FOOD_SEARCH_CONSTRAINTS.QUERY_MIN_LENGTH} character`;
    }

    if (trimmedQuery.length > FOOD_SEARCH_CONSTRAINTS.QUERY_MAX_LENGTH) {
      return `Query must be no more than ${FOOD_SEARCH_CONSTRAINTS.QUERY_MAX_LENGTH} characters`;
    }

    if (options.limit !== undefined) {
      if (options.limit < FOOD_SEARCH_CONSTRAINTS.LIMIT_MIN || options.limit > FOOD_SEARCH_CONSTRAINTS.LIMIT_MAX) {
        return `Limit must be between ${FOOD_SEARCH_CONSTRAINTS.LIMIT_MIN} and ${FOOD_SEARCH_CONSTRAINTS.LIMIT_MAX}`;
      }
    }

    if (options.page !== undefined && options.page < FOOD_SEARCH_CONSTRAINTS.PAGE_MIN) {
      return `Page must be ${FOOD_SEARCH_CONSTRAINTS.PAGE_MIN} or greater`;
    }

    return null;
  }

  private getCacheKey(query: string, limit: number, page: number): string {
    return `${query.toLowerCase().trim()}:${limit}:${page}`;
  }

  private getFromCache(key: string): FoodSearchResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: FoodSearchResponse): void {
    // Limit cache size
    if (this.cache.size >= 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private createSearchResult(
    response: any,
    query: string,
    fromCache: boolean,
    processingTime?: number
  ): FoodSearchResult {
    // Support both legacy (flat foods array) and new structured format
    let foods: FoodSearchItem[] = [];
    let totalResults = 0;
    let currentPage = 1;
    let hasNextPage = false;

    if (Array.isArray(response.foods)) {
      // Legacy format
      foods = response.foods;
      totalResults = response.total;
      currentPage = response.page;
      hasNextPage = response.hasMore;
    } else if ('resultGroups' in response && Array.isArray(response.resultGroups)) {
      // Structured format
      const structured: any = response;
      foods = structured.resultGroups.reduce((acc: FoodSearchItem[], group: any) => acc.concat(group.items || []), []);
      totalResults = structured.meta?.totalResults ?? foods.length;
      currentPage = structured.meta?.currentPage ?? 1;
      hasNextPage = structured.totalRemaining > 0;
    }

    const totalPages = Math.max(1, Math.ceil(totalResults / Math.max(foods.length, 1)));

    const meta: FoodSearchMeta = {
      query,
      totalResults,
      currentPage,
      totalPages,
      hasNextPage,
      hasPreviousPage: currentPage > 1,
      processingTime,
      fromCache
    };

    return {
      foods,
      meta
    };
  }
}

/**
 * Utility functions for client-side use
 */

/**
 * Format error message for user display
 */
function formatSearchErrorMessage(error: FoodSearchApiError): string {
  switch (error.stage) {
    case FOOD_SEARCH_ERROR_CODES.RATE_LIMITED:
      return 'Too many searches. Please wait a moment before trying again.';
    case FOOD_SEARCH_ERROR_CODES.USDA_API_ERROR:
      return 'Food database temporarily unavailable. Please try again.';
    case FOOD_SEARCH_ERROR_CODES.INVALID_QUERY:
      return 'Please check your search terms and try again.';
    case FOOD_SEARCH_ERROR_CODES.MISSING_AUTH:
    case FOOD_SEARCH_ERROR_CODES.INVALID_TOKEN:
      return 'Please log in to search for foods.';
    default:
      return 'Search failed. Please try again.';
  }
}

/**
 * Check if error indicates user should retry
 */
function shouldRetrySearch(error: FoodSearchApiError): boolean {
  return [
    FOOD_SEARCH_ERROR_CODES.RATE_LIMITED,
    FOOD_SEARCH_ERROR_CODES.USDA_API_ERROR,
    FOOD_SEARCH_ERROR_CODES.SERVER_ERROR
  ].includes(error.stage as any);
}

/**
 * Single instance of the food search service
 * Using instantiated module singleton pattern for better reliability
 */
const foodSearchService = new FoodSearchService();

/**
 * Type alias for FoodItem to match expected imports
 */
export type FoodItem = FoodSearchItem;

/**
 * Convenience wrapper for searchFoods that throws on error
 * This matches the expected API from ManualEntryScreen
 * Handles both legacy and new structured response formats
 */
export async function searchFoods(options: FoodSearchOptions & { query: string }): Promise<FoodSearchResponse> {
  const wrapperCorrelationId = generateCorrelationId();
  logger.debug(wrapperCorrelationId, 'WRAPPER_SEARCH_FOODS', 'Legacy wrapper called', options);
  
  try {
    const result = await foodSearchService.searchFoodsWithRetry(options.query, options);
  
    if (!result.success) {
      throw new Error(formatSearchErrorMessage(result.error!));
    }
    
    const responseData = result.data!;
    
    // Check if this is the new structured response format
    if ('resultGroups' in responseData && Array.isArray((responseData as any).resultGroups)) {
      const structured: any = responseData;
      // New structured format - flatten to maintain backward compatibility
      const allFoods: FoodSearchItem[] = structured.resultGroups.reduce((acc: FoodSearchItem[], group: any) => {
        return acc.concat(group.items || []);
      }, []);
      
      logger.info(wrapperCorrelationId, 'STRUCTURED_FORMAT', 'Using new structured response format', {
        groupCount: structured.resultGroups.length,
        totalFoods: allFoods.length,
        totalRemaining: structured.totalRemaining
      });
      
      return {
        foods: allFoods,
        hasMore: structured.totalRemaining > 0,
        total: structured.meta.totalResults,
        page: structured.meta.currentPage
      };
    } else {
      // Legacy format - use as-is
      const { foods, meta } = responseData as any;
      
      return {
        foods,
        hasMore: meta.hasNextPage,
        total: meta.totalResults,
        page: meta.currentPage
      };
    }
  } catch (error) {
    logger.error(wrapperCorrelationId, 'WRAPPER_ERROR', 'Error in searchFoods wrapper', error);
    throw error;
  }
}

/**
 * Get structured search results with categorization (new UX)
 * Returns the full structured response for components that can handle it
 */
export async function searchFoodsStructured(
  query: string, 
  options: FoodSearchOptions = {}
): Promise<{
  groups: Array<{
    title: string;
    items: FoodSearchItem[];
    maxDisplayed?: number;
  }>;
  suggestions: Array<{
    displayText: string;
    query: string;
    reasoning?: string;
  }>;
  totalRemaining: number;
  meta: {
    query: string;
    totalResults: number;
    currentPage: number;
    processingTime?: number;
  };
}> {
  const result = await foodSearchService.searchFoodsWithRetry(query, options);
  
  if (!result.success) {
    throw new Error(formatSearchErrorMessage(result.error!));
  }
  
  const responseData = result.data!;
  
  // Handle new structured format
  if ('resultGroups' in responseData && Array.isArray((responseData as any).resultGroups)) {
    const structured: any = responseData;
    return {
      groups: structured.resultGroups.map((group: any) => ({
        title: group.title,
        items: group.items || [],
        maxDisplayed: group.maxDisplayed
      })),
      suggestions: structured.suggestedQueries || [],
      totalRemaining: structured.totalRemaining || 0,
      meta: structured.meta
    };
  } else {
    // Fallback: convert legacy format to structured
    const { foods, meta } = responseData as any;
    
    return {
      groups: [{
        title: 'Search Results',
        items: foods || []
      }],
      suggestions: [],
      totalRemaining: 0,
      meta: {
        query,
        totalResults: meta.totalResults,
        currentPage: meta.currentPage,
        processingTime: meta.processingTime
      }
    };
  }
}

/**
 * Convert a FoodSearchItem to MealAnalysis format for MealDetailsScreen
 */
export function foodItemToMealAnalysis(foodItem: FoodSearchItem): MealAnalysis {
  // Create a proper FoodItem object matching the MealAnalysis.foods structure
  const convertedFoodItem: MealFoodItem = {
    name: foodItem.name,
    quantity: `${foodItem.servingSize} ${foodItem.servingUnit}`,
    nutrition: {
      calories: Math.round(foodItem.calories),
      protein: Math.round(foodItem.protein),
      carbs: Math.round(foodItem.carbs),
      fat: Math.round(foodItem.fat),
      fiber: foodItem.fiber ? Math.round(foodItem.fiber) : 0,
      sugar: foodItem.sugar ? Math.round(foodItem.sugar) : 0,
      sodium: foodItem.sodium ? Math.round(foodItem.sodium) : 0,
    },
    confidence: foodItem.verified ? 0.95 : 0.85,
  };

  // Return proper MealAnalysis structure expected by MealDetailsScreen
  return {
    foods: [convertedFoodItem],
    totalNutrition: {
      calories: Math.round(foodItem.calories),
      protein: Math.round(foodItem.protein),
      carbs: Math.round(foodItem.carbs),
      fat: Math.round(foodItem.fat),
      fiber: foodItem.fiber ? Math.round(foodItem.fiber) : 0,
      sugar: foodItem.sugar ? Math.round(foodItem.sugar) : 0,
      sodium: foodItem.sodium ? Math.round(foodItem.sodium) : 0,
    },
    confidence: foodItem.verified ? 0.95 : 0.85,
    notes: `Manually selected: ${foodItem.name}${foodItem.brand ? ` (${foodItem.brand})` : ''}`,
  };
}

/**
 * Export the service instance as default for cleaner imports
 */
export default foodSearchService;

/**
 * Export utility functions
 */
export { formatSearchErrorMessage, shouldRetrySearch };

// Debug log to verify exports
if (DEBUG_MODE) {
  console.log('[FoodSearchService] Module loaded successfully', {
    searchFoods: typeof searchFoods,
    foodItemToMealAnalysis: typeof foodItemToMealAnalysis,
    default: typeof foodSearchService,
    debugMode: DEBUG_MODE
  });
}