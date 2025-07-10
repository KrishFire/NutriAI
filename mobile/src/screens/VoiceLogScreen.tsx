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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

type VoiceState = 'permissions' | 'ready' | 'recording' | 'transcribing' | 'reviewing' | 'logging' | 'error';

export default function VoiceLogScreen({ navigation, route }: VoiceLogScreenProps) {
  const { user, session } = useAuth();
  const [voiceState, setVoiceState] = useState<VoiceState>('permissions');
  const [transcribedText, setTranscribedText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);

  const voiceRecording = useVoiceRecording({
    onTranscriptionComplete: (text) => {
      setTranscribedText(text);
      setEditedText(text);
      setVoiceState('reviewing');
    },
    onError: (error) => {
      setError(error.message);
      setVoiceState('error');
    },
  });

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Pulse animation for recording state
  useEffect(() => {
    if (voiceState === 'recording') {
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
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
          setError('Microphone permission is required for voice logging');
          setVoiceState('error');
        }
      }
    } catch (err) {
      setError('Failed to check microphone permissions');
      setVoiceState('error');
    }
  };

  const startRecording = async () => {
    setError(null);
    setVoiceState('recording');
    await voiceRecording.startRecording();
  };

  const stopRecording = async () => {
    setVoiceState('transcribing');
    await voiceRecording.stopRecording();
  };

  const cancelRecording = async () => {
    await voiceRecording.cancelRecording();
    setVoiceState('ready');
    setTranscribedText('');
    setEditedText('');
  };

  const handleConfirmAndLog = async () => {
    if (!editedText.trim()) {
      Alert.alert('Empty Description', 'Please describe your meal before logging.');
      return;
    }

    setVoiceState('logging');
    setError(null);

    try {
      // Log the meal
      const result = await mealAIService.logMeal(editedText.trim(), 'snack');
      
      if (result.success && result.mealLogId && result.mealAnalysis) {
        // Convert to meal analysis format
        const analysisData = aiMealToMealAnalysis(result.mealAnalysis);
        
        // Navigate to MealDetails
        navigation.replace('MealDetails', {
          mealId: result.mealLogId,
          analysisData,
        });
      } else {
        throw new Error('Failed to log meal');
      }
    } catch (err) {
      console.error('[VoiceLogScreen] Log meal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to log meal');
      setVoiceState('error');
    }
  };

  const handleEdit = () => {
    // Could navigate to ManualEntry with pre-filled text
    // For now, just allow inline editing
    setVoiceState('reviewing');
  };

  const handleRetry = () => {
    setError(null);
    setTranscribedText('');
    setEditedText('');
    setVoiceState('ready');
    voiceRecording.reset();
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
            <Text style={styles.title}>Voice Log</Text>
            <Text style={styles.subtitle}>
              Tap the microphone to describe your meal
            </Text>
            <TouchableOpacity
              style={styles.micButton}
              onPress={startRecording}
              activeOpacity={0.8}
            >
              <Ionicons name="mic" size={64} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.hint}>
              Speak clearly and describe what you ate, including portions
            </Text>
          </View>
        );

      case 'recording':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Recording...</Text>
            <Text style={styles.timer}>
              {formatDuration(voiceRecording.duration)} / {formatDuration(voiceRecording.maxDuration)}
            </Text>
            
            <Animated.View
              style={[
                styles.recordingIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.recordingDot} />
            </Animated.View>

            <View style={styles.recordingControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.cancelButton]}
                onPress={cancelRecording}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#666" />
                <Text style={styles.controlButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={stopRecording}
                activeOpacity={0.8}
              >
                <Ionicons name="stop" size={24} color="#FFF" />
                <Text style={[styles.controlButtonText, { color: '#FFF' }]}>
                  Stop
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'transcribing':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Transcribing...</Text>
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            <Text style={styles.subtitle}>
              Converting your voice to text
            </Text>
          </View>
        );

      case 'reviewing':
        return (
          <KeyboardAvoidingView 
            style={styles.reviewContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              contentContainerStyle={styles.reviewScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Review Your Meal</Text>
              <Text style={styles.subtitle}>
                Make sure everything looks correct
              </Text>

              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={editedText}
                  onChangeText={setEditedText}
                  multiline
                  placeholder="Describe your meal..."
                  placeholderTextColor="#999"
                  autoFocus={false}
                />
              </View>

              <View style={styles.reviewActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleRetry}
                  activeOpacity={0.8}
                >
                  <Ionicons name="mic" size={20} color="#007AFF" />
                  <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
                    Re-record
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryButton]}
                  onPress={handleConfirmAndLog}
                  activeOpacity={0.8}
                  disabled={!editedText.trim()}
                >
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
                    Confirm & Log
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case 'logging':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Logging Your Meal</Text>
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            <Text style={styles.subtitle}>
              Analyzing nutrition information...
            </Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Oops!</Text>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" style={styles.errorIcon} />
            <Text style={styles.errorText}>
              {error || 'Something went wrong'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
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
  reviewContainer: {
    flex: 1,
  },
  reviewScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
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
  micButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: '#000',
    marginBottom: 40,
  },
  recordingIndicator: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FF3B301A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  recordingDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
  recordingControls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  loader: {
    marginBottom: 30,
  },
  textInputContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    minHeight: 150,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 28,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});