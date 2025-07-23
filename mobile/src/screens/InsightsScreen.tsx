import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, TrendingUp, TrendingDown, AlertCircle, BarChart3, ChevronRight } from 'lucide-react-native';
import Animated, {
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface InsightData {
  id: number;
  title: string;
  description: string;
  type?: 'positive' | 'warning';
  icon: any;
  color: string;
  date: string;
  chart: string;
  data: number[];
}

export default function InsightsScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Sample insights data
  const insights: InsightData[] = [
    {
      id: 1,
      title: 'Protein Intake Trend',
      description: 'Your protein intake has been consistently above your goal this week. Great job maintaining your muscle mass!',
      type: 'positive',
      icon: TrendingUp,
      color: '#66BB6A',
      date: '1 day ago',
      chart: 'line',
      data: [65, 75, 80, 95, 85, 90, 95]
    },
    {
      id: 2,
      title: 'Carbs Below Target',
      description: 'Your carbohydrate intake has been below your target for 3 days. This might affect your energy levels during workouts.',
      type: 'warning',
      icon: TrendingDown,
      color: '#FFA726',
      date: '2 days ago',
      chart: 'line',
      data: [120, 110, 90, 85, 80, 75, 70]
    },
    {
      id: 3,
      title: 'Calorie Consistency',
      description: 'You have maintained a consistent calorie intake within 10% of your goal for the past week, which is ideal for steady progress.',
      icon: BarChart3,
      color: '#42A5F5',
      date: '3 days ago',
      chart: 'bar',
      data: [1850, 1950, 2050, 1900, 2000, 1950, 2100]
    }
  ];

  // Weekly summary data
  const weeklyData = {
    calories: {
      average: 1950,
      target: 2000,
      percentage: 98,
      trend: -2,
      dailyData: [1850, 1950, 2050, 1900, 2000, 1950, 2100],
    },
    protein: {
      average: 145,
      target: 150,
      percentage: 97,
      trend: 5,
      dailyData: [135, 142, 150, 148, 140, 152, 148],
    },
    carbs: {
      average: 210,
      target: 250,
      percentage: 84,
      trend: -8,
      dailyData: [230, 220, 200, 190, 210, 205, 215],
    },
    fat: {
      average: 60,
      target: 65,
      percentage: 92,
      trend: 3,
      dailyData: [58, 62, 65, 59, 57, 62, 57],
    }
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const SimpleBars = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <View className="flex-row items-end h-16 mt-2">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <View key={index} className="flex-1 px-0.5">
              <Animated.View
                entering={FadeIn.delay(index * 50).duration(300)}
                className="w-full rounded-t"
                style={{
                  height: `${Math.max(10, height)}%`,
                  backgroundColor: color,
                }}
              />
            </View>
          );
        })}
      </View>
    );
  };

  const MacroBar = ({ 
    name, 
    average, 
    target, 
    percentage, 
    trend, 
    color, 
    data 
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
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Text className="text-gray-600 dark:text-gray-400 mr-2">{name}</Text>
            <View className={`px-1.5 py-0.5 rounded-full flex-row items-center ${
              trend >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {trend >= 0 ? (
                <TrendingUp size={12} className="text-green-700 dark:text-green-400 mr-0.5" />
              ) : (
                <TrendingDown size={12} className="text-red-700 dark:text-red-400 mr-0.5" />
              )}
              <Text className={`text-xs ${
                trend >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {Math.abs(trend)}%
              </Text>
            </View>
          </View>
          <Text className="font-medium text-gray-900 dark:text-white">
            {average} / {target}g
          </Text>
        </View>
        
        <View className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
          <Animated.View
            style={[animatedProgressStyle, { backgroundColor: color }]}
            className="h-full rounded-full"
          />
        </View>

        <SimpleBars data={data} color={color} />
        
        <View className="flex-row justify-between mt-1">
          {daysOfWeek.map((day) => (
            <Text key={day} className="text-xs text-gray-500 dark:text-gray-400 flex-1 text-center">
              {day[0]}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const InsightCard = ({ insight, index }: { insight: InsightData; index: number }) => {
    const handlePress = () => {
      Haptics.selectionAsync();
      // Navigate to detailed insight
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
      >
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
              <insight.icon size={20} color={insight.color} />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between mb-1">
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {insight.title}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {insight.date}
                </Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {insight.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top']}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <Animated.Text 
            entering={FadeIn.duration(300)}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Insights
          </Animated.Text>
          <Animated.Text 
            entering={FadeIn.delay(100).duration(300)}
            className="text-gray-600 dark:text-gray-400"
          >
            Your nutrition trends and patterns
          </Animated.Text>
        </View>

        {/* Calories Weekly Overview */}
        <View className="px-4 mb-6">
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4"
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-semibold text-gray-900 dark:text-white">
                Calories This Week
              </Text>
              <View className={`px-1.5 py-0.5 rounded-full flex-row items-center ${
                weeklyData.calories.trend >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {weeklyData.calories.trend >= 0 ? (
                  <TrendingUp size={12} className="text-green-700 dark:text-green-400 mr-0.5" />
                ) : (
                  <TrendingDown size={12} className="text-red-700 dark:text-red-400 mr-0.5" />
                )}
                <Text className={`text-xs ${
                  weeklyData.calories.trend >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {Math.abs(weeklyData.calories.trend)}% from last week
                </Text>
              </View>
            </View>

            <SimpleBars data={weeklyData.calories.dailyData} color="#320DFF" />

            <View className="flex-row justify-between mt-4">
              <View>
                <Text className="text-sm text-gray-600 dark:text-gray-400">Daily Average</Text>
                <Text className="font-medium text-gray-900 dark:text-white">
                  {weeklyData.calories.average} cal
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-600 dark:text-gray-400">Target</Text>
                <Text className="font-medium text-gray-900 dark:text-white">
                  {weeklyData.calories.target} cal
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-600 dark:text-gray-400">Completion</Text>
                <Text className="font-medium text-gray-900 dark:text-white">
                  {weeklyData.calories.percentage}%
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Weekly Macronutrients Summary */}
        <View className="px-4 mb-6">
          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4"
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-semibold text-gray-900 dark:text-white">
                Macronutrients
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Last 7 days
              </Text>
            </View>

            <MacroBar 
              name="Protein"
              average={weeklyData.protein.average}
              target={weeklyData.protein.target}
              percentage={weeklyData.protein.percentage}
              trend={weeklyData.protein.trend}
              color="#42A5F5"
              data={weeklyData.protein.dailyData}
            />

            <MacroBar 
              name="Carbs"
              average={weeklyData.carbs.average}
              target={weeklyData.carbs.target}
              percentage={weeklyData.carbs.percentage}
              trend={weeklyData.carbs.trend}
              color="#FFA726"
              data={weeklyData.carbs.dailyData}
            />

            <MacroBar 
              name="Fat"
              average={weeklyData.fat.average}
              target={weeklyData.fat.target}
              percentage={weeklyData.fat.percentage}
              trend={weeklyData.fat.trend}
              color="#66BB6A"
              data={weeklyData.fat.dailyData}
            />
          </Animated.View>
        </View>

        {/* Personal Insights */}
        <View className="px-4">
          <Text className="font-semibold text-gray-900 dark:text-white mb-3">
            Personal Insights
          </Text>
          {insights.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} index={index} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}