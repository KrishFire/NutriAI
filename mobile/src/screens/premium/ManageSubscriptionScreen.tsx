import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  Linking,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { hapticFeedback } from '../../utils/haptics';
import { Button } from '../../components/ui/Button';
import { PageTransition } from '../../components/ui/PageTransition';
import { MotiView } from 'moti';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ManageSubscription'>;

interface SubscriptionData {
  status: 'active' | 'inactive';
  plan: string;
  price: string;
  nextBillingDate: string;
  paymentMethod: string;
  features: string[];
}

export const ManageSubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Sample subscription data - would come from state/API
  const subscription: SubscriptionData = {
    status: 'active',
    plan: 'Premium Annual',
    price: '$49.99',
    nextBillingDate: 'September 15, 2024',
    paymentMethod: 'Apple Pay',
    features: [
      'Advanced Analytics',
      'Unlimited History',
      'Cloud Backup',
      'Custom Recipes',
      'Priority Support',
    ],
  };

  const handleBack = async () => {
    await hapticFeedback.selection();
    navigation.goBack();
  };

  const handleManageSubscription = async () => {
    await hapticFeedback.impact();
    // Open App Store subscription management
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const handleContactSupport = async () => {
    await hapticFeedback.selection();
    // Navigate to support screen or open support email
    Linking.openURL('mailto:support@nutriai.com');
  };

  const handleRestorePurchases = async () => {
    await hapticFeedback.selection();
    // Implement restore purchases logic
  };

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center px-4 pt-4 pb-2">
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#6B7280" />
            </Pressable>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white ml-4">
              Subscription
            </Text>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Subscription Status Card */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(600)}
              className="px-4 py-4"
            >
              <LinearGradient
                colors={['#320DFF', '#6D56FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-xl p-6"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-lg">
                      {subscription.plan}
                    </Text>
                    <Text className="text-white/80 text-sm">
                      {subscription.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View className="bg-white/10 rounded-lg p-4 mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="time-outline" size={16} color="white" opacity={0.8} />
                    <Text className="text-white/80 text-sm ml-2">
                      Next billing: {subscription.nextBillingDate}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="card-outline" size={16} color="white" opacity={0.8} />
                    <Text className="text-white/80 text-sm ml-2">
                      Payment method: {subscription.paymentMethod}
                    </Text>
                  </View>
                </View>

                <Button
                  variant="secondary"
                  fullWidth
                  onPress={handleManageSubscription}
                  icon={<Ionicons name="link-outline" size={16} color="white" />}
                  iconPosition="right"
                  className="bg-white/20 border-white/20"
                >
                  <Text className="text-white">Manage Subscription</Text>
                </Button>
              </LinearGradient>
            </Animated.View>

            {/* Premium Features */}
            <View className="px-4 mb-6">
              <Animated.Text
                entering={FadeInDown.delay(200).duration(600)}
                className="font-semibold text-gray-900 dark:text-white mb-3"
              >
                Premium Features
              </Animated.Text>
              
              <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <View className="space-y-3">
                  {subscription.features.map((feature, index) => (
                    <MotiView
                      key={index}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: 300 + index * 100 }}
                      className="flex-row items-center"
                    >
                      <View className="w-5 h-5 rounded-full bg-primary/10 dark:bg-primaryDark/20 items-center justify-center mr-3">
                        <View className="w-2 h-2 rounded-full bg-primary dark:bg-primaryDark" />
                      </View>
                      <Text className="text-gray-800 dark:text-gray-200">
                        {feature}
                      </Text>
                    </MotiView>
                  ))}
                </View>
              </View>
            </View>

            {/* Need Help Section */}
            <View className="px-4 mb-6">
              <Animated.View
                entering={FadeInDown.delay(400).duration(600)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
              >
                <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                  Need Help?
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  If you have any questions about your subscription or need
                  assistance, our support team is here to help.
                </Text>
                <Button variant="outline" fullWidth onPress={handleContactSupport}>
                  Contact Support
                </Button>
              </Animated.View>
            </View>

            {/* Restore Purchase Section */}
            <View className="px-4">
              <Animated.View
                entering={FadeInDown.delay(500).duration(600)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
              >
                <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                  Restore Purchase
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Changed devices or reinstalled the app? Restore your previous
                  purchases.
                </Text>
                <Button variant="secondary" fullWidth onPress={handleRestorePurchases}>
                  Restore Purchases
                </Button>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </PageTransition>
  );
};