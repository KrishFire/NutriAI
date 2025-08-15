import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { Button, LoadingSpinner } from '../components';
import { 
  MealCorrectionModal, 
  FoodItemCard, 
  MealTypeSelector, 
  NutritionSummary 
} from '../components/meals';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';
import { MealAnalysis, FoodItem, NutritionData } from '../services/openai';
import {
  saveMealAnalysis,
  getMealDetailsByDateAndType,
  updateExistingMeal,
} from '../services/meals';
import {
  MealAnalysis as SharedMealAnalysis,
  ChatMessage,
} from '../../../shared/types';

type MealDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MealDetails'
>;

export default function MealDetailsScreen({
  navigation,
  route,
}: MealDetailsScreenProps) {
  const { user } = useAuth();
  const {
    imageUri,
    analysisData,
    uploadedImageUrl,
    mealId,
    mealGroupId,
    newFoodItems,
    isAddingToExisting,
  } = route.params;

  const [editedAnalysis, setEditedAnalysis] = useState<MealAnalysis>(
    analysisData || {
      foods: [],
      totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      confidence: 0,
    }
  );
  const [saving, setSaving] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingMeal, setIsExistingMeal] = useState(false);
  const [existingMealType, setExistingMealType] = useState<string | null>(null);
  const [canRefineWithAI, setCanRefineWithAI] = useState(false);
  const [realMealGroupId, setRealMealGroupId] = useState<string | null>(
    mealGroupId || null
  );

  // Set canRefineWithAI based on whether we have a real meal group ID
  useEffect(() => {
    if (realMealGroupId) {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          realMealGroupId
        );
      setCanRefineWithAI(isUUID);
    }
  }, [realMealGroupId]);

  // Load meal data if only mealId is provided (from History screen)
  useEffect(() => {
    async function loadMealData() {
      if (!mealId || analysisData || !user) return;

      // Check if this is a real meal_group_id (UUID format) or synthetic ID
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          mealId
        );
      setCanRefineWithAI(isUUID);

      if (!isUUID) {
        // Parse synthetic mealId format: "2025-07-13-lunch"
        const parts = mealId.split('-');
        if (parts.length < 4) return;

        const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const mealType = parts[3];

        setLoading(true);
        setError(null);

        try {
          const result = await getMealDetailsByDateAndType(
            user.id,
            date,
            mealType
          );

          if (result.success && result.data) {
            setEditedAnalysis(result.data);
            setIsExistingMeal(true);
            setExistingMealType(mealType);

            // If we got a real meal_group_id, update our state
            if (result.mealGroupId) {
              setRealMealGroupId(result.mealGroupId);
            }
          } else {
            setError(result.error || 'Failed to load meal details');
          }
        } catch (err) {
          setError('Failed to load meal details');
          console.error('[MealDetailsScreen] Error loading meal:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // For UUID meal IDs, we need to implement a proper loading mechanism
        // For now, set canRefineWithAI to true since it's a real meal_group_id
        setCanRefineWithAI(true);
      }
    }

    loadMealData();
  }, [mealId, analysisData, user]);

  // Handle new food items returned from add food flow
  useEffect(() => {
    if (newFoodItems && newFoodItems.length > 0) {
      console.log('[MealDetailsScreen] Merging new food items:', newFoodItems);

      // Add new food items to existing analysis
      const updatedFoods = [...editedAnalysis.foods, ...newFoodItems];

      // Recalculate total nutrition
      const totalNutrition = updatedFoods.reduce(
        (total, food) => ({
          calories: (total.calories || 0) + (food.nutrition.calories || 0),
          protein: (total.protein || 0) + (food.nutrition.protein || 0),
          carbs: (total.carbs || 0) + (food.nutrition.carbs || 0),
          fat: (total.fat || 0) + (food.nutrition.fat || 0),
          fiber: (total.fiber || 0) + (food.nutrition.fiber || 0),
          sugar: (total.sugar || 0) + (food.nutrition.sugar || 0),
          sodium: (total.sodium || 0) + (food.nutrition.sodium || 0),
        }),
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        }
      );

      const updatedAnalysis = {
        ...editedAnalysis,
        foods: updatedFoods,
        totalNutrition,
      };

      setEditedAnalysis(updatedAnalysis);

      // Clear navigation param to prevent re-adding on re-render
      navigation.setParams({
        newFoodItems: undefined,
        isAddingToExisting: undefined,
      });

      // If adding to existing meal, save automatically
      if (isAddingToExisting && mealId && user) {
        setSaving(true);
        updateExistingMeal(
          mealId,
          user.id,
          updatedAnalysis,
          uploadedImageUrl,
          updatedAnalysis.notes
        ).then(result => {
          setSaving(false);
          if (result.success) {
            Alert.alert('Success!', 'Food items added successfully!', [
              {
                text: 'OK',
                onPress: () => {
                  // Use CommonActions.reset to reliably navigate to History tab
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: 'AppTabs',
                          state: {
                            index: 1, // History tab
                            routes: [
                              { name: 'Home' },
                              { name: 'History' },
                              { name: 'Profile' },
                            ],
                          },
                        },
                      ],
                    })
                  );
                },
              },
            ]);
          } else {
            Alert.alert('Error', result.error || 'Failed to add food items');
          }
        });
      }
    }
  }, [newFoodItems, isAddingToExisting, mealId, user, uploadedImageUrl]);

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
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
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
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      }
    );

    setEditedAnalysis({
      ...editedAnalysis,
      foods: newFoods,
      totalNutrition,
    });
  };

  const addFoodItemManual = () => {
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

  const addFoodItemPhoto = () => {
    if (!realMealGroupId) {
      Alert.alert('Error', 'Cannot add food item - meal ID not available');
      return;
    }

    // Use direct navigation with edit mode params instead of AddMealFlow
    navigation.navigate('CameraInput', {
      isEditMode: true,
      mealGroupId: realMealGroupId,
    });
  };;

  const addFoodItemText = () => {
    if (!realMealGroupId) {
      Alert.alert('Error', 'Cannot add food item - meal ID not available');
      return;
    }

    // Use direct navigation with edit mode params instead of AddMealFlow
    navigation.navigate('TextInput', {
      isEditMode: true,
      mealGroupId: realMealGroupId,
    });
  };

  const addFoodItemVoice = () => {
    if (!realMealGroupId) {
      Alert.alert('Error', 'Cannot add food item - meal ID not available');
      return;
    }

    // Navigate to VoiceLog with edit mode params
    navigation.navigate('VoiceLog', {
      isEditMode: true,
      mealGroupId: realMealGroupId,
    });
  };

  const addFoodItemBarcode = () => {
    if (!realMealGroupId) {
      Alert.alert('Error', 'Cannot add food item - meal ID not available');
      return;
    }

    // Navigate to BarcodeInput with edit mode params
    navigation.navigate('BarcodeInput', {
      isEditMode: true,
      mealGroupId: realMealGroupId,
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
      if (isExistingMeal && existingMealType && mealId) {
        // Update existing meal using the new updateExistingMeal function
        const result = await updateExistingMeal(
          mealId,
          user.id,
          editedAnalysis,
          uploadedImageUrl,
          editedAnalysis.notes
        );

        if (result.success) {
          Alert.alert('Success!', 'Meal updated successfully!', [
            {
              text: 'OK',
              onPress: () => {
                // Use CommonActions.reset to reliably navigate to History tab
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'AppTabs',
                        state: {
                          index: 1, // History tab
                          routes: [
                            { name: 'Home' },
                            { name: 'History' },
                            { name: 'Profile' },
                          ],
                        },
                      },
                    ],
                  })
                );
              },
            },
          ]);
        } else {
          Alert.alert('Error', result.error || 'Failed to update meal');
        }
      } else {
        // Show meal type selection for new meals
        Alert.alert('Select Meal Type', 'What type of meal is this?', [
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
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal');
      console.error('Save meal error:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveMealWithType = async (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => {
    try {
      const result = await saveMealAnalysis(
        user!.id,
        mealType,
        editedAnalysis,
        uploadedImageUrl,
        editedAnalysis.notes
      );

      if (result.success) {
        Alert.alert('Success!', 'Meal saved successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Use CommonActions.reset to reliably navigate to Home tab
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'AppTabs',
                      state: {
                        index: 0, // Home tab
                        routes: [
                          { name: 'Home' },
                          { name: 'History' },
                          { name: 'Profile' },
                        ],
                      },
                    },
                  ],
                })
              );
            },
          },
        ]);
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

  const handleCorrectAnalysis = () => {
    if (!mealId) {
      Alert.alert('Error', 'Cannot refine analysis - meal ID not available');
      return;
    }
    setShowCorrectionModal(true);
  };

  const handleCorrectionComplete = (
    newAnalysis: SharedMealAnalysis,
    _newHistory: ChatMessage[]
  ) => {
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

    setEditedAnalysis(convertedAnalysis);
    setShowCorrectionModal(false);
    console.log('[MealDetailsScreen] Analysis corrected:', convertedAnalysis);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading meal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Go Back"
            onPress={() =>
              navigation.navigate('AppTabs', { screen: 'History' })
            }
            variant="primary"
            size="medium"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Meal Image */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.mealImage} />
          </View>
        )}

        {/* AI Analysis Notes */}
        {analysisData?.notes && (
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceNotes}>{analysisData.notes}</Text>
          </View>
        )}

        {/* Meal Nutrition Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Meal</Text>
          <NutritionSummary nutrition={editedAnalysis.totalNutrition} />
        </View>

        {/* Food Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Food Items</Text>
            <TouchableOpacity
              onPress={() => setShowAddFoodModal(true)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {editedAnalysis.foods.map((food, index) => (
            <FoodItemCard
              key={index}
              food={food}
              onUpdate={updatedFood => updateFoodItem(index, updatedFood)}
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

          {/* Bottom Add Item Button - only show if there are existing items */}
          {editedAnalysis.foods.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowAddFoodModal(true)}
              style={styles.bottomAddButton}
            >
              <Text style={styles.bottomAddButtonText}>+ Add Another Item</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Daily Nutrition Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Progress</Text>
          <View style={styles.dailyProgressContainer}>
            <Text style={styles.dailyProgressNote}>
              Track your daily goals in the main dashboard
            </Text>
            {/* TODO: Add actual daily progress calculation */}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {mealId && canRefineWithAI && (
            <Button
              title="Refine with AI"
              onPress={handleCorrectAnalysis}
              variant="outline"
              size="large"
              style={styles.refineButton}
            />
          )}
          <Button
            title={isExistingMeal ? 'Update Meal' : 'Save Meal'}
            onPress={saveMeal}
            variant="primary"
            loading={saving}
            size="large"
          />
        </View>
      </ScrollView>

      {/* AI Correction Modal */}
      {realMealGroupId && showCorrectionModal && (
        <MealCorrectionModal
          visible={showCorrectionModal}
          onClose={() => setShowCorrectionModal(false)}
          mealId={realMealGroupId}
          currentAnalysis={{
            foods: editedAnalysis.foods.map(food => ({
              name: food.name,
              quantity: parseFloat(food.quantity) || 1,
              unit:
                (typeof food.quantity === 'string'
                  ? food.quantity.replace(/[0-9.]/g, '').trim()
                  : '') || 'serving',
              calories: food.nutrition.calories,
              protein: food.nutrition.protein,
              carbs: food.nutrition.carbs,
              fat: food.nutrition.fat,
              fiber: food.nutrition.fiber || 0,
              sugar: food.nutrition.sugar || 0,
              sodium: food.nutrition.sodium || 0,
            })),
            totalCalories: editedAnalysis.totalNutrition.calories,
            totalProtein: editedAnalysis.totalNutrition.protein,
            totalCarbs: editedAnalysis.totalNutrition.carbs,
            totalFat: editedAnalysis.totalNutrition.fat,
            confidence: editedAnalysis.confidence,
            notes: editedAnalysis.notes,
          }}
          onCorrectionComplete={handleCorrectionComplete}
        />
      )}

      {/* Add Food Method Selection Modal */}
      <Modal
        visible={showAddFoodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFoodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food Item</Text>
              <TouchableOpacity
                onPress={() => setShowAddFoodModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.methodOptions}>
              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setShowAddFoodModal(false);
                  addFoodItemPhoto();
                }}
              >
                <Text style={styles.methodIcon}>📷</Text>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>Take Photo</Text>
                  <Text style={styles.methodDescription}>
                    Capture an image of your food
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setShowAddFoodModal(false);
                  addFoodItemText();
                }}
              >
                <Text style={styles.methodIcon}>💬</Text>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>Describe Food</Text>
                  <Text style={styles.methodDescription}>
                    Type what you ate
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setShowAddFoodModal(false);
                  addFoodItemVoice();
                }}
              >
                <Text style={styles.methodIcon}>🎤</Text>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>Voice Log</Text>
                  <Text style={styles.methodDescription}>
                    Speak what you ate
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setShowAddFoodModal(false);
                  addFoodItemBarcode();
                }}
              >
                <Text style={styles.methodIcon}>📊</Text>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>Scan Barcode</Text>
                  <Text style={styles.methodDescription}>
                    Scan product barcode
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setShowAddFoodModal(false);
                  addFoodItemManual();
                }}
              >
                <Text style={styles.methodIcon}>✏️</Text>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>Manual Entry</Text>
                  <Text style={styles.methodDescription}>
                    Enter nutrition manually
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodOption}
                onPress={() => {
                  setShowAddFoodModal(false);
                  if (!realMealGroupId) {
                    Alert.alert('Error', 'Cannot add from favorites - meal ID not available');
                    return;
                  }
                  navigation.navigate('Favorites' as any, {
                    isEditMode: true,
                    mealGroupId: realMealGroupId,
                  });
                }}
              >
                <Text style={styles.methodIcon}>⭐</Text>
                <View style={styles.methodContent}>
                  <Text style={styles.methodTitle}>From Favorites</Text>
                  <Text style={styles.methodDescription}>
                    Quickly add saved items
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
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
    borderLeftColor: '#6c757d',
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
  bottomAddButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  bottomAddButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6c757d',
  },
  methodOptions: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  dailyProgressContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d',
  },
  dailyProgressNote: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
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
    gap: 12,
  },
  refineButton: {
    marginBottom: 8,
  },
});
