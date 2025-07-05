import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { RootStackParamList } from '../types/navigation';
import mealAIService, { aiMealToMealAnalysis, AIMealAnalysis } from '../services/mealAI';
import { useAuth } from '../hooks/useAuth';
import { MealCorrectionModal } from '../components';
import { MealAnalysis, ChatMessage } from '../../../shared/types';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManualEntry'>;

interface MealAnalysisState {
  analysis: AIMealAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

interface SavedMealEntry {
  id: string;
  mealLogId: string;
}

export default function ManualEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, session } = useAuth();
  const [description, setDescription] = useState('');
  const [analysisState, setAnalysisState] = useState<MealAnalysisState>({
    analysis: null,
    isLoading: false,
    error: null
  });
  const [savedMeal, setSavedMeal] = useState<SavedMealEntry | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);

  // Debounced analysis function
  const debouncedAnalysis = useCallback(
    debounce(async (mealDescription: string) => {
      if (!mealDescription.trim()) {
        setAnalysisState({
          analysis: null,
          isLoading: false,
          error: null
        });
        return;
      }

      // Check authentication before making API call
      if (!user || !session) {
        setAnalysisState({
          analysis: null,
          isLoading: false,
          error: 'Please log in to analyze meals'
        });
        return;
      }

      setAnalysisState({
        analysis: null,
        isLoading: true,
        error: null
      });

      try {
        console.log('[ManualEntryScreen] Analyzing meal:', mealDescription);
        
        const analysis = await mealAIService.analyzeMeal(mealDescription);

        console.log('[ManualEntryScreen] Analysis result:', analysis);
        
        setAnalysisState({
          analysis,
          isLoading: false,
          error: null
        });

        // Auto-save meal to database for correction capability
        await autoSaveMealForCorrection(mealDescription, analysis);
      } catch (err) {
        console.error('[ManualEntryScreen] Analysis error:', err);
        setAnalysisState({
          analysis: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to analyze meal'
        });
      }
    }, 800),
    [user, session]
  );

  // Auto-save meal for correction capability
  const autoSaveMealForCorrection = async (mealDescription: string, analysis: AIMealAnalysis) => {
    try {
      if (!user) return;
      
      console.log('[ManualEntryScreen] Auto-saving meal for corrections...');
      const result = await mealAIService.logMeal(mealDescription, 'snack');
      
      if (result.success && result.mealLogId) {
        setSavedMeal({
          id: result.mealLogId,
          mealLogId: result.mealLogId
        });
        console.log('[ManualEntryScreen] Meal auto-saved with ID:', result.mealLogId);
      }
    } catch (error) {
      console.log('[ManualEntryScreen] Auto-save failed, corrections will be disabled:', error);
      // Don't show error to user - corrections just won't be available
    }
  };

  // Effect to trigger analysis when description changes
  useEffect(() => {
    debouncedAnalysis(description);
    
    // Cleanup
    return () => {
      debouncedAnalysis.cancel();
    };
  }, [description, debouncedAnalysis]);

  const handleLogMeal = async () => {
    if (!analysisState.analysis) {
      return;
    }

    // Since meal is already saved, just navigate to details
    const analysisData = aiMealToMealAnalysis(analysisState.analysis);
    
    navigation.navigate('MealDetails', {
      analysisData,
    });
  };

  const handleEditAnalysis = () => {
    if (!analysisState.analysis) return;
    
    // Navigate directly to MealDetails for editing
    const analysisData = aiMealToMealAnalysis(analysisState.analysis);
    
    navigation.navigate('MealDetails', {
      analysisData,
    });
  };

  const handleClearDescription = () => {
    setDescription('');
    setAnalysisState({
      analysis: null,
      isLoading: false,
      error: null
    });
  };

  const handleSuggestionPress = (suggestion: string) => {
    setDescription(suggestion);
    debouncedAnalysis(suggestion);
  };

  const handleCorrectAnalysis = () => {
    setShowCorrectionModal(true);
  };

  const handleCorrectionComplete = (newAnalysis: MealAnalysis, newHistory: ChatMessage[]) => {
    // Convert the corrected analysis back to our AI format
    const correctedAIAnalysis: AIMealAnalysis = {
      foods: newAnalysis.foods.map(food => ({
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber || 0,
        sugar: food.sugar || 0,
        sodium: food.sodium || 0,
      })),
      totalCalories: newAnalysis.totalCalories,
      totalProtein: newAnalysis.totalProtein,
      totalCarbs: newAnalysis.totalCarbs,
      totalFat: newAnalysis.totalFat,
      confidence: newAnalysis.confidence,
      notes: newAnalysis.notes
    };

    // Update the analysis state with the corrected data
    setAnalysisState(prev => ({
      ...prev,
      analysis: correctedAIAnalysis,
      error: null
    }));

    console.log(`[ManualEntryScreen] Analysis corrected, ${newAnalysis.foods.length} foods, ${newAnalysis.totalCalories} calories`);
  };

  const renderContent = () => {
    if (analysisState.isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyzing your meal...</Text>
        </View>
      );
    }

    if (analysisState.error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{analysisState.error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => debouncedAnalysis(description)}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (analysisState.analysis) {
      return (
        <View style={styles.analysisContainer}>
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisTitle}>Meal Analysis</Text>
            <Text style={styles.confidenceText}>
              {Math.round(analysisState.analysis.confidence * 100)}% confident
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.totalCalories}>{analysisState.analysis.totalCalories}</Text>
            <Text style={styles.analysisCaloriesLabel}>calories</Text>
            
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{Math.round(analysisState.analysis.totalProtein)}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{Math.round(analysisState.analysis.totalCarbs)}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{Math.round(analysisState.analysis.totalFat)}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.foodsList}>
            {analysisState.analysis.foods.map((food, index) => (
              <View key={index} style={styles.foodItem}>
                <Text style={styles.analysisFoodName}>{food.name}</Text>
                <Text style={styles.foodQuantity}>{food.quantity} {food.unit}</Text>
                <Text style={styles.foodCalories}>{food.calories} cal</Text>
              </View>
            ))}
          </View>
          
          {analysisState.analysis.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{analysisState.analysis.notes}</Text>
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.refineButton} onPress={handleCorrectAnalysis}>
              <Ionicons name="sparkles" size={16} color="#FF9500" />
              <Text style={styles.refineButtonText}>Refine with AI</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.editButton} onPress={handleEditAnalysis}>
              <Ionicons name="pencil" size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Edit Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.logButton} onPress={handleLogMeal}>
              <Text style={styles.logButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (description.length > 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color="#C7C7CC" />
          <Text style={styles.emptyText}>Analyzing "{description}"...</Text>
          <Text style={styles.emptySubtext}>Please wait while we process your meal</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="create" size={48} color="#C7C7CC" />
        <Text style={styles.emptyText}>Start composing your meal</Text>
        <Text style={styles.emptySubtext}>Describe your entire meal naturally - we'll break it down for you</Text>
        
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Examples of great descriptions:</Text>
          {[
            "chicken caesar salad with extra parmesan and croutons",
            "bagel with strawberry cream cheese and orange juice",
            "grilled salmon with quinoa and steamed broccoli",
            "turkey sandwich with chips and a pickle"
          ].map((example, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.exampleChip}
              onPress={() => handleSuggestionPress(example)}
            >
              <Text style={styles.exampleText}>{example}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Compose Your Meal</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Composition Area */}
        <View style={styles.compositionContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="restaurant" size={24} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.compositionInput}
              placeholder="Describe your meal naturally...&#10;e.g., chicken caesar salad with croutons&#10;or bagel with strawberry cream cheese"
              placeholderTextColor="#8E8E93"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              textAlignVertical="top"
              autoFocus={true}
              autoCorrect={true}
              autoCapitalize="sentences"
              numberOfLines={4}
            />
            {description.length > 0 && (
              <TouchableOpacity onPress={handleClearDescription} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
          
          {description.trim().length > 3 && !analysisState.analysis && !analysisState.isLoading && (
            <TouchableOpacity style={styles.analyzeButton} onPress={() => debouncedAnalysis(description)}>
              <Ionicons name="analytics" size={16} color="#FFFFFF" />
              <Text style={styles.analyzeButtonText}>Analyze Meal</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        <ScrollView
          style={styles.scrollView}
          keyboardDismissMode="on-drag"
          contentContainerStyle={!analysisState.analysis ? styles.emptyScrollContent : styles.scrollContent}
        >
          {renderContent()}
        </ScrollView>
        
        {/* AI Meal Correction Modal */}
        {savedMeal && analysisState.analysis && (
          <MealCorrectionModal
            visible={showCorrectionModal}
            onClose={() => setShowCorrectionModal(false)}
            mealId={savedMeal.id}
            currentAnalysis={{
              foods: analysisState.analysis.foods.map(food => ({
                name: food.name,
                quantity: food.quantity,
                unit: food.unit,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                fiber: food.fiber,
                sugar: food.sugar,
                sodium: food.sodium,
              })),
              totalCalories: analysisState.analysis.totalCalories,
              totalProtein: analysisState.analysis.totalProtein,
              totalCarbs: analysisState.analysis.totalCarbs,
              totalFat: analysisState.analysis.totalFat,
              confidence: analysisState.analysis.confidence,
              notes: analysisState.analysis.notes
            }}
            onCorrectionComplete={handleCorrectionComplete}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  compositionContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 100,
  },
  inputIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  compositionInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  clearButton: {
    padding: 4,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  suggestionsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#3C3C43',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
    marginRight: 16,
  },
  searchFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  foodBrand: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  foodServing: {
    fontSize: 14,
    color: '#8E8E93',
  },
  nutritionInfo: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  searchCaloriesLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  verifiedIcon: {
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  // New styles for AI meal analysis
  analysisContainer: {
    padding: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  confidenceText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
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
  analysisCaloriesLabel: {
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
    color: '#000',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisFoodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
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
  notesContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  refineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5E6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  refineButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF9500',
    marginLeft: 6,
  },
  logButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  examplesContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 12,
  },
  exampleChip: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '400',
  },
});