import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingDown, TrendingUp, Target, Check } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from './OnboardingFlow';

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const goalOptions: GoalOption[] = [
  {
    id: 'lose',
    title: 'Lose Weight',
    description: 'Create a calorie deficit to lose fat',
    icon: TrendingDown,
    color: '#EF4444',
  },
  {
    id: 'maintain',
    title: 'Maintain Weight',
    description: 'Keep your current weight stable',
    icon: Target,
    color: '#3B82F6',
  },
  {
    id: 'gain',
    title: 'Gain Weight',
    description: 'Build muscle with a calorie surplus',
    icon: TrendingUp,
    color: '#10B981',
  },
];

const GoalSelectionScreen = () => {
  const { goToPreviousStep, goToNextStep, updateUserData, progress } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState('');

  const handleSelect = (goal: string) => {
    Haptics.selectionAsync();
    setSelectedGoal(goal);
    updateUserData('goal', goal);
  };

  const handleContinue = () => {
    if (selectedGoal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      goToNextStep();
    }
  };

  const GoalButton = ({ option, index }: { option: GoalOption; index: number }) => {
    const scale = useSharedValue(1);
    const isSelected = selectedGoal === option.id;
    const Icon = option.icon;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View 
        entering={FadeInDown.delay(200 + index * 100).springify()}
        style={animatedStyle}
      >
        <TouchableOpacity
          onPress={() => handleSelect(option.id)}
          onPressIn={() => {
            scale.value = withSpring(0.98);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          className={`w-full p-5 rounded-2xl border-2 ${
            isSelected
              ? 'border-primary dark:border-primary-light bg-primary/5 dark:bg-primary-light/10'
              : 'border-gray-200 dark:border-gray-700'
          }`}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View 
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: `${option.color}20` }}
            >
              <Icon size={24} color={option.color} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-lg font-medium mb-1 ${
                  isSelected
                    ? 'text-primary dark:text-primary-light'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {option.title}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {option.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-4">
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={goToPreviousStep}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full mb-8">
            <Animated.View
              className="h-full bg-primary dark:bg-primary-light rounded-full"
              style={{ width: `${progress}%` }}
              entering={FadeIn.duration(300)}
            />
          </View>

          {/* Title */}
          <Animated.View entering={FadeIn.duration(300)} className="mb-8">
            <Text className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
              What's your goal?
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-lg">
              We'll create a personalized plan to help you succeed
            </Text>
          </Animated.View>

          {/* Options */}
          <View className="space-y-4 mb-8">
            {goalOptions.map((option, index) => (
              <GoalButton key={option.id} option={option} index={index} />
            ))}
          </View>

          {/* Continue Button */}
          <View className="mt-auto">
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!selectedGoal}
              className={`w-full py-4 rounded-full items-center ${
                selectedGoal
                  ? 'bg-primary dark:bg-primary-light'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoalSelectionScreen;