import { useVoiceRecording } from './useVoiceRecording';

export type SpeechState = 'idle' | 'listening' | 'processing' | 'error';

interface UseNativeSpeechOptions {
  onSpeechEnd?: (text: string) => void;
  onError?: (error: Error) => void;
  language?: string; // e.g., 'en-US'
}

/**
 * Speech recognition hook that uses Whisper API for transcription.
 * This provides a consistent cross-platform experience without native dependencies.
 */
export function useNativeSpeech(options: UseNativeSpeechOptions = {}) {
  // Always use Whisper API for speech recognition
  const whisperRecording = useVoiceRecording({
    maxDuration: 30,
    enableAutoStop: false,
    onTranscriptionComplete: options.onSpeechEnd,
    onError: options.onError,
  });

  // Map Whisper states to speech states for API compatibility
  const getSpeechState = (): SpeechState => {
    switch (whisperRecording.state) {
      case 'recording':
        return 'listening';
      case 'transcribing':
        return 'processing';
      case 'error':
        return 'error';
      default:
        return 'idle';
    }
  };

  return {
    // State
    state: getSpeechState(),
    text: whisperRecording.transcription,
    partialText: '', // Whisper doesn't provide partial results
    error: whisperRecording.error,
    isAvailable: true, // Whisper is always available
    volume: 0, // Whisper doesn't provide volume feedback

    // Actions
    start: whisperRecording.startRecording,
    stop: whisperRecording.stopRecording,
    cancel: whisperRecording.cancelRecording,
    reset: whisperRecording.reset,

    // Feature flags
    isNativeSupported: false, // Always using Whisper now
  };
}
