import React from 'react';
import { TextInput as RNTextInput, View, Text } from 'react-native';
import { hapticFeedback } from '../../utils/haptics';

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: RNTextInput['props']['keyboardType'];
  autoCapitalize?: RNTextInput['props']['autoCapitalize'];
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  className = '',
}) => {
  const handleFocus = async () => {
    await hapticFeedback.selection();
  };

  return (
    <View className={`space-y-2 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      )}

      <View
        className={`
          bg-white dark:bg-gray-800 
          border rounded-xl
          ${
            error
              ? 'border-error'
              : 'border-gray-300 dark:border-gray-600 focus:border-primary'
          }
          ${!editable ? 'opacity-50' : ''}
        `}
      >
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={handleFocus}
          className={`
            px-4 py-3 text-base
            text-gray-900 dark:text-white
            ${multiline ? 'min-h-[100px]' : ''}
          `}
          style={{
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
      </View>

      {error && <Text className="text-sm text-error">{error}</Text>}
    </View>
  );
};
