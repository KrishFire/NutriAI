import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
  ChevronRight,
  Calendar,
  Target,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tinycolor from 'tinycolor2';
import AnimatedRN, {
  FadeIn,
  FadeInDown,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { TAB_BAR_HEIGHT } from '@/utils/tokens';
import { SPACING } from '@/constants';
import { StandardHeader, ScrollAwareHeader } from '../components/common';
import { useHeaderHeight } from '../hooks/useHeaderHeight';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchUserInsights, type Insight, type WeeklyData } from '../services/insights';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Constants
const TODAY_INDEX = 6; // Today is always the last element in our 7-day array

export default function InsightsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { headerHeight } = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // State for dynamic data
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [status, setStatus] = useState<'SUCCESS' | 'INSUFFICIENT_DATA' | 'ERROR'>('SUCCESS');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  // Generate days of week with today as rightmost, going back 7 days
  const getDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      result.push(days[dayIndex]);
    }
    return result;
  };
  
  const daysOfWeek = useMemo(() => getDaysOfWeek(), []);
  
  // Fetch dynamic insights on mount
  useEffect(() => {
    loadInsights();
  }, []);
  
  const loadInsights = async () => {
    try {
      setLoading(true);
      
      const result = await fetchUserInsights();
      
      setStatus(result.status);
      setInsights(result.insights);
      setWeeklyData(result.weeklyData);
      
      if (result.daysRemaining) {
        setDaysRemaining(result.daysRemaining);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
      setStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };
  
  // Default weekly data for loading state
  const defaultWeeklyData: WeeklyData = {
    calories: {
      dailyData: [0, 0, 0, 0, 0, 0, 0],
      target: 2000,
      average: 0,
      percentage: 0,
      trend: 0,
    },
    protein: {
      dailyData: [0, 0, 0, 0, 0, 0, 0],
      target: 150,
      average: 0,
      percentage: 0,
      trend: 0,
    },
    carbs: {
      dailyData: [0, 0, 0, 0, 0, 0, 0],
      target: 250,
      average: 0,
      percentage: 0,
      trend: 0,
    },
    fat: {
      dailyData: [0, 0, 0, 0, 0, 0, 0],
      target: 65,
      average: 0,
      percentage: 0,
      trend: 0,
    },
  };
  
  const displayWeeklyData = weeklyData || defaultWeeklyData;

  const SimpleBars = React.memo(({ 
    data, 
    goal,
    color,
    isToday = false,
    todayIndex = TODAY_INDEX,
    size = 'default'
  }: { 
    data: number[]; 
    goal: number;
    color: string;
    isToday?: boolean;
    todayIndex?: number;
    size?: 'default' | 'large';
  }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // Memoize maxValue calculation with guard for empty array and buffer
    const maxValue = useMemo(() => {
      const maxDataValue = Math.max(...(data.length > 0 ? data : [0]));
      // Ensure goal line is always visible with 10% buffer
      const chartMax = Math.max(goal, maxDataValue);
      return chartMax * 1.1; // 10% buffer so bars don't touch top
    }, [data, goal]);
    
    const goalPosition = (goal / maxValue) * 100;

    const handleBarPress = (index: number, value: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Toggle tooltip - if same bar, hide it; if different bar, show new one
      if (selectedIndex === index) {
        setSelectedIndex(null);
      } else {
        setSelectedIndex(index);
      }
    };
    
    const handleOutsidePress = () => {
      if (selectedIndex !== null) {
        setSelectedIndex(null);
      }
    };

    const isLargeChart = size === 'large';
    const chartHeight = isLargeChart ? 'h-24' : 'h-16';
    const barWidth = isLargeChart ? 'w-6' : 'w-5';
    const todayBarWidth = isLargeChart ? 28 : 24; // Wider for today
    
    // Get gradient colors for today's bars
    const getGradientColors = (baseColor: string): [string, string] => {
      switch(baseColor) {
        case '#42A5F5': return ['#42A5F5', '#81C7F5']; // Protein
        case '#FFA726': return ['#FFA726', '#FFCC80']; // Carbs
        case '#66BB6A': return ['#66BB6A', '#A5D6A7']; // Fat
        case '#320DFF': return ['#320DFF', '#6B5FFF']; // Calories
        default: return [baseColor, baseColor];
      }
    };
    
    // Get lighter color for past "goal met" bars
    const getLighterColor = (baseColor: string): string => {
      const color = tinycolor(baseColor);
      return color.setAlpha(0.6).toString(); // 60% opacity for softer look
    };
    
    return (
      <View>
        <TouchableOpacity 
          className={`relative ${chartHeight} mt-2`}
          activeOpacity={1}
          onPress={handleOutsidePress}
        >
        {/* Goal line */}
        <View 
          className="absolute left-0 right-0"
          style={{ 
            bottom: `${goalPosition}%`,
            height: 2,
            backgroundColor: 'rgba(156, 163, 175, 0.4)', // #9CA3AF with 40% opacity
            zIndex: 1
          }}
        />
        
        {/* Bars container */}
        <View className="flex-row h-full items-end">
          {data.map((value, index) => {
            const isTodayBar = isToday && index === todayIndex;
            const percentage = value > 0 ? (value / maxValue) * 100 : 0;
            const goalPercentage = (goal / maxValue) * 100;
            const isGoalMet = value >= goal;
            
            return (
              <View key={index} className="flex-1 items-center" style={{ justifyContent: 'flex-end' }}>
                {isTodayBar ? (
                  // Today's bar - solid color for macros, gradient for calories
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleBarPress(index, value);
                    }}
                    activeOpacity={0.7}
                    style={{
                      height: `${percentage}%`,
                      alignItems: 'center',
                      justifyContent: 'flex-end'
                    }}
                    accessibilityLabel={`Today: ${Math.round(value)} out of ${goal}. ${isGoalMet ? 'Goal met.' : 'Goal not met.'}`}
                    accessibilityHint="Press to see exact value"
                  >
                    {isLargeChart ? (
                      // Keep gradient only for calories (large chart)
                      <LinearGradient
                        colors={getGradientColors(color)}
                        style={{
                          height: '100%',
                          width: todayBarWidth,
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4
                        }}
                      />
                    ) : (
                      // Solid color for macros
                      <View
                        style={{
                          height: '100%',
                          width: todayBarWidth,
                          backgroundColor: color,
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4
                        }}
                      />
                    )}
                  </TouchableOpacity>
                ) : value > 0 ? (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleBarPress(index, value);
                    }}
                    activeOpacity={0.7}
                    style={{
                      height: `${percentage}%`,
                      alignItems: 'center',
                      justifyContent: 'flex-end'
                    }}
                    accessibilityLabel={`${daysOfWeek[index]}, ${Math.round(value)} out of ${goal}. ${isGoalMet ? 'Goal met.' : 'Goal not met.'}`}
                    accessibilityHint="Press to see exact value"
                  >
                    <AnimatedRN.View
                      entering={FadeIn.delay(index * 50).duration(300)}
                      className={`${barWidth} rounded-t`}
                      style={{ 
                        height: '100%',
                        backgroundColor: isGoalMet ? getLighterColor(color) : '#9CA3AF'
                      }}
                    />
                  </TouchableOpacity>
                ) : (
                  <View className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mb-1" />
                )}
                
                {/* Tooltip */}
                {selectedIndex === index && value > 0 && (
                  <AnimatedRN.View 
                    entering={FadeIn.duration(200)}
                    className="absolute -top-8 bg-gray-800 dark:bg-gray-700 px-2 py-1 rounded-md"
                    style={{ minWidth: 40 }}
                  >
                    <Text className="text-xs text-white font-medium text-center">
                      {Math.round(value)}
                    </Text>
                  </AnimatedRN.View>
                )}
              </View>
            );
          })}
        </View>
        </TouchableOpacity>
      </View>
    );
  });

  const MacroBar = ({
    name,
    average,
    target,
    percentage,
    trend,
    color,
    data,
  }: {
    name: string;
    average: number;
    target: number;
    percentage: number;
    trend: number;
    color: string;
    data: number[];
  }) => {
    const progressWidth = useSharedValue(0);

    React.useEffect(() => {
      progressWidth.value = withTiming(percentage, { duration: 800 });
    }, [percentage]);

    const animatedProgressStyle = useAnimatedStyle(() => ({
      width: `${progressWidth.value}%`,
    }));

    return (
      <View className="mb-5">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            {name}
          </Text>
          <View
            className={`px-2.5 py-1.5 rounded-full flex-row items-center gap-1.5 ${
              trend >= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp
                size={18}
                className="text-green-700 dark:text-green-400"
              />
            ) : (
              <TrendingDown
                size={18}
                className="text-red-700 dark:text-red-400"
              />
            )}
            <Text
              className={`text-base font-medium ${
                trend >= 0
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400'
              }`}
            >
              {Math.abs(trend)}%
            </Text>
          </View>
        </View>
        
        {/* Large number display replacing progress bar */}
        <View className="mb-3">
          <View className="flex-row items-baseline">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {data[TODAY_INDEX]}g
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              of {target}g goal
            </Text>
          </View>
        </View>

        <SimpleBars data={data} goal={target} color={color} isToday={true} todayIndex={TODAY_INDEX} />

        <View className="flex-row justify-between mt-1">
          {daysOfWeek.map((day, index) => (
            <Text
              key={day}
              className={`text-xs flex-1 text-center ${
                index === TODAY_INDEX
                  ? 'font-bold'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              style={{
                color: index === TODAY_INDEX ? color : undefined
              }}
            >
              {index === TODAY_INDEX ? 'TODAY' : day}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const InsightCard = ({
    insight,
    index,
  }: {
    insight: Insight;
    index: number;
  }) => {
    const handlePress = () => {
      Haptics.selectionAsync();
      // Navigate to detailed insight or show more data
    };

    // Get Icon component from the insight
    const IconComponent = insight.icon;

    return (
      <AnimatedRN.View entering={FadeInDown.delay(index * 100).springify()}>
        <TouchableOpacity
          onPress={handlePress}
          className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 mb-3"
          activeOpacity={0.7}
        >
          <View className="flex-row">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${insight.color}20` }}
            >
              <IconComponent size={20} color={insight.color} />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between mb-1">
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {insight.title}
                </Text>
                {insight.data.changePercent !== undefined && (
                  <Text className={`text-xs font-medium ${
                    insight.sentiment === 'POSITIVE' 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.abs(Math.round(insight.data.changePercent))}% change
                  </Text>
                )}
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {insight.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </AnimatedRN.View>
    );
  };
  
  // Placeholder component for insufficient data
  const InsufficientDataPlaceholder = () => (
    <View className="px-4 py-8">
      <AnimatedRN.View 
        entering={FadeInDown.springify()}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 items-center"
      >
        <View className="w-16 h-16 bg-indigo-100 dark:bg-gray-700 rounded-full items-center justify-center mb-4">
          <Calendar size={32} className="text-indigo-600 dark:text-indigo-400" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Keep Logging!
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400 mb-4">
          Log your meals for {daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'} to unlock personalized insights
        </Text>
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full mb-2">
          <View 
            className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full"
            style={{ width: `${((7 - daysRemaining) / 7) * 100}%` }}
          />
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {7 - daysRemaining} of 7 days completed
        </Text>
      </AnimatedRN.View>
    </View>
  );
  
  // Loading state component
  const LoadingState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <ActivityIndicator size="large" color="#320DFF" />
      <Text className="text-gray-600 dark:text-gray-400 mt-4">
        Analyzing your nutrition data...
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollAwareHeader scrollY={scrollY}>
        <StandardHeader 
          title="Insights" 
          subtitle="Your nutrition trends and patterns" 
        />
      </ScrollAwareHeader>
      
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: headerHeight + 20,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + SPACING.xxxl 
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {loading ? (
          <LoadingState />
        ) : status === 'INSUFFICIENT_DATA' ? (
          <InsufficientDataPlaceholder />
        ) : status === 'ERROR' ? (
          <View className="px-4 py-8">
            <Text className="text-center text-gray-600 dark:text-gray-400">
              Unable to load insights. Please try again later.
            </Text>
          </View>
        ) : (
          <>
            {/* Calories Weekly Overview */}
            <View className="px-4 mb-6">
              <AnimatedRN.View
                entering={FadeInDown.delay(200).springify()}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4"
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    Calories This Week
                  </Text>
                  <View
                    className={`px-2.5 py-1.5 rounded-full flex-row items-center gap-1.5 ${
                      displayWeeklyData.calories.trend >= 0
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    {displayWeeklyData.calories.trend >= 0 ? (
                      <TrendingUp
                        size={18}
                        className="text-green-700 dark:text-green-400"
                      />
                    ) : (
                      <TrendingDown
                        size={18}
                        className="text-red-700 dark:text-red-400"
                      />
                    )}
                    <Text
                      className={`text-base font-medium ${
                        displayWeeklyData.calories.trend >= 0
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {Math.abs(displayWeeklyData.calories.trend)}% vs last week
                    </Text>
                  </View>
                </View>

                {/* Large number display for today's calories */}
                <View className="mb-3">
                  <View className="flex-row items-baseline">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                      {displayWeeklyData.calories.dailyData[TODAY_INDEX]}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      of {displayWeeklyData.calories.target} cal
                    </Text>
                  </View>
                </View>

                <SimpleBars data={displayWeeklyData.calories.dailyData} goal={displayWeeklyData.calories.target} color="#320DFF" isToday={true} todayIndex={TODAY_INDEX} size="large" />

            {/* Day labels */}
            <View className="flex-row justify-between mt-1 mb-3">
              {daysOfWeek.map((day, index) => (
                <Text
                  key={day}
                  className={`text-xs flex-1 text-center ${
                    index === TODAY_INDEX
                      ? 'text-primary dark:text-primary-light font-bold'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {index === TODAY_INDEX ? 'TODAY' : day}
                </Text>
              ))}
            </View>

                <View className="flex-row justify-between mt-4">
                  <View>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      Daily Average
                    </Text>
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {displayWeeklyData.calories.average} cal
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      Target
                    </Text>
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {displayWeeklyData.calories.target} cal
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm text-gray-600 dark:text-gray-400">
                      Completion
                    </Text>
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {displayWeeklyData.calories.percentage}%
                    </Text>
                  </View>
                </View>
              </AnimatedRN.View>
            </View>

            {/* Weekly Macronutrients Summary */}
            <View className="px-4 mb-6">
              <AnimatedRN.View
                entering={FadeInDown.delay(300).springify()}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4"
              >
                <View className="mb-4">
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    Macronutrients
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Last 7 days
                  </Text>
                </View>

                <MacroBar
                  name="Protein"
                  average={displayWeeklyData.protein.average}
                  target={displayWeeklyData.protein.target}
                  percentage={displayWeeklyData.protein.percentage}
                  trend={displayWeeklyData.protein.trend}
                  color="#42A5F5"
                  data={displayWeeklyData.protein.dailyData}
                />

                <MacroBar
                  name="Carbs"
                  average={displayWeeklyData.carbs.average}
                  target={displayWeeklyData.carbs.target}
                  percentage={displayWeeklyData.carbs.percentage}
                  trend={displayWeeklyData.carbs.trend}
                  color="#FFA726"
                  data={displayWeeklyData.carbs.dailyData}
                />

                <MacroBar
                  name="Fat"
                  average={displayWeeklyData.fat.average}
                  target={displayWeeklyData.fat.target}
                  percentage={displayWeeklyData.fat.percentage}
                  trend={displayWeeklyData.fat.trend}
                  color="#66BB6A"
                  data={displayWeeklyData.fat.dailyData}
                />
              </AnimatedRN.View>
            </View>

            {/* Personal Insights */}
            <View className="px-4">
              <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                Personal Insights
              </Text>
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <InsightCard key={insight.id} insight={insight} index={index} />
                ))
              ) : (
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <Text className="text-center text-gray-600 dark:text-gray-400">
                    No significant insights detected yet. Keep logging your meals to see patterns!
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}
