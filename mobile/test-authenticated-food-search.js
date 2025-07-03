// Test script to verify food search works with proper authentication
// This creates a test user and tests the full authentication flow

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cdqtuxepvomeyfkvfrnj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I';

async function testAuthenticatedFoodSearch() {
  console.log('🧪 Testing authenticated food search...');
  
  try {
    // Create supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Generate unique test email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testPassword123!';
    
    console.log('👤 Creating test user:', testEmail);
    
    // Sign up test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError);
      return;
    }

    console.log('✅ Test user created successfully');
    
    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ Failed to get session:', sessionError);
      return;
    }
    
    console.log('🔑 Got valid session');
    console.log('User ID:', session.user.id);
    
    // Test the food search edge function with proper authentication
    console.log('🍗 Testing food search for "chicken"...');
    
    const { data, error } = await supabase.functions.invoke('food-search', {
      body: {
        query: 'chicken',
        limit: 5,
        page: 1
      },
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('❌ Food search failed:', JSON.stringify(error, null, 2));
      return;
    }

    if (data) {
      console.log('🎉 SUCCESS: Food search working perfectly!');
      console.log('Response structure:');
      console.log('- Foods found:', data.foods?.length || 0);
      console.log('- Has more results:', data.hasMore);
      console.log('- Total results available:', data.total);
      console.log('- Current page:', data.page);
      
      if (data.foods && data.foods.length > 0) {
        console.log('\nFirst food item:');
        const firstFood = data.foods[0];
        console.log('- Name:', firstFood.name);
        console.log('- Calories:', firstFood.calories);
        console.log('- Protein:', firstFood.protein);
        console.log('- Carbs:', firstFood.carbs);
        console.log('- Fat:', firstFood.fat);
        console.log('- Verified:', firstFood.verified);
      }
    } else {
      console.log('⚠️ No data returned');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

testAuthenticatedFoodSearch();