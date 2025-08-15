import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useRef, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Button, LoadingSpinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { uploadMealImage } from '../services/storage';
import {
  analyzeMealImage,
  analyzeWithVoiceContext,
  MealAnalysis,
} from '../services/openai';
import {
  lookupBarcode,
  nutritionInfoToMealAnalysis,
} from '../services/openFoodFacts';
import mealAIService from '../services/mealAI';
import { RootStackParamList } from '../types/navigation';

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ navigation, route }: CameraScreenProps) {
  const { user } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [type, setType] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanMode, setScanMode] = useState<'photo' | 'barcode'>('photo');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  // State for text input in simplified workflow
  const [textDescription, setTextDescription] = useState('');

  // Check if we're in add mode or edit mode
  const { 
    addToMeal, 
    returnToAddMore, 
    existingMealData, 
    description, 
    mealId,
    isEditMode,
    mealGroupId 
  } = route.params || {};

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // Callbacks for bottom sheet
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scannedBarcode) return; // Prevent multiple scans

    setScannedBarcode(data);
    handlePresentModalPress();
    setAnalyzing(true);

    try {
      console.log('[CameraScreen] Barcode scanned:', data);

      // Lookup barcode in Open Food Facts
      const lookupResult = await lookupBarcode(data);

      if (!lookupResult.success || !lookupResult.data) {
        handleDismissModalPress();
        Alert.alert(
          'Product Not Found',
          'This product was not found in the Open Food Facts database. Try taking a photo instead.',
          [
            {
              text: 'OK',
              onPress: () => {
                setScannedBarcode(null);
                setScanMode('photo');
              },
            },
          ]
        );
        return;
      }

      // Convert to meal analysis format
      const analysisData = nutritionInfoToMealAnalysis(lookupResult.data);

      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      if (addToMeal) {
        // Add mode: Return the scanned product to the existing meal
        navigation.navigate('MealDetails', {
          mealId: addToMeal.mealId,
          analysisData: addToMeal.existingAnalysis,
          newFoodItems: analysisData.foods,
          isAddingToExisting: true,
        });
      } else {
        // Normal mode: Create new meal
        const mealDescription = `Scanned product: ${lookupResult.data.name}`;

        // Auto-save meal
        const logResult = await mealAIService.logMeal(mealDescription, 'snack');

        if (logResult.success) {
          console.log(
            '[CameraScreen] Barcode meal saved with ID:',
            logResult.mealLogId
          );
        }

        // Navigate to MealDetails
        navigation.navigate('MealDetails', {
          analysisData,
          mealId: logResult.mealLogId,
        });
      }

      // Auto-dismiss bottom sheet
      setTimeout(() => {
        handleDismissModalPress();
      }, 500);
    } catch (error) {
      handleDismissModalPress();
      Alert.alert(
        'Scan Failed',
        error instanceof Error ? error.message : 'Failed to process barcode'
      );
      console.error('Barcode scan error:', error);
    } finally {
      setAnalyzing(false);
      setScannedBarcode(null);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        console.error('Camera error:', error);
      }
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please grant access to your photo library'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleAnalyzeMeal = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'No image captured');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Show bottom sheet modal during analysis
    handlePresentModalPress();
    setAnalyzing(true);

    try {
      // First, upload the image to Supabase storage
      const { url: uploadedImageUrl, error: uploadError } =
        await uploadMealImage(capturedImage, user.id);

      if (uploadError) {
        Alert.alert('Upload Failed', uploadError);
        return;
      }

      // Navigate to AnalyzingScreen with proper parameters
      if (isEditMode && mealGroupId) {
        // Edit mode from EditMealScreen: Navigate to AnalyzingScreen with edit params
        navigation.navigate('AnalyzingScreen', {
          imageUri: capturedImage,
          uploadedImageUrl,
          description: textDescription.trim() || 'Photo-based meal analysis',
          isEditMode: true,
          mealGroupId,
        });
      } else if (returnToAddMore) {
        // Add More flow: Navigate to AnalyzingScreen with returnToAddMore flag
        navigation.navigate('AnalyzingScreen', {
          imageUri: capturedImage,
          uploadedImageUrl,
          description: textDescription.trim() || 'Photo-based meal analysis',
          returnToAddMore: true,
          existingMealData,
          existingDescription: description,
          existingMealId: mealId,
        });
      } else if (addToMeal) {
        // Legacy add mode: Navigate to AnalyzingScreen for compatibility
        navigation.navigate('AnalyzingScreen', {
          imageUri: capturedImage,
          uploadedImageUrl,
          description: textDescription.trim() || 'Photo-based meal analysis',
          addToMeal: {
            mealId: addToMeal.mealId,
            existingAnalysis: addToMeal.existingAnalysis,
          },
        });
      } else {
        // Normal mode: Navigate to AnalyzingScreen
        navigation.navigate('AnalyzingScreen', {
          imageUri: capturedImage,
          uploadedImageUrl,
          description: textDescription.trim() || 'Photo-based meal analysis',
        });
      }

      // Auto-dismiss bottom sheet after successful analysis
      setTimeout(() => {
        handleDismissModalPress();
      }, 500);
    } catch (err) {
      handleDismissModalPress();
      Alert.alert(
        'Analysis Failed',
        err instanceof Error ? err.message : 'Failed to analyze meal photo'
      );
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setTextDescription('');
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Requesting camera permission..." />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No access to camera</Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            variant="primary"
            style={styles.galleryButton}
          />
          <Button
            title="Choose from Gallery"
            onPress={pickImageFromGallery}
            variant="outline"
            style={styles.galleryButton}
          />
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.previewContainer}
            contentContainerStyle={styles.previewScrollContent}
          >
            {/* Image Preview */}
            <Image source={{ uri: capturedImage }} style={styles.preview} />

            {/* Text Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                Describe your meal (optional)
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., grilled chicken with extra sauce, whole wheat pasta..."
                placeholderTextColor="#8E8E93"
                value={textDescription}
                onChangeText={setTextDescription}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.previewActions}>
              <Button
                title="Retake Photo"
                onPress={handleRetake}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Analyze Meal"
                onPress={handleAnalyzeMeal}
                variant="primary"
                style={styles.actionButton}
                disabled={analyzing}
                loading={analyzing}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={type}
        ref={cameraRef}
        barcodeScannerSettings={
          scanMode === 'barcode'
            ? {
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
              }
            : undefined
        }
        onBarcodeScanned={
          scanMode === 'barcode' && !scannedBarcode
            ? handleBarCodeScanned
            : undefined
        }
      >
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {scanMode === 'barcode'
              ? 'Scan Barcode'
              : addToMeal
                ? 'Add Food Item'
                : 'Take a Meal Photo'}
          </Text>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => {
              setType(type === 'back' ? 'front' : 'back');
            }}
          >
            <Text style={styles.flipButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              scanMode === 'photo' && styles.modeButtonActive,
            ]}
            onPress={() => {
              setScanMode('photo');
              setScannedBarcode(null);
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                scanMode === 'photo' && styles.modeButtonTextActive,
              ]}
            >
              📸 Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              scanMode === 'barcode' && styles.modeButtonActive,
            ]}
            onPress={() => {
              setScanMode('barcode');
              setScannedBarcode(null);
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                scanMode === 'barcode' && styles.modeButtonTextActive,
              ]}
            >
              📊 Barcode
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cameraFooter}>
          <TouchableOpacity
            style={styles.galleryIcon}
            onPress={pickImageFromGallery}
            disabled={scanMode === 'barcode'}
          >
            <Text
              style={[
                styles.iconText,
                scanMode === 'barcode' && styles.iconDisabled,
              ]}
            >
              📷
            </Text>
          </TouchableOpacity>

          {scanMode === 'photo' ? (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.captureButton, styles.barcodeIndicator]}>
              <Text style={styles.barcodeIndicatorText}>🔍</Text>
            </View>
          )}

          <View style={styles.placeholder} />
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {scanMode === 'barcode'
              ? 'Align barcode within the camera view'
              : 'Position your meal in the center of the frame'}
          </Text>
        </View>

        {/* Barcode scanning overlay */}
        {scanMode === 'barcode' && (
          <View style={styles.barcodeOverlay}>
            <View style={styles.barcodeScanArea} />
          </View>
        )}
      </CameraView>

      {/* Bottom Sheet Modal for Analysis */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        enableDismissOnClose={true}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.analysisModalContent}>
            <LoadingIndicator size="large" />
            <Text style={styles.analysisModalTitle}>
              {scanMode === 'barcode'
                ? 'Looking up product...'
                : 'Analyzing your meal...'}
            </Text>
            <Text style={styles.analysisModalSubtext}>
              This will take just a moment
            </Text>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  galleryButton: {
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 20,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  galleryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconText: {
    fontSize: 24,
    color: 'white',
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  previewScrollContent: {
    flexGrow: 1,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    resizeMode: 'cover',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  // Bottom Sheet Modal Styles
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 24,
  },
  analysisModalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  analysisModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    textAlign: 'center',
  },
  analysisModalSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  previewActions: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 16,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 40,
    marginTop: 10,
    alignSelf: 'center',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: 'white',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modeButtonTextActive: {
    color: '#007AFF',
  },
  iconDisabled: {
    opacity: 0.3,
  },
  barcodeIndicator: {
    backgroundColor: '#007AFF',
    borderColor: 'rgba(0, 122, 255, 0.8)',
  },
  barcodeIndicatorText: {
    fontSize: 32,
  },
  barcodeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeScanArea: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
});
