import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Calendar, User } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptics';
import tokens from '../../utils/tokens';

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  const handleContinue = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (!age.trim()) {
      newErrors.age = 'Please enter your age';
    } else if (isNaN(Number(age)) || Number(age) < 13 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age (13-120)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      hapticFeedback.error();
      return;
    }

    hapticFeedback.success();
    navigation.navigate('DietaryPreferences' as never);
  };

  const handleInputChange = (field: 'name' | 'age', value: string) => {
    if (field === 'name') {
      setName(value);
    } else {
      setAge(value);
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.selection();
              navigation.goBack();
            }}
            className="p-2"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress indicator */}
          <View className="flex-row space-x-2 mb-8">
            {[1, 2, 3, 4, 5].map(step => (
              <View
                key={step}
                className={`h-1 flex-1 rounded-full ${
                  step <= 2 ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </View>

          <Animated.View entering={FadeIn}>
            <Text className="text-3xl font-bold mb-2">
              Tell us about yourself
            </Text>
            <Text className="text-gray-600 mb-8">
              This helps us personalize your nutrition experience
            </Text>

            {/* Name input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Your Name
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <User size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  className={`pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-base ${
                    errors.name ? 'border-2 border-red-500' : ''
                  }`}
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={text => handleInputChange('name', text)}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}
            </View>

            {/* Age input */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Your Age
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Calendar size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  className={`pl-12 pr-4 py-4 bg-gray-50 rounded-2xl text-base ${
                    errors.age ? 'border-2 border-red-500' : ''
                  }`}
                  placeholder="Enter your age"
                  value={age}
                  onChangeText={text => handleInputChange('age', text)}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              {errors.age && (
                <Text className="text-red-500 text-sm mt-1">{errors.age}</Text>
              )}
            </View>

            {/* Privacy note */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-8">
              <Text className="text-sm text-blue-800">
                🔒 Your personal information is kept private and secure. We
                never share your data with third parties.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Continue button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-primary rounded-2xl py-4 px-6"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
