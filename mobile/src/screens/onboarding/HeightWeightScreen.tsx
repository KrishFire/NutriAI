import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const HeightWeightScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData } =
    useOnboarding();
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weight, setWeight] = useState('');
  const [isMetric, setIsMetric] = useState(false);
  const [backPressed, setBackPressed] = useState(false);
  const [continuePressed, setContinuePressed] = useState(false);
  const [imperialPressed, setImperialPressed] = useState(false);
  const [metricPressed, setMetricPressed] = useState(false);

  const handleContinue = () => {
    if (isMetric) {
      if (heightCm && weight) {
        hapticFeedback.impact();
        updateUserData('height', { feet: '', inches: '', cm: heightCm });
        updateUserData('weight', { value: weight, unit: 'kg' });
        goToNextStep();
      }
    } else {
      if (heightFeet && heightInches && weight) {
        hapticFeedback.impact();
        updateUserData('height', {
          feet: heightFeet,
          inches: heightInches,
          cm: '',
        });
        updateUserData('weight', { value: weight, unit: 'lbs' });
        goToNextStep();
      }
    }
  };

  const handleBack = () => {
    hapticFeedback.selection();
    goToPreviousStep();
  };

  const handleUnitToggle = (metric: boolean) => {
    hapticFeedback.selection();
    setIsMetric(metric);
    // Clear inputs when switching units
    setHeightFeet('');
    setHeightInches('');
    setHeightCm('');
    setWeight('');
  };

  const handleNumericInput = (
    text: string,
    setter: (value: string) => void
  ) => {
    // Only allow numeric input
    const numericValue = text.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  const canContinue = isMetric
    ? heightCm && weight
    : heightFeet && heightInches && weight;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.title}>Your height and weight</Text>
            <Text style={styles.subtitle}>
              This helps us calculate your nutritional needs
            </Text>
          </View>

          {/* Unit Toggle */}
          <View style={styles.unitToggleContainer}>
            <TouchableOpacity
              onPress={() => handleUnitToggle(false)}
              onPressIn={() => setImperialPressed(true)}
              onPressOut={() => setImperialPressed(false)}
              style={[styles.unitToggle, !isMetric && styles.unitToggleActive]}
              activeOpacity={1}
              testID="unit-toggle-imperial"
            >
              <MotiView
                animate={{
                  scale: imperialPressed ? 0.95 : 1,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 400,
                }}
              >
                <Text
                  style={[
                    styles.unitToggleText,
                    !isMetric && styles.unitToggleTextActive,
                  ]}
                >
                  Imperial
                </Text>
              </MotiView>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleUnitToggle(true)}
              onPressIn={() => setMetricPressed(true)}
              onPressOut={() => setMetricPressed(false)}
              style={[styles.unitToggle, isMetric && styles.unitToggleActive]}
              activeOpacity={1}
              testID="unit-toggle-metric"
            >
              <MotiView
                animate={{
                  scale: metricPressed ? 0.95 : 1,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 400,
                }}
              >
                <Text
                  style={[
                    styles.unitToggleText,
                    isMetric && styles.unitToggleTextActive,
                  ]}
                >
                  Metric
                </Text>
              </MotiView>
            </TouchableOpacity>
          </View>

          {/* Height Input */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
          >
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Height</Text>
              {isMetric ? (
                <View style={styles.singleInputContainer}>
                  <TextInput
                    value={heightCm}
                    onChangeText={text => handleNumericInput(text, setHeightCm)}
                    placeholder="173"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    style={styles.textInput}
                    maxLength={3}
                  />
                  <Text style={styles.unitLabel}>cm</Text>
                </View>
              ) : (
                <View style={styles.doubleInputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={heightFeet}
                      onChangeText={text =>
                        handleNumericInput(text, setHeightFeet)
                      }
                      placeholder="5"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      style={styles.textInput}
                      maxLength={1}
                    />
                    <Text style={styles.unitLabel}>ft</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={heightInches}
                      onChangeText={text =>
                        handleNumericInput(text, setHeightInches)
                      }
                      placeholder="8"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      style={styles.textInput}
                      maxLength={2}
                    />
                    <Text style={styles.unitLabel}>in</Text>
                  </View>
                </View>
              )}
            </View>
          </MotiView>

          {/* Weight Input */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
          >
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Weight</Text>
              <View style={styles.singleInputContainer}>
                <TextInput
                  value={weight}
                  onChangeText={text => handleNumericInput(text, setWeight)}
                  placeholder={isMetric ? '68' : '150'}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  style={styles.textInput}
                  maxLength={3}
                />
                <Text style={styles.unitLabel}>{isMetric ? 'kg' : 'lbs'}</Text>
              </View>
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
                style={[
                  styles.continueButton,
                  !canContinue && styles.continueButtonDisabled,
                ]}
                activeOpacity={1}
                disabled={!canContinue}
                testID="continue-button"
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
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
    marginBottom: 32,
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
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  unitToggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  unitToggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unitToggleText: {
    fontSize: 13.6,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'System',
  },
  unitToggleTextActive: {
    color: '#320DFF',
  },
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 15.3,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'System',
  },
  singleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doubleInputContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
  },
  unitLabel: {
    fontSize: 15.3,
    fontWeight: '500',
    color: '#6B7280',
    minWidth: 30,
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

export default HeightWeightScreen;
