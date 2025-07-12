/**
 * Open Food Facts API Integration Service
 *
 * This service integrates with the Open Food Facts database to fetch
 * nutrition information for products via barcode scanning.
 *
 * API Documentation: https://openfoodfacts.github.io/api-documentation/
 */

export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_url?: string;
  nutriments?: {
    energy_100g?: number;
    energy_value?: number;
    energy_unit?: string;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  serving_quantity?: number;
  categories?: string;
  nutrition_score_fr?: number;
  nutriscore_grade?: string;
  nova_group?: number;
}

export interface OpenFoodFactsResponse {
  status: number;
  status_verbose: string;
  product?: OpenFoodFactsProduct;
}

export interface NutritionInfo {
  name: string;
  brand?: string;
  barcode: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
  servingQuantity?: number;
  imageUrl?: string;
  categories?: string;
  nutritionGrade?: string;
  novaGroup?: number;
}

export interface BarcodeLookupResult {
  success: boolean;
  data?: NutritionInfo;
  error?: string;
}

/**
 * Fetch product information from Open Food Facts API
 */
export async function lookupBarcode(
  barcode: string
): Promise<BarcodeLookupResult> {
  try {
    console.log('[OpenFoodFacts] Looking up barcode:', barcode);

    // Validate barcode format (basic validation)
    if (!barcode || barcode.length < 8 || barcode.length > 14) {
      return {
        success: false,
        error: 'Invalid barcode format',
      };
    }

    // Make API request to Open Food Facts
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NutriAI/1.0 (React Native Expo App)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: OpenFoodFactsResponse = await response.json();

    // Check if product was found
    if (data.status === 0 || !data.product) {
      return {
        success: false,
        error: 'Product not found in Open Food Facts database',
      };
    }

    // Extract and normalize nutrition data
    const product = data.product;
    const nutriments = product.nutriments || {};

    // Convert calories from kJ to kcal if needed
    let calories = nutriments.energy_100g || 0;
    if (nutriments.energy_unit === 'kJ' && calories > 0) {
      calories = Math.round(calories / 4.184); // Convert kJ to kcal
    } else if (calories > 1000) {
      // Assume it's in kJ if > 1000 (kcal is rarely > 1000 per 100g)
      calories = Math.round(calories / 4.184);
    }

    const nutritionInfo: NutritionInfo = {
      name: product.product_name || 'Unknown Product',
      brand: product.brands || undefined,
      barcode: barcode,
      calories: Math.round(calories || 0),
      protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
      fiber: nutriments.fiber_100g
        ? Math.round(nutriments.fiber_100g * 10) / 10
        : undefined,
      sugar: nutriments.sugars_100g
        ? Math.round(nutriments.sugars_100g * 10) / 10
        : undefined,
      sodium: nutriments.sodium_100g
        ? Math.round(nutriments.sodium_100g * 1000) / 10
        : undefined, // Convert to mg
      servingSize: product.serving_size || '100g',
      servingQuantity: product.serving_quantity,
      imageUrl: product.image_url || undefined,
      categories: product.categories || undefined,
      nutritionGrade: product.nutriscore_grade?.toUpperCase() || undefined,
      novaGroup: product.nova_group || undefined,
    };

    console.log('[OpenFoodFacts] Product found:', nutritionInfo);

    return {
      success: true,
      data: nutritionInfo,
    };
  } catch (error) {
    console.error('[OpenFoodFacts] Error looking up barcode:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to lookup barcode',
    };
  }
}

/**
 * Parse serving size string to extract numeric value in grams
 * Examples: "28g" -> 28, "1 oz (28.35g)" -> 28.35, "30 ml" -> 30
 */
function parseServingSize(
  servingSize: string,
  servingQuantity?: number
): number | null {
  // First check if we have a numeric serving_quantity from the API
  if (servingQuantity && servingQuantity > 0) {
    console.log('[OpenFoodFacts] Using serving_quantity:', servingQuantity);
    return servingQuantity;
  }

  // Try to parse the serving_size string
  if (!servingSize || servingSize === '100g') {
    return null; // Use default 100g
  }

  // Regular expression to extract numeric values with units
  // Matches patterns like: "28g", "28.5 g", "1 oz (28.35g)", "30ml", etc.
  const regex = /(\d+\.?\d*)\s*(g|ml|oz)/gi;
  const matches = [...servingSize.matchAll(regex)];

  if (matches.length === 0) {
    console.log('[OpenFoodFacts] Could not parse serving size:', servingSize);
    return null;
  }

  // Process matches to find grams value
  for (const match of matches) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === 'g' || unit === 'ml') {
      // For liquids, we'll treat ml as g (approximation)
      return value;
    } else if (unit === 'oz') {
      // Convert ounces to grams (1 oz = 28.35g)
      return value * 28.35;
    }
  }

  // If we found matches but couldn't process them
  console.log(
    '[OpenFoodFacts] Found matches but could not process:',
    servingSize
  );
  return null;
}

/**
 * Convert Open Food Facts nutrition data to our MealAnalysis format
 */
export function nutritionInfoToMealAnalysis(
  nutrition: NutritionInfo,
  quantity: number = 1,
  unit: string = 'serving'
): any {
  // Calculate serving size multiplier
  let multiplier = quantity;

  // If we're dealing with servings, calculate based on actual serving size
  if (unit === 'serving') {
    const servingSizeGrams = parseServingSize(
      nutrition.servingSize || '',
      nutrition.servingQuantity
    );

    if (servingSizeGrams) {
      // Convert from per-100g to per-serving
      multiplier = (servingSizeGrams / 100) * quantity;
      console.log(
        `[OpenFoodFacts] Serving size: ${servingSizeGrams}g, multiplier: ${multiplier}`
      );
    } else {
      // Fallback: Show per-100g with a note
      console.log(
        '[OpenFoodFacts] Using per-100g values (could not parse serving size)'
      );
    }
  }

  return {
    foods: [
      {
        name: nutrition.brand
          ? `${nutrition.brand} ${nutrition.name}`
          : nutrition.name,
        quantity: `${quantity} ${unit}`,
        nutrition: {
          calories: Math.round(nutrition.calories * multiplier),
          protein: Math.round(nutrition.protein * multiplier * 10) / 10,
          carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
          fat: Math.round(nutrition.fat * multiplier * 10) / 10,
          fiber: nutrition.fiber
            ? Math.round(nutrition.fiber * multiplier * 10) / 10
            : 0,
          sugar: nutrition.sugar
            ? Math.round(nutrition.sugar * multiplier * 10) / 10
            : 0,
          sodium: nutrition.sodium
            ? Math.round(nutrition.sodium * multiplier * 10) / 10
            : 0,
        },
        confidence: 1.0, // High confidence for barcode scanned items
      },
    ],
    totalNutrition: {
      calories: Math.round(nutrition.calories * multiplier),
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
      fat: Math.round(nutrition.fat * multiplier * 10) / 10,
    },
    confidence: 1.0,
    notes: `Scanned product: ${nutrition.brand ? `${nutrition.brand} ` : ''}${nutrition.name} (Barcode: ${nutrition.barcode})${nutrition.nutritionGrade ? ` - Nutri-Score: ${nutrition.nutritionGrade}` : ''}${
      unit === 'serving' &&
      !parseServingSize(nutrition.servingSize || '', nutrition.servingQuantity)
        ? ' - Nutrition shown per 100g'
        : ''
    }`,
  };
}

/**
 * Search for products by name (optional feature for manual search)
 */
export async function searchProducts(
  query: string,
  limit: number = 10
): Promise<BarcodeLookupResult[]> {
  try {
    console.log('[OpenFoodFacts] Searching products:', query);

    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NutriAI/1.0 (React Native Expo App)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products || [];

    return products.map((product: OpenFoodFactsProduct) => {
      const nutriments = product.nutriments || {};

      let calories = nutriments.energy_100g || 0;
      if (nutriments.energy_unit === 'kJ' && calories > 0) {
        calories = Math.round(calories / 4.184);
      } else if (calories > 1000) {
        calories = Math.round(calories / 4.184);
      }

      const nutritionInfo: NutritionInfo = {
        name: product.product_name || 'Unknown Product',
        brand: product.brands || undefined,
        barcode: product.code,
        calories: Math.round(calories || 0),
        protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
        fiber: nutriments.fiber_100g
          ? Math.round(nutriments.fiber_100g * 10) / 10
          : undefined,
        sugar: nutriments.sugars_100g
          ? Math.round(nutriments.sugars_100g * 10) / 10
          : undefined,
        sodium: nutriments.sodium_100g
          ? Math.round(nutriments.sodium_100g * 1000) / 10
          : undefined,
        servingSize: product.serving_size || '100g',
        imageUrl: product.image_url || undefined,
        categories: product.categories || undefined,
        nutritionGrade: product.nutriscore_grade?.toUpperCase() || undefined,
        novaGroup: product.nova_group || undefined,
      };

      return {
        success: true,
        data: nutritionInfo,
      };
    });
  } catch (error) {
    console.error('[OpenFoodFacts] Error searching products:', error);
    return [];
  }
}
