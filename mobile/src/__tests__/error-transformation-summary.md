# Edge Function Error Code Transformation - Complete Analysis

## Executive Summary

The user correctly identified that a 4xx error from the USDA API is being transformed into a 500/502 error in the logs. This is happening because of how the Edge Function handles errors from the USDA API.

## Root Cause

### The Problem Code (Line 496)

```typescript
throw new Error(`USDA API error ${response.status}: ${errorText}`);
```

This line converts an HTTP response with a specific status code (401, 403, 429, etc.) into a generic JavaScript `Error` object. The status code is embedded in the error message string but is not preserved as a property.

### The Transformation (Line 735)

```typescript
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
```

The catch block returns 502 (Bad Gateway) for **ANY** error from the USDA API, regardless of the original status code.

## Test Results

Running direct tests against the USDA API confirms:

| Scenario          | USDA Returns              | Edge Function Returns | Should Return             |
| ----------------- | ------------------------- | --------------------- | ------------------------- |
| Valid API Key     | 200 OK                    | 200 OK ✅             | 200 OK                    |
| Invalid API Key   | 403 Forbidden             | 502 Bad Gateway ❌    | 500 Internal Server Error |
| Missing API Key   | 403 Forbidden             | 502 Bad Gateway ❌    | 500 Internal Server Error |
| Rate Limited      | 429 Too Many Requests     | 502 Bad Gateway ❌    | 429 Too Many Requests     |
| USDA Server Error | 500 Internal Server Error | 502 Bad Gateway ⚠️    | 503 Service Unavailable   |

## Why This Matters

1. **Debugging Confusion**: Developers see 502 errors when the real issue is a 403 (invalid API key)
2. **Poor Error Messages**: Clients get generic "try again" messages instead of specific guidance
3. **Monitoring Issues**: Can't distinguish between configuration errors vs actual gateway failures
4. **Rate Limiting**: Clients can't implement proper backoff because they don't know it's a rate limit

## The Fix

### Step 1: Create a Custom Error Class

```typescript
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
```

### Step 2: Throw the Custom Error (Line 496)

```typescript
throw new USDAAPIError(
  response.status,
  response.statusText,
  `USDA API error ${response.status}: ${errorText}`
);
```

### Step 3: Handle Errors Appropriately (Lines 727-737)

```typescript
} catch (error) {
  if (error instanceof USDAAPIError) {
    // Now we can access error.status!
    switch (error.status) {
      case 401:
      case 403:
        // Configuration error - our API key is bad
        return new Response(
          JSON.stringify({
            stage: 'usda-api-configuration',
            error: 'Food database configuration error',
            requestId
          }),
          { status: 500, headers }
        );

      case 429:
        // Rate limit - pass it through
        return new Response(
          JSON.stringify({
            stage: 'usda-api-rate-limit',
            error: 'Too many requests. Please try again later.',
            requestId
          }),
          { status: 429, headers }
        );

      // ... handle other cases
    }
  }

  // Default 502 for unknown errors
  return new Response(
    JSON.stringify({
      stage: 'usda-api',
      error: 'Failed to search food database.',
      requestId
    }),
    { status: 502, headers }
  );
}
```

## Immediate Workaround

Until the code is fixed, check the Edge Function logs for the actual USDA status:

```
[food-search][req_xxx][usda-api][error] {
  "attempt": 1,
  "status": 403,  // <-- The real error code!
  "statusText": "Forbidden",
  "error": "{\"error\":{\"code\":\"API_KEY_INVALID\",\"message\":\"An invalid api_key was supplied.\"}}"
}
```

The actual status IS being logged (line 481-487), it's just not being returned to the client.

## Recommendation

Implement the fix immediately to:

1. Improve debugging by preserving original error codes
2. Provide better error messages to clients
3. Enable proper rate limit handling
4. Distinguish between configuration errors and transient failures

The fix is backward compatible and will not break existing clients.
