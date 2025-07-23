import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Activity,
  Droplets,
} from 'lucide-react-native';
import MotiView from 'moti';
import { hapticFeedback } from '../../utils/haptics';

interface NotificationSettings {
  mealReminders: boolean;
  dailySummary: boolean;
  weeklyInsights: boolean;
  goalAchievements: boolean;
  streakReminders: boolean;
  weightCheckIn: boolean;
  waterReminders: boolean;
  exerciseReminders: boolean;
}

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    mealReminders: true,
    dailySummary: true,
    weeklyInsights: true,
    goalAchievements: true,
    streakReminders: true,
    weightCheckIn: false,
    waterReminders: true,
    exerciseReminders: false,
  });

  const toggleSetting = (key: keyof NotificationSettings) => {
    hapticFeedback.selection();
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleMaster = () => {
    hapticFeedback.impact();
    setMasterEnabled(!masterEnabled);
  };

  const NotificationItem = ({
    icon: Icon,
    iconColor,
    title,
    description,
    settingKey,
  }: {
    icon: any;
    iconColor: string;
    title: string;
    description: string;
    settingKey: keyof NotificationSettings;
  }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: masterEnabled ? 1 : 0.5, translateX: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
    >
      <View className="flex-row items-center flex-1 pr-4">
        <View className={`w-10 h-10 rounded-full ${masterEnabled ? iconColor : 'bg-gray-200 dark:bg-gray-700'} items-center justify-center mr-3`}>
          <Icon size={20} className={masterEnabled ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
        </View>
        <View className="flex-1">
          <Text className={`font-medium ${masterEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
            {title}
          </Text>
          <Text className={`text-sm ${masterEnabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: '#d1d5db', true: '#5B21B6' }}
        thumbColor={settings[settingKey] ? '#8B5CF6' : '#f3f4f6'}
        disabled={!masterEnabled}
      />
    </MotiView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          Notifications
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          className="mx-4 mt-4 mb-6 bg-white dark:bg-gray-800 rounded-xl p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full ${masterEnabled ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'} items-center justify-center mr-3`}>
                {masterEnabled ? (
                  <Bell size={24} className="text-primary-600 dark:text-primary-400" />
                ) : (
                  <BellOff size={24} className="text-gray-400 dark:text-gray-500" />
                )}
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {masterEnabled ? 'Notifications On' : 'Notifications Off'}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {masterEnabled ? 'Stay updated with your progress' : 'You won\'t receive any notifications'}
                </Text>
              </View>
            </View>
            <Switch
              value={masterEnabled}
              onValueChange={toggleMaster}
              trackColor={{ false: '#d1d5db', true: '#5B21B6' }}
              thumbColor={masterEnabled ? '#8B5CF6' : '#f3f4f6'}
            />
          </View>
        </MotiView>

        {/* Notification Categories */}
        <View className="mx-4">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            MEAL & NUTRITION
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl px-4 mb-6">
            <NotificationItem
              icon={Clock}
              iconColor="bg-orange-500"
              title="Meal Reminders"
              description="Remind me to log breakfast, lunch & dinner"
              settingKey="mealReminders"
            />
            <NotificationItem
              icon={Target}
              iconColor="bg-green-500"
              title="Daily Summary"
              description="Daily nutrition summary at 9 PM"
              settingKey="dailySummary"
            />
            <NotificationItem
              icon={Droplets}
              iconColor="bg-blue-500"
              title="Water Reminders"
              description="Hourly hydration reminders"
              settingKey="waterReminders"
            />
          </View>

          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            PROGRESS & INSIGHTS
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl px-4 mb-6">
            <NotificationItem
              icon={TrendingUp}
              iconColor="bg-purple-500"
              title="Weekly Insights"
              description="Weekly nutrition trends every Sunday"
              settingKey="weeklyInsights"
            />
            <NotificationItem
              icon={Award}
              iconColor="bg-yellow-500"
              title="Goal Achievements"
              description="Celebrate when you hit your goals"
              settingKey="goalAchievements"
            />
            <NotificationItem
              icon={Calendar}
              iconColor="bg-red-500"
              title="Streak Reminders"
              description="Keep your logging streak alive"
              settingKey="streakReminders"
            />
          </View>

          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            HEALTH & FITNESS
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl px-4 mb-6">
            <NotificationItem
              icon={TrendingUp}
              iconColor="bg-indigo-500"
              title="Weight Check-in"
              description="Weekly weight tracking reminder"
              settingKey="weightCheckIn"
            />
            <NotificationItem
              icon={Activity}
              iconColor="bg-pink-500"
              title="Exercise Reminders"
              description="Daily workout reminders"
              settingKey="exerciseReminders"
            />
          </View>
        </View>

        {/* Notification Times */}
        <View className="mx-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Tap any notification to customize its schedule
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}