/**
 * DEBUG TEST: Reproduce the exact 500 error from food-search Edge Function
 *
 * This test reproduces the user's reported 500 error by making an actual
 * API call to test all possible failure points systematically.
 */

import { supabase } from '../config/supabase';

describe('Debug 500 Error - Food Search Edge Function', () => {
  let authToken: string | null = null;

  beforeAll(async () => {
    // Get real authenticated session to match user's scenario
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      authToken = session.access_token;
      console.log('✅ Authentication successful - User IS authenticated');
    } else {
      console.log('❌ No authenticated session found', { error });
    }
  });

  describe('Systematic Failure Point Testing', () => {
    it('should test direct Edge Function call with minimal payload', async () => {
      console.log('\n🔍 Testing direct Edge Function call...');

      if (!authToken) {
        throw new Error('Cannot test - user not authenticated');
      }

      const testPayload = {
        query: 'apple',
        limit: 5,
        page: 1,
      };

      console.log('📤 Sending payload:', testPayload);
      console.log('🔑 Using auth token:', authToken.substring(0, 20) + '...');

      try {
        const { data, error } = await supabase.functions.invoke('food-search', {
          body: testPayload,
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📥 Response received:');
        console.log('  - Error:', error);
        console.log('  - Data:', data);

        if (error) {
          console.log('❌ REPRODUCED 500 ERROR:', error);
          throw error;
        }

        if (data && typeof data === 'object' && 'stage' in data) {
          console.log('❌ REPRODUCED STRUCTURED ERROR:', data);
          throw new Error(
            `Edge Function error: ${data.error} (Stage: ${data.stage})`
          );
        }

        console.log('✅ Success - received data:', Object.keys(data || {}));
        expect(data).toBeDefined();
      } catch (error) {
        console.error('💥 CAUGHT EXACT ERROR USER EXPERIENCES:', error);

        // Log detailed error information for debugging
        if (error instanceof Error) {
          console.log('Error name:', error.name);
          console.log('Error message:', error.message);
          console.log('Error stack:', error.stack?.slice(0, 500));
        }

        throw error;
      }
    });

    it('should test Edge Function environment variables', async () => {
      console.log('\n🔍 Testing environment variable accessibility...');

      if (!authToken) {
        throw new Error('Cannot test - user not authenticated');
      }

      // Test with a payload that will trigger environment validation
      const testPayload = {
        query: 'test-env-vars',
        limit: 1,
        page: 1,
      };

      try {
        const { data, error } = await supabase.functions.invoke('food-search', {
          body: testPayload,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        // Look for specific environment-related error messages
        if (data && typeof data === 'object') {
          if ('stage' in data && data.stage === 'environment') {
            console.log('❌ FOUND ENVIRONMENT ERROR:', data);
            throw new Error(`Environment issue: ${data.error}`);
          }

          if ('stage' in data && data.stage === 'usda-api') {
            console.log('❌ FOUND USDA API ERROR:', data);
            throw new Error(`USDA API issue: ${data.error}`);
          }
        }

        console.log('✅ Environment variables appear accessible');
      } catch (error) {
        console.error('💥 Environment test failed:', error);
        throw error;
      }
    });

    it('should test authentication flow specifically', async () => {
      console.log('\n🔍 Testing authentication flow...');

      if (!authToken) {
        throw new Error('Cannot test - user not authenticated');
      }

      // Test if the auth header is being processed correctly
      const testPayload = {
        query: 'auth-test',
        limit: 1,
        page: 1,
      };

      try {
        // Test with correct auth header
        const { data, error } = await supabase.functions.invoke('food-search', {
          body: testPayload,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (data && typeof data === 'object' && 'stage' in data) {
          if (
            data.stage === 'authentication' ||
            data.stage === 'authorization'
          ) {
            console.log('❌ FOUND AUTH ERROR:', data);
            throw new Error(`Auth issue: ${data.error}`);
          }
        }

        console.log('✅ Authentication flow working');
      } catch (error) {
        console.error('💥 Authentication test failed:', error);
        throw error;
      }
    });

    it('should test with malformed payload to isolate parsing issues', async () => {
      console.log('\n🔍 Testing payload parsing...');

      if (!authToken) {
        throw new Error('Cannot test - user not authenticated');
      }

      // Test with invalid payload to see if that causes 500
      const invalidPayloads = [
        null,
        undefined,
        '',
        '{}',
        { query: null },
        { query: '', limit: 'invalid' },
        { query: 'test' }, // missing limit/page
      ];

      for (const payload of invalidPayloads) {
        try {
          console.log(`📤 Testing payload:`, payload);

          const { data, error } = await supabase.functions.invoke(
            'food-search',
            {
              body: payload,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (error) {
            console.log(
              `❌ Error with payload ${JSON.stringify(payload)}:`,
              error
            );
          } else if (data && typeof data === 'object' && 'stage' in data) {
            console.log(
              `⚠️ Structured error with payload ${JSON.stringify(payload)}:`,
              data
            );
          } else {
            console.log(
              `✅ Unexpected success with payload ${JSON.stringify(payload)}`
            );
          }
        } catch (error) {
          console.log(
            `💥 Exception with payload ${JSON.stringify(payload)}:`,
            error
          );
        }
      }
    });
  });

  describe('Edge Function Version and Deployment Check', () => {
    it('should verify function deployment status', async () => {
      console.log('\n🔍 Checking Edge Function deployment...');

      // This would require direct Supabase management API access
      // For now, we'll test if the function endpoint exists
      try {
        const { data, error } = await supabase.functions.invoke('food-search', {
          body: { query: 'deployment-test', limit: 1, page: 1 },
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });

        if (error && error.message?.includes('Function not found')) {
          console.log('❌ Edge Function not deployed or not found');
          throw new Error('Edge Function deployment issue');
        }

        console.log('✅ Edge Function endpoint is accessible');
      } catch (error) {
        console.error('💥 Deployment check failed:', error);
        throw error;
      }
    });
  });
});
