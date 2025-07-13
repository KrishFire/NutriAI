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
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { RootStackParamList } from '../types/navigation';
import mealAIService, {
  aiMealToMealAnalysis,
  AIMealAnalysis,
} from '../services/mealAI';
import { useAuth } from '../hooks/useAuth';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ManualEntry'
>;

type ManualEntryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ManualEntry'
>;

interface MealAnalysisState {
  analysis: AIMealAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

export default function ManualEntryScreen({
  navigation,
  route,
}: ManualEntryScreenProps) {
  const { user, session } = useAuth();
  const [description, setDescription] = useState('');

  // Check if we're in add mode
  const { addToMeal } = route.params || {};
  const [analysisState, setAnalysisState] = useState<MealAnalysisState>({
    analysis: null,
    isLoading: false,
    error: null,
  });

  // Debounced analysis function
  const debouncedAnalysis = useCallback(
    debounce(async (mealDescription: string) => {
      if (!mealDescription.trim()) {
        setAnalysisState({
          analysis: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Check authentication before making API call
      if (!user || !session) {
        setAnalysisState({
          analysis: null,
          isLoading: false,
          error: 'Please log in to analyze meals',
        });
        return;
      }

      setAnalysisState({
        analysis: null,
        isLoading: true,
        error: null,
      });

      try {
        console.log('[ManualEntryScreen] Analyzing meal:', mealDescription);

        const analysis = await mealAIService.analyzeMeal(mealDescription);

        console.log('[ManualEntryScreen] Analysis result:', analysis);

        // Immediately navigate to MealDetails after successful analysis
        const analysisData = aiMealToMealAnalysis(analysis);

        if (addToMeal) {
          // Add mode: Return the analyzed food items to the existing meal
          console.log(
            '[ManualEntryScreen] Add mode: Returning food items to existing meal'
          );

          navigation.navigate('MealDetails', {
            mealId: addToMeal.mealId,
            analysisData: addToMeal.existingAnalysis,
            newFoodItems: analysisData.foods,
            isAddingToExisting: true,
          });
        } else {
          // Normal mode: Save meal first, then navigate with fresh meal ID
          try {
            console.log('[ManualEntryScreen] Saving meal before navigation...');
            const result = await mealAIService.logMeal(
              mealDescription,
              'snack'
            );

            if (result.success && result.mealLogId) {
              console.log(
                '[ManualEntryScreen] Meal saved with ID:',
                result.mealLogId
              );

              navigation.navigate('MealDetails', {
                analysisData,
                mealId: result.mealLogId,
              });
            } else {
              setAnalysisState({
                analysis: null,
                isLoading: false,
                error: 'Failed to save meal',
              });
            }
          } catch (saveError) {
            console.error('[ManualEntryScreen] Save error:', saveError);
            setAnalysisState({
              analysis: null,
              isLoading: false,
              error: 'Failed to save meal',
            });
          }
        }
      } catch (err) {
        console.error('[ManualEntryScreen] Analysis error:', err);
        setAnalysisState({
          analysis: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to analyze meal',
        });
      }
    }, 800),
    [user, session, navigation, addToMeal]
  );

  // Manual analyze function
  const handleAnalyzePress = () => {
    if (description.trim().length > 3) {
      debouncedAnalysis(description);
    }
  };

  const handleClearDescription = () => {
    setDescription('');
    setAnalysisState({
      analysis: null,
      isLoading: false,
      error: null,
    });
  };

  const handleSuggestionPress = (suggestion: string) => {
    setDescription(suggestion);
    // Don't auto-analyze, let user press analyze button
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
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleAnalyzePress}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Show empty state with examples
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="create" size={48} color="#C7C7CC" />
        <Text style={styles.emptyText}>Start composing your meal</Text>
        <Text style={styles.emptySubtext}>
          Describe your entire meal naturally - we'll break it down for you
        </Text>

        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>
            Examples of great descriptions:
          </Text>
          {[
            'chicken caesar salad with extra parmesan and croutons',
            'bagel with strawberry cream cheese and orange juice',
            'grilled salmon with quinoa and steamed broccoli',
            'turkey sandwich with chips and a pickle',
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
          <Text style={styles.headerTitle}>
            {addToMeal ? 'Describe Food Item' : 'Compose Your Meal'}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Composition Area */}
        <View style={styles.compositionContainer}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="restaurant"
              size={24}
              color="#8E8E93"
              style={styles.inputIcon}
            />
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
              <TouchableOpacity
                onPress={handleClearDescription}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {description.trim().length > 3 &&
            !analysisState.analysis &&
            !analysisState.isLoading && (
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={handleAnalyzePress}
              >
                <Ionicons name="analytics" size={16} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>Analyze Meal</Text>
              </TouchableOpacity>
            )}
        </View>

        {/* Results */}
        <ScrollView
          style={styles.scrollView}
          keyboardDismissMode="on-drag"
          contentContainerStyle={
            !analysisState.analysis
              ? styles.emptyScrollContent
              : styles.scrollContent
          }
        >
          {renderContent()}
        </ScrollView>
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
