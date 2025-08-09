import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { RecordingState } from '../hooks/useVoiceRecording';
import { LoadingIndicator } from './ui/LoadingIndicator';

interface VoiceRecordingBottomSheetProps {
  isVisible: boolean;
  recordingState: RecordingState;
  duration: number;
  maxDuration: number;
  transcription: string;
  error: Error | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onClose: () => void;
}

export default function VoiceRecordingBottomSheet({
  isVisible,
  recordingState,
  duration,
  maxDuration,
  transcription,
  error,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onClose,
}: VoiceRecordingBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  useEffect(() => {
    if (recordingState === 'recording') {
      // Create pulsing animation for recording indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [recordingState, pulseAnim]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (recordingState) {
      case 'idle':
        return (
          <>
            <Text style={styles.title}>Voice Input</Text>
            <Text style={styles.subtitle}>
              Tap the microphone to describe your meal
            </Text>
            <TouchableOpacity
              style={styles.micButton}
              onPress={onStartRecording}
            >
              <Ionicons name="mic" size={48} />
            </TouchableOpacity>
            <Text style={styles.hint}>Speak clearly and describe portions</Text>
          </>
        );

      case 'recording':
        return (
          <>
            <Text style={styles.title}>Recording...</Text>
            <Text style={styles.timer}>
              {formatDuration(duration)} / {formatDuration(maxDuration)}
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
                onPress={onCancelRecording}
              >
                <Ionicons name="close" size={24} color="#666" />
                <Text style={styles.controlButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={onStopRecording}
              >
                <Ionicons name="stop" size={24} color="#FFF" />
                <Text style={[styles.controlButtonText, styles.stopButtonText]}>
                  Stop
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'transcribing':
        return (
          <>
            <Text style={styles.title}>Transcribing...</Text>
            <LoadingIndicator
              size="large"
              style={styles.loader}
            />
            <Text style={styles.subtitle}>Converting your voice to text</Text>
          </>
        );

      case 'error':
        return (
          <>
            <Text style={styles.title}>Error</Text>
            <Ionicons
              name="alert-circle"
              size={48}
              color="#FF3B30"
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>
              {error?.message || 'Failed to process recording'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onStartRecording}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['50%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      )}
    >
      <View style={styles.container}>{renderContent()}</View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    color: '#000',
    marginBottom: 32,
  },
  recordingIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF3B301A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  recordingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
  },
  recordingControls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
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
    color: '#666',
  },
  stopButtonText: {
    color: '#FFF',
  },
  loader: {
    marginBottom: 24,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
