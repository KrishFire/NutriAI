import React from 'react';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface AppStoreLogoProps {
  size?: number;
  color?: string;
}

const AppStoreLogo: React.FC<AppStoreLogoProps> = ({
  size = 24,
  color = '#007AFF',
}) => {
  // If color is provided and not the default, render simple version
  if (color && color !== '#007AFF') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M17.05 20.28c-.98.95-2.05.88-3.08.42-1.09-.49-2.08-.48-3.24 0-1.45.62-2.2.44-3.06-.42C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.19-.24 2.33-.93 3.63-.84 1.54.12 2.69.72 3.46 1.94-3.17 1.87-2.42 5.99.74 7.16-.38 1.03-.88 2.04-1.91 2.93zM11.97 7.2c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.52-3.74 4.25z"
          fill={color}
        />
      </Svg>
    );
  }

  // Default gradient version
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient
          id="appStoreGradient"
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
        >
          <Stop offset="0%" stopColor="#1EA7FD" />
          <Stop offset="100%" stopColor="#0073E6" />
        </LinearGradient>
      </Defs>
      <G>
        <Path
          d="M17.05 20.28c-.98.95-2.05.88-3.08.42-1.09-.49-2.08-.48-3.24 0-1.45.62-2.2.44-3.06-.42C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.19-.24 2.33-.93 3.63-.84 1.54.12 2.69.72 3.46 1.94-3.17 1.87-2.42 5.99.74 7.16-.38 1.03-.88 2.04-1.91 2.93zM11.97 7.2c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.52-3.74 4.25z"
          fill="url(#appStoreGradient)"
        />
      </G>
    </Svg>
  );
};

export default AppStoreLogo;
