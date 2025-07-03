#\!/bin/bash

SUPABASE_URL="https://cdqtuxepvomeyfkvfrnj.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I"

echo "Testing food-search Edge Function (version 11)..."
echo "=============================================="

echo -e "\n1. Testing with valid query (should work with auth):"
curl -s -X POST \
  "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"query": "apple", "limit": 2}'  < /dev/null |  jq . || echo "Response: $(curl -s -X POST "$SUPABASE_URL/functions/v1/food-search" -H "Content-Type: application/json" -H "Authorization: Bearer $ANON_KEY" -d '{"query": "apple", "limit": 2}')"

echo -e "\n2. Testing without auth (should return 401):"
curl -s -X POST \
  "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -d '{"query": "apple"}' | jq . || echo "Response: $(curl -s -X POST "$SUPABASE_URL/functions/v1/food-search" -H "Content-Type: application/json" -d '{"query": "apple"}')"

echo -e "\n3. Testing with empty query (should return 400):"
curl -s -X POST \
  "$SUPABASE_URL/functions/v1/food-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"query": ""}' | jq . || echo "Response: $(curl -s -X POST "$SUPABASE_URL/functions/v1/food-search" -H "Content-Type: application/json" -H "Authorization: Bearer $ANON_KEY" -d '{"query": ""}')"
