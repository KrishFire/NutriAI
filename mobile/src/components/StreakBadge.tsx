import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// Create an Animated version of Ionicons
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

interface StreakBadgeProps {
  streakCount: number;
  isActive: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: ViewStyle;
}

const SIZES = {
  small: { icon: 16, font: 12, padding: 4 },
  medium: { icon: 24, font: 16, padding: 6 },
  large: { icon: 32, font: 20, padding: 8 },
};

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streakCount,
  isActive,
  size = 'medium',
  showLabel = false,
  style,
}) => {
  const { icon: iconSize, font: fontSize, padding } = SIZES[size];
  
  // Shared values for animation
  const flameScale = useSharedValue(1);
  const glowIntensity = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.8);
  
  // Color values
  const activeColor = '#FF6B6B'; // Vibrant red-orange
  const inactiveColor = '#9CA3AF'; // Gray
  const glowColor = '#FFA500'; // Orange for glow
  
  // Entrance animation
  useEffect(() => {
    badgeOpacity.value = withTiming(1, { 
      duration: 500, 
      easing: Easing.out(Easing.ease) 
    });
    badgeScale.value = withSequence(
      withTiming(1.1, { duration: 300, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) })
    );
  }, []);
  
  // State change animations
  useEffect(() => {
    if (isActive && streakCount > 0) {
      // Start pulsing animation
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      
      // Glow animation
      glowIntensity.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      // Stop animations
      cancelAnimation(flameScale);
      cancelAnimation(glowIntensity);
      flameScale.value = withTiming(1, { duration: 300 });
      glowIntensity.value = withTiming(0, { duration: 300 });
    }
    
    return () => {
      cancelAnimation(flameScale);
      cancelAnimation(glowIntensity);
    };
  }, [isActive, streakCount]);
  
  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(glowIntensity.value, [0, 1], [0, 0.6]);
    
    return {
      opacity: badgeOpacity.value,
      transform: [{ scale: badgeScale.value }],
      shadowOpacity: isActive ? shadowOpacity : 0,
    };
  });
  
  const animatedFlameStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: flameScale.value }],
    };
  });
  
  const color = isActive && streakCount > 0 ? activeColor : inactiveColor;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        size === 'small' && styles.containerSmall,
        size === 'large' && styles.containerLarge,
        {
          paddingVertical: padding,
          paddingHorizontal: padding * 2,
          shadowColor: glowColor,
        },
        animatedContainerStyle,
        style,
      ]}
    >
      <AnimatedIonicons
        name="flame"
        size={iconSize}
        color={color}
        style={animatedFlameStyle}
      />
      <Text 
        style={[
          styles.streakText,
          { fontSize, color },
          size === 'small' && styles.textSmall,
        ]}
      >
        {streakCount}
      </Text>
      {showLabel && (
        <Text 
          style={[
            styles.labelText,
            { fontSize: fontSize * 0.7, color },
          ]}
        >
          {streakCount === 1 ? 'day' : 'days'}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 5,
  },
  containerSmall: {
    borderRadius: 12,
  },
  containerLarge: {
    borderRadius: 24,
  },
  streakText: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  textSmall: {
    marginLeft: 2,
  },
  labelText: {
    marginLeft: 4,
    opacity: 0.8,
  },
});