import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Avatar } from '../components/ui/Avatar';
import { Berry } from '../components/ui/Berry';
import { Card } from '../components/ui/Card';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  // Mock user data - TODO: Replace with real auth context
  const userData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
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
          badge: 'PRO',
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
      >
        {/* Header */}
        <View className="px-4 pt-12 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        </View>
        
        {/* Profile Info */}
        <View className="px-4 py-4">
          <View className="flex-row items-center mb-6">
            <Avatar src={userData.avatar} size="large" />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold text-gray-900">
                {userData.name}
              </Text>
              <Text className="text-gray-600">{userData.email}</Text>
            </View>
            <TouchableOpacity
              className="px-3 py-1 bg-primary/10 rounded-full flex-row items-center"
              activeOpacity={0.7}
              onPress={handleUpgrade}
            >
              <Star size={12} color="#320DFF" />
              <Text className="text-xs font-medium text-primary ml-1">
                Upgrade
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Streak indicators */}
          <Card className="p-4 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Berry variant="happy" size="tiny" className="mr-2" />
                <Text className="font-medium text-gray-900">Your Streaks</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleNavigate('GoalsProgress')}
              >
                <Text className="text-xs text-primary">View Details</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row mt-3 space-x-4">
              <View className="flex-1 bg-primary/5 rounded-lg p-3">
                <View className="flex-row items-center mb-1">
                  <Zap size={14} color="#320DFF" />
                  <Text className="text-xs text-gray-600 ml-1">
                    Current Streak
                  </Text>
                </View>
                <View className="flex-row items-baseline">
                  <Text className="text-2xl font-bold text-gray-900">
                    {streakData.current}
                  </Text>
                  <Text className="ml-1 text-gray-600 text-sm">days</Text>
                </View>
              </View>
              
              <View className="flex-1 bg-primary/5 rounded-lg p-3">
                <View className="flex-row items-center mb-1">
                  <Trophy size={14} color="#320DFF" />
                  <Text className="text-xs text-gray-600 ml-1">Max Streak</Text>
                </View>
                <View className="flex-row items-baseline">
                  <Text className="text-2xl font-bold text-gray-900">
                    {streakData.max}
                  </Text>
                  <Text className="ml-1 text-gray-600 text-sm">days</Text>
                </View>
              </View>
            </View>
          </Card>
          
          {/* Menu Sections */}
          <View className="space-y-6">
            {menuItems.map((section) => (
              <View key={section.id}>
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
                        className="flex-row items-center justify-between p-4 border-b border-gray-100"
                        activeOpacity={0.7}
                        onPress={() => handleNavigate(item.screen)}
                      >
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                            <item.icon size={18} color="#6B7280" />
                          </View>
                          <Text className="font-medium text-gray-900">
                            {item.title}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
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
                        </View>
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
      </ScrollView>
    </View>
  );
}

