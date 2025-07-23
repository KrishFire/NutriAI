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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Globe,
  Moon,
  Bell,
  CreditCard,
  Lock,
  Trash2,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { hapticFeedback } from '../../utils/haptics';
import { useAuth } from '../../hooks/useAuth';
import type { SettingsStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Settings state
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [heightUnit, setHeightUnit] = useState<'ft/in' | 'cm'>('ft/in');
  const [energyUnit, setEnergyUnit] = useState<'calories' | 'kilojoules'>('calories');

  const handleNavigation = (screen: keyof SettingsStackParamList) => {
    hapticFeedback.selection();
    navigation.navigate(screen as any);
  };

  const handleLogout = async () => {
    hapticFeedback.impact();
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleToggleDarkMode = () => {
    hapticFeedback.selection();
    toggleColorScheme();
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-6">
      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 mb-2">
        {title}
      </Text>
      <View className="bg-white dark:bg-gray-800 mx-4 rounded-xl overflow-hidden">
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({
    icon: Icon,
    iconColor = 'text-gray-600 dark:text-gray-400',
    label,
    value,
    onPress,
    showChevron = true,
    rightElement,
  }: {
    icon: any;
    iconColor?: string;
    label: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
          <Icon size={18} className={iconColor} />
        </View>
        <Text className="text-gray-900 dark:text-white flex-1">{label}</Text>
      </View>
      {rightElement || (
        <View className="flex-row items-center">
          {value && (
            <Text className="text-gray-500 dark:text-gray-400 mr-2">{value}</Text>
          )}
          {showChevron && onPress && (
            <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const UnitToggle = ({
    value,
    options,
    onValueChange,
  }: {
    value: string;
    options: { label: string; value: string }[];
    onValueChange: (value: string) => void;
  }) => (
    <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          className={`px-3 py-1 rounded-full ${
            value === option.value
              ? 'bg-primary-600 dark:bg-primary-500'
              : ''
          }`}
          onPress={() => {
            hapticFeedback.selection();
            onValueChange(option.value);
          }}
        >
          <Text
            className={`text-sm font-medium ${
              value === option.value
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
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
          Settings
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Preferences */}
        <SettingsSection title="App Preferences">
          <SettingsItem
            icon={Globe}
            label="Language"
            value="English"
            onPress={() => {}}
          />
          <SettingsItem
            icon={Moon}
            label="Dark Mode"
            showChevron={false}
            rightElement={
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: '#d1d5db', true: '#5B21B6' }}
                thumbColor={colorScheme === 'dark' ? '#8B5CF6' : '#f3f4f6'}
              />
            }
          />
          <SettingsItem
            icon={Bell}
            label="Notifications"
            onPress={() => handleNavigation('NotificationSettings')}
          />
        </SettingsSection>

        {/* Subscription */}
        <SettingsSection title="Subscription">
          <SettingsItem
            icon={CreditCard}
            iconColor="text-primary-600 dark:text-primary-500"
            label="Manage Subscription"
            value="Free Plan"
            onPress={() => navigation.navigate('ManageSubscription' as any)}
          />
          <TouchableOpacity
            className="mx-4 my-3 py-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg"
            onPress={() => {
              hapticFeedback.selection();
              navigation.navigate('Paywall' as any);
            }}
          >
            <Text className="text-center text-primary-600 dark:text-primary-400 font-medium">
              Upgrade to Premium
            </Text>
          </TouchableOpacity>
        </SettingsSection>

        {/* Units & Measurements */}
        <SettingsSection title="Units & Measurements">
          <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-900 dark:text-white">Weight</Text>
              <UnitToggle
                value={weightUnit}
                options={[
                  { label: 'lbs', value: 'lbs' },
                  { label: 'kg', value: 'kg' },
                ]}
                onValueChange={(value) => setWeightUnit(value as 'lbs' | 'kg')}
              />
            </View>
          </View>
          <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-900 dark:text-white">Height</Text>
              <UnitToggle
                value={heightUnit}
                options={[
                  { label: 'ft/in', value: 'ft/in' },
                  { label: 'cm', value: 'cm' },
                ]}
                onValueChange={(value) => setHeightUnit(value as 'ft/in' | 'cm')}
              />
            </View>
          </View>
          <View className="px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-900 dark:text-white">Energy</Text>
              <UnitToggle
                value={energyUnit}
                options={[
                  { label: 'calories', value: 'calories' },
                  { label: 'kJ', value: 'kilojoules' },
                ]}
                onValueChange={(value) => setEnergyUnit(value as 'calories' | 'kilojoules')}
              />
            </View>
          </View>
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={Lock}
            label="Change Password"
            onPress={() => {}}
          />
          <SettingsItem
            icon={Trash2}
            iconColor="text-red-500"
            label="Delete Account"
            onPress={() => navigation.navigate('DeleteAccount' as any)}
          />
        </SettingsSection>

        {/* App Info */}
        <View className="items-center py-6">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            Version 1.0.0
          </Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity onPress={() => {}}>
              <Text className="text-primary-600 dark:text-primary-400 text-sm">
                Terms of Service
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigation('PrivacySettings')}>
              <Text className="text-primary-600 dark:text-primary-400 text-sm">
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="mx-4 py-4 flex-row items-center justify-center"
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={18} className="text-red-500 mr-2" />
          <Text className="text-red-500 font-medium">
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}