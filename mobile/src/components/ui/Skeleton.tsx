import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}) => {
  const shimmerAnimation = useSharedValue(0);

  React.useEffect(() => {
    shimmerAnimation.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerAnimation.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      className={`bg-gray-200 dark:bg-gray-700 overflow-hidden ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 200,
          },
          animatedStyle,
        ]}
      >
        <AnimatedLinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.5)',
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flex: 1,
          }}
        />
      </Animated.View>
    </View>
  );
};

// Specialized skeleton components
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 1, className = '' }) => {
  return (
    <View className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </View>
  );
};

export const SkeletonCircle: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 40, className = '' }) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      className={className}
    />
  );
};

export const SkeletonImage: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
}> = ({ width = '100%', height = 200, className = '' }) => {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={16}
      className={className}
    />
  );
};
