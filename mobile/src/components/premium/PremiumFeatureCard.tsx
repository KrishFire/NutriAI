import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeInDown,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlighted?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  title,
  description,
  icon,
  highlighted = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 20,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 400,
    });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 300 }}
        className={`
          p-4 rounded-xl border mb-3
          ${
            highlighted
              ? 'border-primary bg-primary/5 dark:border-primaryDark dark:bg-primaryDark/10'
              : 'border-gray-200 dark:border-gray-700'
          }
        `}
      >
        <View className="flex-row">
          <View
            className={`
              w-10 h-10 rounded-full items-center justify-center mr-3
              ${
                highlighted
                  ? 'bg-primary/10 dark:bg-primaryDark/20'
                  : 'bg-gray-100 dark:bg-gray-800'
              }
            `}
          >
            {icon}
          </View>

          <View className="flex-1">
            <Text
              className={`
                font-medium
                ${
                  highlighted
                    ? 'text-primary dark:text-primaryDark'
                    : 'text-gray-900 dark:text-white'
                }
              `}
            >
              {title}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </Text>
          </View>

          {highlighted && (
            <View className="w-6 h-6 rounded-full bg-primary dark:bg-primaryDark items-center justify-center">
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          )}
        </View>
      </MotiView>
    </AnimatedPressable>
  );
};
