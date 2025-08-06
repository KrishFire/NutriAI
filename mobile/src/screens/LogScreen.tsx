import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  useColorScheme,
} from 'react-native';
import { Search, Camera, Mic, Barcode, Star } from 'lucide-react-native';
import AnimatedRN, {
  FadeIn,
  FadeInDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { TAB_BAR_HEIGHT } from '@/utils/tokens';
import { StandardHeader, ScrollAwareHeader } from '../components/common';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { TodayProgressSection } from '../components/TodayProgressSection';
import { useDailyProgress } from '../hooks/useDailyProgress';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { headerHeight } = useHeaderHeight();
  const scrollY = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { data: nutritionData } = useDailyProgress();
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  const [hasShownInitialAnimations, setHasShownInitialAnimations] = useState(false);

  // Create display data with zero defaults (same pattern as HomeScreen)
  const displayData = nutritionData || {
    calories: {
      consumed: 0,
      goal: 2000,
      percentage: 0,
    },
    macros: {
      carbs: { consumed: 0, goal: 250, percentage: 0 },
      protein: { consumed: 0, goal: 150, percentage: 0 },
      fat: { consumed: 0, goal: 65, percentage: 0 },
    },
  };

  // Auto-expand Today's Progress on mount with animation
  useEffect(() => {
    // Use requestAnimationFrame for better performance and reliability
    const animationFrame = requestAnimationFrame(() => {
      setIsProgressExpanded(true);
      setHasShownInitialAnimations(true);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []); // Empty dependency array - runs once on mount

  const handleInputMethod = (method: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (method) {
      case 'camera':
        navigation.navigate('CameraInput' as any);
        break;
      case 'voice':
        navigation.navigate('VoiceInput' as any);
        break;
      case 'barcode':
        navigation.navigate('BarcodeInput' as any);
        break;
      case 'text':
        navigation.navigate('TextInput' as any);
        break;
      case 'favorites':
        navigation.navigate('Favorites' as any);
        break;
    }
  };

  const InputMethodButton = ({
    method,
    icon: Icon,
    label,
    delay = 0,
  }: {
    method: string;
    icon: any;
    label: string;
    delay?: number;
  }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedRN.View
        entering={!hasShownInitialAnimations ? FadeInDown.delay(delay).springify() : undefined}
        style={animatedStyle}
      >
        <Pressable
          onPress={() => handleInputMethod(method)}
          onPressIn={() => {
            scale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          className="bg-primary/5 dark:bg-primary-light/10 rounded-xl p-4 items-center justify-center h-32"
        >
          <View className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary-light/20 items-center justify-center mb-2">
            <Icon size={24} color={isDarkMode ? '#4F46E5' : '#320DFF'} />
          </View>
          <Text className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {label}
          </Text>
        </Pressable>
      </AnimatedRN.View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollAwareHeader scrollY={scrollY}>
        <StandardHeader 
          title="Log Food" 
          subtitle="Add what you ate today" 
        />
      </ScrollAwareHeader>
      
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: headerHeight + 20,
          paddingBottom: TAB_BAR_HEIGHT + 20 
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >

        <View className="px-4">
          {/* Text Input */}
          <AnimatedRN.View entering={FadeInDown.delay(200).springify()}>
            <TouchableOpacity
              onPress={() => handleInputMethod('text')}
              className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex-row items-center pl-5 pr-6 mb-6"
              activeOpacity={0.7}
            >
              <View className="mr-6">
                <Search
                  color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  size={20}
                />
              </View>
              <Text className="text-gray-500 dark:text-gray-400 text-base">
                Describe your meal...
              </Text>
            </TouchableOpacity>
          </AnimatedRN.View>

          {/* Quick Access Methods */}
          <AnimatedRN.View 
            entering={!hasShownInitialAnimations ? FadeInDown.delay(300).springify() : undefined}
            className="mb-8"
          >
            <View className="flex-row flex-wrap -mx-1">
              <View className="w-1/2 px-2 pb-2">
                <InputMethodButton
                  method="camera"
                  icon={Camera}
                  label="Camera"
                  delay={0}
                />
              </View>
              <View className="w-1/2 px-2 pb-2">
                <InputMethodButton
                  method="voice"
                  icon={Mic}
                  label="Voice"
                  delay={50}
                />
              </View>
              <View className="w-1/2 px-2 pb-2">
                <InputMethodButton
                  method="barcode"
                  icon={Barcode}
                  label="Barcode"
                  delay={100}
                />
              </View>
              <View className="w-1/2 px-2 pb-2">
                <InputMethodButton
                  method="favorites"
                  icon={Star}
                  label="Favorites"
                  delay={150}
                />
              </View>
            </View>
          </AnimatedRN.View>


          {/* Today's Progress with circular rings */}
          <TodayProgressSection
            calories={displayData.calories}
            carbs={displayData.macros.carbs}
            protein={displayData.macros.protein}
            fat={displayData.macros.fat}
            animate={true}
            isExpanded={isProgressExpanded}
            onToggle={() => setIsProgressExpanded(!isProgressExpanded)}
          />

          {/* Recent Logs */}
          <AnimatedRN.View
            entering={FadeInDown.delay(500).springify()}
            className="mb-8"
          >
            <Text className="font-semibold text-gray-900 dark:text-white mb-4">
              Recent Logs
            </Text>
            <View className="space-y-3">
              {/* Placeholder for recent items - will be populated with real data */}
              <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl py-10 px-4">
                <View className="items-center">
                  <View className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
                    <Camera size={32} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
                  </View>
                  <Text className="text-[15.3px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                    No recent logs
                  </Text>
                  <Text className="text-[13.6px] text-gray-400 dark:text-gray-500 text-center">
                    Your recently logged meals will appear here
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedRN.View>

          {/* Suggested Items */}
          <AnimatedRN.View
            entering={FadeInDown.delay(600).springify()}
            className="mb-8"
          >
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">
              Suggested for You
            </Text>
            <View className="bg-primary/5 dark:bg-primary-light/10 p-6 rounded-xl" style={{ minHeight: 200 }}>
              <Text className="text-[13.6px] font-semibold text-primary dark:text-primary-light mb-3">
                Try our AI Assistant
              </Text>
              <Text className="text-[13.6px] text-gray-700 dark:text-gray-300 mb-8 leading-6">
                Describe your meal in natural language and our AI will analyze
                the nutrition for you.
              </Text>
              <TouchableOpacity
                onPress={() => handleInputMethod('text')}
                className="bg-primary dark:bg-primary-light rounded-full self-start items-center justify-center"
                style={{ width: 109, height: 48, paddingHorizontal: 24 }}
                activeOpacity={0.8}
              >
                <Text className="text-white text-[13.6px] font-semibold">Try Now</Text>
              </TouchableOpacity>
            </View>
          </AnimatedRN.View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
