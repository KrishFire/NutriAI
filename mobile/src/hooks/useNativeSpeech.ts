import { useState, useEffect, useCallback, useRef } from 'react';
import Voice, {
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

export function useNativeSpeech(options: UseNativeSpeechOptions = {}) {
  const { onSpeechEnd: onSpeechEndCallback, onError: onErrorCallback, language = 'en-US' } = options;

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

  const handleSpeechEnd = useCallback((e: SpeechEndEvent) => {
    console.log('[useNativeSpeech] Speech ended');
    setState('processing');
    
    // Use the final text if available, otherwise use partial text
    const finalText = finalTextRef.current || partialText;
    if (finalText && onSpeechEndCallback) {
      onSpeechEndCallback(finalText);
    }
  }, [partialText, onSpeechEndCallback]);

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

  const handleSpeechError = useCallback((e: SpeechErrorEvent) => {
    console.error('[useNativeSpeech] Speech error:', e);
    const err = new Error(e.error?.message || 'Speech recognition error');
    setError(err);
    setState('error');
    onErrorCallback?.(err);
  }, [onErrorCallback]);

  const handleSpeechVolumeChanged = useCallback((e: SpeechVolumeChangeEvent) => {
    setVolume(e.value || 0);
  }, []);

  // Check if speech recognition is available
  useEffect(() => {
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
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [handleSpeechStart, handleSpeechEnd, handleSpeechResults, handleSpeechPartialResults, handleSpeechError, handleSpeechVolumeChanged]);

  const checkAvailability = async () => {
    try {
      const available = await Voice.isAvailable();
      setIsAvailable(!!available); // Convert 0/1 to boolean
      if (!available) {
        const err = new Error('Speech recognition is not available on this device');
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
      if (!isAvailable) {
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
  };
}