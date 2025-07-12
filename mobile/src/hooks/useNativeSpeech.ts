import { useState, useEffect, useCallback, useRef } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useVoiceRecording } from './useVoiceRecording';

// Type-only import for TypeScript support
import type VoiceType from '@react-native-voice/voice';
import type {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
  SpeechVolumeChangeEvent,
} from '@react-native-voice/voice';

export type SpeechState = 'idle' | 'listening' | 'processing' | 'error';

interface UseNativeSpeechOptions {
  onSpeechEnd?: (text: string) => void;
  onError?: (error: Error) => void;
  language?: string; // e.g., 'en-US'
}

// Lazy load the Voice module with safer dynamic guard
let Voice: typeof VoiceType | null = null;
let isNativeVoiceAvailable = false;

// Try to load the native module only if it exists
if (Platform.OS !== 'web' && NativeModules.Voice) {
  try {
    Voice = require('@react-native-voice/voice').default;
    isNativeVoiceAvailable = true;
  } catch (error) {
    console.warn('[useNativeSpeech] Native voice module not available:', error);
    isNativeVoiceAvailable = false;
  }
}

export function useNativeSpeech(options: UseNativeSpeechOptions = {}) {
  // If native voice is not available, fallback to Whisper recording
  const whisperFallback = useVoiceRecording({
    maxDuration: 30,
    enableAutoStop: false,
    onTranscriptionComplete: options.onSpeechEnd,
    onError: options.onError,
  });

  // Return whisper fallback if native voice is not available
  if (!isNativeVoiceAvailable || !Voice) {
    console.warn(
      '[useNativeSpeech] Native STT unavailable – falling back to Whisper recording'
    );
    return {
      state:
        whisperFallback.state === 'recording'
          ? ('listening' as SpeechState)
          : whisperFallback.state === 'transcribing'
            ? ('processing' as SpeechState)
            : (whisperFallback.state as SpeechState),
      text: whisperFallback.transcription,
      partialText: '',
      error: whisperFallback.error,
      isAvailable: true, // Whisper is always available
      volume: 0, // Whisper doesn't provide volume
      start: whisperFallback.startRecording,
      stop: whisperFallback.stopRecording,
      cancel: whisperFallback.cancelRecording,
      reset: whisperFallback.reset,
      isNativeSupported: false,
    };
  }
  const {
    onSpeechEnd: onSpeechEndCallback,
    onError: onErrorCallback,
    language = 'en-US',
  } = options;

  const [state, setState] = useState<SpeechState>('idle');
  const [text, setText] = useState<string>('');
  const [partialText, setPartialText] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);

  const finalTextRef = useRef<string>('');

  // Event handlers
  const handleSpeechStart = useCallback((e: SpeechStartEvent) => {
    console.log('[useNativeSpeech] Speech started');
    setState('listening');
    setError(null);
  }, []);

  const handleSpeechEnd = useCallback(
    (e: SpeechEndEvent) => {
      console.log('[useNativeSpeech] Speech ended');
      setState('processing');

      // Use the final text if available, otherwise use partial text
      const finalText = finalTextRef.current || partialText;
      if (finalText && onSpeechEndCallback) {
        onSpeechEndCallback(finalText);
      }
    },
    [partialText, onSpeechEndCallback]
  );

  const handleSpeechResults = useCallback((e: SpeechResultsEvent) => {
    console.log('[useNativeSpeech] Speech results:', e.value);
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      setText(result);
      finalTextRef.current = result;
      setState('idle');
    }
  }, []);

  const handleSpeechPartialResults = useCallback((e: SpeechResultsEvent) => {
    console.log('[useNativeSpeech] Partial results:', e.value);
    if (e.value && e.value.length > 0) {
      setPartialText(e.value[0]);
    }
  }, []);

  const handleSpeechError = useCallback(
    (e: SpeechErrorEvent) => {
      console.error('[useNativeSpeech] Speech error:', e);
      const err = new Error(e.error?.message || 'Speech recognition error');
      setError(err);
      setState('error');
      onErrorCallback?.(err);
    },
    [onErrorCallback]
  );

  const handleSpeechVolumeChanged = useCallback(
    (e: SpeechVolumeChangeEvent) => {
      setVolume(e.value || 0);
    },
    []
  );

  // Check if speech recognition is available
  useEffect(() => {
    if (!Voice) return;

    checkAvailability();

    // Set up event listeners
    Voice.onSpeechStart = handleSpeechStart;
    Voice.onSpeechEnd = handleSpeechEnd;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechPartialResults = handleSpeechPartialResults;
    Voice.onSpeechError = handleSpeechError;
    Voice.onSpeechVolumeChanged = handleSpeechVolumeChanged;

    return () => {
      // Clean up
      Voice.destroy().then(Voice.removeAllListeners).catch(console.error);
    };
  }, [
    handleSpeechStart,
    handleSpeechEnd,
    handleSpeechResults,
    handleSpeechPartialResults,
    handleSpeechError,
    handleSpeechVolumeChanged,
  ]);

  const checkAvailability = async () => {
    if (!Voice) {
      setIsAvailable(false);
      return;
    }

    try {
      const available = await Voice.isAvailable();
      // On iOS, isAvailable() may return 0 initially until permission is granted
      // We'll treat this as potentially available and let start() handle the actual check
      const isDefinitelyAvailable = available === 1 || available === true;
      const isPotentiallyAvailable = Platform.OS === 'ios' && available === 0;
      
      setIsAvailable(isDefinitelyAvailable || isPotentiallyAvailable);
      
      if (!isDefinitelyAvailable && !isPotentiallyAvailable) {
        const err = new Error(
          'Speech recognition is not available on this device'
        );
        setError(err);
        onErrorCallback?.(err);
      }
    } catch (err) {
      console.error('[useNativeSpeech] Availability check error:', err);
      setIsAvailable(false);
    }
  };

  const start = useCallback(async () => {
    try {
      if (!isAvailable || !Voice) {
        throw new Error('Speech recognition is not available');
      }

      // Reset state
      setText('');
      setPartialText('');
      setError(null);
      finalTextRef.current = '';
      setState('listening');

      // Start speech recognition
      await Voice.start(language);
      console.log('[useNativeSpeech] Started listening');
    } catch (err) {
      const error = err as Error;
      console.error('[useNativeSpeech] Start error:', error);
      setError(error);
      setState('error');
      onErrorCallback?.(error);
    }
  }, [isAvailable, language, onErrorCallback]);

  const stop = useCallback(async () => {
    if (!Voice) return;

    try {
      await Voice.stop();
      setState('processing');
      console.log('[useNativeSpeech] Stopped listening');
    } catch (err) {
      console.error('[useNativeSpeech] Stop error:', err);
      setState('idle');
    }
  }, []);

  const cancel = useCallback(async () => {
    if (!Voice) return;

    try {
      await Voice.cancel();
      setText('');
      setPartialText('');
      finalTextRef.current = '';
      setState('idle');
      console.log('[useNativeSpeech] Cancelled');
    } catch (err) {
      console.error('[useNativeSpeech] Cancel error:', err);
      setState('idle');
    }
  }, []);

  const reset = useCallback(() => {
    setText('');
    setPartialText('');
    setError(null);
    setState('idle');
    finalTextRef.current = '';
  }, []);

  // Get the current transcript (final or partial)
  const currentText = text || partialText;

  return {
    // State
    state,
    text: currentText,
    partialText,
    error,
    isAvailable,
    volume,

    // Actions
    start,
    stop,
    cancel,
    reset,

    // Native support flag
    isNativeSupported: true,
  };
}
