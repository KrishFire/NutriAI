/**
 * Static refinement suggestions for the Refine with AI screen
 * These are context-aware and filtered based on meal items
 */

export interface RefinementSuggestion {
  id: string;
  text: string;
  tags: string[];
  category: 'portion' | 'ingredient' | 'cooking' | 'brand' | 'correction';
}

export const REFINEMENT_SUGGESTIONS: RefinementSuggestion[] = [
  // Portion-related suggestions
  {
    id: 'portion_larger',
    text: 'It was a larger portion',
    tags: ['generic', 'all'],
    category: 'portion',
  },
  {
    id: 'portion_smaller',
    text: 'The portion was smaller',
    tags: ['generic', 'all'],
    category: 'portion',
  },
  {
    id: 'portion_half',
    text: 'I only ate half',
    tags: ['generic', 'all'],
    category: 'portion',
  },
  {
    id: 'portion_double',
    text: 'It was a double serving',
    tags: ['generic', 'all'],
    category: 'portion',
  },

  // Bread-related suggestions
  {
    id: 'bread_whole_wheat',
    text: 'The bread was whole wheat',
    tags: ['sandwich', 'bread', 'toast', 'burger'],
    category: 'ingredient',
  },
  {
    id: 'bread_white',
    text: 'It was white bread',
    tags: ['sandwich', 'bread', 'toast'],
    category: 'ingredient',
  },
  {
    id: 'bread_sourdough',
    text: 'The bread was sourdough',
    tags: ['sandwich', 'bread', 'toast'],
    category: 'ingredient',
  },
  {
    id: 'bun_brioche',
    text: 'It had a brioche bun',
    tags: ['burger', 'sandwich'],
    category: 'ingredient',
  },

  // Condiment suggestions
  {
    id: 'add_mayo',
    text: 'There was mayo on it',
    tags: ['sandwich', 'burger', 'wrap'],
    category: 'ingredient',
  },
  {
    id: 'add_cheese',
    text: 'There was cheese on it',
    tags: ['sandwich', 'burger', 'salad', 'pizza'],
    category: 'ingredient',
  },
  {
    id: 'no_dressing',
    text: 'No dressing on the salad',
    tags: ['salad'],
    category: 'ingredient',
  },
  {
    id: 'ranch_dressing',
    text: 'With ranch dressing',
    tags: ['salad', 'wings'],
    category: 'ingredient',
  },

  // Cooking method suggestions
  {
    id: 'grilled_not_fried',
    text: 'It was grilled, not fried',
    tags: ['chicken', 'fish', 'meat', 'vegetables'],
    category: 'cooking',
  },
  {
    id: 'baked_not_fried',
    text: 'It was baked, not fried',
    tags: ['chicken', 'fish', 'potato', 'fries'],
    category: 'cooking',
  },
  {
    id: 'steamed',
    text: 'It was steamed',
    tags: ['vegetables', 'rice', 'fish'],
    category: 'cooking',
  },
  {
    id: 'raw',
    text: 'It was raw/fresh',
    tags: ['vegetables', 'salad', 'fruit'],
    category: 'cooking',
  },

  // Side dish suggestions
  {
    id: 'add_fries',
    text: 'Add a side of fries',
    tags: ['burger', 'sandwich', 'chicken'],
    category: 'ingredient',
  },
  {
    id: 'add_chips',
    text: 'Add a side of chips',
    tags: ['sandwich', 'burger', 'wrap'],
    category: 'ingredient',
  },
  {
    id: 'add_salad',
    text: 'With a side salad',
    tags: ['burger', 'pizza', 'pasta', 'meat'],
    category: 'ingredient',
  },

  // Drink suggestions
  {
    id: 'add_drink',
    text: 'Add a drink',
    tags: ['generic', 'all'],
    category: 'ingredient',
  },
  {
    id: 'diet_soda',
    text: 'It was diet/zero sugar',
    tags: ['soda', 'coke', 'pepsi', 'drink'],
    category: 'correction',
  },

  // Specific corrections
  {
    id: 'no_bacon',
    text: 'No bacon on it',
    tags: ['burger', 'sandwich', 'salad'],
    category: 'correction',
  },
  {
    id: 'extra_cheese',
    text: 'Extra cheese',
    tags: ['pizza', 'burger', 'sandwich'],
    category: 'ingredient',
  },
  {
    id: 'gluten_free',
    text: 'It was gluten-free',
    tags: ['bread', 'pasta', 'pizza'],
    category: 'correction',
  },

  // Egg-related
  {
    id: 'eggs_scrambled',
    text: 'The eggs were scrambled',
    tags: ['egg', 'breakfast'],
    category: 'cooking',
  },
  {
    id: 'eggs_number',
    text: 'It was 3 eggs, not 2',
    tags: ['egg', 'breakfast'],
    category: 'correction',
  },

  // Brand suggestions
  {
    id: 'mcdonalds',
    text: "It's from McDonald's",
    tags: ['burger', 'fries', 'nuggets'],
    category: 'brand',
  },
  {
    id: 'starbucks',
    text: "It's from Starbucks",
    tags: ['coffee', 'latte', 'sandwich', 'pastry'],
    category: 'brand',
  },
];

/**
 * Get relevant suggestions based on meal items
 */
export function getRelevantSuggestions(
  mealItems: string[],
  maxSuggestions: number = 5
): RefinementSuggestion[] {
  // Extract keywords from meal items
  const keywords = mealItems
    .join(' ')
    .toLowerCase()
    .split(/\s+/);

  // Score each suggestion based on keyword matches
  const scoredSuggestions = REFINEMENT_SUGGESTIONS.map(suggestion => {
    let score = 0;
    
    // Check if any tag matches keywords
    suggestion.tags.forEach(tag => {
      if (tag === 'all' || tag === 'generic') {
        score += 0.1; // Small boost for generic suggestions
      } else if (keywords.some(keyword => keyword.includes(tag) || tag.includes(keyword))) {
        score += 1; // Strong match
      }
    });

    return { suggestion, score };
  });

  // Sort by score and take top suggestions
  const topSuggestions = scoredSuggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .filter(item => item.score > 0)
    .map(item => item.suggestion);

  // If we don't have enough suggestions, add some generic ones
  if (topSuggestions.length < maxSuggestions) {
    const genericSuggestions = REFINEMENT_SUGGESTIONS
      .filter(s => s.tags.includes('generic') || s.tags.includes('all'))
      .slice(0, maxSuggestions - topSuggestions.length);
    
    return [...topSuggestions, ...genericSuggestions];
  }

  return topSuggestions;
}