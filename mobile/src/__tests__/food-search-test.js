/**
 * COMPREHENSIVE FOOD SEARCH EDGE FUNCTION TESTING
 * Test Engineering Specialist - Systematic Verification of Authentication Fix
 */

const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = 'https://cdqtuxepvomeyfkvfrnj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I';

// Test data
const TEST_QUERIES = [
  'apple',
  'chicken breast',
  'brown rice',
  'broccoli',
  'salmon'
];

class FoodSearchTester {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.testSession = `test-${Date.now()}`;
    this.testResults = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.testSession}] ${message}`);
  }

  async recordTestResult(result) {
    this.testResults.push(result);
    this.log(`TEST RESULT: ${result.testName} - ${result.success ? 'PASS' : 'FAIL'} (${result.responseTime}ms)`);
    if (result.error) {
      this.log(`ERROR: ${result.error}`);
    }
  }

  /**
   * TEST 1: Direct Edge Function Invocation
   */
  async testDirectEdgeFunctionCall() {
    this.log('=== TEST 1: Direct Edge Function Call ===');
    
    const testQuery = 'apple';
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase.functions.invoke('food-search', {
        body: {
          query: testQuery,
          limit: 10,
          page: 1
        },
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      
      this.log(`Raw response - Error: ${error ? JSON.stringify(error) : 'null'}`);
      this.log(`Raw response - Data: ${data ? JSON.stringify(data, null, 2) : 'null'}`);

      await this.recordTestResult({
        testName: 'Direct Edge Function Call',
        query: testQuery,
        success: !error && data,
        responseTime,
        error: error?.message || null,
        data: data ? { 
          type: typeof data,
          hasFood: Array.isArray(data.foods),
          foodCount: data.foods?.length || 0,
          hasMore: data.hasMore,
          total: data.total
        } : null,
        logEntry: `Direct Edge Function call: ${!error ? 'SUCCESS' : 'FAILED'}`
      });

      return { data, error, responseTime };

    } catch (err) {
      const responseTime = Date.now() - startTime;
      this.log(`Exception during direct call: ${err.message}`);
      
      await this.recordTestResult({
        testName: 'Direct Edge Function Call',
        query: testQuery,
        success: false,
        responseTime,
        error: err.message,
        logEntry: `Direct Edge Function call failed with exception: ${err.message}`
      });

      return { data: null, error: err, responseTime };
    }
  }

  /**
   * TEST 2: Test Multiple Queries
   */
  async testMultipleQueries() {
    this.log('=== TEST 2: Multiple Query Testing ===');

    for (const query of TEST_QUERIES) {
      const startTime = Date.now();
      
      try {
        const { data, error } = await this.supabase.functions.invoke('food-search', {
          body: {
            query,
            limit: 5,
            page: 1
          },
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        const responseTime = Date.now() - startTime;
        const success = !error && data && data.foods;
        
        this.log(`Query "${query}": ${success ? 'SUCCESS' : 'FAILED'} - ${data?.foods?.length || 0} foods found`);

        await this.recordTestResult({
          testName: 'Multiple Query Test',
          query,
          success,
          responseTime,
          error: error?.message || null,
          data: data ? { 
            foodCount: data.foods?.length || 0,
            sampleFood: data.foods?.[0]?.name || null
          } : null,
          logEntry: `Query "${query}": ${success ? 'SUCCESS' : 'FAILED'} - ${data?.foods?.length || 0} foods`
        });

        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        const responseTime = Date.now() - startTime;
        
        await this.recordTestResult({
          testName: 'Multiple Query Test',
          query,
          success: false,
          responseTime,
          error: err.message,
          logEntry: `Query "${query}" failed: ${err.message}`
        });
      }
    }
  }

  /**
   * TEST 3: Response Structure Validation
   */
  async testResponseStructure() {
    this.log('=== TEST 3: Response Structure Validation ===');

    const testQuery = 'banana';
    const startTime = Date.now();

    try {
      const { data, error } = await this.supabase.functions.invoke('food-search', {
        body: {
          query: testQuery,
          limit: 3,
          page: 1
        },
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;

      if (!error && data) {
        // Detailed structure validation
        const validationResults = {
          hasFoodsArray: Array.isArray(data.foods),
          foodsNotEmpty: data.foods && data.foods.length > 0,
          hasMoreField: typeof data.hasMore === 'boolean',
          hasTotalField: typeof data.total === 'number',
          hasPageField: typeof data.page === 'number'
        };

        // Validate individual food items
        if (data.foods && data.foods.length > 0) {
          const firstFood = data.foods[0];
          validationResults.foodHasId = !!firstFood.id;
          validationResults.foodHasName = !!firstFood.name;
          validationResults.foodHasCalories = typeof firstFood.calories === 'number';
          validationResults.foodHasProtein = typeof firstFood.protein === 'number';
          validationResults.foodHasCarbs = typeof firstFood.carbs === 'number';
          validationResults.foodHasFat = typeof firstFood.fat === 'number';
        }

        const isValidStructure = Object.values(validationResults).every(Boolean);

        this.log('Detailed Response Structure:');
        Object.entries(validationResults).forEach(([key, value]) => {
          this.log(`  ${key}: ${value ? 'PASS' : 'FAIL'}`);
        });

        if (data.foods && data.foods.length > 0) {
          this.log('Sample Food Item:');
          this.log(`  Name: ${data.foods[0].name}`);
          this.log(`  Calories: ${data.foods[0].calories}`);
          this.log(`  Protein: ${data.foods[0].protein}g`);
          this.log(`  Carbs: ${data.foods[0].carbs}g`);
          this.log(`  Fat: ${data.foods[0].fat}g`);
        }

        await this.recordTestResult({
          testName: 'Response Structure Validation',
          query: testQuery,
          success: isValidStructure,
          responseTime,
          data: {
            validationResults,
            sampleFood: data.foods?.[0] || null,
            totalFoods: data.foods?.length || 0
          },
          logEntry: `Response structure validation: ${isValidStructure ? 'VALID' : 'INVALID'}`
        });

      } else {
        await this.recordTestResult({
          testName: 'Response Structure Validation',
          query: testQuery,
          success: false,
          responseTime,
          error: error?.message || 'No data received',
          logEntry: `Response structure validation failed: ${error?.message || 'No data received'}`
        });
      }

    } catch (err) {
      const responseTime = Date.now() - startTime;
      await this.recordTestResult({
        testName: 'Response Structure Validation',
        query: testQuery,
        success: false,
        responseTime,
        error: err.message,
        logEntry: `Response structure validation error: ${err.message}`
      });
    }
  }

  /**
   * Execute all tests and generate report
   */
  async runAllTests() {
    this.log('===============================================');
    this.log('STARTING COMPREHENSIVE FOOD SEARCH API TESTS');
    this.log('===============================================');
    this.log(`Test Session: ${this.testSession}`);
    this.log(`Supabase URL: ${SUPABASE_URL}`);
    this.log(`Project ID: cdqtuxepvomeyfkvfrnj`);
    this.log('');

    try {
      // Run all test suites
      await this.testDirectEdgeFunctionCall();
      await this.testMultipleQueries();
      await this.testResponseStructure();

      // Generate final report
      this.generateFinalReport();

    } catch (err) {
      this.log(`CRITICAL ERROR during test execution: ${err.message}`);
      throw err;
    }
  }

  generateFinalReport() {
    this.log('');
    this.log('===============================================');
    this.log('FINAL TEST REPORT - WRITTEN EVIDENCE');
    this.log('===============================================');

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const averageResponseTime = this.testResults.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;

    this.log(`Total Tests Executed: ${totalTests}`);
    this.log(`Tests Passed: ${passedTests}`);
    this.log(`Tests Failed: ${failedTests}`);
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    this.log(`Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
    this.log('');

    // Food search verification
    const searchTests = this.testResults.filter(r => 
      r.testName === 'Multiple Query Test' || r.testName === 'Direct Edge Function Call'
    );
    const searchSuccessRate = (searchTests.filter(r => r.success).length / searchTests.length) * 100;
    this.log(`FOOD SEARCH FUNCTIONALITY: ${searchSuccessRate.toFixed(1)}% success rate`);

    // Response validation
    const structureTests = this.testResults.filter(r => r.testName === 'Response Structure Validation');
    const structureSuccessRate = (structureTests.filter(r => r.success).length / structureTests.length) * 100;
    this.log(`RESPONSE STRUCTURE VALIDATION: ${structureSuccessRate.toFixed(1)}% success rate`);

    this.log('');
    this.log('DETAILED TEST RESULTS:');
    this.testResults.forEach((result, index) => {
      this.log(`${index + 1}. ${result.testName} [${result.query}]: ${result.success ? 'PASS' : 'FAIL'} (${result.responseTime}ms)`);
      if (result.error) {
        this.log(`   Error: ${result.error}`);
      }
      if (result.data && typeof result.data === 'object') {
        this.log(`   Data: ${JSON.stringify(result.data)}`);
      }
    });

    this.log('');
    this.log('===============================================');
    this.log('EVIDENCE-BASED CONCLUSION:');
    
    if (failedTests === 0) {
      this.log('✅ ALL TESTS PASSED - Food search functionality is VERIFIED');
      this.log('✅ Authentication handling is CONFIRMED working');
      this.log('✅ Edge Function is responding correctly with proper data structure');
    } else if (searchSuccessRate >= 80) {
      this.log('⚠️  MOSTLY FUNCTIONAL - Core functionality works with some edge cases');
      this.log('✅ Food search Edge Function is operational');
    } else {
      this.log('❌ SIGNIFICANT ISSUES DETECTED - Food search needs investigation');
      this.log('❌ Edge Function may have authentication or structural problems');
    }
    
    this.log('===============================================');
  }
}

// Execute tests
(async () => {
  const tester = new FoodSearchTester();
  try {
    await tester.runAllTests();
    console.log('\n🎯 TEST EXECUTION COMPLETED - Check logs above for evidence');
  } catch (error) {
    console.error('\n❌ TEST EXECUTION FAILED:', error.message);
    process.exit(1);
  }
})();