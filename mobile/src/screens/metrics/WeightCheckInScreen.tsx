import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/Button';
import { WeightTrendGraph } from '@/components/metrics/WeightTrendGraph';
import * as Haptics from 'expo-haptics';
import { StandardHeaderWithBack } from '../../components/common';

interface WeightCheckInScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export function WeightCheckInScreen({
  onBack,
  onComplete,
}: WeightCheckInScreenProps) {
  const [currentStep, setCurrentStep] = useState<
    'weight' | 'mood' | 'recommendation'
  >('weight');
  const [selectedMood, setSelectedMood] = useState<
    'happy' | 'neutral' | 'unhappy' | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data
  const weightData = [
    { date: 'Mon', weight: 165.2 },
    { date: 'Tue', weight: 164.8 },
    { date: 'Wed', weight: 164.5 },
    { date: 'Thu', weight: 164.3 },
    { date: 'Fri', weight: 164.0 },
    { date: 'Sat', weight: 163.8 },
    { date: 'Sun', weight: 163.5 },
  ];

  const handleNextStep = () => {
    Haptics.selectionAsync();
    if (currentStep === 'weight') {
      setCurrentStep('mood');
    } else if (currentStep === 'mood') {
      setCurrentStep('recommendation');
    } else {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onComplete();
      }, 1500);
    }
  };

  const handleSelectMood = (mood: 'happy' | 'neutral' | 'unhappy') => {
    Haptics.selectionAsync();
    setSelectedMood(mood);
  };

  const renderWeight = () => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -20 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View className="flex-row items-center mb-6">
        <View className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-4">
          <Ionicons name="scale" size={24} color="#7c3aed" />
        </View>
        <View>
          <Text className="font-semibold text-gray-900 dark:text-white text-lg">
            Confirm Your Weight
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            Let's check your progress for the week
          </Text>
        </View>
      </View>

      <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-600 dark:text-gray-400">
            Current Weight
          </Text>
          <View className="flex-row items-baseline">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mr-1">
              163.5
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              lbs
            </Text>
          </View>
        </View>

        <View className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
              <Ionicons name="checkmark" size={16} color="#22c55e" />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                -1.7 lbs this week
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                Great progress! You're on track.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity>
          <Text className="text-sm text-primary-600 dark:text-primary-400 font-medium">
            Update Weight
          </Text>
        </TouchableOpacity>
      </View>

      <WeightTrendGraph
        data={weightData}
        startWeight={165.2}
        currentWeight={163.5}
        goalWeight={150}
        unit="lbs"
      />
    </MotiView>
  );

  const renderMood = () => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -20 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View className="mb-6 items-center">
        <Text className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
          How do you feel about your progress?
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm text-center">
          Your feedback helps us personalize your plan
        </Text>
      </View>

      <View className="flex-row justify-between gap-4 mb-8">
        <TouchableOpacity
          onPress={() => handleSelectMood('happy')}
          className="flex-1"
        >
          <MotiView
            animate={{
              scale: selectedMood === 'happy' ? 1.05 : 1,
            }}
            transition={{ type: 'spring', damping: 15 }}
            className={`items-center justify-center p-6 rounded-xl border ${
              selectedMood === 'happy'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <View
              className={`w-16 h-16 rounded-full ${
                selectedMood === 'happy'
                  ? 'bg-green-100 dark:bg-green-800/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              } items-center justify-center mb-3`}
            >
              <Ionicons
                name="happy"
                size={32}
                color={selectedMood === 'happy' ? '#22c55e' : '#6b7280'}
              />
            </View>
            <Text
              className={`font-medium ${
                selectedMood === 'happy'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Happy
            </Text>
          </MotiView>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSelectMood('neutral')}
          className="flex-1"
        >
          <MotiView
            animate={{
              scale: selectedMood === 'neutral' ? 1.05 : 1,
            }}
            transition={{ type: 'spring', damping: 15 }}
            className={`items-center justify-center p-6 rounded-xl border ${
              selectedMood === 'neutral'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <View
              className={`w-16 h-16 rounded-full ${
                selectedMood === 'neutral'
                  ? 'bg-blue-100 dark:bg-blue-800/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              } items-center justify-center mb-3`}
            >
              <Ionicons
                name="remove-circle"
                size={32}
                color={selectedMood === 'neutral' ? '#3b82f6' : '#6b7280'}
              />
            </View>
            <Text
              className={`font-medium ${
                selectedMood === 'neutral'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Neutral
            </Text>
          </MotiView>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSelectMood('unhappy')}
          className="flex-1"
        >
          <MotiView
            animate={{
              scale: selectedMood === 'unhappy' ? 1.05 : 1,
            }}
            transition={{ type: 'spring', damping: 15 }}
            className={`items-center justify-center p-6 rounded-xl border ${
              selectedMood === 'unhappy'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <View
              className={`w-16 h-16 rounded-full ${
                selectedMood === 'unhappy'
                  ? 'bg-amber-100 dark:bg-amber-800/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              } items-center justify-center mb-3`}
            >
              <Ionicons
                name="sad"
                size={32}
                color={selectedMood === 'unhappy' ? '#f59e0b' : '#6b7280'}
              />
            </View>
            <Text
              className={`font-medium ${
                selectedMood === 'unhappy'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Unhappy
            </Text>
          </MotiView>
        </TouchableOpacity>
      </View>

      {selectedMood === 'unhappy' && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4 mb-6"
        >
          <Text className="text-sm text-amber-700 dark:text-amber-400">
            Remember that progress isn't always linear. Would you like to
            discuss adjusting your goals?
          </Text>
        </MotiView>
      )}
    </MotiView>
  );

  const renderRecommendation = () => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -20 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <View className="mb-6">
        <Text className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
          Your Weekly Recommendation
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm">
          Based on your progress and feedback
        </Text>
      </View>

      <View className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-xl p-4 mb-6">
        <View className="flex-row items-start">
          <View className="w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-800/50 items-center justify-center mr-3 mt-1">
            <Ionicons name="add" size={20} color="#7c3aed" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-primary-700 dark:text-primary-300 mb-1">
              Plan Update: +80 kcal Daily Target
            </Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              You're losing weight faster than your goal rate. We're adjusting
              your daily calorie target to ensure sustainable progress.
            </Text>
            <View className="flex-row items-center">
              <View className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <View className="h-full bg-primary-600 dark:bg-primary-400 w-3/4" />
              </View>
              <Text className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                1920 → 2000 kcal
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="space-y-4 mb-6">
        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <Text className="font-medium text-gray-900 dark:text-white mb-2">
            Progress Summary
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Weekly Weight Change
              </Text>
              <Text className="text-sm font-medium text-green-600 dark:text-green-400">
                -1.7 lbs
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Total Weight Loss
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                -6.5 lbs
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Goal Progress
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                43%
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Estimated Goal Date
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                Oct 15, 2023
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <Text className="font-medium text-gray-900 dark:text-white mb-2">
            Nutrition Insights
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-2 mt-0.5">
                <Ionicons name="checkmark" size={12} color="#22c55e" />
              </View>
              <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                Great job staying within your protein targets this week.
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center mr-2 mt-0.5">
                <Ionicons name="alert" size={12} color="#f59e0b" />
              </View>
              <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                Consider adding more fiber-rich foods to your diet.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </MotiView>
  );

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1">
          {/* Header */}
          <StandardHeaderWithBack 
            title="Weekly Check-In" 
            onBack={onBack}
          />

          {/* Content */}
          <ScrollView className="flex-1 px-4">
            {currentStep === 'weight' && renderWeight()}
            {currentStep === 'mood' && renderMood()}
            {currentStep === 'recommendation' && renderRecommendation()}
          </ScrollView>

          {/* Footer */}
          <View className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="primary"
              fullWidth
              onPress={handleNextStep}
              disabled={currentStep === 'mood' && selectedMood === null}
              loading={isLoading}
            >
              {currentStep === 'weight'
                ? 'Continue'
                : currentStep === 'mood'
                  ? 'Next'
                  : isLoading
                    ? 'Updating Plan...'
                    : 'Apply Changes & Continue'}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
}
