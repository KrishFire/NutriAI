import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Scale,
  Check,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: any;
}

const goalOptions: GoalOption[] = [
  {
    id: 'lose',
    title: 'Lose weight',
    description: 'Drop pounds and feel lighter',
    icon: TrendingDown,
  },
  {
    id: 'maintain',
    title: 'Maintain weight',
    description: 'Stay at your current weight',
    icon: Scale,
  },
  {
    id: 'gain',
    title: 'Gain weight',
    description: 'Build muscle and strength',
    icon: TrendingUp,
  },
];

const GoalSelectionScreen = () => {
  const { goToPreviousStep, goToNextStep, updateUserData, progress } =
    useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState('');
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [continuePressed, setContinuePressed] = useState(false);

  const handleSelect = (goal: string) => {
    hapticFeedback.selection();
    setSelectedGoal(goal);
    updateUserData('goal', goal);
  };

  const handleContinue = () => {
    if (selectedGoal) {
      hapticFeedback.impact();
      goToNextStep();
    }
  };

  const handleBack = () => {
    hapticFeedback.selection();
    goToPreviousStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#000" />
          </TouchableOpacity>
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
          <Text style={styles.title}>What's your goal?</Text>
          <Text style={styles.subtitle}>We'll help you achieve it</Text>
        </View>

        {/* Goal options */}
        <View style={styles.optionsContainer}>
          {goalOptions.map((option, index) => {
            const isSelected = selectedGoal === option.id;
            const Icon = option.icon;

            return (
              <MotiView
                key={option.id}
                from={{ opacity: 0, translateY: 20, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                transition={{
                  type: 'spring',
                  delay: index * 100,
                  damping: 15,
                }}
              >
                <MotiView
                  animate={{
                    scale: isSelected ? 1 : 1,
                    shadowOpacity: isSelected ? 0.15 : 0,
                    shadowRadius: isSelected ? 8 : 0,
                    elevation: isSelected ? 4 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    damping: 20,
                    stiffness: 300,
                  }}
                  style={styles.cardWrapper}
                >
                  <TouchableOpacity
                    onPress={() => handleSelect(option.id)}
                    onPressIn={() => setPressedCard(option.id)}
                    onPressOut={() => setPressedCard(null)}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    activeOpacity={1}
                  >
                    <MotiView
                      animate={{
                        scale: pressedCard === option.id ? 0.95 : 1,
                      }}
                      transition={{
                        type: 'spring',
                        damping: 15,
                        stiffness: 400,
                      }}
                    >
                      <View style={styles.optionContent}>
                        <MotiView
                          animate={{
                            scale: isSelected ? 1.1 : 1,
                            backgroundColor: isSelected ? '#EEF2FF' : '#F3F4F6',
                          }}
                          transition={{
                            type: 'spring',
                            damping: 20,
                            stiffness: 300,
                          }}
                          style={styles.iconContainer}
                        >
                          <Icon
                            size={24}
                            color={isSelected ? '#320DFF' : '#6B7280'}
                          />
                        </MotiView>
                        <View style={styles.textContainer}>
                          <Text
                            style={[
                              styles.optionTitle,
                              isSelected && styles.optionTitleSelected,
                            ]}
                          >
                            {option.title}
                          </Text>
                          <Text style={styles.optionDescription}>
                            {option.description}
                          </Text>
                        </View>
                        <MotiView
                          animate={{
                            opacity: isSelected ? 1 : 0,
                            scale: isSelected ? 1 : 0.5,
                          }}
                          transition={{
                            type: 'spring',
                            damping: 20,
                            stiffness: 300,
                          }}
                          style={styles.checkContainer}
                        >
                          <Check size={20} color="#320DFF" />
                        </MotiView>
                      </View>
                    </MotiView>
                  </TouchableOpacity>
                </MotiView>
              </MotiView>
            );
          })}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

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
                !selectedGoal && styles.continueButtonDisabled,
              ]}
              activeOpacity={1}
              disabled={!selectedGoal}
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
    gap: 16,
  },
  cardWrapper: {
    shadowColor: '#320DFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  optionCardSelected: {
    borderColor: '#320DFF',
    backgroundColor: '#F5F3FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'System',
  },
  optionTitleSelected: {
    color: '#320DFF',
  },
  optionDescription: {
    fontSize: 13.6,
    color: '#6B7280',
    fontFamily: 'System',
  },
  checkContainer: {
    width: 24,
    height: 24,
    marginLeft: 12,
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
    backgroundColor: '#E5E7EB',
  },
  continueButtonText: {
    fontSize: 13.6,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});

export default GoalSelectionScreen;
