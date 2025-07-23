import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Heart,
  ChevronDown,
  Send,
} from 'lucide-react-native';
import MotiView, { AnimatePresence } from 'moti';
import { hapticFeedback } from '../../utils/haptics';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How does the app calculate my calorie goal?',
    answer: 'We use your age, gender, height, weight, activity level, and goals to calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE). This gives us a personalized calorie target to help you reach your goals.',
  },
  {
    id: '2',
    question: 'How accurate is the AI food recognition?',
    answer: "Our AI food recognition is designed to be as accurate as possible, but it's still in beta. It works best with clearly visible, common foods. You can always adjust the results if needed. The technology improves over time as more people use it.",
  },
  {
    id: '3',
    question: 'How do I reset my password?',
    answer: "To reset your password, go to the Profile screen, tap on 'Account', then 'Change Password'. If you're logged out, use the 'Forgot Password' option on the login screen to receive a password reset link via email.",
  },
  {
    id: '4',
    question: 'Can I sync with my fitness tracker?',
    answer: 'Yes! Go to Profile > Health Data to connect with Apple Health, Google Fit, or other fitness trackers. This allows the app to factor in your activity and exercise when calculating your daily calorie needs.',
  },
  {
    id: '5',
    question: 'How do I cancel my subscription?',
    answer: "You can manage your subscription through your App Store (iOS) or Google Play (Android) account settings. Go to your device's subscription management section to cancel. Your Premium features will remain active until the end of your billing period.",
  },
];

export default function HelpScreen() {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const toggleFaq = (id: string) => {
    hapticFeedback.selection();
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageBody.trim()) {
      Alert.alert('Missing Information', 'Please fill in both subject and message fields.');
      return;
    }

    hapticFeedback.success();
    setIsSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSending(false);
    setMessageSubject('');
    setMessageBody('');

    Alert.alert(
      'Message Sent',
      "Thank you for contacting us! We'll get back to you within 1-2 business days.",
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const FAQItem = ({ faq }: { faq: FAQ }) => {
    const isExpanded = expandedFaq === faq.id;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        className="mb-3"
      >
        <TouchableOpacity
          onPress={() => toggleFaq(faq.id)}
          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
          activeOpacity={0.7}
        >
          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 font-medium text-gray-900 dark:text-white pr-2">
                {faq.question}
              </Text>
              <MotiView
                animate={{ rotate: isExpanded ? '180deg' : '0deg' }}
                transition={{ type: 'timing', duration: 300 }}
              >
                <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
              </MotiView>
            </View>
            
            <AnimatePresence>
              {isExpanded && (
                <MotiView
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'timing', duration: 300 }}
                  className="overflow-hidden"
                >
                  <View className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
                    <Text className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </Text>
                  </View>
                </MotiView>
              )}
            </AnimatePresence>
          </View>
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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
            Help & Support
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Help Overview */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 300 }}
            className="mx-4 mt-4 mb-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4"
          >
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 items-center justify-center mr-3 flex-shrink-0">
                <HelpCircle size={20} className="text-primary-600 dark:text-primary-400" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900 dark:text-white mb-1">
                  Need help?
                </Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  Check our FAQs below or send us a message. We'll get back to you within 1-2 business days.
                </Text>
              </View>
            </View>
          </MotiView>

          {/* FAQs */}
          <View className="mx-4 mb-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </Text>
            {faqs.map((faq, index) => (
              <FAQItem key={faq.id} faq={faq} />
            ))}
          </View>

          {/* Contact Form */}
          <View className="mx-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Support
            </Text>
            
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: 300 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4"
            >
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg text-gray-900 dark:text-white"
                  placeholder="What's your question about?"
                  placeholderTextColor="#9ca3af"
                  value={messageSubject}
                  onChangeText={setMessageSubject}
                  editable={!isSending}
                />
              </View>
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg text-gray-900 dark:text-white"
                  placeholder="Describe your issue or question in detail"
                  placeholderTextColor="#9ca3af"
                  value={messageBody}
                  onChangeText={setMessageBody}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                  editable={!isSending}
                />
              </View>
              
              <TouchableOpacity
                className={`py-3 rounded-lg flex-row items-center justify-center ${
                  isSending || !messageSubject.trim() || !messageBody.trim()
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'bg-primary-600 dark:bg-primary-500'
                }`}
                onPress={handleSendMessage}
                disabled={isSending || !messageSubject.trim() || !messageBody.trim()}
              >
                <MessageCircle size={18} className="text-white mr-2" />
                <Text className="text-white font-medium">
                  {isSending ? 'Sending...' : 'Send Message'}
                </Text>
              </TouchableOpacity>
            </MotiView>
          </View>

          {/* Footer */}
          <View className="items-center mt-8 mb-4">
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 500, delay: 500 }}
              className="flex-row items-center"
            >
              <Heart size={14} className="text-red-500 mr-1" fill="currentColor" />
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Made with love
              </Text>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}