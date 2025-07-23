import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  Camera,
  Info,
} from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { hapticFeedback } from '../utils/haptics';
import tokens from '../../tokens.json';

type RouteParams = {
  CreateFood: {
    searchQuery?: string;
  };
};

interface NutritionField {
  label: string;
  key: string;
  unit: string;
  required?: boolean;
  placeholder: string;
}

const nutritionFields: NutritionField[] = [
  { label: 'Calories', key: 'calories', unit: '', required: true, placeholder: '0' },
  { label: 'Protein', key: 'protein', unit: 'g', required: true, placeholder: '0' },
  { label: 'Carbohydrates', key: 'carbs', unit: 'g', required: true, placeholder: '0' },
  { label: 'Fat', key: 'fat', unit: 'g', required: true, placeholder: '0' },
  { label: 'Saturated Fat', key: 'saturatedFat', unit: 'g', placeholder: '0' },
  { label: 'Sugar', key: 'sugar', unit: 'g', placeholder: '0' },
  { label: 'Fiber', key: 'fiber', unit: 'g', placeholder: '0' },
  { label: 'Sodium', key: 'sodium', unit: 'mg', placeholder: '0' },
  { label: 'Cholesterol', key: 'cholesterol', unit: 'mg', placeholder: '0' },
];

export default function CreateFoodScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CreateFood'>>();
  const { searchQuery } = route.params || {};

  const [foodName, setFoodName] = useState(searchQuery || '');
  const [brand, setBrand] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [servingUnit, setServingUnit] = useState('g');
  const [nutrition, setNutrition] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleNutritionChange = (key: string, value: string) => {
    // Only allow numbers and decimals
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    setNutrition({ ...nutrition, [key]: cleanedValue });
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!foodName.trim()) {
      newErrors.foodName = 'Food name is required';
    }

    if (!servingSize.trim()) {
      newErrors.servingSize = 'Serving size is required';
    }

    // Validate required nutrition fields
    nutritionFields.forEach(field => {
      if (field.required && !nutrition[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      hapticFeedback.error();
      return;
    }

    setIsSaving(true);
    hapticFeedback.success();

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      const newFood = {
        name: foodName,
        brand,
        serving: `${servingSize} ${servingUnit}`,
        calories: Number(nutrition.calories || 0),
        protein: Number(nutrition.protein || 0),
        carbs: Number(nutrition.carbs || 0),
        fat: Number(nutrition.fat || 0),
        ...nutrition,
      };

      navigation.navigate('FoodDetails' as never, {
        food: newFood,
      } as never);
    }, 1000);
  };

  const servingUnits = ['g', 'oz', 'cup', 'tbsp', 'tsp', 'ml', 'serving', 'piece'];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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
          <Text className="text-xl font-bold">Create Food</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn} className="px-4 py-4">
            {/* Food photo */}
            <TouchableOpacity className="bg-white rounded-2xl p-8 mb-6 shadow-sm items-center">
              <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-3">
                <Camera size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500">Add photo (optional)</Text>
            </TouchableOpacity>

            {/* Basic info */}
            <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
              <Text className="text-lg font-semibold mb-4">Basic Information</Text>
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Food Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className={`p-4 bg-gray-50 rounded-xl text-base ${
                    errors.foodName ? 'border-2 border-red-500' : ''
                  }`}
                  placeholder="e.g., Chicken Breast"
                  value={foodName}
                  onChangeText={(text) => {
                    setFoodName(text);
                    if (errors.foodName) {
                      setErrors({ ...errors, foodName: undefined });
                    }
                  }}
                />
                {errors.foodName && (
                  <Text className="text-red-500 text-sm mt-1">{errors.foodName}</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Brand (optional)
                </Text>
                <TextInput
                  className="p-4 bg-gray-50 rounded-xl text-base"
                  placeholder="e.g., Tyson"
                  value={brand}
                  onChangeText={setBrand}
                />
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Serving Size <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className={`p-4 bg-gray-50 rounded-xl text-base ${
                      errors.servingSize ? 'border-2 border-red-500' : ''
                    }`}
                    placeholder="100"
                    value={servingSize}
                    onChangeText={(text) => {
                      setServingSize(text.replace(/[^0-9.]/g, ''));
                      if (errors.servingSize) {
                        setErrors({ ...errors, servingSize: undefined });
                      }
                    }}
                    keyboardType="numeric"
                  />
                  {errors.servingSize && (
                    <Text className="text-red-500 text-sm mt-1">{errors.servingSize}</Text>
                  )}
                </View>
                <View className="w-32">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Unit</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="bg-gray-50 rounded-xl"
                  >
                    <View className="flex-row p-2">
                      {servingUnits.map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          onPress={() => {
                            hapticFeedback.selection();
                            setServingUnit(unit);
                          }}
                          className={`px-3 py-2 rounded-lg mr-2 ${
                            servingUnit === unit ? 'bg-primary' : 'bg-white'
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              servingUnit === unit ? 'text-white font-medium' : 'text-gray-700'
                            }`}
                          >
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Nutrition info */}
            <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold">Nutrition Information</Text>
                <TouchableOpacity>
                  <Info size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <Text className="text-sm text-gray-500 mb-4">
                Per {servingSize || '100'} {servingUnit}
              </Text>

              <View className="space-y-3">
                {nutritionFields.map((field) => (
                  <View key={field.key} className="flex-row items-center">
                    <Text className="flex-1 text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && <Text className="text-red-500"> *</Text>}
                    </Text>
                    <View className="flex-row items-center">
                      <TextInput
                        className={`w-20 p-2 bg-gray-50 rounded-lg text-right ${
                          errors[field.key] ? 'border border-red-500' : ''
                        }`}
                        placeholder={field.placeholder}
                        value={nutrition[field.key] || ''}
                        onChangeText={(text) => handleNutritionChange(field.key, text)}
                        keyboardType="numeric"
                      />
                      {field.unit && (
                        <Text className="ml-2 text-sm text-gray-500 w-8">{field.unit}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className="bg-primary rounded-2xl py-4 px-6 mb-8"
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Create Food
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}