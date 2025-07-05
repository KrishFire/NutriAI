#!/bin/bash

# GPT-o3 Food Search Validation Tests
# Tests the deployed Edge Function to verify all improvements work correctly

set -e

PROJECT_URL="https://cdqtuxepvomeyfkvfrnj.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I"
EDGE_URL="${PROJECT_URL}/functions/v1/food-search"

echo "🧪 GPT-o3 Food Search Validation Tests"
echo "======================================"
echo ""

# Function to make authenticated API call
call_food_search() {
    local query="$1"
    local limit="${2:-20}"
    local test_name="$3"
    
    echo "📋 Test: $test_name"
    echo "   Query: '$query' (limit: $limit)"
    
    local response=$(curl -s -X POST "$EDGE_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ANON_KEY" \
        -d "{\"query\":\"$query\",\"limit\":$limit,\"page\":1}" \
        -w "\nHTTP_STATUS:%{http_code}")
    
    local http_status=$(echo "$response" | tail -n1 | sed 's/HTTP_STATUS://')
    local body=$(echo "$response" | head -n -1)
    
    echo "   Status: $http_status"
    
    if [ "$http_status" != "200" ]; then
        echo "   ❌ ERROR: HTTP $http_status"
        echo "   Response: $body"
        return 1
    fi
    
    # Parse key metrics from response
    local groups_count=$(echo "$body" | jq -r '.resultGroups | length // 0')
    local total_foods=$(echo "$body" | jq -r '.allFoods | length // 0')
    local best_matches_count=$(echo "$body" | jq -r '.resultGroups[0].items | length // 0')
    local best_matches_title=$(echo "$body" | jq -r '.resultGroups[0].title // "N/A"')
    local data_types=$(echo "$body" | jq -r '.allFoods[0:5] | map(.dataType) | join(", ") // "N/A"')
    
    echo "   ✅ Groups: $groups_count | Total Foods: $total_foods"
    echo "   📊 Best Matches: '$best_matches_title' ($best_matches_count items)"
    echo "   🏷️  Top 5 Data Types: $data_types"
    
    # Save response for detailed analysis
    echo "$body" > "/tmp/test_${query// /_}_response.json"
    echo "   💾 Response saved to: /tmp/test_${query// /_}_response.json"
    echo ""
    
    return 0
}

# Test 1: Generic "chicken" search - Should prioritize Foundation/SR Legacy
echo "Test 1: Foundation/SR Legacy Prioritization"
echo "-------------------------------------------"
call_food_search "chicken" 20 "Generic chicken search (should show Foundation/SR Legacy first)"

# Test 2: Brand intent detection - "McDonald's chicken"
echo "Test 2: Brand Intent Detection"
echo "------------------------------"
call_food_search "McDonald's chicken" 20 "Branded search (should detect brand intent and prioritize Branded foods)"

# Test 3: Limit validation - Test max limit of 50
echo "Test 3: Limit Validation"
echo "------------------------"
call_food_search "rice" 50 "Maximum limit test (should accept limit=50)"

# Test 4: Progressive disclosure - Complex search
echo "Test 4: Progressive Disclosure"
echo "------------------------------"
call_food_search "apple" 30 "Progressive disclosure test (should have multiple groups)"

# Test 5: Edge case - Invalid limit (should fail)
echo "Test 5: Invalid Limit Validation"
echo "--------------------------------"
echo "📋 Test: Invalid limit validation (limit=51)"
echo "   Query: 'bread' (limit: 51)"

response=$(curl -s -X POST "$EDGE_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ANON_KEY" \
    -d '{"query":"bread","limit":51,"page":1}' \
    -w "\nHTTP_STATUS:%{http_code}")

http_status=$(echo "$response" | tail -n1 | sed 's/HTTP_STATUS://')
body=$(echo "$response" | head -n -1)

echo "   Status: $http_status"

if [ "$http_status" = "400" ]; then
    echo "   ✅ CORRECT: Rejected limit > 50"
    error_message=$(echo "$body" | jq -r '.details.message // .error // "Unknown error"')
    echo "   Message: $error_message"
else
    echo "   ❌ ERROR: Should have rejected limit > 50"
    echo "   Response: $body"
fi
echo ""

echo "🔍 Analysis Summary"
echo "==================="
echo ""

# Analyze responses for GPT-o3 improvements
echo "1. Foundation/SR Legacy Prioritization Analysis:"
chicken_response="/tmp/test_chicken_response.json"
if [ -f "$chicken_response" ]; then
    foundation_count=$(jq -r '.allFoods | map(select(.dataType == "Foundation")) | length' "$chicken_response")
    sr_legacy_count=$(jq -r '.allFoods | map(select(.dataType == "SR Legacy")) | length' "$chicken_response")
    branded_count=$(jq -r '.allFoods | map(select(.dataType == "Branded")) | length' "$chicken_response")
    top3_types=$(jq -r '.allFoods[0:3] | map(.dataType) | join(", ")' "$chicken_response")
    
    echo "   Foundation: $foundation_count | SR Legacy: $sr_legacy_count | Branded: $branded_count"
    echo "   Top 3 results data types: $top3_types"
    
    if [[ "$top3_types" == *"Foundation"* ]] || [[ "$top3_types" == *"SR Legacy"* ]]; then
        echo "   ✅ PASS: Generic search prioritizes Foundation/SR Legacy"
    else
        echo "   ❌ FAIL: Generic search should prioritize Foundation/SR Legacy"
    fi
fi
echo ""

echo "2. Brand Intent Detection Analysis:"
mcdonalds_response="/tmp/test_McDonald's_chicken_response.json"
if [ -f "$mcdonalds_response" ]; then
    branded_in_best=$(jq -r '.resultGroups[0].items | map(select(.dataType == "Branded")) | length' "$mcdonalds_response")
    best_matches_title=$(jq -r '.resultGroups[0].title' "$mcdonalds_response")
    
    echo "   Best Matches title: '$best_matches_title'"
    echo "   Branded items in Best Matches: $branded_in_best"
    
    if [ "$branded_in_best" -gt 0 ]; then
        echo "   ✅ PASS: Brand intent detected, branded items prioritized"
    else
        echo "   ❌ FAIL: Brand intent not properly detected"
    fi
fi
echo ""

echo "3. Progressive Disclosure Analysis:"
apple_response="/tmp/test_apple_response.json"
if [ -f "$apple_response" ]; then
    groups_count=$(jq -r '.resultGroups | length' "$apple_response")
    group_titles=$(jq -r '.resultGroups | map(.title) | join(", ")' "$apple_response")
    
    echo "   Number of groups: $groups_count"
    echo "   Group titles: $group_titles"
    
    if [ "$groups_count" -gt 1 ]; then
        echo "   ✅ PASS: Multiple groups created for progressive disclosure"
    else
        echo "   ⚠️  WARNING: Expected multiple groups for better UX"
    fi
fi
echo ""

echo "🎯 GPT-o3 Improvements Validation Complete!"
echo "==========================================="

# Check if jq is available for analysis
if ! command -v jq &> /dev/null; then
    echo ""
    echo "⚠️  Note: 'jq' not found. Install jq for detailed response analysis:"
    echo "   brew install jq  # macOS"
    echo "   apt install jq   # Ubuntu/Debian"
fi

echo ""
echo "📁 Response files saved in /tmp/ for detailed inspection"
echo "   Use: jq '.' /tmp/test_*_response.json | less"