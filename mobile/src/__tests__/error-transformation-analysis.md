# Edge Function Error Code Transformation Analysis

## The Problem

User reports: "yes i believe the error is a 4xx error idk why the logs say 500"

## Root Cause Found

### Line 496: The Culprit

```typescript
throw new Error(`USDA API error ${response.status}: ${errorText}`);
```

This line converts a typed HTTP response with a status code into a generic JavaScript Error object. The status code is embedded in the error MESSAGE but not preserved as a property.

### Line 735: The Transformation

```typescript
{ status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
```

The catch block blindly returns 502 for ANY error from the USDA API call, regardless of the original status code.

## Error Flow Analysis

1. **USDA returns 401** (bad API key)
   - Line 480: `response.ok` is false
   - Line 481-487: Logs show `status: 401`
   - Line 496: `throw new Error("USDA API error 401: Invalid API key")`
   - Line 728: Catches the Error object (no status property!)
   - Line 735: Returns 502 to client

2. **USDA returns 403** (forbidden)
   - Same flow → Returns 502

3. **USDA returns 429** (rate limit)
   - Line 489-494: Special handling with retries
   - After max retries, falls through to line 496
   - Same flow → Returns 502

## The Fix

### Option 1: Custom Error Class

```typescript
class USDAAPIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'USDAAPIError';
  }
}

// Line 496 becomes:
throw new USDAAPIError(response.status, `USDA API error ${response.status}: ${errorText}`);

// Line 728 catch block:
} catch (error) {
  if (error instanceof USDAAPIError) {
    // Can now access error.status!
    if (error.status === 401 || error.status === 403) {
      return new Response(
        JSON.stringify({
          stage: 'usda-api-configuration',
          error: 'Food database configuration error',
          requestId
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Handle other status codes appropriately
  }
  // Default 502 for non-USDA errors
}
```

### Option 2: Return Status in searchUSDAFoods

```typescript
// Instead of throwing, return an error result
if (!response.ok) {
  return {
    success: false,
    status: response.status,
    error: errorText
  };
}

// In the main handler:
const result = await searchUSDAFoods(...);
if (!result.success) {
  // Now we have access to result.status!
}
```

## Why This Matters

1. **Debugging**: The user correctly identified a 4xx error, but logs show 502
2. **Monitoring**: Can't distinguish between USDA config issues vs actual gateway failures
3. **Client Experience**: Can't provide specific guidance (e.g., "rate limited" vs "server error")

## Immediate Workaround

Until the code is fixed, look for the USDA status in the Edge Function logs:

```
[food-search][req_xxx][usda-api][error] {"attempt":1,"status":401,"statusText":"Unauthorized","error":"Invalid API key"}
```

The actual status is logged but not returned to the client!
