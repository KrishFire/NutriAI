import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { MotiView } from 'moti';
import { PageTransition } from '@/components/ui/PageTransition';
import { Berry } from '@/components/ui/Berry';
import * as Haptics from 'expo-haptics';

interface AnalyzingScreenProps {
  inputType: string;
  data: any;
  onResults: (results: any) => void;
}

export function AnalyzingScreen({ inputType, data, onResults }: AnalyzingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Haptic feedback on start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    // Simulate completion after a delay
    const timeout = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onResults({
        foods: [
          {
            name: 'Grilled Chicken Salad',
            calories: 320,
            protein: 28,
            carbs: 12,
            fat: 16
          },
          {
            name: 'Avocado',
            calories: 160,
            protein: 2,
            carbs: 8,
            fat: 15
          }
        ],
        totalCalories: 480
      });
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onResults]);

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center p-6">
          {/* Berry Animation */}
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 100
            }}
            className="mb-8"
          >
            <Berry variant="search" size="large" />
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, duration: 500 }}
          >
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Analyzing Your Food
            </Text>
          </MotiView>

          {/* Description */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, duration: 500 }}
            className="mb-8"
          >
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              Berry is using AI to identify your meal and calculate nutrition
              information
            </Text>
          </MotiView>

          {/* Progress Bar */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 400, duration: 500 }}
            className="w-full"
          >
            <View className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2 overflow-hidden">
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'timing', duration: 500 }}
                className="h-full bg-primary-600 dark:bg-primary-400 rounded-full"
              />
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {progress}%
            </Text>
          </MotiView>

          {/* Status Messages */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 800, duration: 500 }}
            className="mt-8"
          >
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {progress < 30 && 'Detecting food items...'}
              {progress >= 30 && progress < 60 && 'Identifying ingredients...'}
              {progress >= 60 && progress < 90 && 'Calculating nutrition...'}
              {progress >= 90 && 'Almost done...'}
            </Text>
          </MotiView>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
}