import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import DecimalSlider from '../../components/common/DecimalSlider';
import { MotiView, MotiText, useAnimationState } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Svg, { Path, G } from 'react-native-svg';
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LBS_TO_KG = 0.453592;
// V2: No need for precision factor - DecimalSlider auto-calculates it

// Using professional icon libraries for better visuals
const SnailIcon = ({ size = 48, color = '#320DFF' }) => (
  <MaterialCommunityIcons
    name="turtle"
    size={size}
    color={color}
    accessibilityLabel="Gradual pace icon"
  />
);

const RabbitIcon = ({ size = 48, color = '#320DFF' }) => (
  <MaterialCommunityIcons
    name="rabbit"
    size={size}
    color={color}
    accessibilityLabel="Moderate pace icon"
  />
);

// Lightning bolt for ambitious pace
const BoltIcon = ({ size = 48, color = '#320DFF' }) => (
  <Ionicons
    name="flash"
    size={size}
    color={color}
    accessibilityLabel="Ambitious pace icon"
  />
);

// Pace level configuration with cleaner labels
const PACE_LEVELS = [
  {
    name: 'gradual',
    label: 'Gradual',
    threshold: 0.7, // These thresholds are used for comparison only, not passed to native code
    Icon: SnailIcon,
    description: 'Slower pace, but easier to maintain long-term',
  },
  {
    name: 'moderate',
    label: 'Moderate',
    threshold: 2.2,
    Icon: RabbitIcon,
    description: 'Balanced approach for most people',
  },
  {
    name: 'ambitious',
    label: 'Ambitious',
    threshold: 3.1,
    Icon: BoltIcon,
    description: 'Faster results, but requires more discipline',
  },
];

const WeightSpeedScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData, userData } =
    useOnboarding();

  const goal = userData?.goal || 'lose';
  // Now we can use decimal values directly with the DecimalSlider wrapper
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);

  const weight = userData?.weight || userData?.currentWeight || { unit: 'lbs' };
  const isMetric = weight.unit === 'kg';
  const unit = isMetric ? 'kg' : 'lbs';

  // Animation states for buttons
  const backButtonAnimation = useAnimationState({
    from: { scale: 1 },
    pressed: { scale: 0.95 },
  });

  const continueButtonAnimation = useAnimationState({
    from: { scale: 1 },
    pressed: { scale: 0.95 },
  });

  // Track sliding state for number animation
  const [isSliding, setIsSliding] = useState(false);

  // Calculate current pace level based on selected speed
  const currentPace = useMemo(() => {
    return PACE_LEVELS.find(level => selectedSpeed <= level.threshold)!;
  }, [selectedSpeed]);

  // Track pace changes for haptic feedback
  const previousPaceName = useRef(currentPace.name);
  useEffect(() => {
    if (previousPaceName.current !== currentPace.name) {
      hapticFeedback.impact();
      previousPaceName.current = currentPace.name;
    }
  }, [currentPace.name]);

  // Handle speed changes
  const handleSpeedChange = useCallback((value: number) => {
    setSelectedSpeed(value);
  }, []);

  const handleContinue = useCallback(() => {
    hapticFeedback.impact();
    updateUserData('weightChangeSpeed', selectedSpeed);
    goToNextStep();
  }, [selectedSpeed, updateUserData, goToNextStep]);

  const handleBack = useCallback(() => {
    hapticFeedback.selection();
    goToPreviousStep();
  }, [goToPreviousStep]);

  const actionWord = goal === 'lose' ? 'lose' : 'gain';

  // Convert to kg per week for metric display
  const displayValue = isMetric
    ? (selectedSpeed * LBS_TO_KG).toFixed(1)
    : selectedSpeed.toFixed(1);

  const handleSlidingStart = useCallback(() => {
    setIsSliding(true);
    hapticFeedback.selection();
  }, []);

  const handleSlidingComplete = useCallback(() => {
    setIsSliding(false);
    hapticFeedback.impact();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with back button */}
        <View style={styles.header}>
          <MotiView
            state={backButtonAnimation}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 400,
            }}
          >
            <TouchableOpacity
              onPress={handleBack}
              onPressIn={() => backButtonAnimation.transitionTo('pressed')}
              onPressOut={() => backButtonAnimation.transitionTo('from')}
              style={styles.backButton}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="Go back to previous screen"
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

        {/* Title and subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            How fast do you want to reach your goal?
          </Text>
          <Text style={styles.subtitle}>
            Select your preferred {actionWord} weight speed
          </Text>
        </View>

        {/* Icon Display */}
        <View style={styles.iconContainer}>
          <MotiView
            key={currentPace.name}
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <currentPace.Icon size={48} color="#320DFF" />
          </MotiView>
        </View>

        {/* Speed Value Display with scaling animation */}
        <View style={styles.speedDisplayContainer}>
          <MotiView
            animate={{
              scale: isSliding ? 0.88 : 1,
              opacity: isSliding ? 0.8 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
            }}
          >
            <Text style={styles.speedNumber}>
              {displayValue}
              <Text style={styles.speedUnit}> {unit}/week</Text>
            </Text>
          </MotiView>
        </View>

        {/* Slider Container */}
        <View style={styles.sliderContainer}>
          <DecimalSlider
            style={styles.slider}
            minimumValue={0.2}
            maximumValue={3.0}
            value={selectedSpeed}
            onValueChange={handleSpeedChange}
            onSlidingStart={handleSlidingStart}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor="#320DFF"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#320DFF"
            step={0.1}
            // V2: precisionFactor auto-calculated from step
            accessibilityLabel="Weight change speed slider"
            accessibilityHint={`Controls how fast you want to ${actionWord} weight. Currently set to ${displayValue} ${unit} per week.`}
          />

          {/* Labels with highlighting and accessibility */}
          <View style={styles.sliderLabels}>
            {PACE_LEVELS.map(level => (
              <View
                key={level.name}
                style={styles.labelWrapper}
                accessibilityRole="text"
                accessibilityLabel={`Pace level: ${level.label}`}
                accessibilityState={{
                  selected: currentPace.name === level.name,
                }}
              >
                <MotiText
                  style={[
                    styles.sliderLabel,
                    currentPace.name === level.name && styles.sliderLabelActive,
                  ]}
                  animate={{
                    scale: currentPace.name === level.name ? 1.1 : 1,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 150,
                  }}
                >
                  {level.label}
                </MotiText>
              </View>
            ))}
          </View>
        </View>

        {/* Description Card */}
        <MotiView
          key={currentPace.name}
          from={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.descriptionCard}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.descriptionText}>{currentPace.description}</Text>
        </MotiView>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <MotiView
            state={continueButtonAnimation}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 400,
            }}
          >
            <TouchableOpacity
              onPress={handleContinue}
              onPressIn={() => continueButtonAnimation.transitionTo('pressed')}
              onPressOut={() => continueButtonAnimation.transitionTo('from')}
              style={styles.continueButton}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel="Continue to next step"
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
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 36,
    fontFamily: 'System',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 24,
    fontFamily: 'System',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  speedDisplayContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  speedNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: '#320DFF',
    fontFamily: 'System',
    letterSpacing: -2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  speedUnit: {
    fontSize: 28,
    fontWeight: '500',
    color: '#320DFF',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sliderContainer: {
    marginBottom: 40,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'System',
  },
  sliderLabelActive: {
    color: '#320DFF',
    fontWeight: '700',
  },
  labelWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  descriptionCard: {
    backgroundColor: 'rgba(50, 13, 255, 0.05)',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#320DFF',
    fontFamily: 'System',
    textAlign: 'center',
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

export default WeightSpeedScreen;
