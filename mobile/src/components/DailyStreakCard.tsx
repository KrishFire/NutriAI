import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreakBadge } from './StreakBadge';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface DailyStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  lastLogDate?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const DailyStreakCard: React.FC<DailyStreakCardProps> = ({
  currentStreak,
  longestStreak,
  isActive,
  lastLogDate,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const getStreakMessage = () => {
    if (currentStreak === 0) {
      return "Start your streak today! 💪";
    } else if (currentStreak === longestStreak && currentStreak > 0) {
      return "You're on your longest streak! 🔥";
    } else if (isActive) {
      return "Keep it going! You've got this! 🎯";
    } else {
      return "Log today to continue your streak! ⏰";
    }
  };
  
  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const hoursLeft = Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutesLeft = Math.floor(((midnight.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    
    if (!isActive && currentStreak > 0) {
      return `${hoursLeft}h ${minutesLeft}m to save your streak`;
    }
    return null;
  };
  
  const timeWarning = getTimeUntilMidnight();
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, animatedStyle, style]}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Daily Streak</Text>
            <StreakBadge
              streakCount={currentStreak}
              isActive={isActive}
              size="medium"
            />
          </View>
          {timeWarning && (
            <View style={styles.warningRow}>
              <Ionicons name="warning" size={16} color="#FFA500" />
              <Text style={styles.warningText}>{timeWarning}</Text>
            </View>
          )}
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Longest</Text>
          </View>
        </View>
        
        {/* Message Section */}
        <Text style={styles.message}>{getStreakMessage()}</Text>
        
        {/* Progress Indicator */}
        {currentStreak > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min((currentStreak / 30) * 100, 100)}%`,
                    backgroundColor: isActive ? '#4ADE80' : '#FFA500',
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStreak < 30 
                ? `${30 - currentStreak} days to 30-day milestone`
                : currentStreak < 100
                ? `${100 - currentStreak} days to 100-day milestone`
                : 'Legendary streak! 🏆'
              }
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#FFA500',
    marginLeft: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
});