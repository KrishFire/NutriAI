# Food Search API Documentation

## Overview

The Food Search API is a Supabase Edge Function that provides secure access to the USDA FoodData Central database for nutrition information. It enables manual food entry in the NutriAI mobile app without exposing API keys to client code.

## Endpoint

```
POST /functions/v1/food-search
```

## Authentication

All requests must include a valid Supabase JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- **Limit**: 10 requests per minute per authenticated user
- **Response**: HTTP 429 when limit exceeded
- **Reset**: Rate limit window resets every minute

## Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Body
```typescript
interface SearchRequest {
  query: string;      // Required: 1-100 characters
  limit?: number;     // Optional: 1-50, default 20
  page?: number;      // Optional: >= 1, default 1
}
```

### Example Request
```json
{
  "query": "chicken breast",
  "limit": 10,
  "page": 1
}
```

## Response Format

### Success Response (200 OK)
```typescript
interface FoodSearchResponse {
  foods: FoodItemResponse[];
  hasMore: boolean;    // True if more pages available
  total: number;       // Total number of results available
  page: number;        // Current page number
}

interface FoodItemResponse {
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
```

### Example Success Response
```json
{
  "foods": [
    {
      "id": "171077",
      "name": "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
      "servingSize": 100,
      "servingUnit": "g",
      "calories": 165,
      "protein": 31.02,
      "carbs": 0,
      "fat": 3.57,
      "fiber": 0,
      "sodium": 74,
      "verified": true
    }
  ],
  "hasMore": true,
  "total": 1247,
  "page": 1
}
```

## Error Responses

All errors return a structured JSON response with the following format:

```typescript
interface ErrorResponse {
  stage: string;       // Where the error occurred
  error: string;       // Human-readable error message
  requestId: string;   // Unique request identifier for debugging
}
```

### Common Error Codes

#### 400 Bad Request
- **Invalid payload**: Malformed JSON or missing required fields
- **Invalid query**: Query too short/long or missing
- **Invalid parameters**: Limit/page outside valid ranges

```json
{
  "stage": "validation",
  "error": "Query must be between 1 and 100 characters",
  "requestId": "req_1703123456789_abc123def"
}
```

#### 401 Unauthorized
- **Missing auth header**: No Authorization header provided
- **Invalid token**: Expired or invalid JWT token

```json
{
  "stage": "authentication", 
  "error": "Invalid or expired token",
  "requestId": "req_1703123456789_abc123def"
}
```

#### 429 Too Many Requests
- **Rate limit exceeded**: User has exceeded 10 requests per minute

```json
{
  "stage": "rate-limiting",
  "error": "Rate limit exceeded. Please wait before making more requests.",
  "requestId": "req_1703123456789_abc123def"
}
```

#### 500 Internal Server Error
- **Configuration error**: Missing environment variables
- **Data processing error**: Failed to transform USDA data

```json
{
  "stage": "environment",
  "error": "USDA API key not configured", 
  "requestId": "req_1703123456789_abc123def"
}
```

#### 502 Bad Gateway
- **USDA API error**: External API failure or timeout

```json
{
  "stage": "usda-api",
  "error": "Failed to search food database. Please try again.",
  "requestId": "req_1703123456789_abc123def"
}
```

## Performance Characteristics

### Caching
- **Cache Duration**: 15 minutes for search results
- **Cache Key**: Based on normalized query + limit + page
- **Cache Hit Response**: < 100ms typical
- **Cache Miss Response**: 1-5 seconds typical

### USDA API Integration
- **Data Sources**: Foundation Foods, SR Legacy, Branded Foods
- **Sort Order**: Government data prioritized over branded
- **Retry Logic**: 3 attempts with exponential backoff
- **Timeout Handling**: Graceful degradation on API failures

## Usage Examples

### Basic Search
```typescript
const searchFoods = async (query: string) => {
  const response = await fetch('/functions/v1/food-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseToken}`
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};
```

### Paginated Search
```typescript
const searchWithPagination = async (query: string, page: number = 1) => {
  const response = await fetch('/functions/v1/food-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseToken}`
    },
    body: JSON.stringify({ 
      query, 
      limit: 20,
      page 
    })
  });

  return await response.json();
};
```

### Error Handling
```typescript
const searchFoodsWithErrorHandling = async (query: string) => {
  try {
    const result = await searchFoods(query);
    return result;
  } catch (error) {
    if (error.status === 429) {
      // Rate limited - show user-friendly message
      return { error: 'Too many requests. Please wait a moment.' };
    } else if (error.status === 502) {
      // External API issue - suggest retry
      return { error: 'Search temporarily unavailable. Please try again.' };
    } else {
      // Other errors
      return { error: 'Search failed. Please check your input.' };
    }
  }
};
```

## Integration with Existing Types

The `FoodItemResponse` interface is designed to be compatible with the existing `FoodItem` interface in `/mobile/src/types/index.ts`. Additional fields needed for meal entries:

```typescript
// Convert FoodItemResponse to FoodItem for database storage
const createFoodItem = (searchResult: FoodItemResponse): Partial<FoodItem> => ({
  id: generateUUID(), // Generate new UUID for database
  name: searchResult.name,
  brand: searchResult.brand,
  servingSize: searchResult.servingSize,
  servingUnit: searchResult.servingUnit,
  calories: searchResult.calories,
  protein: searchResult.protein,
  carbs: searchResult.carbs,
  fat: searchResult.fat,
  fiber: searchResult.fiber,
  sugar: searchResult.sugar,
  sodium: searchResult.sodium,
  verified: searchResult.verified,
  // Add additional fields as needed
  imageUrl: undefined,
  barcode: undefined
});
```

## Environment Variables Required

For deployment, ensure these environment variables are configured:

```bash
USDA_API_KEY=your_usda_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Deployment

The function is ready for deployment to Supabase Edge Functions:

```bash
supabase functions deploy food-search
```

## Monitoring and Debugging

All requests generate structured logs with unique request IDs for tracing:

```
[food-search][req_1703123456789_abc123def][start] {"method":"POST","url":"..."}
[food-search][req_1703123456789_abc123def][auth-success] {"userId":"..."}
[food-search][req_1703123456789_abc123def][cache-miss] {"cacheKey":"..."}
[food-search][req_1703123456789_abc123def][usda-api][success] {"totalHits":1247}
[food-search][req_1703123456789_abc123def][success] {"foodsReturned":20}
```

Use the `requestId` from error responses to locate specific request logs for debugging.