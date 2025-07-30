import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
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
  Sparkles,
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { TAB_BAR_HEIGHT, fontSize, colors } from '../utils/tokens';
import { hapticFeedback } from '../utils/haptics';
import { useLeadingDebounce } from '../hooks/useLeadingDebounce';
import { useDailyProgress } from '../hooks/useDailyProgress';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '../constants';

// Import ALL UI components from the exact design
import {
  ProgressRing,
  AnimatedNumber,
  ParticleEffect,
  MealCard,
  BerryStreakBadge,
} from '../components/ui';
import { PremiumBanner } from '../components/premium';
import { FeedbackForm } from '../components/feedback';
import { AnimationErrorBoundary } from '../components/common';

type HomeScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'HomeScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<AppTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { data, loading, error, refreshing, refresh } = useDailyProgress();
  const insets = useSafeAreaInsets();

  // TODO: Connect to actual data source once backend is ready
  const { canAccessPremiumFeatures, plan } = useSubscription();

  const [showParticles, setShowParticles] = useState(false);
  const [animateCalories, setAnimateCalories] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showPremiumBanner, setShowPremiumBanner] = useState(false);

  // Macro colors from tokens
  const macroColors = {
    carbs: colors.macro.carbs,
    protein: colors.macro.protein,
    fat: colors.macro.fat,
  };

  // Determine if we should show premium banner
  useEffect(() => {
    // Show banner to free users occasionally
    const shouldShowForFreeUser = !canAccessPremiumFeatures && plan === 'free' && Math.random() < 0.5;
    
    // In development, always show banner for testing
    const shouldShowBanner = __DEV__ ? true : shouldShowForFreeUser;
    
    setShowPremiumBanner(shouldShowBanner);
  }, [canAccessPremiumFeatures, plan]);

  useEffect(() => {
    // Animate calories when data loads
    if (data && !loading) {
      // Reduce animation delay
      setTimeout(() => {
        setAnimateCalories(true);
      }, 200);

      // Show particles when calories reach a milestone
      if (data.calories.percentage >= 50 && !showParticles) {
        setTimeout(() => {
          setShowParticles(true);
        }, 1000);
      }
    }
  }, [data, loading, showParticles]);

  const handleUpgrade = useLeadingDebounce(() => {
    hapticFeedback.selection();
    navigation.navigate('PaywallModal');
  }, 1000);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleNotificationsClick = useLeadingDebounce(() => {
    hapticFeedback.selection();
    // Navigate to profile screen for now (notifications will be added later)
    navigation.navigate('Profile');
  }, 1000);

  const handleStreakClick = useLeadingDebounce(() => {
    hapticFeedback.selection();
    // Navigate to profile screen streak section for now
    navigation.navigate('Profile');
  }, 1000);

  const handleOpenFeedback = useLeadingDebounce(() => {
    hapticFeedback.selection();
    setShowFeedbackForm(true);
  }, 1000);

  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
  };

  const handleQuickAction = useLeadingDebounce((screen: string) => {
    hapticFeedback.selection();
    if (screen === 'Camera') {
      navigation.dispatch(CommonActions.navigate('Camera'));
    } else {
      navigation.navigate('AddMealFlow', {
        screen: screen,
      });
    }
  }, 1000);

  const handleSubmitFeedback = (_feedback: {
    rating: number;
    comment: string;
    contactInfo?: string;
  }) => {
    // TODO: Submit feedback to backend
    setShowFeedbackForm(false);
    setShowThankYou(true);

    // Hide thank you message after 3 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
  };

  const onRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  if (loading && !data) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#320DFF" />
        <Text className="text-gray-500 mt-2">Loading your progress...</Text>
      </View>
    );
  }

  // Show error state
  if (error && !data) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-gray-800 text-lg mb-2">Oops!</Text>
        <Text className="text-gray-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayData = data || {
    userName: 'Friend',
    streak: 0,
    notifications: 0,
    calories: {
      consumed: 0,
      goal: 2000,
      remaining: 2000,
      percentage: 0,
    },
    macros: {
      protein: { consumed: 0, goal: 150, percentage: 0 },
      carbs: { consumed: 0, goal: 250, percentage: 0 },
      fat: { consumed: 0, goal: 65, percentage: 0 },
    },
    meals: [],
  };

  return (
    <AnimationErrorBoundary>
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
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 20,
          }}
        >
          {/* Main content container with consistent spacing */}
          <View
            style={{
              paddingTop: insets.top + SPACING.lg,
              paddingHorizontal: SPACING.md,
              gap: SPACING.xxxl,
            }}
          >
            {/* Header */}
            <MotiView
              className="flex-row justify-between items-center"
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 400, type: 'timing' }}
            >
              <View>
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 200, duration: 300 }}
                >
                  <Text
                    className="text-gray-600"
                    style={{ fontSize: fontSize.body }}
                  >
                    {getGreeting()},
                  </Text>
                </MotiView>
                <MotiView
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 300, type: 'spring', damping: 20 }}
                >
                  <Text
                    className="font-bold"
                    style={{ fontSize: fontSize.header }}
                  >
                    {displayData.userName}
                  </Text>
                </MotiView>
              </View>
              <View className="flex-row items-center" style={{ gap: 16 }}>
                <TouchableOpacity
                  className="rounded-full flex-row items-center"
                  style={{ 
                    backgroundColor: '#F3F0FF', // Light purple background like premium banner
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    minWidth: 51 
                  }}
                  onPress={handleStreakClick}
                >
                  <Image
                    source={require('../../assets/berry/berry_streak.png')}
                    style={{ width: 24, height: 24 }}
                  />
                  <Text
                    className="font-medium"
                    style={{ 
                      fontSize: 14, 
                      marginLeft: 4,
                      color: '#320DFF' // Dark purple color for number
                    }}
                  >
                    {displayData.streak || 7}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full relative"
                  style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                  onPress={handleNotificationsClick}
                >
                  <Bell size={20} color="#6B7280" />
                  <View 
                    className="absolute bg-red-500 rounded-full items-center justify-center"
                    style={{ 
                      width: 20, 
                      height: 20, 
                      top: 0, 
                      right: 0,
                    }}
                  >
                    <Text
                      className="text-white font-bold"
                      style={{ fontSize: 10.2 }}
                    >
                      3
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </MotiView>

            {/* Premium Banner - Only shown occasionally */}
            {showPremiumBanner && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 500, duration: 400 }}
              >
                <TouchableOpacity
                  onPress={handleUpgrade}
                  style={{
                    backgroundColor: '#F3F0FF',
                    padding: 16,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#320DFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sparkles size={18} color="white" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      className="font-medium"
                      style={{ fontSize: 14, color: '#1F2937' }}
                    >
                      Upgrade to Premium
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#6B7280',
                        marginTop: 4,
                        lineHeight: 20,
                      }}
                    >
                      Unlock advanced analytics, custom meal plans, and unlimited food logging
                    </Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#320DFF',
                        paddingHorizontal: 25,
                        paddingVertical: 19,
                        borderRadius: 999,
                        marginTop: 20,
                        alignSelf: 'flex-start',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 58,
                        minWidth: 175,
                      }}
                      onPress={handleUpgrade}
                    >
                      <Sparkles size={16} color="white" />
                      <Text
                        className="font-medium"
                        style={{ 
                          fontSize: 14, 
                          color: 'white',
                          marginLeft: 8,
                        }}
                      >
                        Upgrade Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </MotiView>
            )}

            {/* Daily Progress - No card container */}
            <MotiView
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 600, duration: 500, type: 'timing' }}
            >
              <View style={{ paddingVertical: 24 }}>
                <View className="flex-row justify-between w-full mb-9">
                  <Text
                    className="text-gray-500"
                    style={{ fontSize: 12 }}
                  >
                    Daily Progress
                  </Text>
                  <Text
                    className="font-medium"
                    style={{ fontSize: 12 }}
                  >
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                <View className="items-center">
                  <View className="w-48 h-48 relative mb-16">
                    <ProgressRing
                      percentage={displayData.calories.percentage}
                      color="#320DFF"
                      size={192}
                      strokeWidth={12}
                      animate={animateCalories}
                      duration={2}
                    >
                      <View className="items-center justify-center">
                        <Text
                          className="font-bold"
                          style={{ fontSize: 32, color: '#000000' }}
                        >
                          {displayData.calories.consumed}
                        </Text>
                        <Text
                          className="text-gray-500"
                          style={{ fontSize: 14 }}
                        >
                          of {displayData.calories.goal} cal
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

                  <View className="flex-row justify-between w-full px-6">
                    {Object.entries(displayData.macros).map(
                      ([key, macro], index) => {
                        return (
                          <MotiView
                            key={key}
                            className="items-center"
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{
                              delay: 800 + index * 100,
                              type: 'timing',
                              duration: 400,
                            }}
                            style={{ width: 96 }}
                          >
                            <View className="w-12 h-12 mb-1">
                              <ProgressRing
                                percentage={macro.percentage}
                                color={
                                  macroColors[key as keyof typeof macroColors]
                                }
                                size={48}
                                strokeWidth={4}
                                animate={animateCalories}
                                duration={1.5}
                              >
                                <Text className="font-semibold text-xs text-gray-800">
                                  {macro.percentage}%
                                </Text>
                              </ProgressRing>
                            </View>
                            <Text
                              className="text-gray-600 capitalize"
                              style={{ fontSize: 10.2, marginTop: 4 }}
                            >
                              {key}
                            </Text>
                            <Text
                              className="font-medium"
                              style={{ fontSize: 10.2 }}
                            >
                              <AnimatedNumber
                                value={macro.consumed}
                                duration={1.5}
                              />
                              /{macro.goal}g
                            </Text>
                          </MotiView>
                        );
                      }
                    )}
                  </View>
                </View>
              </View>
            </MotiView>

            {/* Today's Meals */}
            <MotiView
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 1100, duration: 500, type: 'timing' }}
            >
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 1200, duration: 400 }}
              >
                <Text
                  className="font-semibold mb-4"
                  style={{ fontSize: fontSize.header }}
                >
                  Today&apos;s Meals
                </Text>
              </MotiView>

              {displayData.meals.length === 0 ? (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1300, duration: 400 }}
                  className="py-8 items-center"
                >
                  <Text
                    className="text-gray-400"
                    style={{ fontSize: fontSize.body }}
                  >
                    No meals logged yet today
                  </Text>
                  <Text
                    className="text-gray-400 mt-1"
                    style={{ fontSize: fontSize.caption }}
                  >
                    Tap a button below to add your first meal
                  </Text>
                </MotiView>
              ) : (
                <AnimatePresence>
                  {displayData.meals.map((meal, index) => (
                    <MotiView
                      key={meal.id}
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -20 }}
                      transition={{ delay: 1300 + index * 100, duration: 400 }}
                      className={index > 0 ? 'mt-3' : ''}
                    >
                      <MealCard meal={meal} />
                    </MotiView>
                  ))}
                </AnimatePresence>
              )}
            </MotiView>

            {/* Quick Actions */}
            <MotiView
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 1400, duration: 500, type: 'timing' }}
            >
              <View style={{ paddingTop: 24, paddingBottom: 12 }}>
                <View className="flex-row" style={{ gap: 8 }}>
                  {[
                    { icon: Camera, label: 'Camera', screen: 'Camera' },
                    { icon: Mic, label: 'Voice', screen: 'VoiceLog' },
                    { icon: Scan, label: 'Barcode', screen: 'BarcodeScanner' },
                    { icon: Search, label: 'Search', screen: 'ManualEntry' },
                  ].map((action, index) => (
                    <TouchableOpacity
                      key={action.label}
                      style={{
                        flex: 1,
                        backgroundColor: '#F9FAFB',
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: 'center',
                      }}
                      activeOpacity={0.7}
                      onPress={() => handleQuickAction(action.screen)}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: 'rgba(50, 13, 255, 0.1)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <action.icon size={18} color="#320DFF" />
                      </View>
                      <Text
                        className="text-gray-700"
                        style={{ fontSize: 10 }}
                      >
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </MotiView>

            {/* Feedback button - centered at bottom */}
            <MotiView
              className="items-center"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1900, duration: 400 }}
              style={{ paddingTop: 0, paddingBottom: 16 }}
            >
              <TouchableOpacity
                onPress={handleOpenFeedback}
                className="flex-row items-center justify-center"
                activeOpacity={0.7}
              >
                <MessageSquare size={14} color="#9CA3AF" style={{ marginRight: 4 }} />
                <Text
                  className="text-gray-500"
                  style={{ fontSize: 10 }}
                >
                  Share feedback
                </Text>
              </TouchableOpacity>
            </MotiView>
          </View>
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
    </AnimationErrorBoundary>
  );
}
