import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import * as Haptics from 'expo-haptics';

interface SuccessScreenProps {
  onContinue: () => void;
}

export function SuccessScreen({ onContinue }: SuccessScreenProps) {
  useEffect(() => {
    // Success haptic on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 px-6 py-8 justify-center items-center">
          {/* Animated Berry/Success Icon */}
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 10,
              stiffness: 100,
              delay: 200,
            }}
            className="mb-8"
          >
            <View className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
              <Ionicons name="checkmark" size={48} color="#22c55e" />
            </View>
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 400 }}
          >
            <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              You're All Set!
            </Text>
          </MotiView>

          {/* Subtitle */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 500 }}
          >
            <Text className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
              Your personalized nutrition plan is ready. Let's start your journey to better health!
            </Text>
          </MotiView>

          {/* Nutrition targets summary */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 600 }}
            className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8"
          >
            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Your Daily Targets
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">Calories</Text>
                <Text className="font-medium text-gray-900 dark:text-white">2,000 kcal</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">Protein</Text>
                <Text className="font-medium text-gray-900 dark:text-white">100g</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">Carbs</Text>
                <Text className="font-medium text-gray-900 dark:text-white">250g</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">Fat</Text>
                <Text className="font-medium text-gray-900 dark:text-white">67g</Text>
              </View>
            </View>
          </MotiView>

          {/* Features unlocked */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 700 }}
            className="w-full space-y-3 mb-8"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
                <Ionicons name="camera" size={20} color="#7c3aed" />
              </View>
              <Text className="text-gray-800 dark:text-gray-200">AI-powered food recognition</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
                <Ionicons name="stats-chart" size={20} color="#7c3aed" />
              </View>
              <Text className="text-gray-800 dark:text-gray-200">Personalized insights</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
                <Ionicons name="notifications" size={20} color="#7c3aed" />
              </View>
              <Text className="text-gray-800 dark:text-gray-200">Smart reminders</Text>
            </View>
          </MotiView>

          {/* Continue Button */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 800 }}
            className="w-full mt-auto"
          >
            <Button
              onPress={onContinue}
              variant="primary"
              size="large"
              fullWidth
            >
              Get Started
            </Button>
          </MotiView>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
}

export default SuccessScreen;