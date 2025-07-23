import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  useNavigation,
  CommonActions,
} from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  HomeStackParamList,
  AppTabParamList,
  RootStackParamList,
} from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  Camera,
  Mic,
  Scan,
  Search,
  MessageSquare,
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { TAB_BAR_HEIGHT } from '../utils/tokens';
import { hapticFeedback } from '../utils/haptics';

// Import ALL UI components from the exact design
import { 
  ProgressRing,
  Berry,
  GlassMorphism,
  AnimatedNumber,
  ParticleEffect,
  MealCard,
} from '../components/ui';
import { PremiumBanner } from '../components/premium';
import { FeedbackForm } from '../components/feedback';

type HomeScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'HomeScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<AppTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  // Sample data matching the Magic Patterns design
  const userData = {
    name: 'Alex',
    streak: 7,
    dailyGoal: 2000,
    consumed: 1450,
    remaining: 550,
    notifications: 3,
    macros: {
      carbs: {
        goal: 250,
        consumed: 180,
        color: '#FFC078' // More muted orange
      },
      protein: {
        goal: 150,
        consumed: 95,
        color: '#74C0FC' // More muted blue
      },
      fat: {
        goal: 65,
        consumed: 48,
        color: '#8CE99A' // More muted green
      }
    }
  };

  const meals = [
    {
      id: 1,
      type: 'Breakfast',
      time: '8:30 AM',
      calories: 420,
      image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 65,
        protein: 15,
        fat: 12
      }
    },
    {
      id: 2,
      type: 'Lunch',
      time: '12:45 PM',
      calories: 650,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 75,
        protein: 45,
        fat: 22
      }
    },
    {
      id: 3,
      type: 'Snack',
      time: '3:30 PM',
      calories: 180,
      image: 'https://images.unsplash.com/photo-1470119693884-47d3a1d1f180?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      macros: {
        carbs: 25,
        protein: 5,
        fat: 8
      }
    }
  ];

  const [showParticles, setShowParticles] = useState(false);
  const [animateCalories, setAnimateCalories] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const caloriePercentage = Math.round(userData.consumed / userData.dailyGoal * 100);

  useEffect(() => {
    // Simulate loading calories for animation
    setTimeout(() => {
      setAnimateCalories(true);
    }, 500);

    // Show particles when calories reach a milestone
    if (caloriePercentage >= 50 && !showParticles) {
      setTimeout(() => {
        setShowParticles(true);
      }, 2000);
    }
  }, [caloriePercentage]);

  const handleUpgrade = () => {
    // Navigate to premium screen
    console.log('Upgrade to premium');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleNotificationsClick = () => {
    hapticFeedback.selection();
    if (navigation) {
      navigation.navigate('Profile'); // Navigate to notifications when available
    }
  };

  const handleOpenFeedback = () => {
    hapticFeedback.selection();
    setShowFeedbackForm(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
  };

  const handleSubmitFeedback = (feedback: {
    rating: number;
    comment: string;
    contactInfo?: string;
  }) => {
    console.log('Feedback submitted:', feedback);
    setShowFeedbackForm(false);
    setShowThankYou(true);
    
    // Hide thank you message after 3 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#320DFF"
          />
        }
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
      >
        {/* Header */}
        <MotiView
          className="px-4 pt-12 pb-4 flex-row justify-between items-center"
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 500 }}
        >
          <View>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 200 }}
            >
              <Text className="text-gray-600">{getGreeting()},</Text>
            </MotiView>
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 300, type: 'spring' }}
            >
              <Text className="text-2xl font-bold">{userData.name}</Text>
            </MotiView>
          </View>
          <View className="flex-row items-center">
            <MotiView
              className="mr-4 flex-row items-center bg-primary/10 px-2 py-1 rounded-full"
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 400, type: 'spring' }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => hapticFeedback.selection()}
                className="flex-row items-center"
              >
                <Berry variant="streak" size="tiny" className="mr-1" />
                <Text className="text-xs font-medium text-primary">
                  {userData.streak}
                </Text>
              </TouchableOpacity>
            </MotiView>
            
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 500, type: 'spring' }}
            >
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 relative"
                activeOpacity={0.7}
                onPress={handleNotificationsClick}
              >
                <Bell size={20} color="#374151" />
                {userData.notifications > 0 && (
                  <View className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {userData.notifications}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          </View>
        </MotiView>

        {/* Premium Banner - Only shown occasionally */}
        <MotiView
          className="px-4 mb-2"
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600, duration: 500 }}
        >
          <PremiumBanner onUpgrade={handleUpgrade} />
        </MotiView>

        {/* Daily Progress with GlassMorphism */}
        <MotiView
          className="px-4 py-6 bg-white"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 700, duration: 500 }}
        >
          <GlassMorphism 
            className="rounded-3xl p-6 items-center" 
            intensity="light"
          >
            <View className="flex-row justify-between w-full mb-4">
              <Text className="text-gray-500 text-sm">Daily Progress</Text>
              <Text className="text-sm font-medium">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </View>
            
            <View className="w-48 h-48 mb-6 relative">
              <ProgressRing
                percentage={caloriePercentage}
                color="#320DFF"
                size={192}
                strokeWidth={12}
                animate={animateCalories}
                duration={2}
              >
                <View className="items-center justify-center">
                  <AnimatedNumber
                    value={userData.consumed}
                    className="text-2xl font-bold"
                    duration={2}
                  />
                  <Text className="text-xs text-gray-500">
                    of {userData.dailyGoal} cal
                  </Text>
                </View>
              </ProgressRing>
              {showParticles && (
                <ParticleEffect
                  type="sparkle"
                  intensity="medium"
                  colors={['#320DFF', '#4F46E5', '#818CF8']}
                  duration={2}
                />
              )}
            </View>
            
            <View className="flex-row justify-around w-full">
              {Object.entries(userData.macros).map(([key, macro], index) => {
                const percentage = Math.round(macro.consumed / macro.goal * 100);
                return (
                  <MotiView
                    key={key}
                    className="items-center"
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 800 + index * 100 }}
                  >
                    <View className="w-12 h-12 mb-1">
                      <ProgressRing
                        percentage={percentage}
                        color={macro.color}
                        size={48}
                        strokeWidth={4}
                        animate={animateCalories}
                        duration={1.5}
                      >
                        <Text className="text-xs font-medium">{percentage}%</Text>
                      </ProgressRing>
                    </View>
                    <Text className="text-xs text-gray-600 capitalize">{key}</Text>
                    <Text className="text-xs font-medium">
                      <AnimatedNumber value={macro.consumed} duration={1.5} />/
                      {macro.goal}g
                    </Text>
                  </MotiView>
                );
              })}
            </View>
          </GlassMorphism>
        </MotiView>

        {/* Today's Meals */}
        <MotiView
          className="px-4 py-4"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 900, duration: 500 }}
        >
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 1000, duration: 500 }}
          >
            <Text className="text-lg font-semibold mb-4">Today's Meals</Text>
          </MotiView>
          
          <View className="space-y-3">
            <AnimatePresence>
              {meals.map((meal, index) => (
                <MotiView
                  key={meal.id}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -20 }}
                  transition={{ delay: 1100 + index * 100, duration: 500 }}
                >
                  <MealCard meal={meal} />
                </MotiView>
              ))}
            </AnimatePresence>
          </View>
        </MotiView>

        {/* Quick Actions */}
        <MotiView
          className="px-4 py-6"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1400, duration: 500 }}
        >
          <View className="flex-row justify-between">
            {[
              { icon: Camera, label: 'Camera', screen: 'Camera' },
              { icon: Mic, label: 'Voice', screen: 'VoiceLog' },
              { icon: Scan, label: 'Barcode', screen: 'BarcodeScanner' },
              { icon: Search, label: 'Search', screen: 'ManualEntry' }
            ].map((action, index) => (
              <MotiView
                key={action.label}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 1500 + index * 100, type: 'spring' }}
              >
                <TouchableOpacity
                  className="items-center p-3 bg-gray-50 rounded-xl"
                  activeOpacity={0.7}
                  onPress={() => {
                    hapticFeedback.selection();
                    if (action.screen === 'Camera') {
                      navigation.dispatch(CommonActions.navigate('Camera'));
                    } else {
                      navigation.navigate('AddMealFlow', { screen: action.screen });
                    }
                  }}
                >
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
                    <action.icon size={18} color="#320DFF" />
                  </View>
                  <Text className="text-xs text-gray-700">{action.label}</Text>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Feedback button - small and aligned with other content */}
        <MotiView
          className="px-4 mb-8 items-center"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1800 }}
        >
          <TouchableOpacity
            onPress={handleOpenFeedback}
            className="flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <MessageSquare size={14} color="#9CA3AF" className="mr-1" />
            <Text className="text-xs text-gray-500">Share feedback</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>

      {/* Feedback Form */}
      <FeedbackForm
        visible={showFeedbackForm}
        onClose={handleCloseFeedback}
        onSubmit={handleSubmitFeedback}
      />

      {/* Thank you notification */}
      <AnimatePresence>
        {showThankYou && (
          <MotiView
            className="absolute bottom-20 left-4 right-4 bg-primary text-white px-4 py-3 rounded-xl shadow-lg"
            style={{ marginBottom: TAB_BAR_HEIGHT }}
            from={{ translateY: 50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: 50, opacity: 0 }}
          >
            <Text className="text-white text-center">
              Thank you for your feedback! We appreciate your input.
            </Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}