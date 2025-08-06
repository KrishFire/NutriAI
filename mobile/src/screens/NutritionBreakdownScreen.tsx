import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { hapticFeedback } from '../utils/haptics';
import tokens from '../utils/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NutritionItem {
  name: string;
  amount: number;
  unit: string;
  dailyValue?: number;
  trend?: 'up' | 'down' | 'stable';
  subItems?: NutritionItem[];
}

type RouteParams = {
  NutritionBreakdown: {
    food?: any;
    meal?: any;
    date?: string;
  };
};

export default function NutritionBreakdownScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'NutritionBreakdown'>>();
  const { food, meal, date } = route.params || {};

  const [expandedSections, setExpandedSections] = useState<string[]>([
    'macros',
  ]);

  // Calculate nutrition data based on what was passed
  const nutritionData = food ||
    meal || {
      calories: 542,
      protein: 28,
      carbs: 62,
      fat: 22,
      fiber: 8,
      sugar: 12,
      sodium: 820,
      cholesterol: 85,
      saturatedFat: 7,
    };

  const macronutrients = [
    {
      name: 'Protein',
      amount: nutritionData.protein || 0,
      unit: 'g',
      dailyValue: Math.round(((nutritionData.protein || 0) / 50) * 100),
      color: tokens.colors.primary.DEFAULT,
      trend: 'up' as const,
    },
    {
      name: 'Carbohydrates',
      amount: nutritionData.carbs || 0,
      unit: 'g',
      dailyValue: Math.round(((nutritionData.carbs || 0) / 300) * 100),
      color: '#F59E0B',
      trend: 'stable' as const,
    },
    {
      name: 'Fat',
      amount: nutritionData.fat || 0,
      unit: 'g',
      dailyValue: Math.round(((nutritionData.fat || 0) / 65) * 100),
      color: '#10B981',
      trend: 'down' as const,
    },
  ];

  const micronutrients: NutritionItem[] = [
    {
      name: 'Dietary Fiber',
      amount: nutritionData.fiber || 0,
      unit: 'g',
      dailyValue: Math.round(((nutritionData.fiber || 0) / 25) * 100),
    },
    {
      name: 'Total Sugars',
      amount: nutritionData.sugar || 0,
      unit: 'g',
      subItems: [
        {
          name: 'Added Sugars',
          amount: nutritionData.addedSugar || 0,
          unit: 'g',
          dailyValue: Math.round(((nutritionData.addedSugar || 0) / 50) * 100),
        },
      ],
    },
    {
      name: 'Cholesterol',
      amount: nutritionData.cholesterol || 0,
      unit: 'mg',
      dailyValue: Math.round(((nutritionData.cholesterol || 0) / 300) * 100),
    },
    {
      name: 'Sodium',
      amount: nutritionData.sodium || 0,
      unit: 'mg',
      dailyValue: Math.round(((nutritionData.sodium || 0) / 2300) * 100),
    },
    {
      name: 'Saturated Fat',
      amount: nutritionData.saturatedFat || 0,
      unit: 'g',
      dailyValue: Math.round(((nutritionData.saturatedFat || 0) / 20) * 100),
    },
  ];

  const vitaminsAndMinerals: NutritionItem[] = [
    {
      name: 'Vitamin D',
      amount: nutritionData.vitaminD || 0,
      unit: 'mcg',
      dailyValue: Math.round(((nutritionData.vitaminD || 0) / 20) * 100),
    },
    {
      name: 'Calcium',
      amount: nutritionData.calcium || 0,
      unit: 'mg',
      dailyValue: Math.round(((nutritionData.calcium || 0) / 1300) * 100),
    },
    {
      name: 'Iron',
      amount: nutritionData.iron || 0,
      unit: 'mg',
      dailyValue: Math.round(((nutritionData.iron || 0) / 18) * 100),
    },
    {
      name: 'Potassium',
      amount: nutritionData.potassium || 0,
      unit: 'mg',
      dailyValue: Math.round(((nutritionData.potassium || 0) / 2800) * 100),
    },
  ];

  const toggleSection = (section: string) => {
    hapticFeedback.selection();
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const renderNutritionItem = (item: NutritionItem, isSubItem = false) => (
    <View
      key={item.name}
      className={`${isSubItem ? 'ml-6 py-2' : 'py-3'} border-b border-gray-100`}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text
            className={`${isSubItem ? 'text-sm' : 'text-base'} ${
              isSubItem ? 'text-gray-600' : 'font-medium'
            }`}
          >
            {item.name}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text
            className={`${isSubItem ? 'text-sm' : 'text-base'} font-medium mr-1`}
          >
            {item.amount}
          </Text>
          <Text
            className={`${isSubItem ? 'text-xs' : 'text-sm'} text-gray-500`}
          >
            {item.unit}
          </Text>
          {item.dailyValue !== undefined && (
            <Text
              className={`ml-3 ${isSubItem ? 'text-xs' : 'text-sm'} ${
                item.dailyValue > 100 ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {item.dailyValue}% DV
            </Text>
          )}
        </View>
      </View>
      {item.subItems?.map(subItem => renderNutritionItem(subItem, true))}
    </View>
  );

  const renderMacroCard = (macro: (typeof macronutrients)[0]) => {
    const percentage = Math.min(macro.dailyValue, 100);

    return (
      <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-lg font-semibold">{macro.name}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-2xl font-bold mr-1">{macro.amount}</Text>
              <Text className="text-gray-500">{macro.unit}</Text>
            </View>
          </View>
          <View className="items-end">
            <View className="flex-row items-center">
              {macro.trend === 'up' && <TrendingUp size={16} color="#10B981" />}
              {macro.trend === 'down' && (
                <TrendingDown size={16} color="#EF4444" />
              )}
              {macro.trend === 'stable' && <Minus size={16} color="#6B7280" />}
              <Text
                className={`ml-1 text-sm ${
                  macro.trend === 'up'
                    ? 'text-green-500'
                    : macro.trend === 'down'
                      ? 'text-red-500'
                      : 'text-gray-500'
                }`}
              >
                {macro.trend === 'up'
                  ? '+12%'
                  : macro.trend === 'down'
                    ? '-8%'
                    : '0%'}
              </Text>
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              {macro.dailyValue}% DV
            </Text>
          </View>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: macro.color,
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
          className="p-2"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Nutrition Breakdown</Text>
        <TouchableOpacity className="p-2">
          <Info size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="px-4 pt-2 pb-4">
          <Text className="text-2xl font-bold">
            {food?.name || meal?.type || 'Daily Nutrition'}
          </Text>
          {date && (
            <Text className="text-gray-500 mt-1">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          )}
        </View>

        {/* Calories Summary */}
        <View className="mx-4 bg-primary rounded-2xl p-4 mb-6">
          <Text className="text-white/80 text-sm mb-1">Total Calories</Text>
          <Text className="text-white text-3xl font-bold">
            {nutritionData.calories || 0}
          </Text>
          <View className="flex-row mt-3 space-x-4">
            <View>
              <Text className="text-white/60 text-xs">From Protein</Text>
              <Text className="text-white font-medium">
                {(nutritionData.protein || 0) * 4} cal
              </Text>
            </View>
            <View>
              <Text className="text-white/60 text-xs">From Carbs</Text>
              <Text className="text-white font-medium">
                {(nutritionData.carbs || 0) * 4} cal
              </Text>
            </View>
            <View>
              <Text className="text-white/60 text-xs">From Fat</Text>
              <Text className="text-white font-medium">
                {(nutritionData.fat || 0) * 9} cal
              </Text>
            </View>
          </View>
        </View>

        {/* Macronutrients */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            onPress={() => toggleSection('macros')}
            className="flex-row justify-between items-center mb-3"
          >
            <Text className="text-lg font-semibold">Macronutrients</Text>
            <Text className="text-sm text-gray-500">
              {expandedSections.includes('macros') ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>

          {expandedSections.includes('macros') && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              {macronutrients.map(renderMacroCard)}
            </Animated.View>
          )}
        </View>

        {/* Micronutrients */}
        <View className="px-4 mb-6">
          <TouchableOpacity
            onPress={() => toggleSection('micro')}
            className="flex-row justify-between items-center mb-3"
          >
            <Text className="text-lg font-semibold">Other Nutrients</Text>
            <Text className="text-sm text-gray-500">
              {expandedSections.includes('micro') ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>

          {expandedSections.includes('micro') && (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              className="bg-white rounded-2xl shadow-sm"
            >
              {micronutrients.map(item => renderNutritionItem(item))}
            </Animated.View>
          )}
        </View>

        {/* Vitamins & Minerals */}
        <View className="px-4 mb-20">
          <TouchableOpacity
            onPress={() => toggleSection('vitamins')}
            className="flex-row justify-between items-center mb-3"
          >
            <Text className="text-lg font-semibold">Vitamins & Minerals</Text>
            <Text className="text-sm text-gray-500">
              {expandedSections.includes('vitamins') ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>

          {expandedSections.includes('vitamins') && (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              className="bg-white rounded-2xl shadow-sm"
            >
              {vitaminsAndMinerals.map(item => renderNutritionItem(item))}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
