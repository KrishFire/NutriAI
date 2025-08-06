import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { HEADER_CONTENT_HEIGHT } from './BaseHeader';

interface ScrollAwareHeaderProps {
  children: React.ReactNode;
  scrollY: Animated.Value;
}

const ScrollAwareHeader: React.FC<ScrollAwareHeaderProps> = ({ 
  children, 
  scrollY,
}) => {
  const insets = useSafeAreaInsets();
  
  // Interpolate scroll position to show/hide header background
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerShadow = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 0.1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Simple white block that appears on scroll - no content */}
      <Animated.View
        style={[
          styles.animatedBackground,
          {
            opacity: headerOpacity,
            shadowOpacity: headerShadow,
            height: insets.top + HEADER_CONTENT_HEIGHT, // Cover safe area + header height
          },
        ]}
      />
      
      {/* Header content */}
      <View style={styles.headerContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    position: 'relative',
  },
});

export default ScrollAwareHeader;