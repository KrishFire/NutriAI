#!/bin/bash

# Dark Deployment Validation Test
# Tests the new USDA relevance scoring behind the X-NutriAI-Test-Variant header

set -e

PROJECT_URL="https://cdqtuxepvomeyfkvfrnj.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXR1eGVwdm9tZXlma3Zmcm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDY3NzMsImV4cCI6MjA2NjcyMjc3M30.WNA4AeVnGQF0iKzd8XaLtTrx8HntKGNO1b-fYW1HX4I"
EDGE_URL="${PROJECT_URL}/functions/v1/food-search"

echo "🧪 Dark Deployment Validation Test"
echo "=================================="
echo ""

# Function to make authenticated API call with test variant header
call_food_search_test() {
    local query="$1"
    local test_name="$2"
    local variant="${3:-usda_relevance}"
    
    echo "📋 Test: $test_name"
    echo "   Query: '$query' (variant: $variant)"
    
    local response=$(curl -s -X POST "$EDGE_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ANON_KEY" \
        -H "X-NutriAI-Test-Variant: $variant" \
        -d "{\"query\":\"$query\",\"limit\":10,\"page\":1}" \
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
    local total_foods=$(echo "$body" | jq -r '.allFoods | length // 0')
    local best_matches_count=$(echo "$body" | jq -r '.resultGroups[0].items | length // 0')
    local top_3_names=$(echo "$body" | jq -r '.resultGroups[0].items[0:3] | map(.name) | join(" | ") // "N/A"')
    
    echo "   ✅ Total Foods: $total_foods | Best Matches: $best_matches_count"
    echo "   🥇 Top 3: $top_3_names"
    echo ""
    
    # Save response for comparison
    echo "$body" > "/tmp/dark_test_${query// /_}_${variant}_response.json"
    
    return 0
}

# Function to make control API call (no header = current behavior)
call_food_search_control() {
    local query="$1"
    local test_name="$2"
    
    echo "📋 Control: $test_name"
    echo "   Query: '$query' (current behavior)"
    
    local response=$(curl -s -X POST "$EDGE_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ANON_KEY" \
        -d "{\"query\":\"$query\",\"limit\":10,\"page\":1}" \
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
    local total_foods=$(echo "$body" | jq -r '.allFoods | length // 0')
    local best_matches_count=$(echo "$body" | jq -r '.resultGroups[0].items | length // 0')
    local top_3_names=$(echo "$body" | jq -r '.resultGroups[0].items[0:3] | map(.name) | join(" | ") // "N/A"')
    
    echo "   📊 Total Foods: $total_foods | Best Matches: $best_matches_count"
    echo "   📜 Top 3: $top_3_names"
    echo ""
    
    # Save response for comparison
    echo "$body" > "/tmp/dark_test_${query// /_}_control_response.json"
    
    return 0
}

echo "🔍 Testing Golden Queries with Dark Deployment"
echo "=============================================="
echo ""

# Test the problematic "chicken" query that should be fixed
echo "1. CHICKEN SEARCH COMPARISON"
echo "----------------------------"
call_food_search_control "chicken" "Current behavior (with sortBy override)"
call_food_search_test "chicken" "New USDA relevance (should show chicken breast first)" "usda_relevance"

echo "2. ALMOND MILK SEARCH COMPARISON"
echo "--------------------------------"
call_food_search_control "almond milk" "Current behavior"
call_food_search_test "almond milk" "New USDA relevance" "usda_relevance"

echo "3. PROTEIN POWDER SEARCH COMPARISON"
echo "-----------------------------------"
call_food_search_control "protein powder" "Current behavior"
call_food_search_test "protein powder" "New USDA relevance" "usda_relevance"

echo "🎯 Analysis Summary"
echo "==================="
echo ""

# Analyze chicken results specifically
echo "1. Chicken Search Analysis:"
chicken_control="/tmp/dark_test_chicken_control_response.json"
chicken_test="/tmp/dark_test_chicken_usda_relevance_response.json"

if [ -f "$chicken_control" ] && [ -f "$chicken_test" ]; then
    control_top3=$(jq -r '.resultGroups[0].items[0:3] | map(.name) | join(", ")' "$chicken_control")
    test_top3=$(jq -r '.resultGroups[0].items[0:3] | map(.name) | join(", ")' "$chicken_test")
    
    echo "   Control (sortBy): $control_top3"
    echo "   Test (relevance): $test_top3"
    
    # Check if test results contain "breast" and control doesn't prioritize it
    if [[ "$test_top3" == *"breast"* ]] && [[ "$control_top3" != *"breast"* ]]; then
        echo "   ✅ SUCCESS: USDA relevance prioritizes chicken breast!"
    elif [[ "$test_top3" == *"breast"* ]] && [[ "$control_top3" == *"breast"* ]]; then
        echo "   ⚠️  BOTH: Both versions show breast, but ordering may differ"
    else
        echo "   ❓ UNCERTAIN: Need manual review of results"
    fi
fi

echo ""
echo "📁 Response files saved in /tmp/ for detailed comparison:"
echo "   ls /tmp/dark_test_*_response.json"
echo ""
echo "🚀 If the test results look better, we're ready to release Change A!"