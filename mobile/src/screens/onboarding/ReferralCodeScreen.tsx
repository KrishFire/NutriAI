import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const ReferralCodeScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData } = useOnboarding();
  
  const [referralCode, setReferralCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);

  const handleChange = (text: string) => {
    setReferralCode(text.toUpperCase());
    // Reset validation when input changes
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const validateCode = () => {
    if (!referralCode) {
      handleSkip();
      return;
    }

    setIsValidating(true);
    hapticFeedback.selection();

    // Simulate API call to validate code
    setTimeout(() => {
      // For demo purposes, consider codes starting with "NUTRIAI" as valid
      const isValid = referralCode.startsWith('NUTRIAI');
      setValidationResult(isValid ? 'valid' : 'invalid');
      setIsValidating(false);

      if (isValid) {
        hapticFeedback.impact();
        // Wait a moment to show success state before proceeding
        setTimeout(() => {
          updateUserData('referralCode', referralCode);
          goToNextStep();
        }, 1000);
      } else {
        hapticFeedback.selection();
      }
    }, 1500);
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    updateUserData('referralCode', '');
    goToNextStep();
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
            <View className="flex-row items-center mb-4">
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

            {/* Progress bar */}
            <View className="w-full h-1 bg-gray-100 rounded-full mb-8">
              <View 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </View>

            {/* Title and subtitle */}
            <View className="mb-10">
              <Text className="text-3xl font-bold text-gray-900 mb-3">
                Have a referral code?
              </Text>
              <Text className="text-gray-600 text-lg">
                Enter it to unlock special benefits
              </Text>
            </View>

            {/* Code Input */}
            <View className="mb-8">
              <Text className="text-lg font-medium text-gray-700 mb-3">
                Referral Code (Optional)
              </Text>
              
              <View className="relative">
                <TextInput
                  value={referralCode}
                  onChangeText={handleChange}
                  placeholder="Enter code"
                  placeholderTextColor="#9CA3AF"
                  className={`h-16 px-4 bg-gray-100 rounded-2xl text-xl font-medium text-center ${
                    validationResult === 'valid' ? 'border-2 border-green-500' :
                    validationResult === 'invalid' ? 'border-2 border-red-500' : ''
                  }`}
                  maxLength={10}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                
                {/* Validation Icons */}
                <AnimatePresence>
                  {validationResult === 'valid' && (
                    <MotiView
                      from={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-4 top-5"
                    >
                      <CheckCircle size={24} color="#10B981" />
                    </MotiView>
                  )}
                  
                  {validationResult === 'invalid' && (
                    <MotiView
                      from={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-4 top-5"
                    >
                      <XCircle size={24} color="#EF4444" />
                    </MotiView>
                  )}
                </AnimatePresence>
              </View>

              {/* Validation Messages */}
              <AnimatePresence>
                {validationResult === 'valid' && (
                  <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -10 }}
                  >
                    <Text className="mt-2 text-sm text-green-600">
                      Valid code! You'll receive special benefits.
                    </Text>
                  </MotiView>
                )}
                
                {validationResult === 'invalid' && (
                  <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: -10 }}
                  >
                    <Text className="mt-2 text-sm text-red-600">
                      Invalid code. Please check and try again.
                    </Text>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>

            {/* Spacer to push buttons to bottom */}
            <View className="flex-1" />

            {/* Action Buttons */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={validateCode}
                className={`py-4 rounded-full items-center justify-center mb-4 ${
                  isValidating ? 'bg-gray-300' : 'bg-primary'
                }`}
                activeOpacity={0.8}
                disabled={isValidating}
              >
                {isValidating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    {referralCode ? 'Apply Code' : 'Continue'}
                  </Text>
                )}
              </TouchableOpacity>

              {referralCode && validationResult !== 'valid' && (
                <TouchableOpacity
                  onPress={handleSkip}
                  className="py-4 rounded-full items-center justify-center border border-gray-300"
                  activeOpacity={0.8}
                  disabled={isValidating}
                >
                  <Text className="text-gray-700 font-semibold text-base">
                    Skip
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ReferralCodeScreen;