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
      animatedProgress.value = withSpring(percentage, {
        damping: 12,
        stiffness: 150,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      });
    } else {
      animatedProgress.value = percentage;
    }
  }, [percentage, animate]);

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
