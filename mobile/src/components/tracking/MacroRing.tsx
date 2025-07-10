import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import Svg, { Circle } from 'react-native-svg';

interface MacroRingProps {
  current: number;
  target: number;
  label: string;
  color: string;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
}

export default function MacroRing({
  current,
  target,
  label,
  color,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
}: MacroRingProps) {
  const [displayCurrent, setDisplayCurrent] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  const percentage = Math.min((current / target) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  // Animate the number counting up
  useEffect(() => {
    const timer = setTimeout(() => {
      if (displayCurrent < current) {
        setDisplayCurrent(prev =>
          Math.min(prev + Math.ceil(current / 20), current)
        );
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [current, displayCurrent]);

  // Animate the ring progress
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedPercentage < percentage) {
        setAnimatedPercentage(prev =>
          Math.min(prev + 2, percentage)
        );
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [percentage, animatedPercentage]);

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        <View style={styles.centerContent}>
          <Text style={[styles.currentValue, { color }]}>{displayCurrent}</Text>
          <Text style={styles.targetValue}>/ {target}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
          )}
        </View>
      </View>

      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  currentValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetValue: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  percentage: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    textAlign: 'center',
  },
});
