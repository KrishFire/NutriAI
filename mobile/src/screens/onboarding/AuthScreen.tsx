import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Apple } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

interface AuthScreenProps {
  mode?: 'signup' | 'signin';
}

const AuthScreen = ({ mode: initialMode = 'signup' }: AuthScreenProps) => {
  const { goToNextStep, goToPreviousStep, updateUserData } = useOnboarding();
  
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  const handleSubmit = () => {
    setError(null);
    
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      hapticFeedback.selection();
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      hapticFeedback.selection();
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      hapticFeedback.selection();
      return;
    }

    // Simulate API call
    setLoading(true);
    hapticFeedback.selection();
    
    setTimeout(() => {
      setLoading(false);
      hapticFeedback.impact();
      updateUserData('email', email);
      updateUserData('authMethod', 'email');
      goToNextStep();
    }, 1500);
  };

  const handleSocialSignIn = (provider: string) => {
    hapticFeedback.selection();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      hapticFeedback.impact();
      updateUserData('authMethod', provider);
      goToNextStep();
    }, 1000);
  };

  const toggleMode = () => {
    hapticFeedback.selection();
    setMode(mode === 'signup' ? 'signin' : 'signup');
    setError(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-4">
            {/* Header with back button */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={() => {
                  hapticFeedback.selection();
                  goToPreviousStep();
                }}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <ArrowLeft size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Title and subtitle */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </Text>
              <Text className="text-gray-600 text-lg">
                {isSignUp ? 'Start your nutrition journey' : 'Sign in to continue'}
              </Text>
            </View>

            {/* Social Sign In Buttons */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => handleSocialSignIn('apple')}
                className="w-full h-14 bg-black rounded-full flex-row items-center justify-center mb-3"
                activeOpacity={0.8}
              >
                <Apple size={20} color="white" />
                <Text className="text-white font-medium ml-2">
                  Continue with Apple
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSocialSignIn('google')}
                className="w-full h-14 border border-gray-300 rounded-full flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <View className="w-5 h-5 mr-2">
                  {/* Google G Logo */}
                  <Text className="text-xl font-bold" style={{ color: '#4285F4' }}>G</Text>
                </View>
                <Text className="text-gray-800 font-medium">
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-sm text-gray-500">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-5 z-10">
                  <Mail size={18} color="#9CA3AF" />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="w-full h-14 pl-12 pr-4 border border-gray-300 rounded-full text-base"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-medium text-gray-700">
                  Password
                </Text>
                {!isSignUp && (
                  <TouchableOpacity onPress={() => hapticFeedback.selection()}>
                    <Text className="text-sm text-primary">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="relative">
                <View className="absolute left-4 top-5 z-10">
                  <Lock size={18} color="#9CA3AF" />
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="w-full h-14 pl-12 pr-12 border border-gray-300 rounded-full text-base"
                />
                <TouchableOpacity
                  onPress={() => {
                    hapticFeedback.selection();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-4 top-4"
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
              {isSignUp && (
                <Text className="mt-2 text-xs text-gray-500">
                  Password must be at least 8 characters
                </Text>
              )}
            </View>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <View className="mb-5">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-5 z-10">
                    <Lock size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    className="w-full h-14 pl-12 pr-4 border border-gray-300 rounded-full text-base"
                  />
                </View>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl mb-5"
              >
                <Text className="text-red-600 text-sm">{error}</Text>
              </MotiView>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              className={`h-14 rounded-full items-center justify-center mb-6 ${
                loading ? 'bg-gray-300' : 'bg-primary'
              }`}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <View className="items-center mb-6">
              <Text className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <TouchableOpacity onPress={toggleMode}>
                  <Text className="text-primary font-medium"> {isSignUp ? 'Sign In' : 'Sign Up'}</Text>
                </TouchableOpacity>
              </Text>
            </View>

            {/* Terms and Privacy (Sign Up only) */}
            {isSignUp && (
              <Text className="text-xs text-gray-500 text-center">
                By continuing, you agree to our{' '}
                <Text className="text-primary">Terms of Service</Text>
                {' '}and{' '}
                <Text className="text-primary">Privacy Policy</Text>
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;