#!/usr/bin/env node

/**
 * Script to verify and fix the Edge Function error transformation issue
 *
 * This script demonstrates:
 * 1. How USDA 4xx errors are transformed to 502
 * 2. A proposed fix to preserve error context
 */

const https = require('https');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

console.log(
  `${colors.cyan}=== Edge Function Error Transformation Verification ===${colors.reset}\n`
);

// Test scenarios
const testScenarios = [
  {
    name: 'Valid API Key Test',
    apiKey: 'DEMO_KEY', // USDA's demo key
    expectedUsdaStatus: 200,
    expectedEdgeStatus: 200,
  },
  {
    name: 'Invalid API Key Test',
    apiKey: 'INVALID_KEY_12345',
    expectedUsdaStatus: 403, // or 401
    expectedEdgeStatus: 502, // Currently returns 502, should be 500
  },
  {
    name: 'Missing API Key Test',
    apiKey: '',
    expectedUsdaStatus: 403,
    expectedEdgeStatus: 502, // Currently returns 502, should be 500
  },
];

// Test USDA API directly
async function testUSDADirectly(apiKey, query = 'chicken') {
  return new Promise(resolve => {
    const postData = JSON.stringify({
      query: query,
      pageSize: 1,
    });

    const options = {
      hostname: 'api.nal.usda.gov',
      port: 443,
      path: '/fdc/v1/foods/search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'X-API-Key': apiKey,
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusMessage: res.statusMessage,
          data: data.substring(0, 200), // First 200 chars
        });
      });
    });

    req.on('error', e => {
      resolve({
        status: 0,
        statusMessage: 'Network Error',
        data: e.message,
      });
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log(
    `${colors.blue}Testing USDA API directly to understand error responses...${colors.reset}\n`
  );

  for (const scenario of testScenarios) {
    console.log(`${colors.yellow}Test: ${scenario.name}${colors.reset}`);
    console.log(`API Key: ${scenario.apiKey || '(empty)'}`);

    const result = await testUSDADirectly(scenario.apiKey);

    const statusColor =
      result.status === scenario.expectedUsdaStatus ? colors.green : colors.red;
    console.log(
      `${statusColor}Status: ${result.status} ${result.statusMessage}${colors.reset}`
    );
    console.log(`Response: ${result.data}\n`);
  }

  console.log(`${colors.magenta}Key Finding:${colors.reset}`);
  console.log(
    'When USDA API returns 403/401, the Edge Function code at line 496 throws:'
  );
  console.log(
    `${colors.red}throw new Error(\`USDA API error \${response.status}: \${errorText}\`);${colors.reset}`
  );
  console.log(
    '\nThis Error object loses the status code, causing line 735 to return 502 for ALL errors!\n'
  );

  console.log(`${colors.green}Proposed Fix:${colors.reset}`);
  console.log('```typescript');
  console.log('// Create a custom error class that preserves the status code');
  console.log('class USDAAPIError extends Error {');
  console.log(
    '  constructor(public status: number, public statusText: string, message: string) {'
  );
  console.log('    super(message);');
  console.log('    this.name = "USDAAPIError";');
  console.log('  }');
  console.log('}');
  console.log('');
  console.log('// Line 496 becomes:');
  console.log(
    'throw new USDAAPIError(response.status, response.statusText, errorText);'
  );
  console.log('');
  console.log('// Lines 727-737 become:');
  console.log('} catch (error) {');
  console.log('  log("usda-api-error", { ');
  console.log('    error: error.message,');
  console.log(
    '    status: error instanceof USDAAPIError ? error.status : undefined'
  );
  console.log('  });');
  console.log('  ');
  console.log('  // Map USDA errors to appropriate client-facing errors');
  console.log('  if (error instanceof USDAAPIError) {');
  console.log('    if (error.status === 401 || error.status === 403) {');
  console.log('      // API key issues are server configuration problems');
  console.log('      return new Response(');
  console.log('        JSON.stringify({');
  console.log('          stage: "usda-api-configuration",');
  console.log('          error: "Food database service configuration error",');
  console.log('          requestId,');
  console.log(
    '          // Include hint for developers (not shown to end users)'
  );
  console.log('          hint: "Check USDA_API_KEY configuration"');
  console.log('        }),');
  console.log(
    '        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }'
  );
  console.log('      );');
  console.log('    }');
  console.log('    ');
  console.log('    if (error.status === 429) {');
  console.log('      return new Response(');
  console.log('        JSON.stringify({');
  console.log('          stage: "usda-api-rate-limit",');
  console.log(
    '          error: "Food database rate limit exceeded. Please try again later.",'
  );
  console.log('          requestId');
  console.log('        }),');
  console.log(
    '        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }'
  );
  console.log('      );');
  console.log('    }');
  console.log('  }');
  console.log('  ');
  console.log('  // Default to 502 for other errors');
  console.log('  return new Response(');
  console.log('    JSON.stringify({');
  console.log('      stage: "usda-api",');
  console.log(
    '      error: "Failed to search food database. Please try again.",'
  );
  console.log('      requestId');
  console.log('    }),');
  console.log(
    '    { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }'
  );
  console.log('  );');
  console.log('}');
  console.log('```');
}

// Run the tests
runTests().catch(console.error);
