import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import * as Haptics from 'expo-haptics';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';

interface BarcodeInputScreenProps {
  onBack: () => void;
  onCapture: (data: any) => void;
}

export function BarcodeInputScreen({ onBack, onCapture }: BarcodeInputScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scannerLinePosition, setScannerLinePosition] = useState(0);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Animate scanner line
    let direction = 1;
    const animateScanner = () => {
      setScannerLinePosition(prev => {
        const newPos = prev + direction * 2;
        if (newPos >= 200) {
          direction = -1;
          return 200;
        } else if (newPos <= 0) {
          direction = 1;
          return 0;
        }
        return newPos;
      });
    };

    if (!scannedCode) {
      animationRef.current = setInterval(animateScanner, 20);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [scannedCode]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scannedCode) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScannedCode(data);
    }
  };

  const handleContinue = () => {
    if (scannedCode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onCapture({ barcode: scannedCode });
    }
  };

  const handleRetry = () => {
    Haptics.selectionAsync();
    setScannedCode(null);
  };

  const handleUploadImage = async () => {
    Haptics.selectionAsync();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // In a real app, you'd process the image to extract barcode
      // For now, we'll simulate finding a barcode
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScannedCode('5901234123457');
      }, 1000);
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
        <Ionicons name="barcode" size={64} color="white" className="mb-4" />
        <Text className="text-white text-center mb-6">
          Camera permission is required to scan barcodes.
        </Text>
        <Button
          variant="primary"
          onPress={() => BarCodeScanner.requestPermissionsAsync()}
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
            <Text className="text-xl font-bold text-white">Scan Barcode</Text>
          </View>

          {/* Scanner View */}
          <View className="flex-1">
            {!scannedCode ? (
              <>
                <BarCodeScanner
                  onBarCodeScanned={handleBarCodeScanned}
                  style={StyleSheet.absoluteFillObject}
                />
                
                {/* Overlay with scanner frame */}
                <View className="absolute inset-0 items-center justify-center">
                  <View className="relative w-72 h-72">
                    {/* Scanner window */}
                    <View className="absolute inset-0 border-2 border-white/50 rounded-lg overflow-hidden">
                      {/* Scanning line */}
                      <MotiView
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: 2,
                          backgroundColor: 'rgba(124, 58, 237, 0.7)',
                          shadowColor: '#7c3aed',
                          shadowOpacity: 0.7,
                          shadowRadius: 10,
                          transform: [{ translateY: scannerLinePosition }],
                        }}
                      />
                    </View>
                    
                    {/* Corner marks */}
                    <View className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                    <View className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                    <View className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                    <View className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
                  </View>
                </View>
                
                <View className="absolute bottom-20 left-0 right-0">
                  <Text className="text-center text-white text-sm">
                    Position barcode within the frame
                  </Text>
                </View>
              </>
            ) : (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 500 }}
                className="flex-1 items-center justify-center p-6"
              >
                <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-4">
                  <Ionicons name="barcode" size={40} color="#7c3aed" />
                </View>
                <Text className="text-xl font-bold text-white mb-2">
                  Barcode Detected
                </Text>
                <View className="bg-white/10 px-4 py-2 rounded-lg mb-4">
                  <Text className="text-white font-mono">{scannedCode}</Text>
                </View>
                <Text className="text-gray-300 text-center">
                  The product will be identified and analyzed in the next step
                </Text>
              </MotiView>
            )}
          </View>

          {/* Bottom Controls */}
          <View className="bg-black p-6">
            {scannedCode ? (
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Button
                    onPress={handleRetry}
                    variant="secondary"
                    fullWidth
                  >
                    Scan Again
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
            ) : (
              <View className="flex-row items-center justify-around">
                <TouchableOpacity
                  onPress={handleUploadImage}
                  className="items-center"
                >
                  <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center mb-2">
                    <Ionicons name="images" size={24} color="white" />
                  </View>
                  <Text className="text-xs text-white">Upload Image</Text>
                </TouchableOpacity>
                
                <View className="w-16 h-16 rounded-full border-4 border-white/50 items-center justify-center">
                  <Ionicons name="scan" size={30} color="white" />
                </View>
                
                <View className="w-12 opacity-0" />
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </PageTransition>
  );
}