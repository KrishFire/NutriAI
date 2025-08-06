import React, { useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Dimensions } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withDelay,
  useSharedValue,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Canvas, Circle, Group, Paint } from '@shopify/react-native-skia';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { PageTransition } from '../../components/ui/PageTransition';
import { Berry } from '../../components/ui/Berry';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SubscriptionSuccess'
>;

// Confetti Particle Component
const ConfettiParticle = ({ delay = 0 }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSequence(
        withSpring(-height * 0.3, { damping: 5, stiffness: 80 }),
        withSpring(height * 1.2, { damping: 8, stiffness: 40 })
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withSpring(Math.random() * 100 - 50, { damping: 3 }),
          withSpring(Math.random() * -100 + 50, { damping: 3 })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(delay + 1500, withSpring(0, { damping: 15 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${Math.random() * 360}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA726',
    '#7E57C2',
    '#66BB6A',
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: 2,
          left: Math.random() * width,
          top: height * 0.3,
        },
        animatedStyle,
      ]}
    />
  );
};

export const SubscriptionSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Trigger success haptic
    hapticFeedback.success();
  }, []);

  const handleContinue = async () => {
    await hapticFeedback.impact();

    // Reset navigation stack to go back to main app
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  const features = [
    'Advanced Analytics & Insights',
    'Unlimited History & Data',
    'Cloud Backup & Sync',
    'Custom Recipe Creation',
    'Priority Support',
  ];

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 p-6">
          {/* Confetti Effect */}
          <View className="absolute inset-0" pointerEvents="none">
            {Array(15)
              .fill(0)
              .map((_, i) => (
                <ConfettiParticle key={i} delay={i * 100} />
              ))}
          </View>

          <View className="flex-1 items-center justify-center">
            {/* Berry Mascot */}
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 200,
                delay: 200,
              }}
              className="mb-8"
            >
              <Berry variant="trophy" size="lg" animate />
            </MotiView>

            {/* Title */}
            <Animated.Text
              entering={FadeInDown.delay(400).duration(600)}
              className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-3"
            >
              Welcome to Premium!
            </Animated.Text>

            {/* Description */}
            <Animated.Text
              entering={FadeInDown.delay(500).duration(600)}
              className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs"
            >
              You now have unlimited access to all premium features.
            </Animated.Text>

            {/* Features List */}
            <Animated.View
              entering={FadeInUp.delay(600).duration(600)}
              className="w-full space-y-4 mb-8"
            >
              {features.map((feature, index) => (
                <MotiView
                  key={index}
                  from={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 700 + index * 100 }}
                  className="flex-row items-center"
                >
                  <View className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primaryDark/20 items-center justify-center mr-4">
                    <Ionicons name="flash" size={20} color="#320DFF" />
                  </View>
                  <Text className="text-gray-800 dark:text-gray-200">
                    {feature}
                  </Text>
                </MotiView>
              ))}
            </Animated.View>
          </View>

          {/* Continue Button */}
          <Animated.View entering={FadeInUp.delay(1200).duration(600)}>
            <Button onPress={handleContinue} variant="primary" fullWidth>
              Continue to App
            </Button>
          </Animated.View>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
};
