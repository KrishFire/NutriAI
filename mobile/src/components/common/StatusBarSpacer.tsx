import React from 'react';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StatusBarSpacerProps {
  backgroundColor?: string;
}

export function StatusBarSpacer({ backgroundColor = '#FFFFFF' }: StatusBarSpacerProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: insets.top,
        backgroundColor,
        zIndex: 100,
      }}
    />
  );
}