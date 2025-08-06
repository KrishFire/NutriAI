import React from 'react';
import { View, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';

interface GlassMorphismProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'heavy';
  color?: string;
  rounded?: boolean;
  border?: boolean;
}

export const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  className = '',
  style,
  intensity = 'medium',
  color = '#ffffff',
  rounded = true,
  border = true,
}) => {
  // Intensity variants
  const intensityMap = {
    light: { intensity: 20, tint: 'light' as const },
    medium: { intensity: 50, tint: 'light' as const },
    heavy: { intensity: 80, tint: 'light' as const },
  };

  const { intensity: blurIntensity, tint } = intensityMap[intensity];

  // Opacity based on intensity
  const opacityMap = {
    light: 0.2,
    medium: 0.3,
    heavy: 0.4,
  };

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: 300,
      }}
      style={style}
    >
      <BlurView
        intensity={blurIntensity}
        tint={tint}
        className={`overflow-hidden ${rounded ? 'rounded-xl' : ''} ${className}`}
      >
        <View
          className={`${border ? 'border border-white/20' : ''}`}
          style={{
            backgroundColor:
              color + Math.round(opacityMap[intensity] * 255).toString(16),
          }}
        >
          {children}
        </View>
      </BlurView>
    </MotiView>
  );
};
