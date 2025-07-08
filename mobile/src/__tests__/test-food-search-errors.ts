/**
 * Test script to verify food search error handling
 * Tests various error scenarios to ensure proper error messages are returned
 */

import { supabase } from '../services/supabase';

// Helper to call the Edge Function
async function testFoodSearch(query: string, scenario: string) {
  console.log(`\n=== Testing ${scenario} ===`);
  console.log(`Query: "${query}"`);

  try {
    const { data, error } = await supabase.functions.invoke('food-search', {
      body: { query, limit: 10 },
    });

    if (error) {
      console.log('Supabase error:', error);
      console.log('Error message:', error.message);
      console.log('Error details:', error.details);
      return;
    }

    if (data) {
      console.log('Success! Response:', {
        resultGroups: data.resultGroups?.length || 0,
        totalResults: data.meta?.totalResults || 0,
        processingTime: data.meta?.processingTime || 0,
      });
    }
  } catch (err: any) {
    console.log('Caught error:', err);
    console.log('Error type:', err.constructor.name);
    console.log('Error message:', err.message);
    if (err.response) {
      console.log('Response status:', err.response.status);
      console.log('Response data:', err.response.data);
    }
  }
}

// Helper to test with invalid auth token
async function testInvalidAuth() {
  console.log('\n=== Testing Invalid Auth Token ===');

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/food-search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid-token-here',
        },
        body: JSON.stringify({ query: 'chicken' }),
      }
    );

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (err: any) {
    console.log('Network error:', err.message);
  }
}

// Helper to test rate limiting
async function testRateLimit() {
  console.log('\n=== Testing Rate Limiting ===');
  console.log('Sending 15 rapid requests...');

  const promises = [];
  for (let i = 0; i < 15; i++) {
    promises.push(
      supabase.functions.invoke('food-search', {
        body: { query: `test${i}`, limit: 5 },
      })
    );
  }

  const results = await Promise.allSettled(promises);

  let successCount = 0;
  let rateLimitCount = 0;
  let otherErrorCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { data, error } = result.value;
      if (!error) {
        successCount++;
      } else if (
        error.message?.includes('rate limit') ||
        error.details?.stage === 'rate-limiting'
      ) {
        rateLimitCount++;
        if (rateLimitCount === 1) {
          console.log('First rate limit error:', error);
        }
      } else {
        otherErrorCount++;
        console.log(`Request ${index} other error:`, error);
      }
    } else {
      otherErrorCount++;
      console.log(`Request ${index} rejected:`, result.reason);
    }
  });

  console.log(
    `Results: ${successCount} success, ${rateLimitCount} rate limited, ${otherErrorCount} other errors`
  );
}

// Helper to test USDA API errors
async function testUSDAErrors() {
  console.log('\n=== Testing USDA API Error Scenarios ===');

  // Test 1: Very long query (should trigger 400 from our validation)
  await testFoodSearch('a'.repeat(101), 'Very Long Query (>100 chars)');

  // Test 2: Special characters that might cause USDA issues
  await testFoodSearch('!@#$%^&*()', 'Special Characters');

  // Test 3: Empty string (should be caught by validation)
  await testFoodSearch('', 'Empty Query');

  // Test 4: SQL injection attempt (should be handled safely)
  await testFoodSearch("'; DROP TABLE foods; --", 'SQL Injection Attempt');

  // Test 5: Normal query that should succeed
  await testFoodSearch('chicken breast', 'Normal Query (Should Succeed)');
}

// Main test runner
export async function runFoodSearchErrorTests() {
  console.log('Starting Food Search Error Handling Tests...');
  console.log('=========================================');

  // First, ensure we're authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log('Error: Not authenticated. Please log in first.');
    return;
  }

  console.log(`Authenticated as: ${user.email}`);

  // Run all tests
  await testUSDAErrors();
  await testInvalidAuth();
  await testRateLimit();

  console.log('\n=========================================');
  console.log('All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runFoodSearchErrorTests().catch(console.error);
}
