import React, { useEffect, useState } from 'react';
import { Text, View, TextStyle } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { Easing } from 'react-native-reanimated';

interface KineticTypographyProps {
  text: string;
  className?: string;
  style?: TextStyle;
  effect?: 'bounce' | 'wave' | 'stagger' | 'shake';
  duration?: number;
  delay?: number;
  repeat?: number | boolean;
}

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  text,
  className = '',
  style,
  effect = 'stagger',
  duration = 500,
  delay = 0,
  repeat = false,
}) => {
  const [characters, setCharacters] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setCharacters(text.split(''));
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  const getAnimationProps = (index: number) => {
    switch (effect) {
      case 'bounce':
        return {
          from: { translateY: 0 },
          animate: { translateY: [0, -15, 0] },
          transition: {
            type: 'timing',
            duration,
            delay: index * 50,
            easing: Easing.out(Easing.cubic),
            loop: repeat === true ? -1 : (repeat as number),
          },
        };

      case 'wave':
        return {
          from: { translateY: 0 },
          animate: { translateY: [0, -10, 0] },
          transition: {
            type: 'timing',
            duration,
            delay: index * 30,
            easing: Easing.inOut(Easing.sin),
            loop: repeat === true ? -1 : (repeat as number),
          },
        };

      case 'shake':
        return {
          from: { translateX: 0 },
          animate: { translateX: [0, -5, 5, -5, 5, 0] },
          transition: {
            type: 'timing',
            duration,
            delay: index * 20,
            easing: Easing.inOut(Easing.cubic),
            loop: repeat === true ? -1 : (repeat as number),
          },
        };

      case 'stagger':
      default:
        return {
          from: { opacity: 0, translateY: 10 },
          animate: { opacity: 1, translateY: 0 },
          transition: {
            type: 'timing',
            duration,
            delay: index * 50,
            easing: Easing.out(Easing.cubic),
          },
        };
    }
  };

  if (!isAnimating && effect === 'stagger') {
    return (
      <Text className={className} style={style}>
        {text}
      </Text>
    );
  }

  return (
    <View className="flex-row flex-wrap">
      {characters.map((char, index) => {
        const animProps = getAnimationProps(index);

        // Handle spaces
        if (char === ' ') {
          return (
            <Text key={`${index}-space`} style={style}>
              {' '}
            </Text>
          );
        }

        return (
          <MotiText
            key={`${index}-${char}`}
            {...animProps}
            className={className}
            style={style}
          >
            {char}
          </MotiText>
        );
      })}
    </View>
  );
};
