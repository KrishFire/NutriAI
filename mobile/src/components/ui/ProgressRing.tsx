import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withSpring,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  label?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  color,
  size = 120,
  strokeWidth = 12,
  showPercentage = true,
  label,
  className = '',
}) => {
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;

  React.useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 20,
      stiffness: 90,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value / 100);
    return {
      strokeDashoffset,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const displayProgress = Math.round(animatedProgress.value);
    return {
      opacity: interpolate(animatedProgress.value, [0, 5], [0, 1]),
    };
  });

  return (
    <View className={`items-center justify-center ${className}`}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      
      <View className="absolute items-center justify-center">
        {showPercentage && (
          <Animated.View style={animatedTextStyle}>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(progress)}%
            </Text>
          </Animated.View>
        )}
        {label && (
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};