import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Tv, HelpCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';
import {
  FacebookLogo,
  InstagramLogo,
  GoogleLogo,
  TikTokLogo,
  YouTubeLogo,
  AppStoreLogo,
} from '../../components/logos';

interface ReferralSource {
  id: string;
  label: string;
  logo?: React.ComponentType<{ size: number; color?: string }>;
  icon?: any;
  color: string;
}

const ReferralSourceScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData } = useOnboarding();
  const [selectedSource, setSelectedSource] = useState('');

  const handleSelect = (source: string) => {
    hapticFeedback.selection();
    setSelectedSource(source);
  };

  const handleContinue = () => {
    if (selectedSource) {
      hapticFeedback.impact();
      updateUserData('referralSource', selectedSource);
      goToNextStep();
    }
  };

  const handleBack = () => {
    hapticFeedback.selection();
    goToPreviousStep();
  };

  const sources: ReferralSource[] = [
    {
      id: 'facebook',
      label: 'Facebook',
      logo: FacebookLogo,
      color: '#1877F2',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      logo: InstagramLogo,
      color: '#E4405F',
    },
    {
      id: 'google',
      label: 'Google',
      logo: GoogleLogo,
      color: '#4285F4',
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      logo: TikTokLogo,
      color: '#000000',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      logo: YouTubeLogo,
      color: '#FF0000',
    },
    {
      id: 'app-store',
      label: 'App Store',
      logo: AppStoreLogo,
      color: '#007AFF',
    },
    {
      id: 'friend',
      label: 'Friend/Family',
      icon: Users,
      color: '#10B981',
    },
    {
      id: 'tv',
      label: 'TV',
      icon: Tv,
      color: '#8B5CF6',
    },
    {
      id: 'other',
      label: 'Other',
      icon: HelpCircle,
      color: '#6B7280',
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
          <Text style={styles.title}>Where did you hear about us?</Text>
          <Text style={styles.subtitle}>
            We'd love to know how you found NutriAI
          </Text>
        </View>

        {/* Source Grid */}
        <View style={styles.gridContainer} testID="referral-grid">
          {sources.map((source, index) => {
            const isSelected = selectedSource === source.id;
            const Logo = source.logo;
            const Icon = source.icon;

            return (
              <MotiView
                key={source.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 50 }}
                style={styles.gridItem}
              >
                <TouchableOpacity
                  onPress={() => handleSelect(source.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  testID={`referral-option-${source.id}`}
                >
                  <View style={styles.logoContainer} testID={`logo-${source.id}`}>
                    {Logo ? (
                      <Logo size={32} color={isSelected ? '#320DFF' : source.color} />
                    ) : Icon ? (
                      <View style={[
                        styles.iconWrapper,
                        isSelected && styles.iconWrapperSelected,
                      ]}>
                        <Icon size={24} color={isSelected ? '#320DFF' : '#6B7280'} />
                      </View>
                    ) : null}
                  </View>
                  <Text style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}>
                    {source.label}
                  </Text>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleContinue}
            style={[
              styles.continueButton,
              !selectedSource && styles.continueButtonDisabled,
            ]}
            activeOpacity={selectedSource ? 0.8 : 1}
            disabled={!selectedSource}
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    width: '31%',
    marginBottom: 16,
  },
  optionButton: {
    height: 112,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  optionButtonSelected: {
    borderColor: '#320DFF',
    backgroundColor: 'rgba(50, 13, 255, 0.05)',
  },
  logoContainer: {
    marginBottom: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperSelected: {
    backgroundColor: 'rgba(50, 13, 255, 0.1)',
  },
  optionLabel: {
    fontSize: 12.8,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'System',
  },
  optionLabelSelected: {
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

export default ReferralSourceScreen;