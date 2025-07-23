import React from 'react';
import { Image, View } from 'react-native';
import { MotiView } from 'moti';

export type BerryVariant = 
  | 'happy' 
  | 'excited' 
  | 'thinking' 
  | 'sad' 
  | 'waving' 
  | 'sleeping' 
  | 'eating' 
  | 'trophy'
  | 'magnify'
  | 'wave'
  | 'celebrate'
  | 'search'
  | 'reading';

interface BerryProps {
  variant: BerryVariant;
  size?: 'sm' | 'md' | 'lg' | 'large';
  animate?: boolean;
  className?: string;
}

const berryAssets: Record<BerryVariant, any> = {
  happy: require('../../assets/berry/berry_wave.png'),
  excited: require('../../assets/berry/berry_celebrate.png'),
  thinking: require('../../assets/berry/berry_reading.png'),
  sad: require('../../assets/berry/berry_sad.png'),
  waving: require('../../assets/berry/berry_wave.png'),
  sleeping: require('../../assets/berry/berry_sleep.png'),
  eating: require('../../assets/berry/berry_wave.png'),
  trophy: require('../../assets/berry/berry_trophy.png'),
  magnify: require('../../assets/berry/berry_search.png'),
  wave: require('../../assets/berry/berry_wave.png'),
  celebrate: require('../../assets/berry/berry_celebrate.png'),
  search: require('../../assets/berry/berry_search.png'),
  reading: require('../../assets/berry/berry_reading.png'),
};

// Placeholder colors for when images don't exist
const placeholderColors: Record<BerryVariant, string> = {
  happy: '#66BB6A',
  excited: '#FFA726',
  thinking: '#42A5F5',
  sad: '#7E57C2',
  waving: '#26A69A',
  sleeping: '#5C6BC0',
  eating: '#FF7043',
  trophy: '#FFD54F',
  magnify: '#42A5F5',
  wave: '#26A69A',
  celebrate: '#FFA726',
  search: '#42A5F5',
  reading: '#8B6BA8',
};

export const Berry: React.FC<BerryProps> = ({
  variant,
  size = 'md',
  animate = false,
  className = '',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 80, height: 80 };
      case 'md':
        return { width: 120, height: 120 };
      case 'lg':
        return { width: 160, height: 160 };
      case 'large':
        return { width: 160, height: 160 };
      default:
        return { width: 120, height: 120 };
    }
  };

  const sizeStyles = getSizeStyles();

  // Animation configurations based on variant
  const getAnimation = () => {
    if (!animate) return {};

    switch (variant) {
      case 'excited':
        return {
          from: { scale: 1, rotate: '0deg' },
          animate: { 
            scale: [1, 1.1, 1],
            rotate: ['0deg', '5deg', '-5deg', '0deg'],
          },
          transition: {
            type: 'timing',
            duration: 1000,
            loop: true,
          },
        };
      case 'thinking':
        return {
          from: { opacity: 1 },
          animate: { opacity: [1, 0.7, 1] },
          transition: {
            type: 'timing',
            duration: 2000,
            loop: true,
          },
        };
      case 'waving':
        return {
          from: { rotate: '0deg' },
          animate: { rotate: ['0deg', '20deg', '0deg', '-20deg', '0deg'] },
          transition: {
            type: 'timing',
            duration: 1500,
            loop: true,
          },
        };
      case 'sleeping':
        return {
          from: { scale: 1 },
          animate: { scale: [1, 1.05, 1] },
          transition: {
            type: 'timing',
            duration: 3000,
            loop: true,
          },
        };
      default:
        return {
          from: { scale: 1 },
          animate: { scale: [1, 1.02, 1] },
          transition: {
            type: 'timing',
            duration: 2000,
            loop: true,
          },
        };
    }
  };

  // Try to render actual image, fallback to placeholder
  const renderBerry = () => {
    try {
      if (berryAssets[variant]) {
        return (
          <Image
            source={berryAssets[variant]}
            style={sizeStyles}
            resizeMode="contain"
          />
        );
      }
    } catch (error) {
      // Image doesn't exist, use placeholder
    }

    // Placeholder circle
    return (
      <View
        className={`rounded-full items-center justify-center ${className}`}
        style={{
          ...sizeStyles,
          backgroundColor: placeholderColors[variant],
        }}
      />
    );
  };

  if (animate) {
    return (
      <MotiView {...getAnimation()}>
        {renderBerry()}
      </MotiView>
    );
  }

  return renderBerry();
};