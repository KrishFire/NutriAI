# Food Search Debug Instrumentation Summary

## What We've Implemented

### 1. Correlation IDs

- Every search request now generates a unique UUID correlation ID
- This ID is passed through the entire request lifecycle
- The ID is sent to the Edge Function via `X-Correlation-ID` header
- All logs include this ID for end-to-end tracing

### 2. Structured Logging

- Created a `logger` utility with three levels: `debug`, `info`, `error`
- In development (`__DEV__`): Pretty-printed logs with emojis
- In production: JSON-structured logs for parsing
- Debug mode can be toggled via `EXPO_PUBLIC_DEBUG_FOOD_SEARCH` env variable

### 3. Comprehensive Checkpoints

We now log at these key stages:

#### Client-Side (foodSearch.ts)

- **SEARCH_START**: Initial request with query and options
- **VALIDATION**: Input validation check
- **VALIDATION_PASSED/FAILED**: Validation result
- **CACHE_CHECK**: Looking for cached results
- **CACHE_HIT/MISS**: Cache lookup result
- **AUTH_CHECK**: Starting authentication verification
- **AUTH_SUCCESS/ERROR/MISSING**: Authentication result with user ID
- **REQUEST_BUILD**: Request payload construction
- **API_CALL_START**: Edge Function invocation begins
- **API_CALL_COMPLETE**: Response received (with duration)
- **API_ERROR**: If Edge Function returns error
- **API_ERROR_DETAILS**: Parsed error response body
- **RESPONSE_PARSE**: Starting response validation
- **RESPONSE_VALID/INVALID**: Response format check
- **CACHE_SET**: Successful result cached
- **SEARCH_SUCCESS**: Complete with timing and result count
- **SEARCH_FATAL_ERROR**: Unexpected errors with stack trace

#### Server-Side (Edge Function)

The Edge Function already has comprehensive logging with:

- Request ID generation
- Stage checkpoints (auth, validation, USDA API call, etc.)
- Detailed error context
- Processing time measurements

### 4. Enhanced Error Details

- Errors now include the correlation ID in the `requestId` field
- API errors attempt to parse the response body for details
- Stack traces included for fatal errors
- Specific error stages help pinpoint where failures occur

### 5. Debug Information Flow

```
Client generates correlationId → Passes via X-Correlation-ID header →
Edge Function logs with same ID → Errors return server's requestId →
Client can correlate its logs with server logs
```

### 6. Security Considerations

- Debug mode is opt-in via environment variable
- No sensitive data (tokens, keys) logged
- Server-side verbose logging controlled separately
- No debug headers sent unless explicitly enabled

## How This Helps Debugging

1. **Complete Request Tracing**: Follow a request from start to finish using correlation ID
2. **Pinpoint Failure Stage**: Know exactly where in the flow things break
3. **Timing Information**: See how long each stage takes
4. **Error Context**: Get detailed error information including server responses
5. **Cache Behavior**: Understand when cache is used vs API calls
6. **Authentication State**: Clear visibility into auth issues

## Next Steps for the User

1. Set `EXPO_PUBLIC_DEBUG_FOOD_SEARCH=true` in `.env`
2. Restart the app
3. Try the food search that's failing
4. Copy all logs from `SEARCH_START` to the error
5. Note the correlation ID and the stage where it fails
6. Check Supabase Function logs for the same correlation ID
7. Share the complete log sequence

This comprehensive instrumentation should reveal exactly what's happening when the search fails.
