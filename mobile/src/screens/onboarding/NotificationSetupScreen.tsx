import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, Calendar, Target } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptics';
import * as Notifications from 'expo-notifications';
import tokens from '../../utils/tokens';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: any;
  defaultEnabled: boolean;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'meal_reminders',
    title: 'Meal reminders',
    description: 'Get reminded to log your meals',
    icon: Bell,
    defaultEnabled: true,
  },
  {
    id: 'goal_progress',
    title: 'Goal progress',
    description: 'Daily updates on your nutrition goals',
    icon: Target,
    defaultEnabled: true,
  },
  {
    id: 'weekly_insights',
    title: 'Weekly insights',
    description: 'Summary of your week and tips',
    icon: Calendar,
    defaultEnabled: false,
  },
];

export default function NotificationSetupScreen() {
  const navigation = useNavigation();
  const [enabledNotifications, setEnabledNotifications] = useState<
    Record<string, boolean>
  >(
    notificationSettings.reduce(
      (acc, setting) => ({
        ...acc,
        [setting.id]: setting.defaultEnabled,
      }),
      {}
    )
  );

  const handleToggle = (settingId: string) => {
    hapticFeedback.selection();
    setEnabledNotifications(prev => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  const handleEnableAll = async () => {
    hapticFeedback.success();

    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      // Enable all notifications
      const allEnabled = notificationSettings.reduce(
        (acc, setting) => ({
          ...acc,
          [setting.id]: true,
        }),
        {}
      );
      setEnabledNotifications(allEnabled);

      // Navigate to completion
      navigation.navigate('OnboardingComplete' as never);
    } else {
      // Still navigate even if permissions denied
      navigation.navigate('OnboardingComplete' as never);
    }
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    navigation.navigate('OnboardingComplete' as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
          className="p-2"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} className="p-2">
          <Text className="text-gray-500">Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Progress indicator */}
        <View className="flex-row space-x-2 mb-8">
          {[1, 2, 3, 4, 5].map(step => (
            <View
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= 4 ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </View>

        <Animated.View entering={FadeIn} className="items-center">
          {/* Berry mascot */}
          <Image
            source={require('../../../assets/berry/berry-happy.png')}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
            className="mb-6"
          />

          <Text className="text-3xl font-bold mb-2 text-center">
            Stay on track with notifications
          </Text>
          <Text className="text-gray-600 mb-8 text-center">
            We'll help you remember to log meals and celebrate your progress
          </Text>

          {/* Notification settings */}
          <View className="w-full mb-8">
            {notificationSettings.map((setting, index) => {
              const Icon = setting.icon;
              return (
                <Animated.View
                  key={setting.id}
                  entering={FadeIn.delay(index * 100)}
                  className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3"
                >
                  <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                    <Icon size={24} color={tokens.colors.primary.DEFAULT} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium mb-1">
                      {setting.title}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {setting.description}
                    </Text>
                  </View>
                  <Switch
                    value={enabledNotifications[setting.id]}
                    onValueChange={() => handleToggle(setting.id)}
                    trackColor={{
                      false: '#E5E7EB',
                      true: tokens.colors.primary.DEFAULT,
                    }}
                    thumbColor="#FFF"
                  />
                </Animated.View>
              );
            })}
          </View>

          {/* Privacy note */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-8">
            <Text className="text-sm text-blue-800 text-center">
              🔔 You can change your notification preferences anytime in
              settings
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Enable button */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={handleEnableAll}
          className="bg-primary rounded-2xl py-4 px-6"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Enable Notifications
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
