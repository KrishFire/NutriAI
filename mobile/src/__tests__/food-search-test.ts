/**
 * Manual test for food search Edge Function
 * This is a debugging script to test the food search API directly
 */

import { searchFoods } from '../services/foodSearch';

async function testFoodSearch() {
  console.log('🔍 Testing Food Search Edge Function...');

  try {
    console.log('📝 Searching for "apple"...');

    const result = await searchFoods({
      query: 'apple',
      limit: 5,
      page: 1,
    });

    console.log('✅ Search successful!');
    console.log('📊 Results:', {
      totalResults: result.total,
      foodsFound: result.foods.length,
      hasMore: result.hasMore,
      currentPage: result.page,
    });

    if (result.foods.length > 0) {
      console.log('🍎 First food item:', result.foods[0]);
    }
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    console.error('🔧 Error details:', error);
  }
}

// Export for manual execution
export { testFoodSearch };

// Auto-run if called directly
if (require.main === module) {
  testFoodSearch();
}
