import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Download,
  Trash2,
  History,
  ChevronRight,
} from 'lucide-react-native';
import MotiView from 'moti';
import { hapticFeedback } from '../../utils/haptics';

interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  personalization: boolean;
}

export default function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<PrivacySettings>({
    dataSharing: true,
    analytics: true,
    personalization: true,
  });

  const toggleSetting = (key: keyof PrivacySettings) => {
    hapticFeedback.selection();
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDataAction = (action: string) => {
    hapticFeedback.impact();

    switch (action) {
      case 'download':
        Alert.alert(
          'Download Your Data',
          "We'll prepare a copy of all your data and send it to your email address within 24 hours.",
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Request Download', onPress: () => {} },
          ]
        );
        break;

      case 'deleteHistory':
        Alert.alert(
          'Delete Browsing History',
          'This will permanently delete your app usage history. This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {},
            },
          ]
        );
        break;

      case 'deleteAll':
        Alert.alert(
          'Delete All Data',
          'This will permanently delete all your data including meals, goals, and preferences. This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete Everything',
              style: 'destructive',
              onPress: () => {},
            },
          ]
        );
        break;
    }
  };

  const PrivacyToggle = ({
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
    settingKey: keyof PrivacySettings;
  }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <View className="flex-row items-center flex-1 pr-4">
        <View
          className={`w-10 h-10 rounded-full ${iconColor} items-center justify-center mr-3`}
        >
          <Icon size={20} className="text-white" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-900 dark:text-white">
            {title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: '#d1d5db', true: '#5B21B6' }}
        thumbColor={settings[settingKey] ? '#8B5CF6' : '#f3f4f6'}
      />
    </View>
  );

  const DataAction = ({
    icon: Icon,
    iconColor,
    label,
    isDestructive = false,
    onPress,
  }: {
    icon: any;
    iconColor: string;
    label: string;
    isDestructive?: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      onPress={onPress}
    >
      <View
        className={`w-10 h-10 rounded-full ${iconColor} items-center justify-center mr-3`}
      >
        <Icon size={20} className="text-white" />
      </View>
      <Text
        className={`flex-1 ${isDestructive ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
      >
        {label}
      </Text>
      <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
    </TouchableOpacity>
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
          Privacy
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Overview */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          className="mx-4 mt-4 mb-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 items-center justify-center mr-3">
              <Shield
                size={20}
                className="text-primary-600 dark:text-primary-400"
              />
            </View>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Privacy Matters
            </Text>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Control how your data is used and shared. Your nutrition data is
            always encrypted and secure.
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Text className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              View Privacy Policy
            </Text>
          </TouchableOpacity>
        </MotiView>

        {/* Privacy Settings */}
        <View className="mx-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            PRIVACY SETTINGS
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl px-4">
            <PrivacyToggle
              icon={Eye}
              iconColor="bg-green-500"
              title="Data Sharing"
              description="Share data with third-party services"
              settingKey="dataSharing"
            />
            <PrivacyToggle
              icon={Lock}
              iconColor="bg-orange-500"
              title="Analytics"
              description="Help us improve by sharing usage data"
              settingKey="analytics"
            />
            <PrivacyToggle
              icon={Shield}
              iconColor="bg-blue-500"
              title="Personalization"
              description="Allow AI to personalize your experience"
              settingKey="personalization"
            />
          </View>
        </View>

        {/* Data Management */}
        <View className="mx-4">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            DATA MANAGEMENT
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl px-4">
            <DataAction
              icon={Download}
              iconColor="bg-blue-500"
              label="Download My Data"
              onPress={() => handleDataAction('download')}
            />
            <DataAction
              icon={History}
              iconColor="bg-gray-500"
              label="Delete Browsing History"
              onPress={() => handleDataAction('deleteHistory')}
            />
            <DataAction
              icon={Trash2}
              iconColor="bg-red-500"
              label="Delete All My Data"
              isDestructive
              onPress={() => handleDataAction('deleteAll')}
            />
          </View>
        </View>

        {/* Information */}
        <View className="mx-4 mt-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
          <View className="flex-row items-start">
            <Database
              size={16}
              className="text-gray-500 dark:text-gray-400 mt-0.5 mr-2"
            />
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Storage
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Your data is encrypted and stored securely on our servers. We
                use industry-standard security measures to protect your
                information.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
