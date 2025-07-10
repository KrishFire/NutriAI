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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AddMealStackParamList } from '../types/navigation';
import { useNativeSpeech } from '../hooks/useNativeSpeech';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useAuth } from '../hooks/useAuth';
import mealAIService, { aiMealToMealAnalysis } from '../services/mealAI';

type NavigationProp = NativeStackNavigationProp<AddMealStackParamList, 'VoiceLog'>;
type VoiceLogScreenProps = NativeStackScreenProps<AddMealStackParamList, 'VoiceLog'>;

type VoiceMode = 'native' | 'whisper';

export default function VoiceLogScreen({ navigation, route }: VoiceLogScreenProps) {
  const { user, session } = useAuth();
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('native');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedNative, setHasAttemptedNative] = useState(false);

  // Native speech recognition
  const nativeSpeech = useNativeSpeech({
    onSpeechEnd: async (text) => {
      if (text.trim() && voiceMode === 'native') {
        await handleSubmit(text);
      }
    },
    onError: (err) => {
      console.error('[VoiceLogScreen] Native speech error:', err);
      // Fall back to Whisper on native STT error
      if (!hasAttemptedNative) {
        setHasAttemptedNative(true);
        Alert.alert(
          'Speech Recognition Unavailable',
          'Switching to voice recording mode.',
          [{ text: 'OK', onPress: () => setVoiceMode('whisper') }]
        );
      }
    },
  });

  // Whisper recording fallback
  const whisperRecording = useVoiceRecording({
    maxDuration: 30,
    enableAutoStop: false, // Simple recording without silence detection
    onTranscriptionComplete: async (text) => {
      await handleSubmit(text);
    },
    onError: (err) => {
      console.error('[VoiceLogScreen] Whisper error:', err);
      setError(err.message);
      setIsProcessing(false);
    },
  });

  // Start listening immediately when screen loads (native mode)
  useEffect(() => {
    if (voiceMode === 'native' && !hasAttemptedNative) {
      const startListening = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (nativeSpeech.isAvailable) {
          await nativeSpeech.start();
        } else {
          setHasAttemptedNative(true);
          setVoiceMode('whisper');
        }
      };

      startListening();
    }

    // Cleanup
    return () => {
      if (voiceMode === 'native') {
        nativeSpeech.cancel();
      } else {
        whisperRecording.cancelRecording();
      }
    };
  }, [voiceMode]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Stop listening/recording
      if (voiceMode === 'native') {
        await nativeSpeech.stop();
      }

      // Log the meal
      const result = await mealAIService.logMeal(text.trim(), 'snack');
      
      if (result.success && result.mealLogId && result.mealAnalysis) {
        const analysisData = aiMealToMealAnalysis(result.mealAnalysis);
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
      
      // Restart listening after error (native mode only)
      if (voiceMode === 'native') {
        setTimeout(() => {
          nativeSpeech.reset();
          nativeSpeech.start();
        }, 1000);
      }
    }
  };

  const handleCancel = () => {
    if (voiceMode === 'native') {
      nativeSpeech.cancel();
    } else {
      whisperRecording.cancelRecording();
    }
    navigation.goBack();
  };

  // Native STT UI
  if (voiceMode === 'native') {
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
            {nativeSpeech.state === 'listening' ? (
              <View style={styles.listeningIndicator}>
                <Ionicons name="mic" size={48} color="#007AFF" />
                <View style={[styles.volumeBar, { height: 2 + (nativeSpeech.volume * 20) }]} />
              </View>
            ) : (
              <Ionicons name="mic-off" size={48} color="#999" />
            )}
          </View>

          <Text style={styles.statusText}>
            {isProcessing ? 'Processing your meal...' :
             error ? error :
             nativeSpeech.state === 'listening' && !nativeSpeech.text ? 'Start talking - we\'re listening' :
             nativeSpeech.state === 'listening' && nativeSpeech.text ? 'Keep talking or tap the arrow to submit' :
             'Getting ready...'}
          </Text>

          {(nativeSpeech.text || nativeSpeech.partialText) && (
            <ScrollView style={styles.transcriptContainer}>
              <Text style={styles.transcriptText}>
                {nativeSpeech.text || nativeSpeech.partialText}
              </Text>
            </ScrollView>
          )}

          {canSubmit && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit(nativeSpeech.text)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up-circle" size={64} color="#007AFF" />
            </TouchableOpacity>
          )}

          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Whisper recording UI (fallback)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Voice Recording</Text>
        <Text style={styles.subtitle}>
          {whisperRecording.state === 'idle' ? 'Tap to record your meal' :
           whisperRecording.state === 'recording' ? 'Recording... Tap to stop' :
           whisperRecording.state === 'transcribing' ? 'Processing...' :
           'Error occurred'}
        </Text>

        <TouchableOpacity
          style={[styles.recordButton, whisperRecording.state === 'recording' && styles.recordingButton]}
          onPress={() => {
            if (whisperRecording.state === 'idle') {
              whisperRecording.startRecording();
            } else if (whisperRecording.state === 'recording') {
              whisperRecording.stopRecording();
            }
          }}
          disabled={whisperRecording.state === 'transcribing' || isProcessing}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={whisperRecording.state === 'recording' ? 'stop' : 'mic'} 
            size={48} 
            color="#FFF" 
          />
        </TouchableOpacity>

        {whisperRecording.state === 'recording' && (
          <Text style={styles.timer}>
            {Math.floor(whisperRecording.duration / 60)}:
            {(whisperRecording.duration % 60).toString().padStart(2, '0')}
          </Text>
        )}

        {(whisperRecording.state === 'transcribing' || isProcessing) && (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  micContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
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
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  timer: {
    fontSize: 24,
    fontWeight: '300',
    color: '#000',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});