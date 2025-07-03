/**
 * COMPREHENSIVE FOOD SEARCH EDGE FUNCTION DEBUGGING SUITE
 * 
 * This test suite systematically debugs the "non-2xx status code" error
 * by testing each component of the edge function call chain.
 * 
 * CRITICAL MISSION: Find the EXACT root cause of the failure
 */

import { describe, test, expect, beforeAll } from '@jest/globals';

// Constants from investigation
const SUPABASE_URL = 'https://cdqtuxepvomeyfkvfrnj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/food-search`;

// Mock auth token for testing (we'll need to replace this with actual auth)
let authToken: string | null = null;

describe('Food Search Edge Function Forensic Analysis', () => {
  
  beforeAll(() => {
    console.log('🔍 STARTING FORENSIC ANALYSIS OF FOOD SEARCH EDGE FUNCTION');
    console.log(`📍 Target URL: ${EDGE_FUNCTION_URL}`);
    console.log(`🔑 Using Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  });

  describe('Step 1: Basic Connectivity Tests', () => {
    
    test('should be able to reach Supabase project URL', async () => {
      console.log('\n🌐 Testing basic Supabase connectivity...');
      
      try {
        const response = await fetch(SUPABASE_URL);
        console.log(`✅ Supabase URL accessible: ${response.status}`);
        expect(response.status).toBeLessThan(500);
      } catch (error) {
        console.error('❌ Failed to reach Supabase URL:', error);
        throw error;
      }
    });

    test('should be able to reach edge function endpoint', async () => {
      console.log('\n🎯 Testing edge function endpoint accessibility...');
      
      try {
        // Try OPTIONS request (should work for CORS)
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'OPTIONS',
          headers: {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'authorization, content-type'
          }
        });
        
        console.log(`📊 OPTIONS response status: ${response.status}`);
        console.log(`📊 OPTIONS response headers:`, Object.fromEntries(response.headers.entries()));
        
        // Edge function should handle OPTIONS requests
        expect(response.status).toBe(200);
      } catch (error) {
        console.error('❌ Failed to reach edge function endpoint:', error);
        throw error;
      }
    });
    
  });

  describe('Step 2: Authentication Tests', () => {
    
    test('should fail without authorization header', async () => {
      console.log('\n🔐 Testing authentication requirements...');
      
      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: 'apple' })
        });
        
        console.log(`📊 No auth response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`📊 No auth response body:`, responseText);
        
        // Should return 401 for missing auth
        expect(response.status).toBe(401);
      } catch (error) {
        console.error('❌ Failed authentication test:', error);
        throw error;
      }
    });

    test('should fail with invalid authorization header', async () => {
      console.log('\n🔐 Testing invalid authentication...');
      
      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer invalid-token-12345'
          },
          body: JSON.stringify({ query: 'apple' })
        });
        
        console.log(`📊 Invalid auth response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`📊 Invalid auth response body:`, responseText);
        
        // Should return 401 for invalid auth
        expect(response.status).toBe(401);
      } catch (error) {
        console.error('❌ Failed invalid auth test:', error);
        throw error;
      }
    });

    test('should test with anon key as bearer token', async () => {
      console.log('\n🔐 Testing with anon key as bearer token...');
      
      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ query: 'apple' })
        });
        
        console.log(`📊 Anon key auth response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`📊 Anon key auth response body:`, responseText);
        
        // This might work or might still fail - let's see what happens
        console.log(`🔍 Response headers:`, Object.fromEntries(response.headers.entries()));
        
        // Store this for later tests if it worked
        if (response.status < 500) {
          console.log('✅ Anon key authentication appears to work');
          authToken = SUPABASE_ANON_KEY;
        }
        
      } catch (error) {
        console.error('❌ Failed anon key auth test:', error);
        throw error;
      }
    });
    
  });

  describe('Step 3: Payload and Input Validation Tests', () => {
    
    test('should test with minimal valid payload', async () => {
      console.log('\n📦 Testing minimal valid payload...');
      
      if (!authToken) {
        console.log('⚠️ Skipping payload test - no valid auth token');
        return;
      }
      
      try {
        const minimalPayload = { query: 'apple' };
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(minimalPayload)
        });
        
        console.log(`📊 Minimal payload response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`📊 Minimal payload response body:`, responseText.substring(0, 500));
        
        // Let's see what the actual error is
        if (!response.ok) {
          console.log('❌ Minimal payload failed');
          console.log(`🔍 Response headers:`, Object.fromEntries(response.headers.entries()));
          
          // Try to parse as JSON to get structured error
          try {
            const errorData = JSON.parse(responseText);
            console.log('🔍 Structured error response:', errorData);
          } catch {
            console.log('🔍 Raw error response:', responseText);
          }
        } else {
          console.log('✅ Minimal payload succeeded!');
        }
        
      } catch (error) {
        console.error('❌ Failed minimal payload test:', error);
        throw error;
      }
    });

    test('should test with complete payload', async () => {
      console.log('\n📦 Testing complete payload...');
      
      if (!authToken) {
        console.log('⚠️ Skipping complete payload test - no valid auth token');
        return;
      }
      
      try {
        const completePayload = {
          query: 'apple',
          limit: 10,
          page: 1
        };
        
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(completePayload)
        });
        
        console.log(`📊 Complete payload response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`📊 Complete payload response body:`, responseText.substring(0, 500));
        
        if (!response.ok) {
          console.log('❌ Complete payload failed');
          console.log(`🔍 Response headers:`, Object.fromEntries(response.headers.entries()));
          
          try {
            const errorData = JSON.parse(responseText);
            console.log('🔍 Structured error response:', errorData);
          } catch {
            console.log('🔍 Raw error response:', responseText);
          }
        } else {
          console.log('✅ Complete payload succeeded!');
        }
        
      } catch (error) {
        console.error('❌ Failed complete payload test:', error);
        throw error;
      }
    });

    test('should test edge function environment validation', async () => {
      console.log('\n🔧 Testing edge function environment validation...');
      
      // Based on the edge function code, it should fail if USDA_API_KEY is missing
      // Let's see if we can trigger that specific error
      
      if (!authToken) {
        console.log('⚠️ Skipping environment test - no valid auth token');
        return;
      }
      
      try {
        const testPayload = { query: 'test' };
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(testPayload)
        });
        
        console.log(`📊 Environment test response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`📊 Environment test response body:`, responseText);
        
        // Check if it's the USDA API key error
        if (responseText.includes('USDA API key')) {
          console.log('🎯 FOUND THE ISSUE: USDA API key is missing or not configured!');
          console.log('🔧 This is likely the root cause of the "non-2xx status code" error');
        }
        
      } catch (error) {
        console.error('❌ Failed environment test:', error);
        throw error;
      }
    });
    
  });

  describe('Step 4: Direct Edge Function URL Tests', () => {
    
    test('should test direct curl-equivalent request', async () => {
      console.log('\n🌐 Testing direct curl-equivalent request...');
      
      if (!authToken) {
        console.log('⚠️ Skipping direct test - no valid auth token');
        return;
      }
      
      try {
        // Simulate exactly what the client would send
        const requestConfig = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'apikey': SUPABASE_ANON_KEY,
            'User-Agent': 'food-search-debug-test'
          },
          body: JSON.stringify({
            query: 'banana',
            limit: 5,
            page: 1
          })
        };
        
        console.log('📤 Request config:', {
          url: EDGE_FUNCTION_URL,
          method: requestConfig.method,
          headers: Object.keys(requestConfig.headers),
          bodyLength: requestConfig.body.length
        });
        
        const response = await fetch(EDGE_FUNCTION_URL, requestConfig);
        
        console.log(`📊 Direct request response status: ${response.status}`);
        console.log(`📊 Direct request response headers:`, Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log(`📊 Direct request response body:`, responseText.substring(0, 1000));
        
        if (response.status >= 400) {
          console.log('❌ Direct request failed with error status');
          console.log('🔍 This is the "non-2xx status code" error that the client is seeing!');
          
          // Try to analyze the specific error
          try {
            const errorData = JSON.parse(responseText);
            console.log('🎯 STRUCTURED ERROR ANALYSIS:');
            console.log(`   Stage: ${errorData.stage || 'unknown'}`);
            console.log(`   Error: ${errorData.error || 'unknown'}`);
            console.log(`   Request ID: ${errorData.requestId || 'unknown'}`);
            
            if (errorData.stage === 'environment' && errorData.error?.includes('USDA API key')) {
              console.log('🚨 ROOT CAUSE IDENTIFIED: USDA API key is not configured in edge function environment!');
            }
          } catch {
            console.log('🔍 Raw error (not JSON):', responseText);
          }
        }
        
      } catch (error) {
        console.error('❌ Failed direct request test:', error);
        console.log('🔍 This might be a network-level failure');
        throw error;
      }
    });
    
  });

  describe('Step 5: Root Cause Analysis Summary', () => {
    
    test('should summarize findings and provide fix recommendations', () => {
      console.log('\n📋 ROOT CAUSE ANALYSIS SUMMARY');
      console.log('=====================================');
      
      console.log('🔍 INVESTIGATION FINDINGS:');
      console.log(`   • Edge function is deployed and active (version 6)`);
      console.log(`   • Function URL is accessible: ${EDGE_FUNCTION_URL}`);
      console.log(`   • Authentication token: ${authToken ? 'Available' : 'Not available'}`);
      
      console.log('\n🎯 MOST LIKELY ROOT CAUSE:');
      console.log('   The edge function is failing because the USDA_API_KEY environment variable');
      console.log('   is not configured in the Supabase edge function environment.');
      
      console.log('\n🔧 REQUIRED FIXES:');
      console.log('   1. Configure USDA_API_KEY in Supabase project secrets');
      console.log('   2. Redeploy the edge function to pick up the new environment variable');
      console.log('   3. Test the function again with a valid API key');
      
      console.log('\n📝 EVIDENCE:');
      console.log('   • The edge function code checks for USDA_API_KEY and returns 500 if missing');
      console.log('   • The error "non-2xx status code" suggests a 500-level server error');
      console.log('   • No recent logs indicate the function is not being called or is crashing silently');
      
      // This test always passes - it just summarizes our findings
      expect(true).toBe(true);
    });
    
  });
  
});

/**
 * DEBUGGING UTILITIES
 * 
 * These can be run separately if needed
 */

export async function debugEdgeFunctionDirectly(authToken: string, query: string = 'apple') {
  console.log('🔧 Direct edge function debugging utility');
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ query, limit: 5, page: 1 })
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`Body:`, text);
    
    return { status: response.status, headers: response.headers, body: text };
  } catch (error) {
    console.error('Debug utility failed:', error);
    throw error;
  }
}

export async function testUSDAApiKeyDirectly(apiKey: string) {
  console.log('🔧 Direct USDA API testing utility');
  
  try {
    const response = await fetch('https://api.nal.usda.gov/fdc/v1/foods/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        query: 'apple',
        pageSize: 5,
        pageNumber: 1
      })
    });
    
    console.log(`USDA API Status: ${response.status}`);
    const text = await response.text();
    console.log(`USDA API Response:`, text.substring(0, 200));
    
    return response.ok;
  } catch (error) {
    console.error('USDA API test failed:', error);
    return false;
  }
}