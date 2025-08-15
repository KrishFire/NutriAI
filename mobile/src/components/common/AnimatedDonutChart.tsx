import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  useDerivedValue,
  interpolate,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// --- Interfaces ---
interface MacroData {
  key: string;
  value: number; // Percentage (0-100)
  color: string;
}

interface AnimatedDonutChartProps {
  size?: number;
  strokeWidth?: number;
  data: MacroData[];
  animationDuration?: number;
  delayBetweenSegments?: number;
}

// --- Helper Functions ---
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  'worklet';
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// This function describes a simple arc, not a closed wedge.
const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  'worklet';
  const angleDiff = endAngle - startAngle;

  // Epsilon check for floating point safety and to prevent 0-length arcs
  if (Math.abs(angleDiff) < 0.01) {
    return '';
  }

  // SVG arc command fails for a full 360 degrees, so we approximate it
  if (Math.abs(angleDiff) >= 360) {
    endAngle = startAngle + 359.99;
  }

  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const sweepFlag = '1'; // Use '1' for clockwise drawing

  const d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    sweepFlag,
    end.x,
    end.y,
  ].join(' ');
  return d;
};

// --- AnimatedSegment ---
interface AnimatedSegmentProps {
  size: number;
  strokeWidth: number;
  color: string;
  startAngle: Animated.SharedValue<number>;
  endAngle: Animated.SharedValue<number>;
  mountProgress: Animated.SharedValue<number>;
}

const AnimatedSegment: React.FC<AnimatedSegmentProps> = ({
  size,
  strokeWidth,
  color,
  startAngle,
  endAngle,
  mountProgress,
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  const animatedProps = useAnimatedProps(() => {
    'worklet';

    // Interpolate the angles based on mount progress for initial animation
    const currentStartAngle = startAngle.value;
    const currentEndAngle = interpolate(
      mountProgress.value,
      [0, 1],
      [currentStartAngle, endAngle.value]
    );

    // If the segment has no angle difference, return empty path
    const angleDiff = currentEndAngle - currentStartAngle;
    if (Math.abs(angleDiff) < 0.01) {
      return {
        d: '',
        opacity: 0,
      };
    }

    const path = describeArc(
      center,
      center,
      radius,
      currentStartAngle,
      currentEndAngle
    );

    return {
      d: path,
      opacity: mountProgress.value,
    };
  });

  return (
    <AnimatedPath
      fill="transparent"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      animatedProps={animatedProps}
    />
  );
};

// --- AnimatedDonutChart ---
const AnimatedDonutChart: React.FC<AnimatedDonutChartProps> = ({
  size = 200,
  strokeWidth = 30,
  data,
  animationDuration = 800,
  delayBetweenSegments = 150,
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Initial mount animation progress
  const mountProgress = useSharedValue(0);

  // Create a fixed number of animated values (max 10 segments)
  // This ensures hooks are always called in the same order
  const angle0Start = useSharedValue(0);
  const angle0End = useSharedValue(0);
  const angle1Start = useSharedValue(0);
  const angle1End = useSharedValue(0);
  const angle2Start = useSharedValue(0);
  const angle2End = useSharedValue(0);
  const angle3Start = useSharedValue(0);
  const angle3End = useSharedValue(0);
  const angle4Start = useSharedValue(0);
  const angle4End = useSharedValue(0);

  const animatedAngles = [
    { start: angle0Start, end: angle0End },
    { start: angle1Start, end: angle1End },
    { start: angle2Start, end: angle2End },
    { start: angle3Start, end: angle3End },
    { start: angle4Start, end: angle4End },
  ];

  // Initial mount animation
  useEffect(() => {
    mountProgress.value = withTiming(1, {
      duration: animationDuration + data.length * delayBetweenSegments,
    });
  }, []);

  // Update angles when data changes
  useEffect(() => {
    let cumulativeAngle = 0;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    data.forEach((segment, index) => {
      if (index >= animatedAngles.length) return;
      
      const normalizedValue = total > 0 ? segment.value / total : 0;
      const angleSpan = normalizedValue * 360;

      animatedAngles[index].start.value = withSpring(cumulativeAngle, {
        damping: 15,
        stiffness: 150,
      });
      animatedAngles[index].end.value = withSpring(
        cumulativeAngle + angleSpan,
        {
          damping: 15,
          stiffness: 150,
        }
      );

      cumulativeAngle += angleSpan;
    });

    // Reset unused segments
    for (let i = data.length; i < animatedAngles.length; i++) {
      animatedAngles[i].start.value = 0;
      animatedAngles[i].end.value = 0;
    }
  }, [data]);

  // Create the background circle path outside of the render
  const backgroundPath = React.useMemo(() => {
    // Create a full circle path without using the worklet function
    const startAngle = 0;
    const endAngle = 359.999;
    const start = {
      x: center + radius * Math.cos(((endAngle - 90) * Math.PI) / 180.0),
      y: center + radius * Math.sin(((endAngle - 90) * Math.PI) / 180.0),
    };
    const end = {
      x: center + radius * Math.cos(((startAngle - 90) * Math.PI) / 180.0),
      y: center + radius * Math.sin(((startAngle - 90) * Math.PI) / 180.0),
    };
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 0 ${end.x} ${end.y}`;
  }, [center, radius]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* The background circle */}
        <Path
          d={backgroundPath}
          fill="transparent"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
        />

        {/* Animated segments */}
        {data.slice(0, animatedAngles.length).map((segment, index) => (
          <AnimatedSegment
            key={segment.key}
            size={size}
            strokeWidth={strokeWidth}
            color={segment.color}
            startAngle={animatedAngles[index].start}
            endAngle={animatedAngles[index].end}
            mountProgress={mountProgress}
          />
        ))}
      </Svg>
    </View>
  );
};

export default AnimatedDonutChart;
