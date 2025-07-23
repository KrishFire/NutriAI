import React from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  SlideInDown,
  SlideOutLeft,
  SlideOutRight,
  SlideOutUp,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade' | 'scale';
  duration?: number;
  enabled?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'fade',
  duration = 400,
  enabled = true,
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  const springConfig = {
    damping: 30,
    stiffness: 300,
    mass: 1,
  };

  const getAnimation = () => {
    switch (direction) {
      case 'left':
        return {
          entering: SlideInRight.duration(duration).springify(springConfig),
          exiting: SlideOutLeft.duration(duration).springify(springConfig),
        };
      case 'right':
        return {
          entering: SlideInLeft.duration(duration).springify(springConfig),
          exiting: SlideOutRight.duration(duration).springify(springConfig),
        };
      case 'up':
        return {
          entering: SlideInDown.duration(duration).springify(springConfig),
          exiting: SlideOutUp.duration(duration).springify(springConfig),
        };
      case 'down':
        return {
          entering: SlideInUp.duration(duration).springify(springConfig),
          exiting: SlideOutDown.duration(duration).springify(springConfig),
        };
      case 'scale':
        return {
          entering: ZoomIn.duration(duration).springify(springConfig),
          exiting: ZoomOut.duration(duration).springify(springConfig),
        };
      case 'fade':
      default:
        return {
          entering: FadeIn.duration(duration),
          exiting: FadeOut.duration(duration),
        };
    }
  };

  const { entering, exiting } = getAnimation();

  return (
    <Animated.View 
      className="flex-1 w-full"
      entering={entering}
      exiting={exiting}
    >
      {children}
    </Animated.View>
  );
};