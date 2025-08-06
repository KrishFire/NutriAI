import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import LinearGradient from 'react-native-linear-gradient';
import { hapticFeedback } from '../../utils/haptics';

interface RulerSliderProps {
  currentWeight: number;
  targetWeight: number;
  minWeight: number;
  maxWeight: number;
  unit: 'lbs' | 'kg';
  onValueChange: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
  step?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RULER_WIDTH = SCREEN_WIDTH - 48;
const RULER_HEIGHT = 120;
const THUMB_SIZE = 32;

const RulerSlider: React.FC<RulerSliderProps> = ({
  currentWeight,
  targetWeight,
  minWeight,
  maxWeight,
  unit,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  step = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [thumbPosition, setThumbPosition] = useState(RULER_WIDTH / 2);

  // Convert weight to position
  const weightToPosition = (weight: number) => {
    const totalRange = maxWeight - minWeight;
    if (totalRange === 0) return RULER_WIDTH / 2;
    const percentage = (weight - minWeight) / totalRange;
    return percentage * RULER_WIDTH;
  };

  // Convert position to weight
  const positionToWeight = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / RULER_WIDTH));
    const totalRange = maxWeight - minWeight;
    const weight = minWeight + percentage * totalRange;
    // Apply step rounding
    return Math.round(weight / step) * step;
  };

  // Initialize thumb position to currentWeight and update when targetWeight changes
  useEffect(() => {
    // Initialize to currentWeight on first render
    if (targetWeight === currentWeight) {
      const centerPosition = weightToPosition(currentWeight);
      setThumbPosition(centerPosition);
    } else {
      const newPosition = weightToPosition(targetWeight);
      setThumbPosition(newPosition);
    }
  }, [targetWeight, currentWeight]);

  const lastValue = useRef(targetWeight);

  // Track initial touch position for smooth dragging
  const initialTouchRef = useRef(0);
  const initialThumbPosRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: evt => {
        setIsDragging(true);
        onSlidingStart?.();
        initialThumbPosRef.current = weightToPosition(targetWeight);
        hapticFeedback.selection();
      },

      onPanResponderMove: (evt, gestureState) => {
        // Calculate new position based on drag distance from initial touch
        const newThumbPos = initialThumbPosRef.current + gestureState.dx;
        const clampedX = Math.max(0, Math.min(RULER_WIDTH, newThumbPos));

        setThumbPosition(clampedX);

        const newWeight = positionToWeight(clampedX);
        if (newWeight !== lastValue.current) {
          lastValue.current = newWeight;
          onValueChange(newWeight);
          hapticFeedback.selection();
        }
      },

      onPanResponderRelease: () => {
        setIsDragging(false);
        onSlidingComplete?.();
        hapticFeedback.impact();
      },

      onPanResponderTerminate: () => {
        setIsDragging(false);
        onSlidingComplete?.();
      },
    })
  ).current;

  // Generate tick marks
  const renderTicks = () => {
    const ticks = [];
    const majorInterval = unit === 'kg' ? 10 : 10; // Major tick every 10 units
    const minorInterval = unit === 'kg' ? 5 : 5; // Minor tick every 5 units

    // Start from a round number
    const startWeight = Math.floor(minWeight / minorInterval) * minorInterval;

    for (
      let weight = startWeight;
      weight <= maxWeight;
      weight += minorInterval
    ) {
      if (weight < minWeight) continue;

      const position = weightToPosition(weight);
      const isMajor = weight % majorInterval === 0;

      if (position >= 0 && position <= RULER_WIDTH) {
        ticks.push(
          <View
            key={`tick-${weight}`}
            style={[
              styles.tick,
              isMajor ? styles.tickMajor : styles.tickMinor,
              { left: position - 0.5 },
            ]}
          />
        );
      }
    }

    return ticks;
  };

  const currentWeightPosition = weightToPosition(currentWeight);

  return (
    <View style={styles.container}>
      {/* Ruler */}
      <View style={styles.ruler} {...panResponder.panHandlers}>
        {/* Purple gradient background line */}
        <LinearGradient
          colors={['#E0D6FF', '#320DFF', '#E0D6FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientLine}
        />

        {/* Tick marks */}
        <View style={styles.tickContainer}>{renderTicks()}</View>

        {/* Current weight vertical line */}
        <View
          style={[
            styles.currentWeightLine,
            { left: currentWeightPosition - 1.5 },
          ]}
        />

        {/* Current weight label - positioned above the line */}
        <View
          style={[
            styles.currentWeightLabel,
            { left: currentWeightPosition - 30 },
          ]}
        >
          <Text style={styles.currentWeightText}>
            {currentWeight} {unit}
          </Text>
        </View>

        {/* Thumb */}
        <MotiView
          animate={{
            left: thumbPosition - THUMB_SIZE / 2,
            scale: isDragging ? 0.95 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
          style={styles.thumb}
        >
          <View style={styles.thumbOuter}>
            <View style={styles.thumbInner} />
          </View>
        </MotiView>
      </View>

      {/* Weight labels at extremes */}
      <View style={styles.weightLabels}>
        <Text style={styles.weightLabel}>
          {Math.round(minWeight)} {unit}
        </Text>
        <Text style={styles.weightLabel}>
          {Math.round(maxWeight)} {unit}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: RULER_HEIGHT,
    marginVertical: 20,
  },
  ruler: {
    height: 80,
    position: 'relative',
    justifyContent: 'center',
  },
  gradientLine: {
    position: 'absolute',
    height: 6,
    width: '100%',
    top: '50%',
    marginTop: -3,
    borderRadius: 3,
  },
  tickContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tick: {
    position: 'absolute',
    backgroundColor: '#C4B5FD',
    top: '50%',
  },
  tickMajor: {
    width: 2,
    height: 24,
    marginTop: -12,
    backgroundColor: '#8B5CF6',
  },
  tickMinor: {
    width: 1,
    height: 16,
    marginTop: -8,
  },
  currentWeightLine: {
    position: 'absolute',
    width: 3,
    height: 50,
    backgroundColor: '#1F2937',
    top: '50%',
    marginTop: -25,
    borderRadius: 1.5,
  },
  currentWeightLabel: {
    position: 'absolute',
    top: -10,
    width: 60,
    alignItems: 'center',
    height: 20,
  },
  currentWeightText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    top: '50%',
    marginTop: -THUMB_SIZE / 2,
  },
  thumbOuter: {
    width: '100%',
    height: '100%',
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#320DFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#320DFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  weightLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  weightLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default RulerSlider;
