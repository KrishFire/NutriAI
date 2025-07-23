import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import * as Haptics from 'expo-haptics';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

interface CameraInputScreenProps {
  onBack: () => void;
  onCapture: (data: any) => void;
}

export function CameraInputScreen({ onBack, onCapture }: CameraInputScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const captureImage = async () => {
    if (cameraRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setCapturedImage(photo.uri);
        setIsCaptured(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const retakePhoto = () => {
    Haptics.selectionAsync();
    setCapturedImage(null);
    setIsCaptured(false);
  };

  const handleUploadImage = async () => {
    Haptics.selectionAsync();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setIsCaptured(true);
    }
  };

  const handleContinue = () => {
    if (capturedImage) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCapture({
        imageData: capturedImage
      });
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Ionicons name="camera-off" size={64} color="white" className="mb-4" />
        <Text className="text-white text-center mb-6">
          Camera permission is required to take photos of your meals.
        </Text>
        <Button
          variant="primary"
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <PageTransition>
      <View className="flex-1 bg-black">
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-4 pt-4 pb-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                onBack();
              }}
              className="w-10 h-10 rounded-full bg-black/30 items-center justify-center mr-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Take a Photo</Text>
          </View>

          {/* Camera View / Captured Image */}
          <View className="flex-1">
            {!isCaptured ? (
              <>
                <Camera
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  type={CameraType.back}
                  ratio="4:3"
                >
                  {/* Overlay with targeting frame */}
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="w-72 h-72 border-2 border-white/50 rounded-lg" />
                  </View>

                  {/* Instruction text */}
                  <View className="absolute bottom-20 left-0 right-0">
                    <Text className="text-center text-white text-sm">
                      Position your food in the frame
                    </Text>
                  </View>
                </Camera>
              </>
            ) : (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 500 }}
                className="flex-1"
              >
                {capturedImage && (
                  <Image
                    source={{ uri: capturedImage }}
                    style={{ flex: 1 }}
                    resizeMode="contain"
                  />
                )}
              </MotiView>
            )}
          </View>

          {/* Bottom Controls */}
          <View className="bg-black p-6">
            {!isCaptured ? (
              <View className="flex-row items-center justify-around">
                {/* Gallery Button */}
                <TouchableOpacity
                  onPress={handleUploadImage}
                  className="items-center"
                >
                  <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center mb-2">
                    <Ionicons name="images" size={24} color="white" />
                  </View>
                  <Text className="text-xs text-white">Gallery</Text>
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity
                  onPress={captureImage}
                  className="w-16 h-16 rounded-full border-4 border-white items-center justify-center"
                >
                  <View className="w-12 h-12 rounded-full bg-white" />
                </TouchableOpacity>

                {/* Placeholder for balance */}
                <View className="w-12 h-12 opacity-0" />
              </View>
            ) : (
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Button
                    onPress={retakePhoto}
                    variant="secondary"
                    fullWidth
                  >
                    Retake
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
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </PageTransition>
  );
}