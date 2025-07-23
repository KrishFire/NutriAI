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
import { ArrowLeft, AlertTriangle, Lock } from 'lucide-react-native';
import Animated, {
  FadeIn,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DeleteAccountScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleDelete = async () => {
    setError(null);

    // Validation
    if (!password) {
      setError('Please enter your password');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Simulate API call
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setTimeout(() => {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // In a real app, this would clear auth state and navigate to welcome
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' as any }],
      });
    }, 2000);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    navigation.goBack();
  };

  const canDelete = confirmText === 'DELETE' && password.length > 0;

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
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4"
                activeOpacity={0.7}
              >
                <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
              </TouchableOpacity>
              
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Delete Account
              </Text>
            </View>

            {/* Warning Card */}
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <View className="flex-row">
                <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800/30 items-center justify-center mr-3">
                  <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-red-600 dark:text-red-400 mb-1">
                    Warning: This action cannot be undone
                  </Text>
                  <Text className="text-sm text-red-600/80 dark:text-red-400/80">
                    Deleting your account will permanently remove all your data,
                    including your profile, nutrition history, and preferences.
                  </Text>
                </View>
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm your password
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3.5 z-10">
                  <Lock size={18} className="text-gray-500 dark:text-gray-400" />
                </View>
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </View>
            </View>

            {/* Confirm Text Input */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type "DELETE" to confirm
              </Text>
              <TextInput
                value={confirmText}
                onChangeText={(text) => {
                  setConfirmText(text);
                  setError(null);
                }}
                placeholder="DELETE"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                autoCorrect={false}
                className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View 
                entering={FadeIn}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-5"
              >
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </Animated.View>
            )}

            {/* Delete Button */}
            <View className="pt-4">
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={isLoading || !canDelete}
                  className={`w-full h-12 rounded-full items-center justify-center ${
                    isLoading || !canDelete
                      ? 'bg-gray-300 dark:bg-gray-700'
                      : 'bg-red-600 dark:bg-red-500'
                  }`}
                  activeOpacity={0.8}
                  onPressIn={() => {
                    if (canDelete) {
                      scale.value = withSpring(0.95);
                    }
                  }}
                  onPressOut={() => {
                    scale.value = withSpring(1);
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Permanently Delete Account
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={handleBack}
                className="w-full mt-4 py-3"
                activeOpacity={0.7}
              >
                <Text className="text-center text-gray-600 dark:text-gray-400 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}