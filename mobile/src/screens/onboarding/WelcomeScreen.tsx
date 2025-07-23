import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const WelcomeScreen = () => {
  const { goToNextStep } = useOnboarding();

  const handleGetStarted = () => {
    hapticFeedback.impact();
    goToNextStep();
  };

  const handleLogin = () => {
    hapticFeedback.selection();
    // TODO: Navigate to login screen
    // For now, just go to next step
    goToNextStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main content container */}
        <View style={styles.mainContent}>
          {/* Berry illustration */}
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 800 }}
            style={styles.berryContainer}
          >
            <Image
              source={require('../../../assets/berry/berry-waving.png')}
              style={styles.berryImage}
            />
          </MotiView>

          {/* Title */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 200, duration: 500 }}
            style={styles.titleContainer}
          >
            <Text style={styles.title}>
              Nutrition Tracking{'\n'}Made Easy
            </Text>
          </MotiView>

          {/* Subtitle */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 300, duration: 500 }}
            style={styles.subtitleContainer}
          >
            <Text style={styles.subtitle}>
              The smartest way to track your nutrition with AI-powered food recognition
            </Text>
          </MotiView>

          {/* Feature points */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 400, duration: 500 }}
            style={styles.featuresContainer}
          >
            <View style={styles.featureItem}>
              <View style={styles.featureBulletOuter}>
                <View style={styles.featureBulletInner} />
              </View>
              <Text style={styles.featureText}>
                AI-powered food recognition
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureBulletOuter}>
                <View style={styles.featureBulletInner} />
              </View>
              <Text style={styles.featureText}>
                Effortless nutrition tracking
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureBulletOuter}>
                <View style={styles.featureBulletInner} />
              </View>
              <Text style={styles.featureText}>
                Personalized insights
              </Text>
            </View>
          </MotiView>
        </View>

        {/* Buttons */}
        <MotiView
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 600, duration: 500 }}
          style={styles.buttonsContainer}
        >
          <TouchableOpacity
            onPress={handleGetStarted}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            style={styles.secondaryButton}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 56,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  berryContainer: {
    width: 192,
    height: 192,
    marginBottom: 32,
  },
  berryImage: {
    width: 192,
    height: 192,
    resizeMode: 'contain',
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 30.6,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    lineHeight: 40,
    fontFamily: 'System',
  },
  subtitleContainer: {
    marginBottom: 40,
    paddingHorizontal: 17,
  },
  subtitle: {
    fontSize: 15.3,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 28,
    fontFamily: 'System',
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 17,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureBulletOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(50, 13, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureBulletInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#320DFF',
  },
  featureText: {
    fontSize: 15.3,
    color: '#374151',
    lineHeight: 28,
    flex: 1,
    fontFamily: 'System',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 24,
  },
  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#320DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 13.6,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 24,
    fontFamily: 'System',
  },
  secondaryButton: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 13.6,
    color: '#6B7280',
    lineHeight: 24,
    fontFamily: 'System',
  },
});

export default WelcomeScreen;