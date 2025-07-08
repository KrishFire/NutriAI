# Edge Function Enhanced Debugging Guide

## Overview

The analyze-meal Edge Function now includes comprehensive debugging capabilities to help diagnose authentication, processing, and error issues.

## New Debug Headers

### Request Headers

- **X-Debug-Mode**: Set to `'true'` to enable debug mode

### Response Headers (Always Included)

- **X-Request-ID**: Unique request identifier for correlation with server logs
- **X-Auth-Status**: Specific authentication state
  - `Pre-Auth`: Request failed before authentication
  - `Missing-Token`: No Authorization header
  - `Malformed-Token`: Invalid Authorization header format
  - `Invalid-Token`: Generic invalid token
  - `Expired-Token`: Token has expired
  - `Malformed-JWT`: JWT structure is invalid
  - `Invalid-Signature`: JWT signature verification failed
  - `Auth-System-Error`: Internal auth system failure
  - `Authenticated`: Successfully authenticated
  - `Unknown`: Fatal error before auth could be determined

- **Server-Timing**: Total processing time in milliseconds
- **X-Processing-Status**: Success/failure indicator for successful requests
- **X-OpenAI-Status**: OpenAI API response status (when applicable)

### CORS Headers

The function now exposes these headers via `Access-Control-Expose-Headers`:

- X-Request-ID
- X-Auth-Status
- Server-Timing
- X-Debug-Info

## Debug Mode Features

When `X-Debug-Mode: true` is set in the request:

### Error Responses Include `_debug` Object

```json
{
  "stage": "authentication",
  "error": "Invalid or expired token",
  "requestId": "req_1234567890_abc123",
  "_debug": {
    "errorCode": "PGRST301",
    "errorMessage": "JWT expired",
    "authTiming": 145
  }
}
```

### Success Responses Include Performance Metrics

```json
{
  "foods": [...],
  "totalNutrition": {...},
  "_debug": {
    "processingTimeMs": 2341,
    "foodCount": 3,
    "totalCalories": 650,
    "confidence": 0.85
  }
}
```

## Common Error Patterns

### 401 Authentication Errors

Check the `X-Auth-Status` header to determine the exact cause:

- `Missing-Token`: Add Authorization header
- `Malformed-Token`: Use `Bearer <token>` format
- `Expired-Token`: Refresh the user session
- `Invalid-Signature`: Token corruption or wrong project

### 500 Server Errors

Debug mode will include stack traces and detailed error information:

- Environment configuration issues
- External API failures
- Data parsing errors

### 502 Gateway Errors

Usually indicates OpenAI API issues:

- Check `X-OpenAI-Status` header
- Debug mode includes OpenAI response headers

## Testing the Enhanced Function

### Basic Auth Testing

```typescript
// Test missing auth
const response = await fetch(edgeFunctionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Debug-Mode': 'true',
  },
  body: JSON.stringify({}),
});

console.log('Auth Status:', response.headers.get('X-Auth-Status')); // "Missing-Token"
console.log('Request ID:', response.headers.get('X-Request-ID'));
```

### Full Debug Mode Testing

```typescript
const response = await fetch(edgeFunctionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
    'X-Debug-Mode': 'true',
  },
  body: JSON.stringify({
    imageBase64: imageData,
    voiceTranscription: 'Grilled chicken with vegetables',
  }),
});

const body = await response.json();
if (body._debug) {
  console.log('Debug info:', body._debug);
}
```

## Correlation with Server Logs

The `X-Request-ID` header value can be used to find related logs in Supabase:

```bash
# In Supabase logs, search for:
[analyze-meal][req_1234567890_abc123]
```

This allows matching client-side errors with server-side logs for complete debugging visibility.

## Security Considerations

- Debug mode only adds information to responses; it doesn't bypass security
- Sensitive data like full tokens or API keys are never exposed
- Stack traces are truncated to prevent information leakage
- Debug information is only included when explicitly requested

## Migration Notes

- The enhanced function is backward compatible
- Existing clients will continue to work without modification
- New headers are exposed via CORS for browser-based clients
- Debug mode is opt-in and doesn't affect production performance
