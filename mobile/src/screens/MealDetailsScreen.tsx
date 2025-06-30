import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, LoadingSpinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';
import { MealAnalysis, FoodItem, NutritionData } from '../services/openai';
import { saveMealAnalysis } from '../services/meals';

type MealDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'MealDetails'>;

export default function MealDetailsScreen({ navigation, route }: MealDetailsScreenProps) {
  const { user } = useAuth();
  const { imageUri, analysisData, uploadedImageUrl } = route.params;

  const [editedAnalysis, setEditedAnalysis] = useState<MealAnalysis>(
    analysisData || {
      foods: [],
      totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      confidence: 0,
    }
  );
  const [saving, setSaving] = useState(false);

  const updateFoodItem = (index: number, updatedFood: FoodItem) => {
    const newFoods = [...editedAnalysis.foods];
    newFoods[index] = updatedFood;
    
    // Recalculate total nutrition with null safety
    const totalNutrition = newFoods.reduce(
      (total, food) => ({
        calories: (total.calories || 0) + (food.nutrition.calories || 0),
        protein: (total.protein || 0) + (food.nutrition.protein || 0),
        carbs: (total.carbs || 0) + (food.nutrition.carbs || 0),
        fat: (total.fat || 0) + (food.nutrition.fat || 0),
        fiber: (total.fiber || 0) + (food.nutrition.fiber || 0),
        sugar: (total.sugar || 0) + (food.nutrition.sugar || 0),
        sodium: (total.sodium || 0) + (food.nutrition.sodium || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    setEditedAnalysis({
      ...editedAnalysis,
      foods: newFoods,
      totalNutrition,
    });
  };

  const removeFoodItem = (index: number) => {
    const newFoods = editedAnalysis.foods.filter((_, i) => i !== index);
    
    const totalNutrition = newFoods.reduce(
      (total, food) => ({
        calories: (total.calories || 0) + (food.nutrition.calories || 0),
        protein: (total.protein || 0) + (food.nutrition.protein || 0),
        carbs: (total.carbs || 0) + (food.nutrition.carbs || 0),
        fat: (total.fat || 0) + (food.nutrition.fat || 0),
        fiber: (total.fiber || 0) + (food.nutrition.fiber || 0),
        sugar: (total.sugar || 0) + (food.nutrition.sugar || 0),
        sodium: (total.sodium || 0) + (food.nutrition.sodium || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    setEditedAnalysis({
      ...editedAnalysis,
      foods: newFoods,
      totalNutrition,
    });
  };

  const addFoodItem = () => {
    const newFood: FoodItem = {
      name: '',
      quantity: '',
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      confidence: 1.0,
    };

    setEditedAnalysis({
      ...editedAnalysis,
      foods: [...editedAnalysis.foods, newFood],
    });
  };

  const saveMeal = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (editedAnalysis.foods.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    setSaving(true);
    try {
      // Show meal type selection
      Alert.alert(
        'Select Meal Type',
        'What type of meal is this?',
        [
          {
            text: 'Breakfast',
            onPress: () => saveMealWithType('breakfast'),
          },
          {
            text: 'Lunch',
            onPress: () => saveMealWithType('lunch'),
          },
          {
            text: 'Dinner',
            onPress: () => saveMealWithType('dinner'),
          },
          {
            text: 'Snack',
            onPress: () => saveMealWithType('snack'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setSaving(false),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal');
      console.error('Save meal error:', error);
      setSaving(false);
    }
  };

  const saveMealWithType = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    try {
      const result = await saveMealAnalysis(
        user!.id,
        mealType,
        editedAnalysis,
        uploadedImageUrl,
        editedAnalysis.notes
      );

      if (result.success) {
        Alert.alert(
          'Success!', 
          'Meal saved successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('AppTabs'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save meal');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal');
      console.error('Save meal error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meal Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Meal Image */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.mealImage} />
          </View>
        )}

        {/* AI Analysis Confidence */}
        {analysisData && (
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>
              AI Confidence: {Math.round(analysisData.confidence * 100)}%
            </Text>
            {analysisData.notes && (
              <Text style={styles.confidenceNotes}>{analysisData.notes}</Text>
            )}
          </View>
        )}

        {/* Food Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Food Items</Text>
            <TouchableOpacity onPress={addFoodItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {editedAnalysis.foods.map((food, index) => (
            <FoodItemCard
              key={index}
              food={food}
              onUpdate={(updatedFood) => updateFoodItem(index, updatedFood)}
              onRemove={() => removeFoodItem(index)}
            />
          ))}

          {editedAnalysis.foods.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No food items detected. Tap "Add Item" to manually add foods.
              </Text>
            </View>
          )}
        </View>

        {/* Total Nutrition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Nutrition</Text>
          <NutritionSummary nutrition={editedAnalysis.totalNutrition} />
        </View>

        {/* Save Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Save Meal"
            onPress={saveMeal}
            variant="primary"
            loading={saving}
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface FoodItemCardProps {
  food: FoodItem;
  onUpdate: (food: FoodItem) => void;
  onRemove: () => void;
}

function FoodItemCard({ food, onUpdate, onRemove }: FoodItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFood, setEditedFood] = useState(food);

  const handleSave = () => {
    onUpdate(editedFood);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedFood(food);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={styles.foodCard}>
        <View style={styles.editHeader}>
          <Text style={styles.editTitle}>Edit Food Item</Text>
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.editForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Food Name</Text>
            <TextInput
              style={styles.textInput}
              value={editedFood.name}
              onChangeText={(text) => setEditedFood({ ...editedFood, name: text })}
              placeholder="Enter food name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.textInput}
              value={editedFood.quantity}
              onChangeText={(text) => setEditedFood({ ...editedFood, quantity: text })}
              placeholder="e.g., 1 cup, 150g"
            />
          </View>

          <View style={styles.nutritionInputs}>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionInput}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.numberInput}
                  value={editedFood.nutrition.calories.toString()}
                  onChangeText={(text) => 
                    setEditedFood({
                      ...editedFood,
                      nutrition: { ...editedFood.nutrition, calories: parseInt(text) || 0 }
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.nutritionInput}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={editedFood.nutrition.protein.toString()}
                  onChangeText={(text) => 
                    setEditedFood({
                      ...editedFood,
                      nutrition: { ...editedFood.nutrition, protein: parseFloat(text) || 0 }
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.nutritionRow}>
              <View style={styles.nutritionInput}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={editedFood.nutrition.carbs.toString()}
                  onChangeText={(text) => 
                    setEditedFood({
                      ...editedFood,
                      nutrition: { ...editedFood.nutrition, carbs: parseFloat(text) || 0 }
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.nutritionInput}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={editedFood.nutrition.fat.toString()}
                  onChangeText={(text) => 
                    setEditedFood({
                      ...editedFood,
                      nutrition: { ...editedFood.nutrition, fat: parseFloat(text) || 0 }
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.editActions}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              size="small"
              style={styles.editButton}
            />
            <Button
              title="Save"
              onPress={handleSave}
              variant="primary"
              size="small"
              style={styles.editButton}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.foodCard} onPress={() => setIsEditing(true)}>
      <View style={styles.foodHeader}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodQuantity}>{food.quantity}</Text>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {Math.round(food.confidence * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.nutritionGrid}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{food.nutrition.calories}</Text>
          <Text style={styles.nutritionLabel}>cal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{food.nutrition.protein}g</Text>
          <Text style={styles.nutritionLabel}>protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{food.nutrition.carbs}g</Text>
          <Text style={styles.nutritionLabel}>carbs</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{food.nutrition.fat}g</Text>
          <Text style={styles.nutritionLabel}>fat</Text>
        </View>
      </View>

      <Text style={styles.editHint}>Tap to edit</Text>
    </TouchableOpacity>
  );
}

interface NutritionSummaryProps {
  nutrition: NutritionData;
}

function NutritionSummary({ nutrition }: NutritionSummaryProps) {
  // Ensure nutrition object exists and has valid values
  const safeNutrition = {
    calories: Number(nutrition?.calories) || 0,
    protein: Number(nutrition?.protein) || 0,
    carbs: Number(nutrition?.carbs) || 0,
    fat: Number(nutrition?.fat) || 0,
    fiber: Number(nutrition?.fiber) || 0,
    sugar: Number(nutrition?.sugar) || 0,
    sodium: Number(nutrition?.sodium) || 0,
  };

  return (
    <View style={styles.nutritionSummary}>
      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{safeNutrition.calories}</Text>
          <Text style={styles.macroLabel}>Calories</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{safeNutrition.protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{safeNutrition.carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{safeNutrition.fat}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>

      {(safeNutrition.fiber > 0 || safeNutrition.sugar > 0 || safeNutrition.sodium > 0) && (
        <View style={styles.microRow}>
          {safeNutrition.fiber > 0 && (
            <View style={styles.microItem}>
              <Text style={styles.microValue}>{safeNutrition.fiber}g fiber</Text>
            </View>
          )}
          {safeNutrition.sugar > 0 && (
            <View style={styles.microItem}>
              <Text style={styles.microValue}>{safeNutrition.sugar}g sugar</Text>
            </View>
          )}
          {safeNutrition.sodium > 0 && (
            <View style={styles.microItem}>
              <Text style={styles.microValue}>{safeNutrition.sodium}mg sodium</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
  },
  confidenceContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 4,
  },
  confidenceNotes: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  foodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  foodQuantity: {
    fontSize: 14,
    color: '#6c757d',
  },
  confidenceBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  editHint: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  nutritionInputs: {
    gap: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nutritionInput: {
    flex: 1,
    gap: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  editButton: {
    minWidth: 80,
  },
  nutritionSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  microItem: {
    alignItems: 'center',
  },
  microValue: {
    fontSize: 14,
    color: '#6c757d',
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});