import React from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.25;

interface SwipeableRowProps {
  onDelete: () => Promise<void> | void;
  disabled?: boolean;
  confirmMessage?: string;
  children: React.ReactNode;
}

export default function SwipeableRow({
  onDelete,
  disabled = false,
  confirmMessage = 'Delete this meal?',
  children,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const height = useSharedValue(-1); // -1 means auto height initially

  const animateOut = (callback: () => void) => {
    'worklet';
    // Animate row sliding out to the left and fading
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 }, () => {
      opacity.value = withTiming(0, { duration: 200 }, () => {
        height.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(callback)();
        });
      });
    });
  };

  const handleDelete = () => {
    // Animate out first, then delete
    animateOut(async () => {
      await onDelete();
    });
  };

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      if (!disabled) {
        translateX.value = Math.min(0, ctx.startX + event.translationX);
      }
    },
    onEnd: (event) => {
      if (disabled) return;
      
      // If swiped past 60% of screen width, delete immediately
      if (translateX.value < -SCREEN_WIDTH * 0.6) {
        runOnJS(handleDelete)();
      } 
      // If swiped past threshold but not all the way, snap to delete position
      else if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 0.3);
      } 
      // Otherwise snap back
      else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value === -1 ? 'auto' : height.value,
    overflow: 'hidden',
  }));

  const bgIconOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -translateX.value / (SCREEN_WIDTH * 0.2))),
  }));

  return (
    <Animated.View style={containerStyle}>
      <View style={{ position: 'relative' }}>
        {/* Background with Trash Icon */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 0,
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: '#EF4444',
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: 16,
            },
            bgIconOpacity,
          ]}
        >
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              padding: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Trash2 color="white" size={22} />
          </TouchableOpacity>
        </Animated.View>

        {/* Swipeable Content */}
        <PanGestureHandler onGestureEvent={gestureHandler} enabled={!disabled}>
          <Animated.View style={animatedStyle}>
            {children}
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Animated.View>
  );
}