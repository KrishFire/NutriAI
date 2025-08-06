// This is an alternative implementation using a custom Apple logo SVG
// Use this only if the official AppleButton doesn't meet your design requirements
// Note: Always ensure compliance with Apple's Human Interface Guidelines

import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import AppleLogo from '../../components/icons/AppleLogo';

// Custom Apple button implementation
const CustomAppleButton = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: '100%',
          height: 56,
          backgroundColor: '#000000',
          borderRadius: 28,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <AppleLogo width={20} height={24} color="#FFFFFF" />
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 17,
          fontWeight: '600',
          marginLeft: 8,
          // Use San Francisco font on iOS for authenticity
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        }}
      >
        Continue with Apple
      </Text>
    </TouchableOpacity>
  );
};

// Usage in AuthScreen:
// Replace the AppleButton with:
// <CustomAppleButton
//   onPress={() => handleSocialSignIn('apple')}
//   style={styles.appleButton}
// />

export default CustomAppleButton;
