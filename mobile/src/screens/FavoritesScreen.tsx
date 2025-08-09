import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  Plus,
  Heart,
  Filter,
  Sparkles,
  Trash2,
  X,
  Check,
  CheckCircle,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { hapticFeedback } from '../utils/haptics';
import tokens from '../utils/tokens';

interface FavoriteItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: 'meal' | 'food' | 'recipe' | 'ingredient';
  quantity?: string;
  frequency: number;
  isFavorite?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.25;

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'meals' | 'foods' | 'ingredients'
  >('all');
  const [showAddWithAI, setShowAddWithAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: '',
  });

  // Sample favorites data
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    {
      id: '1',
      name: 'Turkey Sandwich',
      calories: 380,
      protein: 25,
      carbs: 45,
      fat: 12,
      type: 'meal',
      frequency: 12,
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Protein Shake',
      calories: 220,
      protein: 30,
      carbs: 15,
      fat: 3,
      type: 'food',
      frequency: 8,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Greek Salad',
      calories: 320,
      protein: 12,
      carbs: 20,
      fat: 24,
      type: 'food',
      frequency: 5,
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Chicken & Rice Bowl',
      calories: 450,
      protein: 35,
      carbs: 55,
      fat: 10,
      type: 'meal',
      frequency: 7,
      isFavorite: true,
    },
    {
      id: '5',
      name: 'Avocado Toast',
      calories: 280,
      protein: 8,
      carbs: 30,
      fat: 16,
      type: 'food',
      frequency: 10,
      isFavorite: true,
    },
    {
      id: '6',
      name: 'Turkey Breast',
      calories: 90,
      protein: 19,
      carbs: 0,
      fat: 1,
      quantity: '3 oz',
      type: 'ingredient',
      frequency: 15,
      isFavorite: true,
    },
    {
      id: '7',
      name: 'Whole Wheat Bread',
      calories: 70,
      protein: 3,
      carbs: 12,
      fat: 1,
      quantity: '1 slice',
      type: 'ingredient',
      frequency: 14,
      isFavorite: true,
    },
    {
      id: '8',
      name: 'Lettuce',
      calories: 4,
      protein: 0.5,
      carbs: 1,
      fat: 0,
      quantity: '0.5 cup',
      type: 'ingredient',
      frequency: 9,
      isFavorite: true,
    },
  ]);

  // Clear notification after timeout
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({
          show: false,
          message: '',
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFilterChange = (
    filter: 'all' | 'meals' | 'foods' | 'ingredients'
  ) => {
    hapticFeedback.selection();
    setActiveFilter(filter);
  };

  const handleSelectFavorite = (item: FavoriteItem) => {
    hapticFeedback.selection();
    if (isMultiSelectMode) {
      toggleItemSelection(item.id);
    } else {
      // Navigate to meal details or add to current meal
      navigation.navigate(
        'MealDetails' as never,
        {
          favoriteItem: item,
        } as never
      );
    }
  };

  const toggleItemSelection = (id: string) => {
    hapticFeedback.selection();
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
      if (!isMultiSelectMode) {
        setIsMultiSelectMode(true);
      }
    }
  };

  const handleToggleMultiSelectMode = () => {
    hapticFeedback.selection();
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedItems([]);
    }
  };

  const handleAddSelectedItems = () => {
    hapticFeedback.success();
    setNotification({
      show: true,
      message: `${selectedItems.length} items added to meal`,
    });
    setSelectedItems([]);
    setIsMultiSelectMode(false);
  };

  const handleAddWithAI = () => {
    if (!aiInput.trim()) return;
    hapticFeedback.selection();
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      // Add a new item based on AI input
      const newItem: FavoriteItem = {
        id: Date.now().toString(),
        name: aiInput,
        calories: Math.floor(Math.random() * 300) + 100,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 30) + 10,
        fat: Math.floor(Math.random() * 15) + 2,
        type: 'food',
        frequency: 1,
        isFavorite: true,
      };
      setFavorites([newItem, ...favorites]);
      setAiInput('');
      setIsProcessing(false);
      setShowAddWithAI(false);
      setNotification({
        show: true,
        message: `${newItem.name} added to favorites`,
      });
      hapticFeedback.success();
    }, 1500);
  };

  const handleDeleteFavorite = (id: string) => {
    hapticFeedback.impact();
    const itemToDelete = favorites.find(item => item.id === id);
    setFavorites(favorites.filter(item => item.id !== id));
    setSwipedItemId(null);
    if (itemToDelete) {
      setNotification({
        show: true,
        message: `${itemToDelete.name} removed from favorites`,
      });
    }
  };

  const filteredFavorites = favorites
    .filter(item => {
      // Apply search filter
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter(item => {
      // Apply type filter
      if (activeFilter === 'all') return true;
      if (activeFilter === 'meals') return item.type === 'meal';
      if (activeFilter === 'foods') return item.type === 'food';
      if (activeFilter === 'ingredients') return item.type === 'ingredient';
      return true;
    });

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => {
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(90);

    const gestureHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { startX: number }
    >({
      onStart: (_, ctx) => {
        ctx.startX = translateX.value;
      },
      onActive: (event, ctx) => {
        if (!isMultiSelectMode) {
          translateX.value = Math.max(ctx.startX + event.translationX, -100);
        }
      },
      onEnd: () => {
        if (!isMultiSelectMode) {
          if (translateX.value < SWIPE_THRESHOLD) {
            translateX.value = withSpring(-100);
            runOnJS(setSwipedItemId)(item.id);
            runOnJS(hapticFeedback.impact)();
          } else {
            translateX.value = withSpring(0);
            runOnJS(setSwipedItemId)(null);
          }
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    return (
      <View className="relative overflow-hidden mb-3">
        {/* Swipe delete action */}
        <View className="absolute right-0 top-0 bottom-0 bg-danger flex-row items-center justify-center px-6 rounded-2xl">
          <TouchableOpacity onPress={() => handleDeleteFavorite(item.id)}>
            <Trash2 size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              onPress={() => handleSelectFavorite(item)}
              activeOpacity={0.7}
              className={`bg-white rounded-2xl p-4 shadow-sm ${
                selectedItems.includes(item.id)
                  ? 'border-2 border-primary'
                  : 'border border-gray-100'
              }`}
            >
              <View className="flex-row">
                {isMultiSelectMode && (
                  <TouchableOpacity
                    onPress={() => toggleItemSelection(item.id)}
                    className="mr-3"
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedItems.includes(item.id)
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedItems.includes(item.id) && (
                        <Check size={14} color="#FFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center mr-3">
                  <Text className="text-primary font-bold text-xl">
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-base font-semibold">
                        {item.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500 capitalize">
                          {item.type}
                        </Text>
                        {item.quantity && (
                          <Text className="text-xs text-gray-500 ml-2">
                            • {item.quantity}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text className="text-base font-medium">
                      {item.calories} cal
                    </Text>
                  </View>
                  <View className="flex-row justify-between mt-2">
                    <View className="flex-row space-x-3">
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
                    {!isMultiSelectMode && (
                      <TouchableOpacity
                        onPress={() => {
                          hapticFeedback.selection();
                          setNotification({
                            show: true,
                            message: `${item.name} added to meal`,
                          });
                        }}
                        className="flex-row items-center"
                      >
                        <Plus size={12} color={tokens.colors.primary.DEFAULT} />
                        <Text className="text-xs text-primary ml-0.5">Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {swipedItemId === item.id && !isMultiSelectMode && (
                  <TouchableOpacity
                    onPress={() => {
                      setSwipedItemId(null);
                      translateX.value = withSpring(0);
                      hapticFeedback.selection();
                    }}
                    className="ml-2 self-center"
                  >
                    <X size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => {
              hapticFeedback.selection();
              if (isMultiSelectMode) {
                setIsMultiSelectMode(false);
                setSelectedItems([]);
              } else {
                navigation.goBack();
              }
            }}
            className="p-2"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View className="ml-2">
            <Text className="text-xl font-bold">Favorites</Text>
            <Text className="text-sm text-gray-500">
              Your saved meals and foods
            </Text>
          </View>
        </View>
        {isMultiSelectMode ? (
          <TouchableOpacity
            onPress={handleToggleMultiSelectMode}
            className="px-4 py-2 bg-primary rounded-xl"
          >
            <Text className="text-white font-medium">Done</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={handleToggleMultiSelectMode}
              className="p-2 bg-gray-100 rounded-xl"
            >
              <Check size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.selection();
                setShowAddWithAI(!showAddWithAI);
              }}
              className="p-2 bg-primary rounded-xl"
            >
              <Plus size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add with AI section */}
      {showAddWithAI && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="mx-4 bg-white border border-primary/20 rounded-2xl p-4 mb-4 shadow-sm"
        >
          <View className="flex-row items-center mb-2">
            <Sparkles size={16} color={tokens.colors.primary.DEFAULT} />
            <Text className="ml-2 font-semibold">Add with AI</Text>
          </View>
          <Text className="text-sm text-gray-500 mb-3">
            Describe the food you want to add to your favorites
          </Text>
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 p-3 bg-gray-50 rounded-xl text-base mr-2"
              placeholder="E.g., Grilled chicken breast with rice"
              value={aiInput}
              onChangeText={setAiInput}
            />
            <TouchableOpacity
              onPress={handleAddWithAI}
              disabled={isProcessing || !aiInput.trim()}
              className={`px-4 py-3 rounded-xl ${
                isProcessing || !aiInput.trim() ? 'bg-gray-200' : 'bg-primary'
              }`}
            >
              {isProcessing ? (
                <LoadingIndicator color="#FFF" size="small" />
              ) : (
                <Text
                  className={`font-medium ${
                    !aiInput.trim() ? 'text-gray-400' : 'text-white'
                  }`}
                >
                  Add
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Search and Filters */}
      <View className="px-4">
        {/* Search bar */}
        <View className="relative mb-4">
          <View className="absolute left-3 top-3.5 z-10">
            <Search size={16} color="#9CA3AF" />
          </View>
          <TextInput
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-base shadow-sm"
            placeholder="Search favorites..."
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              hapticFeedback.selection();
            }}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row space-x-2">
            {['all', 'meals', 'foods', 'ingredients'].map(filter => (
              <TouchableOpacity
                key={filter}
                onPress={() => handleFilterChange(filter as any)}
                className={`px-4 py-2 rounded-full ${
                  activeFilter === filter ? 'bg-primary' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium capitalize ${
                    activeFilter === filter ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {filter === 'all' ? 'All Favorites' : filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Quick Add section */}
      {filteredFavorites.length > 0 && !isMultiSelectMode && (
        <View className="px-4 mb-4">
          <Text className="font-semibold mb-2">Quick Add</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {filteredFavorites.slice(0, 5).map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    handleSelectFavorite(item);
                    hapticFeedback.selection();
                  }}
                  className="items-center bg-white p-2 rounded-xl min-w-[80px]"
                >
                  <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-1">
                    <Text className="text-primary font-bold">
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="text-xs text-center" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {item.calories} cal
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Favorites list */}
      <FlatList
        data={filteredFavorites}
        renderItem={renderFavoriteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Heart size={24} color="#E5E7EB" />
            </View>
            <Text className="text-lg font-medium mb-2">No favorites found</Text>
            <Text className="text-gray-500 text-center mb-4">
              {searchQuery
                ? 'No results match your search'
                : 'Save your favorite meals and foods for quick access'}
            </Text>
            {!showAddWithAI && (
              <TouchableOpacity
                onPress={() => {
                  setShowAddWithAI(true);
                  hapticFeedback.selection();
                }}
                className="flex-row items-center bg-primary rounded-xl px-4 py-3"
              >
                <Plus size={16} color="#FFF" />
                <Text className="text-white font-medium ml-1">Add with AI</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {!isMultiSelectMode && filteredFavorites.length > 0 && (
        <Text className="text-center text-xs text-gray-500 mb-4">
          Swipe left on an item to delete
        </Text>
      )}

      {/* Multi-select action bar */}
      {isMultiSelectMode && selectedItems.length > 0 && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg"
        >
          <View className="flex-row items-center justify-between">
            <Text className="font-medium">
              {selectedItems.length} items selected
            </Text>
            <TouchableOpacity
              onPress={handleAddSelectedItems}
              className="bg-primary rounded-xl px-4 py-2"
            >
              <Text className="text-white font-medium">Add Selected</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Notification */}
      {notification.show && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="absolute bottom-20 left-4 right-4 bg-gray-800 rounded-2xl px-4 py-3 shadow-lg"
        >
          <Text className="text-white text-center">{notification.message}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
