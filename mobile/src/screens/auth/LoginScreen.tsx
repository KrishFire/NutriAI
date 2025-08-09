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
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AuthStackParamList, RootStackParamList } from '@/types/navigation';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/Button';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { hapticFeedback } from '@/utils/haptics';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/utils';
import GoogleLogo from '@/components/logos/GoogleLogo';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AuthStack'
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    hapticFeedback.selection();
    setError(null);
    setIsLoading(true);

    try {
      const { user, error: socialError } =
        provider === 'google'
          ? await signInWithGoogle()
          : await signInWithApple();

      if (socialError) {
        setError(socialError.message);
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

  const handleSubmit = async () => {
    setError(null);

    // Basic validation
    if (!validateEmail(email)) {
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
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    hapticFeedback.selection();
                    navigation.goBack();
                  }}
                  activeOpacity={0.7}
                  accessibilityLabel="Go back"
                  accessibilityRole="button"
                  accessibilityHint="Navigate to the previous screen"
                >
                  <ArrowLeft size={20} color="#111827" />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>
                  Log in to continue tracking your nutrition
                </Text>
              </View>

              {/* Social Sign In */}
              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={styles.appleButton}
                  onPress={() => handleSocialSignIn('apple')}
                  activeOpacity={0.8}
                  accessibilityLabel="Continue with Apple"
                  accessibilityRole="button"
                  accessibilityHint="Sign in using your Apple account"
                >
                  <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                  <Text style={styles.appleButtonText}>
                    Continue with Apple
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={() => handleSocialSignIn('google')}
                  activeOpacity={0.8}
                  accessibilityLabel="Continue with Google"
                  accessibilityRole="button"
                  accessibilityHint="Sign in using your Google account"
                >
                  <GoogleLogo size={20} />
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email Input */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TouchableOpacity
                      onPress={() => {
                        hapticFeedback.selection();
                        navigation.navigate('AuthStack', {
                          screen: 'ForgotPassword',
                        } as any);
                      }}
                      accessibilityLabel="Forgot Password?"
                      accessibilityRole="link"
                      accessibilityHint="Navigate to password recovery screen"
                    >
                      <Text style={styles.forgotPassword}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      style={styles.passwordInput}
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                      accessibilityLabel={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      accessibilityRole="button"
                      accessibilityHint={
                        showPassword
                          ? 'Hide the password text'
                          : 'Show the password text'
                      }
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#9CA3AF" />
                      ) : (
                        <Eye size={20} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Error Message */}
              {error && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={styles.errorContainer}
                >
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                activeOpacity={0.8}
                accessibilityLabel={isLoading ? 'Logging in' : 'Log In'}
                accessibilityRole="button"
                accessibilityHint="Submit your login credentials"
                accessibilityState={{ disabled: isLoading }}
              >
                {isLoading ? (
                  <LoadingIndicator size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Log In</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => {
                    hapticFeedback.selection();
                    navigation.navigate('Onboarding', {
                      screen: 'OnboardingFlow',
                      params: { initialStep: 'carousel' },
                    });
                  }}
                  accessibilityLabel="Sign Up"
                  accessibilityRole="link"
                  accessibilityHint="Navigate to create a new account"
                >
                  <Text style={styles.toggleLink}>Sign Up</Text>
                </TouchableOpacity>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
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
  googleButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    fontWeight: '600',
    color: '#374151',
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
    borderColor: '#E5E7EB',
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
    borderColor: '#E5E7EB',
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
