import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { supabase } from '../config/supabase';

type TestResult = {
  scenario: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
};

export default function TestScreen() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTest = async (
    scenario: string,
    query: string,
    expectedError?: boolean
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('food-search', {
        body: { query, limit: 5 },
      });

      if (error) {
        return {
          scenario,
          status: expectedError ? 'success' : ('error' as const),
          message: error.message || 'Unknown error',
          details: error.details || error,
        };
      }

      return {
        scenario,
        status: expectedError ? 'error' : ('success' as const),
        message: expectedError
          ? 'Expected error but got success'
          : `Found ${data?.meta?.totalResults || 0} results`,
        details: data?.meta,
      };
    } catch (err: any) {
      return {
        scenario,
        status: 'error' as const,
        message: err.message || 'Network error',
        details: err,
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    const tests = [
      {
        scenario: 'Valid Query - Chicken',
        query: 'chicken',
        expectedError: false,
      },
      { scenario: 'Empty Query', query: '', expectedError: true },
      {
        scenario: 'Very Long Query (>100 chars)',
        query: 'a'.repeat(101),
        expectedError: true,
      },
      {
        scenario: 'Special Characters',
        query: '!@#$%^&*()',
        expectedError: false,
      },
      {
        scenario: 'SQL Injection Attempt',
        query: "'; DROP TABLE foods; --",
        expectedError: false,
      },
      { scenario: 'Unicode Query', query: '🍕 pizza', expectedError: false },
      { scenario: 'Numeric Query', query: '123456', expectedError: false },
    ];

    for (const test of tests) {
      const result = await runTest(
        test.scenario,
        test.query,
        test.expectedError
      );
      setResults(prev => [...prev, result]);
    }

    setTesting(false);
  };

  const testRateLimit = async () => {
    setTesting(true);
    Alert.alert(
      'Rate Limit Test',
      'This will send 15 rapid requests to test rate limiting. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            const promises = [];
            for (let i = 0; i < 15; i++) {
              promises.push(
                supabase.functions.invoke('food-search', {
                  body: { query: `rate-test-${i}`, limit: 5 },
                })
              );
            }

            const results = await Promise.allSettled(promises);
            let rateLimited = 0;
            let succeeded = 0;

            results.forEach(result => {
              if (result.status === 'fulfilled') {
                const { error } = result.value;
                if (error?.details?.stage === 'rate-limiting') {
                  rateLimited++;
                } else if (!error) {
                  succeeded++;
                }
              }
            });

            Alert.alert(
              'Rate Limit Test Complete',
              `Sent 15 requests:\n${succeeded} succeeded\n${rateLimited} rate limited\n\nRate limiting is ${rateLimited > 0 ? 'working!' : 'not working'}`
            );
            setTesting(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Search Error Tests</Text>
        <Text style={styles.subtitle}>Test error handling scenarios</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, testing && styles.buttonDisabled]}
          onPress={runAllTests}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonSecondary,
            testing && styles.buttonDisabled,
          ]}
          onPress={testRateLimit}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Test Rate Limiting</Text>
        </TouchableOpacity>
      </View>

      {testing && (
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" color="#00aced" />
          <Text style={styles.loadingText}>Running tests...</Text>
        </View>
      )}

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {results.map((result, index) => (
            <View
              key={index}
              style={[
                styles.resultItem,
                result.status === 'success'
                  ? styles.resultSuccess
                  : styles.resultError,
              ]}
            >
              <Text style={styles.resultScenario}>{result.scenario}</Text>
              <Text style={styles.resultMessage}>{result.message}</Text>
              {result.details && (
                <Text style={styles.resultDetails}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#00aced',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#ff6b6b',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultItem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
    borderWidth: 1,
  },
  resultSuccess: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  resultError: {
    borderColor: '#f44336',
    backgroundColor: '#fef1f0',
  },
  resultScenario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
  },
  resultDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontFamily: 'monospace',
  },
});
