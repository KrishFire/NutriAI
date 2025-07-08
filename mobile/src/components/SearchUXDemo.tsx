/**
 * SearchUXDemo Component
 *
 * Demonstrates the improved food search UX with:
 * - Progressive disclosure with categorized results
 * - Search suggestions
 * - "Show more" functionality
 * - Comparison with old vs new search experience
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { searchFoods, searchFoodsStructured } from '../services/foodSearch';

interface SearchResult {
  groups: Array<{
    title: string;
    items: Array<{
      id: string;
      name: string;
      brand?: string;
      calories: number;
      dataType: string;
      relevanceScore?: number;
    }>;
    maxDisplayed?: number;
  }>;
  suggestions: Array<{
    displayText: string;
    query: string;
    reasoning?: string;
  }>;
  totalRemaining: number;
  meta: {
    query: string;
    totalResults: number;
    processingTime?: number;
  };
}

export default function SearchUXDemo() {
  const [query, setQuery] = useState('chicken');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [legacyResults, setLegacyResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Get structured results
      const structuredResult = await searchFoodsStructured(query.trim());
      setSearchResult(structuredResult);

      // Also get legacy results for comparison
      if (showComparison) {
        const legacyResult = await searchFoods({ query: query.trim() });
        setLegacyResults(legacyResult);
      }
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search foods. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionTap = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
    // Auto-search the suggestion
    setTimeout(() => handleSearch(), 100);
  };

  const renderFoodItem = (item: any, showScore = false) => (
    <View key={item.id} style={styles.foodItem}>
      <Text style={styles.foodName} numberOfLines={2}>
        {item.name}
      </Text>
      {item.brand && <Text style={styles.brandName}>{item.brand}</Text>}
      <View style={styles.foodDetails}>
        <Text style={styles.calories}>{Math.round(item.calories)} cal</Text>
        <Text style={styles.dataType}>{item.dataType}</Text>
        {showScore && item.relevanceScore && (
          <Text style={styles.score}>Score: {item.relevanceScore}</Text>
        )}
      </View>
    </View>
  );

  const renderSearchGroup = (group: any) => (
    <View key={group.title} style={styles.searchGroup}>
      <Text style={styles.groupTitle}>{group.title}</Text>
      <View style={styles.groupItems}>
        {group.items.map((item: any) => renderFoodItem(item, true))}
      </View>
      {group.maxDisplayed && group.items.length === group.maxDisplayed && (
        <Text style={styles.groupNote}>
          Showing top {group.maxDisplayed} results in this category
        </Text>
      )}
    </View>
  );

  const renderSuggestions = () => {
    if (!searchResult?.suggestions.length) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Try these searches instead:</Text>
        {searchResult.suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionButton}
            onPress={() => handleSuggestionTap(suggestion.query)}
          >
            <Text style={styles.suggestionText}>{suggestion.displayText}</Text>
            {suggestion.reasoning && (
              <Text style={styles.suggestionReason}>
                {suggestion.reasoning}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderComparison = () => {
    if (!showComparison || !legacyResults) return null;

    return (
      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonTitle}>Legacy Search (Old UX)</Text>
        <Text style={styles.comparisonNote}>
          Shows {legacyResults.foods.length} of{' '}
          {legacyResults.total.toLocaleString()} results
        </Text>
        <ScrollView style={styles.legacyResults} nestedScrollEnabled>
          {legacyResults.foods
            .slice(0, 10)
            .map((item: any) => renderFoodItem(item))}
          <Text style={styles.legacyNote}>
            😵 User sees overwhelming list of{' '}
            {legacyResults.total.toLocaleString()} results with confusing items
            mixed in
          </Text>
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Improved Food Search UX Demo</Text>
      <Text style={styles.subtitle}>
        Progressive disclosure with smart categorization
      </Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for food (try 'chicken')"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Comparison Toggle */}
      <TouchableOpacity
        style={styles.comparisonToggle}
        onPress={() => setShowComparison(!showComparison)}
      >
        <Text style={styles.comparisonToggleText}>
          {showComparison ? '📊 Hide' : '📊 Show'} Legacy Comparison
        </Text>
      </TouchableOpacity>

      {/* Search Results */}
      {searchResult && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>✨ New Search Experience</Text>
            <Text style={styles.resultsStats}>
              Found {searchResult.meta.totalResults.toLocaleString()} results in{' '}
              {searchResult.meta.processingTime}ms
            </Text>
          </View>

          {/* Categorized Groups */}
          {searchResult.groups.map(renderSearchGroup)}

          {/* Show More */}
          {searchResult.totalRemaining > 0 && (
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>
                📋 Show {searchResult.totalRemaining} more results
              </Text>
            </TouchableOpacity>
          )}

          {/* Search Suggestions */}
          {renderSuggestions()}

          {/* UX Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>🎯 UX Improvements</Text>
            <Text style={styles.benefit}>
              ✅ Shows only ~9 relevant items initially
            </Text>
            <Text style={styles.benefit}>
              ✅ Common foods prioritized over branded products
            </Text>
            <Text style={styles.benefit}>
              ✅ Cooking ingredients separated for easy discovery
            </Text>
            <Text style={styles.benefit}>
              ✅ Smart search suggestions provided
            </Text>
            <Text style={styles.benefit}>
              ✅ Progressive disclosure reduces cognitive load
            </Text>
          </View>
        </View>
      )}

      {/* Legacy Comparison */}
      {renderComparison()}

      {/* Demo Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>🎮 Try These Searches</Text>
        <Text style={styles.instruction}>
          • "chicken" - See categorization in action
        </Text>
        <Text style={styles.instruction}>
          • "beef" - Compare common vs branded results
        </Text>
        <Text style={styles.instruction}>
          • "milk" - Notice smart suggestions
        </Text>
        <Text style={styles.instruction}>
          • "rice" - Observe ranking improvements
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  comparisonToggle: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    marginBottom: 16,
  },
  comparisonToggleText: {
    fontSize: 14,
    color: '#666',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultsStats: {
    fontSize: 14,
    color: '#666',
  },
  searchGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupItems: {
    gap: 8,
  },
  groupNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  foodItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  foodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  dataType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  score: {
    fontSize: 12,
    color: '#888',
  },
  showMoreButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  showMoreText: {
    fontSize: 16,
    color: '#666',
  },
  suggestionsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestionButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  suggestionText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  suggestionReason: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  benefitsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  benefit: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
  comparisonContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8,
  },
  comparisonNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  legacyResults: {
    maxHeight: 300,
  },
  legacyNote: {
    fontSize: 14,
    color: '#D32F2F',
    fontStyle: 'italic',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFCDD2',
    borderRadius: 6,
  },
  instructionsContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
});
