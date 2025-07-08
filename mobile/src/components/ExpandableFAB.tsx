import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Animated,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExpandableFABProps {
  onCameraPress: () => void;
  onManualPress: () => void;
}

export default function ExpandableFAB({
  onCameraPress,
  onManualPress,
}: ExpandableFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const handleCameraPress = () => {
    toggleExpand();
    onCameraPress();
  };

  const handleManualPress = () => {
    toggleExpand();
    onManualPress();
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const cameraTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const manualTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -160],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleExpand}
        />
      )}

      {/* Manual Entry Option */}
      <Animated.View
        style={[
          styles.subButton,
          {
            transform: [{ translateY: manualTranslateY }, { scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.subFab, styles.manualFab]}
          onPress={handleManualPress}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Animated.Text style={[styles.label, { opacity }]}>
          Search Food
        </Animated.Text>
      </Animated.View>

      {/* Camera Option */}
      <Animated.View
        style={[
          styles.subButton,
          {
            transform: [{ translateY: cameraTranslateY }, { scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.subFab, styles.cameraFab]}
          onPress={handleCameraPress}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Animated.Text style={[styles.label, { opacity }]}>
          Take Photo
        </Animated.Text>
      </Animated.View>

      {/* Main FAB */}
      <TouchableOpacity
        style={styles.mainFab}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: -1,
  },
  mainFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
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
  },
  subButton: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  subFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cameraFab: {
    backgroundColor: '#4CAF50',
  },
  manualFab: {
    backgroundColor: '#FF9800',
  },
  label: {
    marginRight: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
});
