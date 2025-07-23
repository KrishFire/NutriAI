import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StreakCelebrationProps {
  isVisible: boolean;
  streakCount: number;
  onDismiss: () => void;
  isPersonalBest?: boolean;
  soundEnabled?: boolean;
}

interface MilestoneConfig {
  emoji: string;
  message: string;
  particleCount: number;
  duration: number;
  colors: string[];
}

const MILESTONE_CONFIG: Record<number, MilestoneConfig> = {
  7: {
    emoji: '🔥',
    message: "One week strong! You're building a habit!",
    particleCount: 20,
    duration: 2000,
    colors: ['#FF6B6B', '#FFA500', '#FFD700'],
  },
  14: {
    emoji: '💪',
    message: 'Two weeks of consistency! Keep it up!',
    particleCount: 30,
    duration: 3000,
    colors: ['#FF6B6B', '#4ADE80', '#FFA500', '#FFD700'],
  },
  21: {
    emoji: '🌟',
    message: '21 days - a new habit is born!',
    particleCount: 40,
    duration: 3500,
    colors: ['#FF6B6B', '#4ADE80', '#3B82F6', '#FFA500', '#FFD700'],
  },
  30: {
    emoji: '🎯',
    message: '30 day champion! You did it!',
    particleCount: 50,
    duration: 4000,
    colors: ['#FF6B6B', '#4ADE80', '#3B82F6', '#FFA500', '#FFD700', '#A855F7'],
  },
  50: {
    emoji: '🏆',
    message: '50 days of dedication! Incredible!',
    particleCount: 60,
    duration: 4500,
    colors: ['#FF6B6B', '#4ADE80', '#3B82F6', '#FFA500', '#FFD700', '#A855F7'],
  },
  100: {
    emoji: '💯',
    message: 'Century streak! You are unstoppable!',
    particleCount: 80,
    duration: 5000,
    colors: ['#FF6B6B', '#4ADE80', '#3B82F6', '#FFA500', '#FFD700', '#A855F7', '#EC4899'],
  },
  365: {
    emoji: '👑',
    message: 'One year warrior! Legendary achievement!',
    particleCount: 120,
    duration: 8000,
    colors: ['#FF6B6B', '#4ADE80', '#3B82F6', '#FFA500', '#FFD700', '#A855F7', '#EC4899', '#14B8A6'],
  },
};

// Individual confetti particle component
const ConfettiParticle: React.FC<{
  delay: number;
  startX: number;
  startY: number;
  color: string;
  duration: number;
}> = ({ delay, startX, startY, color, duration }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Random physics parameters
    const velocityX = (Math.random() - 0.5) * 300;
    const gravity = 980;
    const airResistance = 0.95;

    // Start animation after delay
    translateX.value = withTiming(0, { duration: delay }, () => {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1);
      
      // Horizontal movement with air resistance
      translateX.value = withTiming(
        velocityX * airResistance,
        { duration, easing: Easing.out(Easing.exp) }
      );
      
      // Vertical movement with gravity
      translateY.value = withTiming(
        SCREEN_HEIGHT * 1.5,
        { duration, easing: Easing.in(Easing.quad) }
      );
      
      // Rotation
      rotate.value = withRepeat(
        withTiming(360, { duration: duration / 2, easing: Easing.linear }),
        -1,
        false
      );
      
      // Fade out at the end
      opacity.value = withTiming(0, { 
        duration: duration * 0.3, 
        easing: Easing.in(Easing.quad) 
      }, () => {
        translateY.value = 0;
        translateX.value = 0;
        rotate.value = 0;
        scale.value = 0;
      });
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ] as any,
    opacity: opacity.value,
  }));

  // Random particle shape
  const size = Math.random() * 8 + 6;
  const isSquare = Math.random() > 0.5;

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          position: 'absolute',
          left: startX,
          top: startY,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: isSquare ? 2 : size / 2,
        },
      ]}
    />
  );
};

// Confetti container component
const Confetti: React.FC<{ config: MilestoneConfig }> = ({ config }) => {
  const particles = useMemo(() => {
    return Array.from({ length: config.particleCount }, (_, i) => ({
      id: i,
      delay: Math.random() * 500,
      startX: SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100,
      startY: SCREEN_HEIGHT * 0.3,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
    }));
  }, [config]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          delay={particle.delay}
          startX={particle.startX}
          startY={particle.startY}
          color={particle.color}
          duration={config.duration}
        />
      ))}
    </View>
  );
};

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  isVisible,
  streakCount,
  onDismiss,
  isPersonalBest = false,
  soundEnabled = false,
}) => {
  const milestone = useMemo(() => MILESTONE_CONFIG[streakCount], [streakCount]);
  const soundRef = useRef<Audio.Sound | null>(null);
  const modalScale = useSharedValue(0.95);
  const modalOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(1);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    if (isVisible && milestone) {
      // Trigger haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Modal entrance animation
      modalScale.value = withSpring(1, { damping: 15 });
      modalOpacity.value = withTiming(1, { duration: 300 });

      // Emoji pulse animation
      emojiScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Glow animation
      glowIntensity.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      // Play sound if enabled
      // TODO: Add celebration.mp3 to assets/sounds/ directory
      // if (soundEnabled) {
      //   playSound();
      // }
    }

    return () => {
      // Cleanup sound
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [isVisible, milestone, soundEnabled]);

  const playSound = async () => {
    try {
      // Configure audio to respect silent mode (default behavior)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
      });

      // TODO: Add celebration.mp3 to assets/sounds/ directory
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../../assets/sounds/celebration.mp3'),
      //   { shouldPlay: true, volume: 0.5 }
      // );
      
      // soundRef.current = sound;
      console.log('Sound playback disabled - celebration.mp3 asset not yet added');
    } catch (error) {
      console.log('Error playing celebration sound:', error);
    }
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value * 0.3,
  }));

  if (!isVisible || !milestone) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        
        <Confetti config={milestone} />
        
        <Animated.View 
          style={[styles.modalContainer, modalAnimatedStyle, glowAnimatedStyle]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.Text style={[styles.emoji, emojiAnimatedStyle]}>
              {milestone.emoji}
            </Animated.Text>
            
            <Text style={styles.title}>
              {streakCount}-Day Streak!
            </Text>
            
            <Text style={styles.message}>
              {milestone.message}
            </Text>
            
            {isPersonalBest && (
              <Text style={styles.personalBest}>
                🎉 New Personal Best! 🎉
              </Text>
            )}
            
            <Pressable 
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minWidth: 300,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  personalBest: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 150,
  },
  buttonPressed: {
    backgroundColor: '#0051D5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  particle: {
    position: 'absolute',
  },
});