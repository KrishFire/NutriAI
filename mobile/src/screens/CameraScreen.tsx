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
import { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, LoadingSpinner, MealCorrectionModal } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { uploadMealImage } from '../services/storage';
import { analyzeMealImage, analyzeWithVoiceContext, MealAnalysis } from '../services/openai';
import mealAIService from '../services/mealAI';
import { RootStackParamList } from '../types/navigation';
import { ChatMessage, MealAnalysis as SharedMealAnalysis } from '../../../shared/types';

type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const { user } = useAuth();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [type, setType] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // New state for text input and manual workflow
  const [textDescription, setTextDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [savedMeal, setSavedMeal] = useState<{ id: string; mealLogId: string } | null>(null);

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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant access to your photo library');
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
    if (!capturedImage || !user) {
      Alert.alert('Error', 'No image captured or user not authenticated');
      return;
    }

    setAnalyzing(true);
    
    try {
      // Use conditional analysis based on whether text description is provided
      const analysisData = textDescription.trim() 
        ? await analyzeWithVoiceContext(capturedImage, textDescription.trim())
        : await analyzeMealImage(capturedImage);
      
      setAnalysisResult(analysisData);
      console.log('[CameraScreen] Analysis complete:', analysisData);
    } catch (err) {
      Alert.alert(
        'Analysis Failed', 
        err instanceof Error ? err.message : 'Failed to analyze meal photo'
      );
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!capturedImage || !analysisResult || !user) {
      Alert.alert('Error', 'No image or analysis data available');
      return;
    }

    setUploading(true);
    
    try {
      // First, upload the image to Supabase storage
      const { url: uploadedImageUrl, error: uploadError } = await uploadMealImage(capturedImage, user.id);

      if (uploadError) {
        Alert.alert('Upload Failed', uploadError);
        return;
      }

      // Create a meal description that combines image context with any text description
      const mealDescription = textDescription.trim() 
        ? `Photo analysis with context: ${textDescription}`
        : 'Photo-based meal analysis';

      // Save meal to database using mealAI service (this enables corrections)
      const logResult = await mealAIService.logMeal(mealDescription, 'snack');
      
      if (logResult.success && logResult.mealLogId) {
        // Store meal ID for corrections
        setSavedMeal({
          id: logResult.mealLogId,
          mealLogId: logResult.mealLogId
        });
        
        console.log('[CameraScreen] Meal saved with ID:', logResult.mealLogId);
      }

      // Navigate to meal details screen with analysis and upload data
      navigation.navigate('MealDetails', {
        imageUri: capturedImage,
        analysisData: analysisResult,
        uploadedImageUrl,
      });
    } catch (err) {
      Alert.alert(
        'Save Failed', 
        err instanceof Error ? err.message : 'Failed to save meal'
      );
      console.error('Save error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCorrectAnalysis = () => {
    if (!savedMeal) {
      Alert.alert('Error', 'No saved meal data for corrections');
      return;
    }
    setShowCorrectionModal(true);
  };

  const handleCorrectionComplete = (newAnalysis: SharedMealAnalysis, newHistory: ChatMessage[]) => {
    // Convert shared meal analysis back to openai service format
    const convertedAnalysis: MealAnalysis = {
      foods: newAnalysis.foods.map(food => ({
        name: food.name,
        quantity: `${food.quantity} ${food.unit}`,
        nutrition: {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber || 0,
          sugar: food.sugar || 0,
          sodium: food.sodium || 0,
        },
        confidence: newAnalysis.confidence,
      })),
      totalNutrition: {
        calories: newAnalysis.totalCalories,
        protein: newAnalysis.totalProtein,
        carbs: newAnalysis.totalCarbs,
        fat: newAnalysis.totalFat,
      },
      confidence: newAnalysis.confidence,
      notes: newAnalysis.notes,
    };
    
    setAnalysisResult(convertedAnalysis);
    setShowCorrectionModal(false);
    console.log('[CameraScreen] Analysis corrected:', convertedAnalysis);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setTextDescription('');
    setAnalysisResult(null);
    setSavedMeal(null);
    setShowCorrectionModal(false);
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
          <ScrollView style={styles.previewContainer} contentContainerStyle={styles.previewScrollContent}>
            {/* Image Preview */}
            <Image source={{ uri: capturedImage }} style={styles.preview} />
            
            {/* Text Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Describe your meal (optional)</Text>
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

            {/* Analysis Results */}
            {analysisResult && (
              <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>Analysis Results</Text>
                <View style={styles.summaryCard}>
                  <Text style={styles.totalCalories}>{analysisResult.totalNutrition.calories}</Text>
                  <Text style={styles.caloriesLabel}>calories</Text>
                  
                  <View style={styles.macroRow}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{Math.round(analysisResult.totalNutrition.protein)}g</Text>
                      <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{Math.round(analysisResult.totalNutrition.carbs)}g</Text>
                      <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{Math.round(analysisResult.totalNutrition.fat)}g</Text>
                      <Text style={styles.macroLabel}>Fat</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.foodsList}>
                  {analysisResult.foods.map((food, index) => (
                    <View key={index} style={styles.foodItem}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodQuantity}>{food.quantity}</Text>
                      <Text style={styles.foodCalories}>{food.nutrition.calories} cal</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {/* Action Buttons */}
            <View style={styles.previewActions}>
              <View style={styles.actionButtons}>
                <Button
                  title="Retake"
                  onPress={handleRetake}
                  variant="outline"
                  style={styles.actionButton}
                />
                
                {!analysisResult ? (
                  <Button
                    title={analyzing ? "Analyzing..." : "Analyze Meal"}
                    onPress={handleAnalyzeMeal}
                    variant="primary"
                    loading={analyzing}
                    style={styles.actionButton}
                  />
                ) : (
                  <>
                    <Button
                      title="Refine with AI"
                      onPress={handleCorrectAnalysis}
                      variant="outline"
                      style={styles.refineButton}
                    />
                    <Button
                      title={uploading ? "Saving..." : "Save Meal"}
                      onPress={handleSaveMeal}
                      variant="primary"
                      loading={uploading}
                      style={styles.saveButton}
                    />
                  </>
                )}
              </View>
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
          
          <Text style={styles.headerTitle}>Take a Meal Photo</Text>
          
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
      
      {/* Correction Modal - only show if we have saved meal data */}
      {savedMeal && analysisResult && (
        <MealCorrectionModal
          visible={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          mealId={savedMeal.id}
          currentAnalysis={{
            foods: analysisResult.foods.map(food => ({
              name: food.name,
              quantity: parseFloat(food.quantity) || 1,
              unit: food.quantity.replace(/[0-9.]/g, '').trim() || 'serving',
              calories: food.nutrition.calories,
              protein: food.nutrition.protein,
              carbs: food.nutrition.carbs,
              fat: food.nutrition.fat,
              fiber: food.nutrition.fiber || 0,
              sugar: food.nutrition.sugar || 0,
              sodium: food.nutrition.sodium || 0,
            })),
            totalCalories: analysisResult.totalNutrition.calories,
            totalProtein: analysisResult.totalNutrition.protein,
            totalCarbs: analysisResult.totalNutrition.carbs,
            totalFat: analysisResult.totalNutrition.fat,
            confidence: analysisResult.confidence,
            notes: analysisResult.notes
          }}
          onCorrectionComplete={handleCorrectionComplete}
        />
      )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    color: 'white',
    fontSize: 20,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  galleryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
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
    height: 250,
    resizeMode: 'cover',
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
  resultsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalCalories: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  macroLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  foodsList: {
    marginBottom: 16,
  },
  foodItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  foodQuantity: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 8,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  previewActions: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  refineButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});