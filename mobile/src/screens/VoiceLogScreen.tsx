import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { AddMealStackParamList } from '../types/navigation';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useAuth } from '../hooks/useAuth';
import mealAIService, { aiMealToMealAnalysis } from '../services/mealAI';

type NavigationProp = NativeStackNavigationProp<AddMealStackParamList, 'VoiceLog'>;
type VoiceLogScreenProps = NativeStackScreenProps<AddMealStackParamList, 'VoiceLog'>;

// State machine states
type VoiceState = 
  | 'idle' 
  | 'permissions' 
  | 'ready' 
  | 'recording' 
  | 'silenceDetected'
  | 'processing' 
  | 'success' 
  | 'error';

interface ErrorInfo {
  message: string;
  stage: 'permissions' | 'recording' | 'transcription' | 'analysis';
  canRetry: boolean;
  retryData?: {
    audioUri?: string;
    transcript?: string;
  };
}

export default function VoiceLogScreen({ navigation, route }: VoiceLogScreenProps) {
  const { user, session } = useAuth();
  const [voiceState, setVoiceState] = useState<VoiceState>('permissions');
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [cachedTranscript, setCachedTranscript] = useState<string | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);

  const voiceRecording = useVoiceRecording({
    maxDuration: 60,
    enableAutoStop: true,
    silenceThreshold: -40,
    silenceDuration: 1500,
    onTranscriptionComplete: async (text) => {
      // Cache transcript for retry
      setCachedTranscript(text);
      // Immediately start analysis
      await handleAnalyzeAndLog(text);
    },
    onError: (err) => {
      setError({
        message: err.message,
        stage: voiceState === 'recording' ? 'recording' : 'transcription',
        canRetry: true,
        retryData: { transcript: cachedTranscript || undefined }
      });
      setVoiceState('error');
    },
  });

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Auto-start recording when ready
  useEffect(() => {
    if (voiceState === 'ready') {
      // Small delay to let user see the UI before starting
      const timer = setTimeout(() => {
        startRecording();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [voiceState]);

  // Pulse animation for recording state
  useEffect(() => {
    if (voiceState === 'recording' || voiceState === 'silenceDetected') {
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: voiceState === 'silenceDetected' ? 1.2 : 1.3,
            duration: voiceState === 'silenceDetected' ? 500 : 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: voiceState === 'silenceDetected' ? 500 : 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current.start();
    } else {
      // Stop animation if it exists
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      // Reset the animated value
      pulseAnim.setValue(1);
    }

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [voiceState, pulseAnim]);

  // Update state when silence is detected
  useEffect(() => {
    if (voiceRecording.isAutoStopping && voiceState === 'recording') {
      setVoiceState('silenceDetected');
    }
  }, [voiceRecording.isAutoStopping, voiceState]);

  // Handle state changes from voice recording hook
  useEffect(() => {
    if (voiceRecording.state === 'transcribing' && voiceState !== 'processing') {
      setVoiceState('processing');
    }
  }, [voiceRecording.state, voiceState]);

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      if (status === 'granted') {
        setVoiceState('ready');
      } else {
        const { status: newStatus } = await Audio.requestPermissionsAsync();
        if (newStatus === 'granted') {
          setVoiceState('ready');
        } else {
          setError({
            message: 'Microphone permission is required for voice logging',
            stage: 'permissions',
            canRetry: false,
          });
          setVoiceState('error');
        }
      }
    } catch (err) {
      setError({
        message: 'Failed to check microphone permissions',
        stage: 'permissions',
        canRetry: true,
      });
      setVoiceState('error');
    }
  };

  const startRecording = async () => {
    setError(null);
    setVoiceState('recording');
    await voiceRecording.startRecording();
  };

  const cancelRecording = async () => {
    await voiceRecording.cancelRecording();
    navigation.goBack();
  };

  const handleAnalyzeAndLog = async (transcriptText: string) => {
    if (!transcriptText.trim()) {
      setError({
        message: 'Could not understand the recording. Please try again.',
        stage: 'transcription',
        canRetry: true,
      });
      setVoiceState('error');
      return;
    }

    setVoiceState('processing');
    setError(null);

    try {
      // Log the meal
      const result = await mealAIService.logMeal(transcriptText.trim(), 'snack');
      
      if (result.success && result.mealLogId && result.mealAnalysis) {
        // Convert to meal analysis format
        const analysisData = aiMealToMealAnalysis(result.mealAnalysis);
        
        // Show success briefly before navigating
        setVoiceState('success');
        
        // Navigate after a short delay
        setTimeout(() => {
          navigation.replace('MealDetails', {
            mealId: result.mealLogId,
            analysisData,
          });
        }, 800);
      } else {
        throw new Error('Failed to analyze meal');
      }
    } catch (err) {
      console.error('[VoiceLogScreen] Analysis error:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to analyze meal',
        stage: 'analysis',
        canRetry: true,
        retryData: { transcript: transcriptText }
      });
      setVoiceState('error');
    }
  };

  const handleRetry = async () => {
    if (!error) return;

    setError(null);

    switch (error.stage) {
      case 'permissions':
        setVoiceState('permissions');
        await checkPermissions();
        break;
      
      case 'recording':
      case 'transcription':
        // Start fresh recording
        setCachedTranscript(null);
        voiceRecording.reset();
        setVoiceState('ready');
        break;
      
      case 'analysis':
        // Retry with cached transcript
        if (error.retryData?.transcript) {
          await handleAnalyzeAndLog(error.retryData.transcript);
        } else {
          // No transcript cached, start fresh
          voiceRecording.reset();
          setVoiceState('ready');
        }
        break;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (voiceState) {
      case 'permissions':
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Checking permissions...</Text>
          </View>
        );

      case 'ready':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Starting Voice Log</Text>
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            <Text style={styles.subtitle}>
              Getting ready to listen...
            </Text>
          </View>
        );

      case 'recording':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Listening...</Text>
            <Text style={styles.subtitle}>
              Describe your meal
            </Text>
            
            <Animated.View
              style={[
                styles.recordingIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.recordingDot} />
            </Animated.View>

            <Text style={styles.timer}>
              {formatDuration(voiceRecording.duration)} / {formatDuration(voiceRecording.maxDuration)}
            </Text>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelRecording}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={48} color="#FF3B30" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );

      case 'silenceDetected':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Silence Detected</Text>
            <Text style={styles.subtitle}>
              Stopping soon...
            </Text>
            
            <Animated.View
              style={[
                styles.recordingIndicator,
                styles.silenceIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Ionicons name="pause" size={32} color="#FF9500" />
            </Animated.View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelRecording}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={48} color="#FF3B30" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );

      case 'processing':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Analyzing Your Meal</Text>
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            <Text style={styles.subtitle}>
              {voiceRecording.state === 'transcribing' 
                ? 'Converting speech to text...' 
                : 'Calculating nutrition information...'}
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Success!</Text>
            <Ionicons name="checkmark-circle" size={64} color="#34C759" style={styles.successIcon} />
            <Text style={styles.subtitle}>
              Meal logged successfully
            </Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Oops!</Text>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" style={styles.errorIcon} />
            <Text style={styles.errorText}>
              {error?.message || 'Something went wrong'}
            </Text>
            <View style={styles.errorActions}>
              {error?.canRetry && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.retryButton, styles.cancelErrorButton]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={[styles.retryButtonText, { color: '#666' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          disabled={voiceState === 'processing'}
        >
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {renderContent()}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: '#000',
    marginTop: 20,
    marginBottom: 40,
  },
  recordingIndicator: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FF3B301A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  silenceIndicator: {
    backgroundColor: '#FF95001A',
  },
  recordingDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  cancelText: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 8,
    fontWeight: '600',
  },
  loader: {
    marginBottom: 30,
  },
  successIcon: {
    marginBottom: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 28,
  },
  cancelErrorButton: {
    backgroundColor: '#F2F2F7',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});