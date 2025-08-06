import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../constants/theme';

// Consistent header spacing across all screens
export const HEADER_ADDITIONAL_PADDING = 24; // Extra padding after safe area
export const HEADER_CONTENT_HEIGHT = 80; // Total header content height including padding

interface BaseHeaderProps extends ViewProps {
  children: React.ReactNode;
}

const BaseHeader: React.FC<BaseHeaderProps> = ({ style, children, ...props }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="header"
      style={[
        styles.container,
        { paddingTop: insets.top + HEADER_ADDITIONAL_PADDING }, // Safe area + consistent padding
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
  },
});

export default BaseHeader;