import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';

interface SubscriptionPlanCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  isPopular?: boolean;
  isSelected?: boolean;
  discount?: string;
  onSelect: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  title,
  price,
  period,
  description,
  isPopular = false,
  isSelected = false,
  discount,
  onSelect,
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

  const handlePress = async () => {
    await hapticFeedback.selection();
    onSelect();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="mb-3"
    >
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 300 }}
        className={`
          p-4 rounded-xl border relative
          ${isSelected 
            ? 'border-primary bg-primary/5 dark:border-primaryDark dark:bg-primaryDark/10' 
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          }
        `}
      >
        {/* Badges */}
        {isPopular && (
          <View className="absolute -top-3 right-4 bg-primary dark:bg-primaryDark px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">
              Most Popular
            </Text>
          </View>
        )}
        
        {discount && (
          <View className="absolute -top-3 left-4 bg-green-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">
              Save {discount}
            </Text>
          </View>
        )}

        {/* Content */}
        <View className="flex-row items-center mb-2">
          {/* Radio button */}
          <View
            className={`
              w-5 h-5 rounded-full border-2 mr-2 items-center justify-center
              ${isSelected 
                ? 'border-primary dark:border-primaryDark bg-primary dark:bg-primaryDark' 
                : 'border-gray-300 dark:border-gray-600'
              }
            `}
          >
            {isSelected && (
              <View className="w-2 h-2 rounded-full bg-white" />
            )}
          </View>
          
          <Text className="font-medium text-gray-900 dark:text-white">
            {title}
          </Text>
        </View>

        {/* Price */}
        <View className="mb-2">
          <View className="flex-row items-baseline">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {price}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              /{period}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </Text>
        </View>
      </MotiView>
    </AnimatedPressable>
  );
};