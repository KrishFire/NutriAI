/**
 * Test Matrix for Edge Function Error Code Transformation
 *
 * This test verifies how the food-search Edge Function transforms
 * various USDA API error responses into client-facing error codes.
 *
 * Test scenarios:
 * 1. USDA returns 401 (bad API key) → Edge Function returns ?
 * 2. USDA returns 403 (forbidden) → Edge Function returns ?
 * 3. USDA returns 429 (rate limit) → Edge Function returns ?
 * 4. USDA timeout → Edge Function returns ?
 * 5. USDA returns 500 → Edge Function returns ?
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the Edge Function behavior based on the actual code
class EdgeFunctionSimulator {
  private usdaApiKey: string;
  private maxRetries = 3;

  constructor(apiKey: string) {
    this.usdaApiKey = apiKey;
  }

  async searchUSDAFoods(
    query: string,
    mockResponse: {
      status: number;
      statusText: string;
      body?: any;
      shouldTimeout?: boolean;
    }
  ) {
    const requestId = `test_${Date.now()}`;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Simulate timeout
        if (mockResponse.shouldTimeout) {
          throw new Error('Network timeout');
        }

        // Simulate USDA API response
        const response = {
          ok: mockResponse.status >= 200 && mockResponse.status < 300,
          status: mockResponse.status,
          statusText: mockResponse.statusText,
          text: async () =>
            JSON.stringify(
              mockResponse.body || { error: mockResponse.statusText }
            ),
          json: async () => mockResponse.body || {},
        };

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`[${requestId}][usda-api][error]`, {
            attempt,
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });

          // Special handling for rate limit (429)
          if (response.status === 429) {
            if (attempt < this.maxRetries) {
              // Simulate retry with exponential backoff
              console.log(`[${requestId}][rate-limit-retry]`, { attempt });
              continue;
            }
          }

          // This is the key line - throwing generic Error loses the status code!
          throw new Error(`USDA API error ${response.status}: ${errorText}`);
        }

        return response;
      } catch (error) {
        if (attempt < this.maxRetries && mockResponse.status === 429) {
          continue;
        }
        throw error;
      }
    }
  }

  async handleRequest(query: string, mockUsdaResponse: any) {
    try {
      const response = await this.searchUSDAFoods(query, mockUsdaResponse);
      return { status: 200, body: { success: true } };
    } catch (error: any) {
      console.log('[usda-api-error]', { error: error.message });

      // This is where the transformation happens - all errors become 502!
      return {
        status: 502,
        body: {
          stage: 'usda-api',
          error: 'Failed to search food database. Please try again.',
          requestId: 'test',
        },
      };
    }
  }
}

describe('Edge Function Error Code Transformation Matrix', () => {
  let edgeFunction: EdgeFunctionSimulator;

  beforeEach(() => {
    edgeFunction = new EdgeFunctionSimulator('test-api-key');
  });

  it('USDA 401 (Unauthorized) → Edge Function returns 502', async () => {
    const result = await edgeFunction.handleRequest('chicken', {
      status: 401,
      statusText: 'Unauthorized',
      body: { error: 'Invalid API key' },
    });

    expect(result.status).toBe(502); // NOT 401!
    expect(result.body.stage).toBe('usda-api');
    expect(result.body.error).toBe(
      'Failed to search food database. Please try again.'
    );
  });

  it('USDA 403 (Forbidden) → Edge Function returns 502', async () => {
    const result = await edgeFunction.handleRequest('chicken', {
      status: 403,
      statusText: 'Forbidden',
      body: { error: 'Access denied' },
    });

    expect(result.status).toBe(502); // NOT 403!
    expect(result.body.stage).toBe('usda-api');
  });

  it('USDA 429 (Rate Limit) after retries → Edge Function returns 502', async () => {
    const result = await edgeFunction.handleRequest('chicken', {
      status: 429,
      statusText: 'Too Many Requests',
      body: { error: 'Rate limit exceeded' },
    });

    expect(result.status).toBe(502); // NOT 429!
    expect(result.body.stage).toBe('usda-api');
  });

  it('USDA 404 (Not Found) → Edge Function returns 502', async () => {
    const result = await edgeFunction.handleRequest('chicken', {
      status: 404,
      statusText: 'Not Found',
      body: { error: 'Endpoint not found' },
    });

    expect(result.status).toBe(502); // NOT 404!
  });

  it('USDA 500 (Internal Server Error) → Edge Function returns 502', async () => {
    const result = await edgeFunction.handleRequest('chicken', {
      status: 500,
      statusText: 'Internal Server Error',
      body: { error: 'USDA server error' },
    });

    expect(result.status).toBe(502); // Consistent 502
  });

  it('USDA timeout → Edge Function returns 502', async () => {
    const result = await edgeFunction.handleRequest('chicken', {
      status: 0,
      statusText: '',
      shouldTimeout: true,
    });

    expect(result.status).toBe(502);
    expect(result.body.stage).toBe('usda-api');
  });

  // The fix would be to preserve error codes like this:
  describe('Proposed Fix: Preserve Error Context', () => {
    class ImprovedEdgeFunction extends EdgeFunctionSimulator {
      async handleRequest(query: string, mockUsdaResponse: any) {
        try {
          const response = await this.searchUSDAFoods(query, mockUsdaResponse);
          return { status: 200, body: { success: true } };
        } catch (error: any) {
          console.log('[usda-api-error]', { error: error.message });

          // Extract the original status code from the error message
          const statusMatch = error.message.match(/USDA API error (\d+):/);
          const originalStatus = statusMatch ? parseInt(statusMatch[1]) : 500;

          // Map USDA errors to appropriate client-facing errors
          let clientStatus: number;
          let clientMessage: string;

          switch (originalStatus) {
            case 401:
            case 403:
              // These are server config issues, not client's fault
              clientStatus = 500;
              clientMessage =
                'Food database configuration error. Please contact support.';
              break;
            case 429:
              // Rate limit should be passed through
              clientStatus = 429;
              clientMessage =
                'Too many requests. Please wait before trying again.';
              break;
            case 404:
              // USDA endpoint issue
              clientStatus = 502;
              clientMessage = 'Food database service unavailable.';
              break;
            default:
              // Generic gateway error for other cases
              clientStatus = 502;
              clientMessage =
                'Failed to search food database. Please try again.';
          }

          return {
            status: clientStatus,
            body: {
              stage: 'usda-api',
              error: clientMessage,
              requestId: 'test',
              // Include original status in debug info (not shown to client)
              _debug: { originalStatus, originalError: error.message },
            },
          };
        }
      }
    }

    it('should return 500 for USDA authentication errors', async () => {
      const improvedFunction = new ImprovedEdgeFunction('test-api-key');
      const result = await improvedFunction.handleRequest('chicken', {
        status: 401,
        statusText: 'Unauthorized',
      });

      expect(result.status).toBe(500); // Server misconfiguration
      expect(result.body.error).toContain('configuration error');
      expect(result.body._debug.originalStatus).toBe(401);
    });

    it('should return 429 for rate limit errors', async () => {
      const improvedFunction = new ImprovedEdgeFunction('test-api-key');
      const result = await improvedFunction.handleRequest('chicken', {
        status: 429,
        statusText: 'Too Many Requests',
      });

      expect(result.status).toBe(429); // Pass through rate limit
      expect(result.body.error).toContain('Too many requests');
    });
  });
});

// Summary of findings:
console.log(`
ERROR CODE TRANSFORMATION SUMMARY:
=================================
Current Behavior:
- ALL USDA 4xx errors → Edge Function 502
- ALL USDA 5xx errors → Edge Function 502
- Network timeouts → Edge Function 502

Key Issue:
The line "throw new Error(\`USDA API error \${response.status}: \${errorText}\`);"
converts the typed Response into a generic Error, losing the status code.
The catch block then blindly returns 502 for ANY error.

This explains why the user sees 500/502 in logs when the actual error is 4xx!
`);
