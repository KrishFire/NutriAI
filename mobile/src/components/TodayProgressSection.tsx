import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AnimatedRN, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { ProgressRing } from './ui';
import * as Haptics from 'expo-haptics';

interface MacroData {
  consumed: number;
  goal: number;
  percentage: number;
}

interface TodayProgressSectionProps {
  calories: {
    consumed: number;
    goal: number;
    percentage: number;
  };
  carbs: MacroData;
  protein: MacroData;
  fat: MacroData;
  animate?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const TodayProgressSection: React.FC<TodayProgressSectionProps> = ({
  calories,
  carbs,
  protein,
  fat,
  animate = true,
  isExpanded,
  onToggle,
}) => {
  const remaining = Math.max(0, calories.goal - calories.consumed);
  const height = useSharedValue(isExpanded ? 1 : 0);
  const rotateChevron = useSharedValue(isExpanded ? 1 : 0);

  const macros = [
    { key: 'carbs', data: carbs, color: '#FFC078', label: 'carbs' },
    { key: 'protein', data: protein, color: '#74C0FC', label: 'protein' },
    { key: 'fat', data: fat, color: '#8CE99A', label: 'fat' },
  ];

  useEffect(() => {
    height.value = withSpring(isExpanded ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
    rotateChevron.value = withSpring(isExpanded ? 1 : 0);
  }, [isExpanded]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    maxHeight: height.value * 300, // Approximate max height
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateChevron.value * 180}deg` }],
  }));

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <AnimatedRN.View
      entering={animate ? FadeInDown.delay(400).springify() : undefined}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-8 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <TouchableOpacity 
        onPress={handleToggle}
        className="flex-row items-center justify-between"
        activeOpacity={0.7}
      >
        <Text className="font-semibold text-gray-900 dark:text-white text-base">
          Today's Progress
        </Text>
        <AnimatedRN.View style={animatedChevronStyle}>
          <ChevronDown size={20} color="#9CA3AF" />
        </AnimatedRN.View>
      </TouchableOpacity>
      
      <AnimatedRN.View style={[animatedContentStyle, { overflow: 'hidden' }]}>
        {/* Main calories section */}
        <View className="flex-row items-center mb-6 mt-3">
          {/* Calories Ring */}
          <View className="mr-4">
            <ProgressRing
              percentage={isExpanded && calories.consumed > 0 ? calories.percentage : 0}
              color="#320DFF"
              size={80}
              strokeWidth={8}
              animate={isExpanded && calories.consumed > 0 && animate}
              duration={600}
          >
            <View className="items-center">
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                {calories.consumed}
              </Text>
              <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                cal
              </Text>
            </View>
          </ProgressRing>
        </View>

        {/* Calories details */}
        <View className="flex-1">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-600 dark:text-gray-400">Goal</Text>
            <Text className="text-xs font-medium text-gray-900 dark:text-white">
              {calories.goal} cal
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-600 dark:text-gray-400">Consumed</Text>
            <Text className="text-xs font-medium text-gray-900 dark:text-white">
              {calories.consumed} cal
            </Text>
          </View>
          <View className="border-t border-gray-100 dark:border-gray-700 pt-1 mt-1">
            <View className="flex-row justify-between">
              <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Remaining
              </Text>
              <Text className="text-xs font-bold text-primary dark:text-primary-light">
                {remaining} cal
              </Text>
            </View>
          </View>
        </View>
      </View>

        {/* Macros section */}
        <View className="flex-row justify-around">
          {macros.map((macro, index) => (
            <View key={macro.key} className="items-center">
              <View className="mb-1">
                <ProgressRing
                  percentage={isExpanded && macro.data.consumed > 0 ? macro.data.percentage : 0}
                  color={macro.color}
                  size={40}
                  strokeWidth={4}
                  animate={isExpanded && macro.data.consumed > 0 && animate}
                  duration={600}
              >
                <Text className="text-[10px] font-semibold text-gray-800 dark:text-white">
                  {macro.data.percentage}%
                </Text>
              </ProgressRing>
            </View>
            <Text className="text-[10px] text-gray-600 dark:text-gray-400 capitalize">
              {macro.label}
            </Text>
            <Text className="text-[10px] font-medium text-gray-900 dark:text-white">
              {macro.data.consumed}/{macro.data.goal}g
            </Text>
          </View>
        ))}
      </View>
      </AnimatedRN.View>
    </AnimatedRN.View>
  );
};