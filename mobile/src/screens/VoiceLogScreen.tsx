import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AddMealStackParamList } from '../types/navigation';
import { useNativeSpeech } from '../hooks/useNativeSpeech';
import { useAuth } from '../hooks/useAuth';
import mealAIService, { aiMealToMealAnalysis } from '../services/mealAI';

type NavigationProp = NativeStackNavigationProp<
  AddMealStackParamList,
  'VoiceLog'
>;
type VoiceLogScreenProps = NativeStackScreenProps<
  AddMealStackParamList,
  'VoiceLog'
>;

export default function VoiceLogScreen({
  navigation,
  route,
}: VoiceLogScreenProps) {
  const { user, session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nativeSpeech = useNativeSpeech({
    onSpeechEnd: async text => {
      // Auto-submit when speech ends if there's text
      if (text.trim()) {
        await handleSubmit(text);
      }
    },
    onError: err => {
      console.error('[VoiceLogScreen] Speech error:', err);
      setError(err.message);
    },
  });

  // Start listening immediately when screen loads
  useEffect(() => {
    const startListening = async () => {
      // Small delay to let UI render
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        await nativeSpeech.start();
      } catch (err) {
        console.error(
          '[VoiceLogScreen] Failed to start speech recognition:',
          err
        );
        // Don't show error immediately on iOS - it might just need permission
        if (Platform.OS !== 'ios') {
          setError('Speech recognition is not available on this device');
        }
      }
    };

    startListening();

    // Cleanup on unmount
    return () => {
      nativeSpeech.cancel();
    };
  }, []);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Stop listening
      await nativeSpeech.stop();

      // Log the meal
      const result = await mealAIService.logMeal(text.trim(), 'snack');

      if (result.success && result.mealLogId && result.mealAnalysis) {
        // Convert to meal analysis format
        const analysisData = aiMealToMealAnalysis(result.mealAnalysis);

        // Navigate to MealDetails
        navigation.replace('MealDetails', {
          mealId: result.mealLogId,
          analysisData,
        });
      } else {
        throw new Error('Failed to analyze meal');
      }
    } catch (err) {
      console.error('[VoiceLogScreen] Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to log meal');
      setIsProcessing(false);

      // Restart listening after error
      setTimeout(() => {
        nativeSpeech.reset();
        nativeSpeech.start();
      }, 1000);
    }
  };

  const handleCancel = () => {
    nativeSpeech.cancel();
    navigation.goBack();
  };

  const getStatusText = () => {
    if (isProcessing) return 'Processing your meal...';
    if (error) return error;

    // Whisper recording mode status messages
    if (nativeSpeech.state === 'listening') {
      return 'Recording... Tap stop when done';
    }
    if (nativeSpeech.state === 'processing') {
      return 'Transcribing your recording...';
    }
    return 'Tap the microphone to start recording';
  };

  const canSubmit = nativeSpeech.text.trim().length > 0 && !isProcessing;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.micContainer}>
          {/* Recording mode: Show record/stop button */}
          <TouchableOpacity
            onPress={() => {
              if (nativeSpeech.state === 'listening') {
                nativeSpeech.stop();
              } else if (nativeSpeech.state === 'idle') {
                nativeSpeech.start();
              }
            }}
            style={[
              styles.recordButton,
              nativeSpeech.state === 'listening' && styles.recordingButton,
            ]}
            disabled={nativeSpeech.state === 'processing' || isProcessing}
          >
            <Ionicons
              name={nativeSpeech.state === 'listening' ? 'stop' : 'mic'}
              size={48}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.statusText}>{getStatusText()}</Text>

        {/* Live transcript */}
        {(nativeSpeech.text || nativeSpeech.partialText) && (
          <ScrollView
            style={styles.transcriptContainer}
            contentContainerStyle={styles.transcriptContent}
          >
            <Text style={styles.transcriptText}>
              {nativeSpeech.text || nativeSpeech.partialText}
            </Text>
          </ScrollView>
        )}

        {/* Submit button appears when there's text */}
        {canSubmit && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => handleSubmit(nativeSpeech.text)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up-circle" size={64} color="#007AFF" />
          </TouchableOpacity>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  listeningIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeBar: {
    width: 60,
    backgroundColor: '#007AFF',
    borderRadius: 1,
    marginTop: 8,
    opacity: 0.3,
  },
  statusText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  transcriptContainer: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  transcriptContent: {
    flexGrow: 1,
  },
  transcriptText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  submitButton: {
    marginTop: 20,
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
