import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { StandardHeaderWithBack } from '@/components/common';
import * as Haptics from 'expo-haptics';

interface RecipeListScreenProps {
  onBack: () => void;
  onCreateRecipe: () => void;
  onSelectRecipe: (recipe: any) => void;
}

export function RecipeListScreen({
  onBack,
  onCreateRecipe,
  onSelectRecipe,
}: RecipeListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock recipes data
  const mockRecipes = [
    {
      id: 1,
      name: 'Homemade Granola',
      image:
        'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      servings: 8,
      ingredients: [
        { id: 1, name: 'Rolled oats' },
        { id: 2, name: 'Honey' },
        { id: 3, name: 'Almonds' },
        { id: 4, name: 'Coconut flakes' },
      ],
      calories: 320,
      protein: 8,
      carbs: 45,
      fat: 12,
      category: 'breakfast',
    },
    {
      id: 2,
      name: 'Greek Salad',
      image:
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      servings: 2,
      ingredients: [
        { id: 1, name: 'Cucumber' },
        { id: 2, name: 'Tomatoes' },
        { id: 3, name: 'Feta cheese' },
        { id: 4, name: 'Olives' },
        { id: 5, name: 'Olive oil' },
      ],
      calories: 250,
      protein: 8,
      carbs: 12,
      fat: 20,
      category: 'lunch',
    },
    {
      id: 3,
      name: 'Chicken Stir Fry',
      image:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      servings: 4,
      ingredients: [
        { id: 1, name: 'Chicken breast' },
        { id: 2, name: 'Bell peppers' },
        { id: 3, name: 'Broccoli' },
        { id: 4, name: 'Soy sauce' },
        { id: 5, name: 'Garlic' },
      ],
      calories: 380,
      protein: 35,
      carbs: 20,
      fat: 15,
      category: 'dinner',
    },
    {
      id: 4,
      name: 'Protein Smoothie',
      image:
        'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      servings: 1,
      ingredients: [
        { id: 1, name: 'Protein powder' },
        { id: 2, name: 'Banana' },
        { id: 3, name: 'Almond milk' },
        { id: 4, name: 'Peanut butter' },
      ],
      calories: 280,
      protein: 25,
      carbs: 30,
      fat: 8,
      category: 'snack',
    },
  ];

  useEffect(() => {
    // Simulate loading recipes
    setIsLoading(true);
    setTimeout(() => {
      setRecipes(mockRecipes);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' || recipe.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFilterChange = (filter: string) => {
    Haptics.selectionAsync();
    setSelectedFilter(filter);
    setFilterOpen(false);
  };

  const handleSelectRecipe = (recipe: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectRecipe(recipe);
  };

  const handleClearSearch = () => {
    Haptics.selectionAsync();
    setSearchQuery('');
  };

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1">
          {/* Header */}
          <View className="px-4 pt-6 pb-6 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  onBack();
                }}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4"
              >
                <Ionicons name="arrow-back" size={20} color="#6b7280" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                My Recipes
              </Text>
            </View>
            <MotiView
              from={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onCreateRecipe();
                }}
                className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-500 items-center justify-center"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </MotiView>
          </View>

          {/* Search Bar */}
          <View className="px-4 mb-4">
            <View className="relative">
              <View className="absolute inset-y-0 left-0 pl-3 flex-row items-center pointer-events-none z-10">
                <Ionicons name="search" size={18} color="#9ca3af" />
              </View>
              <TextInput
                className="block w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white"
                placeholder="Search recipes..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <View className="absolute inset-y-0 right-0 pr-3 flex-row items-center">
                  <MotiView
                    from={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'timing', duration: 200 }}
                  >
                    <TouchableOpacity onPress={handleClearSearch}>
                      <Ionicons name="close-circle" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  </MotiView>
                </View>
              )}
            </View>
          </View>

          {/* Filter Section */}
          <View className="px-4 mb-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {isLoading
                  ? 'Loading recipes...'
                  : filteredRecipes.length > 0
                    ? `${filteredRecipes.length} recipes`
                    : 'No recipes found'}
              </Text>
              <MotiView
                animate={{
                  scale: filterOpen ? 1.05 : 1,
                }}
                transition={{ type: 'timing', duration: 150 }}
              >
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFilterOpen(!filterOpen);
                  }}
                  className={`flex-row items-center px-3 py-1.5 rounded-full ${
                    filterOpen || selectedFilter !== 'all'
                      ? 'bg-primary-600 dark:bg-primary-500'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Ionicons
                    name="filter"
                    size={16}
                    color={
                      filterOpen || selectedFilter !== 'all'
                        ? 'white'
                        : '#6b7280'
                    }
                  />
                  <Text
                    className={`ml-1 text-sm font-medium ${
                      filterOpen || selectedFilter !== 'all'
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Filter
                  </Text>
                </TouchableOpacity>
              </MotiView>
            </View>

            {/* Filter Options */}
            <AnimatePresence>
              {filterOpen && (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -10 }}
                  transition={{ duration: 200 }}
                  className="mt-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm"
                >
                  <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Filter by meal:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(
                      filter => (
                        <MotiView
                          key={filter}
                          animate={{
                            scale: selectedFilter === filter ? 1.05 : 1,
                          }}
                          transition={{ type: 'timing', duration: 150 }}
                        >
                          <TouchableOpacity
                            onPress={() => handleFilterChange(filter)}
                            className={`px-3 py-1.5 rounded-full ${
                              selectedFilter === filter
                                ? 'bg-primary-600 dark:bg-primary-500'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                selectedFilter === filter
                                  ? 'text-white'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        </MotiView>
                      )
                    )}
                  </View>
                </MotiView>
              )}
            </AnimatePresence>
          </View>

          {/* Recipe List */}
          <ScrollView className="flex-1 px-4">
            {isLoading ? (
              // Loading skeletons
              <View className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <MotiView
                    key={i}
                    from={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      loop: true,
                      repeatReverse: true,
                      duration: 1000,
                    }}
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl h-24"
                  />
                ))}
              </View>
            ) : filteredRecipes.length > 0 ? (
              <View className="space-y-4 pb-6">
                <AnimatePresence>
                  {filteredRecipes.map((recipe, index) => (
                    <MotiView
                      key={recipe.id}
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -20 }}
                      transition={{ duration: 300, delay: index * 50 }}
                    >
                      <TouchableOpacity
                        onPress={() => handleSelectRecipe(recipe)}
                        activeOpacity={0.8}
                        className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
                      >
                        <MotiView
                          animate={{
                            scale: 1,
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <View className="flex-row h-24">
                            <View className="w-24 h-full bg-gray-100 dark:bg-gray-700">
                              {recipe.image && (
                                <Image
                                  source={{ uri: recipe.image }}
                                  style={{ width: '100%', height: '100%' }}
                                  resizeMode="cover"
                                />
                              )}
                            </View>
                            <View className="flex-1 p-3 justify-between">
                              <View>
                                <View className="flex-row justify-between items-start">
                                  <Text className="font-medium text-gray-900 dark:text-white">
                                    {recipe.name}
                                  </Text>
                                  <Ionicons
                                    name="bookmark"
                                    size={16}
                                    color="#7c3aed"
                                  />
                                </View>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                  {recipe.ingredients.length} ingredients •{' '}
                                  {recipe.servings} servings
                                </Text>
                              </View>
                              <View className="flex-row space-x-2">
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                  {recipe.calories} cal
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                  P: {recipe.protein}g
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                  C: {recipe.carbs}g
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                  F: {recipe.fat}g
                                </Text>
                              </View>
                            </View>
                          </View>
                        </MotiView>
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                </AnimatePresence>
              </View>
            ) : (
              <View className="py-10 items-center justify-center">
                <MotiView
                  from={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <View className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-4">
                    <Ionicons name="book-outline" size={24} color="#9ca3af" />
                  </View>
                </MotiView>
                <Text className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                  No recipes found
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create your first recipe to get started'}
                </Text>
                <MotiView
                  from={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <Button
                    onPress={onCreateRecipe}
                    variant="primary"
                    size="small"
                  >
                    Create Recipe
                  </Button>
                </MotiView>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
}
