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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import {
  getUserPreferences,
  updateUserPreferences,
  getOrCreateUserPreferences,
  UserPreferences,
  UserPreferencesInput,
  validateUserPreferences,
} from '../services/userPreferences';
import { getUserStats } from '../services/meals';

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalMeals: number;
  avgCalories: number;
  avgProtein: number;
  daysActive: number;
  totalDaysLogged: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<UserStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalMeals: 0,
    avgCalories: 0,
    avgProtein: 0,
    daysActive: 0,
    totalDaysLogged: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('[ProfileScreen] Loading user data for:', user.id);

      // Load preferences and stats in parallel
      const [prefsResult, statsResult] = await Promise.all([
        getOrCreateUserPreferences(user.id),
        getUserStats(user.id),
      ]);

      if (prefsResult.error) {
        console.error('[ProfileScreen] Error loading preferences:', prefsResult.error);
        setError(prefsResult.error.message);
      } else if (prefsResult.data) {
        console.log('[ProfileScreen] Loaded preferences:', prefsResult.data);
        setPreferences(prefsResult.data);
      }

      if (statsResult.success) {
        console.log('[ProfileScreen] Loaded stats:', statsResult.data);
        setStats(statsResult.data);
      } else {
        console.error('[ProfileScreen] Error loading stats:', statsResult.error);
      }
    } catch (err) {
      console.error('[ProfileScreen] Error loading user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async (updatedPrefs: UserPreferencesInput) => {
    if (!user || !preferences) return;

    setSaving(true);
    try {
      console.log('[ProfileScreen] Saving preferences:', updatedPrefs);

      // Validate preferences first
      const validationError = validateUserPreferences(updatedPrefs);
      if (validationError) {
        Alert.alert('Invalid Input', validationError.message);
        return;
      }

      const result = await updateUserPreferences(user.id, updatedPrefs);
      
      if (result.error) {
        console.error('[ProfileScreen] Error saving preferences:', result.error);
        Alert.alert('Error', result.error.message);
      } else if (result.data) {
        console.log('[ProfileScreen] Preferences saved successfully');
        setPreferences(result.data);
        setEditing(null);
        Alert.alert('Success', 'Preferences saved successfully');
      }
    } catch (err) {
      console.error('[ProfileScreen] Error saving preferences:', err);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
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

  const handleEditPreference = (field: string, currentValue: string | number) => {
    setEditing(field);
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = () => {
    if (!editing || !preferences) return;

    const numericValue = parseInt(editValue);
    if (isNaN(numericValue)) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }

    const updates: UserPreferencesInput = {};
    
    switch (editing) {
      case 'calories':
        updates.daily_calorie_goal = numericValue;
        break;
      case 'protein':
        updates.daily_protein_goal = numericValue;
        break;
      case 'carbs':
        updates.daily_carb_goal = numericValue;
        break;
      case 'fat':
        updates.daily_fat_goal = numericValue;
        break;
      default:
        return;
    }

    handleSavePreferences(updates);
  };

  const handleToggleNotifications = () => {
    if (!preferences) return;
    
    handleSavePreferences({
      notifications_enabled: !preferences.notifications_enabled,
    });
  };

  const formatWeightGoal = (goal: string) => {
    return goal.replace('_', ' ').charAt(0).toUpperCase() + goal.replace('_', ' ').slice(1);
  };

  const formatActivityLevel = (level: string) => {
    return level.replace('_', ' ').charAt(0).toUpperCase() + level.replace('_', ' ').slice(1);
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

  // Show loading state
  if (loading || !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Failed to load profile</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
              preferences.daily_calorie_goal,
              () => handleEditPreference('calories', preferences.daily_calorie_goal),
              'kcal'
            )}
            {renderPreferenceRow(
              'Protein',
              preferences.daily_protein_goal,
              () => handleEditPreference('protein', preferences.daily_protein_goal),
              'g'
            )}
            {renderPreferenceRow(
              'Carbs',
              preferences.daily_carb_goal,
              () => handleEditPreference('carbs', preferences.daily_carb_goal),
              'g'
            )}
            {renderPreferenceRow(
              'Fat',
              preferences.daily_fat_goal,
              () => handleEditPreference('fat', preferences.daily_fat_goal),
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
                value={preferences.notifications_enabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                thumbColor="#FFFFFF"
                disabled={saving}
              />
            </View>

            {renderPreferenceRow(
              'Weight Goal',
              formatWeightGoal(preferences.weight_goal),
              () => Alert.alert('Coming Soon', 'Weight goal editing will be available soon')
            )}

            {renderPreferenceRow(
              'Activity Level',
              formatActivityLevel(preferences.activity_level),
              () => Alert.alert('Coming Soon', 'Activity level editing will be available soon')
            )}

            {renderPreferenceRow(
              'Units',
              preferences.unit_system.charAt(0).toUpperCase() + preferences.unit_system.slice(1),
              () => Alert.alert('Coming Soon', 'Unit system editing will be available soon')
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

      {/* Edit Modal */}
      <Modal
        visible={editing !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditing(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {editing?.charAt(0).toUpperCase()}{editing?.slice(1)}
              </Text>
              <TouchableOpacity
                onPress={() => setEditing(null)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>
                Enter new {editing} value:
              </Text>
              <TextInput
                style={styles.textInput}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="numeric"
                placeholder="Enter value"
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setEditing(null)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '80%',
    maxWidth: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
});
