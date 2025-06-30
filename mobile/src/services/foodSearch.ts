/**
 * Food Search Service
 * 
 * Client service for interacting with the USDA Food Search Edge Function.
 * Provides type-safe methods for searching foods, handling errors, and caching.
 */

import { supabase } from '../config/supabase';
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
 * Food Search Service Class
 */
export class FoodSearchService {
  private static instance: FoodSearchService;
  private cache = new Map<string, { data: FoodSearchResponse; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes client-side cache

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): FoodSearchService {
    if (!FoodSearchService.instance) {
      FoodSearchService.instance = new FoodSearchService();
    }
    return FoodSearchService.instance;
  }

  /**
   * Search for foods using the USDA database
   */
  public async searchFoods(
    query: string,
    options: FoodSearchOptions = {}
  ): Promise<ServiceResult<FoodSearchResult>> {
    try {
      // Validate input
      const validationError = this.validateSearchInput(query, options);
      if (validationError) {
        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.INVALID_QUERY,
            'validation',
            'client-validation',
            validationError
          )
        };
      }

      const limit = options.limit || FOOD_SEARCH_CONSTRAINTS.DEFAULT_LIMIT;
      const page = options.page || FOOD_SEARCH_CONSTRAINTS.DEFAULT_PAGE;

      // Check cache first
      const cacheKey = this.getCacheKey(query, limit, page);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          data: this.createSearchResult(cachedResult, query, true)
        };
      }

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.MISSING_AUTH,
            'authentication',
            'session-check',
            'Not authenticated. Please log in.'
          )
        };
      }

      // Prepare request payload
      const requestPayload: FoodSearchRequest = {
        query: query.trim(),
        limit,
        page
      };

      // Make API call
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('food-search', {
        body: requestPayload,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const processingTime = Date.now() - startTime;

      // Handle API errors
      if (error) {
        console.error('Food search API error:', error);
        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.SERVER_ERROR,
            'api-call',
            'unknown',
            'Failed to search foods. Please try again.'
          )
        };
      }

      // Validate response format
      if (isFoodSearchError(data)) {
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

      if (!isFoodSearchResponse(data)) {
        return {
          success: false,
          error: new FoodSearchApiError(
            FOOD_SEARCH_ERROR_CODES.TRANSFORMATION_ERROR,
            'response-validation',
            'unknown',
            'Invalid response format from search API'
          )
        };
      }

      // Cache successful result
      this.setCache(cacheKey, data);

      // Return structured result
      return {
        success: true,
        data: this.createSearchResult(data, query, false, processingTime)
      };

    } catch (error) {
      console.error('Unexpected error in food search:', error);
      return {
        success: false,
        error: new FoodSearchApiError(
          FOOD_SEARCH_ERROR_CODES.FATAL_ERROR,
          'client-error',
          'unknown',
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
    response: FoodSearchResponse,
    query: string,
    fromCache: boolean,
    processingTime?: number
  ): FoodSearchResult {
    const totalPages = Math.ceil(response.total / response.foods.length) || 1;

    const meta: FoodSearchMeta = {
      query,
      totalResults: response.total,
      currentPage: response.page,
      totalPages,
      hasNextPage: response.hasMore,
      hasPreviousPage: response.page > 1,
      processingTime,
      fromCache
    };

    return {
      foods: response.foods,
      meta
    };
  }
}

/**
 * Convenience function to get the singleton instance
 */
export const foodSearchService = FoodSearchService.getInstance();

/**
 * Utility functions for client-side use
 */

/**
 * Format error message for user display
 */
export function formatSearchErrorMessage(error: FoodSearchApiError): string {
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
export function shouldRetrySearch(error: FoodSearchApiError): boolean {
  return [
    FOOD_SEARCH_ERROR_CODES.RATE_LIMITED,
    FOOD_SEARCH_ERROR_CODES.USDA_API_ERROR,
    FOOD_SEARCH_ERROR_CODES.SERVER_ERROR
  ].includes(error.stage as any);
}