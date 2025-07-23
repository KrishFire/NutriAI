import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HistoryStackParamList } from '../types/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { TAB_BAR_HEIGHT } from '../utils/tokens';
import { hapticFeedback } from '../utils/haptics';
import { Card } from '../components/ui/Card';

type HistoryScreenNavigationProp = StackNavigationProp<
  HistoryStackParamList,
  'HistoryScreen'
>;

// Mock data types
interface MealEntry {
  id: number | string;
  type: string;
  time: string;
  calories: number;
  image: string;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  isFavorite: boolean;
  items: Array<{
    id: string;
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    isFavorite: boolean;
  }>;
}

interface DailySummary {
  date: Date;
  totalCalories: number;
  goalCalories: number;
  macros: {
    carbs: {
      consumed: number;
      goal: number;
      percentage: number;
    };
    protein: {
      consumed: number;
      goal: number;
      percentage: number;
    };
    fat: {
      consumed: number;
      goal: number;
      percentage: number;
    };
  };
}

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data - TODO: Replace with real data
  const dailySummary: DailySummary = {
    date: selectedDate,
    totalCalories: 1850,
    goalCalories: 2000,
    macros: {
      carbs: {
        consumed: 210,
        goal: 250,
        percentage: 84,
      },
      protein: {
        consumed: 120,
        goal: 150,
        percentage: 80,
      },
      fat: {
        consumed: 55,
        goal: 65,
        percentage: 85,
      },
    },
  };
  
  const [meals] = useState<MealEntry[]>([
    {
      id: 1,
      type: 'Breakfast',
      time: '8:30 AM',
      calories: 420,
      image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: { carbs: 65, protein: 15, fat: 12 },
      isFavorite: false,
      items: [
        {
          id: 'eggs',
          name: 'Scrambled Eggs',
          quantity: '2 large',
          calories: 180,
          protein: 12,
          carbs: 1,
          fat: 10,
          isFavorite: false,
        },
      ],
    },
    {
      id: 2,
      type: 'Lunch',
      time: '12:45 PM',
      calories: 650,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: { carbs: 75, protein: 45, fat: 22 },
      isFavorite: false,
      items: [
        {
          id: 'salad',
          name: 'Chicken Salad',
          quantity: '1 bowl',
          calories: 350,
          protein: 35,
          carbs: 15,
          fat: 15,
          isFavorite: false,
        },
      ],
    },
    {
      id: 3,
      type: 'Snack',
      time: '3:30 PM',
      calories: 180,
      image: 'https://images.unsplash.com/photo-1470119693884-47d3a1d1f180?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: { carbs: 25, protein: 5, fat: 8 },
      isFavorite: false,
      items: [
        {
          id: 'yogurt',
          name: 'Greek Yogurt',
          quantity: '1 cup',
          calories: 130,
          protein: 15,
          carbs: 8,
          fat: 4,
          isFavorite: false,
        },
      ],
    },
    {
      id: 4,
      type: 'Dinner',
      time: '7:15 PM',
      calories: 600,
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: { carbs: 45, protein: 55, fat: 13 },
      isFavorite: false,
      items: [
        {
          id: 'salmon',
          name: 'Grilled Salmon',
          quantity: '6 oz',
          calories: 350,
          protein: 40,
          carbs: 0,
          fat: 18,
          isFavorite: false,
        },
      ],
    },
  ]);

  const getWeekDays = () => {
    const days = [];
    const day = new Date(currentDate);
    day.setDate(day.getDate() - 3); // Start 3 days before
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return days;
  };
  
  const weekDays = getWeekDays();
  
  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
  };
  
  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  const navigateWeek = (direction: number) => {
    hapticFeedback.selection();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7 * direction);
    setCurrentDate(newDate);
  };
  
  const handleDateSelect = (day: Date) => {
    hapticFeedback.selection();
    setIsLoading(true);
    setSelectedDate(day);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: Reload data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  
  const handleViewMeal = (meal: MealEntry) => {
    hapticFeedback.selection();
    navigation.navigate('MealDetails', {
      mealId: meal.id.toString(),
      mealGroupId: undefined,
    });
  };

  const getMacroColor = (key: string) => {
    switch (key) {
      case 'carbs':
        return '#FFA726';
      case 'protein':
        return '#42A5F5';
      case 'fat':
        return '#66BB6A';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#320DFF"
          />
        }
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
      >
        {/* Header */}
        <View className="px-4 pt-12 pb-4">
          <Text className="text-2xl font-bold text-gray-900">History</Text>
          <Text className="text-gray-600">Track your nutrition journey</Text>
        </View>
        
        {/* Calendar Navigation */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              activeOpacity={0.7}
              onPress={() => navigateWeek(-1)}
            >
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <Calendar size={16} color="#320DFF" />
              <Text className="font-medium text-gray-900 ml-2">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
            
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              activeOpacity={0.7}
              onPress={() => navigateWeek(1)}
            >
              <ChevronRight size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          
          {/* Week Day Selector */}
          <View className="flex-row justify-between">
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                className={`items-center w-10 py-2 rounded-full ${
                  isSelected(day)
                    ? 'bg-primary'
                    : isToday(day)
                    ? 'bg-primary/10'
                    : 'bg-transparent'
                }`}
                activeOpacity={0.7}
                onPress={() => handleDateSelect(day)}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected(day)
                      ? 'text-white'
                      : isToday(day)
                      ? 'text-primary'
                      : 'text-gray-700'
                  }`}
                >
                  {formatDay(day)}
                </Text>
                <Text
                  className={`text-sm font-semibold mt-1 ${
                    isSelected(day)
                      ? 'text-white'
                      : isToday(day)
                      ? 'text-primary'
                      : 'text-gray-700'
                  }`}
                >
                  {formatDate(day)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Daily Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: isLoading ? 0.5 : 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          className="px-4 mb-6"
        >
          <Card className="bg-gray-50 p-4">
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-900">
                Daily Summary
              </Text>
              <Text className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="text-sm text-gray-500">Calories Consumed</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-2xl font-bold text-gray-900">
                    {dailySummary.totalCalories}
                  </Text>
                  <Text className="text-sm text-gray-500 ml-1">
                    / {dailySummary.goalCalories}
                  </Text>
                </View>
              </View>
              <View className="w-16 h-16 rounded-full border-4 border-primary items-center justify-center">
                <Text className="font-bold text-lg text-gray-900">
                  {Math.round(
                    (dailySummary.totalCalories / dailySummary.goalCalories) *
                      100
                  )}
                  %
                </Text>
              </View>
            </View>
            
            {/* Macros */}
            <View className="flex-row justify-between space-x-2">
              {Object.entries(dailySummary.macros).map(([key, macro], index) => (
                <View
                  key={key}
                  className="flex-1 bg-white rounded-lg p-2 items-center"
                >
                  <Text className="text-xs text-gray-500 capitalize">
                    {key}
                  </Text>
                  <Text className="font-medium text-gray-900">
                    {macro.consumed}g
                  </Text>
                  <View className="h-1 bg-gray-100 rounded-full mt-1 w-full overflow-hidden">
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${macro.percentage}%` }}
                      transition={{
                        type: 'timing',
                        duration: 800,
                        delay: 200 + index * 100,
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getMacroColor(key) }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </MotiView>
        
        {/* Meals List */}
        <View className="px-4">
          <Text className="font-semibold mb-3 text-gray-900">Meals</Text>
          <View className="space-y-3">
            {isLoading ? (
              // Skeleton loading
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 h-20 rounded-xl animate-pulse"
                  />
                ))
            ) : (
              meals.map((meal, index) => (
                <MotiView
                  key={meal.id}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 300,
                    delay: index * 100,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleViewMeal(meal)}
                  >
                    <Card className="flex-row p-3">
                      <Image
                        source={{ uri: meal.image }}
                        className="w-16 h-16 rounded-lg mr-3"
                      />
                      <View className="flex-1">
                        <View className="flex-row justify-between items-start">
                          <View>
                            <Text className="font-semibold text-gray-900">
                              {meal.type}
                            </Text>
                            <Text className="text-sm text-gray-500">
                              {meal.time}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="font-semibold text-gray-900">
                              {meal.calories}
                            </Text>
                            <Text className="text-xs text-gray-500">cal</Text>
                          </View>
                        </View>
                        <View className="flex-row mt-1">
                          <Text className="text-xs text-gray-600">
                            C: {meal.macros.carbs}g
                          </Text>
                          <Text className="text-xs text-gray-600 mx-2">•</Text>
                          <Text className="text-xs text-gray-600">
                            P: {meal.macros.protein}g
                          </Text>
                          <Text className="text-xs text-gray-600 mx-2">•</Text>
                          <Text className="text-xs text-gray-600">
                            F: {meal.macros.fat}g
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </MotiView>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

