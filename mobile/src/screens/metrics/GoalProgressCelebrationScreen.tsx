import React, { useEffect, useRef } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';

interface GoalProgressCelebrationScreenProps {
  onContinue: () => void;
  onSetNewGoal: () => void;
  goalWeight: number;
  startWeight: number;
  currentWeight: number;
  unit: 'lbs' | 'kg';
}

export function GoalProgressCelebrationScreen({
  onContinue,
  onSetNewGoal,
  goalWeight,
  startWeight,
  currentWeight,
  unit = 'lbs'
}: GoalProgressCelebrationScreenProps) {
  const totalLoss = startWeight - currentWeight;
  const percentComplete = Math.min(100, Math.round((totalLoss / (startWeight - goalWeight)) * 100));
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    // Trigger success haptic on load
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Play confetti animation
    confettiRef.current?.play();
  }, []);

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 p-6">
          {/* Confetti Overlay */}
          <View className="absolute inset-0 pointer-events-none">
            <LottieView
              ref={confettiRef}
              source={require('@/assets/animations/confetti.json')}
              autoPlay={false}
              loop={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </View>

          <View className="flex-1 items-center justify-center">
            {/* Berry/Success Icon */}
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 200,
              }}
              className="mb-8"
            >
              <View className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                <Ionicons name="trophy" size={64} color="#22c55e" />
              </View>
            </MotiView>

            {/* Title */}
            <MotiView
              from={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ delay: 400, duration: 500 }}
            >
              <Text className="text-3xl font-bold mb-3 text-center text-gray-900 dark:text-white">
                Goal Achieved!
              </Text>
            </MotiView>

            {/* Subtitle */}
            <MotiView
              from={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ delay: 500, duration: 500 }}
            >
              <Text className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
                Congratulations! You've reached your weight goal.
              </Text>
            </MotiView>

            {/* Progress Summary */}
            <MotiView
              from={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ delay: 600, duration: 500 }}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Starting Weight
                  </Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {startWeight} {unit}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-2">
                    <Ionicons name="trending-down" size={16} color="#22c55e" />
                  </View>
                  <View>
                    <Text className="text-xs text-green-600 dark:text-green-400">
                      -{totalLoss.toFixed(1)} {unit}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      Total Loss
                    </Text>
                  </View>
                </View>
                
                <View>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Current Weight
                  </Text>
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {currentWeight} {unit}
                  </Text>
                </View>
              </View>
              
              <View className="mb-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    Progress
                  </Text>
                  <Text className="text-xs font-medium text-gray-900 dark:text-white">
                    {percentComplete}%
                  </Text>
                </View>
                <View className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <MotiView
                    from={{ width: '0%' }}
                    animate={{ width: `${percentComplete}%` }}
                    transition={{ delay: 800, duration: 1500 }}
                    className="h-full bg-green-500 dark:bg-green-400 rounded-full"
                  />
                </View>
              </View>
              
              <Text className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Goal Weight: {goalWeight} {unit}
              </Text>
            </MotiView>

            {/* Achievements */}
            <MotiView
              from={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ delay: 900, duration: 500 }}
              className="w-full space-y-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-4">
                  <View className="w-5 h-5 rounded-full bg-primary-600 dark:bg-primary-400" />
                </View>
                <Text className="text-gray-800 dark:text-gray-200">
                  28-day streak maintained
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-4">
                  <View className="w-5 h-5 rounded-full bg-primary-600 dark:bg-primary-400" />
                </View>
                <Text className="text-gray-800 dark:text-gray-200">
                  Healthy weight loss pace achieved
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-4">
                  <View className="w-5 h-5 rounded-full bg-primary-600 dark:bg-primary-400" />
                </View>
                <Text className="text-gray-800 dark:text-gray-200">
                  Nutrition balance improved by 45%
                </Text>
              </View>
            </MotiView>
          </View>

          {/* Action Buttons */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 1200, duration: 500 }}
            className="space-y-3 mt-8"
          >
            <Button
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSetNewGoal();
              }}
              variant="primary"
              fullWidth
            >
              Set a New Goal
            </Button>
            <Button
              onPress={() => {
                Haptics.selectionAsync();
                onContinue();
              }}
              variant="secondary"
              fullWidth
            >
              Continue with Maintenance
            </Button>
          </MotiView>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
}