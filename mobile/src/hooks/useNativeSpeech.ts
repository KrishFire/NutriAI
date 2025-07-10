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
  const { onSpeechEnd, onError, language = 'en-US' } = options;

  const [state, setState] = useState<SpeechState>('idle');
  const [text, setText] = useState<string>('');
  const [partialText, setPartialText] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);

  const finalTextRef = useRef<string>('');

  // Check if speech recognition is available
  useEffect(() => {
    checkAvailability();
    
    // Set up event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      // Clean up
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await Voice.isAvailable();
      setIsAvailable(available);
      if (!available) {
        const error = new Error('Speech recognition is not available on this device');
        setError(error);
        onError?.(error);
      }
    } catch (err) {
      console.error('[useNativeSpeech] Availability check error:', err);
      setIsAvailable(false);
    }
  };

  const onSpeechStart = (e: SpeechStartEvent) => {
    console.log('[useNativeSpeech] Speech started');
    setState('listening');
    setError(null);
  };

  const onSpeechEnd = (e: SpeechEndEvent) => {
    console.log('[useNativeSpeech] Speech ended');
    setState('processing');
    
    // Use the final text if available, otherwise use partial text
    const finalText = finalTextRef.current || partialText;
    if (finalText && options.onSpeechEnd) {
      options.onSpeechEnd(finalText);
    }
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    console.log('[useNativeSpeech] Speech results:', e.value);
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      setText(result);
      finalTextRef.current = result;
      setState('idle');
    }
  };

  const onSpeechPartialResults = (e: SpeechResultsEvent) => {
    console.log('[useNativeSpeech] Partial results:', e.value);
    if (e.value && e.value.length > 0) {
      setPartialText(e.value[0]);
    }
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.error('[useNativeSpeech] Speech error:', e);
    const error = new Error(e.error?.message || 'Speech recognition error');
    setError(error);
    setState('error');
    onError?.(error);
  };

  const onSpeechVolumeChanged = (e: SpeechVolumeChangeEvent) => {
    setVolume(e.value || 0);
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
      onError?.(error);
    }
  }, [isAvailable, language, onError]);

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