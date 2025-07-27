import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { MotiView } from 'moti';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AuthStackParamList } from '@/types/navigation';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/Button';
import { hapticFeedback } from '@/utils/haptics';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/utils';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSocialSignIn = (provider: string) => {
    hapticFeedback.selection();
    // Simulate social sign in
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // onLogin();
    }, 1000);
  };

  const handleSubmit = async () => {
    setError(null);

    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      hapticFeedback.error();
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      hapticFeedback.error();
      return;
    }

    // Sign in
    setIsLoading(true);

    try {
      const { user, error: signInError } = await signIn({ email, password });

      if (signInError) {
        setError(signInError.message);
        hapticFeedback.error();
      } else if (user) {
        hapticFeedback.success();
        // Navigation will be handled by auth state change
      }
    } catch (err) {
      setError('An unexpected error occurred');
      hapticFeedback.error();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 pt-4 pb-6">
              {/* Header */}
              <View className="flex-row items-center mb-8">
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4"
                  onPress={() => {
                    hapticFeedback.selection();
                    navigation.goBack();
                  }}
                  activeOpacity={0.7}
                >
                  <ArrowLeft
                    size={20}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  Log In
                </Text>
              </View>

              {/* Social Sign In */}
              <View className="space-y-4 mb-6">
                <TouchableOpacity
                  className="w-full h-12 bg-black dark:bg-white rounded-full flex-row items-center justify-center space-x-2"
                  onPress={() => handleSocialSignIn('apple')}
                  activeOpacity={0.8}
                >
                  <View className="w-5 h-5 items-center justify-center">
                    <Text className="text-white dark:text-black text-lg"></Text>
                  </View>
                  <Text className="text-white dark:text-black font-medium">
                    Continue with Apple
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="w-full h-12 border border-gray-300 dark:border-gray-700 rounded-full flex-row items-center justify-center space-x-2 bg-white dark:bg-gray-800"
                  onPress={() => handleSocialSignIn('google')}
                  activeOpacity={0.8}
                >
                  <View className="w-5 h-5 items-center justify-center">
                    <Text className="text-lg">🌐</Text>
                  </View>
                  <Text className="text-gray-800 dark:text-white font-medium">
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <Text className="px-4 text-sm text-gray-500 dark:text-gray-400">
                  or
                </Text>
                <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </Text>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Mail
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      hapticFeedback.selection();
                      navigation.navigate('ForgotPassword');
                    }}
                  >
                    <Text className="text-sm text-primary dark:text-primary-light">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="relative">
                  <View className="absolute left-3 top-3.5 z-10">
                    <Lock
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    className="w-full h-12 pl-10 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    className="absolute right-3 top-3.5"
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff
                        size={20}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    ) : (
                      <Eye
                        size={20}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {error && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4"
                >
                  <Text className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </Text>
                </Animated.View>
              )}

              {/* Login Button */}
              <Button
                onPress={handleSubmit}
                variant="primary"
                size="large"
                disabled={isLoading}
                className="mb-6"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  'Log In'
                )}
              </Button>

              {/* Sign Up Link */}
              <View className="items-center">
                <Text className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Text
                    className="text-primary dark:text-primary-light font-medium"
                    onPress={() => {
                      hapticFeedback.selection();
                      navigation.navigate('Signup');
                    }}
                  >
                    Sign Up
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 24,
  },
  socialContainer: {
    marginBottom: 24,
  },
  appleButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  googleButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 56,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 28,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#320DFF',
    fontWeight: '500',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    width: '100%',
    height: 56,
    paddingHorizontal: 20,
    paddingRight: 50,
    backgroundColor: '#F9FAFB',
    borderRadius: 28,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  eyeButton: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#320DFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleLink: {
    fontSize: 14,
    color: '#320DFF',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LoginScreen;
