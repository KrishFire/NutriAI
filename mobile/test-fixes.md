# Test Plan for Navigation and Refine Button Fixes

## 1. Navigation Fix Testing

### Test Case 1: Save New Meal

1. Open app, go to Camera screen
2. Take a photo of food
3. On MealDetails screen, save the meal
4. **Expected**: Should navigate to Home tab automatically

### Test Case 2: Update Existing Meal from History

1. Go to History tab
2. Select an existing meal
3. Edit some values
4. Save the meal
5. **Expected**: Should navigate back to History tab automatically

### Test Case 3: Add Food Item to Existing Meal

1. Go to History tab
2. Select an existing meal
3. Click "Add Food Item" (photo)
4. Add an item
5. **Expected**: Should navigate back to History tab after saving

## 2. Refine with AI Button Testing

### Test Case 1: New Meal (Created via Camera/Voice/Text)

1. Create a new meal through any method
2. View it in MealDetails
3. **Expected**: "Refine with AI" button should be VISIBLE (has real UUID)

### Test Case 2: Historical Meal View

1. Go to History tab
2. Select a meal from a previous day
3. **Expected**: "Refine with AI" button should be:
   - VISIBLE if meal has real meal_group_id (created after fix)
   - HIDDEN if meal only has synthetic ID (old meals)

### Test Case 3: Refine Function Works

1. Find a meal with visible "Refine with AI" button
2. Click the button
3. Enter correction like "Actually it was 2 slices of pizza not 1"
4. Submit
5. **Expected**: Meal should update with corrected analysis

## Implementation Status

### ✅ Completed Fixes:

1. **Navigation**: Using CommonActions.reset() for reliable navigation
2. **TypeScript Types**: Added NavigatorScreenParams for nested navigation
3. **UUID Detection**: Fixed to use proper UUID regex pattern
4. **Meal IDs**: getMealHistory now returns actual meal_group_id when available

### 🔍 How the Fixes Work:

- Navigation now resets the entire stack and rebuilds it at the desired tab
- "Refine with AI" checks for valid UUID format (not just presence of hyphens)
- Historical meals use real meal_group_id when available, synthetic IDs as fallback
