import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import { StandardHeaderWithBack } from '@/components/common';
import * as Haptics from 'expo-haptics';

interface TextInputScreenProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

export function TextInputScreen({ onBack, onSubmit }: TextInputScreenProps) {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (inputText.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Keyboard.dismiss();
      onSubmit({ text: inputText.trim() });
    }
  };

  const clearInput = () => {
    Haptics.selectionAsync();
    setInputText('');
    inputRef.current?.focus();
  };

  const selectSuggestion = (suggestion: string) => {
    Haptics.selectionAsync();
    setInputText(suggestion);
  };

  const suggestions = [
    'Chicken salad with avocado',
    'Greek yogurt with berries',
    'Grilled salmon with vegetables',
    'Protein shake with banana',
  ];

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <StandardHeaderWithBack 
            title="Describe Your Meal" 
            onBack={onBack}
          />

          <ScrollView
            className="flex-1 px-4"
            keyboardShouldPersistTaps="handled"
          >
            {/* Instructions */}
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 300 }}
              className="mb-6"
            >
              <Text className="font-semibold text-gray-900 dark:text-white mb-2">
                Tell us what you ate
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Describe your meal in detail and our AI will analyze the
                nutritional content
              </Text>
            </MotiView>

            {/* Input Area */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 400 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6"
            >
              <View className="relative">
                <TextInput
                  ref={inputRef}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="E.g. Grilled chicken salad with avocado, tomatoes, and olive oil dressing"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 text-gray-800 dark:text-white"
                  style={{ minHeight: 120 }}
                />
                {inputText.length > 0 && (
                  <TouchableOpacity
                    onPress={clearInput}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 items-center justify-center"
                  >
                    <Ionicons name="close" size={14} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row justify-between mt-3">
                <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 items-center justify-center">
                  <Ionicons name="mic" size={18} color="#374151" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!inputText.trim()}
                  className={`px-4 py-2 rounded-full flex-row items-center ${
                    inputText.trim()
                      ? 'bg-primary-600 dark:bg-primary-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={`mr-1 ${
                      inputText.trim()
                        ? 'text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    Analyze
                  </Text>
                  <Ionicons
                    name="send"
                    size={16}
                    color={inputText.trim() ? '#ffffff' : '#9ca3af'}
                  />
                </TouchableOpacity>
              </View>
            </MotiView>

            {/* Suggestions */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 400, delay: 200 }}
            >
              <Text className="font-medium text-gray-900 dark:text-white mb-3">
                Suggestions
              </Text>
              <View className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <MotiView
                    key={index}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      duration: 300,
                      delay: 300 + index * 100,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => selectSuggestion(suggestion)}
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 mb-2"
                    >
                      <Text className="text-gray-800 dark:text-gray-200">
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </View>
            </MotiView>

            {/* Tips */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 400, delay: 600 }}
              className="mt-6 mb-8 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg"
            >
              <Text className="font-medium text-gray-900 dark:text-white mb-2">
                Tips for Better Results
              </Text>
              <View className="space-y-2">
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  • Include portion sizes (e.g., 1 cup, 3 oz)
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  • Mention cooking methods (e.g., grilled, baked)
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  • Describe ingredients and toppings
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  • Include brand names if applicable
                </Text>
              </View>
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PageTransition>
  );
}
