// Debug script to reproduce the food search issue
// This will help us see the exact error the user is experiencing

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cdqtuxepvomeyfkvfrnj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I';

// Test user credentials - since we don't have the real user password,
// let's create a test user or use anon key with proper headers
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testPassword123!';

async function testFoodSearchWithAuthenticatedUser() {
  console.log('🔍 Testing food search with authenticated user...');

  try {
    // 1. Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 2. Sign in the user
    console.log('📝 Signing in user...');
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    if (authError) {
      console.error('❌ Auth failed:', authError);
      return;
    }

    console.log('✅ User signed in successfully:', authData.user.email);
    console.log(
      '🔑 Access token (first 50 chars):',
      authData.session.access_token.substring(0, 50) + '...'
    );

    // 3. Test the food search edge function
    console.log('🍗 Testing food search for "chicken"...');

    const { data, error } = await supabase.functions.invoke('food-search', {
      body: {
        query: 'chicken',
        limit: 5,
        page: 1,
      },
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    });

    if (error) {
      console.error('❌ Food search failed with error:');
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    if (data) {
      console.log('✅ Food search successful!');
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));
      if (data.foods) {
        console.log('Foods found:', data.foods.length);
        console.log('First food:', data.foods[0]);
      } else {
        console.log('Full response:', JSON.stringify(data, null, 2));
      }
    } else {
      console.log('⚠️ No data returned');
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testFoodSearchWithAuthenticatedUser();
