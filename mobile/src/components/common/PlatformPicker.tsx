import React from 'react';
import { Platform, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface PickerItem {
  label: string;
  value: string | number;
}

interface PlatformPickerProps {
  selectedValue: string | number;
  onValueChange: (value: string | number, index: number) => void;
  items: PickerItem[];
  style?: any;
  enabled?: boolean;
}

// Web-compatible picker component
const WebPicker: React.FC<PlatformPickerProps> = ({
  selectedValue,
  onValueChange,
  items,
  style,
  enabled = true,
}) => {
  return (
    <View style={[{ width: '100%' }, style]}>
      <select
        value={selectedValue}
        onChange={e => {
          const value = e.target.value;
          const index = items.findIndex(
            item => item.value.toString() === value
          );
          onValueChange(value, index);
        }}
        disabled={!enabled}
        style={{
          width: '100%',
          height: 44,
          fontSize: 16,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          cursor: enabled ? 'pointer' : 'not-allowed',
          appearance: 'none',
          WebkitAppearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '20px',
          paddingRight: '36px',
        }}
        className="platform-picker"
      >
        {items.map(item => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <style>{`
        .platform-picker:focus {
          outline: none;
          border-color: #320DFF;
          box-shadow: 0 0 0 3px rgba(50, 13, 255, 0.1);
        }
      `}</style>
    </View>
  );
};

// Cross-platform picker component
const PlatformPicker: React.FC<PlatformPickerProps> = props => {
  if (Platform.OS === 'web') {
    return <WebPicker {...props} />;
  }

  // Native platforms (iOS, Android)
  return (
    <Picker
      selectedValue={props.selectedValue}
      onValueChange={props.onValueChange}
      style={[{ width: '100%' }, props.style]}
      enabled={props.enabled}
    >
      {props.items.map(item => (
        <Picker.Item key={item.value} label={item.label} value={item.value} />
      ))}
    </Picker>
  );
};

export default PlatformPicker;
