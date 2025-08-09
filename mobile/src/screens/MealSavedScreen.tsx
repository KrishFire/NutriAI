import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CheckCircle } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { hapticFeedback } from '../utils/haptics';
import { MotiView } from 'moti';
import tokens from '../utils/tokens';

type RouteParams = {
  MealSaved: {
    meal: any;
  };
};

export default function MealSavedScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'MealSaved'>>();
  const { meal } = route.params || {};

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const berryScale = useSharedValue(0);

  useEffect(() => {
    hapticFeedback.success();

    // Animate in
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 300 });
    berryScale.value = withDelay(200, withSpring(1, { damping: 12 }));

    // Auto-dismiss after 2 seconds and navigate to Home
    const timer = setTimeout(() => {
      // Navigate to Home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as any }],
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const berryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: berryScale.value }],
  }));

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
          easing: Easing.out(Easing.quad),
        }}
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          backgroundColor: [
            '#320DFF',
            '#4F46E5',
            '#818CF8',
            '#66BB6A',
            '#FFA726',
          ][Math.floor(Math.random() * 5)],
          borderRadius: 5,
          top: '30%',
          left: `${20 + Math.random() * 60}%`,
        }}
      />
    );
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={() => navigation.goBack()}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <Animated.View
          style={containerStyle}
          className="bg-white rounded-3xl p-6 w-11/12 max-w-sm relative overflow-hidden"
        >
          {/* Confetti particles */}
          <View className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <ConfettiParticle key={i} delay={i * 100} />
            ))}
          </View>

          {/* Glass morphism effect */}
          <View className="absolute inset-0 bg-primary/5 rounded-3xl" />

          <View className="items-center">
            {/* Berry mascot */}
            <Animated.View style={berryStyle} className="mb-4">
              <Image
                source={require('../../assets/berry/berry-excited.png')}
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Success icon */}
            <MotiView
              from={{ scale: 0, rotate: '0deg' }}
              animate={{ scale: 1, rotate: '360deg' }}
              transition={{
                type: 'spring',
                damping: 12,
                delay: 300,
              }}
              className="w-16 h-16 rounded-full bg-success/20 items-center justify-center mb-4"
            >
              <CheckCircle size={32} color={tokens.colors.success} />
            </MotiView>

            {/* Title */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 400 }}
            >
              <Text className="text-2xl font-bold mb-2">Meal Saved!</Text>
            </MotiView>

            {/* Subtitle */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 500 }}
            >
              <Text className="text-gray-600 text-center mb-4">
                Your {meal?.type || 'meal'} has been added to your food log
              </Text>
            </MotiView>

            {/* Nutrition summary */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 600 }}
              className="bg-gray-50 w-full p-4 rounded-2xl mb-6"
            >
              <Text className="text-lg font-semibold text-center mb-2">
                {meal?.calories || 542} calories
              </Text>
              <View className="flex-row justify-center space-x-4">
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Protein</Text>
                  <Text className="font-medium">{meal?.protein || 28}g</Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Carbs</Text>
                  <Text className="font-medium">{meal?.carbs || 62}g</Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Fat</Text>
                  <Text className="font-medium">{meal?.fat || 22}g</Text>
                </View>
              </View>
            </MotiView>

            {/* Continue button */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 700 }}
              className="w-full"
            >
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.selection();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' as any }],
                  });
                }}
                className="bg-primary rounded-2xl py-4 px-6"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Continue
                </Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
