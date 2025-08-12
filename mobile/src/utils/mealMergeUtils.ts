/**
 * Utility functions for merging meal data with fuzzy matching
 */

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Normalize item name for comparison
 */
function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')  // collapse multiple spaces
    .replace(/['']/g, "'") // normalize quotes
    .replace(/&/g, 'and'); // normalize ampersands
}

/**
 * Check if two names are similar enough to be considered the same item
 * Uses Levenshtein distance with a similarity threshold
 */
function areSimilarNames(name1: string, name2: string, threshold: number = 0.85): boolean {
  const norm1 = normalizeItemName(name1);
  const norm2 = normalizeItemName(name2);
  
  // Exact match after normalization
  if (norm1 === norm2) return true;
  
  // Check for semantic replacements (e.g., "strawberry protein shake" -> "blueberry protein shake")
  // Extract core item type (last 2-3 words usually define the item)
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  
  // If both have 3+ words and last 2 words match, consider it a semantic replacement
  if (words1.length >= 3 && words2.length >= 3) {
    const lastTwo1 = words1.slice(-2).join(' ');
    const lastTwo2 = words2.slice(-2).join(' ');
    if (lastTwo1 === lastTwo2) {
      // Same core item (e.g., "protein shake"), likely just modifier changed
      return true;
    }
  }
  
  // Check for common patterns like "X sandwich" -> "Y sandwich"
  const patterns = [
    /(\w+\s+)?(protein\s+)?shake/i,
    /(\w+\s+)?sandwich/i,
    /(\w+\s+)?burger/i,
    /(\w+\s+)?salad/i,
    /(\w+\s+)?smoothie/i,
    /(\w+\s+)?coffee/i,
    /(\w+\s+)?tea/i,
    /(\w+\s+)?wrap/i,
    /(\w+\s+)?bowl/i,
  ];
  
  for (const pattern of patterns) {
    const match1 = norm1.match(pattern);
    const match2 = norm2.match(pattern);
    if (match1 && match2 && match1[0].split(' ').slice(-1)[0] === match2[0].split(' ').slice(-1)[0]) {
      // Same base item type
      return true;
    }
  }
  
  // Calculate similarity score (1 - normalized Levenshtein distance)
  const maxLen = Math.max(norm1.length, norm2.length);
  if (maxLen === 0) return true;
  
  const distance = levenshteinDistance(norm1, norm2);
  const similarity = 1 - (distance / maxLen);
  
  return similarity >= threshold;
}

/**
 * Find a matching food item by fuzzy name matching
 */
function findMatchingFood(targetFood: any, foodsList: any[]): any | null {
  for (const food of foodsList) {
    if (areSimilarNames(targetFood.name, food.name)) {
      return food;
    }
  }
  return null;
}

/**
 * Merge nutrition data, preferring refined values when explicitly changed
 */
function mergeNutrition(existing: any, refined: any): any {
  // If nutrition values are significantly different (>10% change), use refined
  // Otherwise keep existing (preserves user edits)
  const significantChange = (old: number, new_: number) => {
    if (old === 0 && new_ === 0) return false;
    if (old === 0 || new_ === 0) return true;
    return Math.abs((new_ - old) / old) > 0.1;
  };

  const result = { ...existing };
  
  // Preserve quantity and unit from refined if provided
  if (refined.quantity !== undefined) {
    result.quantity = refined.quantity;
  }
  if (refined.unit !== undefined) {
    result.unit = refined.unit;
  }
  
  if (refined.nutrition) {
    // Nested nutrition structure
    if (!result.nutrition) result.nutrition = {};
    
    if (significantChange(result.nutrition.calories || 0, refined.nutrition.calories || 0)) {
      result.nutrition.calories = refined.nutrition.calories;
    }
    if (significantChange(result.nutrition.protein || 0, refined.nutrition.protein || 0)) {
      result.nutrition.protein = refined.nutrition.protein;
    }
    if (significantChange(result.nutrition.carbs || 0, refined.nutrition.carbs || 0)) {
      result.nutrition.carbs = refined.nutrition.carbs;
    }
    if (significantChange(result.nutrition.fat || 0, refined.nutrition.fat || 0)) {
      result.nutrition.fat = refined.nutrition.fat;
    }
  } else {
    // Flat nutrition structure (fallback)
    if (significantChange(result.calories || 0, refined.calories || 0)) {
      result.calories = refined.calories;
    }
    if (significantChange(result.protein || 0, refined.protein || 0)) {
      result.protein = refined.protein;
    }
    if (significantChange(result.carbs || 0, refined.carbs || 0)) {
      result.carbs = refined.carbs;
    }
    if (significantChange(result.fat || 0, refined.fat || 0)) {
      result.fat = refined.fat;
    }
  }
  
  // If refined has ingredients, replace the entire ingredients array
  // (The AI returns a complete updated list with proper units)
  // Only replace if we have a non-empty array to avoid accidental data loss
  if (refined.ingredients && Array.isArray(refined.ingredients) && refined.ingredients.length > 0) {
    result.ingredients = refined.ingredients;
  } else if (refined.ingredients === undefined) {
    // If ingredients weren't included in the refinement, keep existing
    // This preserves ingredients when only updating other properties
  }
  
  return result;
}

/**
 * Merge refined foods into existing foods, preserving all items
 * - Never deletes unmentioned items
 * - Updates nutrition only when explicitly changed
 * - Adds new items from refinement
 * - Handles ingredient additions to composites
 */
export function mergeFoodsPreservingExisting(
  existingFoods: any[],
  refinedFoods: any[]
): any[] {
  if (!existingFoods || existingFoods.length === 0) {
    return refinedFoods || [];
  }
  
  if (!refinedFoods || refinedFoods.length === 0) {
    return existingFoods;
  }
  
  // Start with a copy of existing foods
  const mergedFoods = [...existingFoods];
  const processedIndices = new Set<number>();
  
  // Process each refined food
  for (const refinedFood of refinedFoods) {
    // Find matching existing food
    let matchIndex = -1;
    for (let i = 0; i < mergedFoods.length; i++) {
      if (!processedIndices.has(i) && areSimilarNames(refinedFood.name, mergedFoods[i].name)) {
        matchIndex = i;
        break;
      }
    }
    
    if (matchIndex >= 0) {
      // Update existing food (merge nutrition and ingredients)
      mergedFoods[matchIndex] = mergeNutrition(mergedFoods[matchIndex], refinedFood);
      processedIndices.add(matchIndex);
    } else {
      // Add as new food
      mergedFoods.push(refinedFood);
    }
  }
  
  return mergedFoods;
}

/**
 * Calculate total calories from foods array
 */
export function calculateTotalCalories(foods: any[]): number {
  return foods.reduce((total, food) => {
    const calories = food.nutrition?.calories || food.calories || 0;
    return total + calories;
  }, 0);
}

/**
 * Calculate total protein from foods array
 */
export function calculateTotalProtein(foods: any[]): number {
  return foods.reduce((total, food) => {
    const protein = food.nutrition?.protein || food.protein || 0;
    return total + protein;
  }, 0);
}

/**
 * Calculate total carbs from foods array
 */
export function calculateTotalCarbs(foods: any[]): number {
  return foods.reduce((total, food) => {
    const carbs = food.nutrition?.carbs || food.carbs || 0;
    return total + carbs;
  }, 0);
}

/**
 * Calculate total fat from foods array
 */
export function calculateTotalFat(foods: any[]): number {
  return foods.reduce((total, food) => {
    const fat = food.nutrition?.fat || food.fat || 0;
    return total + fat;
  }, 0);
}