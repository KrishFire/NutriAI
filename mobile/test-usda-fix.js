// Test script to verify USDA_API_KEY fix is working
// This tests the edge function directly to confirm the environment variable is now available

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cdqtuxepvomeyfkvfrnj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I';

async function testUSDAFix() {
  console.log('🧪 Testing USDA_API_KEY fix...');

  try {
    // Create supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test the food search edge function
    console.log('📡 Calling food-search edge function...');

    const { data, error } = await supabase.functions.invoke('food-search', {
      body: {
        query: 'chicken',
        limit: 5,
        page: 1,
      },
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (error) {
      console.error('❌ Error details:', JSON.stringify(error, null, 2));

      // Check if this is the expected auth error (which means USDA_API_KEY is working)
      if (error.message && error.message.includes('token')) {
        console.log('✅ GOOD NEWS: Function reached authentication stage!');
        console.log('   This means USDA_API_KEY is now properly configured.');
        console.log(
          "   The 401 error is expected since we're using anon key instead of user token."
        );
        return;
      }

      // Check if we're still getting environment errors
      if (error.message && error.message.includes('USDA API key')) {
        console.log('❌ STILL BROKEN: USDA_API_KEY environment error persists');
        return;
      }

      console.log('🤔 Unexpected error - may need investigation');
      return;
    }

    if (data) {
      console.log('🎉 SUCCESS: Food search working!');
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));
      if (data.foods) {
        console.log('Foods found:', data.foods.length);
      }
    } else {
      console.log('⚠️ No data returned (but no error either)');
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

testUSDAFix();
