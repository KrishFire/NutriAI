/**
 * Test script to validate USDA API key and endpoint
 * This will help diagnose if the Edge Function failure is due to API key issues
 */

import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY;
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

async function testUSDAApi() {
  console.log('=== USDA API Test ===');
  console.log(`API Key exists: ${!!USDA_API_KEY}`);
  console.log(`API Key length: ${USDA_API_KEY?.length || 0}`);
  console.log(`API Key format: ${USDA_API_KEY?.substring(0, 8)}...`);

  if (!USDA_API_KEY) {
    console.error('❌ USDA API key not found in environment variables');
    return;
  }

  try {
    console.log('\n📡 Testing USDA API endpoint...');
    
    const testQuery = 'apple';
    const url = `${USDA_API_URL}?query=${encodeURIComponent(testQuery)}&api_key=${USDA_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ USDA API is working!');
      console.log(`Total hits: ${data.totalHits}`);
      console.log(`Foods returned: ${data.foods?.length || 0}`);
      
      if (data.foods && data.foods.length > 0) {
        console.log('\nSample food item:');
        console.log(`- Description: ${data.foods[0].description}`);
        console.log(`- FDC ID: ${data.foods[0].fdcId}`);
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ USDA API error: ${response.status} ${response.statusText}`);
      console.error(`Error body: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Failed to connect to USDA API:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Note: This might be a network connectivity issue');
    }
  }

  // Test the exact format expected by Edge Function
  console.log('\n=== Testing Edge Function format ===');
  try {
    const edgeFunctionPayload = {
      query: 'chicken breast',
      apiKey: USDA_API_KEY
    };
    
    console.log('Payload structure:', JSON.stringify(edgeFunctionPayload, null, 2));
    console.log('API key in payload matches env:', edgeFunctionPayload.apiKey === USDA_API_KEY);
    
  } catch (error) {
    console.error('Error creating payload:', error);
  }
}

// Run the test
testUSDAApi().catch(console.error);