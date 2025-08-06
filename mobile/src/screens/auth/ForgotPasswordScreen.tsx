import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';
import { hapticFeedback } from '@/utils/haptics';
import { validateEmail } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Clear any previous errors
    setError(null);

    // Basic validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      hapticFeedback.error();
      return;
    }

    // Send password reset email
    setIsLoading(true);
    hapticFeedback.selection();

    try {
      const { error } = await resetPassword(email);

      if (error) {
        // Check for rate limit error using status code
        if (error.status === 429) {
          // Show the actual rate limit message from Supabase
          setError(error.message);
        } else {
          // For other errors, show generic message to avoid leaking info
          console.error('Password reset failed:', error);
          setError('Unable to send reset email. Please try again later.');
        }
        hapticFeedback.error();
      } else {
        setIsSubmitted(true);
        hapticFeedback.success();
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      setError('An unexpected error occurred. Please try again.');
      hapticFeedback.error();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    hapticFeedback.selection();
    navigation.goBack();
  };

  const handleBackToLogin = () => {
    hapticFeedback.selection();
    navigation.navigate('Login');
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.successContainer}
        >
          <Animated.View
            entering={FadeIn.delay(100).springify()}
            style={styles.successIconContainer}
          >
            <CheckCircle size={32} color="#320DFF" />
          </Animated.View>

          <Text style={styles.successTitle}>Check Your Email</Text>

          <Text style={styles.successDescription}>
            We've sent a password reset link to{' '}
            <Text style={styles.emailText}>{email}</Text>. Please check your
            inbox.
          </Text>

          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.backToLoginButton}
            activeOpacity={0.8}
            accessibilityLabel="Back to Login"
            accessibilityRole="button"
            accessibilityHint="Return to the login screen"
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
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
                onPress={handleBack}
                style={styles.backButton}
                activeOpacity={0.7}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                accessibilityHint="Navigate to the previous screen"
              >
                <ArrowLeft size={20} color="#111827" />
              </TouchableOpacity>

              <Text style={styles.title}>Reset Password</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Mail size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      setError(null);
                    }}
                    placeholder="your@email.com"
                    placeholderTextColor="#CCCCCC"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    style={styles.input}
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address"
                  />
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

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading || !email}
                style={[
                  styles.submitButton,
                  (isLoading || !email) && styles.submitButtonDisabled,
                ]}
                activeOpacity={0.8}
                accessibilityLabel={
                  isLoading ? 'Sending reset link' : 'Send Reset Link'
                }
                accessibilityRole="button"
                accessibilityHint="Send password reset email"
                accessibilityState={{ disabled: isLoading || !email }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 15,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 48,
    paddingLeft: 41,
    paddingRight: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  submitButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#320DFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Success state styles
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(50, 13, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 320,
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  backToLoginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#320DFF',
    borderRadius: 24,
  },
  backToLoginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
