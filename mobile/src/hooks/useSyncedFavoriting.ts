import { useState, useCallback, useEffect } from 'react';

// Generic interface for items with favorites and possible children
export interface FavoriteItem {
  id: string;
  name: string;
  isFavorite: boolean;
  ingredients?: FavoriteItem[];
  [key: string]: any; // Allow additional properties
}

/**
 * Custom hook for syncing favorite states with "all or nothing" behavior
 * When ANY item (parent or child) is toggled, ALL items in that group toggle together
 */
export const useSyncedFavoriting = <T extends FavoriteItem>(
  initialItems: T[]
) => {
  const [items, setItems] = useState<T[]>(initialItems);

  // Reset state when initial items change (e.g., on data fetch)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  /**
   * Toggle favorite state for an entire food group (parent + all ingredients)
   * @param itemId - The ID of the parent item
   * @param ingredientId - Optional ID of a child ingredient (ignored - all toggle together)
   */
  const toggleFavorite = useCallback((itemId: string, ingredientId?: string) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      
      // Find the parent item (whether clicked on parent or child)
      const parentIndex = newItems.findIndex(item => item.id === itemId);
      if (parentIndex === -1) return prevItems;
      
      // Get current state - if ANY item is favorited, we'll unfavorite all
      // If NONE are favorited, we'll favorite all
      const parent = newItems[parentIndex];
      const anyFavorited = parent.isFavorite || 
        (parent.ingredients?.some(ing => ing.isFavorite) ?? false);
      
      // Toggle ALL items to opposite of current state
      const newFavoriteState = !anyFavorited;
      
      // Update parent and all children with same state
      newItems[parentIndex] = {
        ...parent,
        isFavorite: newFavoriteState,
        ingredients: parent.ingredients?.map(ing => ({
          ...ing,
          isFavorite: newFavoriteState
        }))
      };
      
      return newItems;
    });
  }, []);

  return {
    items,
    toggleFavorite,
  };
};

export default useSyncedFavoriting;