# GPT-o3 Food Search Implementation

## Phase 1: Immediate Fix & Prioritized Sequential Fetching

### ✅ Fixed Issues
1. **Validation Error Fix**: Changed client-side limit from 100 to 50 to match Edge Function validation
   - File: `src/screens/ManualEntryScreen.tsx` line 186
   - Changed: `limit: 100` → `limit: 50`

2. **GPT-o3's Prioritized Sequential Fetching Strategy**:
   - **Foundation Foods (1k items)**: Primary generics - highest priority
   - **SR Legacy (7k items)**: Fallback generics  
   - **Survey/FNDDS (26k items)**: Mixed dishes - if needed
   - **Branded (430k items)**: Only on brand intent detection

### 🔧 Implementation Details

#### Brand Intent Detection
```typescript
function detectBrandIntent(query: string): boolean {
  // Checks for known brand keywords
  // Checks for uppercase words (likely brand names)
  // Returns true if brand intent detected
}
```

#### Prioritized Search Strategy
```typescript
async function searchUSDAFoodsPrioritized(query, limit, page, apiKey, requestId) {
  // Step 1: Foundation Foods (highest priority)
  // Step 2: SR Legacy (if need more results)
  // Step 3: Survey/FNDDS (mixed dishes, if still need more)
  // Step 4: Branded (only if brand intent OR very few results)
}
```

### 📊 Data Type Prioritization
- **Foundation**: 1000 score (Primary generics)
- **SR Legacy**: 900 score (Fallback generics)
- **Survey (FNDDS)**: 500 score (Mixed dishes)
- **Branded**: 100 score (Only on brand intent)

### 🏷️ Brand Keywords Detected
- Fast food: McDonald's, Burger King, KFC, Taco Bell, Subway
- Coffee: Starbucks, Dunkin'
- Meat brands: Tyson, Perdue, Foster Farms, Oscar Mayer
- Food brands: Kraft, Heinz, Campbell's, Progresso
- Snacks: Lay's, Doritos, Cheetos, Pringles
- Beverages: Coca Cola, Pepsi, Sprite
- And many more...

### 🎯 Search Result Categorization

#### Generic Searches (no brand intent):
1. **Best Matches**: Top 3 Foundation + 2 SR Legacy (max 4 total)
2. **More Results**: Remaining Foundation/SR Legacy items
3. **Mixed Dishes**: Survey/FNDDS items
4. **Branded Products**: Only if fetched due to low generic results
5. **Cooking Ingredients**: Broths, stocks, seasonings (low priority)

#### Branded Searches (brand intent detected):
1. **Best Matches**: Up to 6 branded items
2. **Generic Alternatives**: 3 Foundation/SR Legacy items

### 🔄 API Rate Limit Management
- Sequential fetching reduces API calls vs parallel approach
- Each data type fetched only if needed
- Graceful degradation if optional data types fail
- Respects 1,000 requests/hour limit

### 📦 Caching Strategy
- Cache key includes query + limit + page
- 15-minute TTL for Edge Function cache
- Client-side 5-minute cache for redundancy

## Phase 2: Strategic Database Ingestion (Future)

### 📋 Planned Implementation
1. **Data Ingestion Pipeline**:
   - Download FDC's 34 CSV files (456,000+ food items)
   - ETL process to denormalize and clean data
   - Load into search-optimized database

2. **Database Options**:
   - **Good**: PostgreSQL with full-text search (`tsvector`)
   - **Better**: Meilisearch or Typesense (recommended sweet spot)
   - **Best**: Elasticsearch/OpenSearch (high complexity)

3. **Benefits**:
   - No API rate limits
   - Sub-100ms search response times
   - Advanced search features (typo tolerance, faceted search)
   - Custom ranking algorithms
   - Unlimited pagination

### 🎯 Expected Performance Improvements
- **Current**: 2-5 second search response (limited by API)
- **Phase 2**: <200ms search response (local database)
- **Reliability**: 99.9%+ uptime (no external dependencies)
- **Scalability**: Handle thousands of concurrent searches

## 🧪 Testing

### Manual Testing Steps
1. Search "chicken" → Should show Foundation/SR Legacy first, minimal branded
2. Search "McDonald's chicken" → Should detect brand intent, show branded first
3. Search "TYSON" → Should detect uppercase brand, show branded first
4. Use "Show more" → Should work without validation error (limit ≤ 50)

### Key Metrics to Monitor
- Search response time
- Data type distribution in results
- Brand intent detection accuracy
- "Show more" functionality
- Cache hit rates

## 📁 Files Modified

### Client Side
- `src/screens/ManualEntryScreen.tsx`: Fixed validation error (limit 100→50)

### Server Side  
- `supabase/functions/food-search/index.ts`: Complete rewrite with:
  - Brand intent detection
  - Prioritized sequential fetching
  - Enhanced categorization
  - Improved logging and error handling

## 🔍 Debug Logging
Enhanced logging for troubleshooting:
- Brand intent detection results
- Each data type fetch step
- Data type distribution in results
- Performance metrics
- Cache hit/miss rates

All logs include correlation IDs for request tracing.