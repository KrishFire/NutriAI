import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Heart,
  Globe,
  Mail,
  Shield,
  FileText,
  Github,
  Twitter,
  ChevronRight,
} from 'lucide-react-native';
import MotiView from 'moti';
import { Berry } from '../../components/ui';
import { hapticFeedback } from '../../utils/haptics';

export default function AboutScreen() {
  const navigation = useNavigation();

  const handleLink = (url: string) => {
    hapticFeedback.selection();
    Linking.openURL(url);
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <Text className="text-gray-600 dark:text-gray-400">{label}</Text>
      <Text className="text-gray-900 dark:text-white font-medium">{value}</Text>
    </View>
  );

  const LinkButton = ({
    icon: Icon,
    label,
    url,
    color = 'text-gray-700 dark:text-gray-300',
  }: {
    icon: any;
    label: string;
    url: string;
    color?: string;
  }) => (
    <TouchableOpacity
      onPress={() => handleLink(url)}
      className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
    >
      <Icon size={20} className={color} />
      <Text className="ml-3 text-gray-900 dark:text-white flex-1">{label}</Text>
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
          About
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and App Info */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500 }}
          className="items-center py-8"
        >
          <View className="mb-4">
            <Berry variant="happy" size="large" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            NutriAI
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            AI-Powered Nutrition Tracking
          </Text>
        </MotiView>

        {/* App Details */}
        <View className="mx-4 mb-6">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            className="bg-white dark:bg-gray-800 rounded-xl px-4"
          >
            <InfoRow label="Version" value="1.0.0 (Build 100)" />
            <InfoRow label="Platform" value="iOS & Android" />
            <InfoRow label="Last Updated" value="December 2024" />
            <InfoRow label="Developer" value="NutriAI Team" />
          </MotiView>
        </View>

        {/* Mission Statement */}
        <View className="mx-4 mb-6">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 100 }}
            className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4"
          >
            <View className="flex-row items-center mb-3">
              <Heart
                size={20}
                className="text-primary-600 dark:text-primary-400 mr-2"
              />
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Our Mission
              </Text>
            </View>
            <Text className="text-gray-700 dark:text-gray-300 leading-relaxed">
              NutriAI was crafted with care to help people achieve their
              nutrition and health goals through AI-powered tracking and
              personalized insights. We believe everyone deserves access to
              intelligent nutrition guidance that adapts to their unique
              lifestyle.
            </Text>
          </MotiView>
        </View>

        {/* Links */}
        <View className="mx-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            RESOURCES
          </Text>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 200 }}
            className="bg-white dark:bg-gray-800 rounded-xl px-4"
          >
            <LinkButton
              icon={FileText}
              label="Terms of Service"
              url="https://nutriai.com/terms"
            />
            <LinkButton
              icon={Shield}
              label="Privacy Policy"
              url="https://nutriai.com/privacy"
            />
            <LinkButton
              icon={Globe}
              label="Visit Our Website"
              url="https://nutriai.com"
            />
            <LinkButton
              icon={Mail}
              label="Contact Support"
              url="mailto:support@nutriai.com"
            />
          </MotiView>
        </View>

        {/* Social */}
        <View className="mx-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            FOLLOW US
          </Text>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 300 }}
            className="bg-white dark:bg-gray-800 rounded-xl px-4"
          >
            <LinkButton
              icon={Twitter}
              label="Twitter"
              url="https://twitter.com/nutriai"
              color="text-blue-400"
            />
            <LinkButton
              icon={Github}
              label="GitHub"
              url="https://github.com/nutriai"
              color="text-gray-700 dark:text-gray-300"
            />
          </MotiView>
        </View>

        {/* Credits */}
        <View className="mx-4">
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500, delay: 400 }}
            className="items-center py-4"
          >
            <View className="flex-row items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Made with
              </Text>
              <Heart
                size={14}
                className="text-red-500 mx-1"
                fill="currentColor"
              />
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                by the NutriAI Team
              </Text>
            </View>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-2">
              © 2024 NutriAI. All rights reserved.
            </Text>
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
