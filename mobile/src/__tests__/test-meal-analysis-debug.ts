/**
 * Test the enhanced meal analysis Edge Function with real image data
 */

import { supabase } from '../config/supabase';

// Sample base64 image data (1x1 pixel transparent PNG for testing)
const SAMPLE_IMAGE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function testMealAnalysisWithDebug() {
  console.log('🍽️  Testing Meal Analysis with Enhanced Debugging\n');

  // Get current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('❌ No active session. Please login first.');
    return;
  }

  console.log('✅ Authenticated as:', session.user.email);
  console.log(
    '🔑 Using access token:',
    session.access_token.substring(0, 20) + '...'
  );

  // Test configurations
  const tests = [
    {
      name: 'Normal Mode',
      debugMode: false,
    },
    {
      name: 'Debug Mode Enabled',
      debugMode: true,
    },
  ];

  for (const test of tests) {
    console.log(`\n\n📋 Test: ${test.name}`);
    console.log('─'.repeat(60));

    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      };

      if (test.debugMode) {
        headers['X-Debug-Mode'] = 'true';
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/analyze-meal`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            imageBase64: SAMPLE_IMAGE_BASE64,
            voiceTranscription: 'This is a test meal with chicken and rice',
          }),
        }
      );

      const responseTime = Date.now() - startTime;

      // Log response headers
      console.log('\n📊 Response Headers:');
      console.log(`  Status: ${response.status} ${response.statusText}`);
      console.log(`  X-Request-ID: ${response.headers.get('X-Request-ID')}`);
      console.log(`  X-Auth-Status: ${response.headers.get('X-Auth-Status')}`);
      console.log(
        `  X-Processing-Status: ${response.headers.get('X-Processing-Status')}`
      );
      console.log(`  Server-Timing: ${response.headers.get('Server-Timing')}`);
      console.log(`  Client-measured time: ${responseTime}ms`);

      // Parse response
      const body = await response.json();

      if (response.ok) {
        console.log('\n✅ Analysis successful!');
        console.log(`  Foods identified: ${body.foods?.length || 0}`);
        console.log(`  Total calories: ${body.totalNutrition?.calories || 0}`);
        console.log(`  Confidence: ${body.confidence || 0}`);

        if (test.debugMode && body._debug) {
          console.log('\n🐛 Debug Information:');
          console.log(`  Processing time: ${body._debug.processingTimeMs}ms`);
          console.log(`  Food count: ${body._debug.foodCount}`);
          console.log(`  Total calories: ${body._debug.totalCalories}`);
          console.log(`  Confidence: ${body._debug.confidence}`);
        }
      } else {
        console.log('\n❌ Analysis failed:');
        console.log(`  Stage: ${body.stage}`);
        console.log(`  Error: ${body.error}`);
        console.log(`  Request ID: ${body.requestId}`);

        if (body.details) {
          console.log(`  Details: ${body.details}`);
        }

        if (test.debugMode && body._debug) {
          console.log('\n🐛 Debug Error Information:');
          console.log(JSON.stringify(body._debug, null, 2));
        }
      }

      // Log full response in debug mode
      if (test.debugMode) {
        console.log('\n📄 Full Response Body:');
        console.log(JSON.stringify(body, null, 2));
      }
    } catch (error) {
      console.error('\n❌ Request failed:', error.message);
    }
  }

  console.log('\n\n✅ Testing complete!\n');
}

// Run the test
testMealAnalysisWithDebug().catch(console.error);
