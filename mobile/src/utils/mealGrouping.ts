import { MealAnalysis, FoodItem } from '../services/openai';

interface FoodGroup {
  id: string;
  name: string;
  quantity: string;
  originalQuantity?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  servingMultiplier: number;
  expanded: boolean;
  isFavorite: boolean;
  ingredients?: Ingredient[];
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isFavorite: boolean;
}

/**
 * Transform a meal analysis into grouped format with hierarchical structure
 * This is extracted from FoodResultsScreen and used to preserve ingredient hierarchy
 */
export const transformAnalysisToGroups = (analysis: MealAnalysis): FoodGroup[] => {
  if (!analysis || !analysis.foods) {
    return [];
  }
  
  const foods = analysis.foods;
  const groups: FoodGroup[] = [];
  
  // Check if AI already returns hierarchical structure
  const hasHierarchicalStructure = foods.some((food: any) => 
    food.ingredients && food.ingredients.length > 0
  );
  
  if (hasHierarchicalStructure) {
    // AI returns hierarchical structure - use it directly
    foods.forEach((food: any, index: number) => {
      const hasIngredients = food.ingredients && food.ingredients.length > 0;
      
      // For branded items with ingredients, use the known nutrition values
      // For non-branded items with ingredients, start with zero (will be calculated)
      // For items without ingredients, use the provided values
      const initialNutrition = (hasIngredients && !food.isBranded) ? 
        { calories: 0, protein: 0, carbs: 0, fat: 0 } :
        {
          calories: Math.round(food.nutrition?.calories || food.calories || 0),
          protein: Math.round(food.nutrition?.protein || food.protein || 0),
          carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
          fat: Math.round(food.nutrition?.fat || food.fat || 0),
        };
      
      const foodGroup: FoodGroup = {
        id: `food_${index}`,
        name: food.name || 'Unknown Item',
        isParent: hasIngredients,
        baseNutrition: initialNutrition,
        nutrition: initialNutrition,
        servingMultiplier: 1,
        expanded: false,
        isFavorite: false,
        ingredients: [],
        originalQuantity: food.quantity || '1 serving',
      };
      
      if (hasIngredients) {
        foodGroup.ingredients = food.ingredients.map((ingredient: any, ingredientIndex: number) => ({
          id: `ingredient_${index}_${ingredientIndex}`,
          name: ingredient.name,
          quantity: ingredient.quantity, // Already formatted from mealAI.ts
          nutrition: {
            calories: Math.round(ingredient.nutrition?.calories || ingredient.calories || 0),
            protein: Math.round(ingredient.nutrition?.protein || ingredient.protein || 0),
            carbs: Math.round(ingredient.nutrition?.carbs || ingredient.carbs || 0),
            fat: Math.round(ingredient.nutrition?.fat || ingredient.fat || 0),
          },
          isFavorite: false,
        }));
        
        // ONLY recalculate parent nutrition for non-branded items
        // Branded items should preserve their known nutrition values from the server
        if (!food.isBranded) {
          const totalIngredientNutrition = foodGroup.ingredients.reduce(
            (total, ingredient) => ({
              calories: total.calories + ingredient.nutrition.calories,
              protein: total.protein + ingredient.nutrition.protein,
              carbs: total.carbs + ingredient.nutrition.carbs,
              fat: total.fat + ingredient.nutrition.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          );
          foodGroup.baseNutrition = totalIngredientNutrition;
          foodGroup.nutrition = totalIngredientNutrition;
        }
      }
      
      groups.push(foodGroup);
    });
  } else {
    // Flat structure - attempt to group by common patterns
    const itemMap = new Map<string, any[]>();
    
    foods.forEach((food: any) => {
      const name = food.name || 'Unknown Item';
      
      // Try to identify if this is an ingredient of something else
      const isLikelyIngredient = 
        name.toLowerCase().includes('sauce') ||
        name.toLowerCase().includes('dressing') ||
        name.toLowerCase().includes('cheese') ||
        name.toLowerCase().includes('lettuce') ||
        name.toLowerCase().includes('tomato') ||
        name.toLowerCase().includes('onion') ||
        name.toLowerCase().includes('pickle') ||
        (food.quantity && food.quantity.toLowerCase().includes('slice')) ||
        (food.quantity && food.quantity.toLowerCase().includes('tbsp')) ||
        (food.quantity && food.quantity.toLowerCase().includes('tsp'));
      
      // Try to identify parent items
      const isLikelyParent = 
        name.toLowerCase().includes('sandwich') ||
        name.toLowerCase().includes('burger') ||
        name.toLowerCase().includes('wrap') ||
        name.toLowerCase().includes('salad') ||
        name.toLowerCase().includes('bowl') ||
        name.toLowerCase().includes('pizza') ||
        name.toLowerCase().includes('taco');
      
      if (isLikelyParent || !isLikelyIngredient) {
        // This looks like a main item
        if (!itemMap.has(name)) {
          itemMap.set(name, []);
        }
      } else {
        // This might be an ingredient - try to find a parent
        let foundParent = false;
        for (const [parentName, ingredients] of itemMap.entries()) {
          if (parentName.toLowerCase().includes('sandwich') || 
              parentName.toLowerCase().includes('burger') ||
              parentName.toLowerCase().includes('wrap')) {
            ingredients.push(food);
            foundParent = true;
            break;
          }
        }
        
        if (!foundParent) {
          // Treat as standalone item
          itemMap.set(name, []);
        }
      }
    });
    
    // Convert map to groups
    let groupIndex = 0;
    for (const [itemName, ingredients] of itemMap.entries()) {
      const mainFood = foods.find((f: any) => f.name === itemName);
      if (!mainFood) continue;
      
      const hasIngredients = ingredients.length > 0;
      const foodGroup: FoodGroup = {
        id: `food_${groupIndex}`,
        name: itemName,
        isParent: hasIngredients,
        baseNutrition: {
          calories: Math.round(mainFood.nutrition?.calories || mainFood.calories || 0),
          protein: Math.round(mainFood.nutrition?.protein || mainFood.protein || 0),
          carbs: Math.round(mainFood.nutrition?.carbs || mainFood.carbs || 0),
          fat: Math.round(mainFood.nutrition?.fat || mainFood.fat || 0),
        },
        nutrition: {
          calories: Math.round(mainFood.nutrition?.calories || mainFood.calories || 0),
          protein: Math.round(mainFood.nutrition?.protein || mainFood.protein || 0),
          carbs: Math.round(mainFood.nutrition?.carbs || mainFood.carbs || 0),
          fat: Math.round(mainFood.nutrition?.fat || mainFood.fat || 0),
        },
        servingMultiplier: 1,
        expanded: false,
        isFavorite: false,
        originalQuantity: mainFood.quantity || '1 serving',
        ingredients: ingredients.map((ing: any, idx: number) => ({
          id: `ingredient_${groupIndex}_${idx}`,
          name: ing.name,
          quantity: ing.quantity,
          nutrition: {
            calories: Math.round(ing.nutrition?.calories || ing.calories || 0),
            protein: Math.round(ing.nutrition?.protein || ing.protein || 0),
            carbs: Math.round(ing.nutrition?.carbs || ing.carbs || 0),
            fat: Math.round(ing.nutrition?.fat || ing.fat || 0),
          },
          isFavorite: false,
        })),
      };
      
      groups.push(foodGroup);
      groupIndex++;
    }
    
    // Add any remaining ungrouped items
    foods.forEach((food: any, index: number) => {
      const isAlreadyGrouped = groups.some(g => 
        g.name === food.name || 
        g.ingredients?.some(i => i.name === food.name)
      );
      
      if (!isAlreadyGrouped) {
        groups.push({
          id: `food_${groups.length}`,
          name: food.name || 'Unknown Item',
          isParent: false,
          baseNutrition: {
            calories: Math.round(food.nutrition?.calories || food.calories || 0),
            protein: Math.round(food.nutrition?.protein || food.protein || 0),
            carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
            fat: Math.round(food.nutrition?.fat || food.fat || 0),
          },
          nutrition: {
            calories: Math.round(food.nutrition?.calories || food.calories || 0),
            protein: Math.round(food.nutrition?.protein || food.protein || 0),
            carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
            fat: Math.round(food.nutrition?.fat || food.fat || 0),
          },
          servingMultiplier: 1,
          expanded: false,
          isFavorite: false,
        });
      }
    });
  }
  
  return groups;
};

/**
 * Convert grouped structure back to flat MealAnalysis format
 * Used when saving or passing data between screens
 */
export const groupsToMealAnalysis = (groups: FoodGroup[], originalAnalysis?: MealAnalysis): MealAnalysis => {
  const foods: FoodItem[] = [];
  
  groups.forEach(group => {
    const food: FoodItem = {
      name: group.name,
      quantity: group.originalQuantity || '1 serving', // Preserve original quantity
      nutrition: {
        calories: group.nutrition.calories,
        protein: group.nutrition.protein,
        carbs: group.nutrition.carbs,
        fat: group.nutrition.fat,
      },
      confidence: 0.95,
    };
    
    // Add ingredients if this is a parent item
    if (group.isParent && group.ingredients && group.ingredients.length > 0) {
      food.ingredients = group.ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        nutrition: ing.nutrition,
        confidence: 0.95,
      }));
    }
    
    foods.push(food);
  });
  
  // Calculate total nutrition
  const totalNutrition = foods.reduce(
    (total, food) => ({
      calories: total.calories + (food.nutrition?.calories || 0),
      protein: total.protein + (food.nutrition?.protein || 0),
      carbs: total.carbs + (food.nutrition?.carbs || 0),
      fat: total.fat + (food.nutrition?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  
  return {
    foods,
    totalNutrition,
    confidence: originalAnalysis?.confidence || 0.95,
    notes: originalAnalysis?.notes,
    title: originalAnalysis?.title,
  };
};

/**
 * Check if a MealAnalysis has any hierarchical structure
 */
export const hasHierarchicalStructure = (analysis: MealAnalysis): boolean => {
  return analysis.foods.some(food => 
    food.ingredients && food.ingredients.length > 0
  );
};

/**
 * Apply grouping to flat meal analysis to create hierarchical structure
 * Used defensively when AI returns flat structure but we want hierarchy
 */
export const applyGroupingToFlatAnalysis = (analysis: MealAnalysis): MealAnalysis => {
  // If already has hierarchy, return as-is
  if (hasHierarchicalStructure(analysis)) {
    return analysis;
  }
  
  // Transform to groups and back to get hierarchical structure
  const groups = transformAnalysisToGroups(analysis);
  return groupsToMealAnalysis(groups, analysis);
};