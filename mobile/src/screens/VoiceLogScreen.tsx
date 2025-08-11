import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Mic, StopCircle, ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AddMealStackParamList } from '../types/navigation';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useAuth } from '../hooks/useAuth';
import mealAIService, { aiMealToMealAnalysis } from '../services/mealAI';
import { WaveformAnimation } from '../components/WaveformAnimation';
import { Button } from '../components/ui/Button';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';
import { hapticFeedback } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<
  AddMealStackParamList,
  'VoiceLog'
>;
type VoiceLogScreenProps = NativeStackScreenProps<
  AddMealStackParamList,
  'VoiceLog'
>;

type UIState = 'idle' | 'recording' | 'processing' | 'complete' | 'error';

export default function VoiceLogScreen({
  navigation,
  route,
}: VoiceLogScreenProps) {
  const { user, session } = useAuth();
  const [uiState, setUIState] = useState<UIState>('idle');
  const [isProcessingMeal, setIsProcessingMeal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract Add More parameters
  const { returnToAddMore, existingMealData, description, mealId } = route.params || {};

  const {
    state: recordingState,
    transcription,
    error: recordingError,
    duration,
    maxDuration,
    meteringValue,
    startRecording,
    stopRecording,
    reset,
  } = useVoiceRecording({
    maxDuration: 30,
    onTranscriptionComplete: (text: string) => {
      console.log('[VoiceLogScreen] Transcription complete:', text);
      setUIState('complete');
    },
    onError: (err: Error) => {
      console.error('[VoiceLogScreen] Recording error:', err);
      setErrorMessage(err.message);
      setUIState('error');
    },
  });

  // Handle back navigation
  const handleBack = useCallback(() => {
    hapticFeedback.selection();
    navigation.goBack();
  }, [navigation]);

  // Handle microphone button press
  const handleMicrophonePress = useCallback(async () => {
    hapticFeedback.impact();
    
    if (uiState === 'idle' || uiState === 'error') {
      // Start recording
      setErrorMessage(null);
      setUIState('recording');
      await startRecording();
    } else if (uiState === 'recording') {
      // Stop recording
      setUIState('processing');
      await stopRecording();
    }
  }, [uiState, startRecording, stopRecording]);

  // Handle retry
  const handleRetry = useCallback(() => {
    hapticFeedback.selection();
    reset();
    setUIState('idle');
    setErrorMessage(null);
  }, [reset]);

  // Handle continue (submit transcription)
  const handleContinue = useCallback(async () => {
    if (!transcription.trim() || isProcessingMeal) return;

    hapticFeedback.success();
    
    // Navigate to analyzing screen which will handle the API call
    if (returnToAddMore) {
      // Add More flow: Navigate to AnalyzingScreen with returnToAddMore flag
      navigation.navigate('AnalyzingScreen' as any, {
        inputType: 'voice',
        inputData: transcription.trim(),
        mealType: 'snack',
        returnToAddMore: true,
        existingMealData,
        existingDescription: description,
        existingMealId: mealId,
      });
    } else {
      // Normal flow
      navigation.navigate('AnalyzingScreen' as any, {
        inputType: 'voice',
        inputData: transcription.trim(),
        mealType: 'snack',
      });
    }
  }, [transcription, isProcessingMeal, navigation, returnToAddMore, existingMealData, description, mealId]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update UI state based on recording state
  React.useEffect(() => {
    if (recordingState === 'recording' && uiState !== 'recording') {
      setUIState('recording');
    } else if (recordingState === 'transcribing' && uiState !== 'processing') {
      setUIState('processing');
    } else if (recordingState === 'error' && uiState !== 'error') {
      setUIState('error');
    }
  }, [recordingState, uiState]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text className="ml-4 text-2xl font-bold text-gray-900">
          Voice Input
        </Text>
        <View className="flex-1" />
      </View>

      <View className="flex-1 items-center justify-center px-6">
        {/* Microphone Button */}
        <TouchableOpacity
          onPress={handleMicrophonePress}
          activeOpacity={0.7}
          disabled={uiState === 'processing' || uiState === 'complete' || isProcessingMeal}
        >
          <MotiView
            animate={{
              scale: uiState === 'recording' ? [1, 1.05, 1] : 1,
            }}
            transition={{
              type: 'timing',
              duration: 1500,
              loop: uiState === 'recording',
            }}
            className="w-40 h-40 rounded-full items-center justify-center"
            style={{
              backgroundColor: 'rgba(50, 13, 255, 0.1)',
            }}
          >
            {uiState === 'recording' ? (
              <StopCircle size={60} color="#320DFF" />
            ) : (
              <Mic size={60} color="#320DFF" />
            )}
          </MotiView>
        </TouchableOpacity>

        {/* Waveform Animation */}
        {(uiState === 'recording' || uiState === 'complete') && (
          <View className="mt-8 mb-6 h-10">
            <WaveformAnimation
              isRecording={uiState === 'recording'}
              meteringValue={meteringValue}
              barCount={30}
              baseHeight={5}
              maxHeight={30}
              barColor="#320DFF"
            />
          </View>
        )}

        {/* Status Text */}
        {uiState === 'idle' && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            className="items-center mt-8"
          >
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              Describe Your Meal
            </Text>
            <Text className="text-gray-600 text-center">
              Tap the microphone and tell us what you ate
            </Text>
            <Text className="text-sm text-gray-400 text-center mt-8">
              Try saying: "I had a chicken salad with avocado"
            </Text>
          </MotiView>
        )}

        {uiState === 'recording' && (
          <View className="items-center mt-6">
            <Text className="text-lg font-medium" style={{ color: '#320DFF' }}>
              Listening...
            </Text>
            <Text className="text-gray-500 mt-2">
              {formatTime(duration)} / {formatTime(maxDuration)}
            </Text>
          </View>
        )}

        {uiState === 'processing' && (
          <View className="items-center mt-8">
            <LoadingIndicator size="large" />
            <Text className="text-gray-600 mt-4">
              {recordingState === 'transcribing' ? 'Transcribing...' : 'Processing...'}
            </Text>
          </View>
        )}

        {/* Transcript Display */}
        {uiState === 'complete' && transcription && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 300 }}
            className="w-full mt-8 mb-6"
          >
            <View className="bg-gray-50 rounded-xl p-4">
              <ScrollView
                style={{ maxHeight: 150 }}
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-gray-900 text-base leading-6">
                  {transcription}
                </Text>
              </ScrollView>
            </View>
          </MotiView>
        )}

        {/* Error Display */}
        {uiState === 'error' && errorMessage && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="w-full mt-8 mb-6"
          >
            <View className="bg-red-50 rounded-xl p-4">
              <Text className="text-red-900 text-center">
                {errorMessage}
              </Text>
            </View>
          </MotiView>
        )}

        {/* Action Buttons */}
        {uiState === 'complete' && !isProcessingMeal && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 300, delay: 200 }}
            className="w-full flex-row gap-4"
          >
            <View className="flex-1">
              <TouchableOpacity
                onPress={handleRetry}
                className="h-[58px] bg-gray-100 rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-medium text-sm">
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <TouchableOpacity
                onPress={handleContinue}
                className="h-[58px] bg-primary rounded-full items-center justify-center"
                activeOpacity={0.7}
                style={{ backgroundColor: '#320DFF' }}
              >
                <Text className="text-white font-medium text-sm">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

        {/* Error Retry Button */}
        {uiState === 'error' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 300 }}
            className="w-full mt-6"
          >
            <TouchableOpacity
              onPress={handleRetry}
              className="h-[58px] bg-primary rounded-full items-center justify-center"
              activeOpacity={0.7}
              style={{ backgroundColor: '#320DFF' }}
            >
              <Text className="text-white font-medium text-sm">
                Try Again
              </Text>
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Processing Meal Indicator */}
        {isProcessingMeal && (
          <View className="absolute inset-0 bg-white/90 items-center justify-center">
            <LoadingIndicator size="large" />
            <Text className="text-gray-600 mt-4">
              Analyzing your meal...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}