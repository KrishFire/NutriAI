/**
 * Test script to call the debug Edge Function and identify the exact error paths
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL || 'https://cdqtuxepvomeyfkvfrnj.supabase.co';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3ZmcjNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk2MDg5OTMsImV4cCI6MjAzNTE4NDk5M30.F-i4a_Wh1P2YajCfEw-xf0YrZBnXy6MHPF0_AuC7aHg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDebugFunction() {
  console.log('🚀 Testing Debug Edge Function...\n');

  // Test 1: Call without authentication (should get 401)
  console.log('📋 Test 1: Unauthenticated call (expecting 401)');
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/food-search-debug`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'apple',
          limit: 5,
          page: 1,
        }),
      }
    );

    const data = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${data}\n`);
  } catch (error) {
    console.error('Error:', error.message, '\n');
  }

  // Test 2: Get authenticated session and test
  console.log('📋 Test 2: Getting authenticated session...');
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log('❌ No authenticated session found');
      console.log('Creating anonymous user for testing...');

      // Try to sign up a test user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: `test-${Date.now()}@example.com`,
          password: 'testpassword123',
        });

      if (signUpError) {
        console.error('Failed to create test user:', signUpError);
        return;
      }

      console.log('✅ Created test user, getting session...');
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession();

      if (!newSession) {
        console.log('❌ Still no session after signup');
        return;
      }

      session = newSession;
    }

    console.log('✅ Got authenticated session');
    console.log(`User ID: ${session.user.id}`);
    console.log(`Token preview: ${session.access_token.substring(0, 20)}...\n`);

    // Test 3: Authenticated call with debug function
    console.log('📋 Test 3: Authenticated call to debug function');
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/food-search-debug`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            query: 'apple',
            limit: 5,
            page: 1,
          }),
        }
      );

      const responseText = await response.text();
      console.log(`Status: ${response.status}`);
      console.log(`Response preview: ${responseText.substring(0, 500)}...\n`);

      try {
        const responseData = JSON.parse(responseText);
        console.log('🔍 Parsed response data:');
        console.log(JSON.stringify(responseData, null, 2));
      } catch (parseError) {
        console.log('⚠️ Could not parse response as JSON');
        console.log(`Raw response: ${responseText}`);
      }
    } catch (error) {
      console.error('💥 Error calling debug function:', error);
    }

    // Test 4: Call original food-search function for comparison
    console.log(
      '\n📋 Test 4: Calling original food-search function for comparison'
    );
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/food-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          query: 'apple',
          limit: 5,
          page: 1,
        }),
      });

      const responseText = await response.text();
      console.log(`Original function status: ${response.status}`);
      console.log(
        `Original function response preview: ${responseText.substring(0, 300)}...\n`
      );

      if (response.status >= 400) {
        console.log('❌ REPRODUCED ERROR IN ORIGINAL FUNCTION');
        try {
          const errorData = JSON.parse(responseText);
          console.log('Error data:', JSON.stringify(errorData, null, 2));
        } catch (parseError) {
          console.log('Raw error response:', responseText);
        }
      }
    } catch (error) {
      console.error('💥 Error calling original function:', error);
    }
  } catch (error) {
    console.error('💥 Authentication error:', error);
  }
}

// Run the test
testDebugFunction().catch(console.error);
