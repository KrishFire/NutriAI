import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Sparkles, Send } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { hapticFeedback } from '../utils/haptics';
import { RootStackParamList } from '../types/navigation';
import { mealCorrectionService } from '../services/mealCorrection';
import mealAIService, { aiMealToMealAnalysis } from '../services/mealAI';
import { getRelevantSuggestions } from '../constants/refinementSuggestions';
// Removed merge utilities - refinements use AI response directly

type RouteParams = RouteProp<RootStackParamList, 'RefineWithAIScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RefineWithAIScreen'>;

export default function RefineWithAIScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  
  const { analysisData, mealId, description } = route.params || {};
  
  const [refinementText, setRefinementText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputLayout, setInputLayout] = useState({ y: 0 });
  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate relevant suggestions based on meal items
  useEffect(() => {
    if (analysisData?.foods) {
      const mealItems = analysisData.foods.map((food: any) => food.name);
      const relevantSuggestions = getRelevantSuggestions(mealItems, 5);
      setSuggestions(relevantSuggestions.map(s => s.text));
    } else {
      // Default suggestions if no analysis data
      setSuggestions([
        'Add a side of chips',
        'The bread was whole wheat',
        'There was mayo on the sandwich',
        'The portion was smaller',
        'There was cheese on the sandwich',
      ]);
    }
  }, [analysisData]);

  const handleSuggestionPress = (suggestion: string) => {
    hapticFeedback.selection();
    setRefinementText(suggestion);
    textInputRef.current?.focus();
  };

  const handleSubmitRefinement = async () => {
    // DEBUG: Log current analysis data before refinement
    console.log(
      '🔍 DEBUG [RefineWithAI] Current analysis BEFORE refinement:',
      JSON.stringify(analysisData, null, 2)
    );
    console.log('🔍 DEBUG [RefineWithAI] Total macros:', getTotalMacros());
    
    if (!refinementText.trim()) {
      Alert.alert('Error', 'Please enter a refinement message');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback.selection();

    try {
      // If we have a mealId, use the correction service (for already saved meals)
      if (mealId) {
        console.log('🔍 DEBUG [RefineWithAI] Calling mealCorrectionService with:', {
          mealId,
          refinementText: refinementText.trim(),
          currentAnalysisCalories: analysisData?.foods?.map((f: any) => ({
            name: f.name,
            calories: f.nutrition?.calories || f.calories,
          })),
        });
        
        const result = await mealCorrectionService.submitCorrection(
          mealId,
          refinementText.trim()
        );
        
        console.log('🔍 DEBUG [RefineWithAI] Service response:', JSON.stringify(result, null, 2));

        if (!result.success) {
          Alert.alert(
            'Refinement Failed',
            result.error || 'Unable to process your refinement. Please try again.'
          );
          return;
        }

        if (!result.newAnalysis) {
          Alert.alert('Error', 'Received invalid response from server');
          return;
        }

        hapticFeedback.success();
        
        // Reset navigation to clear refine screen from stack
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Main' as any }, // Keep Main in stack so back button works
            {
              name: 'FoodResultsScreen',
              params: {
                analysisData: result.newAnalysis,
                mealId,
                description,
              },
            },
          ],
        });
      } else {
        // Pre-save refinement: analyze ONLY the refinement text to get changes
        console.log('[RefineWithAI] Analyzing refinement:', refinementText.trim());
        console.log('🔍 DEBUG [RefineWithAI] Current data BEFORE refinement:', {
          totalCalories: getTotalMacros().calories,
          foods: analysisData?.foods?.map((f: any) => ({
            name: f.name,
            calories: f.nutrition?.calories || f.calories,
          })),
        });
        
        // Call refineMeal with existing foods for context-aware refinement
        const refinementAnalysis = await mealAIService.refineMeal(
          analysisData?.foods || [],
          refinementText.trim()
        );
        
        console.log('🔍 DEBUG [RefineWithAI] Refinement AI response raw:', JSON.stringify(refinementAnalysis, null, 2));
        
        if (!refinementAnalysis) {
          Alert.alert('Error', 'Failed to process refinement. Please try again.');
          return;
        }
        
        // Convert refinement to the expected format
        const refinedData = aiMealToMealAnalysis(refinementAnalysis);
        
        console.log('🔍 DEBUG [RefineWithAI] Refinement data:', {
          foods: refinedData?.foods?.map((f: any) => ({
            name: f.name,
            calories: f.nutrition?.calories || f.calories,
          })),
        });
        
        // For refinements, use the AI response directly (it's authoritative)
        // The AI already returns the complete meal with all items properly updated
        console.log('🔍 DEBUG [RefineWithAI] Using AI response directly (no merge needed)');
        
        // Use the refined data directly - it already has the complete meal
        const finalAnalysisData = refinedData;
        
        console.log('🔍 DEBUG [RefineWithAI] Final refined data:', {
          totalCalories: finalAnalysisData.totalCalories || finalAnalysisData.totalNutrition?.calories,
          title: finalAnalysisData.title,
          foods: finalAnalysisData.foods?.map((f: any) => ({
            name: f.name,
            calories: f.nutrition?.calories || f.calories,
          })),
        });
        
        hapticFeedback.success();
        
        // Reset navigation to clear refine screen from stack
        // Combine description for context
        const combinedDescription = `${description}. ${refinementText.trim()}`;
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Main' as any }, // Keep Main in stack so back button works
            {
              name: 'FoodResultsScreen',
              params: {
                refinedAnalysisData: finalAnalysisData,
                description: combinedDescription,
              } as any,
            },
          ],
        });
      }
    } catch (error) {
      console.error('[RefineWithAI] Error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals for current analysis display
  const getTotalMacros = () => {
    if (!analysisData?.foods) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    // Sum up macros from all food items - access nutrition property
    return analysisData.foods.reduce((acc: any, food: any) => ({
      calories: acc.calories + (food.nutrition?.calories || 0),
      protein: acc.protein + (food.nutrition?.protein || 0),
      carbs: acc.carbs + (food.nutrition?.carbs || 0),
      fat: acc.fat + (food.nutrition?.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = getTotalMacros();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.selection();
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Refine with AI</Text>
            <Text style={styles.headerSubtitle}>Add details to improve accuracy</Text>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Box */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
          >
            <View style={styles.infoBox}>
              <View style={styles.infoIcon}>
                <Sparkles size={20} color="#320DFF" />
              </View>
              <Text style={styles.infoText}>
                Tell our AI about any details we missed or corrections needed. This helps us improve the accuracy of your meal analysis.
              </Text>
            </View>
          </MotiView>

          {/* Quick Suggestions */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.suggestionsSection}
          >
            <Text style={styles.sectionTitle}>Quick Suggestions</Text>
            <View style={styles.suggestionsContainer}>
              {suggestions.map((suggestion, index) => (
                <AnimatePresence key={`suggestion-${index}`}>
                  <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 250 + index * 50 }}
                  >
                    <TouchableOpacity
                      style={styles.suggestionPill}
                      onPress={() => handleSuggestionPress(suggestion)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  </MotiView>
                </AnimatePresence>
              ))}
            </View>
          </MotiView>

          {/* Your Refinement */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.refinementSection}
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              setInputLayout({ y });
            }}
          >
            <Text style={styles.sectionTitle}>Your Refinement</Text>
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="Example: The sandwich had mayo and cheese, and the bread was whole wheat..."
                placeholderTextColor="#CCCCCC"
                value={refinementText}
                onChangeText={setRefinementText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isSubmitting}
                onFocus={() => {
                  // Scroll to the text input position when keyboard appears
                  if (inputLayout.y > 0) {
                    setTimeout(() => {
                      // Scroll to position with some offset for better visibility
                      scrollViewRef.current?.scrollTo({ 
                        y: Math.max(0, inputLayout.y - 100), 
                        animated: true 
                      });
                    }, 300);
                  }
                }}
              />
            </View>
          </MotiView>

          {/* Current Analysis */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.analysisSection}
          >
            <Text style={styles.analysisLabel}>Current analysis:</Text>
            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>
                {analysisData?.title || description || 'Meal'}
              </Text>
              <Text style={styles.analysisMacros}>
                {totals.calories} calories • {totals.protein}g protein • {totals.carbs}g carbs • {totals.fat}g fat
              </Text>
            </View>
          </MotiView>

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Submit Button - Outside ScrollView, always visible */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600 }}
          style={styles.submitSection}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!refinementText.trim() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitRefinement}
            disabled={!refinementText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Refining...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Refinement</Text>
                <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>
        </MotiView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(50, 13, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  suggestionsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  refinementSection: {
    marginTop: 24,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    maxHeight: 150,
  },
  analysisSection: {
    marginTop: 24,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  analysisCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  analysisMacros: {
    fontSize: 12,
    color: '#6B7280',
  },
  submitSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: '#320DFF',
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});