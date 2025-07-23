import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Camera, Mic, Barcode, Star } from 'lucide-react-native';
import Animated, {
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

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
    delay = 0 
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
      <Animated.View
        entering={FadeInDown.delay(delay).springify()}
        style={[animatedStyle, { flex: 1, marginHorizontal: 4 }]}
      >
        <Pressable
          onPress={() => handleInputMethod(method)}
          onPressIn={() => {
            scale.value = withSpring(0.95);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          className="bg-primary/5 dark:bg-primary-light/10 rounded-xl p-4 items-center"
        >
          <View className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary-light/20 items-center justify-center mb-2">
            <Icon size={18} className="text-primary dark:text-primary-light" />
          </View>
          <Text className="text-xs text-gray-700 dark:text-gray-300">{label}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <Animated.Text 
            entering={FadeIn.duration(300)}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Log Food
          </Animated.Text>
          <Animated.Text 
            entering={FadeIn.delay(100).duration(300)}
            className="text-gray-600 dark:text-gray-400"
          >
            Add what you ate today
          </Animated.Text>
        </View>

        <View className="px-4">
          {/* Text Input */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <TouchableOpacity
              onPress={() => handleInputMethod('text')}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-full py-3 px-5 pl-12 mb-6"
              activeOpacity={0.7}
            >
              <Search 
                className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400" 
                size={18} 
              />
              <Text className="text-gray-500 dark:text-gray-400">
                Describe your meal...
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Add Methods */}
          <View className="flex-row mb-6">
            <InputMethodButton 
              method="camera" 
              icon={Camera} 
              label="Camera" 
              delay={300} 
            />
            <InputMethodButton 
              method="voice" 
              icon={Mic} 
              label="Voice" 
              delay={350} 
            />
            <InputMethodButton 
              method="barcode" 
              icon={Barcode} 
              label="Barcode" 
              delay={400} 
            />
            <InputMethodButton 
              method="favorites" 
              icon={Star} 
              label="Favorites" 
              delay={450} 
            />
          </View>

          {/* Quick Add Meals */}
          <Animated.View entering={FadeInDown.delay(500).springify()} className="mb-6">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">
              Quick Add
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mx-[-16px] px-4"
            >
              {mealOptions.map((meal, index) => {
                const scale = useSharedValue(1);
                const animatedStyle = useAnimatedStyle(() => ({
                  transform: [{ scale: scale.value }],
                }));

                return (
                  <Animated.View
                    key={meal}
                    entering={FadeInDown.delay(600 + index * 50).springify()}
                    style={animatedStyle}
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync();
                        // Handle quick add meal
                      }}
                      onPressIn={() => {
                        scale.value = withSpring(0.95);
                      }}
                      onPressOut={() => {
                        scale.value = withSpring(1);
                      }}
                      className="bg-primary/10 dark:bg-primary-light/20 px-5 py-2.5 rounded-full mr-3"
                    >
                      <Text className="text-sm text-primary dark:text-primary-light font-medium">
                        {meal}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Recent Logs Placeholder */}
          <Animated.View entering={FadeInDown.delay(700).springify()} className="mb-6">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">
              Recent Logs
            </Text>
            <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 items-center">
              <View className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
                <Camera size={24} className="text-gray-400 dark:text-gray-500" />
              </View>
              <Text className="text-gray-500 dark:text-gray-400 text-center mb-2">
                No recent logs
              </Text>
              <Text className="text-sm text-gray-400 dark:text-gray-500 text-center">
                Your recently logged meals will appear here
              </Text>
            </View>
          </Animated.View>

          {/* Suggested Items */}
          <Animated.View entering={FadeInDown.delay(800).springify()} className="mb-6">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">
              Suggested for You
            </Text>
            <View className="bg-primary/5 dark:bg-primary-light/10 p-4 rounded-xl">
              <Text className="text-sm font-medium text-primary dark:text-primary-light mb-2">
                Try our AI Assistant
              </Text>
              <Text className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Describe your meal in natural language and our AI will analyze
                the nutrition for you.
              </Text>
              <TouchableOpacity
                onPress={() => handleInputMethod('text')}
                className="bg-primary dark:bg-primary-light px-4 py-2 rounded-full self-start"
                activeOpacity={0.8}
              >
                <Text className="text-white text-sm font-medium">
                  Try Now
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}