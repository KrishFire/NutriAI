import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

interface CalorieProgressNotifierProps {
  onPress?: () => void;
}

/**
 * Component that checks calorie progress and allows sending a notification
 * if the user hasn't logged 75% of their daily calories
 */
export default function CalorieProgressNotifier({
  onPress,
}: CalorieProgressNotifierProps) {
  const { user } = useAuth();
  const { checkCalorieProgress, sendProgressNotification } = useNotifications();
  const [progress, setProgress] = useState<{
    shouldNotify: boolean;
    percentageLogged: number;
    caloriesLogged: number;
    calorieGoal: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkProgress();
    }
  }, [user]);

  const checkProgress = async () => {
    try {
      setLoading(true);
      const result = await checkCalorieProgress();
      setProgress(result);
    } catch (error) {
      console.error('Error checking calorie progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!progress?.shouldNotify) return;

    const result = await sendProgressNotification();

    if (result.success) {
      Alert.alert(
        'Reminder Sent',
        'A notification has been sent to remind you to log your meals.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to send notification', [
        { text: 'OK' },
      ]);
    }
  };

  if (!progress || loading) {
    return null;
  }

  // Only show if user hasn't met their calorie goal
  if (!progress.shouldNotify) {
    return null;
  }

  const remainingCalories = progress.calorieGoal - progress.caloriesLogged;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress || handleSendNotification}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Ionicons name="notifications-outline" size={24} color="#FF9500" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {Math.round(progress.percentageLogged)}% of daily goal
          </Text>
          <Text style={styles.subtitle}>
            {remainingCalories} calories remaining
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
