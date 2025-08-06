import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as Notifications from 'expo-notifications';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const NotificationsPermissionScreen = () => {
  const { goToNextStep, goToPreviousStep, updateUserData } = useOnboarding();

  const handleAllow = async () => {
    hapticFeedback.selection();

    try {
      // Request notification permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      updateUserData('notificationsEnabled', finalStatus === 'granted');
      goToNextStep();
    } catch (error) {
      console.error('Error requesting notifications permission:', error);
      updateUserData('notificationsEnabled', false);
      goToNextStep();
    }
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    updateUserData('notificationsEnabled', false);
    goToNextStep();
  };

  const notificationFeatures = [
    {
      title: 'Meal reminders',
      subtitle: 'Never forget to log your meals',
    },
    {
      title: 'Progress updates',
      subtitle: 'Stay motivated with your achievements',
    },
    {
      title: 'Personalized tips',
      subtitle: 'Get nutrition advice tailored to you',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-4">
          {/* Header with back button */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.selection();
                goToPreviousStep();
              }}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Title and subtitle */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              Stay on track with reminders
            </Text>
            <Text className="text-gray-600 text-lg">
              Get helpful notifications to log meals and track your progress
            </Text>
          </View>

          {/* Bell Icon */}
          <View className="flex-1 items-center justify-center">
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'timing', duration: 500 }}
              className="mb-8"
            >
              <View className="w-24 h-24 rounded-full bg-primary items-center justify-center">
                <Bell size={40} color="#FFFFFF" />
              </View>
            </MotiView>

            {/* Features List */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              className="w-full mb-10"
            >
              {notificationFeatures.map((feature, index) => (
                <MotiView
                  key={index}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 300 + index * 100 }}
                  className="flex-row items-center p-4 bg-purple-50 rounded-xl mb-3"
                >
                  <View className="w-2 h-2 rounded-full bg-primary mr-4" />
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {feature.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {feature.subtitle}
                    </Text>
                  </View>
                </MotiView>
              ))}
            </MotiView>
          </View>

          {/* Action Buttons */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleAllow}
              className="bg-primary py-4 rounded-full items-center justify-center mb-3"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Allow Notifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              className="py-4 rounded-full items-center justify-center bg-gray-100 border border-gray-200"
              activeOpacity={0.8}
            >
              <Text className="text-gray-800 font-semibold text-base">
                Not Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsPermissionScreen;
