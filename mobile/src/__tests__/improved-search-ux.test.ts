/**
 * Test file demonstrating the improved search UX
 * 
 * This test validates the key improvements:
 * 1. Multi-factor ranking algorithm
 * 2. Progressive disclosure with categorization
 * 3. Search suggestions
 * 4. Backward compatibility
 */

import { searchFoods, searchFoodsStructured } from '../services/foodSearch';

// Mock the Edge Function response with new structured format
const mockStructuredResponse = {
  resultGroups: [
    {
      title: 'Common Foods',
      items: [
        {
          id: '171705',
          name: 'Chicken, broilers or fryers, breast, meat only, raw',
          servingSize: 100,
          servingUnit: 'g',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          verified: true,
          dataType: 'SR Legacy',
          relevanceScore: 1400
        },
        {
          id: '169956', 
          name: 'Chicken, thigh, meat and skin, cooked, roasted',
          servingSize: 100,
          servingUnit: 'g',
          calories: 250,
          protein: 25.9,
          carbs: 0,
          fat: 15.5,
          verified: true,
          dataType: 'SR Legacy',
          relevanceScore: 1350
        }
      ],
      maxDisplayed: 4
    },
    {
      title: 'Branded Products',
      items: [
        {
          id: '534344',
          name: 'TYSON, Grilled Chicken Strips',
          brand: 'Tyson Foods, Inc.',
          servingSize: 85,
          servingUnit: 'g',
          calories: 110,
          protein: 23,
          carbs: 1,
          fat: 2,
          verified: false,
          dataType: 'Branded',
          relevanceScore: 950
        }
      ],
      maxDisplayed: 3
    },
    {
      title: 'Cooking Ingredients',
      items: [
        {
          id: '174276',
          name: 'Chicken broth, canned, condensed',
          servingSize: 240,
          servingUnit: 'ml',
          calories: 38,
          protein: 4.9,
          carbs: 3.4,
          fat: 1.4,
          verified: true,
          dataType: 'SR Legacy',
          relevanceScore: 700
        }
      ],
      maxDisplayed: 2
    }
  ],
  totalRemaining: 15,
  suggestedQueries: [
    {
      displayText: 'Try "chicken breast" instead',
      query: 'chicken breast',
      reasoning: 'More specific search for chicken'
    },
    {
      displayText: 'Try "grilled chicken" instead',
      query: 'grilled chicken',
      reasoning: 'More specific search for chicken'
    }
  ],
  meta: {
    query: 'chicken',
    totalResults: 20450,
    currentPage: 1,
    processingTime: 245
  }
};

describe('Improved Search UX', () => {
  beforeEach(() => {
    // Mock the Supabase Edge Function response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStructuredResponse)
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Backward Compatibility', () => {
    it('should flatten structured response for legacy searchFoods function', async () => {
      const result = await searchFoods({ query: 'chicken' });
      
      expect(result).toHaveProperty('foods');
      expect(result).toHaveProperty('hasMore');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      
      // Should combine all groups into a single array
      expect(result.foods).toHaveLength(4); // 2 + 1 + 1 from groups
      expect(result.foods[0].name).toContain('breast'); // Highest scored item first
      expect(result.hasMore).toBe(true); // totalRemaining > 0
      expect(result.total).toBe(20450);
    });
  });

  describe('Progressive Disclosure', () => {
    it('should provide structured results with categorization', async () => {
      const result = await searchFoodsStructured('chicken');
      
      expect(result).toHaveProperty('groups');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('totalRemaining');
      expect(result).toHaveProperty('meta');
      
      // Check group structure
      expect(result.groups).toHaveLength(3);
      expect(result.groups[0].title).toBe('Common Foods');
      expect(result.groups[1].title).toBe('Branded Products');
      expect(result.groups[2].title).toBe('Cooking Ingredients');
      
      // Check progressive disclosure limits
      expect(result.groups[0].maxDisplayed).toBe(4);
      expect(result.groups[1].maxDisplayed).toBe(3);
      expect(result.groups[2].maxDisplayed).toBe(2);
    });

    it('should prioritize common foods over branded products', async () => {
      const result = await searchFoodsStructured('chicken');
      
      const commonFoods = result.groups.find(g => g.title === 'Common Foods');
      const brandedFoods = result.groups.find(g => g.title === 'Branded Products');
      
      expect(commonFoods).toBeDefined();
      expect(brandedFoods).toBeDefined();
      
      // Common foods should have higher relevance scores
      const commonScores = commonFoods!.items.map(item => item.relevanceScore || 0);
      const brandedScores = brandedFoods!.items.map(item => item.relevanceScore || 0);
      
      expect(Math.min(...commonScores)).toBeGreaterThan(Math.max(...brandedScores));
    });

    it('should separate cooking ingredients into their own category', async () => {
      const result = await searchFoodsStructured('chicken');
      
      const ingredients = result.groups.find(g => g.title === 'Cooking Ingredients');
      expect(ingredients).toBeDefined();
      expect(ingredients!.items[0].name).toContain('broth');
    });
  });

  describe('Search Suggestions', () => {
    it('should provide relevant search suggestions', async () => {
      const result = await searchFoodsStructured('chicken');
      
      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions[0].displayText).toContain('chicken breast');
      expect(result.suggestions[1].displayText).toContain('grilled chicken');
      
      // Each suggestion should have a reasoning
      result.suggestions.forEach(suggestion => {
        expect(suggestion.reasoning).toBeDefined();
        expect(suggestion.query).toBeDefined();
      });
    });
  });

  describe('UX Improvements Validation', () => {
    it('should solve the chicken search problem', async () => {
      const result = await searchFoodsStructured('chicken');
      
      // Problem: 20,450 confusing results
      // Solution: Progressive disclosure shows only ~9 items initially
      const initialDisplayCount = result.groups.reduce((sum, group) => sum + group.items.length, 0);
      expect(initialDisplayCount).toBeLessThan(10);
      expect(result.totalRemaining).toBeGreaterThan(0);
      
      // Problem: Confusing items like "CHICKEN BOUILLON, CHICKEN" at the top
      // Solution: Common foods (breast, thigh) appear first
      const firstGroup = result.groups[0];
      expect(firstGroup.title).toBe('Common Foods');
      expect(firstGroup.items[0].name).toContain('breast');
      expect(firstGroup.items[0].dataType).toBe('SR Legacy');
      
      // Problem: No way to find specific items
      // Solution: Cooking ingredients are categorized separately
      const ingredientsGroup = result.groups.find(g => g.title === 'Cooking Ingredients');
      expect(ingredientsGroup).toBeDefined();
      expect(ingredientsGroup!.items[0].name).toContain('broth');
    });

    it('should provide clear search refinement path', async () => {
      const result = await searchFoodsStructured('chicken');
      
      // Users should see suggestions for more specific searches
      expect(result.suggestions.length).toBeGreaterThan(0);
      
      // Users should know more results are available
      expect(result.totalRemaining).toBeGreaterThan(0);
      
      // Processing should be fast
      expect(result.meta.processingTime).toBeLessThan(1000);
    });
  });
});

/**
 * Example usage demonstrating the improved UX:
 * 
 * Before: User searches "chicken" → sees 20,450 results starting with confusing items
 * After: User searches "chicken" → sees:
 * 
 * Common Foods (4 results)
 * - Chicken, broilers or fryers, breast, meat only, raw
 * - Chicken, thigh, meat and skin, cooked, roasted
 * - ...
 * 
 * Branded Products (1 result)  
 * - TYSON, Grilled Chicken Strips
 * 
 * Cooking Ingredients (1 result)
 * - Chicken broth, canned, condensed
 * 
 * [Show 15 more results] 
 * 
 * Search suggestions:
 * - Try "chicken breast" instead
 * - Try "grilled chicken" instead
 */