import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  Plus,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { RootStackParamList } from '../types/navigation';
import { getMealDetailsByGroupId } from '../services/meals';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import mealAIService from '../services/mealAI';
import { hapticFeedback } from '../utils/haptics';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type MealViewScreenRouteProp = RouteProp<RootStackParamList, 'MealViewScreen'>;
type MealViewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MealViewScreen'>;

interface FoodItemData {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
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
}

// Removed ExpandableFoodItem component - will handle expansion inline

export default function MealViewScreen() {
  const navigation = useNavigation<MealViewScreenNavigationProp>();
  const route = useRoute<MealViewScreenRouteProp>();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [mealData, setMealData] = useState<MealData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingDuplicate, setSavingDuplicate] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [macroAnimationKey, setMacroAnimationKey] = useState(0);

  const { mealId, mealGroupId } = route.params || {};

  useEffect(() => {
    loadMealData();
  }, [mealId, mealGroupId]);

  // Trigger macro animations on mount
  useEffect(() => {
    if (mealData) {
      // Trigger animation after a short delay
      setTimeout(() => {
        setMacroAnimationKey(prev => prev + 1);
      }, 100);
    }
  }, [mealData]);

  const loadMealData = async () => {
    if (!user || (!mealId && !mealGroupId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Use mealGroupId if available, otherwise use mealId
      const targetId = mealGroupId || mealId;
      
      if (!targetId) {
        throw new Error('No meal ID provided');
      }
      
      // Fetch meal details by group ID (UUID)
      const result = await getMealDetailsByGroupId(targetId, user.id);
      
      if (result.success && result.data) {
        const mealAnalysis = result.data;
        
        // Get the first meal entry to extract metadata
        // We'll need to fetch the actual meal entry to get the correct mealType and loggedAt
        const { data: mealEntry } = await supabase
          .from('meal_entries')
          .select('meal_type, logged_at')
          .eq('meal_group_id', targetId)
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
          foods: mealAnalysis.foods?.map((food: any) => ({
            name: food.name,
            quantity: food.quantity,
            calories: food.nutrition?.calories || 0,
            protein: food.nutrition?.protein || 0,
            carbs: food.nutrition?.carbs || 0,
            fat: food.nutrition?.fat || 0,
            fiber: food.nutrition?.fiber,
            sugar: food.nutrition?.sugar,
            sodium: food.nutrition?.sodium,
          })) || [],
          imageUrl: result.imageUrl,
          notes: mealAnalysis.notes,
          title: mealAnalysis.title || mealAnalysis.mealTitle, // Try to get meal title
        };
        
        setMealData(formattedMeal);
      } else {
        throw new Error(result.error || 'Failed to load meal details');
      }
    } catch (error) {
      console.error('[MealViewScreen] Error loading meal:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load meal details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    hapticFeedback.selection();
    Alert.alert('Share', 'Sharing functionality coming soon!');
  };

  const handleToggleFavorite = () => {
    hapticFeedback.selection();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorites functionality with Supabase
  };

  const handleViewFavorites = () => {
    hapticFeedback.selection();
    // TODO: Navigate to favorites screen
    Alert.alert('Favorites', 'Favorites screen coming soon!');
  };

  const toggleFoodItem = (index: number) => {
    hapticFeedback.selection();
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const handleLogAgain = async () => {
    if (!mealData || !user) return;
    
    hapticFeedback.selection();
    setSavingDuplicate(true);
    
    try {
      // Create a description from the food items
      const description = mealData.foods
        .map(food => `${food.quantity} ${food.name}`)
        .join(', ');
      
      // Save as a new meal for today
      const result = await mealAIService.saveMealDirectly(
        {
          foods: mealData.foods.map(food => ({
            name: food.name,
            quantity: parseFloat(food.quantity.split(' ')[0]) || 1,
            unit: food.quantity.split(' ').slice(1).join(' ') || 'serving',
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber,
            sugar: food.sugar,
            sodium: food.sodium,
          })),
          totalCalories: mealData.totalCalories,
          totalProtein: mealData.totalProtein,
          totalCarbs: mealData.totalCarbs,
          totalFat: mealData.totalFat,
          confidence: 0.95,
          notes: `Logged again from previous meal`,
        },
        description,
        mealData.mealType
      );
      
      if (result.success) {
        Alert.alert('Success', 'Meal logged successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Main'),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to log meal');
      }
    } catch (error) {
      console.error('[MealViewScreen] Error logging meal again:', error);
      Alert.alert('Error', 'Failed to log meal');
    } finally {
      setSavingDuplicate(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatMealType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getDateLabel = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateMacroPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    // Calculate based on caloric values: protein & carbs = 4 cal/g, fat = 9 cal/g
    const proteinCal = mealData?.totalProtein ? mealData.totalProtein * 4 : 0;
    const carbsCal = mealData?.totalCarbs ? mealData.totalCarbs * 4 : 0;
    const fatCal = mealData?.totalFat ? mealData.totalFat * 9 : 0;
    const totalMacroCal = proteinCal + carbsCal + fatCal;
    
    if (value === mealData?.totalProtein) return (proteinCal / totalMacroCal) * 100;
    if (value === mealData?.totalCarbs) return (carbsCal / totalMacroCal) * 100;
    if (value === mealData?.totalFat) return (fatCal / totalMacroCal) * 100;
    
    return 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#320DFF" />
          <Text style={styles.loadingText}>Loading meal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!mealData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Meal not found</Text>
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
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Image/Gradient */}
        <View style={styles.headerContainer}>
          {mealData.imageUrl ? (
            <Image source={{ uri: mealData.imageUrl }} style={styles.headerImage} />
          ) : (
            <LinearGradient
              colors={['#320DFF', '#5E3FFF', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            />
          )}
          
          {/* Navigation Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                hapticFeedback.selection();
                navigation.goBack();
              }}
            >
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            
            <View style={styles.navActions}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleToggleFavorite}
              >
                <Heart
                  size={24}
                  color={isFavorite ? '#FF0000' : '#111827'}
                  fill={isFavorite ? '#FF0000' : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleShare}
              >
                <Share2 size={24} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Meal Info */}
          <View style={styles.mealInfoContainer}>
            <Text style={styles.mealTitle}>
              {mealData.title || formatMealType(mealData.mealType)}
            </Text>
            <View style={styles.mealTimeRow}>
              <Text style={styles.mealTime}>
                {formatTime(mealData.loggedAt)}
              </Text>
              <Text style={styles.mealDate}>
                {getDateLabel(mealData.loggedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Calories Card */}
          <View style={styles.caloriesCard}>
            <Text style={styles.caloriesValue}>{mealData.totalCalories}</Text>
            <Text style={styles.caloriesLabel}>calories</Text>
            <Text style={styles.totalLabel}>Total calories</Text>
          </View>

          {/* Macronutrients */}
          <View style={styles.macrosCard}>
            <Text style={styles.sectionTitle}>Macronutrients</Text>
            
            <View style={styles.macrosList}>
              {/* Carbs */}
              <View style={styles.macroItem}>
                <View style={styles.macroHeader}>
                  <View style={styles.macroLabelContainer}>
                    <View style={[styles.macroDot, { backgroundColor: '#FFC078' }]} />
                    <Text style={styles.macroName}>Carbs</Text>
                  </View>
                  <Text style={styles.macroValue}>{mealData.totalCarbs}g</Text>
                </View>
                <View style={styles.macroBarContainer}>
                  <MotiView
                    key={`carbs-${macroAnimationKey}`}
                    from={{ width: '0%' }}
                    animate={{ 
                      width: `${calculateMacroPercentage(mealData.totalCarbs, mealData.totalCalories)}%`
                    }}
                    transition={{
                      type: 'timing',
                      duration: 800,
                      delay: 0,
                    }}
                    style={[
                      styles.macroBar,
                      { backgroundColor: '#FFC078' }
                    ]} 
                  />
                </View>
              </View>

              {/* Protein */}
              <View style={styles.macroItem}>
                <View style={styles.macroHeader}>
                  <View style={styles.macroLabelContainer}>
                    <View style={[styles.macroDot, { backgroundColor: '#74C0FC' }]} />
                    <Text style={styles.macroName}>Protein</Text>
                  </View>
                  <Text style={styles.macroValue}>{mealData.totalProtein}g</Text>
                </View>
                <View style={styles.macroBarContainer}>
                  <MotiView
                    key={`protein-${macroAnimationKey}`}
                    from={{ width: '0%' }}
                    animate={{ 
                      width: `${calculateMacroPercentage(mealData.totalProtein, mealData.totalCalories)}%`
                    }}
                    transition={{
                      type: 'timing',
                      duration: 800,
                      delay: 100,
                    }}
                    style={[
                      styles.macroBar,
                      { backgroundColor: '#74C0FC' }
                    ]} 
                  />
                </View>
              </View>

              {/* Fat */}
              <View style={styles.macroItem}>
                <View style={styles.macroHeader}>
                  <View style={styles.macroLabelContainer}>
                    <View style={[styles.macroDot, { backgroundColor: '#8CE99A' }]} />
                    <Text style={styles.macroName}>Fat</Text>
                  </View>
                  <Text style={styles.macroValue}>{mealData.totalFat}g</Text>
                </View>
                <View style={styles.macroBarContainer}>
                  <MotiView
                    key={`fat-${macroAnimationKey}`}
                    from={{ width: '0%' }}
                    animate={{ 
                      width: `${calculateMacroPercentage(mealData.totalFat, mealData.totalCalories)}%`
                    }}
                    transition={{
                      type: 'timing',
                      duration: 800,
                      delay: 200,
                    }}
                    style={[
                      styles.macroBar,
                      { backgroundColor: '#8CE99A' }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Food Items */}
          <View style={styles.foodItemsSection}>
            <Text style={styles.sectionTitle}>Food Items</Text>
            {mealData.foods.map((food, index) => (
              <TouchableOpacity
                key={index}
                style={styles.foodItem}
                onPress={() => toggleFoodItem(index)}
                activeOpacity={0.7}
              >
                <View style={styles.foodItemMain}>
                  <View style={styles.foodItemLeft}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    {!expandedItems.has(index) && (
                      <View style={styles.foodItemMacros}>
                        <Text style={styles.foodMacroText}>P: {food.protein}g</Text>
                        <Text style={styles.foodMacroText}>C: {food.carbs}g</Text>
                        <Text style={styles.foodMacroText}>F: {food.fat}g</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.foodItemRight}>
                    <Text style={styles.foodCalories}>{food.calories} cal</Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        hapticFeedback.selection();
                        // TODO: Toggle favorite for individual food item
                      }}
                    >
                      <Heart size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {expandedItems.has(index) && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ type: 'timing', duration: 300 }}
                  >
                    <View style={styles.foodItemExpanded}>
                      <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Protein:</Text>
                          <Text style={styles.nutritionValue}>{food.protein}g</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Carbs:</Text>
                          <Text style={styles.nutritionValue}>{food.carbs}g</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                          <Text style={styles.nutritionLabel}>Fat:</Text>
                          <Text style={styles.nutritionValue}>{food.fat}g</Text>
                        </View>
                        {food.fiber !== undefined && (
                          <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>Fiber:</Text>
                            <Text style={styles.nutritionValue}>{food.fiber}g</Text>
                          </View>
                        )}
                        {food.sugar !== undefined && (
                          <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>Sugar:</Text>
                            <Text style={styles.nutritionValue}>{food.sugar}g</Text>
                          </View>
                        )}
                        {food.sodium !== undefined && (
                          <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionLabel}>Sodium:</Text>
                            <Text style={styles.nutritionValue}>{food.sodium}mg</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.foodQuantity}>{food.quantity}</Text>
                    </View>
                  </MotiView>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.favoritesButton}
              onPress={handleViewFavorites}
            >
              <Heart size={20} color="#111827" />
              <Text style={styles.favoritesButtonText}>View Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logAgainButton}
              onPress={handleLogAgain}
              disabled={savingDuplicate}
            >
              {savingDuplicate ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.logAgainButtonText}>Log Again</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  headerContainer: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerGradient: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navActions: {
    flexDirection: 'row',
    gap: 12,
  },
  mealInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  mealTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mealTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  mealDate: {
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
  },
  caloriesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
  },
  caloriesLabel: {
    fontSize: 18,
    color: '#111827',
    opacity: 0.7,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  macrosCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  macrosList: {
    gap: 16,
  },
  macroItem: {
    gap: 8,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  macroName: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  macroBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  foodItemsSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  foodItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  foodItemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodItemLeft: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  foodItemMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  foodMacroText: {
    fontSize: 12,
    color: '#6B7280',
  },
  foodItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  foodItemExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  nutritionItem: {
    flexDirection: 'row',
    minWidth: '45%',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  foodQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 32,
  },
  favoritesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#111827',
    backgroundColor: 'transparent',
  },
  favoritesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  logAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: '#320DFF',
  },
  logAgainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});