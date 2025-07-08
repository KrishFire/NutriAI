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
  ActivityIndicator,
} from 'react-native';
import { useState, useRef, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Button, LoadingSpinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { uploadMealImage } from '../services/storage';
import {
  analyzeMealImage,
  analyzeWithVoiceContext,
  MealAnalysis,
} from '../services/openai';
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

  // State for text input in simplified workflow
  const [textDescription, setTextDescription] = useState('');

  // Check if we're in add mode
  const { addToMeal } = route.params || {};

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // Callbacks for bottom sheet
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

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

      // Use conditional analysis based on whether text description is provided
      const analysisData = textDescription.trim()
        ? await analyzeWithVoiceContext(capturedImage, textDescription.trim())
        : await analyzeMealImage(capturedImage);

      console.log('[CameraScreen] Analysis complete:', analysisData);

      if (addToMeal) {
        // Add mode: Return the analyzed food items to the existing meal
        console.log('[CameraScreen] Add mode: Returning food items to existing meal');
        
        navigation.navigate('MealDetails', {
          mealId: addToMeal.mealId,
          imageUri: capturedImage,
          analysisData: addToMeal.existingAnalysis,
          uploadedImageUrl,
          newFoodItems: analysisData.foods,
        });
      } else {
        // Normal mode: Create new meal
        const mealDescription = textDescription.trim()
          ? `Photo analysis with context: ${textDescription}`
          : 'Photo-based meal analysis';

        // Auto-save meal using mealAI service (enables corrections in MealDetailsScreen)
        const logResult = await mealAIService.logMeal(mealDescription, 'snack');

        if (logResult.success) {
          console.log(
            '[CameraScreen] Meal auto-saved with ID:',
            logResult.mealLogId
          );
        }

        // Navigate directly to MealDetailsScreen (like ManualEntryScreen does)
        navigation.navigate('MealDetails', {
          imageUri: capturedImage,
          analysisData,
          uploadedImageUrl,
          mealId: logResult.mealLogId,
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
      <CameraView style={styles.camera} facing={type} ref={cameraRef}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {addToMeal ? 'Add Food Item' : 'Take a Meal Photo'}
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

        <View style={styles.cameraFooter}>
          <TouchableOpacity
            style={styles.galleryIcon}
            onPress={pickImageFromGallery}
          >
            <Text style={styles.iconText}>📷</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Position your meal in the center of the frame
          </Text>
        </View>
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
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.analysisModalTitle}>
              Analyzing your meal...
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
    aspectRatio: 4/3,
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
});
