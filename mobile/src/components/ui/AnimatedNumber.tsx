import React, { useEffect, useRef } from 'react';
import { Text } from 'react-native';

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
  const [displayValue, setDisplayValue] = React.useState(0);
  const startValueRef = useRef(0);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    // Always start from 0 for initial animation
    const isInitialAnimation = startValueRef.current === 0 && value > 0;
    if (isInitialAnimation) {
      startValueRef.current = 0;
      setDisplayValue(0);
    } else {
      startValueRef.current = displayValue;
    }
    
    startTimeRef.current = Date.now();
    const targetValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Custom easing: starts fast, slows down beautifully
      // Using ease-out-quart for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);

      const currentValue =
        startValueRef.current + (targetValue - startValueRef.current) * eased;
      setDisplayValue(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  return (
    <Text className={className} style={style}>
      {formatValue(displayValue)}
    </Text>
  );
};
