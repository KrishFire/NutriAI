import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingActionButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function FloatingActionButton({
  onPress,
  style,
  icon = 'camera',
  size = 28,
  color = '#FFFFFF',
  backgroundColor = '#007AFF',
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel="Open camera to log meal"
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: 80, // Above bottom tab bar
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 999,
  },
});
