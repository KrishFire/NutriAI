/**
 * Type definitions for Food Search API
 * 
 * These types match the USDA Food Search Edge Function API contract.
 * Import these types when implementing food search functionality.
 */

// Request payload for food search
export interface FoodSearchRequest {
  query: string;      // Required: 1-100 characters
  limit?: number;     // Optional: 1-50, default 20
  page?: number;      // Optional: >= 1, default 1
}

// Individual food item from search results
export interface FoodSearchItem {
  id: string;          // USDA FDC ID as string
  name: string;        // Food description
  brand?: string;      // Brand name (if available)
  servingSize: number; // Default serving size
  servingUnit: string; // Unit (g, oz, cup, etc.)
  calories: number;    // Calories per serving
  protein: number;     // Protein in grams
  carbs: number;       // Carbohydrates in grams  
  fat: number;         // Fat in grams
  fiber?: number;      // Fiber in grams (optional)
  sugar?: number;      // Sugar in grams (optional)
  sodium?: number;     // Sodium in mg (optional)
  verified: boolean;   // True for government data sources
}

// Response from food search API
export interface FoodSearchResponse {
  foods: FoodSearchItem[];
  hasMore: boolean;    // True if more pages available
  total: number;       // Total number of results available
  page: number;        // Current page number
}

// Error response structure
export interface FoodSearchError {
  stage: string;       // Where the error occurred
  error: string;       // Human-readable error message
  requestId: string;   // Unique request identifier for debugging
}

// Rate limiting information
export interface RateLimitInfo {
  limit: number;       // Requests per minute
  remaining: number;   // Requests remaining in current window
  resetTime: number;   // Unix timestamp when window resets
}

// Search options for client-side configuration
export interface FoodSearchOptions {
  /** Maximum number of results per page (1-50) */
  limit?: number;
  /** Page number to retrieve (1-based) */
  page?: number;
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Whether to show only verified foods */
  verifiedOnly?: boolean;
}

// Search result metadata
export interface FoodSearchMeta {
  query: string;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  processingTime?: number; // milliseconds
  fromCache: boolean;
}

// Result group for structured search responses
export interface FoodResultGroup {
  title: string;
  items: FoodSearchItem[];
  maxDisplayed?: number;
}

// Enhanced search response with full foods list for client-side expansion
export interface StructuredFoodSearchResponse {
  groups: FoodResultGroup[];
  suggestions: SuggestedQuery[];
  totalRemaining: number;
  allFoods?: FoodSearchItem[]; // Full list for client-side progressive loading
  meta: {
    query: string;
    totalResults: number;
    currentPage: number;
    processingTime?: number;
  };
}

// Suggested query for search enhancement
export interface SuggestedQuery {
  displayText: string;
  query: string;
  reasoning?: string;
}

// Complete search result with metadata
export interface FoodSearchResult {
  foods: FoodSearchItem[];
  meta: FoodSearchMeta;
  // Optional structured fields for progressive disclosure UX
  resultGroups?: FoodResultGroup[];
  suggestedQueries?: SuggestedQuery[];
  totalRemaining?: number;
}

// Utility type for converting search items to FoodItem interface
export type FoodItemFromSearch = Omit<FoodSearchItem, 'id'> & {
  id?: string;        // Will be generated when saving to database
  imageUrl?: string;  // Not available from search
  barcode?: string;   // Not available from search
};

// Search history item for caching/recent searches
export interface FoodSearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
  userId: string;
}

// Auto-complete suggestion
export interface FoodSearchSuggestion {
  text: string;
  type: 'recent' | 'popular' | 'auto-complete';
  frequency?: number;
}

/**
 * Type guards for runtime type checking
 */

export function isFoodSearchResponse(obj: any): obj is FoodSearchResponse {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.foods) &&
    typeof obj.hasMore === 'boolean' &&
    typeof obj.total === 'number' &&
    typeof obj.page === 'number'
  );
}

export function isFoodSearchError(obj: any): obj is FoodSearchError {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.stage === 'string' &&
    typeof obj.error === 'string' &&
    typeof obj.requestId === 'string'
  );
}

export function isFoodSearchItem(obj: any): obj is FoodSearchItem {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.servingSize === 'number' &&
    typeof obj.servingUnit === 'string' &&
    typeof obj.calories === 'number' &&
    typeof obj.protein === 'number' &&
    typeof obj.carbs === 'number' &&
    typeof obj.fat === 'number' &&
    typeof obj.verified === 'boolean'
  );
}

/**
 * Constants for client-side validation
 */
export const FOOD_SEARCH_CONSTRAINTS = {
  QUERY_MIN_LENGTH: 1,
  QUERY_MAX_LENGTH: 100,
  LIMIT_MIN: 1,
  LIMIT_MAX: 50,
  PAGE_MIN: 1,
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE: 1,
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  RATE_LIMIT_PER_MINUTE: 10
} as const;

/**
 * Error codes that may be returned by the API
 */
export const FOOD_SEARCH_ERROR_CODES = {
  INVALID_PAYLOAD: 'payload-parsing',
  INVALID_QUERY: 'validation',
  MISSING_AUTH: 'authorization',
  INVALID_TOKEN: 'authentication',
  RATE_LIMITED: 'rate-limiting',
  SERVER_ERROR: 'environment',
  USDA_API_ERROR: 'usda-api',
  TRANSFORMATION_ERROR: 'data-transformation',
  FATAL_ERROR: 'fatal'
} as const;

export type FoodSearchErrorCode = typeof FOOD_SEARCH_ERROR_CODES[keyof typeof FOOD_SEARCH_ERROR_CODES];