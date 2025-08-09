import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  calories: number;
  image?: string;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  foods?: Array<{ name: string; calories: number }>;
  mealGroupId?: string;
  title?: string; // AI-generated meal title
}

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onPress }) => {
  const { type, time, calories, image, macros, foods } = meal;

  const totalMacros = macros.carbs + macros.protein + macros.fat;
  const carbsPercentage = totalMacros > 0 ? Math.round((macros.carbs / totalMacros) * 100) : 0;
  const proteinPercentage = totalMacros > 0 ? Math.round((macros.protein / totalMacros) * 100) : 0;
  const fatPercentage = totalMacros > 0 ? Math.round((macros.fat / totalMacros) * 100) : 0;

  const Container = onPress ? TouchableOpacity : View;

  // Format meal type for display
  const formatMealType = (mealType: string) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  // Get foods display text (show first 2 foods if available)
  const getFoodsDisplay = () => {
    if (!foods || foods.length === 0) return null;
    
    if (foods.length === 1) {
      return foods[0].name;
    } else if (foods.length === 2) {
      return `${foods[0].name}, ${foods[1].name}`;
    } else {
      return `${foods[0].name}, ${foods[1].name} + ${foods.length - 2} more`;
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'timing',
        duration: 300,
      }}
    >
      <Container
        className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm"
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-lg overflow-hidden mr-3 bg-gray-100">
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-gray-50">
                <Text className="text-2xl">🍽️</Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1 mr-3">
                <Text className="font-medium text-gray-900">{meal.title || formatMealType(type)}</Text>
                <Text className="text-xs text-gray-500">{time}</Text>
                {foods && foods.length > 0 && (
                  <Text className="text-xs text-gray-600 mt-1 leading-4" numberOfLines={2}>
                    {getFoodsDisplay()}
                  </Text>
                )}
              </View>
              <Text className="font-medium text-gray-900">{calories} cal</Text>
            </View>

            {/* Macro Bar */}
            {totalMacros > 0 && (
              <View className="h-2 flex-row rounded-full overflow-hidden bg-gray-100 mt-2">
                <View
                  className="bg-[#FFC078]"
                  style={{ width: `${carbsPercentage}%` }}
                />
                <View
                  className="bg-[#74C0FC]"
                  style={{ width: `${proteinPercentage}%` }}
                />
                <View
                  className="bg-[#8CE99A]"
                  style={{ width: `${fatPercentage}%` }}
                />
              </View>
            )}

            <View className="flex-row mt-1">
              <Text className="text-xs text-gray-500 mr-2">
                C: {macros.carbs}g
              </Text>
              <Text className="text-xs text-gray-500 mr-2">
                P: {macros.protein}g
              </Text>
              <Text className="text-xs text-gray-500">F: {macros.fat}g</Text>
            </View>
          </View>
        </View>
      </Container>
    </MotiView>
  );
};
