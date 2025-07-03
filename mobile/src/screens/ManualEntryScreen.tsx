import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { RootStackParamList } from '../types/navigation';
import { searchFoodsStructured, FoodItem, foodItemToMealAnalysis } from '../services/foodSearch';
import { useAuth } from '../hooks/useAuth';
import FoodSearchResults from '../components/FoodSearchResults';

// Debug imports
console.log('[ManualEntryScreen] Imports loaded:', {
  searchFoodsStructured: typeof searchFoodsStructured,
  foodItemToMealAnalysis: typeof foodItemToMealAnalysis,
});

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManualEntry'>;

interface FoodResultGroup {
  title: string;
  items: FoodItem[];
  maxDisplayed?: number;
}

interface StructuredSearchResult {
  groups: FoodResultGroup[];
  suggestions: Array<{
    displayText: string;
    query: string;
    reasoning?: string;
  }>;
  totalRemaining: number;
  meta: {
    query: string;
    totalResults: number;
    currentPage: number;
    processingTime?: number;
  };
}

export default function ManualEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, session } = useAuth();
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<StructuredSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, currentPage: number = 1) => {
      if (!searchQuery.trim()) {
        setSearchResult(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      // Check authentication before making API call
      if (!user || !session) {
        setError('Please log in to search for foods');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('[ManualEntryScreen] Starting search for:', searchQuery, 'page:', currentPage);
        console.log('[ManualEntryScreen] searchFoodsStructured function type:', typeof searchFoodsStructured);
        
        const response = await searchFoodsStructured(searchQuery, {
          limit: 50, // Get more results but only show 3-4 initially
          page: currentPage,
        });

        console.log('[ManualEntryScreen] Search response:', response);
        
        setSearchResult(response);
        setPage(currentPage);
      } catch (err) {
        console.error('[ManualEntryScreen] Search error:', err);
        console.error('[ManualEntryScreen] Error stack:', err instanceof Error ? err.stack : 'No stack');
        setError(err instanceof Error ? err.message : 'Failed to search foods');
        if (currentPage === 1) {
          setSearchResult(null);
        }
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [user, session]
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    setPage(1);
    debouncedSearch(query, 1);
    
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleSelectFood = (foodItem: FoodItem) => {
    // Convert food item to meal analysis format and navigate
    const analysisData = foodItemToMealAnalysis(foodItem);
    
    navigation.navigate('MealDetails', {
      analysisData,
    });
  };

  const handleLoadMore = (groupTitle: string) => {
    // TODO: Implement loading more items for a specific group
    // For now, we'll just log this
    console.log('[ManualEntryScreen] Load more requested for:', groupTitle);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchResult(null);
    setError(null);
  };

  const handleSuggestionPress = (suggestion: { query: string }) => {
    setQuery(suggestion.query);
    debouncedSearch(suggestion.query, 1);
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => debouncedSearch(query, 1)}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (query.length > 0 && (!searchResult || searchResult.groups.length === 0)) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color="#C7C7CC" />
          <Text style={styles.emptyText}>No results found for "{query}"</Text>
          <Text style={styles.emptySubtext}>Try searching for something else</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="restaurant" size={48} color="#C7C7CC" />
        <Text style={styles.emptyText}>Search for foods</Text>
        <Text style={styles.emptySubtext}>Start typing to find foods from the USDA database</Text>
      </View>
    );
  };

  const renderSearchSuggestions = () => {
    if (!searchResult?.suggestions || searchResult.suggestions.length === 0) return null;
    
    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Try searching for:</Text>
        {searchResult.suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion.displayText}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search for a food..."
              placeholderTextColor="#8E8E93"
              value={query}
              onChangeText={setQuery}
              autoFocus={true}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle-outline" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <ScrollView
          style={styles.scrollView}
          keyboardDismissMode="on-drag"
          contentContainerStyle={!searchResult || searchResult.groups.length === 0 ? styles.emptyScrollContent : styles.scrollContent}
        >
          {searchResult && searchResult.groups.length > 0 ? (
            <>
              <FoodSearchResults
                groups={searchResult.groups}
                totalRemaining={searchResult.totalRemaining}
                onSelectFood={handleSelectFood}
                onLoadMore={handleLoadMore}
                isLoading={isLoading && page > 1}
              />
              {renderSearchSuggestions()}
            </>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 36,
    fontSize: 16,
    color: '#000000',
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  suggestionsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#3C3C43',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
    marginRight: 16,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  foodBrand: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  foodServing: {
    fontSize: 14,
    color: '#8E8E93',
  },
  nutritionInfo: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  caloriesLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  verifiedIcon: {
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});