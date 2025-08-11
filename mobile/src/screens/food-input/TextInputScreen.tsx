import React, { useState, useRef } from 'react';
import { RootStackParamList, AddMealStackParamList } from '../../types/navigation';
import { useRoute, RouteProp } from '@react-navigation/native';
import mealAIService, { aiMealToMealAnalysis } from '../../services/mealAI';
import { useAuth } from '../../hooks/useAuth';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';

type NavigationProp = NativeStackNavigationProp<
  AddMealStackParamList,
  'TextInput'
>;
type RouteParams = RouteProp<any, 'TextInputScreen'>;

export default function TextInputScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { user, session } = useAuth();
  
  // Extract params for "Add More" flow
  const { returnToAddMore, existingMealData, description, mealId } = route.params || {};
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleBack = () => {
    hapticFeedback.selection();
    navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    hapticFeedback.selection();
    Keyboard.dismiss();
    
    if (!user || !session) {
      setError('Please log in to analyze meals');
      return;
    }

    // Navigate to analyzing screen which will handle the API call
    navigation.navigate('AnalyzingScreen' as any, {
      inputType: 'text',
      inputData: inputText,
      mealType: 'snack', // Could be dynamic based on time of day or user selection
      returnToAddMore,
      existingMealData,
      description: description || inputText,
      mealId,
    });
  };

  const clearInput = () => {
    hapticFeedback.selection();
    setInputText('');
    inputRef.current?.focus();
  };

  const selectSuggestion = (suggestion: string) => {
    hapticFeedback.selection();
    setInputText(suggestion);
  };

  const suggestions = [
    'Chicken salad with avocado',
    'Greek yogurt with berries',
    'Grilled salmon with vegetables',
    'Protein shake with banana',
  ];

  const tips = [
    'Include portion sizes (e.g., 1 cup, 3 oz)',
    'Mention cooking methods (e.g., grilled, baked)',
    'Describe ingredients and toppings',
    'Include brand names if applicable',
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 pt-12 pb-4 flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <ArrowLeft size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="ml-4 text-2xl font-bold text-gray-900">
            Describe Your Meal
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4">
            {/* Instructions */}
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300 }}
              className="mb-6"
            >
              <Text className="text-base font-semibold text-gray-900 mb-2">
                Tell us what you ate
              </Text>
              <Text className="text-sm text-gray-600">
                Describe your meal in detail and our AI will analyze the nutritional content
              </Text>
            </MotiView>

            {/* Input Area */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400 }}
              className="bg-gray-50 rounded-xl p-4 mb-6"
            >
              <View className="bg-white rounded-lg p-4 mb-3 relative">
                <TextInput
                  ref={inputRef}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="E.g. Grilled chicken salad with avocado, tomatoes, and olive oil dressing"
                  placeholderTextColor="#CCCCCC"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  className="text-gray-800 text-lg"
                  style={{ minHeight: 128, maxHeight: 128, lineHeight: 24 }}
                />
                {inputText.length > 0 && (
                  <TouchableOpacity
                    onPress={clearInput}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
                  >
                    <Text className="text-gray-600 font-bold text-lg">×</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row justify-end items-center">
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!inputText.trim() || isAnalyzing}
                  className={`px-6 py-2.5 rounded-full flex-row items-center ${
                    inputText.trim() && !isAnalyzing
                      ? 'bg-[#320DFF]'
                      : 'bg-gray-200'
                  }`}
                  style={{ minHeight: 40 }}
                >
                  {isAnalyzing ? (
                    <LoadingIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text
                        className={`mr-2 text-base ${
                          inputText.trim() ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        Analyze
                      </Text>
                      <Send
                        size={16}
                        color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </MotiView>

            {/* Error Message */}
            {error && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
              >
                <Text className="text-red-600 text-sm">{error}</Text>
              </MotiView>
            )}

            {/* Suggestions */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 400, delay: 200 }}
              className="mb-6"
            >
              <Text className="text-base font-medium text-gray-900 mb-3">
                Suggestions
              </Text>
              <View>
                {suggestions.map((suggestion, index) => (
                  <MotiView
                    key={index}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: 'timing',
                      duration: 300,
                      delay: 300 + index * 100,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => selectSuggestion(suggestion)}
                      className="bg-white border border-gray-100 rounded-lg px-3 py-3 mb-2"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      }}
                    >
                      <Text className="text-base text-gray-900">{suggestion}</Text>
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </View>
            </MotiView>

            {/* Tips */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 400, delay: 600 }}
              className="bg-[#320DFF]/5 p-4 rounded-lg"
            >
              <Text className="text-base font-medium text-gray-900 mb-3">
                Tips for Better Results
              </Text>
              <View>
                {tips.map((tip, index) => (
                  <Text key={index} className="text-sm text-gray-700 mb-2">
                    • {tip}
                  </Text>
                ))}
              </View>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}