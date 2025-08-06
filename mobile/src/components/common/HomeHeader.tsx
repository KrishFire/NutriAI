import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell } from 'lucide-react-native';
import { typography, spacing, colors } from '../../constants/theme';
import BaseHeader from './BaseHeader';

interface HomeHeaderProps {
  userName: string;
  greeting: string;
  streak: number;
  notificationCount: number;
  onStreakPress: () => void;
  onNotificationPress: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  greeting,
  streak,
  notificationCount,
  onStreakPress,
  onNotificationPress,
}) => {
  return (
    <BaseHeader style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {/* Streak button */}
        <TouchableOpacity
          style={styles.streakButton}
          activeOpacity={0.7}
          onPress={onStreakPress}
        >
          <Image
            source={require('../../../assets/berry/berry_streak.png')}
            style={styles.berryIcon}
          />
          <Text style={styles.streakText}>{streak}</Text>
        </TouchableOpacity>
        
        {/* Notification button */}
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={onNotificationPress}
        >
          <Bell size={20} color={colors.gray[500]} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </BaseHeader>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
  },
  greeting: {
    ...typography.screenSubtitle,
    marginBottom: 2,
  },
  userName: {
    ...typography.screenTitle,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakButton: {
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 51,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  berryIcon: {
    width: 24,
    height: 24,
  },
  streakText: {
    ...typography.badgeText,
    color: colors.white,
    marginLeft: 4,
  },
  notificationButton: {
    backgroundColor: colors.gray[100],
    borderRadius: 9999,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.red[500],
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    ...typography.badgeText,
    color: colors.white,
  },
});

export default HomeHeader;