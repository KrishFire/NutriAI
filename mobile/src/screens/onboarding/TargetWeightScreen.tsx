import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import RulerSlider from '../../components/common/RulerSlider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TargetWeightScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData, userData } =
    useOnboarding();

  // Get current weight and goal from previous steps
  const currentWeight = userData.weight || { value: '150', unit: 'lbs' };
  const initialGoal = userData.goal || 'lose';

  const currentWeightValue = parseInt(currentWeight.value, 10);
  const isMetric = currentWeight.unit === 'kg';

  const weightRange = isMetric ? 23 : 50;
  const minWeight = currentWeightValue - weightRange;
  const maxWeight = currentWeightValue + weightRange;

  const getInitialTargetWeight = () => {
    const adjustment = isMetric ? 5 : 10;
    switch (initialGoal) {
      case 'lose':
        return currentWeightValue - adjustment;
      case 'gain':
        return currentWeightValue + adjustment;
      default:
        return currentWeightValue;
    }
  };

  // Initialize target weight
  const [targetWeight, setTargetWeight] = useState(getInitialTargetWeight());
  const [isSliding, setIsSliding] = useState(false);
  const [backPressed, setBackPressed] = useState(false);
  const [continuePressed, setContinuePressed] = useState(false);

  // Calculate current goal based on target vs current weight
  const getCurrentGoal = () => {
    if (targetWeight < currentWeightValue) return 'lose';
    if (targetWeight > currentWeightValue) return 'gain';
    return 'maintain';
  };

  const currentGoal = getCurrentGoal();
  const weightDifference = Math.abs(targetWeight - currentWeightValue);

  const handleWeightChange = (value: number) => {
    setTargetWeight(value);
  };

  const handleSlidingStart = () => {
    setIsSliding(true);
  };

  const handleSlidingComplete = () => {
    setIsSliding(false);
  };

  const handleContinue = () => {
    hapticFeedback.impact();
    updateUserData('targetWeight', {
      value: targetWeight.toString(),
      unit: currentWeight.unit,
    });
    updateUserData('goal', currentGoal);
    goToNextStep();
  };

  const handleBack = () => {
    hapticFeedback.selection();
    goToPreviousStep();
  };

  const getSubheaderText = () => {
    if (currentGoal === 'maintain') {
      return 'Select your target weight';
    }
    return `Select how much weight you want to ${currentGoal}`;
  };

  const getStatusText = () => {
    if (currentGoal === 'maintain') {
      return 'Maintain your current weight';
    }
    return `You want to ${currentGoal} ${weightDifference} ${currentWeight.unit}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with back button */}
        <View style={styles.header}>
          <MotiView
            animate={{
              scale: backPressed ? 0.95 : 1,
            }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 400,
            }}
          >
            <TouchableOpacity
              onPress={handleBack}
              onPressIn={() => setBackPressed(true)}
              onPressOut={() => setBackPressed(false)}
              style={styles.backButton}
              activeOpacity={1}
            >
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
          </MotiView>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <MotiView
            from={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.progressBarFill}
          />
        </View>

        <View style={styles.mainContent}>
          {/* Title and subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>What's your target weight?</Text>
            <MotiView
              animate={{
                opacity: 1,
              }}
              key={currentGoal}
              from={{ opacity: 0.7 }}
              transition={{ type: 'timing', duration: 200 }}
            >
              <Text style={styles.subtitle}>{getSubheaderText()}</Text>
            </MotiView>
          </View>

          {/* Goal Status Badge */}
          <View style={styles.goalBadgeContainer}>
            <MotiView
              key={currentGoal}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <Text style={styles.goalBadge}>
                {currentGoal === 'lose'
                  ? 'Lose weight'
                  : currentGoal === 'gain'
                    ? 'Gain weight'
                    : 'Maintain weight'}
              </Text>
            </MotiView>
          </View>

          {/* Ruler Slider */}
          <RulerSlider
            currentWeight={currentWeightValue}
            targetWeight={targetWeight}
            minWeight={minWeight}
            maxWeight={maxWeight}
            unit={currentWeight.unit}
            onValueChange={handleWeightChange}
            onSlidingStart={handleSlidingStart}
            onSlidingComplete={handleSlidingComplete}
            step={1}
          />

          {/* Target Weight Display */}
          <View style={styles.weightDisplayContainer}>
            <MotiView
              key={targetWeight}
              from={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15,
              }}
            >
              <Text
                style={[
                  styles.weightNumber,
                  isSliding && styles.weightNumberActive,
                ]}
              >
                {targetWeight}
                <Text style={styles.weightUnit}> {currentWeight.unit}</Text>
              </Text>
            </MotiView>
            <Text style={styles.targetLabel}>Target Weight</Text>
          </View>
        </View>

        {/* Status Display (NOT a button - just a display) */}
        <MotiView
          from={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.statusContainer}
        >
          <View style={styles.statusDisplay}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </MotiView>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <MotiView
            animate={{
              scale: continuePressed ? 0.95 : 1,
            }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 400,
            }}
          >
            <TouchableOpacity
              onPress={handleContinue}
              onPressIn={() => setContinuePressed(true)}
              onPressOut={() => setContinuePressed(false)}
              style={styles.continueButton}
              activeOpacity={1}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
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
  },
  header: {
    paddingTop: 24,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginBottom: 36,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#320DFF',
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 36,
    fontFamily: 'System',
    // Fix text rendering
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 24,
    fontFamily: 'System',
    // Fix text rendering
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  goalBadgeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  goalBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#320DFF',
    fontFamily: 'System',
  },
  weightDisplayContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  weightNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: '#320DFF',
    fontFamily: 'System',
    letterSpacing: -2,
    // Fix text rendering to prevent graininess
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  weightNumberActive: {
    // Slightly smaller when sliding but maintain quality
    fontSize: 58,
  },
  weightUnit: {
    fontSize: 28,
    fontWeight: '500',
    color: '#320DFF',
    // Fix text rendering
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  targetLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 8,
    fontFamily: 'System',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusDisplay: {
    backgroundColor: '#F3F0FF', // Light purple background matching image
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 28,
    minWidth: SCREEN_WIDTH - 80,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#320DFF',
    fontFamily: 'System',
    textAlign: 'center',
    // Fix text rendering
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  buttonContainer: {
    paddingBottom: 32,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#320DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});

export default TargetWeightScreen;
