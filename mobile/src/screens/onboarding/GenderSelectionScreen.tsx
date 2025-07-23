import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const GenderSelectionScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState('');

  const handleSelect = (gender: string) => {
    hapticFeedback.selection();
    setSelectedGender(gender);
  };

  const handleContinue = () => {
    if (selectedGender) {
      hapticFeedback.impact();
      updateUserData('gender', selectedGender);
      goToNextStep();
    }
  };

  const handleBack = () => {
    hapticFeedback.selection();
    goToPreviousStep();
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            This helps us calculate your metabolic rate
          </Text>
        </View>

        {/* Gender options */}
        <View style={styles.optionsContainer}>
          {genderOptions.map((option, index) => (
            <MotiView
              key={option.value}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
                style={[
                  styles.optionButton,
                  selectedGender === option.value && styles.optionButtonSelected,
                ]}
                testID={`gender-option-${option.value}`}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedGender === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            style={[
              styles.continueButton,
              !selectedGender && styles.continueButtonDisabled,
            ]}
            activeOpacity={selectedGender ? 0.8 : 1}
            disabled={!selectedGender}
            testID="continue-button"
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
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
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionButtonSelected: {
    borderColor: '#320DFF',
    backgroundColor: 'rgba(50, 13, 255, 0.05)',
  },
  optionText: {
    fontSize: 15.3,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'System',
  },
  optionTextSelected: {
    color: '#320DFF',
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

export default GenderSelectionScreen;