import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
}) => {
  const scale = useSharedValue(1);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary border-transparent';
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      case 'outline':
        return 'bg-transparent border-gray-300 dark:border-gray-600';
      case 'danger':
        return 'bg-error border-transparent';
      default:
        return 'bg-primary border-transparent';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return 'text-white';
      case 'secondary':
      case 'outline':
        return 'text-gray-900 dark:text-white';
      default:
        return 'text-white';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, {
        damping: 20,
        stiffness: 400,
      });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 400,
      });
    }
  };

  const handlePress = async () => {
    if (!disabled && !loading && onPress) {
      await hapticFeedback.selection();
      onPress();
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={`
        flex-row items-center justify-center 
        px-6 py-4 rounded-full 
        border ${getVariantStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {loading ? (
        <View className="flex-row items-center space-x-2">
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#320DFF'} 
          />
          <Text className={`font-medium ml-2 ${getTextStyles()}`}>
            Loading...
          </Text>
        </View>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View className="mr-2">{icon}</View>
          )}
          <Text className={`font-medium ${getTextStyles()}`}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <View className="ml-2">{icon}</View>
          )}
        </>
      )}
    </AnimatedPressable>
  );
};