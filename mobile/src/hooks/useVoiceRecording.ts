import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { transcribeAudio } from '../services/openai';

export type RecordingState = 'idle' | 'recording' | 'transcribing' | 'error';

interface UseVoiceRecordingOptions {
  maxDuration?: number; // in seconds, default 60
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: Error) => void;
  // Silence detection options
  silenceThreshold?: number; // dB threshold for silence
  silenceDuration?: number; // ms of silence before auto-stop
  enableAutoStop?: boolean; // Enable/disable auto-stop on silence
}

// Constants for silence detection
const DEFAULT_SILENCE_THRESHOLD = -40; // dB
const DEFAULT_SILENCE_DURATION = 1500; // 1.5 seconds
const METERING_INTERVAL = 200; // Check every 200ms

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}) {
  const {
    maxDuration = 60,
    onTranscriptionComplete,
    onError,
    silenceThreshold = DEFAULT_SILENCE_THRESHOLD,
    silenceDuration = DEFAULT_SILENCE_DURATION,
    enableAutoStop = true,
  } = options;

  const [state, setState] = useState<RecordingState>('idle');
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isAutoStopping, setIsAutoStopping] = useState<boolean>(false);
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState<boolean>(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestMeteringRef = useRef<number>(-160); // Store latest metering value

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();

    return () => {
      // Cleanup on unmount
      cleanup();
    };
  }, []);

  // Add a flag to prevent concurrent stop operations
  const isStoppingRef = useRef<boolean>(false);

  const cleanup = (preserveRecording = false) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (meteringIntervalRef.current) {
      clearInterval(meteringIntervalRef.current);
      meteringIntervalRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    // Only handle recording cleanup if not preserving it for stopRecording
    if (!preserveRecording && recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission denied');
      }

      // Set audio mode for iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (err) {
      const error = err as Error;
      console.error('[useVoiceRecording] Permission error:', error);
      setError(error);
      onError?.(error);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      // Check permissions first
      const { status } = await Audio.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to use voice input.',
          [{ text: 'OK', onPress: requestPermissions }]
        );
        return;
      }

      // Reset state
      setState('recording');
      setError(null);
      setTranscription('');
      setDuration(0);
      setIsAutoStopping(false);
      setHasStartedSpeaking(false);
      latestMeteringRef.current = -160;
      isStoppingRef.current = false; // Reset stopping flag

      // Configure recording options for M4A format with metering enabled
      const recordingOptions: Audio.RecordingOptions = {
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/mp4',
          bitsPerSecond: 128000,
        },
      };

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;

      // Set up status update callback for metering
      recording.setOnRecordingStatusUpdate(status => {
        if (status.isRecording && typeof status.metering === 'number') {
          latestMeteringRef.current = status.metering;
        }
      });

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Set auto-stop timer for max duration
      timerRef.current = setTimeout(() => {
        console.log('[useVoiceRecording] Max duration reached, stopping...');
        stopRecording();
      }, maxDuration * 1000);

      // Start silence detection if enabled
      if (enableAutoStop) {
        meteringIntervalRef.current = setInterval(() => {
          const meteringValue = latestMeteringRef.current;

          // Start silence detection only after user has started speaking
          if (!hasStartedSpeaking && meteringValue > silenceThreshold) {
            console.log(
              '[useVoiceRecording] Speech detected, starting silence monitoring'
            );
            setHasStartedSpeaking(true);
          }

          if (hasStartedSpeaking) {
            if (meteringValue < silenceThreshold) {
              // Sound level is below threshold (silence)
              if (!silenceTimerRef.current) {
                console.log(
                  '[useVoiceRecording] Silence detected, starting timer...'
                );
                setIsAutoStopping(true);
                silenceTimerRef.current = setTimeout(() => {
                  console.log(
                    '[useVoiceRecording] Silence duration exceeded, auto-stopping...'
                  );
                  stopRecording();
                }, silenceDuration);
              }
            } else {
              // Sound detected, clear silence timer
              if (silenceTimerRef.current) {
                console.log(
                  '[useVoiceRecording] Sound detected, cancelling silence timer'
                );
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
                setIsAutoStopping(false);
              }
            }
          }
        }, METERING_INTERVAL);
      }

      console.log(
        '[useVoiceRecording] Recording started with auto-stop:',
        enableAutoStop
      );
    } catch (err) {
      const error = err as Error;
      console.error('[useVoiceRecording] Start recording error:', error);
      setState('error');
      setError(error);
      onError?.(error);
    }
  }, [maxDuration, onError, enableAutoStop, silenceThreshold, silenceDuration]);

  const stopRecording = useCallback(async () => {
    try {
      // Prevent concurrent stop operations
      if (isStoppingRef.current) {
        console.warn('[useVoiceRecording] Stop already in progress, ignoring...');
        return;
      }

      if (!recordingRef.current) {
        console.warn('[useVoiceRecording] No active recording to stop');
        return;
      }

      // Mark that we're stopping
      isStoppingRef.current = true;

      // Clear all timers but preserve the recording reference
      cleanup(true);

      setState('transcribing');
      setIsAutoStopping(false);
      console.log('[useVoiceRecording] Stopping recording...');

      // Save the recording reference before any async operations
      const recording = recordingRef.current;
      recordingRef.current = null; // Clear it immediately to prevent double-stop

      // Stop and unload recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        throw new Error('No recording URI available');
      }

      console.log('[useVoiceRecording] Recording saved to:', uri);

      // Get file info for debugging
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('[useVoiceRecording] File info:', fileInfo);

      // Transcribe the audio
      const result = await transcribeAudio(uri);

      // Clean up temporary file
      await FileSystem.deleteAsync(uri, { idempotent: true });

      // Update state with transcription
      setTranscription(result.transcription);
      setState('idle');

      // Notify callback
      onTranscriptionComplete?.(result.transcription);

      console.log(
        '[useVoiceRecording] Transcription complete:',
        result.transcription
      );
    } catch (err) {
      const error = err as Error;
      console.error('[useVoiceRecording] Stop recording error:', error);
      setState('error');
      setError(error);
      onError?.(error);
    } finally {
      // Always clear the stopping flag
      isStoppingRef.current = false;
    }
  }, [onTranscriptionComplete, onError]);

  const cancelRecording = useCallback(async () => {
    try {
      // Prevent concurrent stop/cancel operations
      if (isStoppingRef.current) {
        console.warn('[useVoiceRecording] Stop/cancel already in progress, ignoring...');
        return;
      }

      // Mark that we're stopping
      isStoppingRef.current = true;

      // Clear timers but preserve recording for proper cleanup
      cleanup(true);

      if (recordingRef.current) {
        const recording = recordingRef.current;
        recordingRef.current = null; // Clear immediately to prevent double operations

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        // Clean up temporary file
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }

      setState('idle');
      setDuration(0);
      setError(null);
      setTranscription('');
      setIsAutoStopping(false);
      setHasStartedSpeaking(false);

      console.log('[useVoiceRecording] Recording cancelled');
    } catch (err) {
      console.error('[useVoiceRecording] Cancel recording error:', err);
      setState('idle');
    } finally {
      // Always clear the stopping flag
      isStoppingRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setTranscription('');
    setDuration(0);
    setIsAutoStopping(false);
    setHasStartedSpeaking(false);
  }, []);

  return {
    state,
    transcription,
    error,
    duration,
    maxDuration,
    isAutoStopping,
    hasStartedSpeaking,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}
