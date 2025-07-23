import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
  style?: any;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1500,
  formatValue = val => Math.round(val).toString(),
  className = '',
  style,
}) => {
  const animatedValue = useSharedValue(0);
  const [displayText, setDisplayText] = React.useState(formatValue(0));

  useEffect(() => {
    animatedValue.value = withSpring(value, {
      damping: 30,
      stiffness: 100,
      mass: 1,
    });
  }, [value]);

  // Update display text based on animated value
  const animatedProps = useAnimatedProps(() => {
    const currentValue = animatedValue.value;
    runOnJS(setDisplayText)(formatValue(currentValue));
    return {};
  });

  return (
    <AnimatedText
      className={className}
      style={style}
      animatedProps={animatedProps}
    >
      {displayText}
    </AnimatedText>
  );
};