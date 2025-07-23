import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import Animated, {
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useAuth } from '../../hooks/useAuth';
import tokens from '../../../tokens.json';

export default function OnboardingCompleteScreen() {
  const navigation = useNavigation();
  const { completeOnboarding } = useAuth();
  
  const scale = useSharedValue(0);
  const berryScale = useSharedValue(0);

  useEffect(() => {
    hapticFeedback.success();
    
    // Animate in
    scale.value = withSpring(1, { damping: 15 });
    berryScale.value = withDelay(200, withSpring(1, { damping: 12 }));
  }, []);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const berryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: berryScale.value }],
  }));

  const handleGetStarted = async () => {
    hapticFeedback.success();
    await completeOnboarding();
    // Navigation will be handled by the auth state change
  };

  // Confetti particle component
  const ConfettiParticle = ({ delay }: { delay: number }) => {
    return (
      <MotiView
        from={{
          opacity: 0,
          translateY: -20,
          translateX: 0,
          rotate: '0deg',
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          translateY: [0, 50, 100, 150],
          translateX: [0, 20, -10, 30],
          rotate: '360deg',
        }}
        transition={{
          type: 'timing',
          duration: 2000,
          delay,
          loop: true,
        }}
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          backgroundColor: ['#320DFF', '#4F46E5', '#818CF8', '#66BB6A', '#FFA726'][
            Math.floor(Math.random() * 5)
          ],
          borderRadius: 5,
          top: '20%',
          left: `${20 + Math.random() * 60}%`,
        }}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Confetti particles */}
        <View className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <ConfettiParticle key={i} delay={i * 100} />
          ))}
        </View>

        {/* Progress indicator - Complete */}
        <View className="flex-row space-x-2 mb-12 absolute top-12 left-6 right-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              className="h-1 flex-1 rounded-full bg-primary"
            />
          ))}
        </View>

        {/* Berry mascot */}
        <Animated.View style={berryStyle} className="mb-6">
          <Image
            source={require('../../../assets/berry/berry-trophy.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Success checkmark */}
        <Animated.View
          style={checkmarkStyle}
          className="w-20 h-20 rounded-full bg-success items-center justify-center mb-8"
        >
          <Check size={40} color="#FFF" />
        </Animated.View>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
        >
          <Text className="text-3xl font-bold text-center mb-4">
            You're all set!
          </Text>
        </MotiView>

        {/* Subtitle */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
        >
          <Text className="text-gray-600 text-center mb-12 text-lg">
            Your personalized nutrition journey starts now. Let's make healthy eating simple and fun!
          </Text>
        </MotiView>

        {/* Features summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600 }}
          className="w-full bg-gray-50 rounded-2xl p-6 mb-12"
        >
          <Text className="text-sm font-medium text-gray-700 mb-3">With NutriAI you can:</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
              <Text className="text-sm text-gray-600">Track meals with AI-powered recognition</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
              <Text className="text-sm text-gray-600">Monitor your nutrition goals daily</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
              <Text className="text-sm text-gray-600">Get personalized insights and tips</Text>
            </View>
          </View>
        </MotiView>

        {/* Get started button */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 700 }}
          className="w-full"
        >
          <TouchableOpacity
            onPress={handleGetStarted}
            className="bg-primary rounded-2xl py-4 px-6"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Get Started
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}