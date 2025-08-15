import React, { useState, useEffect, useReducer, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Heart,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  Trash2,
  Camera,
  Mic,
  Scan,
  Search,
  Sparkles,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { RootStackParamList } from '../types/navigation';
import { getMealDetailsByGroupId, updateMealByGroupId } from '../services/meals';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { hapticFeedback } from '../utils/haptics';
import FoodItemCard from '../components/FoodItemCard';
import { useSyncedFavoriting } from '../hooks/useSyncedFavoriting';
import AnimatedDonutChart from '../components/common/AnimatedDonutChart';

type EditMealScreenRouteProp = RouteProp<RootStackParamList, 'EditMeal'>;
type EditMealScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditMeal'>;

// Stable empty array reference to prevent infinite re-renders
const EMPTY_ARRAY: FoodItemData[] = [];

interface FoodItemData {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isFavorite: boolean;
  ingredients?: FoodItemData[];
  servingMultiplier: number;
}

interface MealData {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  foods: FoodItemData[];
  imageUrl?: string;
  notes?: string;
  title?: string;
  description?: string; // Add description for compatibility
}

// State management
type State = {
  mealData: MealData | null;
  isEditMode: boolean;
  expandedItems: Set<number>;
  loading: boolean;
  saving: boolean;
};

type Action =
  | { type: 'SET_MEAL_DATA'; data: MealData }
  | { type: 'TOGGLE_EDIT_MODE' }
  | { type: 'TOGGLE_EXPANDED'; index: number }
  | { type: 'DELETE_FOOD'; foodId: string }
  | { type: 'DELETE_INGREDIENT'; foodId: string; ingredientId: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'UPDATE_FOODS'; foods: FoodItemData[] }
  | { type: 'UPDATE_SERVING_MULTIPLIER'; foodId: string; delta: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MEAL_DATA':
      return { ...state, mealData: action.data, loading: false };
    
    case 'TOGGLE_EDIT_MODE':
      return { ...state, isEditMode: !state.isEditMode };
    
    case 'TOGGLE_EXPANDED': {
      const newExpanded = new Set(state.expandedItems);
      if (newExpanded.has(action.index)) {
        newExpanded.delete(action.index);
      } else {
        newExpanded.add(action.index);
      }
      return { ...state, expandedItems: newExpanded };
    }
    
    case 'DELETE_FOOD': {
      if (!state.mealData) return state;
      const newFoods = state.mealData.foods.filter(f => f.id !== action.foodId);
      const newMealData = {
        ...state.mealData,
        foods: newFoods,
        // Recalculate totals
        totalCalories: newFoods.reduce((sum, f) => sum + f.calories, 0),
        totalProtein: newFoods.reduce((sum, f) => sum + f.protein, 0),
        totalCarbs: newFoods.reduce((sum, f) => sum + f.carbs, 0),
        totalFat: newFoods.reduce((sum, f) => sum + f.fat, 0),
      };
      return { ...state, mealData: newMealData };
    }
    
    case 'DELETE_INGREDIENT': {
      if (!state.mealData) return state;
      const newFoods = state.mealData.foods.map(food => {
        if (food.id === action.foodId && food.ingredients) {
          const deletedIngredient = food.ingredients.find(i => i.id === action.ingredientId);
          if (!deletedIngredient) return food;
          
          const newIngredients = food.ingredients.filter(i => i.id !== action.ingredientId);
          
          // Recalculate parent food nutrition
          return {
            ...food,
            ingredients: newIngredients,
            calories: Math.max(0, food.calories - deletedIngredient.calories),
            protein: Math.max(0, food.protein - deletedIngredient.protein),
            carbs: Math.max(0, food.carbs - deletedIngredient.carbs),
            fat: Math.max(0, food.fat - deletedIngredient.fat),
          };
        }
        return food;
      });
      
      const newMealData = {
        ...state.mealData,
        foods: newFoods,
        // Recalculate totals
        totalCalories: newFoods.reduce((sum, f) => sum + f.calories, 0),
        totalProtein: newFoods.reduce((sum, f) => sum + f.protein, 0),
        totalCarbs: newFoods.reduce((sum, f) => sum + f.carbs, 0),
        totalFat: newFoods.reduce((sum, f) => sum + f.fat, 0),
      };
      return { ...state, mealData: newMealData };
    }
    
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    
    case 'SET_SAVING':
      return { ...state, saving: action.saving };
    
    case 'UPDATE_SERVING_MULTIPLIER': {
      if (!state.mealData) return state;
      
      const newFoods = state.mealData.foods.map(food => {
        if (food.id === action.foodId) {
          const currentMultiplier = food.servingMultiplier || 1;
          const newMultiplier = Math.max(0.5, currentMultiplier + action.delta);
          
          // Store original values if not already stored
          const baseCalories = food.calories / currentMultiplier;
          const baseProtein = food.protein / currentMultiplier;
          const baseCarbs = food.carbs / currentMultiplier;
          const baseFat = food.fat / currentMultiplier;
          
          return {
            ...food,
            servingMultiplier: newMultiplier,
            calories: Math.round(baseCalories * newMultiplier),
            protein: Math.round(baseProtein * newMultiplier),
            carbs: Math.round(baseCarbs * newMultiplier),
            fat: Math.round(baseFat * newMultiplier),
          };
        }
        return food;
      });
      
      const newMealData = {
        ...state.mealData,
        foods: newFoods,
        totalCalories: newFoods.reduce((sum, f) => sum + f.calories, 0),
        totalProtein: newFoods.reduce((sum, f) => sum + f.protein, 0),
        totalCarbs: newFoods.reduce((sum, f) => sum + f.carbs, 0),
        totalFat: newFoods.reduce((sum, f) => sum + f.fat, 0),
      };
      
      return { ...state, mealData: newMealData };
    }
    
    case 'UPDATE_FOODS':
      if (!state.mealData) return state;
      return { 
        ...state, 
        mealData: { 
          ...state.mealData, 
          foods: action.foods 
        } 
      };
    
    default:
      return state;
  }
}

export default function EditMealScreen() {
  const navigation = useNavigation<EditMealScreenNavigationProp>();
  const route = useRoute<EditMealScreenRouteProp>();
  const { user } = useAuth();
  const isLoadingRef = useRef(false);
  
  const { mealId, meal } = route.params || {};
  const mealGroupId = meal?.mealGroupId || mealId;
  
  const [state, dispatch] = useReducer(reducer, {
    mealData: null,
    isEditMode: false,
    expandedItems: new Set(),
    loading: true,
    saving: false,
  });
  
  // Use synced favoriting hook for foods
  const { items: syncedFoods, toggleFavorite } = useSyncedFavoriting<FoodItemData>(
    state.mealData?.foods || EMPTY_ARRAY
  );
  
  // Helper function to recursively map food items and their ingredients
  const mapApiFoodToViewData = (apiItem: any, parentIndex: number, ingredientIndex?: number): FoodItemData => {
    const id = ingredientIndex !== undefined 
      ? `food_${parentIndex}_ing_${ingredientIndex}`
      : `food_${parentIndex}`;
    
    const mappedIngredients = (apiItem.ingredients || []).map((ing: any, idx: number) => 
      mapApiFoodToViewData(ing, parentIndex, idx)
    );
    
    return {
      id,
      name: apiItem.name,
      quantity: apiItem.quantity || '',
      calories: apiItem.nutrition?.calories || apiItem.calories || 0,
      protein: apiItem.nutrition?.protein || apiItem.protein || 0,
      carbs: apiItem.nutrition?.carbs || apiItem.carbs || 0,
      fat: apiItem.nutrition?.fat || apiItem.fat || 0,
      fiber: apiItem.nutrition?.fiber || apiItem.fiber,
      sugar: apiItem.nutrition?.sugar || apiItem.sugar,
      sodium: apiItem.nutrition?.sodium || apiItem.sodium,
      isFavorite: false,
      ingredients: mappedIngredients,
      servingMultiplier: 1,
    };
  };
  
  useEffect(() => {
    loadMealData();
  }, [mealGroupId]);
  
  // Refresh data when screen regains focus (e.g., returning from food input screens)
  useFocusEffect(
    React.useCallback(() => {
      // Only reload if not currently loading and we have a mealGroupId
      if (mealGroupId && !isLoadingRef.current) {
        loadMealData();
      }
    }, [mealGroupId])
  );
  
  const loadMealData = async () => {
    if (!user || !mealGroupId) {
      dispatch({ type: 'SET_LOADING', loading: false });
      return;
    }
    
    // Prevent concurrent loads
    if (isLoadingRef.current) {
      return;
    }
    
    try {
      isLoadingRef.current = true;
      dispatch({ type: 'SET_LOADING', loading: true });
      
      // Fetch meal details by group ID
      const result = await getMealDetailsByGroupId(mealGroupId, user.id);
      
      if (result.success && result.data) {
        const mealAnalysis = result.data;
        
        // Get the first meal entry to extract metadata
        const { data: mealEntry } = await supabase
          .from('meal_entries')
          .select('meal_type, logged_at')
          .eq('meal_group_id', mealGroupId)
          .eq('user_id', user.id)
          .single();
        
        // Convert to our display format
        const formattedMeal: MealData = {
          mealType: (mealEntry?.meal_type || 'snack') as MealData['mealType'],
          loggedAt: mealEntry?.logged_at || new Date().toISOString(),
          totalCalories: mealAnalysis.totalNutrition?.calories || 0,
          totalProtein: mealAnalysis.totalNutrition?.protein || 0,
          totalCarbs: mealAnalysis.totalNutrition?.carbs || 0,
          totalFat: mealAnalysis.totalNutrition?.fat || 0,
          foods: mealAnalysis.foods?.map((food, index) => mapApiFoodToViewData(food, index)) || [],
          imageUrl: result.imageUrl,
          notes: mealAnalysis.notes,
          title: mealAnalysis.title || mealAnalysis.mealTitle || mealAnalysis.description,
          description: mealAnalysis.description || mealAnalysis.title || mealAnalysis.mealTitle,
        };
        
        dispatch({ type: 'SET_MEAL_DATA', data: formattedMeal });
      } else {
        throw new Error(result.error || 'Failed to load meal details');
      }
    } catch (error) {
      console.error('[EditMealScreen] Error loading meal:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load meal details');
      dispatch({ type: 'SET_LOADING', loading: false });
    } finally {
      // Always reset loading ref
      isLoadingRef.current = false;
    }
  };
  
  const handleToggleExpanded = (index: number) => {
    hapticFeedback.selection();
    dispatch({ type: 'TOGGLE_EXPANDED', index });
  };
  
  const handleToggleEditMode = () => {
    hapticFeedback.selection();
    dispatch({ type: 'TOGGLE_EDIT_MODE' });
  };
  
  const updateServingMultiplier = (foodId: string, delta: number) => {
    hapticFeedback.selection();
    dispatch({ type: 'UPDATE_SERVING_MULTIPLIER', foodId, delta });
  };
  const handleDeleteFood = (foodId: string) => {
    hapticFeedback.impact();
    Alert.alert(
      'Delete Food Item',
      'Are you sure you want to delete this food item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_FOOD', foodId }),
        },
      ]
    );
  };
  
  const handleDeleteIngredient = (foodId: string, ingredientId: string) => {
    hapticFeedback.impact();
    dispatch({ type: 'DELETE_INGREDIENT', foodId, ingredientId });
  };
  
  const handleAddMore = (method: string) => {
    hapticFeedback.selection();
    
    // Pass edit mode params to food input screens
    const editParams = { 
      isEditMode: true, 
      mealGroupId: mealGroupId 
    };
    
    // Navigate directly to individual screens (not modal)
    switch (method) {
      case 'camera':
        navigation.navigate('CameraInput', editParams);
        break;
      case 'voice':
        navigation.navigate('VoiceLog', editParams);
        break;
      case 'barcode':
        navigation.navigate('BarcodeInput', editParams);
        break;
      case 'text':
        navigation.navigate('TextInput', editParams);
        break;
    }
  };
  
  const handleRefineWithAI = () => {
    hapticFeedback.selection();
    if (!state.mealData) return;
    
    // Navigate to RefineWithAIScreen with current meal data
    navigation.navigate('RefineWithAIScreen', {
      analysisData: {
        foods: state.mealData.foods.map(food => ({
          name: food.name,
          quantity: food.quantity,
          nutrition: {
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber,
            sugar: food.sugar,
            sodium: food.sodium,
          },
          ingredients: food.ingredients?.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            nutrition: {
              calories: ing.calories,
              protein: ing.protein,
              carbs: ing.carbs,
              fat: ing.fat,
              fiber: ing.fiber,
              sugar: ing.sugar,
              sodium: ing.sodium,
            },
          })),
        })),
        totalNutrition: {
          calories: state.mealData.totalCalories,
          protein: state.mealData.totalProtein,
          carbs: state.mealData.totalCarbs,
          fat: state.mealData.totalFat,
        },
      },
      description: state.mealData.title || `${state.mealData.mealType} meal`,
      source: 'EditMeal',
      mealId: mealGroupId, // Pass the meal group ID for edit mode
    });
  };
  
  const handleSaveChanges = async () => {
    if (!state.mealData || !user || !mealGroupId) return;
    
    hapticFeedback.success();
    dispatch({ type: 'SET_SAVING', saving: true });
    
    try {
      // Transform the meal data back to the format expected by the service
      const analysisData = {
        foods: state.mealData.foods.map(food => ({
          name: food.name,
          quantity: food.quantity,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          sugar: food.sugar,
          sodium: food.sodium,
          ingredients: food.ingredients?.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            calories: ing.calories,
            protein: ing.protein,
            carbs: ing.carbs,
            fat: ing.fat,
            fiber: ing.fiber,
            sugar: ing.sugar,
            sodium: ing.sodium,
          })),
        })),
        totalCalories: state.mealData.totalCalories,
        totalProtein: state.mealData.totalProtein,
        totalCarbs: state.mealData.totalCarbs,
        totalFat: state.mealData.totalFat,
        confidence: 0.95,
        notes: state.mealData.notes,
        title: state.mealData.title,
        description: state.mealData.description,
      };
      
      const result = await updateMealByGroupId(
        mealGroupId,
        user.id,
        analysisData,
        state.mealData.imageUrl,
        state.mealData.notes
      );
      
      if (result.success) {
        // Navigate to MealSavedScreen for success animation with updated totals
        navigation.navigate('MealSaved' as any, {
          meal: {
            id: mealGroupId,
            description: state.mealData.description || 'Meal',
            type: state.mealData.mealType,
            foods: analysisData.foods,
            // Flat properties for MealSavedScreen
            calories: state.mealData.totalCalories,
            protein: state.mealData.totalProtein,
            carbs: state.mealData.totalCarbs,
            fat: state.mealData.totalFat,
          },
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('[EditMealScreen] Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  };
  
  if (state.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#320DFF" />
          <Text style={styles.loadingText}>Loading meal details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!state.mealData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load meal</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
        >
          <View style={styles.headerButtonBg}>
            <ArrowLeft size={20} color="#000" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Meal</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleToggleEditMode}
        >
          <View style={[styles.headerButtonBg, state.isEditMode && styles.editButtonActive]}>
            {state.isEditMode ? (
              <Check size={20} color="#320DFF" />
            ) : (
              <Edit2 size={20} color="#1F2937" />
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Nutrition Summary Section */}
        <View style={styles.nutritionSection}>
          <Text style={styles.nutritionTitle}>
            {state.mealData.totalCalories} Calories
          </Text>
          
          {/* Animated Donut Chart */}
          <View style={styles.chartContainer}>
            <AnimatedDonutChart
              size={160}
              strokeWidth={24}
              data={(() => {
                const totalGrams = state.mealData.totalProtein + state.mealData.totalCarbs + state.mealData.totalFat;
                if (totalGrams === 0) {
                  return [{ key: 'empty', value: 100, color: '#E5E7EB' }];
                }
                return [
                  { 
                    key: 'carbs', 
                    value: (state.mealData.totalCarbs / totalGrams) * 100, 
                    color: '#FFC078' 
                  },
                  { 
                    key: 'protein', 
                    value: (state.mealData.totalProtein / totalGrams) * 100, 
                    color: '#74C0FC' 
                  },
                  { 
                    key: 'fat', 
                    value: (state.mealData.totalFat / totalGrams) * 100, 
                    color: '#8CE99A' 
                  },
                ];
              })()}
              animationDuration={800}
              delayBetweenSegments={100}
            />
          </View>
          
          {/* Macro Legend */}
          <View style={styles.macroLegend}>
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroColorDot, { backgroundColor: '#FFC078' }]} />
              <Text style={styles.macroLegendLabel}>Carbs</Text>
              <Text style={styles.macroLegendValue}>{Math.round(state.mealData.totalCarbs)}g</Text>
            </View>
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroColorDot, { backgroundColor: '#74C0FC' }]} />
              <Text style={styles.macroLegendLabel}>Protein</Text>
              <Text style={styles.macroLegendValue}>{Math.round(state.mealData.totalProtein)}g</Text>
            </View>
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroColorDot, { backgroundColor: '#8CE99A' }]} />
              <Text style={styles.macroLegendLabel}>Fat</Text>
              <Text style={styles.macroLegendValue}>{Math.round(state.mealData.totalFat)}g</Text>
            </View>
          </View>
        </View>
        
        {/* Food Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Items</Text>
          
          {syncedFoods.map((food, index) => (
            <View key={food.id} style={styles.foodCardWrapper}>
              <FoodItemCard
                item={{
                  id: food.id,
                  name: food.name,
                  nutrition: {
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                    fiber: food.fiber,
                    sugar: food.sugar,
                    sodium: food.sodium,
                  },
                  isFavorite: food.isFavorite,
                  isParent: food.ingredients && food.ingredients.length > 0,
                  expanded: state.expandedItems.has(index),
                  ingredients: (food.ingredients || []).map((ing) => ({
                    id: ing.id,
                    name: ing.name,
                    quantity: ing.quantity || '',
                    nutrition: {
                      calories: ing.calories || 0,
                      protein: ing.protein || 0,
                      carbs: ing.carbs || 0,
                      fat: ing.fat || 0,
                      fiber: ing.fiber,
                      sugar: ing.sugar,
                      sodium: ing.sodium,
                    },
                    isFavorite: ing.isFavorite,
                  })),
                  quantity: food.quantity,
                  servingMultiplier: food.servingMultiplier || 1,
                }}
                index={index}
                isEditMode={state.isEditMode}
                onToggleExpanded={() => handleToggleExpanded(index)}
                onToggleFavorite={(groupId: string, itemId?: string) => {
                  hapticFeedback.selection();
                  toggleFavorite(groupId, itemId);
                }}
                onDelete={(groupId: string) => handleDeleteFood(groupId)}
                onDeleteIngredient={(groupId: string, itemId: string) => 
                  handleDeleteIngredient(groupId, itemId)
                }
                showExpandable={true}
                showQuantity={true}
                showServingStepper={true}
                onUpdateServing={(foodId, delta) => updateServingMultiplier(foodId, delta)}
              />
            </View>
          ))}
        </View>
        
        {/* Add More Food Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add More Food</Text>
          
          <View style={styles.addMoreGrid}>
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => handleAddMore('camera')}
            >
              <View style={styles.addMoreIcon}>
                <Camera size={18} color="#320DFF" />
              </View>
              <Text style={styles.addMoreText}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => handleAddMore('voice')}
            >
              <View style={styles.addMoreIcon}>
                <Mic size={18} color="#320DFF" />
              </View>
              <Text style={styles.addMoreText}>Voice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => handleAddMore('barcode')}
            >
              <View style={styles.addMoreIcon}>
                <Scan size={18} color="#320DFF" />
              </View>
              <Text style={styles.addMoreText}>Barcode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => handleAddMore('text')}
            >
              <View style={styles.addMoreIcon}>
                <Search size={18} color="#320DFF" />
              </View>
              <Text style={styles.addMoreText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.refineButton}
            onPress={handleRefineWithAI}
          >
            <Sparkles size={18} color="#1F2937" />
            <Text style={styles.refineButtonText}>Refine with AI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, state.saving && styles.saveButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={state.saving}
          >
            {state.saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#320DFF',
    borderRadius: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 4,
  },
  headerButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonActive: {
    backgroundColor: '#E0E7FF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  foodCardWrapper: {
    marginBottom: 0,
  },
  addMoreGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  addMoreButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addMoreIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(50, 13, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addMoreText: {
    fontSize: 10,
    color: '#6B7280',
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 16,
  },
  refineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingVertical: 20,
    gap: 8,
  },
  refineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#320DFF',
    borderRadius: 999,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nutritionSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  nutritionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  macroLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  macroLegendItem: {
    alignItems: 'center',
  },
  macroColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  macroLegendLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  macroLegendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});