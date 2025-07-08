/**
 * Test script to verify enhanced Edge Function debugging capabilities
 */

import { supabase } from '../config/supabase';

// Test configuration
const TEST_CASES = [
  {
    name: 'Missing Authorization Header',
    headers: {},
    expectedStatus: 401,
    expectedAuthStatus: 'Missing-Token',
  },
  {
    name: 'Malformed Authorization Header',
    headers: { Authorization: 'InvalidFormat token123' },
    expectedStatus: 401,
    expectedAuthStatus: 'Malformed-Token',
  },
  {
    name: 'Invalid Bearer Token',
    headers: { Authorization: 'Bearer invalid-token-format' },
    expectedStatus: 401,
    expectedAuthStatus: 'Invalid-Token',
  },
  {
    name: 'Debug Mode with Valid Auth',
    headers: { 'X-Debug-Mode': 'true' },
    useAuth: true,
    expectedStatus: 400, // No image provided
    expectedAuthStatus: 'Authenticated',
  },
];

async function runDebugTests() {
  console.log('🔍 Testing Enhanced Edge Function Debugging\n');

  for (const testCase of TEST_CASES) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('─'.repeat(50));

    try {
      // Get auth token if needed
      let authToken = '';
      if (testCase.useAuth) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          authToken = session.access_token;
          console.log('✅ Using authenticated session');
        } else {
          console.log('⚠️  No active session, skipping test');
          continue;
        }
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...testCase.headers,
      };

      if (authToken && !headers.Authorization) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // Make request
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/analyze-meal`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            // Empty payload to trigger validation error
          }),
        }
      );

      // Check response headers
      console.log('\n📊 Response Details:');
      console.log(`  Status: ${response.status}`);
      console.log(`  X-Request-ID: ${response.headers.get('X-Request-ID')}`);
      console.log(`  X-Auth-Status: ${response.headers.get('X-Auth-Status')}`);
      console.log(`  Server-Timing: ${response.headers.get('Server-Timing')}`);

      // Parse response body
      const body = await response.json();
      console.log('\n📄 Response Body:');
      console.log(JSON.stringify(body, null, 2));

      // Verify expectations
      if (response.status === testCase.expectedStatus) {
        console.log(
          `\n✅ Status code matches expected: ${testCase.expectedStatus}`
        );
      } else {
        console.log(
          `\n❌ Status code mismatch! Expected: ${testCase.expectedStatus}, Got: ${response.status}`
        );
      }

      const authStatus = response.headers.get('X-Auth-Status');
      if (authStatus === testCase.expectedAuthStatus) {
        console.log(
          `✅ Auth status matches expected: ${testCase.expectedAuthStatus}`
        );
      } else {
        console.log(
          `❌ Auth status mismatch! Expected: ${testCase.expectedAuthStatus}, Got: ${authStatus}`
        );
      }

      // Check for debug info if debug mode is enabled
      if (testCase.headers['X-Debug-Mode'] === 'true' && body._debug) {
        console.log('\n🐛 Debug Information:');
        console.log(JSON.stringify(body._debug, null, 2));
      }
    } catch (error) {
      console.log(`\n❌ Test failed with error: ${error.message}`);
    }
  }

  console.log('\n\n✅ Debug testing complete!\n');
}

// Run tests
runDebugTests().catch(console.error);
