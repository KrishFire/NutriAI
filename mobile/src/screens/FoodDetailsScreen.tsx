import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Plus,
  Minus,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { hapticFeedback } from '../utils/haptics';
import tokens from '../../tokens.json';

type RouteParams = {
  FoodDetails: {
    food: any;
    mealType?: string;
  };
};

const portionOptions = [
  { id: 'serving', name: 'Serving', multiplier: 1 },
  { id: 'cup', name: 'Cup', multiplier: 1.5 },
  { id: 'oz', name: 'Ounce', multiplier: 0.25 },
  { id: 'gram', name: 'Gram', multiplier: 0.01 },
];

export default function FoodDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'FoodDetails'>>();
  const { food, mealType = 'Snack' } = route.params || {};

  const [isFavorite, setIsFavorite] = useState(food?.isFavorite || false);
  const [selectedMealType, setSelectedMealType] = useState(mealType);
  const [selectedPortion, setSelectedPortion] = useState('serving');
  const [quantity, setQuantity] = useState(1);

  const scale = useSharedValue(1);

  const nutritionItems = [
    {
      name: 'Total Fat',
      amount: food?.fat || 0,
      unit: 'g',
      dailyValue: Math.round(((food?.fat || 0) / 65) * 100),
      subItems: [
        {
          name: 'Saturated Fat',
          amount: food?.saturatedFat || 0,
          unit: 'g',
          dailyValue: Math.round(((food?.saturatedFat || 0) / 20) * 100),
        },
      ],
    },
    {
      name: 'Cholesterol',
      amount: food?.cholesterol || 0,
      unit: 'mg',
      dailyValue: Math.round(((food?.cholesterol || 0) / 300) * 100),
    },
    {
      name: 'Sodium',
      amount: food?.sodium || 0,
      unit: 'mg',
      dailyValue: Math.round(((food?.sodium || 0) / 2300) * 100),
    },
    {
      name: 'Total Carbohydrate',
      amount: food?.carbs || 0,
      unit: 'g',
      dailyValue: Math.round(((food?.carbs || 0) / 300) * 100),
      subItems: [
        {
          name: 'Dietary Fiber',
          amount: food?.fiber || 0,
          unit: 'g',
          dailyValue: Math.round(((food?.fiber || 0) / 25) * 100),
        },
        {
          name: 'Total Sugars',
          amount: food?.sugar || 0,
          unit: 'g',
        },
      ],
    },
    {
      name: 'Protein',
      amount: food?.protein || 0,
      unit: 'g',
    },
  ];

  const handleToggleFavorite = () => {
    hapticFeedback.impact();
    setIsFavorite(!isFavorite);
    scale.value = withSpring(0.8, {}, () => {
      scale.value = withSpring(1);
    });
  };

  const handleAddToLog = () => {
    hapticFeedback.success();
    navigation.navigate('MealSaved' as never, {
      meal: {
        ...food,
        type: selectedMealType,
        quantity,
        portion: selectedPortion,
        calories: Math.round(
          food.calories * quantity * (portionOptions.find(o => o.id === selectedPortion)?.multiplier || 1)
        ),
      },
    } as never);
  };

  const handleQuantityChange = (delta: number) => {
    hapticFeedback.selection();
    const newQuantity = Math.max(0.25, quantity + delta);
    setQuantity(newQuantity);
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-white">
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
          className="p-2"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Food Details</Text>
        <TouchableOpacity onPress={handleToggleFavorite} className="p-2">
          <Animated.View style={animatedHeartStyle}>
            <Heart
              size={24}
              color={isFavorite ? tokens.colors.danger : '#9CA3AF'}
              fill={isFavorite ? tokens.colors.danger : 'transparent'}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Food info card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
          <View className="flex-row">
            {food?.image ? (
              <Image
                source={{ uri: food.image }}
                className="w-20 h-20 rounded-xl mr-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center mr-4">
                <Text className="text-2xl">🍽️</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-bold">{food?.name || 'Food Item'}</Text>
              {food?.brand && <Text className="text-gray-500">{food.brand}</Text>}
              <View className="flex-row justify-between items-end mt-2">
                <Text className="text-2xl font-bold">{food?.calories || 0} cal</Text>
                <View className="flex-row space-x-3">
                  <Text className="text-sm text-gray-500">P: {food?.protein || 0}g</Text>
                  <Text className="text-sm text-gray-500">C: {food?.carbs || 0}g</Text>
                  <Text className="text-sm text-gray-500">F: {food?.fat || 0}g</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Meal type selector */}
        <View className="px-4 mt-6">
          <Text className="text-base font-semibold mb-3">Add to meal</Text>
          <View className="flex-row space-x-2">
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedMealType(type);
                }}
                className={`flex-1 py-3 rounded-xl ${
                  selectedMealType === type ? 'bg-primary' : 'bg-white'
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    selectedMealType === type ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Portion size selector */}
        <View className="px-4 mt-6">
          <Text className="text-base font-semibold mb-3">Portion size</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row mb-4">
              {portionOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    hapticFeedback.selection();
                    setSelectedPortion(option.id);
                  }}
                  className={`flex-1 py-2 rounded-lg ${
                    selectedPortion === option.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      selectedPortion === option.id ? 'text-primary' : 'text-gray-700'
                    }`}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600">Quantity</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => handleQuantityChange(-0.25)}
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Minus size={16} color="#374151" />
                </TouchableOpacity>
                <Text className="mx-4 text-xl font-semibold">{quantity}</Text>
                <TouchableOpacity
                  onPress={() => handleQuantityChange(0.25)}
                  className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Plus size={16} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100">
              <Text className="text-center text-2xl font-bold">
                {Math.round(
                  food?.calories * quantity * (portionOptions.find(o => o.id === selectedPortion)?.multiplier || 1)
                )}{' '}
                calories
              </Text>
            </View>
          </View>
        </View>

        {/* Nutrition facts */}
        <View className="px-4 mt-6 mb-20">
          <Text className="text-base font-semibold mb-3">Nutrition Facts</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="border-b-8 border-black pb-2 mb-2">
              <Text className="text-2xl font-black">Nutrition Facts</Text>
              <Text className="text-sm">
                Serving Size: {quantity} {selectedPortion}
              </Text>
            </View>
            
            <View className="border-b-4 border-black pb-1 mb-1">
              <Text className="text-sm font-bold">Amount Per Serving</Text>
              <View className="flex-row justify-between">
                <Text className="text-2xl font-black">Calories</Text>
                <Text className="text-2xl font-black">
                  {Math.round(
                    food?.calories * quantity * (portionOptions.find(o => o.id === selectedPortion)?.multiplier || 1)
                  )}
                </Text>
              </View>
            </View>

            <View className="border-b border-black pb-1 mb-1">
              <Text className="text-xs text-right font-bold">% Daily Value*</Text>
            </View>

            {nutritionItems.map((item, index) => (
              <View key={index}>
                <View className="flex-row justify-between py-1 border-b border-gray-300">
                  <Text className="font-semibold">
                    {item.name} {item.amount}{item.unit}
                  </Text>
                  {item.dailyValue !== undefined && (
                    <Text className="font-semibold">{item.dailyValue}%</Text>
                  )}
                </View>
                {item.subItems?.map((subItem, subIndex) => (
                  <View
                    key={subIndex}
                    className="flex-row justify-between py-1 pl-4 border-b border-gray-300"
                  >
                    <Text>
                      {subItem.name} {subItem.amount}{subItem.unit}
                    </Text>
                    {subItem.dailyValue !== undefined && (
                      <Text className="font-semibold">{subItem.dailyValue}%</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}

            <Text className="text-xs text-gray-600 mt-2">
              * Percent Daily Values are based on a 2,000 calorie diet.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <TouchableOpacity
          onPress={handleAddToLog}
          className="bg-primary rounded-2xl py-4 px-6"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Add to Food Log
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}