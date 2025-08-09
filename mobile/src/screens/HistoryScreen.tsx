import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
  Animated as RNAnimated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HistoryStackParamList } from '../types/navigation';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { MotiView } from 'moti';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { TAB_BAR_HEIGHT } from '../utils/tokens';
import { hapticFeedback } from '../utils/haptics';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMealHistory } from '../services/meals';
import { SPACING } from '../constants';
import Svg, { Circle } from 'react-native-svg';
import { StandardHeader, ScrollAwareHeader } from '../components/common';
import { colors } from '../constants/theme';
import { useHeaderHeight } from '../hooks/useHeaderHeight';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type HistoryScreenNavigationProp = StackNavigationProp<
  HistoryStackParamList,
  'HistoryScreen'
>;

interface MealData {
  id: string;
  mealGroupId?: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{ name: string; calories: number }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  imageUrl?: string;
  hasMealGroupId: boolean;
  title?: string; // AI-generated meal title
}

interface HistoryData {
  date: string;
  totalCalories: number;
  totalMeals: number;
  meals: MealData[];
}

interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFat: number;
}

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { user, preferences } = useAuth();
  const insets = useSafeAreaInsets();
  const { headerHeight } = useHeaderHeight();
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce the selected date to prevent rapid API calls
  const debouncedDate = useDebounce(selectedDate, 300);

  // Animation values for the progress ring
  const rotateAnimation = useSharedValue(-90);
  const progressAnimation = useSharedValue(0);
  const isInitialLoad = useRef(true);
  const [macroAnimationKey, setMacroAnimationKey] = useState(0);

  // Show loading state immediately when date changes (before debounce)
  useEffect(() => {
    setIsLoading(true);
  }, [selectedDate]);

  // Fetch data with race condition prevention
  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!user) return;

      // Don't set loading here as it's already set when date changes
      setError(null);

      try {
        // Get meal history for last 30 days
        const response = await getMealHistory(user.id, 30);
        
        if (!isActive) return; // Prevent state update if component unmounted or date changed
        
        if (response.success && response.data) {
          // Find data for selected date
          const selectedDateStr = debouncedDate.toISOString().split('T')[0];
          const dateData = response.data.find(item => item.date === selectedDateStr);
          
          if (dateData) {
            setHistoryData(dateData);
            
            // Calculate daily summary
            const summary: DailySummary = {
              date: selectedDateStr,
              totalCalories: dateData.totalCalories,
              totalProtein: dateData.meals.reduce((sum, meal) => sum + meal.totalProtein, 0),
              totalCarbs: dateData.meals.reduce((sum, meal) => sum + meal.totalCarbs, 0),
              totalFat: dateData.meals.reduce((sum, meal) => sum + meal.totalFat, 0),
              goalCalories: preferences?.daily_calorie_goal || 2000,
              goalProtein: preferences?.daily_protein_goal || 150,
              goalCarbs: preferences?.daily_carb_goal || 200,
              goalFat: preferences?.daily_fat_goal || 65,
            };
            
            setDailySummary(summary);
          } else {
            // No data for this date
            setHistoryData(null);
            setDailySummary({
              date: selectedDateStr,
              totalCalories: 0,
              totalProtein: 0,
              totalCarbs: 0,
              totalFat: 0,
              goalCalories: preferences?.daily_calorie_goal || 2000,
              goalProtein: preferences?.daily_protein_goal || 150,
              goalCarbs: preferences?.daily_carb_goal || 200,
              goalFat: preferences?.daily_fat_goal || 65,
            });
          }
        } else {
          setError(response.error || 'Failed to fetch meal history');
        }
      } catch (err) {
        if (isActive) {
          console.error('Error fetching meal history:', err);
          setError('Failed to load meal history');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false; // Cleanup to prevent stale updates
    };
  }, [debouncedDate, user, preferences]);

  // Start rotation animation when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      rotateAnimation.value = withTiming(0, { 
        duration: 500,
        delay: 200 
      });
      
      // Trigger macro bar animations by changing the key
      setMacroAnimationKey(prev => prev + 1);

      return () => {
        // Reset rotation when leaving screen
        rotateAnimation.value = -90;
      };
    }, [])
  );

  // Animate progress when data becomes available
  useEffect(() => {
    if (dailySummary && dailySummary.goalCalories > 0 && isInitialLoad.current) {
      const percentage = Math.min(
        (dailySummary.totalCalories / dailySummary.goalCalories) * 100,
        100
      );
      progressAnimation.value = withTiming(percentage, { 
        duration: 800,
        delay: 200 
      });
      isInitialLoad.current = false;
    }
  }, [dailySummary]);

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
    setSelectedDate(day);
    
    // Reset animations for new date
    if (!isToday(day) || !isInitialLoad.current) {
      isInitialLoad.current = true;
      progressAnimation.value = 0;
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Reset the date to trigger a refresh
    const currentDateCopy = new Date(selectedDate);
    setSelectedDate(new Date(currentDateCopy));
    
    // The useEffect will handle the actual refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [selectedDate]);

  const handleViewMeal = (meal: MealData) => {
    hapticFeedback.selection();
    navigation.navigate('MealDetails', {
      mealId: meal.id,
      mealGroupId: meal.mealGroupId,
    });
  };

  const getMacroColor = (key: string) => {
    switch (key) {
      case 'carbs':
        return colors.macro.carbs;
      case 'protein':
        return colors.macro.protein;
      case 'fat':
        return colors.macro.fat;
      default:
        return colors.gray[400];
    }
  };

  // Progress Ring Component with actual progress fill
  const ProgressRing = ({ percentage }: { percentage: number }) => {
    const size = 64;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const animatedProps = useAnimatedProps(() => {
      const strokeDashoffset = circumference - (progressAnimation.value / 100) * circumference;
      return {
        strokeDashoffset,
      };
    });

    const textRotateStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotateZ: `${rotateAnimation.value}deg` }],
      };
    });

    return (
      <View className="relative">
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#320DFF"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </Svg>
        <Animated.View 
          style={[
            { 
              position: 'absolute', 
              width: size, 
              height: size, 
              alignItems: 'center', 
              justifyContent: 'center' 
            },
            textRotateStyle
          ]}
        >
          <Text className="font-bold text-lg text-gray-900">
            {Math.round(percentage)}%
          </Text>
        </Animated.View>
      </View>
    );
  };

  const formatMealTime = (mealType: string): string => {
    switch (mealType) {
      case 'breakfast':
        return '8:30 AM';
      case 'lunch':
        return '12:45 PM';
      case 'snack':
        return '3:30 PM';
      case 'dinner':
        return '7:15 PM';
      default:
        return '';
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollAwareHeader scrollY={scrollY}>
        <StandardHeader 
          title="History" 
          subtitle="Track your nutrition journey" 
        />
      </ScrollAwareHeader>
      
      <RNAnimated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#320DFF"
          />
        }
        contentContainerStyle={{
          paddingTop: headerHeight + 20,
          paddingBottom: TAB_BAR_HEIGHT + 20,
        }}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        
        <View className="px-4">
        {/* Calendar Navigation */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              activeOpacity={0.7}
              onPress={() => navigateWeek(-1)}
            >
              <ChevronLeft size={20} color="#374151" />
            </TouchableOpacity>

            <View className="flex-row items-center">
              <Calendar size={16} />
              <Text className="font-semibold text-gray-900 ml-2">
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
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            className="mb-6"
          >
          <Card className="bg-gray-50 p-4">
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold text-gray-900">Daily Summary</Text>
              <Text className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>

            <View style={{ opacity: isLoading ? 0.5 : 1 }}>
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-sm text-gray-500">Calories Consumed</Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-2xl font-bold text-gray-900">
                      {dailySummary?.totalCalories || 0}
                    </Text>
                    <Text className="text-sm text-gray-500 ml-1">
                      / {dailySummary?.goalCalories || preferences?.daily_calorie_goal || 2000}
                    </Text>
                  </View>
                </View>
                <ProgressRing 
                  percentage={dailySummary ? Math.min(
                    Math.round((dailySummary.totalCalories / dailySummary.goalCalories) * 100),
                    100
                  ) : 0} 
                />
              </View>

              {/* Macros */}
              <View className="flex-row justify-between space-x-2">
                <View className="flex-1 bg-white rounded-lg p-2 items-center">
                  <Text className="text-xs text-gray-500">Carbs</Text>
                  <Text className="font-medium text-gray-900">
                    {dailySummary?.totalCarbs || 0}g
                  </Text>
                  <View className="h-1 bg-gray-100 rounded-full mt-1 w-full overflow-hidden">
                    <MotiView
                      key={`carbs-${macroAnimationKey}`}
                      from={{ width: '0%' }}
                      animate={{ 
                        width: dailySummary ? `${Math.min((dailySummary.totalCarbs / dailySummary.goalCarbs) * 100, 100)}%` : '0%'
                      }}
                      transition={{
                        type: 'timing',
                        duration: 800,
                        delay: 0,
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getMacroColor('carbs') }}
                    />
                  </View>
                </View>

                <View className="flex-1 bg-white rounded-lg p-2 items-center mx-2">
                  <Text className="text-xs text-gray-500">Protein</Text>
                  <Text className="font-medium text-gray-900">
                    {dailySummary?.totalProtein || 0}g
                  </Text>
                  <View className="h-1 bg-gray-100 rounded-full mt-1 w-full overflow-hidden">
                    <MotiView
                      key={`protein-${macroAnimationKey}`}
                      from={{ width: '0%' }}
                      animate={{ 
                        width: dailySummary ? `${Math.min((dailySummary.totalProtein / dailySummary.goalProtein) * 100, 100)}%` : '0%'
                      }}
                      transition={{
                        type: 'timing',
                        duration: 800,
                        delay: 100,
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getMacroColor('protein') }}
                    />
                  </View>
                </View>

                <View className="flex-1 bg-white rounded-lg p-2 items-center">
                  <Text className="text-xs text-gray-500">Fat</Text>
                  <Text className="font-medium text-gray-900">
                    {dailySummary?.totalFat || 0}g
                  </Text>
                  <View className="h-1 bg-gray-100 rounded-full mt-1 w-full overflow-hidden">
                    <MotiView
                      key={`fat-${macroAnimationKey}`}
                      from={{ width: '0%' }}
                      animate={{ 
                        width: dailySummary ? `${Math.min((dailySummary.totalFat / dailySummary.goalFat) * 100, 100)}%` : '0%'
                      }}
                      transition={{
                        type: 'timing',
                        duration: 800,
                        delay: 200,
                      }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getMacroColor('fat') }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Card>
        </MotiView>

          {/* Meals List */}
          <View>
            <Text className="font-semibold mb-3 text-gray-900">Meals</Text>
            <View className="space-y-3">
            {isLoading ? (
              // Skeleton loading
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={index}
                    className="bg-gray-100 h-24 rounded-xl animate-pulse mb-3"
                  />
                ))
            ) : historyData && historyData.meals.length > 0 ? (
              historyData.meals.map((meal, index) => (
                <MotiView
                  key={meal.id}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 300,
                    delay: index * 100,
                  }}
                  className="mb-3"
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleViewMeal(meal)}
                  >
                    <Card className="p-3">
                      <View className="flex-row">
                        {meal.imageUrl ? (
                          <Image
                            source={{ uri: meal.imageUrl }}
                            className="w-16 h-16 rounded-lg mr-3"
                          />
                        ) : (
                          <View className="w-16 h-16 rounded-lg mr-3 bg-gray-200 items-center justify-center">
                            <Text className="text-2xl">
                              {meal.mealType === 'breakfast' ? '🍳' :
                               meal.mealType === 'lunch' ? '🥗' :
                               meal.mealType === 'dinner' ? '🍽️' : '🍎'}
                            </Text>
                          </View>
                        )}
                        <View className="flex-1">
                          <View className="flex-row justify-between items-start">
                            <View>
                              <Text className="font-semibold text-gray-900 capitalize">
                                {meal.title || meal.mealType}
                              </Text>
                              <Text className="text-sm text-gray-500">
                                {formatMealTime(meal.mealType)}
                              </Text>
                            </View>
                            <View className="items-end">
                              <Text className="font-semibold text-gray-900">
                                {meal.totalCalories}
                              </Text>
                              <Text className="text-xs text-gray-500">cal</Text>
                            </View>
                          </View>
                          
                          {/* Macro bars */}
                          <View className="flex-row mt-2 space-x-1">
                            <View className="flex-row items-center">
                              <Text className="text-xs text-gray-600 mr-1">C: {meal.totalCarbs}g</Text>
                              <View className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                                <View 
                                  className="h-full rounded-full"
                                  style={{ 
                                    backgroundColor: getMacroColor('carbs'),
                                    width: `${Math.min((meal.totalCarbs / 100) * 100, 100)}%`
                                  }}
                                />
                              </View>
                            </View>
                            
                            <View className="flex-row items-center ml-2">
                              <Text className="text-xs text-gray-600 mr-1">P: {meal.totalProtein}g</Text>
                              <View className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                                <View 
                                  className="h-full rounded-full"
                                  style={{ 
                                    backgroundColor: getMacroColor('protein'),
                                    width: `${Math.min((meal.totalProtein / 50) * 100, 100)}%`
                                  }}
                                />
                              </View>
                            </View>
                            
                            <View className="flex-row items-center ml-2">
                              <Text className="text-xs text-gray-600 mr-1">F: {meal.totalFat}g</Text>
                              <View className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                                <View 
                                  className="h-full rounded-full"
                                  style={{ 
                                    backgroundColor: getMacroColor('fat'),
                                    width: `${Math.min((meal.totalFat / 30) * 100, 100)}%`
                                  }}
                                />
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </MotiView>
              ))
            ) : (
              <Card className="p-8">
                <Text className="text-center text-gray-500">
                  No meals logged for this date
                </Text>
              </Card>
            )}
            </View>
          </View>
        </View>
      </RNAnimated.ScrollView>
    </View>
  );
}
