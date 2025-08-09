import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

interface WaveformAnimationProps {
  isRecording: boolean;
  meteringValue?: number;
  barCount?: number;
  baseHeight?: number;
  maxHeight?: number;
  barColor?: string;
  className?: string;
}

export function WaveformAnimation({
  isRecording,
  meteringValue = -160,
  barCount = 30,
  baseHeight = 5,
  maxHeight = 30,
  barColor = '#320DFF',
  className = '',
}: WaveformAnimationProps) {
  // Calculate bar heights based on metering value
  // Metering values typically range from -160 (silence) to 0 (very loud)
  const normalizedValue = useMemo(() => {
    if (!isRecording) return 0;
    // Normalize from [-160, 0] to [0, 1]
    const normalized = Math.max(0, Math.min(1, (meteringValue + 160) / 160));
    return normalized;
  }, [meteringValue, isRecording]);

  // Generate random variations for each bar to create wave effect
  const barHeights = useMemo(() => {
    return Array.from({ length: barCount }, (_, index) => {
      if (!isRecording) return baseHeight;
      
      // Create a wave pattern with some randomness
      const wavePosition = index / barCount;
      const waveOffset = Math.sin(wavePosition * Math.PI * 2) * 0.3;
      const randomOffset = (Math.random() - 0.5) * 0.4;
      
      // Combine normalized audio level with wave pattern
      const heightFactor = normalizedValue * (0.7 + waveOffset + randomOffset);
      const height = baseHeight + (maxHeight - baseHeight) * heightFactor;
      
      return Math.max(baseHeight, Math.min(maxHeight, height));
    });
  }, [normalizedValue, isRecording, barCount, baseHeight, maxHeight]);

  return (
    <View className={`flex-row items-center justify-center ${className}`}>
      {barHeights.map((height, index) => (
        <MotiView
          key={index}
          animate={{
            height: isRecording ? height : baseHeight,
            opacity: isRecording ? 0.8 + normalizedValue * 0.2 : 0.5,
          }}
          transition={{
            type: 'timing',
            duration: 150,
            delay: index * 10, // Slight delay for wave effect
          }}
          style={{
            width: 3,
            marginHorizontal: 2,
            backgroundColor: barColor,
            borderRadius: 1.5,
          }}
        />
      ))}
    </View>
  );
}