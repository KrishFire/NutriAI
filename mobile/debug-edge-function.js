/**
 * DIRECT EDGE FUNCTION DEBUGGING SCRIPT
 * 
 * This script tests the food-search edge function directly to identify
 * the exact cause of the "non-2xx status code" error.
 */

const SUPABASE_URL = 'https://cdqtuxepvomeyfkvfrnj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/food-search`;

async function debugEdgeFunction() {
  console.log('🔍 FORENSIC ANALYSIS: Food Search Edge Function');
  console.log('==============================================');
  console.log(`Target: ${EDGE_FUNCTION_URL}`);
  console.log('');

  // Test 1: OPTIONS request (CORS preflight)
  console.log('📋 Test 1: CORS preflight check...');
  try {
    const optionsResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization, content-type'
      }
    });
    
    console.log(`   Status: ${optionsResponse.status}`);
    console.log(`   Headers:`, Object.fromEntries(optionsResponse.headers.entries()));
    
    if (optionsResponse.status === 200) {
      console.log('   ✅ CORS preflight successful');
    } else {
      console.log('   ❌ CORS preflight failed');
    }
  } catch (error) {
    console.log('   ❌ CORS preflight error:', error.message);
  }
  console.log('');

  // Test 2: POST without auth (should get 401)
  console.log('📋 Test 2: POST without authentication...');
  try {
    const noAuthResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'apple' })
    });
    
    console.log(`   Status: ${noAuthResponse.status}`);
    const noAuthText = await noAuthResponse.text();
    console.log(`   Response: ${noAuthText}`);
    
    if (noAuthResponse.status === 401) {
      console.log('   ✅ Correctly rejects requests without auth');
    } else {
      console.log('   ⚠️ Unexpected response to unauthenticated request');
    }
  } catch (error) {
    console.log('   ❌ No auth test error:', error.message);
  }
  console.log('');

  // Test 3: POST with anon key as bearer token
  console.log('📋 Test 3: POST with anon key as bearer token...');
  try {
    const authResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        query: 'apple',
        limit: 5,
        page: 1
      })
    });
    
    console.log(`   Status: ${authResponse.status}`);
    console.log(`   Headers:`, Object.fromEntries(authResponse.headers.entries()));
    
    const authText = await authResponse.text();
    console.log(`   Response body (first 500 chars): ${authText.substring(0, 500)}`);
    
    if (authResponse.status >= 400) {
      console.log('   ❌ REQUEST FAILED - This is the "non-2xx status code" error!');
      
      // Try to parse as JSON for structured error
      try {
        const errorData = JSON.parse(authText);
        console.log('   🎯 STRUCTURED ERROR DETAILS:');
        console.log(`      Stage: ${errorData.stage || 'unknown'}`);
        console.log(`      Error: ${errorData.error || 'unknown'}`);
        console.log(`      Request ID: ${errorData.requestId || 'unknown'}`);
        
        if (errorData.stage === 'environment' && errorData.error?.includes('USDA API key')) {
          console.log('   🚨 ROOT CAUSE IDENTIFIED: USDA API key missing from environment!');
        } else if (errorData.stage === 'authentication') {
          console.log('   🚨 ROOT CAUSE IDENTIFIED: Authentication failure!');
        } else {
          console.log('   🔍 Different issue detected - see error details above');
        }
      } catch {
        console.log('   🔍 Raw error response (not JSON)');
      }
    } else {
      console.log('   ✅ Request successful!');
    }
  } catch (error) {
    console.log('   ❌ Auth test error:', error.message);
  }
  console.log('');

  // Test 4: Invalid bearer token (should get 401)
  console.log('📋 Test 4: POST with invalid bearer token...');
  try {
    const invalidAuthResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-12345',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ query: 'apple' })
    });
    
    console.log(`   Status: ${invalidAuthResponse.status}`);
    const invalidAuthText = await invalidAuthResponse.text();
    console.log(`   Response: ${invalidAuthText}`);
    
    if (invalidAuthResponse.status === 401) {
      console.log('   ✅ Correctly rejects invalid auth tokens');
    } else {
      console.log('   ⚠️ Unexpected response to invalid auth');
    }
  } catch (error) {
    console.log('   ❌ Invalid auth test error:', error.message);
  }
  console.log('');

  console.log('🎯 ANALYSIS COMPLETE');
  console.log('================');
  console.log('Next steps based on results:');
  console.log('1. If 500 error with "USDA API key" message → Configure USDA_API_KEY in Supabase');
  console.log('2. If 401 error → Fix authentication token generation in client');
  console.log('3. If different error → Check edge function logs and deployment');
}

// Run the debug function
debugEdgeFunction().catch(console.error);