import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Apple, Zap, Target, Heart } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const GoalAccomplishmentScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData } =
    useOnboarding();

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    {
      id: 'healthier',
      label: 'Eat and live healthier',
      icon: Apple,
    },
    {
      id: 'energy',
      label: 'Boost energy and mood',
      icon: Zap,
    },
    {
      id: 'motivation',
      label: 'Stay motivated and consistent',
      icon: Target,
    },
    {
      id: 'confidence',
      label: 'Feel better about my body',
      icon: Heart,
    },
  ];

  const handleToggleGoal = (goalId: string) => {
    hapticFeedback.selection();
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      hapticFeedback.impact();
      updateUserData('accomplishmentGoals', selectedGoals);
      goToNextStep();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-4">
          {/* Header with back button */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.selection();
                goToPreviousStep();
              }}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View className="w-full h-1 bg-gray-100 rounded-full mb-8">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>

          {/* Title and subtitle */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              What would you like to accomplish?
            </Text>
            <Text className="text-gray-600 text-lg">
              Select all that apply to you
            </Text>
          </View>

          {/* Goal Options */}
          <View className="mb-8">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              const isSelected = selectedGoals.includes(goal.id);

              return (
                <MotiView
                  key={goal.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: index * 100 }}
                  className="mb-4"
                >
                  <TouchableOpacity
                    onPress={() => handleToggleGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <MotiView
                      animate={{
                        borderColor: isSelected ? '#320DFF' : '#E5E7EB',
                        backgroundColor: isSelected
                          ? 'rgba(50, 13, 255, 0.05)'
                          : '#FFFFFF',
                      }}
                      transition={{ type: 'timing', duration: 200 }}
                      className="flex-row items-center p-5 rounded-2xl border-2"
                    >
                      <MotiView
                        animate={{
                          scale: isSelected ? 1.1 : 1,
                        }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="mr-4"
                      >
                        <Icon
                          size={24}
                          color={isSelected ? '#320DFF' : '#9CA3AF'}
                        />
                      </MotiView>
                      <Text
                        className={`text-lg font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}
                      >
                        {goal.label}
                      </Text>

                      {/* Checkmark indicator */}
                      {isSelected && (
                        <MotiView
                          from={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', damping: 15 }}
                          className="ml-auto"
                        >
                          <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                            <Text className="text-white text-xs font-bold">
                              ✓
                            </Text>
                          </View>
                        </MotiView>
                      )}
                    </MotiView>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>

          {/* Selection hint */}
          {selectedGoals.length === 0 && (
            <View className="bg-gray-50 px-4 py-3 rounded-xl mb-6">
              <Text className="text-gray-600 text-sm text-center">
                Select at least one goal to continue
              </Text>
            </View>
          )}

          {/* Spacer to push button to bottom */}
          <View className="flex-1" />

          {/* Continue Button */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleContinue}
              className={`py-4 rounded-full items-center justify-center ${
                selectedGoals.length > 0 ? 'bg-primary' : 'bg-gray-300'
              }`}
              activeOpacity={0.8}
              disabled={selectedGoals.length === 0}
            >
              <Text
                className={`font-semibold text-base ${
                  selectedGoals.length > 0 ? 'text-white' : 'text-gray-500'
                }`}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoalAccomplishmentScreen;
