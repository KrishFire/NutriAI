import React from 'react';
type BerryVariant = 'celebrate' | 'search' | 'sleep' | 'wave' | 'default' | 'reading' | 'sad' | 'shock' | 'sweat' | 'trophy' | 'thumbs-up' | 'party' | 'chef' | 'head' | 'magnify' | 'streak';
type BerrySize = 'tiny' | 'small' | 'medium' | 'large' | 'inline';
interface BerryProps {
  variant?: BerryVariant;
  size?: BerrySize;
  className?: string;
}
export const Berry: React.FC<BerryProps> = ({
  variant = 'default',
  size = 'medium',
  className = ''
}) => {
  const getImageUrl = () => {
    switch (variant) {
      case 'reading':
        return "/berry_reading.png";
      case 'sad':
        return "/berry_sad.png";
      case 'shock':
        return "/berry_shock.png";
      case 'sweat':
        return "/berry_sweat.png";
      case 'trophy':
        return "/berry_trophy.png";
      case 'celebrate':
        return "/berry_celebrate.png";
      case 'search':
        return "/berry_search.png";
      case 'sleep':
        return "/berry_sleep.png";
      case 'thumbs-up':
        return "/berry_wave.png";
      case 'head':
        return "/berry_wave.png";
      case 'magnify':
        return "/berry_search.png";
      case 'streak':
        return "/berry_streak.png";
      case 'wave':
      case 'default':
        return "/berry_wave.png";
      default:
        return "/berry_wave.png";
    }
  };
  const getSize = () => {
    switch (size) {
      case 'tiny':
        return 'w-6 h-6';
      case 'small':
        return 'w-24 h-24';
      case 'large':
        return 'w-48 h-48';
      case 'inline':
        return 'w-10 h-10';
      case 'medium':
      default:
        return 'w-36 h-36';
    }
  };
  return <div className={`${getSize()} ${className}`}>
      <img src={getImageUrl()} alt="Berry mascot" className="w-full h-full object-contain" />
    </div>;
};