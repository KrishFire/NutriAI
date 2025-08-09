import React from 'react';
import { View, AccessibilityInfo } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Easing } from 'react-native-reanimated';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export function LoadingIndicator({
  size = 'medium',
  color,
  className = '',
}: LoadingIndicatorProps) {
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    // Check if reduce motion is enabled
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    
    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    
    return () => subscription?.remove();
  }, []);

  // Size mappings
  const sizeMap = {
    small: 24,
    medium: 36,
    large: 48,
  };

  const strokeWidthMap = {
    small: 2.5,
    medium: 3,
    large: 3.5,
  };

  const dimension = sizeMap[size];
  const strokeWidth = strokeWidthMap[size];
  const radius = (dimension - strokeWidth) / 2;
  const center = dimension / 2;

  // Calculate arc path with a "bite" effect
  const startAngle = 0;
  const endAngle = 280; // Slightly less than 270 for the bite effect
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  const x1 = center + radius * Math.cos(startRad);
  const y1 = center + radius * Math.sin(startRad);
  const x2 = center + radius * Math.cos(endRad);
  const y2 = center + radius * Math.sin(endRad);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  
  const pathData = `
    M ${x1} ${y1}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
  `;

  const primaryColor = color || '#320DFF';

  return (
    <View className={`items-center justify-center ${className}`}>
      <MotiView
        from={reduceMotion ? { opacity: 0.3 } : { rotate: '0deg' }}
        animate={reduceMotion ? { opacity: 1 } : { rotate: '360deg' }}
        transition={
          reduceMotion
            ? {
                type: 'timing',
                duration: 1500,
                loop: true,
                repeatReverse: true,
              }
            : {
                type: 'timing',
                duration: 1400,
                loop: true,
                repeatReverse: false,
                easing: Easing.inOut(Easing.ease),
              }
        }
        style={{ width: dimension, height: dimension }}
      >
        <Svg width={dimension} height={dimension} viewBox={`0 0 ${dimension} ${dimension}`}>
          <Defs>
            <LinearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
              <Stop offset="70%" stopColor={primaryColor} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          
          <Path
            d={pathData}
            stroke="url(#arcGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </MotiView>
    </View>
  );
}

// Export as default for easy replacement of ActivityIndicator
export default LoadingIndicator;