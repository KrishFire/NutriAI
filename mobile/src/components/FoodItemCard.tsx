import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import { hapticFeedback } from '../utils/haptics';

interface FoodNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

interface FoodIngredient {
  id: string;
  name: string;
  quantity: string;
  nutrition: FoodNutrition;
  isFavorite: boolean;
}

interface FoodItem {
  id: string;
  name: string;
  nutrition: FoodNutrition;
  isFavorite: boolean;
  isParent: boolean;
  expanded: boolean;
  ingredients: FoodIngredient[];
  servingMultiplier?: number;
  quantity?: string;
}

interface FoodItemCardProps {
  item: FoodItem;
  index: number;
  isEditMode?: boolean;
  onToggleExpanded?: (id: string) => void;
  onToggleFavorite?: (id: string, itemId?: string) => void;
  onDelete?: (id: string) => void;
  onDeleteIngredient?: (groupId: string, itemId: string) => void;
  onUpdateServing?: (id: string, delta: number) => void;
  showExpandable?: boolean;
  showQuantity?: boolean;
  showServingStepper?: boolean;
}

export default function FoodItemCard({
  item,
  index,
  isEditMode = false,
  onToggleExpanded,
  onToggleFavorite,
  onDelete,
  onDeleteIngredient,
  onUpdateServing,
  showExpandable = true,
  showQuantity = false,
  showServingStepper = false,
}: FoodItemCardProps) {
  
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

  const servingMultiplier = item.servingMultiplier || 1;
  
  // Function to scale quantity text with multiplier
  const getScaledQuantity = () => {
    if (!item.quantity) return '';
    
    // Parse the quantity string (e.g., "1 serving", "3 pieces", "200g")
    const match = item.quantity.match(/^([\d.]+)\s*(.*)$/);
    if (match) {
      const baseNumber = parseFloat(match[1]);
      const unit = match[2];
      const scaledNumber = baseNumber * servingMultiplier;
      
      // Format the number based on whether it's a whole number
      const formattedNumber = scaledNumber % 1 === 0 
        ? scaledNumber.toString() 
        : scaledNumber.toFixed(1).replace(/\.0$/, '');
      
      return `${formattedNumber} ${unit}`;
    }
    
    // If we can't parse it, check if it's just "serving" or "servings"
    if (item.quantity.toLowerCase().includes('serving')) {
      const scaledServings = 1 * servingMultiplier;
      const formattedNumber = scaledServings % 1 === 0 
        ? scaledServings.toString() 
        : scaledServings.toFixed(1).replace(/\.0$/, '');
      return `${formattedNumber} serving${scaledServings !== 1 ? 's' : ''}`;
    }
    
    return item.quantity; // Return original if we can't parse
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 100 }}
      style={styles.foodCard}
    >
      <View style={styles.foodHeader}>
        <TouchableOpacity
          style={styles.foodInfo}
          onPress={() => {
            if (item.ingredients.length > 0 && showExpandable && onToggleExpanded) {
              hapticFeedback.selection();
              onToggleExpanded(item.id);
            }
          }}
        >
          <Text style={styles.foodName}>{item.name}</Text>
          {item.ingredients.length > 0 && showExpandable && (
            <View style={styles.expandIcon}>
              {item.expanded ? (
                <ChevronUp size={16} color="#6B7280" />
              ) : (
                <ChevronDown size={16} color="#6B7280" />
              )}
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.foodActions}>
          {isEditMode ? (
            <TouchableOpacity
              onPress={() => {
                if (onDelete) {
                  onDelete(item.id);
                }
              }}
              style={styles.deleteButton}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (onToggleFavorite) {
                  hapticFeedback.selection();
                  onToggleFavorite(item.id);
                }
              }}
              style={styles.heartButton}
            >
              {renderHeartIcon(
                item.isFavorite,
                item.ingredients.length > 0,
                item.ingredients.length > 0
                  ? item.ingredients.every(i => i.isFavorite)
                  : undefined
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.nutritionRow}>
        <Text style={styles.caloriesText}>{item.nutrition.calories} cal</Text>
        <View style={styles.macros}>
          <Text style={styles.macroText}>Protein: {item.nutrition.protein}g</Text>
          <Text style={styles.macroText}>Carbs: {item.nutrition.carbs}g</Text>
          <Text style={styles.macroText}>Fat: {item.nutrition.fat}g</Text>
        </View>
      </View>

      {/* Show quantity with serving stepper if available */}
      {showQuantity && item.quantity && (
        <View style={styles.quantityRow}>
          <Text style={styles.quantityText}>{getScaledQuantity()}</Text>
          {showServingStepper && onUpdateServing && (
            <View style={styles.servingStepper}>
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  servingMultiplier <= 0.5 && styles.stepperButtonDisabled
                ]}
                onPress={() => {
                  if (servingMultiplier > 0.5) {
                    hapticFeedback.selection();
                    onUpdateServing(item.id, -0.5);
                  }
                }}
                disabled={servingMultiplier <= 0.5}
              >
                <Text style={[
                  styles.stepperButtonText,
                  servingMultiplier <= 0.5 && styles.stepperButtonTextDisabled
                ]}>−</Text>
              </TouchableOpacity>
              
              <Text style={styles.stepperValue}>
                {servingMultiplier}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  servingMultiplier >= 10 && styles.stepperButtonDisabled
                ]}
                onPress={() => {
                  if (servingMultiplier < 10) {
                    hapticFeedback.selection();
                    onUpdateServing(item.id, 0.5);
                  }
                }}
                disabled={servingMultiplier >= 10}
              >
                <Text style={[
                  styles.stepperButtonText,
                  servingMultiplier >= 10 && styles.stepperButtonTextDisabled
                ]}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {/* Expandable Ingredients */}
      <AnimatePresence>
        {item.expanded && item.ingredients.length > 0 && showExpandable && (
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
            {item.ingredients.map((ingredient, ingredientIndex) => (
              <MotiView
                key={ingredient.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: ingredientIndex * 50 }}
                style={styles.ingredientRow}
              >
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientQuantity}>{ingredient.quantity}</Text>
                </View>
                
                <View style={styles.ingredientRight}>
                  <View style={styles.ingredientNutrition}>
                    <Text style={styles.ingredientCalories}>
                      {Math.round(ingredient.nutrition.calories * servingMultiplier)} cal
                    </Text>
                    <View style={styles.ingredientMacros}>
                      <Text style={styles.ingredientMacro}>
                        Protein: {Math.round(ingredient.nutrition.protein * servingMultiplier)}g
                      </Text>
                      <Text style={styles.ingredientMacro}>
                        Carbs: {Math.round(ingredient.nutrition.carbs * servingMultiplier)}g
                      </Text>
                      <Text style={styles.ingredientMacro}>
                        Fat: {Math.round(ingredient.nutrition.fat * servingMultiplier)}g
                      </Text>
                    </View>
                  </View>
                  
                  {isEditMode ? (
                    <TouchableOpacity
                      onPress={() => {
                        if (onDeleteIngredient) {
                          onDeleteIngredient(item.id, ingredient.id);
                        }
                      }}
                      style={styles.ingredientDelete}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        if (onToggleFavorite) {
                          hapticFeedback.selection();
                          onToggleFavorite(item.id, ingredient.id);
                        }
                      }}
                      style={styles.ingredientHeart}
                    >
                      {renderHeartIcon(ingredient.isFavorite, false)}
                    </TouchableOpacity>
                  )}
                </View>
              </MotiView>
            ))}
          </MotiView>
        )}
      </AnimatePresence>
    </MotiView>
  );
}

const styles = StyleSheet.create({
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
  quantityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  servingStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  stepperButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#320DFF',
    lineHeight: 20,
  },
  stepperButtonTextDisabled: {
    color: '#D1D5DB',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
  },
  ingredientsContainer: {
    paddingTop: 16,
    marginTop: 4,
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
});