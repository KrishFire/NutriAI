import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  animate?: boolean;
  duration?: number;
  children?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  color,
  size = 120,
  strokeWidth = 12,
  animate = true,
  duration = 1000,
  children,
  className = '',
}) => {
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;

  useEffect(() => {
    if (animate) {
      // Start from 0 for initial animation
      animatedProgress.value = 0;
      // Animate with custom easing for beautiful effect
      animatedProgress.value = withTiming(percentage, {
        duration: duration,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Custom easing curve
      });
    } else {
      animatedProgress.value = percentage;
    }
  }, [percentage, animate, duration]);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    const strokeDashoffset = circumference * (1 - animatedProgress.value / 100);
    return {
      strokeDashoffset,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: 1, // Always show text, even at 0%
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

      {children && (
        <View
          className="absolute items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Animated.View style={animatedTextStyle}>{children}</Animated.View>
        </View>
      )}
    </View>
  );
};
