# NutriAI Mobile App - Comprehensive Test Plan

## Test Overview
This document outlines the comprehensive test plan for verifying the fixes made to the NutriAI mobile application. The main focus areas are:
1. Daily log fetching with empty database handling
2. Food search functionality
3. Edge case handling and error scenarios
4. Integration between components

## Test Environment Setup
- Platform: React Native with Expo
- Test Framework: Jest + React Native Testing Library
- Backend: Supabase (cdqtuxepvomeyfkvfrnj)
- Authentication: Required for all operations

## Test Categories

### 1. Daily Log Fetching Tests

#### Test Case 1.1: New User with No Daily Log
**Purpose**: Verify that new users with no existing daily log get proper default values instead of errors.

**Preconditions**:
- User is authenticated
- Database has no daily_logs entry for the user on current date

**Test Steps**:
1. Login with a new user account
2. Navigate to HomeScreen
3. Observe nutrition data display

**Expected Results**:
- No errors in console
- Nutrition values display as 0/target (e.g., 0/2000 calories)
- Loading state properly managed
- No crash or error messages shown to user

**Implementation**:
```typescript
// Check getTodaysNutrition returns null-safe default
const result = await getTodaysNutrition(userId);
expect(result).toEqual({
  user_id: userId,
  date: today,
  total_calories: 0,
  total_protein: 0,
  total_carbs: 0,
  total_fat: 0,
});
```

#### Test Case 1.2: Existing User with Previous Days' Logs
**Purpose**: Ensure that previous day logs don't interfere with today's empty log.

**Preconditions**:
- User has logs from previous days
- No log exists for today

**Test Steps**:
1. Login with existing user
2. Check that today's date shows 0 values
3. Verify previous days' data is not shown

**Expected Results**:
- Today's nutrition shows 0 values
- No data leakage from previous days

#### Test Case 1.3: Concurrent Daily Log Creation
**Purpose**: Test race condition handling when multiple operations try to create daily log.

**Test Steps**:
1. Trigger multiple meal saves simultaneously
2. Verify only one daily log is created

**Expected Results**:
- Single daily_log entry created
- No duplicate key errors
- All meals properly associated with the single log

### 2. Food Search Functionality Tests

#### Test Case 2.1: Basic Food Search
**Purpose**: Verify food search returns results for valid queries.

**Preconditions**:
- User is authenticated
- Food search Edge Function is deployed and accessible

**Test Steps**:
1. Navigate to Manual Entry screen
2. Search for "apple"
3. Verify results display

**Expected Results**:
- Results load within 3 seconds
- Multiple apple varieties shown
- Nutrition data properly displayed
- No console errors

#### Test Case 2.2: Empty Search Query Handling
**Purpose**: Ensure empty or whitespace queries are handled gracefully.

**Test Steps**:
1. Submit empty search query
2. Submit whitespace-only query

**Expected Results**:
- Appropriate validation error message
- No API call made
- User-friendly error display

#### Test Case 2.3: Search with Special Characters
**Purpose**: Test query sanitization and special character handling.

**Test Cases**:
- Search with emojis: "🍎"
- Search with symbols: "apple & banana"
- Search with numbers: "2% milk"

**Expected Results**:
- Queries properly encoded
- Valid results or graceful error handling
- No injection vulnerabilities

#### Test Case 2.4: Pagination Testing
**Purpose**: Verify pagination works correctly.

**Test Steps**:
1. Search for common term (e.g., "chicken")
2. Scroll to load more results
3. Verify pagination state

**Expected Results**:
- Additional results load properly
- No duplicate items
- Proper "hasMore" state management

### 3. Error Handling Tests

#### Test Case 3.1: Network Failure Scenarios
**Purpose**: Test app behavior during network issues.

**Test Scenarios**:
- No internet connection
- Timeout during API call
- Partial response received

**Expected Results**:
- Clear error messages to user
- Retry options available
- App doesn't crash
- Cached data (if any) still accessible

#### Test Case 3.2: Authentication Errors
**Purpose**: Verify proper handling of auth issues.

**Test Scenarios**:
- Expired token
- Invalid token
- Missing auth header

**Expected Results**:
- Redirect to login when appropriate
- Clear error messaging
- No infinite loops

#### Test Case 3.3: Rate Limiting
**Purpose**: Test rate limit handling for food search.

**Test Steps**:
1. Perform rapid successive searches
2. Trigger rate limit

**Expected Results**:
- Graceful error message
- Retry with exponential backoff
- User informed of limitation

### 4. Integration Tests

#### Test Case 4.1: Full Meal Logging Flow
**Purpose**: Test complete flow from search to saved meal.

**Test Steps**:
1. Search for food item
2. Select item from results
3. Confirm and save meal
4. Verify updates in daily totals

**Expected Results**:
- Seamless flow without errors
- Daily totals update correctly
- Meal appears in history
- All nutrition values accurate

#### Test Case 4.2: Multi-Component State Sync
**Purpose**: Verify state updates propagate correctly.

**Test Steps**:
1. Add meal via camera
2. Navigate to home screen
3. Check nutrition rings update
4. Navigate to history
5. Verify meal appears

**Expected Results**:
- All components show consistent data
- No stale data issues
- Real-time updates work

### 5. Edge Cases and Boundary Tests

#### Test Case 5.1: Extremely Long Food Names
**Purpose**: Test UI handling of long text.

**Test Data**:
- 100+ character food descriptions
- Foods with very long brand names

**Expected Results**:
- Text properly truncated
- UI layout not broken
- Full name available on detail view

#### Test Case 5.2: Large Nutrition Values
**Purpose**: Test handling of extreme nutrition values.

**Test Data**:
- Foods with 5000+ calories
- Zero nutrition values
- Decimal precision handling

**Expected Results**:
- Values displayed correctly
- No overflow in UI
- Proper rounding applied

#### Test Case 5.3: Rapid User Actions
**Purpose**: Test debouncing and race conditions.

**Test Scenarios**:
- Rapid search input changes
- Multiple quick meal saves
- Fast navigation between screens

**Expected Results**:
- Debouncing prevents excessive API calls
- No duplicate saves
- UI remains responsive

## Performance Criteria

1. **Search Response Time**: < 2 seconds (95th percentile)
2. **Screen Load Time**: < 1 second
3. **Meal Save Time**: < 3 seconds
4. **Memory Usage**: No memory leaks during extended use
5. **Battery Impact**: Minimal battery drain

## Regression Test Suite

### Core Functionality Checks:
1. User registration and login
2. Photo-based meal analysis
3. Voice input processing
4. Barcode scanning
5. Manual food entry
6. Daily nutrition tracking
7. Meal history viewing
8. Profile management
9. Streak tracking
10. Navigation flow

## Test Execution Plan

### Phase 1: Unit Tests
- Test individual service functions
- Verify error handling in isolation
- Mock external dependencies

### Phase 2: Integration Tests
- Test service interactions
- Verify data flow between components
- Test with real backend connections

### Phase 3: End-to-End Tests
- Complete user workflows
- Cross-platform testing (iOS/Android)
- Performance benchmarking

### Phase 4: User Acceptance Testing
- Real device testing
- Various network conditions
- Different user scenarios

## Success Criteria

The fixes are considered successful when:
1. ✅ No errors occur for new users with empty databases
2. ✅ Food search returns results reliably
3. ✅ All error scenarios are handled gracefully
4. ✅ Performance meets specified criteria
5. ✅ No regressions in existing functionality
6. ✅ Edge cases don't cause crashes or data loss

## Test Automation Recommendations

1. **Critical Path Tests**: Automate daily log creation and food search
2. **Smoke Tests**: Basic app launch and navigation
3. **API Contract Tests**: Verify Edge Function responses
4. **Visual Regression**: Screenshot comparisons for UI consistency