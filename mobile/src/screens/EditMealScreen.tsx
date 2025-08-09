import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Edit2,
  Plus,
  Trash2,
  Camera,
  Mic,
  Scan,
  Type,
  Sparkles,
  Check,
  X,
  Heart,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { hapticFeedback } from '../utils/haptics';
import tokens from '../utils/tokens';

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  parent?: string;
  isEditing?: boolean;
}

interface FoodGroup {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
  isEditing?: boolean;
}

type RouteParams = {
  EditMeal: {
    mealId: string;
    meal: any;
  };
};

export default function EditMealScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'EditMeal'>>();
  const { meal } = route.params || {};

  const [selectedMealType, setSelectedMealType] = useState(
    meal?.type || 'Meal'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);

  // Mock food groups for the detailed breakdown
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([
    {
      id: 'sandwich',
      name: 'Turkey Sandwich',
      calories: 380,
      protein: 25,
      carbs: 45,
      fat: 12,
      items: [
        {
          id: 'bread',
          name: 'Whole Wheat Bread',
          quantity: '2 slices',
          calories: 140,
          protein: 6,
          carbs: 24,
          fat: 2,
          parent: 'sandwich',
        },
        {
          id: 'turkey',
          name: 'Turkey Breast',
          quantity: '3 oz',
          calories: 90,
          protein: 19,
          carbs: 0,
          fat: 1,
          parent: 'sandwich',
        },
        {
          id: 'lettuce',
          name: 'Lettuce',
          quantity: '0.5 cup',
          calories: 4,
          protein: 0.5,
          carbs: 1,
          fat: 0,
          parent: 'sandwich',
        },
        {
          id: 'tomato',
          name: 'Tomato',
          quantity: '2 slices',
          calories: 5,
          protein: 0.3,
          carbs: 1,
          fat: 0,
          parent: 'sandwich',
        },
      ],
    },
    {
      id: 'chips',
      name: 'Potato Chips',
      calories: 150,
      protein: 2,
      carbs: 15,
      fat: 10,
      items: [],
    },
    {
      id: 'pickle',
      name: 'Dill Pickle',
      calories: 12,
      protein: 0.5,
      carbs: 2,
      fat: 0.1,
      items: [],
    },
  ]);

  const handleEditItem = (groupId: string, itemId?: string) => {
    hapticFeedback.selection();
    setFoodGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === groupId) {
          if (!itemId) {
            // Editing the whole group
            return {
              ...group,
              isEditing: !group.isEditing,
            };
          } else {
            // Editing a specific item
            return {
              ...group,
              items: group.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      isEditing: !item.isEditing,
                    }
                  : item
              ),
            };
          }
        }
        return group;
      })
    );
  };

  const handleUpdateItem = (
    groupId: string,
    itemId: string | undefined,
    field: 'calories' | 'protein' | 'carbs' | 'fat' | 'quantity' | 'name',
    value: string | number
  ) => {
    setFoodGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === groupId) {
          if (!itemId) {
            // Update group
            return {
              ...group,
              [field]:
                field === 'name' || field === 'quantity'
                  ? value
                  : Number(value),
            };
          } else {
            // Update specific item
            return {
              ...group,
              items: group.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      [field]:
                        field === 'name' || field === 'quantity'
                          ? value
                          : Number(value),
                    }
                  : item
              ),
            };
          }
        }
        return group;
      })
    );
  };

  const handleSaveEdit = (groupId: string, itemId?: string) => {
    hapticFeedback.success();
    setFoodGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === groupId) {
          if (!itemId) {
            // Save group edit
            return {
              ...group,
              isEditing: false,
            };
          } else {
            // Save specific item edit
            return {
              ...group,
              items: group.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      isEditing: false,
                    }
                  : item
              ),
            };
          }
        }
        return group;
      })
    );
    // Recalculate group totals if an item was edited
    if (itemId) {
      recalculateGroupTotals(groupId);
    }
  };

  const recalculateGroupTotals = (groupId: string) => {
    setFoodGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.id === groupId && group.items.length > 0) {
          const totals = group.items.reduce(
            (acc, item) => ({
              calories: acc.calories + item.calories,
              protein: acc.protein + item.protein,
              carbs: acc.carbs + item.carbs,
              fat: acc.fat + item.fat,
            }),
            {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            }
          );
          return {
            ...group,
            ...totals,
          };
        }
        return group;
      })
    );
  };

  const handleDeleteItem = (groupId: string, itemId?: string) => {
    hapticFeedback.impact();
    if (!itemId) {
      // Delete entire group
      setFoodGroups(prevGroups =>
        prevGroups.filter(group => group.id !== groupId)
      );
      return;
    }
    // Delete specific item from group
    setFoodGroups(
      prevGroups =>
        prevGroups
          .map(group => {
            if (group.id === groupId) {
              const updatedItems = group.items.filter(
                item => item.id !== itemId
              );
              // If all items are deleted, remove the group
              if (group.items.length > 0 && updatedItems.length === 0) {
                return null;
              }
              // Recalculate group totals
              const itemCalories =
                group.items.find(item => item.id === itemId)?.calories || 0;
              const itemProtein =
                group.items.find(item => item.id === itemId)?.protein || 0;
              const itemCarbs =
                group.items.find(item => item.id === itemId)?.carbs || 0;
              const itemFat =
                group.items.find(item => item.id === itemId)?.fat || 0;
              return {
                ...group,
                items: updatedItems,
                calories: group.calories - itemCalories,
                protein: group.protein - itemProtein,
                carbs: group.carbs - itemCarbs,
                fat: group.fat - itemFat,
              };
            }
            return group;
          })
          .filter(Boolean) as FoodGroup[]
    );
  };

  const handleToggleFavorite = (itemId: string, groupId?: string) => {
    hapticFeedback.impact();
    if (favoriteItems.includes(itemId)) {
      // Remove from favorites
      setFavoriteItems(favoriteItems.filter(id => id !== itemId));
    } else {
      // Add to favorites
      setFavoriteItems([...favoriteItems, itemId]);
    }
  };

  const calculateTotalCalories = () => {
    return foodGroups.reduce((total, group) => total + group.calories, 0);
  };

  const handleSave = () => {
    hapticFeedback.success();
    setIsLoading(true);
    // Simulate saving
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate(
        'MealSaved' as never,
        {
          meal: {
            ...meal,
            type: selectedMealType,
            time: meal?.time,
            calories: calculateTotalCalories(),
            foodGroups,
          },
        } as never
      );
    }, 800);
  };

  const handleAddMore = (method: string) => {
    hapticFeedback.selection();
    // Navigate to appropriate screen based on method
    switch (method) {
      case 'camera':
        navigation.navigate('Camera' as never);
        break;
      case 'voice':
        navigation.navigate('VoiceLog' as never);
        break;
      case 'barcode':
        navigation.navigate('BarcodeScanner' as never);
        break;
      case 'text':
        navigation.navigate('ManualEntry' as never);
        break;
    }
  };

  const handleRefineWithAI = () => {
    hapticFeedback.selection();
    // TODO: Implement AI refinement
  };

  // Meal type options
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const renderFoodGroup = (group: FoodGroup) => {
    return (
      <Animated.View
        key={group.id}
        entering={FadeIn}
        exiting={FadeOut}
        layout={Layout}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      >
        {group.isEditing ? (
          // Group editing mode
          <View className="space-y-3">
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 p-3 bg-gray-50 rounded-xl text-base"
                value={group.name}
                onChangeText={text =>
                  handleUpdateItem(group.id, undefined, 'name', text)
                }
                placeholder="Food name"
              />
              <View className="flex-row ml-2">
                <TouchableOpacity
                  onPress={() => handleSaveEdit(group.id)}
                  className="p-2 bg-green-100 rounded-full mr-1"
                >
                  <Check size={18} color={tokens.colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleEditItem(group.id)}
                  className="p-2 bg-red-100 rounded-full"
                >
                  <X size={18} color={tokens.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Calories</Text>
                <TextInput
                  className="p-2 bg-gray-50 rounded-lg text-sm"
                  value={String(group.calories)}
                  onChangeText={text =>
                    handleUpdateItem(group.id, undefined, 'calories', text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Protein (g)</Text>
                <TextInput
                  className="p-2 bg-gray-50 rounded-lg text-sm"
                  value={String(group.protein)}
                  onChangeText={text =>
                    handleUpdateItem(group.id, undefined, 'protein', text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Carbs (g)</Text>
                <TextInput
                  className="p-2 bg-gray-50 rounded-lg text-sm"
                  value={String(group.carbs)}
                  onChangeText={text =>
                    handleUpdateItem(group.id, undefined, 'carbs', text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Fat (g)</Text>
                <TextInput
                  className="p-2 bg-gray-50 rounded-lg text-sm"
                  value={String(group.fat)}
                  onChangeText={text =>
                    handleUpdateItem(group.id, undefined, 'fat', text)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ) : (
          // Group normal view
          <View>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold">{group.name}</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity onPress={() => handleEditItem(group.id)}>
                  <Edit2 size={16} color={tokens.colors.primary.DEFAULT} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(group.id)}>
                  <Trash2 size={16} color={tokens.colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleToggleFavorite(group.id)}
                >
                  <Heart
                    size={16}
                    color={
                      favoriteItems.includes(group.id)
                        ? tokens.colors.error
                        : '#E5E7EB'
                    }
                    fill={
                      favoriteItems.includes(group.id)
                        ? tokens.colors.error
                        : 'transparent'
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-base font-medium">
                {group.calories} cal
              </Text>
              <View className="flex-row space-x-3">
                <Text className="text-xs text-gray-500">
                  P: {group.protein}g
                </Text>
                <Text className="text-xs text-gray-500">C: {group.carbs}g</Text>
                <Text className="text-xs text-gray-500">F: {group.fat}g</Text>
              </View>
            </View>
          </View>
        )}

        {/* Ingredients */}
        {group.items.length > 0 && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-500 mb-2">Ingredients:</Text>
            <View className="space-y-2">
              {group.items.map(item =>
                item.isEditing ? (
                  // Item editing mode
                  <View
                    key={item.id}
                    className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2"
                  >
                    <View className="flex-row items-center">
                      <TextInput
                        className="flex-1 p-2 bg-white rounded-lg text-sm"
                        value={item.name}
                        onChangeText={text =>
                          handleUpdateItem(group.id, item.id, 'name', text)
                        }
                        placeholder="Item name"
                      />
                      <View className="flex-row ml-2">
                        <TouchableOpacity
                          onPress={() => handleSaveEdit(group.id, item.id)}
                          className="p-1.5 bg-green-100 rounded-full mr-1"
                        >
                          <Check size={14} color={tokens.colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleEditItem(group.id, item.id)}
                          className="p-1.5 bg-red-100 rounded-full"
                        >
                          <X size={14} color={tokens.colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500 mb-1">
                        Quantity
                      </Text>
                      <TextInput
                        className="p-2 bg-white rounded-lg text-sm"
                        value={item.quantity}
                        onChangeText={text =>
                          handleUpdateItem(group.id, item.id, 'quantity', text)
                        }
                        placeholder="e.g., 2 slices"
                      />
                    </View>
                    <View className="flex-row space-x-2">
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-1">
                          Calories
                        </Text>
                        <TextInput
                          className="p-2 bg-white rounded-lg text-sm"
                          value={String(item.calories)}
                          onChangeText={text =>
                            handleUpdateItem(
                              group.id,
                              item.id,
                              'calories',
                              text
                            )
                          }
                          keyboardType="numeric"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-1">
                          Protein
                        </Text>
                        <TextInput
                          className="p-2 bg-white rounded-lg text-sm"
                          value={String(item.protein)}
                          onChangeText={text =>
                            handleUpdateItem(group.id, item.id, 'protein', text)
                          }
                          keyboardType="numeric"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-1">
                          Carbs
                        </Text>
                        <TextInput
                          className="p-2 bg-white rounded-lg text-sm"
                          value={String(item.carbs)}
                          onChangeText={text =>
                            handleUpdateItem(group.id, item.id, 'carbs', text)
                          }
                          keyboardType="numeric"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-1">Fat</Text>
                        <TextInput
                          className="p-2 bg-white rounded-lg text-sm"
                          value={String(item.fat)}
                          onChangeText={text =>
                            handleUpdateItem(group.id, item.id, 'fat', text)
                          }
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  // Item normal view
                  <View
                    key={item.id}
                    className="flex-row justify-between items-center py-2 px-3 bg-gray-50 rounded-xl"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium">{item.name}</Text>
                      <Text className="text-xs text-gray-500">
                        {item.quantity}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="mr-3">
                        <Text className="text-sm font-medium text-right">
                          {item.calories} cal
                        </Text>
                        <View className="flex-row space-x-2">
                          <Text className="text-xs text-gray-500">
                            P: {item.protein}g
                          </Text>
                          <Text className="text-xs text-gray-500">
                            C: {item.carbs}g
                          </Text>
                          <Text className="text-xs text-gray-500">
                            F: {item.fat}g
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row space-x-1">
                        <TouchableOpacity
                          onPress={() => handleEditItem(group.id, item.id)}
                        >
                          <Edit2
                            size={14}
                            color={tokens.colors.primary.DEFAULT}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteItem(group.id, item.id)}
                        >
                          <Trash2 size={14} color={tokens.colors.error} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            handleToggleFavorite(item.id, group.id)
                          }
                        >
                          <Heart
                            size={14}
                            color={
                              favoriteItems.includes(item.id)
                                ? tokens.colors.error
                                : '#E5E7EB'
                            }
                            fill={
                              favoriteItems.includes(item.id)
                                ? tokens.colors.error
                                : 'transparent'
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )
              )}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-2">
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.selection();
              navigation.goBack();
            }}
            className="p-2"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Edit Meal</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Meal Type Selector */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-base font-semibold mb-3">Meal Type</Text>
            <View className="flex-row space-x-2">
              {mealTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    hapticFeedback.selection();
                    setSelectedMealType(type);
                  }}
                  className={`flex-1 py-3 rounded-xl ${
                    selectedMealType === type ? 'bg-primary' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      selectedMealType === type ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Food items */}
          <View className="mb-4">
            <Text className="text-base font-semibold mb-3">Food Items</Text>
            {foodGroups.map(renderFoodGroup)}
          </View>

          {/* Add more options */}
          <View className="mb-6">
            <Text className="text-base font-semibold mb-3">Add More Food</Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => handleAddMore('camera')}
                className="flex-1 items-center p-3 bg-white rounded-xl"
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Camera size={18} color={tokens.colors.primary.DEFAULT} />
                </View>
                <Text className="text-xs text-gray-700">Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAddMore('voice')}
                className="flex-1 items-center p-3 bg-white rounded-xl"
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Mic size={18} color={tokens.colors.primary.DEFAULT} />
                </View>
                <Text className="text-xs text-gray-700">Voice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAddMore('barcode')}
                className="flex-1 items-center p-3 bg-white rounded-xl"
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Scan size={18} color={tokens.colors.primary.DEFAULT} />
                </View>
                <Text className="text-xs text-gray-700">Barcode</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAddMore('text')}
                className="flex-1 items-center p-3 bg-white rounded-xl"
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Type size={18} color={tokens.colors.primary.DEFAULT} />
                </View>
                <Text className="text-xs text-gray-700">Text</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Refine with AI button */}
          <TouchableOpacity
            onPress={handleRefineWithAI}
            className="flex-row items-center justify-center bg-primary/10 rounded-2xl p-4 mb-4"
          >
            <Sparkles size={20} color={tokens.colors.primary.DEFAULT} />
            <Text className="ml-2 text-primary font-semibold">
              Refine with AI
            </Text>
          </TouchableOpacity>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className="bg-primary rounded-2xl p-4 mb-6"
          >
            {isLoading ? (
              <LoadingIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
