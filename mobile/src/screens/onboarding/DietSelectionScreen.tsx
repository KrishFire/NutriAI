import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Utensils,
  Leaf,
  Vegan,
  Fish,
  Flame,
  Beef,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Diet options configuration
const DIET_OPTIONS = [
  {
    id: 'none',
    label: 'No Restrictions',
    description: 'Standard balanced diet',
    icon: Utensils,
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    description: 'No meat, fish allowed',
    icon: Leaf,
  },
  {
    id: 'vegan',
    label: 'Vegan',
    description: 'No animal products',
    icon: Vegan,
  },
  {
    id: 'pescatarian',
    label: 'Pescatarian',
    description: 'Vegetarian + seafood',
    icon: Fish,
  },
  {
    id: 'keto',
    label: 'Keto',
    description: 'Low carb, high fat',
    icon: Flame,
  },
  {
    id: 'paleo',
    label: 'Paleo',
    description: 'Whole foods based diet',
    icon: Beef,
  },
];

const DietSelectionScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData, userData } =
    useOnboarding();
  const [selectedDiet, setSelectedDiet] = useState(userData?.diet || 'none');

  const handleDietSelect = (dietId: string) => {
    hapticFeedback.selection();
    setSelectedDiet(dietId);
  };

  const handleContinue = () => {
    hapticFeedback.impact();
    updateUserData('diet', selectedDiet);
    goToNextStep();
  };

  const handleBack = () => {
    hapticFeedback.selection();
    goToPreviousStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            />
          </View>

          {/* Title and subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Do you follow a specific diet?</Text>
            <Text style={styles.subtitle}>
              We'll customize your meal recommendations
            </Text>
          </View>

          {/* Diet options grid */}
          <View style={styles.optionsGrid}>
            {DIET_OPTIONS.map((diet, index) => {
              const isSelected = selectedDiet === diet.id;
              const Icon = diet.icon;

              return (
                <MotiView
                  key={diet.id}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    delay: index * 50,
                    damping: 15,
                    stiffness: 400,
                  }}
                  style={styles.optionWrapper}
                >
                  <TouchableOpacity
                    onPress={() => handleDietSelect(diet.id)}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <MotiView
                      animate={{
                        scale: isSelected ? 1.1 : 1,
                      }}
                      transition={{
                        type: 'spring',
                        damping: 15,
                        stiffness: 400,
                      }}
                    >
                      <Icon
                        size={28}
                        color={isSelected ? '#320DFF' : '#6B7280'}
                      />
                    </MotiView>

                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {diet.label}
                    </Text>

                    <Text
                      style={[
                        styles.optionDescription,
                        isSelected && styles.optionDescriptionSelected,
                      ]}
                    >
                      {diet.description}
                    </Text>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Continue button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleContinue}
              style={styles.continueButton}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              You can change this anytime in settings
            </Text>
          </View>
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
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  optionWrapper: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 140,
    justifyContent: 'center',
  },
  optionCardSelected: {
    borderColor: '#320DFF',
    borderWidth: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#320DFF',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  optionDescriptionSelected: {
    // Keep the same gray color when selected
    color: '#6B7280',
  },
  buttonContainer: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#320DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default DietSelectionScreen;
