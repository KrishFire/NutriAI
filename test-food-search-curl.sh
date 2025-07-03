#!/bin/bash

# Test script for food-search Edge Function error handling
# Replace these with your actual values
SUPABASE_URL="https://cdqtuxepvomeyfkvfrnj.supabase.co"
ANON_KEY="YOUR_ANON_KEY_HERE"  # You'll need to get this from Supabase dashboard

echo "Food Search Edge Function Error Handling Tests"
echo "=============================================="

# Test 1: Missing auth header (should return 401)
echo -e "\n1. Testing missing auth header..."
curl -X POST "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -d '{"query": "chicken"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Test 2: Invalid auth token (should return 401)
echo -e "\n2. Testing invalid auth token..."
curl -X POST "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-12345" \
  -d '{"query": "chicken"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Test 3: Empty query (should return 400)
echo -e "\n3. Testing empty query..."
curl -X POST "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"query": ""}' \
  -w "\nHTTP Status: %{http_code}\n"

# Test 4: Very long query (should return 400)
echo -e "\n4. Testing very long query..."
LONG_QUERY=$(printf 'a%.0s' {1..105})
curl -X POST "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d "{\"query\": \"$LONG_QUERY\"}" \
  -w "\nHTTP Status: %{http_code}\n"

# Test 5: Invalid JSON (should return 400)
echo -e "\n5. Testing invalid JSON..."
curl -X POST "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d 'invalid json here' \
  -w "\nHTTP Status: %{http_code}\n"

# Test 6: Valid query (should return 200)
echo -e "\n6. Testing valid query..."
curl -X POST "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"query": "chicken breast", "limit": 5}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n=============================================="
echo "Tests completed!"
echo ""
echo "NOTE: To run authenticated tests, you need to:"
echo "1. Get your anon key from Supabase dashboard"
echo "2. Replace YOUR_ANON_KEY_HERE in this script"
echo "3. Run the script again"