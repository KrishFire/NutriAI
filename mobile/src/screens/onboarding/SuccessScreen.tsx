import React, { useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface SuccessScreenProps {
  onContinue: () => void;
}

// Macro progress bar component
const MacroProgressBar = ({
  label,
  value,
  maxValue,
  color,
  percentage,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  percentage: number;
}) => {
  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center">
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: color }}
          />
          <Text className="text-sm text-gray-900 dark:text-white">{label}</Text>
        </View>
        <Text className="text-sm text-gray-900 dark:text-white">
          {percentage}% ({value}g)
        </Text>
      </View>
      <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'timing', duration: 1000, delay: 800 }}
          style={{ backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
};

export function SuccessScreen({ onContinue }: SuccessScreenProps) {
  const confettiRef = useRef<ConfettiCannon>(null);
  const context = useOnboarding();

  // Add null check for OnboardingContext
  if (!context) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 dark:text-gray-400">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const userData = context.userData || {};

  // Extract nutrition data with fallbacks
  const dailyCalories = userData.dailyCalories || 2000;
  const macros = userData.macroTargets || { carbs: 225, protein: 150, fat: 55 };

  // Calculate macro percentages dynamically
  const totalMacroCalories =
    macros.carbs * 4 + macros.protein * 4 + macros.fat * 9;
  const carbPercentage = Math.round(
    ((macros.carbs * 4) / totalMacroCalories) * 100
  );
  const proteinPercentage = Math.round(
    ((macros.protein * 4) / totalMacroCalories) * 100
  );
  const fatPercentage = Math.round(
    ((macros.fat * 9) / totalMacroCalories) * 100
  );

  // Calculate milestone dynamically based on user goal
  const currentWeight = parseFloat(
    userData.weight?.value || userData.currentWeight?.value || '150'
  );
  const targetWeight = parseFloat(userData.targetWeight?.value || '145');
  const weightDifference = Math.abs(currentWeight - targetWeight);
  const weeklyChange = userData.weightChangeSpeed || 1; // lbs per week
  const weeksToGoal = Math.ceil(weightDifference / weeklyChange);
  const milestoneWeight = Math.min(5, weightDifference); // First milestone is 5 lbs or total if less
  const milestoneWeeks = Math.ceil(milestoneWeight / weeklyChange);
  const goalVerb = currentWeight > targetWeight ? 'lose' : 'gain';

  useEffect(() => {
    // Success haptic on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Trigger confetti after a slight delay
    const timeoutId = setTimeout(() => {
      confettiRef.current?.start();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 px-6 py-8 justify-between">
          {/* Confetti */}
          <ConfettiCannon
            ref={confettiRef}
            count={200}
            origin={{ x: -10, y: 0 }}
            autoStart={false}
            fadeOut={true}
            fallSpeed={2000}
          />

          {/* Top Section - Berry and Title */}
          <View className="items-center pt-4">
            {/* Animated Berry Image */}
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                damping: 10,
                stiffness: 100,
                delay: 200,
              }}
              className="mb-4"
            >
              <Image
                source={require('@/assets/berry/berry_celebrate.png')}
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
              />
            </MotiView>

            {/* Title */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500, delay: 400 }}
            >
              <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                You're All Set!
              </Text>
            </MotiView>

            {/* Subtitle */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500, delay: 500 }}
            >
              <Text className="text-center text-gray-600 dark:text-gray-400 text-base mb-8">
                Let's log your first meal
              </Text>
            </MotiView>
          </View>

          {/* Middle Section - Nutrition Plan */}
          <View className="flex-1 justify-center">
            {/* Daily Targets with Progress Bars */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500, delay: 600 }}
              className="w-full rounded-xl p-5 mb-4"
              style={{ backgroundColor: '#F8F5FF' }}
            >
              <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Your Nutrition Plan
              </Text>

              <View className="flex-row justify-between items-start mb-6">
                <View>
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Daily Calories
                  </Text>
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dailyCalories}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Goal
                  </Text>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    {userData.goal === 'lose'
                      ? 'Lose weight'
                      : userData.goal === 'gain'
                        ? 'Gain weight'
                        : userData.goal === 'maintain'
                          ? 'Maintain weight'
                          : 'Lose weight'}
                  </Text>
                </View>
              </View>

              <MacroProgressBar
                label="Carbs"
                value={macros.carbs}
                maxValue={macros.carbs}
                color="#FFA726"
                percentage={carbPercentage}
              />
              <MacroProgressBar
                label="Protein"
                value={macros.protein}
                maxValue={macros.protein}
                color="#42A5F5"
                percentage={proteinPercentage}
              />
              <MacroProgressBar
                label="Fat"
                value={macros.fat}
                maxValue={macros.fat}
                color="#66BB6A"
                percentage={fatPercentage}
              />
            </MotiView>

            {/* First Milestone */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500, delay: 700 }}
              className="w-full rounded-xl p-4"
              style={{ backgroundColor: '#E8E2FF' }}
            >
              <Text className="text-sm text-gray-900">
                <Text className="font-medium">First milestone: </Text>
                {milestoneWeight} lbs in {milestoneWeeks} week
                {milestoneWeeks > 1 ? 's' : ''}
              </Text>
            </MotiView>
          </View>

          {/* Bottom Section - Button */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 800 }}
            className="w-full"
          >
            <Button
              onPress={onContinue}
              variant="primary"
              size="large"
              fullWidth
            >
              Start Tracking
            </Button>
          </MotiView>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
}

export default SuccessScreen;
