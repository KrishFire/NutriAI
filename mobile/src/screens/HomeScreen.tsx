import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useEffect, useCallback } from 'react';
import {
  useNavigation,
  useFocusEffect,
  CommonActions,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../types/navigation';

type HomeScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'HomeScreen'
>;
import { Button, DailyProgress, LoadingSpinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useNutrition, useTodaysMeals } from '../hooks/useNutrition';

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, signOut } = useAuth();
  const nutritionData = useNutrition();
  const mealsData = useTodaysMeals();

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      nutritionData.refresh();
      mealsData.refresh();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={nutritionData.isLoading}
            onRefresh={nutritionData.refresh}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>NutriAI</Text>
              <Text style={styles.subtitle}>AI-Powered Nutrition Tracking</Text>
            </View>
            <Button
              title="Sign Out"
              onPress={handleLogout}
              variant="outline"
              size="small"
            />
          </View>
          {user && (
            <Text style={styles.welcomeText}>
              Welcome back, {user.user_metadata?.full_name || user.email}!
            </Text>
          )}
        </View>

        <View style={styles.progressContainer}>
          {nutritionData.isLoading && !nutritionData.calories.current ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner text="Loading nutrition data..." />
            </View>
          ) : nutritionData.error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{nutritionData.error}</Text>
              <Button
                title="Retry"
                onPress={nutritionData.refresh}
                variant="outline"
                size="small"
              />
            </View>
          ) : (
            <DailyProgress
              calories={nutritionData.calories}
              protein={nutritionData.protein}
              carbs={nutritionData.carbs}
              fat={nutritionData.fat}
            />
          )}
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="📷 Log Meal"
            onPress={() =>
              navigation.dispatch(CommonActions.navigate('Camera'))
            }
            variant="primary"
            size="large"
          />

          <Button
            title="📊 View History"
            onPress={() => {
              // navigation.navigate('History'); // Will be enabled when History screen exists
              console.log('History navigation would happen here');
            }}
            variant="outline"
            size="large"
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionRow}>
            <Button
              title="🎤 Voice Log"
              onPress={() => console.log('Voice logging')}
              variant="secondary"
              size="medium"
              style={styles.quickActionButton}
            />
            <Button
              title="📝 Manual Entry"
              onPress={() => console.log('Manual entry')}
              variant="secondary"
              size="medium"
              style={styles.quickActionButton}
            />
          </View>
        </View>

        {/* Today's Meals Section */}
        {mealsData.meals.length > 0 && (
          <View style={styles.mealsSection}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <View style={styles.mealsContainer}>
              {mealsData.meals.slice(0, 3).map((meal, index) => (
                <View key={meal.id || index} style={styles.mealItem}>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealType}>
                      {meal.meal_type.charAt(0).toUpperCase() +
                        meal.meal_type.slice(1)}
                    </Text>
                    <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                  </View>
                  <Text style={styles.mealTime}>
                    {new Date(meal.logged_at || '').toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              ))}
              {mealsData.meals.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => console.log('View all meals')}
                >
                  <Text style={styles.viewAllText}>
                    View all {mealsData.meals.length} meals →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8,
  },
  progressContainer: {
    padding: 20,
  },
  actionContainer: {
    padding: 20,
    gap: 16,
  },
  quickActions: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  loadingContainer: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  mealsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  mealsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  mealTime: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '500',
  },
  viewAllButton: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
