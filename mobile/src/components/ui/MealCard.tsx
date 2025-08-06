import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';

interface Meal {
  id: number;
  type: string;
  time: string;
  calories: number;
  image: string;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  isFavorite?: boolean;
}

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onPress }) => {
  const { type, time, calories, image, macros, isFavorite } = meal;

  const totalMacros = macros.carbs + macros.protein + macros.fat;
  const carbsPercentage = Math.round((macros.carbs / totalMacros) * 100);
  const proteinPercentage = Math.round((macros.protein / totalMacros) * 100);
  const fatPercentage = Math.round((macros.fat / totalMacros) * 100);

  const Container = onPress ? TouchableOpacity : View;

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
            <Image
              source={{ uri: image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <View>
                <Text className="font-medium text-gray-900">{type}</Text>
                <Text className="text-xs text-gray-500">{time}</Text>
              </View>
              <Text className="font-medium text-gray-900">{calories} cal</Text>
            </View>

            {/* Macro Bar */}
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
