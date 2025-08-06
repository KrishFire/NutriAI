import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptics';

const AnimatedView = Animated.createAnimatedComponent(View);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  padding = 'md',
  variant = 'default',
  className = '',
}) => {
  const scale = useSharedValue(1);

  const getPaddingStyles = () => {
    switch (padding) {
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white dark:bg-gray-800 shadow-card';
      case 'outlined':
        return 'bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark';
      default:
        return 'bg-background-card-light dark:bg-background-card-dark';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, {
        damping: 20,
        stiffness: 400,
      });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      });
    }
  };

  const handlePress = async () => {
    if (onPress) {
      await hapticFeedback.selection();
      onPress();
    }
  };

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <AnimatedView
          style={animatedStyle}
          className={`
            rounded-2xl ${getPaddingStyles()} ${getVariantStyles()}
            ${className}
          `}
        >
          {children}
        </AnimatedView>
      </Pressable>
    );
  }

  return (
    <View
      className={`
        rounded-2xl ${getPaddingStyles()} ${getVariantStyles()}
        ${className}
      `}
    >
      {children}
    </View>
  );
};
