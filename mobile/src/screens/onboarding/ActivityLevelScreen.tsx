import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Sofa,
  Footprints,
  Bike,
  Zap,
  Flame,
  LucideIcon,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const ActivityLevelScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData } =
    useOnboarding();
  const [selectedLevel, setSelectedLevel] = useState('');
  const [backPressed, setBackPressed] = useState(false);
  const [continuePressed, setContinuePressed] = useState(false);
  const [pressedOption, setPressedOption] = useState<string | null>(null);

  const handleSelect = (level: string) => {
    hapticFeedback.selection();
    setSelectedLevel(level);
  };

  const handleContinue = () => {
    if (selectedLevel) {
      hapticFeedback.impact();
      updateUserData('activityLevel', selectedLevel);
      goToNextStep();
    }
  };

  const handleBack = () => {
    hapticFeedback.selection();
    goToPreviousStep();
  };

  const activityLevels: Array<{
    value: string;
    title: string;
    description: string;
    icon: LucideIcon;
  }> = [
    {
      value: 'sedentary',
      title: 'Sedentary',
      description: 'Little to no exercise',
      icon: Sofa,
    },
    {
      value: 'lightly_active',
      title: 'Lightly Active',
      description: 'Exercise 1-3 days/week',
      icon: Footprints,
    },
    {
      value: 'moderately_active',
      title: 'Moderately Active',
      description: 'Exercise 3-5 days/week',
      icon: Bike,
    },
    {
      value: 'very_active',
      title: 'Very Active',
      description: 'Exercise 6-7 days/week',
      icon: Zap,
    },
    {
      value: 'extra_active',
      title: 'Extra Active',
      description: 'Very hard exercise daily',
      icon: Flame,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            testID="progress-bar-fill"
          />
        </View>

        {/* Title and subtitle */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>How active are you?</Text>
          <Text style={styles.subtitle}>
            This helps us calculate your daily calorie needs
          </Text>
        </View>

        {/* Activity level options */}
        <View style={styles.optionsContainer}>
          {activityLevels.map((level, index) => (
            <MotiView
              key={level.value}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
            >
              <MotiView
                animate={{
                  scale: pressedOption === level.value ? 0.95 : 1,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 400,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleSelect(level.value)}
                  onPressIn={() => setPressedOption(level.value)}
                  onPressOut={() => setPressedOption(null)}
                  activeOpacity={1}
                  style={[
                    styles.optionButton,
                    selectedLevel === level.value &&
                      styles.optionButtonSelected,
                  ]}
                  testID={`activity-option-${level.value}`}
                >
                  <View style={styles.optionContent}>
                    {/* Icon */}
                    <View
                      style={[
                        styles.iconContainer,
                        selectedLevel === level.value &&
                          styles.iconContainerSelected,
                      ]}
                    >
                      <level.icon
                        size={24}
                        color={
                          selectedLevel === level.value ? '#320DFF' : '#6B7280'
                        }
                      />
                    </View>

                    {/* Text content */}
                    <View style={styles.textContent}>
                      <Text
                        style={[
                          styles.optionTitle,
                          selectedLevel === level.value &&
                            styles.optionTitleSelected,
                        ]}
                      >
                        {level.title}
                      </Text>
                      <Text
                        style={[
                          styles.optionDescription,
                          selectedLevel === level.value &&
                            styles.optionDescriptionSelected,
                        ]}
                      >
                        {level.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            </MotiView>
          ))}
        </View>

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
              style={[
                styles.continueButton,
                !selectedLevel && styles.continueButtonDisabled,
              ]}
              activeOpacity={1}
              disabled={!selectedLevel}
              testID="continue-button"
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
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
    marginBottom: 40,
  },
  title: {
    fontSize: 25.5,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 36,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 15.3,
    color: '#6B7280',
    lineHeight: 28,
    fontFamily: 'System',
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    height: 88,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  optionButtonSelected: {
    borderColor: '#320DFF',
    backgroundColor: 'rgba(50, 13, 255, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(50, 13, 255, 0.1)',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 15.3,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'System',
  },
  optionTitleSelected: {
    color: '#320DFF',
  },
  optionDescription: {
    fontSize: 12.8,
    color: '#6B7280',
    fontFamily: 'System',
  },
  optionDescriptionSelected: {
    color: '#6366F1',
  },
  buttonContainer: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  continueButton: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#320DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(50, 13, 255, 0.5)',
  },
  continueButtonText: {
    fontSize: 13.6,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});

export default ActivityLevelScreen;
