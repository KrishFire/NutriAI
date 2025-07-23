import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

interface VoiceInputScreenProps {
  onBack: () => void;
  onCapture: (data: any) => void;
}

export function VoiceInputScreen({ onBack, onCapture }: VoiceInputScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformValues, setWaveformValues] = useState<number[]>(Array(30).fill(5));
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current);
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start waveform animation
      waveformIntervalRef.current = setInterval(() => {
        setWaveformValues(prev => 
          prev.map(() => Math.floor(Math.random() * 30) + 5)
        );
      }, 100);

      // Simulate speech recognition after 2 seconds
      setTimeout(() => {
        setTranscript('I had a chicken salad with avocado, tomatoes, and olive oil dressing');
      }, 2000);
    } catch (err) {
      Alert.alert('Failed to start recording', err as string);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      setRecording(null);
      setIsRecording(false);
      setRecordingComplete(true);
      
      // Stop timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
        waveformIntervalRef.current = null;
      }
      
      // Reset waveform
      setWaveformValues(Array(30).fill(5));
    } catch (err) {
      Alert.alert('Failed to stop recording', err as string);
    }
  };

  // Handle continue
  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCapture({ transcript });
  };

  // Handle retry
  const handleRetry = () => {
    Haptics.selectionAsync();
    setRecordingComplete(false);
    setTranscript('');
    startRecording();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1">
          {/* Header */}
          <View className="px-4 pt-4 pb-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                onBack();
              }}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4"
            >
              <Ionicons name="arrow-back" size={20} color="#6b7280" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Voice Input
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1 items-center justify-center p-6">
            {/* Recording Button */}
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              disabled={recordingComplete}
            >
              <MotiView
                animate={{
                  scale: isRecording ? [1, 1.05, 1] : 1,
                  backgroundColor: isRecording 
                    ? ['rgba(124, 58, 237, 0.1)', 'rgba(124, 58, 237, 0.2)', 'rgba(124, 58, 237, 0.1)']
                    : 'rgba(124, 58, 237, 0.1)',
                }}
                transition={{
                  duration: 1500,
                  loop: isRecording,
                  type: 'timing',
                }}
                className="w-40 h-40 rounded-full items-center justify-center mb-8"
              >
                <Ionicons
                  name={isRecording ? "stop-circle" : "mic"}
                  size={60}
                  color="#7c3aed"
                />
              </MotiView>
            </TouchableOpacity>

            {/* Waveform Visualization */}
            {(isRecording || recordingComplete) && (
              <View className="flex-row items-center justify-center mb-8 h-20">
                {waveformValues.map((value, index) => (
                  <MotiView
                    key={index}
                    animate={{ height: value }}
                    transition={{ duration: 100 }}
                    className="w-1.5 mx-0.5 bg-primary-600 dark:bg-primary-400 rounded-sm"
                  />
                ))}
              </View>
            )}

            {/* Status Text */}
            {!isRecording && !recordingComplete && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 300 }}
                className="items-center mb-8"
              >
                <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Describe Your Meal
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-center">
                  Tap the microphone and tell us what you ate
                </Text>
              </MotiView>
            )}

            {isRecording && (
              <View className="items-center mb-8">
                <Text className="text-primary-600 dark:text-primary-400 font-medium mb-2">
                  Listening...
                </Text>
                <Text className="text-gray-500 dark:text-gray-400">
                  {formatTime(recordingTime)}
                </Text>
              </View>
            )}

            {/* Transcript */}
            {transcript && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 300 }}
                className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-8"
              >
                <Text className="text-gray-900 dark:text-white">{transcript}</Text>
              </MotiView>
            )}

            {/* Action Buttons */}
            {recordingComplete && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 300, delay: 200 }}
                className="w-full flex-row space-x-4"
              >
                <View className="flex-1">
                  <Button
                    onPress={handleRetry}
                    variant="secondary"
                    fullWidth
                  >
                    Retry
                  </Button>
                </View>
                <View className="flex-1">
                  <Button
                    onPress={handleContinue}
                    variant="primary"
                    fullWidth
                  >
                    Continue
                  </Button>
                </View>
              </MotiView>
            )}

            {!isRecording && !recordingComplete && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 500 }}
                className="absolute bottom-8"
              >
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Try saying: "I had a chicken salad with avocado"
                </Text>
              </MotiView>
            )}
          </View>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
}