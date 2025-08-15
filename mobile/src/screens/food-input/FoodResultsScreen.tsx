import React, { useState, useReducer, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Heart,
  Plus,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  Trash2,
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import mealAIService from '../../services/mealAI';
import { appendFoodsToMeal } from '../../services/meals';
import { groupsToMealAnalysis } from '../../utils/mealGrouping';
import FoodItemCard from '../../components/FoodItemCard';
import AnimatedDonutChart from '../../components/common/AnimatedDonutChart';

type RouteParams = RouteProp<RootStackParamList, 'FoodResultsScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodResultsScreen'>;

// Types for food groups and ingredients
interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  nutrition: Nutrition;
  isFavorite: boolean;
}

interface FoodGroup {
  id: string;
  name: string;
  isParent: boolean;
  baseNutrition: Nutrition;
  nutrition: Nutrition;
  servingMultiplier: number;
  expanded: boolean;
  isFavorite: boolean;
  ingredients: Ingredient[];
}

// State management
type State = {
  foodGroups: FoodGroup[];
  isEditMode: boolean;
};

type Action =
  | { type: 'TOGGLE_FAVORITE'; groupId: string; itemId?: string }
  | { type: 'TOGGLE_EXPANDED'; groupId: string }
  | { type: 'UPDATE_SERVING_MULTIPLIER'; foodId: string; delta: number }
  | { type: 'SET_FOOD_GROUPS'; groups: FoodGroup[] }
  | { type: 'TOGGLE_EDIT_MODE' }
  | { type: 'DELETE_FOOD_GROUP'; groupId: string }
  | { type: 'DELETE_INGREDIENT'; groupId: string; itemId: string }
  | { type: 'UPDATE_NUTRITION'; groupId: string; itemId?: string; nutrition: Nutrition };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE_FAVORITE': {
      const { groupId, itemId } = action;
      const newGroups = [...state.foodGroups];
      const groupIndex = newGroups.findIndex(g => g.id === groupId);
      
      if (groupIndex === -1) return state;
      
      if (!itemId) {
        // Toggle parent and cascade to children
        const group = newGroups[groupIndex];
        const newFavoriteState = !group.isFavorite;
        
        newGroups[groupIndex] = {
          ...group,
          isFavorite: newFavoriteState,
          ingredients: group.ingredients.map(item => ({
            ...item,
            isFavorite: newFavoriteState,
          })),
        };
      } else {
        // Toggle individual child
        const group = newGroups[groupIndex];
        const itemIndex = group.ingredients.findIndex(i => i.id === itemId);
        
        if (itemIndex !== -1) {
          const newIngredients = [...group.ingredients];
          newIngredients[itemIndex] = {
            ...newIngredients[itemIndex],
            isFavorite: !newIngredients[itemIndex].isFavorite,
          };
          
          // Update parent favorite status based on children
          const allFavorite = newIngredients.every(i => i.isFavorite);
          const noneFavorite = newIngredients.every(i => !i.isFavorite);
          
          newGroups[groupIndex] = {
            ...group,
            ingredients: newIngredients,
            isFavorite: allFavorite,
          };
        }
      }
      
      return { ...state, foodGroups: newGroups };
    }
    
    case 'TOGGLE_EXPANDED': {
      const newGroups = state.foodGroups.map(group =>
        group.id === action.groupId
          ? { ...group, expanded: !group.expanded }
          : group
      );
      return { ...state, foodGroups: newGroups };
    }
    
    case 'UPDATE_SERVING_MULTIPLIER': {
      const newGroups = state.foodGroups.map(group => {
        if (group.id === action.foodId) {
          const currentMultiplier = group.servingMultiplier || 1;
          const newMultiplier = Math.max(0.5, currentMultiplier + action.delta);
          
          return {
            ...group,
            servingMultiplier: newMultiplier,
            nutrition: {
              calories: Math.round(group.baseNutrition.calories * newMultiplier),
              protein: Math.round(group.baseNutrition.protein * newMultiplier),
              carbs: Math.round(group.baseNutrition.carbs * newMultiplier),
              fat: Math.round(group.baseNutrition.fat * newMultiplier),
            },
          };
        }
        return group;
      });
      
      return { ...state, foodGroups: newGroups };
    }
    
    case 'SET_FOOD_GROUPS': {
      return { ...state, foodGroups: action.groups };
    }
    
    case 'TOGGLE_EDIT_MODE': {
      return { ...state, isEditMode: !state.isEditMode };
    }
    
    case 'DELETE_FOOD_GROUP': {
      const newGroups = state.foodGroups.filter(g => g.id !== action.groupId);
      return { ...state, foodGroups: newGroups };
    }
    
    case 'DELETE_INGREDIENT': {
      const newGroups = state.foodGroups.map(group => {
        if (group.id === action.groupId) {
          const newIngredients = group.ingredients.filter(i => i.id !== action.itemId);
          // Recalculate parent nutrition after removing ingredient
          const removedIngredient = group.ingredients.find(i => i.id === action.itemId);
          if (removedIngredient) {
            const newNutrition = {
              calories: Math.max(0, group.nutrition.calories - removedIngredient.nutrition.calories),
              protein: Math.max(0, group.nutrition.protein - removedIngredient.nutrition.protein),
              carbs: Math.max(0, group.nutrition.carbs - removedIngredient.nutrition.carbs),
              fat: Math.max(0, group.nutrition.fat - removedIngredient.nutrition.fat),
            };
            const newBaseNutrition = {
              calories: Math.max(0, group.baseNutrition.calories - removedIngredient.nutrition.calories),
              protein: Math.max(0, group.baseNutrition.protein - removedIngredient.nutrition.protein),
              carbs: Math.max(0, group.baseNutrition.carbs - removedIngredient.nutrition.carbs),
              fat: Math.max(0, group.baseNutrition.fat - removedIngredient.nutrition.fat),
            };
            return {
              ...group,
              ingredients: newIngredients,
              nutrition: newNutrition,
              baseNutrition: newBaseNutrition,
            };
          }
          return { ...group, ingredients: newIngredients };
        }
        return group;
      });
      return { ...state, foodGroups: newGroups };
    }
    
    case 'UPDATE_NUTRITION': {
      // This would be used for inline editing of macros
      // Implementation would depend on how you want to handle the UI for editing
      return state;
    }
    
    default:
      return state;
  }
}

// Auto-assign meal type based on current time
const getAutoMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 5 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 15) {
    return 'lunch';
  } else if (hour >= 17 && hour < 21) {
    return 'dinner';
  } else {
    return 'snack';
  }
};

export default function FoodResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  const { user } = useAuth();
  
  // Parse the analyzed data from route params
  // Use refinedAnalysisData if available (from refinement), otherwise use analysisData
  const rawParams = route.params || {};
  const analysisData = rawParams.refinedAnalysisData || rawParams.analysisData;
  const description = rawParams.description;
  const isEditMode = rawParams.isEditMode;
  const mealGroupId = rawParams.mealGroupId;
  
  // DEBUG: Log received data
  if (rawParams.refinedAnalysisData) {
    console.log('🔍 DEBUG [FoodResults] Received REFINED data:', {
      totalCalories: analysisData?.totalCalories || analysisData?.totalNutrition?.calories,
      foods: analysisData?.foods?.map((f: any) => ({
        name: f.name,
        calories: f.nutrition?.calories || f.calories,
      })),
    });
  }
  
  // Auto-assigned meal type (not in state since it's not user-selectable)
  const autoMealType = getAutoMealType();
  
  // Initialize state with reducer
  const [state, dispatch] = useReducer(reducer, {
    foodGroups: [],
    isEditMode: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Transform AI analysis data into FoodGroups structure
  useEffect(() => {
    if (analysisData) {
      const groups = transformAnalysisToGroups(analysisData);
      dispatch({ type: 'SET_FOOD_GROUPS', groups });
    } else {
      // Demo data for development
      const demoGroups: FoodGroup[] = [
        {
          id: 'sandwich',
          name: 'Turkey Sandwich',
          isParent: true,
          baseNutrition: { calories: 380, protein: 25, carbs: 45, fat: 12 },
          nutrition: { calories: 380, protein: 25, carbs: 45, fat: 12 },
          servingMultiplier: 1,
          expanded: false,
          isFavorite: false,
          ingredients: [
            {
              id: 'bread',
              name: 'Whole Wheat Bread',
              quantity: '2 slices',
              nutrition: { calories: 140, protein: 6, carbs: 24, fat: 2 },
              isFavorite: false,
            },
            {
              id: 'turkey',
              name: 'Turkey Breast',
              quantity: '3 oz',
              nutrition: { calories: 90, protein: 19, carbs: 0, fat: 1 },
              isFavorite: false,
            },
            {
              id: 'lettuce',
              name: 'Lettuce',
              quantity: '0.5 cup',
              nutrition: { calories: 4, protein: 0.5, carbs: 1, fat: 0 },
              isFavorite: false,
            },
            {
              id: 'tomato',
              name: 'Tomato',
              quantity: '2 slices',
              nutrition: { calories: 5, protein: 0.3, carbs: 1, fat: 0 },
              isFavorite: false,
            },
          ],
        },
        {
          id: 'chips',
          name: 'Potato Chips',
          isParent: false,
          baseNutrition: { calories: 150, protein: 2, carbs: 15, fat: 10 },
          nutrition: { calories: 150, protein: 2, carbs: 15, fat: 10 },
          servingMultiplier: 1,
          expanded: false,
          isFavorite: false,
          ingredients: [],
        },
        {
          id: 'pickle',
          name: 'Dill Pickle',
          isParent: false,
          baseNutrition: { calories: 12, protein: 0.5, carbs: 2, fat: 0.1 },
          nutrition: { calories: 12, protein: 0.5, carbs: 2, fat: 0.1 },
          servingMultiplier: 1,
          expanded: false,
          isFavorite: false,
          ingredients: [],
        },
      ];
      dispatch({ type: 'SET_FOOD_GROUPS', groups: demoGroups });
    }
  }, [analysisData]);
  
  // Transform AI analysis to FoodGroups with intelligent client-side grouping
  const transformAnalysisToGroups = (analysis: any): FoodGroup[] => {
    if (!analysis || !analysis.foods) {
      return [];
    }
    
    const foods = analysis.foods;
    const groups: FoodGroup[] = [];
    
    // Check if AI already returns hierarchical structure
    const hasHierarchicalStructure = foods.some((food: any) => 
      food.ingredients && food.ingredients.length > 0
    );
    
    if (hasHierarchicalStructure) {
      // AI returns hierarchical structure - use it directly
      foods.forEach((food: any, index: number) => {
        const hasIngredients = food.ingredients && food.ingredients.length > 0;
        
        // For branded items with ingredients, use the known nutrition values
        // For non-branded items with ingredients, start with zero (will be calculated)
        // For items without ingredients, use the provided values
        const initialNutrition = (hasIngredients && !food.isBranded) ? 
          { calories: 0, protein: 0, carbs: 0, fat: 0 } :
          {
            calories: Math.round(food.nutrition?.calories || food.calories || 0),
            protein: Math.round(food.nutrition?.protein || food.protein || 0),
            carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
            fat: Math.round(food.nutrition?.fat || food.fat || 0),
          };
        
        const foodGroup: FoodGroup = {
          id: `food_${index}`,
          name: food.name || 'Unknown Item',
          isParent: hasIngredients,
          baseNutrition: initialNutrition,
          nutrition: initialNutrition,
          servingMultiplier: 1,
          expanded: false,
          isFavorite: false,
          ingredients: [],
        };
        
        if (hasIngredients) {
          foodGroup.ingredients = food.ingredients.map((ingredient: any, ingredientIndex: number) => ({
            id: `ingredient_${index}_${ingredientIndex}`,
            name: ingredient.name,
            quantity: ingredient.quantity, // Already formatted from mealAI.ts
            nutrition: {
              calories: Math.round(ingredient.nutrition?.calories || ingredient.calories || 0),
              protein: Math.round(ingredient.nutrition?.protein || ingredient.protein || 0),
              carbs: Math.round(ingredient.nutrition?.carbs || ingredient.carbs || 0),
              fat: Math.round(ingredient.nutrition?.fat || ingredient.fat || 0),
            },
            isFavorite: false,
          }));
          
          // ONLY recalculate parent nutrition for non-branded items
          // Branded items should preserve their known nutrition values from the server
          if (!food.isBranded) {
            // Recalculate parent nutrition as sum of ingredients
            const totalNutrition = foodGroup.ingredients.reduce((acc, ingredient) => ({
              calories: acc.calories + ingredient.nutrition.calories,
              protein: acc.protein + ingredient.nutrition.protein,
              carbs: acc.carbs + ingredient.nutrition.carbs,
              fat: acc.fat + ingredient.nutrition.fat,
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
            
            foodGroup.baseNutrition = totalNutrition;
            foodGroup.nutrition = totalNutrition;
          }
          // For branded items, keep the original nutrition values
        }
        
        groups.push(foodGroup);
      });
    } else {
      // AI returns flat structure - apply intelligent grouping
      const compositeKeywords = ['sandwich', 'salad', 'bowl', 'wrap', 'burger', 'pizza', 'taco', 'burrito'];
      const ingredientKeywords = ['bread', 'bun', 'lettuce', 'tomato', 'cheese', 'mayo', 'mayonnaise', 
                                  'mustard', 'ketchup', 'onion', 'chicken', 'turkey', 'beef',
                                  'ham', 'bacon', 'avocado', 'dressing', 'sauce', 'tortilla'];
      // Note: 'pickle' removed - should be treated as standalone unless context indicates otherwise
      
      // Context-aware function to determine if item should be an ingredient
      const shouldBeIngredient = (itemName: string, itemIndex: number, allFoods: any[]) => {
        const itemNameLower = itemName.toLowerCase();
        
        // Special case: pickle can be ingredient or side
        if (itemNameLower.includes('pickle')) {
          // If it was added in a later "Add More" flow, treat as standalone
          // This is a heuristic - items added later are likely separate
          if (itemIndex > 0) return false;
        }
        
        // Check if it's in the ingredient keywords
        return ingredientKeywords.some(keyword => itemNameLower.includes(keyword));
      };
      
      let currentComposite: FoodGroup | null = null;
      let standaloneItems: any[] = [];
      
      foods.forEach((food: any, index: number) => {
        const foodNameLower = food.name.toLowerCase();
        
        // Check if this is a composite food
        const isComposite = compositeKeywords.some(keyword => foodNameLower.includes(keyword));
        
        // Check if this is likely an ingredient (context-aware)
        const isIngredient = shouldBeIngredient(food.name, index, foods);
        
        if (isComposite) {
          // Save any pending composite
          if (currentComposite) {
            groups.push(currentComposite);
          }
          
          // Start new composite food
          currentComposite = {
            id: `food_${index}`,
            name: food.name || 'Unknown Item',
            isParent: true,
            baseNutrition: {
              calories: Math.round(food.nutrition?.calories || food.calories || 0),
              protein: Math.round(food.nutrition?.protein || food.protein || 0),
              carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
              fat: Math.round(food.nutrition?.fat || food.fat || 0),
            },
            nutrition: {
              calories: Math.round(food.nutrition?.calories || food.calories || 0),
              protein: Math.round(food.nutrition?.protein || food.protein || 0),
              carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
              fat: Math.round(food.nutrition?.fat || food.fat || 0),
            },
            servingMultiplier: 1,
            expanded: false,
            isFavorite: false,
            ingredients: [],
          };
        } else if (isIngredient && currentComposite) {
          // Add as ingredient to current composite
          currentComposite.ingredients.push({
            id: `ingredient_${groups.length}_${currentComposite.ingredients.length}`,
            name: food.name || 'Unknown Item',
            quantity: `${food.quantity || 1} ${food.unit || 'serving'}`,
            nutrition: {
              calories: Math.round(food.nutrition?.calories || food.calories || 0),
              protein: Math.round(food.nutrition?.protein || food.protein || 0),
              carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
              fat: Math.round(food.nutrition?.fat || food.fat || 0),
            },
            isFavorite: false,
          });
          
          // Update composite totals
          currentComposite.baseNutrition.calories += Math.round(food.nutrition?.calories || food.calories || 0);
          currentComposite.baseNutrition.protein += Math.round(food.nutrition?.protein || food.protein || 0);
          currentComposite.baseNutrition.carbs += Math.round(food.nutrition?.carbs || food.carbs || 0);
          currentComposite.baseNutrition.fat += Math.round(food.nutrition?.fat || food.fat || 0);
          currentComposite.nutrition = { ...currentComposite.baseNutrition };
        } else {
          // Standalone item (like chips, drinks, fruits)
          standaloneItems.push(food);
        }
      });
      
      // Add any pending composite
      if (currentComposite) {
        groups.push(currentComposite);
      }
      
      // Add standalone items
      standaloneItems.forEach((food, index) => {
        groups.push({
          id: `food_standalone_${index}`,
          name: food.name || 'Unknown Item',
          isParent: false,
          baseNutrition: {
            calories: Math.round(food.nutrition?.calories || food.calories || 0),
            protein: Math.round(food.nutrition?.protein || food.protein || 0),
            carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
            fat: Math.round(food.nutrition?.fat || food.fat || 0),
          },
          nutrition: {
            calories: Math.round(food.nutrition?.calories || food.calories || 0),
            protein: Math.round(food.nutrition?.protein || food.protein || 0),
            carbs: Math.round(food.nutrition?.carbs || food.carbs || 0),
            fat: Math.round(food.nutrition?.fat || food.fat || 0),
          },
          servingMultiplier: 1,
          expanded: false,
          isFavorite: false,
          ingredients: [],
        });
      });
    }
    
    return groups;
  };
  
  // Calculate totals
  const totalNutrition = state.foodGroups.reduce(
    (acc, group) => ({
      calories: acc.calories + group.nutrition.calories,
      protein: acc.protein + group.nutrition.protein,
      carbs: acc.carbs + group.nutrition.carbs,
      fat: acc.fat + group.nutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  
  // Transform foodGroups back to AIMealAnalysis format with updated nutrition
  const createUpdatedAnalysis = (): any => {
    // Use groupsToMealAnalysis to preserve original quantities
    const analysisFromGroups = groupsToMealAnalysis(state.foodGroups, analysisData);
    
    // Return analysis with preserved quantities and current on-screen totals
    return {
      ...analysisFromGroups,
      totalCalories: totalNutrition.calories,
      totalProtein: totalNutrition.protein,
      totalCarbs: totalNutrition.carbs,
      totalFat: totalNutrition.fat,
      totalNutrition: totalNutrition,
    };
  };;
  
  // Handle save meal
  const handleSaveMeal = async () => {
    if (!user || isSaving || !analysisData) return;
    
    // In edit mode, we don't need description
    if (!isEditMode && !description) return;
    
    try {
      setIsSaving(true);
      hapticFeedback.selection();
      
      // Create updated analysis with current nutrition values from state
      const updatedAnalysis = createUpdatedAnalysis();
      
      if (isEditMode) {
        // Edit mode: Append foods to existing meal
        if (!mealGroupId) {
          Alert.alert('Error', 'Could not save changes. The meal identifier is missing.');
          setIsSaving(false);
          return;
        }
        
        const result = await appendFoodsToMeal(
          mealGroupId,
          user.id,
          updatedAnalysis.foods
        );
        
        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to add foods to meal');
          setIsSaving(false);
          return;
        }
        
        hapticFeedback.success();
        
        // Navigate back to EditMealScreen
        navigation.goBack();
        // The EditMealScreen will refresh automatically with useFocusEffect
      } else {
        // Normal mode: Save as new meal
        const logResult = await mealAIService.saveMealDirectly(
          updatedAnalysis,
          description,
          autoMealType,
          new Date().toISOString().split('T')[0]
        );
        
        if (!logResult.success) {
          Alert.alert('Error', logResult.error || 'Failed to save meal');
          return;
        }
        
        hapticFeedback.success();
        
        // Navigate to save confirmation screen with correct totals from updatedAnalysis
        navigation.navigate('MealSaved' as any, {
          meal: {
            type: autoMealType,
            calories: updatedAnalysis.totalCalories ?? updatedAnalysis.totalNutrition?.calories ?? totalNutrition.calories,
            protein: updatedAnalysis.totalProtein ?? updatedAnalysis.totalNutrition?.protein ?? totalNutrition.protein,
            carbs: updatedAnalysis.totalCarbs ?? updatedAnalysis.totalNutrition?.carbs ?? totalNutrition.carbs,
            fat: updatedAnalysis.totalFat ?? updatedAnalysis.totalNutrition?.fat ?? totalNutrition.fat,
          },
        });
        
        // The MealSavedScreen will auto-navigate to Home after 2 seconds
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle add more
  const handleAddMore = () => {
    hapticFeedback.selection();
    
    // Navigate to AddMoreScreen with current meal data
    navigation.navigate('AddMoreScreen' as any, {
      currentMealData: createUpdatedAnalysis(), // Pass the current state as analysis
      description,
      mealId: route.params?.mealId,
    });
  };
  
  // Handle refine with AI
  const handleRefineWithAI = () => {
    hapticFeedback.selection();
    
    // Create updated analysis with current state (includes Add More items)
    const updatedAnalysis = createUpdatedAnalysis();
    
    // Navigate to RefineWithAIScreen with complete current analysis
    navigation.navigate('RefineWithAIScreen', {
      analysisData: updatedAnalysis,
      mealId: route.params?.mealId,
      description,
    });
  };
  
  // Handle delete food group
  const handleDeleteFoodGroup = (groupId: string) => {
    hapticFeedback.selection();
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            hapticFeedback.impact();
            dispatch({ type: 'DELETE_FOOD_GROUP', groupId });
          },
        },
      ]
    );
  };
  
  // Handle delete ingredient
  const handleDeleteIngredient = (groupId: string, itemId: string) => {
    hapticFeedback.selection();
    Alert.alert(
      'Delete Ingredient',
      'Are you sure you want to remove this ingredient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            hapticFeedback.impact();
            dispatch({ type: 'DELETE_INGREDIENT', groupId, itemId });
          },
        },
      ]
    );
  };
  
  // Render heart icon based on favorite state
  const renderHeartIcon = (isFavorite: boolean, hasChildren: boolean, allChildrenFavorite?: boolean) => {
    if (hasChildren && !isFavorite && allChildrenFavorite === false) {
      // Indeterminate state - some children are favorites
      return <Heart size={18} color="#9CA3AF" strokeWidth={2} />;
    }
    
    return (
      <Heart
        size={18}
        color={isFavorite ? '#EF4444' : '#D1D5DB'}
        fill={isFavorite ? '#EF4444' : 'transparent'}
        strokeWidth={2}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Analysis Results</Text>
          <Text style={styles.headerSubtitle}>Review and save your meal</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            dispatch({ type: 'TOGGLE_EDIT_MODE' });
          }}
          style={[styles.editButton, state.isEditMode && styles.editButtonActive]}
        >
          {state.isEditMode ? (
            <Check size={20} color={state.isEditMode ? '#320DFF' : '#1F2937'} />
          ) : (
            <Edit2 size={20} color="#1F2937" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Food Groups */}
        {state.foodGroups.map((group, index) => (
          <FoodItemCard
            key={group.id}
            item={{
              id: group.id,
              name: group.name,
              nutrition: {
                calories: group.nutrition.calories,
                protein: group.nutrition.protein,
                carbs: group.nutrition.carbs,
                fat: group.nutrition.fat,
              },
              isFavorite: group.isFavorite,
              isParent: group.isParent,
              expanded: group.expanded,
              ingredients: group.ingredients.map(ing => ({
                id: ing.id,
                name: ing.name,
                quantity: ing.quantity,
                nutrition: {
                  calories: ing.nutrition.calories,
                  protein: ing.nutrition.protein,
                  carbs: ing.nutrition.carbs,
                  fat: ing.nutrition.fat,
                },
                isFavorite: ing.isFavorite,
              })),
              quantity: '1 serving', // Default quantity
              servingMultiplier: group.servingMultiplier,
            }}
            index={index}
            isEditMode={state.isEditMode}
            onToggleExpanded={() => dispatch({ type: 'TOGGLE_EXPANDED', groupId: group.id })}
            onToggleFavorite={(groupId: string, itemId?: string) => {
              hapticFeedback.selection();
              dispatch({ type: 'TOGGLE_FAVORITE', groupId, itemId });
            }}
            onDelete={(groupId: string) => handleDeleteFoodGroup(groupId)}
            onDeleteIngredient={(groupId: string, itemId: string) => 
              handleDeleteIngredient(groupId, itemId)
            }
            showExpandable={true}
            showQuantity={true}
            showServingStepper={true}
            onUpdateServing={(foodId, delta) => 
              dispatch({ type: 'UPDATE_SERVING_MULTIPLIER', foodId, delta })
            }
          />
        ))}
        
        {/* Nutrition Summary - MealDetails Style */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={styles.nutritionSummaryCard}
        >
          {/* Calories Section */}
          <View style={styles.caloriesSection}>
            <Text style={styles.caloriesValue}>{totalNutrition.calories}</Text>
            <Text style={styles.caloriesLabel}>Calories</Text>
          </View>
          
          {/* Macronutrients Title */}
          <Text style={styles.macrosTitle}>Macronutrients</Text>
          
          {/* Animated Donut Chart */}
          <View style={styles.chartContainer}>
            <AnimatedDonutChart
              size={160}
              strokeWidth={24}
              data={(() => {
                const totalGrams = totalNutrition.protein + totalNutrition.carbs + totalNutrition.fat;
                if (totalGrams === 0) {
                  return [{ key: 'empty', value: 100, color: '#E5E7EB' }];
                }
                return [
                  { 
                    key: 'carbs', 
                    value: (totalNutrition.carbs / totalGrams) * 100, 
                    color: '#FFC078' 
                  },
                  { 
                    key: 'protein', 
                    value: (totalNutrition.protein / totalGrams) * 100, 
                    color: '#74C0FC' 
                  },
                  { 
                    key: 'fat', 
                    value: (totalNutrition.fat / totalGrams) * 100, 
                    color: '#8CE99A' 
                  },
                ];
              })()}
              animationDuration={800}
              delayBetweenSegments={100}
            />
          </View>
          
          {/* Macros Grid */}
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <View style={[styles.macroColorDot, { backgroundColor: '#74C0FC' }]} />
              <Text style={styles.macroValue}>{Math.round(totalNutrition.protein)}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroColorDot, { backgroundColor: '#FFC078' }]} />
              <Text style={styles.macroValue}>{Math.round(totalNutrition.carbs)}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroColorDot, { backgroundColor: '#8CE99A' }]} />
              <Text style={styles.macroValue}>{Math.round(totalNutrition.fat)}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </MotiView>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Save Meal Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
            onPress={handleSaveMeal}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving ? 'Saving...' : 'Save Meal'}
            </Text>
          </TouchableOpacity>
          
          {/* Secondary Buttons */}
          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAddMore}
            >
              <Plus size={20} color="#320DFF" />
              <Text style={styles.secondaryButtonText}>Add More</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRefineWithAI}
            >
              <Sparkles size={20} color="#320DFF" />
              <Text style={styles.secondaryButtonText}>Refine with AI</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    flex: 1,
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonActive: {
    backgroundColor: '#E0E7FF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },


  nutritionSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  caloriesSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  caloriesValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  caloriesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  macrosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#320DFF',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#320DFF',
  },
});