import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HistoryStackParamList } from '../types/navigation';

type HistoryScreenNavigationProp = StackNavigationProp<
  HistoryStackParamList,
  'HistoryScreen'
>;

interface MealEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    name: string;
    calories: number;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  imageUrl?: string;
}

interface DayData {
  date: string;
  totalCalories: number;
  totalMeals: number;
  meals: MealEntry[];
}

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [historyData, setHistoryData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      // TODO: Load actual history data from Supabase
      // This is a placeholder implementation with mock data
      const mockData: DayData[] = [
        {
          date: '2024-01-15',
          totalCalories: 1850,
          totalMeals: 3,
          meals: [
            {
              id: '1',
              date: '2024-01-15',
              mealType: 'breakfast',
              foods: [
                { name: 'Oatmeal with Berries', calories: 320 },
                { name: 'Greek Yogurt', calories: 150 },
              ],
              totalCalories: 470,
              totalProtein: 25,
              totalCarbs: 65,
              totalFat: 8,
            },
            {
              id: '2',
              date: '2024-01-15',
              mealType: 'lunch',
              foods: [
                { name: 'Grilled Chicken Salad', calories: 450 },
                { name: 'Quinoa', calories: 220 },
              ],
              totalCalories: 670,
              totalProtein: 45,
              totalCarbs: 35,
              totalFat: 15,
            },
            {
              id: '3',
              date: '2024-01-15',
              mealType: 'dinner',
              foods: [
                { name: 'Salmon with Vegetables', calories: 520 },
                { name: 'Brown Rice', calories: 190 },
              ],
              totalCalories: 710,
              totalProtein: 42,
              totalCarbs: 45,
              totalFat: 22,
            },
          ],
        },
        {
          date: '2024-01-14',
          totalCalories: 1920,
          totalMeals: 4,
          meals: [
            {
              id: '4',
              date: '2024-01-14',
              mealType: 'breakfast',
              foods: [
                { name: 'Scrambled Eggs', calories: 280 },
                { name: 'Whole Grain Toast', calories: 140 },
              ],
              totalCalories: 420,
              totalProtein: 20,
              totalCarbs: 25,
              totalFat: 18,
            },
          ],
        },
      ];
      setHistoryData(mockData);
    } catch (error) {
      console.error('Error loading history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'sunny';
      case 'lunch':
        return 'partly-sunny';
      case 'dinner':
        return 'moon';
      case 'snack':
        return 'nutrition';
      default:
        return 'restaurant';
    }
  };

  const renderDayItem = ({ item }: { item: DayData }) => (
    <View style={styles.dayContainer}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayDate}>{formatDate(item.date)}</Text>
        <View style={styles.dayStats}>
          <Text style={styles.dayCalories}>{item.totalCalories} kcal</Text>
          <Text style={styles.dayMeals}>{item.totalMeals} meals</Text>
        </View>
      </View>

      {item.meals.map(meal => (
        <TouchableOpacity
          key={meal.id}
          style={styles.mealItem}
          onPress={() =>
            navigation.navigate('MealDetails', { mealId: meal.id })
          }
        >
          <View style={styles.mealHeader}>
            <View style={styles.mealTypeContainer}>
              <Ionicons
                name={getMealTypeIcon(meal.mealType) as any}
                size={20}
                color="#007AFF"
              />
              <Text style={styles.mealType}>
                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
              </Text>
            </View>
            <Text style={styles.mealCalories}>{meal.totalCalories} kcal</Text>
          </View>

          <View style={styles.foodsList}>
            {meal.foods.map((food, index) => (
              <Text key={index} style={styles.foodItem}>
                {food.name} • {food.calories} kcal
              </Text>
            ))}
          </View>

          <View style={styles.macrosSummary}>
            <Text style={styles.macroText}>P: {meal.totalProtein}g</Text>
            <Text style={styles.macroText}>C: {meal.totalCarbs}g</Text>
            <Text style={styles.macroText}>F: {meal.totalFat}g</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No meals logged yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your nutrition by taking photos of your meals
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your meal history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {/* TODO: Add calendar picker for date navigation */}
      </View>

      <FlatList
        data={historyData}
        renderItem={renderDayItem}
        keyExtractor={item => item.date}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          historyData.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  dayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dayStats: {
    alignItems: 'flex-end',
  },
  dayCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  dayMeals: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mealItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  foodsList: {
    marginBottom: 8,
  },
  foodItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  macrosSummary: {
    flexDirection: 'row',
    gap: 12,
  },
  macroText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
