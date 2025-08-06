import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Search, Filter, Plus, Heart, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { hapticFeedback } from '../utils/haptics';
import tokens from '../utils/tokens';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  isFavorite?: boolean;
  isVerified?: boolean;
}

type RouteParams = {
  SearchResults: {
    query?: string;
    mealType?: string;
  };
};

export default function SearchResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'SearchResults'>>();
  const { query: initialQuery = '', mealType } = route.params || {};

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'branded' | 'generic' | 'favorites'
  >('all');
  const [results, setResults] = useState<FoodItem[]>([]);

  // Mock search results
  const mockResults: FoodItem[] = [
    {
      id: '1',
      name: 'Chicken Breast, Grilled',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      serving: '100g',
      isVerified: true,
    },
    {
      id: '2',
      name: 'Chicken Sandwich',
      brand: 'Chick-fil-A',
      calories: 440,
      protein: 28,
      carbs: 40,
      fat: 19,
      serving: '1 sandwich',
    },
    {
      id: '3',
      name: 'Chicken Salad',
      calories: 217,
      protein: 19,
      carbs: 9,
      fat: 12,
      serving: '1 cup',
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Rotisserie Chicken',
      brand: 'Costco',
      calories: 140,
      protein: 19,
      carbs: 0,
      fat: 7,
      serving: '3 oz',
      isVerified: true,
    },
    {
      id: '5',
      name: 'Chicken Nuggets',
      brand: "McDonald's",
      calories: 280,
      protein: 13,
      carbs: 18,
      fat: 17,
      serving: '6 pieces',
    },
    {
      id: '6',
      name: 'Chicken Thigh, Skinless',
      calories: 109,
      protein: 13.5,
      carbs: 0,
      fat: 5.7,
      serving: '100g',
      isVerified: true,
    },
  ];

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery]);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const performSearch = () => {
    setIsSearching(true);
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Simulate API call
    searchTimeoutRef.current = setTimeout(() => {
      const filtered = mockResults.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectFood = (food: FoodItem) => {
    hapticFeedback.selection();
    navigation.navigate(
      'FoodDetails' as never,
      {
        food,
        mealType,
      } as never
    );
  };

  const handleToggleFavorite = (id: string) => {
    hapticFeedback.selection();
    setResults(
      results.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleCreateFood = () => {
    hapticFeedback.selection();
    navigation.navigate(
      'CreateFood' as never,
      {
        searchQuery,
      } as never
    );
  };

  const filteredResults = results.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'branded') return !!item.brand;
    if (activeFilter === 'generic') return !item.brand;
    if (activeFilter === 'favorites') return item.isFavorite;
    return true;
  });

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      onPress={() => handleSelectFood(item)}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <Text className="text-base font-semibold flex-1">{item.name}</Text>
            {item.isVerified && (
              <View className="bg-blue-100 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-xs text-blue-600 font-medium">
                  Verified
                </Text>
              </View>
            )}
          </View>
          {item.brand && (
            <Text className="text-sm text-gray-500 mb-1">{item.brand}</Text>
          )}
          <Text className="text-sm text-gray-600">{item.serving}</Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-semibold mb-1">
            {item.calories} cal
          </Text>
          <View className="flex-row items-center">
            <View className="mr-3">
              <Text className="text-xs text-gray-500">P: {item.protein}g</Text>
              <Text className="text-xs text-gray-500">C: {item.carbs}g</Text>
              <Text className="text-xs text-gray-500">F: {item.fat}g</Text>
            </View>
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                handleToggleFavorite(item.id);
              }}
            >
              <Heart
                size={20}
                color={item.isFavorite ? tokens.colors.error : '#E5E7EB'}
                fill={item.isFavorite ? tokens.colors.error : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2">
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
          className="p-2"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-2">Search Results</Text>
      </View>

      {/* Search bar */}
      <View className="px-4 mb-4">
        <View className="relative">
          <View className="absolute left-3 top-3.5 z-10">
            <Search size={16} color="#9CA3AF" />
          </View>
          <TextInput
            className="w-full pl-10 pr-10 py-3 bg-white rounded-xl text-base shadow-sm"
            placeholder="Search foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={performSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setResults([]);
              }}
              className="absolute right-3 top-3.5"
            >
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 mb-4"
      >
        <View className="flex-row space-x-2">
          {(['all', 'branded', 'generic', 'favorites'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                hapticFeedback.selection();
                setActiveFilter(filter);
              }}
              className={`px-4 py-2 rounded-full ${
                activeFilter === filter ? 'bg-primary' : 'bg-white'
              }`}
            >
              <Text
                className={`text-sm font-medium capitalize ${
                  activeFilter === filter ? 'text-white' : 'text-gray-700'
                }`}
              >
                {filter === 'all' ? 'All Foods' : filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Results */}
      {isSearching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={tokens.colors.primary.DEFAULT}
          />
          <Text className="text-gray-500 mt-2">Searching...</Text>
        </View>
      ) : filteredResults.length === 0 ? (
        <View className="flex-1 px-4">
          <View className="items-center justify-center py-12">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Search size={24} color="#E5E7EB" />
            </View>
            <Text className="text-lg font-medium mb-2">No results found</Text>
            <Text className="text-gray-500 text-center mb-6">
              {searchQuery
                ? `No foods match "${searchQuery}"`
                : 'Start typing to search for foods'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                onPress={handleCreateFood}
                className="flex-row items-center bg-primary rounded-xl px-4 py-3"
              >
                <Plus size={16} color="#FFF" />
                <Text className="text-white font-medium ml-1">
                  Create Custom Food
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            searchQuery ? (
              <TouchableOpacity
                onPress={handleCreateFood}
                className="bg-primary/10 rounded-2xl p-4 mb-4 flex-row items-center justify-center"
              >
                <Plus size={20} color={tokens.colors.primary.DEFAULT} />
                <Text className="text-primary font-medium ml-2">
                  Can't find what you're looking for? Create custom food
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
