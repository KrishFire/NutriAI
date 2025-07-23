import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  withSpring,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleSubmit = async () => {
    setError(null);

    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Simulate API call
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    navigation.goBack();
  };

  const handleBackToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Login');
  };

  if (isSubmitted) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <Animated.View 
          entering={FadeIn.duration(300)}
          className="flex-1 items-center justify-center px-6"
        >
          <Animated.View 
            entering={FadeIn.delay(100).springify()}
            className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-light/20 items-center justify-center mb-4"
          >
            <CheckCircle size={32} className="text-primary dark:text-primary-light" />
          </Animated.View>
          
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Check Your Email
          </Text>
          
          <Text className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
            We've sent a password reset link to{' '}
            <Text className="font-medium">{email}</Text>. Please check your
            inbox.
          </Text>
          
          <TouchableOpacity
            onPress={handleBackToLogin}
            className="bg-primary dark:bg-primary-light px-8 py-3 rounded-full"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">
              Back to Login
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-4">
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4"
                activeOpacity={0.7}
              >
                <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
              </TouchableOpacity>
              
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Reset Password
              </Text>
            </View>

            <Text className="text-gray-600 dark:text-gray-400 mb-6">
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3.5 z-10">
                  <Mail size={18} className="text-gray-500 dark:text-gray-400" />
                </View>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View 
                entering={FadeIn}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4"
              >
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </Animated.View>
            )}

            {/* Submit Button */}
            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading || !email}
                className={`w-full h-12 rounded-full items-center justify-center ${
                  isLoading || !email
                    ? 'bg-gray-300 dark:bg-gray-700'
                    : 'bg-primary dark:bg-primary-light'
                }`}
                activeOpacity={0.8}
                onPressIn={() => {
                  scale.value = withSpring(0.95);
                }}
                onPressOut={() => {
                  scale.value = withSpring(1);
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}