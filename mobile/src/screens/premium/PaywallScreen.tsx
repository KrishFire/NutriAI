import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { hapticFeedback } from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { PageTransition } from '../../components/ui/PageTransition';
import { StandardHeaderWithBack } from '../../components/common';
import { PremiumFeatureCard } from '../../components/premium/PremiumFeatureCard';
import { SubscriptionPlanCard } from '../../components/premium/SubscriptionPlanCard';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>(
    'annual'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    await hapticFeedback.impact();
    setIsLoading(true);

    // Simulate subscription process
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('SubscriptionSuccess');
    }, 1500);
  };

  const handleRestore = async () => {
    await hapticFeedback.selection();
    // Handle restore purchase logic
  };

  const handleBack = async () => {
    await hapticFeedback.selection();
    navigation.goBack();
  };

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1">
          {/* Header */}
          <StandardHeaderWithBack 
            title="Upgrade to Premium" 
            onBack={handleBack}
          />

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Hero Section */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(600)}
              className="px-4 py-2"
            >
              <LinearGradient
                colors={['#320DFF', '#6D56FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-48 rounded-2xl items-center justify-center overflow-hidden"
              >
                <View className="absolute inset-0 items-center justify-center opacity-10">
                  <View className="w-64 h-64 rounded-full bg-white" />
                </View>
                <MotiView
                  from={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="z-10"
                >
                  <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
                    <Ionicons name="flash" size={32} color="white" />
                  </View>
                </MotiView>
                <Text className="text-xl font-bold text-white text-center">
                  Unlock Full Potential
                </Text>
                <Text className="text-white/80 text-sm text-center mt-1 px-6">
                  Get unlimited access to all premium features
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Subscription Plans */}
            <View className="px-4 mt-6">
              <Animated.Text
                entering={FadeInUp.delay(200).duration(600)}
                className="text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                Choose Your Plan
              </Animated.Text>

              <View className="space-y-3">
                <SubscriptionPlanCard
                  title="Monthly"
                  price="$4.99"
                  period="month"
                  description="Billed monthly. Cancel anytime."
                  isSelected={selectedPlan === 'monthly'}
                  onSelect={() => {
                    hapticFeedback.selection();
                    setSelectedPlan('monthly');
                  }}
                />

                <SubscriptionPlanCard
                  title="Annual"
                  price="$49.99"
                  period="year"
                  description="Billed annually. Cancel anytime."
                  isPopular={true}
                  isSelected={selectedPlan === 'annual'}
                  discount="17%"
                  onSelect={() => {
                    hapticFeedback.selection();
                    setSelectedPlan('annual');
                  }}
                />
              </View>
            </View>

            {/* Premium Features */}
            <View className="px-4 mt-8">
              <Animated.Text
                entering={FadeInUp.delay(300).duration(600)}
                className="text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                Premium Features
              </Animated.Text>

              <PremiumFeatureCard
                title="Advanced Analytics"
                description="Get detailed insights about your nutrition and habits."
                icon={<Ionicons name="stats-chart" size={20} color="#320DFF" />}
                highlighted={true}
              />

              <PremiumFeatureCard
                title="Unlimited History"
                description="Access your complete nutrition history without limits."
                icon={<Ionicons name="time" size={20} color="#6B7280" />}
              />

              <PremiumFeatureCard
                title="Cloud Backup"
                description="Keep your data safe with automatic cloud backups."
                icon={<Ionicons name="cloud" size={20} color="#6B7280" />}
              />

              <PremiumFeatureCard
                title="Custom Recipes"
                description="Create and save unlimited custom recipes and meals."
                icon={<Ionicons name="book" size={20} color="#6B7280" />}
              />
            </View>
          </ScrollView>

          {/* Bottom Action Section */}
          <View className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="primary"
              fullWidth
              onPress={handleSubscribe}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading
                ? 'Processing...'
                : `Subscribe for ${selectedPlan === 'monthly' ? '$4.99/month' : '$49.99/year'}`}
            </Button>

            <Pressable onPress={handleRestore} className="mt-4">
              <Text className="text-center text-sm text-gray-600 dark:text-gray-400">
                Restore Purchase
              </Text>
            </Pressable>

            <Text className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
              Your subscription will automatically renew. Cancel anytime in your
              account settings.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
};

export default PaywallScreen;
