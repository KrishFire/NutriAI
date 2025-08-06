import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface InstagramLogoProps {
  size?: number;
  color?: string;
}

const InstagramLogo: React.FC<InstagramLogoProps> = ({
  size = 24,
  color = '#E4405F',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        ry="5"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <Circle
        cx="12"
        cy="12"
        r="4"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <Circle cx="17.5" cy="6.5" r="1.5" fill={color} />
    </Svg>
  );
};

export default InstagramLogo;
