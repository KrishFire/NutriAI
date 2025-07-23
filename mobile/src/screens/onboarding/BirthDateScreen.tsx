import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';
import PlatformPicker from '../../components/common/PlatformPicker';

const BirthDateScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData } = useOnboarding();
  
  const [birthDate, setBirthDate] = useState({
    month: '1',
    day: '1',
    year: '2000',
  });

  const handleChange = (field: string, value: string | number) => {
    hapticFeedback.selection();
    setBirthDate({
      ...birthDate,
      [field]: value.toString(),
    });
  };

  const handleContinue = () => {
    hapticFeedback.impact();
    updateUserData('birthDate', birthDate);
    goToNextStep();
  };

  const handleBack = () => {
    hapticFeedback.selection();
    goToPreviousStep();
  };

  // Generate options for pickers
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
  }));

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
          <Text style={styles.title}>When were you born?</Text>
          <Text style={styles.subtitle}>
            Your age helps us calculate your metabolic rate
          </Text>
        </View>

        {/* Date Pickers */}
        <View style={styles.pickersContainer}>
          {/* Month Picker */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Month</Text>
            <View style={styles.pickerContainer}>
              <PlatformPicker
                selectedValue={birthDate.month}
                onValueChange={(value) => handleChange('month', value)}
                items={months}
                style={styles.picker}
              />
            </View>
          </View>

          {/* Day Picker */}
          <View style={[styles.pickerWrapper, styles.middlePicker]}>
            <Text style={styles.pickerLabel}>Day</Text>
            <View style={styles.pickerContainer}>
              <PlatformPicker
                selectedValue={birthDate.day}
                onValueChange={(value) => handleChange('day', value)}
                items={days}
                style={styles.picker}
              />
            </View>
          </View>

          {/* Year Picker */}
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Year</Text>
            <View style={styles.pickerContainer}>
              <PlatformPicker
                selectedValue={birthDate.year}
                onValueChange={(value) => handleChange('year', value)}
                items={years}
                style={styles.picker}
              />
            </View>
          </View>
        </View>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            style={styles.continueButton}
            activeOpacity={0.8}
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
  pickersContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 12,
  },
  pickerWrapper: {
    flex: 1,
  },
  middlePicker: {
    marginHorizontal: 6,
  },
  pickerLabel: {
    fontSize: 13.6,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'System',
  },
  pickerContainer: {
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 56,
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