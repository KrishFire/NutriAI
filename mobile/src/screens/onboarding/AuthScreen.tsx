import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { LoadingIndicator } from '../../components/ui/LoadingIndicator';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils';
import AppleLogo from '../../components/icons/AppleLogo';

interface AuthScreenProps {
  mode?: 'signup' | 'signin';
}

const AuthScreen = ({ mode: initialMode = 'signup' }: AuthScreenProps) => {
  const { goToNextStep, goToPreviousStep, updateUserData, progress } =
    useOnboarding();
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();

  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  const handleSubmit = async () => {
    setError(null);

    // Basic validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.selectionAsync();

    try {
      const result = isSignUp
        ? await signUp({ email, password })
        : await signIn({ email, password });

      if (result.error) {
        setError(result.error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateUserData('email', email);
        updateUserData('authMethod', 'email');
        // For sign in, skip remaining onboarding steps
        if (!isSignUp) {
          // User is signing in - they've already completed onboarding
          // The auth state change will handle navigation
          // No need to do anything here as RootNavigator will detect authenticated user
        } else {
          // New user - continue with onboarding
          goToNextStep();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    Haptics.selectionAsync();
    setError(null);
    setLoading(true);

    try {
      const result =
        provider === 'google'
          ? await signInWithGoogle()
          : await signInWithApple();

      if (result.error) {
        // Provide more specific error messages for common issues
        if (result.error.message.includes('Failed to authenticate')) {
          setError(
            `${provider === 'google' ? 'Google' : 'Apple'} sign in is not yet configured. Please use email/password for now.`
          );
        } else {
          setError(result.error.message);
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateUserData('authMethod', provider);
        // For social sign in during onboarding, continue with next steps
        if (isSignUp) {
          goToNextStep();
        }
        // Otherwise navigation will be handled by auth state change
      }
    } catch (err) {
      setError('An unexpected error occurred');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    Haptics.selectionAsync();
    setMode(mode === 'signup' ? 'signin' : 'signup');
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header with back button and progress dot */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  goToPreviousStep();
                }}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ArrowLeft size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Title and subtitle */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? 'Start your nutrition journey'
                  : 'Sign in to continue'}
              </Text>
            </View>

            {/* Social Sign In Buttons */}
            <View style={styles.socialContainer}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => handleSocialSignIn('apple')}
                  style={styles.appleButton}
                  activeOpacity={0.8}
                >
                  <AppleLogo size={20} color="#FFFFFF" />
                  <Text style={styles.appleButtonText}>
                    Continue with Apple
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleSocialSignIn('google')}
                style={[
                  styles.googleButton,
                  Platform.OS === 'android' && { marginTop: 0 },
                ]}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: 'https://www.google.com/favicon.ico' }}
                  style={styles.googleIcon}
                />
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

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={
                      isSignUp ? 'Create a password' : 'Enter your password'
                    }
                    placeholderTextColor="#C7C7CC"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      setShowPassword(!showPassword);
                    }}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
                {isSignUp && (
                  <Text style={styles.passwordHint}>
                    Password must be at least 8 characters
                  </Text>
                )}
              </View>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="#C7C7CC"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />
                </View>
              )}
            </View>

            {/* Error Message */}
            {error && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={styles.errorContainer}
              >
                <Text style={styles.errorText}>{error}</Text>
              </MotiView>
            )}

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <LoadingIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
                <Text style={styles.toggleLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy (Sign Up only) */}
            {isSignUp && (
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
  passwordHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#9CA3AF',
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
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#320DFF',
  },
});

export default AuthScreen;
