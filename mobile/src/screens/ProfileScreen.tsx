import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

interface UserPreferences {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  weightGoal: 'lose' | 'maintain' | 'gain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  units: 'metric' | 'imperial';
  notifications: boolean;
  reminderTime: string;
}

interface UserStats {
  currentStreak: number;
  totalMeals: number;
  avgCalories: number;
  avgProtein: number;
  daysActive: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFat: 67,
    weightGoal: 'maintain',
    activityLevel: 'moderate',
    units: 'metric',
    notifications: true,
    reminderTime: '20:00',
  });

  const [stats, setStats] = useState<UserStats>({
    currentStreak: 0,
    totalMeals: 0,
    avgCalories: 0,
    avgProtein: 0,
    daysActive: 0,
  });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // TODO: Load actual user preferences and stats from Supabase
      // This is a placeholder implementation
      setStats({
        currentStreak: 7,
        totalMeals: 42,
        avgCalories: 1850,
        avgProtein: 142,
        daysActive: 14,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      // TODO: Save preferences to Supabase
      console.log('Saving preferences:', preferences);
      setEditing(null);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: string
  ) => (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color="#007AFF" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderPreferenceRow = (
    label: string,
    value: string | number,
    onPress: () => void,
    unit?: string
  ) => (
    <TouchableOpacity style={styles.preferenceRow} onPress={onPress}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <View style={styles.preferenceValue}>
        <Text style={styles.preferenceText}>
          {value}
          {unit ? ` ${unit}` : ''}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            {renderStatCard('Day Streak', stats.currentStreak, 'flame')}
            {renderStatCard('Total Meals', stats.totalMeals, 'restaurant')}
            {renderStatCard('Avg Calories', stats.avgCalories, 'speedometer')}
          </View>
        </View>

        {/* Daily Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goals</Text>
          <View style={styles.preferencesContainer}>
            {renderPreferenceRow(
              'Calories',
              preferences.dailyCalories,
              () => setEditing('calories'),
              'kcal'
            )}
            {renderPreferenceRow(
              'Protein',
              preferences.dailyProtein,
              () => setEditing('protein'),
              'g'
            )}
            {renderPreferenceRow(
              'Carbs',
              preferences.dailyCarbs,
              () => setEditing('carbs'),
              'g'
            )}
            {renderPreferenceRow(
              'Fat',
              preferences.dailyFat,
              () => setEditing('fat'),
              'g'
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Notifications</Text>
              <Switch
                value={preferences.notifications}
                onValueChange={value =>
                  setPreferences(prev => ({ ...prev, notifications: value }))
                }
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {renderPreferenceRow(
              'Weight Goal',
              preferences.weightGoal.charAt(0).toUpperCase() +
                preferences.weightGoal.slice(1),
              () => setEditing('weightGoal')
            )}

            {renderPreferenceRow(
              'Activity Level',
              preferences.activityLevel
                .replace('_', ' ')
                .charAt(0)
                .toUpperCase() +
                preferences.activityLevel.replace('_', ' ').slice(1),
              () => setEditing('activityLevel')
            )}

            {renderPreferenceRow(
              'Units',
              preferences.units.charAt(0).toUpperCase() +
                preferences.units.slice(1),
              () => setEditing('units')
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.preferencesContainer}>
            <TouchableOpacity
              style={styles.preferenceRow}
              onPress={handleSignOut}
            >
              <Text style={[styles.preferenceLabel, { color: '#FF3B30' }]}>
                Sign Out
              </Text>
              <Ionicons name="exit-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  preferencesContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  preferenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferenceText: {
    fontSize: 16,
    color: '#666',
  },
  bottomSpacer: {
    height: 100,
  },
});
