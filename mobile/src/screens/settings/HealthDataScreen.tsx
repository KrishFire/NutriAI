import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Activity, Heart, Droplets } from 'lucide-react-native';
import MotiView from 'moti';
import { Berry } from '../../components/ui';
import { hapticFeedback } from '../../utils/haptics';

export default function HealthDataScreen() {
  const navigation = useNavigation();

  const MetricCard = ({
    icon: Icon,
    iconColor,
    iconBgColor,
    title,
    children,
    onLog,
  }: {
    icon: any;
    iconColor: string;
    iconBgColor: string;
    title: string;
    children: React.ReactNode;
    onLog: () => void;
  }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4"
    >
      <View className="flex-row items-center mb-4">
        <View className={`w-10 h-10 rounded-full ${iconBgColor} items-center justify-center mr-3`}>
          <Icon size={20} className={iconColor} />
        </View>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </Text>
      </View>
      
      {children}
      
      <TouchableOpacity
        className="mt-3 py-2 border border-primary-200 dark:border-primary-800 rounded-lg"
        onPress={() => {
          hapticFeedback.selection();
          onLog();
        }}
      >
        <Text className="text-center text-primary-600 dark:text-primary-400 font-medium text-sm">
          Log {title}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );

  const ActivityBar = ({ value, maxValue }: { value: number; maxValue: number }) => (
    <View className="h-16 w-3 bg-red-500/60 rounded-t" style={{ height: (value / maxValue) * 64 }} />
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
          Health Data
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 py-6">
          {/* Berry and Introduction */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 500 }}
            className="items-center mb-8"
          >
            <View className="mb-4">
              <Berry variant="magnify" size="large" />
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Track Your Health Metrics
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center px-6">
              Log and track your health metrics to get personalized nutrition recommendations.
            </Text>
          </MotiView>

          {/* Activity Data */}
          <MetricCard
            icon={Activity}
            iconColor="text-red-500"
            iconBgColor="bg-red-100 dark:bg-red-900/30"
            title="Activity Data"
            onLog={() => {}}
          >
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mr-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Steps</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">8,432</Text>
                <Text className="text-xs text-green-500">+12% ↑</Text>
              </View>
              <View className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mx-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Calories</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">386</Text>
                <Text className="text-xs text-green-500">+8% ↑</Text>
              </View>
              <View className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg ml-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400">Distance</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">3.2</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">miles</Text>
              </View>
            </View>
          </MetricCard>

          {/* Heart Rate */}
          <MetricCard
            icon={Heart}
            iconColor="text-pink-500"
            iconBgColor="bg-pink-100 dark:bg-pink-900/30"
            title="Heart Rate"
            onLog={() => {}}
          >
            <View className="flex-row justify-between items-end mb-2">
              <View>
                <Text className="text-xs text-gray-500 dark:text-gray-400">Resting</Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">68</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">BPM</Text>
              </View>
              <View className="flex-row items-end space-x-1 h-16">
                {[60, 75, 65, 80, 70, 85, 68].map((value, index) => (
                  <ActivityBar key={index} value={value} maxValue={100} />
                ))}
              </View>
            </View>
          </MetricCard>

          {/* Hydration */}
          <MetricCard
            icon={Droplets}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            title="Hydration"
            onLog={() => {}}
          >
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full border-4 border-blue-300 dark:border-blue-700 items-center justify-center mr-4">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">65%</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900 dark:text-white">1.3 / 2.0 L</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">Today's intake</Text>
                <View className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View className="h-full w-[65%] bg-blue-500 rounded-full" />
                </View>
              </View>
            </View>
          </MetricCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}