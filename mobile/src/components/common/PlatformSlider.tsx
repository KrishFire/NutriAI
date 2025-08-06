import React from 'react';
import { Platform, View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

interface PlatformSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
}

// Web-compatible slider component
const WebSlider: React.FC<PlatformSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 1,
  minimumTrackTintColor = '#320DFF',
  maximumTrackTintColor = '#E5E7EB',
  style,
}) => {
  return (
    <View
      style={[{ width: '100%', height: 40, justifyContent: 'center' }, style]}
    >
      <input
        type="range"
        value={value}
        onChange={e => onValueChange(Number(e.target.value))}
        min={minimumValue}
        max={maximumValue}
        step={step}
        style={{
          width: '100%',
          height: 40,
          WebkitAppearance: 'none',
          appearance: 'none',
          background: 'transparent',
          outline: 'none',
          cursor: 'pointer',
        }}
        className="platform-slider"
      />
      <style>{`
        .platform-slider::-webkit-slider-track {
          width: 100%;
          height: 6px;
          background: ${maximumTrackTintColor};
          border-radius: 3px;
        }
        
        .platform-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: ${minimumTrackTintColor};
          border-radius: 50%;
          cursor: pointer;
          margin-top: -9px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .platform-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          background: ${maximumTrackTintColor};
          border-radius: 3px;
        }
        
        .platform-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: ${minimumTrackTintColor};
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .platform-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, 
            ${minimumTrackTintColor} 0%, 
            ${minimumTrackTintColor} ${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%, 
            ${maximumTrackTintColor} ${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%, 
            ${maximumTrackTintColor} 100%);
        }
      `}</style>
    </View>
  );
};

// Cross-platform slider component
const PlatformSlider: React.FC<PlatformSliderProps> = props => {
  if (Platform.OS === 'web') {
    return <WebSlider {...props} />;
  }

  // Native platforms (iOS, Android)
  return (
    <Slider {...props} style={[{ width: '100%', height: 40 }, props.style]} />
  );
};

export default PlatformSlider;
