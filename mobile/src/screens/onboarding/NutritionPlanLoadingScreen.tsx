import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calculator,
  Brain,
  Salad,
  Activity as Dumbbell,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width: screenWidth } = Dimensions.get('window');

const NutritionPlanLoadingScreen = () => {
  const { goToNextStep, userData } = useOnboarding();

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    {
      text: 'Analyzing your profile data...',
      icon: Calculator,
    },
    {
      text: 'Calculating optimal macronutrient ratios...',
      icon: Brain,
    },
    {
      text: 'Personalizing your nutrition plan...',
      icon: Salad,
    },
    {
      text: 'Optimizing for your activity level...',
      icon: Dumbbell,
    },
    {
      text: 'Finalizing your personalized plan...',
      icon: Zap,
    },
  ];

  useEffect(() => {
    // Smooth progress animation that doesn't skip numbers
    let timeout: NodeJS.Timeout;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;

        // Update current step based on progress thresholds
        const stepThreshold = Math.floor(
          (newProgress / 100) * loadingSteps.length
        );
        if (
          stepThreshold > currentStep &&
          currentStep < loadingSteps.length - 1
        ) {
          setCurrentStep(stepThreshold);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          timeout = setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            goToNextStep();
          }, 800);
        }

        return newProgress > 100 ? 100 : newProgress;
      });
    }, 35); // Faster for smoother counting but still readable

    return () => {
      clearInterval(interval);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [currentStep, goToNextStep]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>Creating Your Plan</Text>
          <Text style={styles.subtitle}>
            We're calculating your personalized nutrition plan
          </Text>
        </MotiView>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          {/* Large Percentage Number */}
          <MotiText
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={styles.percentageText}
          >
            {progress}%
          </MotiText>

          {/* Gradient Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'timing', duration: 35 }}
                style={styles.progressBarWrapper}
              >
                <LinearGradient
                  colors={['#320DFF', '#5E3FFF', '#320DFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBar}
                />
              </MotiView>
            </View>
          </View>
        </View>

        {/* Loading Steps */}
        <View style={styles.stepsContainer}>
          {loadingSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -20 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0.4,
                  translateX: 0,
                }}
                transition={{ delay: index * 80 }}
                style={styles.stepItem}
              >
                <View
                  style={[
                    styles.stepContent,
                    isActive && styles.stepContentActive,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Icon
                      size={22}
                      color={
                        isActive
                          ? '#320DFF'
                          : isCompleted
                            ? '#10B981'
                            : '#9CA3AF'
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      isActive && styles.stepTextActive,
                      isCompleted && styles.stepTextCompleted,
                    ]}
                  >
                    {step.text}
                  </Text>
                  {isCompleted && (
                    <MotiView
                      from={{ scale: 0, rotate: '0deg' }}
                      animate={{ scale: 1, rotate: '360deg' }}
                      transition={{
                        type: 'spring',
                        damping: 12,
                        stiffness: 200,
                      }}
                    >
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    </MotiView>
                  )}
                </View>
              </MotiView>
            );
          })}
        </View>

        {/* Almost Done Text */}
        <MotiView
          animate={{ opacity: progress > 80 ? 1 : 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.footerText}
        >
          <Text style={styles.almostDoneText}>
            Almost there! Your personalized nutrition plan is ready.
          </Text>
        </MotiView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 24,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  percentageText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#320DFF',
    marginBottom: 24,
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarWrapper: {
    height: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
    borderRadius: 6,
  },
  stepsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stepItem: {
    marginBottom: 20,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stepContentActive: {
    // Active state is handled by color changes in text/icon
  },
  iconContainer: {
    width: 32,
    height: 32,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  stepTextActive: {
    color: '#320DFF',
    fontWeight: '500',
  },
  stepTextCompleted: {
    color: '#111827',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 24,
  },
  almostDoneText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default NutritionPlanLoadingScreen;
