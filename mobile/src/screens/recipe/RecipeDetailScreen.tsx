import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface RecipeDetailScreenProps {
  recipe: any;
  onBack: () => void;
  onEdit: (recipe: any) => void;
  onAddToLog: (recipe: any) => void;
}

const { width } = Dimensions.get('window');

export function RecipeDetailScreen({
  recipe,
  onBack,
  onEdit,
  onAddToLog,
}: RecipeDetailScreenProps) {
  const [isFavorite, setIsFavorite] = useState(true);
  const [showIngredients, setShowIngredients] = useState(true);
  const [servingSize, setServingSize] = useState(recipe.servings);

  const toggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFavorite(!isFavorite);
  };

  const handleAddToLog = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAddToLog(recipe);
  };

  const handleEdit = () => {
    Haptics.selectionAsync();
    onEdit(recipe);
  };

  const adjustServingSize = (delta: number) => {
    const newSize = servingSize + delta;
    if (newSize >= 1) {
      Haptics.selectionAsync();
      setServingSize(newSize);
    }
  };

  // Calculate nutrition based on serving size
  const calculateNutrition = (value: number) => {
    const ratio = servingSize / recipe.servings;
    return Math.round(value * ratio);
  };

  return (
    <PageTransition>
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header with Image */}
        <View className="relative h-64 w-full">
          <MotiView
            from={{ opacity: 0.8, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 500 }}
          >
            <Image
              source={{ uri: recipe.image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </MotiView>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 120,
            }}
          />

          <SafeAreaView className="absolute inset-0">
            <View className="flex-row justify-between items-start px-4 pt-6">
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 100 }}
              >
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    onBack();
                  }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <BlurView
                    intensity={80}
                    style={{ position: 'absolute', inset: 0, borderRadius: 20 }}
                  />
                  <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
              </MotiView>

              <View className="flex-row space-x-2">
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 200 }}
                >
                  <TouchableOpacity
                    onPress={toggleFavorite}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <BlurView
                      intensity={80}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 20,
                      }}
                    />
                    <Ionicons
                      name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={isFavorite ? '#7c3aed' : 'white'}
                    />
                  </TouchableOpacity>
                </MotiView>

                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 300 }}
                >
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    <BlurView
                      intensity={80}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 20,
                      }}
                    />
                    <Ionicons name="share-outline" size={20} color="white" />
                  </TouchableOpacity>
                </MotiView>
              </View>
            </View>
          </SafeAreaView>

          <View className="absolute bottom-4 left-4 right-4">
            <MotiView
              from={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ delay: 400 }}
            >
              <Text className="text-2xl font-bold text-white mb-1">
                {recipe.name}
              </Text>
              <Text className="text-white/80 text-sm">
                {recipe.ingredients.length} ingredients
              </Text>
            </MotiView>
          </View>
        </View>

        {/* Recipe Content */}
        <ScrollView className="flex-1 px-4 py-6">
          {/* Nutrition Summary */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 500 }}
          >
            <View className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-medium text-gray-900 dark:text-white">
                  Nutrition
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => adjustServingSize(-1)}
                    disabled={servingSize <= 1}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold">
                      -
                    </Text>
                  </TouchableOpacity>
                  <Text className="mx-3 font-medium text-gray-900 dark:text-white">
                    {servingSize} {servingSize === 1 ? 'serving' : 'servings'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => adjustServingSize(1)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold">
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-500 dark:text-gray-400">
                  Calories
                </Text>
                <Text className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(recipe.calories)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                {/* Carbs */}
                <View className="flex-1 mr-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Carbs
                  </Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(recipe.carbs)}g
                  </Text>
                  <View className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{
                        width: `${(recipe.carbs / (recipe.carbs + recipe.protein + recipe.fat)) * 100}%`,
                      }}
                      transition={{ duration: 800 }}
                      className="h-full bg-orange-500"
                    />
                  </View>
                </View>

                {/* Protein */}
                <View className="flex-1 mx-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Protein
                  </Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(recipe.protein)}g
                  </Text>
                  <View className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{
                        width: `${(recipe.protein / (recipe.carbs + recipe.protein + recipe.fat)) * 100}%`,
                      }}
                      transition={{ duration: 800, delay: 100 }}
                      className="h-full bg-blue-500"
                    />
                  </View>
                </View>

                {/* Fat */}
                <View className="flex-1 ml-2">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Fat
                  </Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(recipe.fat)}g
                  </Text>
                  <View className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{
                        width: `${(recipe.fat / (recipe.carbs + recipe.protein + recipe.fat)) * 100}%`,
                      }}
                      transition={{ duration: 800, delay: 200 }}
                      className="h-full bg-green-500"
                    />
                  </View>
                </View>
              </View>
            </View>
          </MotiView>

          {/* Ingredients */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 600 }}
          >
            <View className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowIngredients(!showIngredients);
                }}
                className="flex-row justify-between items-center"
              >
                <Text className="font-medium text-gray-900 dark:text-white">
                  Ingredients
                </Text>
                <MotiView
                  animate={{ rotate: showIngredients ? '180deg' : '0deg' }}
                  transition={{ duration: 300 }}
                >
                  <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                </MotiView>
              </TouchableOpacity>

              <AnimatePresence>
                {showIngredients && (
                  <MotiView
                    from={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 300 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <View className="mt-4 space-y-2">
                      {recipe.ingredients.map(
                        (ingredient: any, index: number) => (
                          <MotiView
                            key={ingredient.id}
                            from={{ translateX: -20, opacity: 0 }}
                            animate={{ translateX: 0, opacity: 1 }}
                            transition={{ delay: index * 50 }}
                            className="flex-row items-center"
                          >
                            <View className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-500 mr-3" />
                            <Text className="text-gray-700 dark:text-gray-300">
                              {ingredient.name}
                            </Text>
                          </MotiView>
                        )
                      )}
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
          </MotiView>

          {/* Action Buttons */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 700 }}
            className="flex-row space-x-3 mb-6"
          >
            <TouchableOpacity
              onPress={handleEdit}
              className="flex-1 h-12 flex-row items-center justify-center border border-gray-300 dark:border-gray-700 rounded-lg"
            >
              <Ionicons name="create-outline" size={18} color="#6b7280" />
              <Text className="ml-2 text-gray-700 dark:text-gray-300">
                Edit
              </Text>
            </TouchableOpacity>

            <View className="flex-1">
              <Button
                onPress={handleAddToLog}
                variant="primary"
                fullWidth
                icon={<Ionicons name="add" size={18} color="white" />}
              >
                Add to Log
              </Button>
            </View>
          </MotiView>
        </ScrollView>
      </View>
    </PageTransition>
  );
}
