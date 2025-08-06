import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';
import CustomDatePicker from '../../components/common/CustomDatePicker';

const BirthDateScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData } =
    useOnboarding();

  const [selectedDate, setSelectedDate] = useState(new Date(2005, 0, 1));
  const [backPressed, setBackPressed] = useState(false);
  const [continuePressed, setContinuePressed] = useState(false);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleContinue = () => {
    hapticFeedback.impact();
    // Convert date to the format expected by onboarding flow
    const birthDate = {
      month: (selectedDate.getMonth() + 1).toString(),
      day: selectedDate.getDate().toString(),
      year: selectedDate.getFullYear().toString(),
    };
    updateUserData('birthDate', birthDate);
    goToNextStep();
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
          <Text style={styles.title}>When were you born?</Text>
          <Text style={styles.subtitle}>
            Your age helps us calculate your metabolic rate
          </Text>
        </View>

        {/* Custom Date Picker */}
        <View style={styles.pickerContainer}>
          <CustomDatePicker
            initialDate={selectedDate}
            onDateChange={handleDateChange}
          />
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
  pickerContainer: {
    marginTop: 20,
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
  continueButtonText: {
    fontSize: 13.6,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});

export default BirthDateScreen;
