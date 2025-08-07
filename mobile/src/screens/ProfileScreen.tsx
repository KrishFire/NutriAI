import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import {
  User2,
  LogOut,
  CreditCard,
  Settings,
  HelpCircle,
  Bell,
  Heart,
  Target,
  Calendar,
  Lock,
  ChevronRight,
  Star,
  Zap,
  Trophy,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { TAB_BAR_HEIGHT } from '../utils/tokens';
import { hapticFeedback } from '../utils/haptics';
import { Berry } from '../components/ui/Berry';
import { Card } from '../components/ui/Card';
import { useSubscription } from '../contexts/SubscriptionContext';
import { StandardHeader, ScrollAwareHeader } from '../components/common';
import { colors } from '../constants/theme';
import { useHeaderHeight } from '../hooks/useHeaderHeight';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { headerHeight } = useHeaderHeight();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { isPremium } = useSubscription();

  // Mock user data - TODO: Replace with real auth context
  const userData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
  };

  // Mock streak data - TODO: Replace with real streak context
  const streakData = {
    current: 7,
    max: 21,
  };

  const menuItems = [
    {
      id: 'account',
      title: 'Account',
      items: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          icon: User2,
          screen: 'PersonalInfo' as keyof RootStackParamList,
        },
        {
          id: 'payment-method',
          title: 'Payment Methods',
          icon: CreditCard,
          screen: 'PaymentMethod' as keyof RootStackParamList,
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: Bell,
          screen: 'Notifications' as keyof RootStackParamList,
          badge: 3,
        },
        {
          id: 'favorites',
          title: 'Favorites',
          icon: Heart,
          screen: 'Favorites' as keyof RootStackParamList,
        },
      ],
    },
    {
      id: 'goals',
      title: 'Goals & Progress',
      items: [
        {
          id: 'goals-progress',
          title: 'Goals & Progress',
          icon: Target,
          screen: 'GoalsProgress' as keyof RootStackParamList,
        },
        {
          id: 'history',
          title: 'History',
          icon: Calendar,
          screen: 'History' as keyof RootStackParamList,
        },
      ],
    },
    {
      id: 'app',
      title: 'App Settings',
      items: [
        {
          id: 'subscription',
          title: 'Subscription',
          icon: Star,
          screen: 'Subscription' as keyof RootStackParamList,
          badge: isPremium ? 'PRO' : undefined,
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: Settings,
          screen: 'Settings' as keyof RootStackParamList,
        },
        {
          id: 'help-support',
          title: 'Help & Support',
          icon: HelpCircle,
          screen: 'HelpSupport' as keyof RootStackParamList,
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          icon: Lock,
          screen: 'Privacy' as keyof RootStackParamList,
        },
      ],
    },
  ];

  const handleNavigate = (screen: keyof RootStackParamList) => {
    hapticFeedback.selection();
    // TODO: Navigate to actual screens when they exist
    console.log(`Navigate to ${screen}`);
  };

  const handleUpgrade = () => {
    hapticFeedback.selection();
    // TODO: Navigate to upgrade screen
    console.log('Navigate to upgrade');
  };

  const handleLogout = () => {
    hapticFeedback.selection();
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement actual logout
          console.log('User logged out');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollAwareHeader scrollY={scrollY}>
        <StandardHeader 
          title="Profile" 
          subtitle="Manage your account" 
        />
      </ScrollAwareHeader>
      
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: headerHeight + 20,
          paddingBottom: TAB_BAR_HEIGHT + 60,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View className="px-4">
          {/* Profile Info */}
          <View className="py-4">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className="text-xl font-semibold text-gray-900">
                  {userData.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">{userData.email}</Text>
              </View>
              {!isPremium ? (
                <TouchableOpacity
                  className="px-3 py-1.5 bg-primary/10 rounded-full flex-row items-center"
                  activeOpacity={0.7}
                  onPress={handleUpgrade}
                >
                  <Star size={12} color={colors.primary} />
                  <Text className="text-xs font-medium text-primary ml-1">
                    Upgrade
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="px-3 py-1.5 bg-primary/10 rounded-full">
                  <Text className="text-xs font-medium text-primary">
                    PRO
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Streak indicators */}
          <Card className="p-4 mb-6 bg-white border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Image
                  source={require('../../assets/berry/berry_streak.png')}
                  className="w-6 h-6 mr-2"
                  resizeMode="contain"
                />
                <Text className="text-sm font-medium text-gray-900">Your Streaks</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigate('GoalsProgress')}
              >
                <Text className="text-xs text-primary">View Details</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-primary/5 rounded-lg p-3">
                <View className="flex-row items-center mb-1">
                  <Zap size={14} color={colors.primary} />
                  <Text className="text-xs text-gray-600 ml-1.5">
                    Current Streak
                  </Text>
                </View>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-2xl font-bold text-gray-900">
                    {streakData.current}
                  </Text>
                  <Text className="ml-1 text-sm text-gray-600">days</Text>
                </View>
              </View>

              <View className="flex-1 bg-primary/5 rounded-lg p-3">
                <View className="flex-row items-center mb-1">
                  <Trophy size={14} color={colors.primary} />
                  <Text className="text-xs text-gray-600 ml-1.5">Max Streak</Text>
                </View>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-2xl font-bold text-gray-900">
                    {streakData.max}
                  </Text>
                  <Text className="ml-1 text-sm text-gray-600">days</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Menu Sections */}
          <View className="space-y-6">
            {menuItems.map((section, sectionIndex) => (
              <View key={section.id} className={sectionIndex > 0 ? "mt-6" : ""}>
                <Text className="text-sm font-medium text-gray-500 mb-2">
                  {section.title}
                </Text>
                <Card className="overflow-hidden">
                  {section.items.map((item, index) => (
                    <MotiView
                      key={item.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: index * 50 }}
                    >
                      <TouchableOpacity
                        className="flex-row items-center pl-3 pr-4 py-3.5 border-b border-gray-100"
                        activeOpacity={0.7}
                        onPress={() => handleNavigate(item.screen)}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.title}${item.badge ? `, ${item.badge}` : ''}`}
                      >
                        <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                          <item.icon size={18} color="#6B7280" />
                        </View>
                        <Text 
                          className="flex-1 font-medium text-gray-900 ml-3 mr-2" 
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        {item.badge && (
                          <View
                            className={`mr-2 px-2 py-0.5 rounded-full ${
                              typeof item.badge === 'number'
                                ? 'bg-red-500'
                                : 'bg-primary/10'
                            }`}
                          >
                            <Text
                              className={`text-xs font-medium ${
                                typeof item.badge === 'number'
                                  ? 'text-white'
                                  : 'text-primary'
                              }`}
                            >
                              {item.badge}
                            </Text>
                          </View>
                        )}
                        <ChevronRight size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </MotiView>
                  ))}
                </Card>
              </View>
            ))}
          </View>

          {/* Log Out Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center w-full mt-8 p-4 rounded-xl border border-red-100"
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <LogOut size={18} color="#EF4444" />
            <Text className="font-medium text-red-600 ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
