/**
 * Fixed version of the Edge Function error handling
 *
 * This demonstrates how to preserve USDA API error codes and map them
 * appropriately for client responses.
 */

// Custom error class to preserve USDA API status codes
class USDAAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'USDAAPIError';
  }
}

// Fixed searchUSDAFoods function (partial - showing the key changes)
async function searchUSDAFoods(
  query: string,
  limit: number,
  page: number,
  apiKey: string,
  requestId: string
): Promise<USDASearchResponse> {
  const log = (stage: string, msg: unknown) =>
    console.log(
      `[food-search][${requestId}][usda-api][${stage}]`,
      JSON.stringify(msg)
    );

  const url = 'https://api.nal.usda.gov/fdc/v1/foods/search';
  const searchLimit = Math.min(limit * 4, 200);

  const payload = {
    query: query,
    pageSize: searchLimit,
    pageNumber: 1,
    dataType: ['Foundation', 'SR Legacy', 'Branded'],
    sortBy: 'dataType.keyword',
    sortOrder: 'asc',
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
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log('error', {
          attempt,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });

        if (response.status === 429) {
          // Rate limit - exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          log('rate-limit-retry', { attempt, delay });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // FIXED: Use custom error class to preserve status code
        throw new USDAAPIError(
          response.status,
          response.statusText,
          `USDA API error ${response.status}: ${errorText}`
        );
      }

      const data: USDASearchResponse = await response.json();
      log('success', {
        attempt,
        totalHits: data.totalHits,
        foodsReturned: data.foods?.length || 0,
      });

      return data;
    } catch (error) {
      lastError = error as Error;
      log('attempt-failed', { attempt, error: error.message });

      if (attempt < maxRetries) {
        // Only retry for transient errors, not auth errors
        if (
          error instanceof USDAAPIError &&
          (error.status === 401 || error.status === 403)
        ) {
          // Don't retry auth errors
          throw error;
        }

        // Exponential backoff for other errors
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        log('retry', { attempt, delay });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to connect to USDA API after retries');
}

// Fixed main handler error handling section
async function handleUSDAError(error: unknown, requestId: string) {
  const log = (stage: string, msg: unknown) =>
    console.log(`[food-search][${requestId}][${stage}]`, JSON.stringify(msg));

  log('usda-api-error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    status: error instanceof USDAAPIError ? error.status : undefined,
    type: error instanceof USDAAPIError ? 'USDAAPIError' : 'Error',
  });

  // Map USDA errors to appropriate client-facing errors
  if (error instanceof USDAAPIError) {
    switch (error.status) {
      case 401:
      case 403:
        // API key issues are server configuration problems
        return new Response(
          JSON.stringify({
            stage: 'usda-api-configuration',
            error:
              'Food database service configuration error. Please contact support.',
            requestId,
            // Debug info for developers (could be omitted in production)
            debug: {
              hint: 'Check USDA_API_KEY environment variable',
              originalError:
                error.status === 403
                  ? 'Invalid or missing API key'
                  : 'Unauthorized',
            },
          }),
          {
            status: 500, // Server misconfiguration
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 429:
        // Pass through rate limit to client
        return new Response(
          JSON.stringify({
            stage: 'usda-api-rate-limit',
            error:
              'Food database rate limit exceeded. Please try again in a few moments.',
            requestId,
            retryAfter: 60, // seconds
          }),
          {
            status: 429, // Rate limit
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );

      case 404:
        // USDA endpoint not found - likely a code issue
        return new Response(
          JSON.stringify({
            stage: 'usda-api-endpoint',
            error:
              'Food database service endpoint error. Please contact support.',
            requestId,
          }),
          {
            status: 502, // Bad gateway
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 500:
      case 502:
      case 503:
        // USDA server errors
        return new Response(
          JSON.stringify({
            stage: 'usda-api-server',
            error:
              'Food database service is temporarily unavailable. Please try again later.',
            requestId,
          }),
          {
            status: 503, // Service unavailable
            headers: { 'Content-Type': 'application/json' },
          }
        );

      default:
        // Other USDA errors
        return new Response(
          JSON.stringify({
            stage: 'usda-api',
            error: 'Failed to search food database. Please try again.',
            requestId,
            debug: {
              originalStatus: error.status,
              originalMessage: error.statusText,
            },
          }),
          {
            status: 502, // Generic bad gateway
            headers: { 'Content-Type': 'application/json' },
          }
        );
    }
  }

  // Non-USDA errors (network, timeouts, etc.)
  return new Response(
    JSON.stringify({
      stage: 'usda-api-network',
      error:
        'Unable to connect to food database. Please check your connection and try again.',
      requestId,
    }),
    {
      status: 502, // Bad gateway
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Example usage in the main handler:
/*
try {
  usdaResponse = await searchUSDAFoods(query, limit, page, usdaApiKey, requestId);
} catch (error) {
  return await handleUSDAError(error, requestId);
}
*/

export { USDAAPIError, searchUSDAFoods, handleUSDAError };
