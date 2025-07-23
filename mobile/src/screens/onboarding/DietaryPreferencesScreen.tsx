import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptics';
import tokens from '../../../tokens.json';

interface DietaryOption {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

const dietaryOptions: DietaryOption[] = [
  { id: 'none', label: 'No restrictions', emoji: '🍽️', description: 'I eat everything' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗', description: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱', description: 'No animal products' },
  { id: 'keto', label: 'Keto', emoji: '🥑', description: 'Low carb, high fat' },
  { id: 'paleo', label: 'Paleo', emoji: '🥩', description: 'Whole foods only' },
  { id: 'gluten-free', label: 'Gluten-free', emoji: '🌾', description: 'No gluten' },
  { id: 'dairy-free', label: 'Dairy-free', emoji: '🥛', description: 'No dairy products' },
  { id: 'halal', label: 'Halal', emoji: '🕌', description: 'Halal certified' },
  { id: 'kosher', label: 'Kosher', emoji: '✡️', description: 'Kosher certified' },
];

const allergyOptions: DietaryOption[] = [
  { id: 'nuts', label: 'Tree nuts', emoji: '🥜' },
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚' },
  { id: 'soy', label: 'Soy', emoji: '🌱' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
];

export default function DietaryPreferencesScreen() {
  const navigation = useNavigation();
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const handleDietToggle = (dietId: string) => {
    hapticFeedback.selection();
    if (dietId === 'none' && !selectedDiets.includes('none')) {
      // If "No restrictions" is selected, clear all other selections
      setSelectedDiets(['none']);
    } else if (dietId === 'none') {
      // If deselecting "No restrictions"
      setSelectedDiets([]);
    } else {
      // For other options, remove "none" if it's selected
      const newDiets = selectedDiets.filter(id => id !== 'none');
      if (newDiets.includes(dietId)) {
        setSelectedDiets(newDiets.filter(id => id !== dietId));
      } else {
        setSelectedDiets([...newDiets, dietId]);
      }
    }
  };

  const handleAllergyToggle = (allergyId: string) => {
    hapticFeedback.selection();
    if (selectedAllergies.includes(allergyId)) {
      setSelectedAllergies(selectedAllergies.filter(id => id !== allergyId));
    } else {
      setSelectedAllergies([...selectedAllergies, allergyId]);
    }
  };

  const handleContinue = () => {
    hapticFeedback.success();
    navigation.navigate('NotificationSetup' as never);
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    navigation.navigate('NotificationSetup' as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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
        <TouchableOpacity onPress={handleSkip} className="p-2">
          <Text className="text-gray-500">Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Progress indicator */}
        <View className="flex-row space-x-2 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= 3 ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        <Animated.View entering={FadeIn}>
          <Text className="text-3xl font-bold mb-2">Dietary preferences</Text>
          <Text className="text-gray-600 mb-8">
            Select any that apply to help us suggest better meals
          </Text>

          {/* Dietary restrictions */}
          <Text className="text-lg font-semibold mb-4">Diet type</Text>
          <View className="mb-8">
            {dietaryOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeIn.delay(index * 50)}
              >
                <TouchableOpacity
                  onPress={() => handleDietToggle(option.id)}
                  className={`flex-row items-center p-4 mb-3 rounded-2xl border-2 ${
                    selectedDiets.includes(option.id)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-gray-50 border-gray-50'
                  }`}
                >
                  <Text className="text-2xl mr-3">{option.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-medium">{option.label}</Text>
                    {option.description && (
                      <Text className="text-sm text-gray-500">{option.description}</Text>
                    )}
                  </View>
                  {selectedDiets.includes(option.id) && (
                    <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                      <Check size={16} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Allergies */}
          <Text className="text-lg font-semibold mb-4">Allergies & intolerances</Text>
          <View className="flex-row flex-wrap mb-8">
            {allergyOptions.map((option, index) => (
              <Animated.View
                key={option.id}
                entering={FadeIn.delay(index * 50)}
                className="w-1/2 pr-2 pb-3"
              >
                <TouchableOpacity
                  onPress={() => handleAllergyToggle(option.id)}
                  className={`flex-row items-center p-3 rounded-xl border-2 ${
                    selectedAllergies.includes(option.id)
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-50'
                  }`}
                >
                  <Text className="mr-2">{option.emoji}</Text>
                  <Text className="flex-1 text-sm">{option.label}</Text>
                  {selectedAllergies.includes(option.id) && (
                    <Check size={16} color={tokens.colors.danger} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Continue button */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary rounded-2xl py-4 px-6"
        >
          <Text className="text-white text-center font-semibold text-lg">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}