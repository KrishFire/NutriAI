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
  globalServingSize: number;
  isEditMode: boolean;
};

type Action =
  | { type: 'TOGGLE_FAVORITE'; groupId: string; itemId?: string }
  | { type: 'TOGGLE_EXPANDED'; groupId: string }
  | { type: 'ADJUST_SERVING'; delta: number }
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
    
    case 'ADJUST_SERVING': {
      const newServing = Math.max(0.5, state.globalServingSize + action.delta);
      const multiplier = newServing / state.globalServingSize;
      
      const newGroups = state.foodGroups.map(group => ({
        ...group,
        servingMultiplier: group.servingMultiplier * multiplier,
        nutrition: {
          calories: Math.round(group.baseNutrition.calories * group.servingMultiplier * multiplier),
          protein: Math.round(group.baseNutrition.protein * group.servingMultiplier * multiplier),
          carbs: Math.round(group.baseNutrition.carbs * group.servingMultiplier * multiplier),
          fat: Math.round(group.baseNutrition.fat * group.servingMultiplier * multiplier),
        },
      }));
      
      return {
        ...state,
        globalServingSize: newServing,
        foodGroups: newGroups,
      };
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
  
  // Auto-assigned meal type (not in state since it's not user-selectable)
  const autoMealType = getAutoMealType();
  
  // Initialize state with reducer
  const [state, dispatch] = useReducer(reducer, {
    foodGroups: [],
    globalServingSize: 1,
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
        
        // Initialize with zero nutrition if has ingredients (will be calculated from ingredients)
        // Otherwise use the provided nutrition values
        const initialNutrition = hasIngredients ? 
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
        
        groups.push(foodGroup);
      });
    } else {
      // AI returns flat structure - apply intelligent grouping
      const compositeKeywords = ['sandwich', 'salad', 'bowl', 'wrap', 'burger', 'pizza', 'taco', 'burrito'];
      const ingredientKeywords = ['bread', 'bun', 'lettuce', 'tomato', 'cheese', 'mayo', 'mayonnaise', 
                                  'mustard', 'ketchup', 'onion', 'pickle', 'chicken', 'turkey', 'beef',
                                  'ham', 'bacon', 'avocado', 'dressing', 'sauce', 'tortilla'];
      
      let currentComposite: FoodGroup | null = null;
      let standaloneItems: any[] = [];
      
      foods.forEach((food: any, index: number) => {
        const foodNameLower = food.name.toLowerCase();
        
        // Check if this is a composite food
        const isComposite = compositeKeywords.some(keyword => foodNameLower.includes(keyword));
        
        // Check if this is likely an ingredient
        const isIngredient = ingredientKeywords.some(keyword => foodNameLower.includes(keyword));
        
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
    // Transform foodGroups to foods array
    const foods = state.foodGroups.map(group => {
      const food: any = {
        name: group.name,
        quantity: 1,
        unit: 'serving',
        calories: group.nutrition.calories,
        protein: group.nutrition.protein,
        carbs: group.nutrition.carbs,
        fat: group.nutrition.fat,
      };
      
      // Add ingredients if it's a parent food
      if (group.isParent && group.ingredients.length > 0) {
        food.ingredients = group.ingredients.map(ingredient => ({
          name: ingredient.name,
          quantity: 1,
          unit: 'serving',
          calories: ingredient.nutrition.calories,
          protein: ingredient.nutrition.protein,
          carbs: ingredient.nutrition.carbs,
          fat: ingredient.nutrition.fat,
        }));
      }
      
      return food;
    });
    
    // Return updated analysis with current totals
    return {
      ...analysisData,
      foods,
      totalCalories: totalNutrition.calories,
      totalProtein: totalNutrition.protein,
      totalCarbs: totalNutrition.carbs,
      totalFat: totalNutrition.fat,
    };
  };
  
  // Handle save meal
  const handleSaveMeal = async () => {
    if (!user || isSaving || !description || !analysisData) return;
    
    try {
      setIsSaving(true);
      hapticFeedback.selection();
      
      // Create updated analysis with current nutrition values from state
      const updatedAnalysis = createUpdatedAnalysis();
      
      // Save the meal to database with updated analysis
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
      
      // Navigate to save confirmation screen
      navigation.navigate('MealSaved' as any, {
        meal: {
          type: autoMealType,
          calories: totalNutrition.calories,
          protein: totalNutrition.protein,
          carbs: totalNutrition.carbs,
          fat: totalNutrition.fat,
        },
      });
      
      // The MealSavedScreen will auto-navigate to Home after 2 seconds
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
          <MotiView
            key={group.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100 }}
            style={styles.foodCard}
          >
            <View style={styles.foodHeader}>
              <TouchableOpacity
                style={styles.foodInfo}
                onPress={() => {
                  if (group.ingredients.length > 0) {
                    hapticFeedback.selection();
                    dispatch({ type: 'TOGGLE_EXPANDED', groupId: group.id });
                  }
                }}
              >
                <Text style={styles.foodName}>{group.name}</Text>
                {group.ingredients.length > 0 && (
                  <View style={styles.expandIcon}>
                    {group.expanded ? (
                      <ChevronUp size={16} color="#6B7280" />
                    ) : (
                      <ChevronDown size={16} color="#6B7280" />
                    )}
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.foodActions}>
                {state.isEditMode ? (
                  <TouchableOpacity
                    onPress={() => handleDeleteFoodGroup(group.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      hapticFeedback.selection();
                      dispatch({ type: 'TOGGLE_FAVORITE', groupId: group.id });
                    }}
                    style={styles.heartButton}
                  >
                    {renderHeartIcon(
                      group.isFavorite,
                      group.ingredients.length > 0,
                      group.ingredients.length > 0
                        ? group.ingredients.every(i => i.isFavorite)
                        : undefined
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.nutritionRow}>
              <Text style={styles.caloriesText}>{group.nutrition.calories} cal</Text>
              <View style={styles.macros}>
                <Text style={styles.macroText}>Protein: {group.nutrition.protein}g</Text>
                <Text style={styles.macroText}>Carbs: {group.nutrition.carbs}g</Text>
                <Text style={styles.macroText}>Fat: {group.nutrition.fat}g</Text>
              </View>
            </View>
            
            {/* Expandable Ingredients */}
            <AnimatePresence>
              {group.expanded && group.ingredients.length > 0 && (
                <MotiView
                  from={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{ type: 'timing', duration: 200 }}
                  style={[styles.ingredientsContainer, { 
                    transformOrigin: 'top',
                    overflow: 'hidden'
                  }]}
                >
                  <Text style={styles.ingredientsLabel}>Ingredients:</Text>
                  {group.ingredients.map((item, itemIndex) => (
                    <MotiView
                      key={item.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: itemIndex * 50 }}
                      style={styles.ingredientRow}
                    >
                      <View style={styles.ingredientInfo}>
                        <Text style={styles.ingredientName}>{item.name}</Text>
                        <Text style={styles.ingredientQuantity}>{item.quantity}</Text>
                      </View>
                      
                      <View style={styles.ingredientRight}>
                        <View style={styles.ingredientNutrition}>
                          <Text style={styles.ingredientCalories}>{Math.round(item.nutrition.calories * group.servingMultiplier)} cal</Text>
                          <View style={styles.ingredientMacros}>
                            <Text style={styles.ingredientMacro}>Protein: {Math.round(item.nutrition.protein * group.servingMultiplier)}g</Text>
                            <Text style={styles.ingredientMacro}>Carbs: {Math.round(item.nutrition.carbs * group.servingMultiplier)}g</Text>
                            <Text style={styles.ingredientMacro}>Fat: {Math.round(item.nutrition.fat * group.servingMultiplier)}g</Text>
                          </View>
                        </View>
                        
                        {state.isEditMode ? (
                          <TouchableOpacity
                            onPress={() => handleDeleteIngredient(group.id, item.id)}
                            style={styles.ingredientDelete}
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => {
                              hapticFeedback.selection();
                              dispatch({ type: 'TOGGLE_FAVORITE', groupId: group.id, itemId: item.id });
                            }}
                            style={styles.ingredientHeart}
                          >
                            {renderHeartIcon(item.isFavorite, false)}
                          </TouchableOpacity>
                        )}
                      </View>
                    </MotiView>
                  ))}
                </MotiView>
              )}
            </AnimatePresence>
          </MotiView>
        ))}
        
        {/* Serving Size */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          style={styles.servingCard}
        >
          <Text style={styles.servingTitle}>Serving Size</Text>
          <View style={styles.servingControls}>
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.selection();
                dispatch({ type: 'ADJUST_SERVING', delta: -0.5 });
              }}
              style={styles.servingButton}
              disabled={state.globalServingSize <= 0.5}
            >
              <Text style={styles.servingButtonText}>−</Text>
            </TouchableOpacity>
            
            <View style={styles.servingValue}>
              <Text style={styles.servingNumber}>{state.globalServingSize}</Text>
              <Text style={styles.servingLabel}>
                {state.globalServingSize <= 1 ? 'serving' : 'servings'}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.selection();
                dispatch({ type: 'ADJUST_SERVING', delta: 0.5 });
              }}
              style={styles.servingButton}
            >
              <Text style={styles.servingButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
        
        {/* Nutrition Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
          style={styles.nutritionCard}
        >
          <Text style={styles.nutritionTitle}>Nutrition Summary</Text>
          
          <View style={styles.totalCalories}>
            <Text style={styles.totalCaloriesLabel}>Calories</Text>
            <Text style={styles.totalCaloriesValue}>{totalNutrition.calories} cal</Text>
          </View>
          
          <View style={styles.macrosList}>
            {/* Protein */}
            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{totalNutrition.protein}g</Text>
              </View>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroProgress,
                    {
                      width: `${(totalNutrition.protein / (totalNutrition.protein + totalNutrition.carbs + totalNutrition.fat)) * 100}%`,
                      backgroundColor: '#42A5F5',
                    },
                  ]}
                />
              </View>
            </View>
            
            {/* Carbs */}
            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>{totalNutrition.carbs}g</Text>
              </View>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroProgress,
                    {
                      width: `${(totalNutrition.carbs / (totalNutrition.protein + totalNutrition.carbs + totalNutrition.fat)) * 100}%`,
                      backgroundColor: '#FFA726',
                    },
                  ]}
                />
              </View>
            </View>
            
            {/* Fat */}
            <View style={styles.macroItem}>
              <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{totalNutrition.fat}g</Text>
              </View>
              <View style={styles.macroBar}>
                <View
                  style={[
                    styles.macroProgress,
                    {
                      width: `${(totalNutrition.fat / (totalNutrition.protein + totalNutrition.carbs + totalNutrition.fat)) * 100}%`,
                      backgroundColor: '#66BB6A',
                    },
                  ]}
                />
              </View>
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
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  foodInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  expandIcon: {
    marginLeft: 8,
    marginRight: 4,
  },
  heartButton: {
    padding: 8,
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  macros: {
    flexDirection: 'row',
    gap: 12,
  },
  macroText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ingredientsContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    overflow: 'hidden',
  },
  ingredientsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  ingredientQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  ingredientRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientNutrition: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  ingredientCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  ingredientMacros: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  ingredientMacro: {
    fontSize: 10,
    color: '#6B7280',
  },
  ingredientHeart: {
    padding: 4,
  },
  ingredientDelete: {
    padding: 4,
  },
  servingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
  },
  servingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  servingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
  },
  servingValue: {
    alignItems: 'center',
  },
  servingNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  servingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  nutritionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  totalCalories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalCaloriesLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalCaloriesValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  macrosList: {
    gap: 12,
  },
  macroItem: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  macroBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroProgress: {
    height: '100%',
    borderRadius: 4,
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