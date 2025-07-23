import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { useAnimationState } from 'moti';
import { hapticFeedback } from '@/utils/haptics';

interface ElasticButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'white';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const ElasticButton: React.FC<ElasticButtonProps> = ({
  children,
  onPress,
  className = '',
  disabled = false,
  color = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
}) => {
  const animationState = useAnimationState({
    from: {
      scale: 1,
      opacity: 0.9,
    },
    to: {
      scale: 1,
      opacity: 1,
    },
    press: {
      scale: 0.95,
      opacity: 1,
    },
    elastic: {
      scale: [0.95, 0.9, 0.98, 1],
    },
  });

  // Color variants
  const colorClasses = {
    primary: 'bg-[#320DFF]',
    secondary: 'bg-[#320DFF]/10',
    white: 'bg-white border border-gray-200',
  };

  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-[#320DFF]',
    white: 'text-gray-900',
  };

  // Size variants
  const sizeClasses = {
    sm: 'py-2 px-4',
    md: 'py-3 px-6',
    lg: 'py-4 px-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handlePressIn = () => {
    hapticFeedback.selection();
    animationState.transitionTo('press');
  };

  const handlePressOut = () => {
    animationState.transitionTo('elastic');
    setTimeout(() => {
      animationState.transitionTo('to');
    }, 300);
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''}`}
    >
      <MotiView
        state={animationState}
        transition={{
          type: 'spring',
          damping: 10,
          stiffness: 300,
        }}
      >
        <View
          className={`flex-row items-center justify-center rounded-full ${colorClasses[color]} ${sizeClasses[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
        >
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`font-medium ${textColorClasses[color]} ${textSizeClasses[size]}`}
          >
            {children}
          </Text>
        </View>
      </MotiView>
    </TouchableOpacity>
  );
};