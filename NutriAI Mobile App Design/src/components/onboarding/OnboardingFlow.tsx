import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingCarousel } from './OnboardingCarousel';
import { AuthScreen } from './AuthScreen';
import { GenderSelectionScreen } from './GenderSelectionScreen';
import { ActivityLevelScreen } from './ActivityLevelScreen';
import { ReferralSourceScreen } from './ReferralSourceScreen';
import { HeightWeightScreen } from './HeightWeightScreen';
import { BirthDateScreen } from './BirthDateScreen';
import { GoalSelectionScreen } from './GoalSelectionScreen';
import { TargetWeightScreen } from './TargetWeightScreen';
import { WeightSpeedScreen } from './WeightSpeedScreen';
import { DietaryPreferencesScreen } from './DietaryPreferencesScreen';
import { GoalAccomplishmentScreen } from './GoalAccomplishmentScreen';
import { PersonalInfoScreen } from './PersonalInfoScreen';
import { GoalsScreen } from './GoalsScreen';
import { MacroTargetsScreen } from './MacroTargetsScreen';
import { NotificationsPermissionScreen } from './NotificationsPermissionScreen';
import { SuccessScreen } from './SuccessScreen';
import { TutorialOverlay } from './TutorialOverlay';
import { hapticFeedback } from '../../utils/haptics';
import { ReferralCodeScreen } from './ReferralCodeScreen';
import { WeightTransitionScreen } from './WeightTransitionScreen';
import { NutritionPlanLoadingScreen } from './NutritionPlanLoadingScreen';
import { SubscriptionScreen } from './SubscriptionScreen';
interface OnboardingFlowProps {
  onComplete: () => void;
}
// Define the order of steps to calculate progress percentage
const ONBOARDING_STEPS = ['carousel', 'gender', 'activity', 'referral-source', 'height-weight', 'birth-date', 'goal-selection', 'target-weight', 'weight-speed', 'weight-transition', 'dietary', 'goal-accomplishment', 'referral-code', 'nutrition-loading', 'macros', 'auth', 'subscription', 'notifications', 'success'];
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<string>('carousel');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [showTutorial, setShowTutorial] = useState(false);
  const [userData, setUserData] = useState({
    gender: '',
    activityLevel: '',
    referralSource: '',
    height: {
      feet: '',
      inches: '',
      cm: ''
    },
    weight: {
      value: '',
      unit: 'lbs'
    },
    birthDate: {
      month: '',
      day: '',
      year: ''
    },
    goal: '',
    targetWeight: {
      value: '',
      unit: 'lbs'
    },
    weightSpeed: 1.0,
    dietPreference: '',
    goalAccomplishments: [],
    referralCode: '',
    referralCodeValid: false
  });
  // Calculate progress percentage based on current step
  const getProgressPercentage = (step: string) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(step);
    if (currentIndex === -1) return 0;
    return Math.round(currentIndex / (ONBOARDING_STEPS.length - 1) * 100);
  };
  const updateUserData = (field: string, value: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const transitionToStep = (step: string) => {
    hapticFeedback.selection();
    setCurrentStep(step);
  };
  const handleCarouselComplete = () => {
    transitionToStep('gender');
  };
  const handleGenderComplete = (gender: string) => {
    updateUserData('gender', gender);
    transitionToStep('activity');
  };
  const handleActivityComplete = (activity: string) => {
    updateUserData('activityLevel', activity);
    transitionToStep('referral-source');
  };
  const handleReferralSourceComplete = (source: string) => {
    updateUserData('referralSource', source);
    transitionToStep('height-weight');
  };
  const handleHeightWeightComplete = (height: any, weight: any) => {
    updateUserData('height', height);
    updateUserData('weight', weight);
    transitionToStep('birth-date');
  };
  const handleBirthDateComplete = (date: any) => {
    updateUserData('birthDate', date);
    transitionToStep('goal-selection');
  };
  const handleGoalSelectionComplete = (goal: string) => {
    updateUserData('goal', goal);
    if (goal === 'maintain') {
      transitionToStep('dietary');
    } else {
      transitionToStep('target-weight');
    }
  };
  const handleTargetWeightComplete = (targetWeight: any) => {
    updateUserData('targetWeight', targetWeight);
    transitionToStep('weight-speed');
  };
  const handleWeightSpeedComplete = (speed: number) => {
    updateUserData('weightSpeed', speed);
    transitionToStep('weight-transition');
  };
  const handleWeightTransitionComplete = () => {
    transitionToStep('dietary');
  };
  const handleDietaryComplete = (diet: string) => {
    updateUserData('dietPreference', diet);
    transitionToStep('goal-accomplishment');
  };
  const handleGoalAccomplishmentComplete = (goals: string[]) => {
    updateUserData('goalAccomplishments', goals);
    transitionToStep('referral-code');
  };
  const handleReferralCodeComplete = (code: string, isValid: boolean) => {
    updateUserData('referralCode', code);
    updateUserData('referralCodeValid', isValid);
    transitionToStep('nutrition-loading');
  };
  const handleNutritionLoadingComplete = () => {
    transitionToStep('macros');
  };
  const handleMacrosComplete = () => {
    transitionToStep('auth');
  };
  const handleAuthComplete = () => {
    transitionToStep('subscription');
  };
  const handleSubscriptionComplete = () => {
    transitionToStep('notifications');
  };
  const handleNotificationsComplete = () => {
    transitionToStep('success');
  };
  const handleSuccessComplete = () => {
    hapticFeedback.success();
    setShowTutorial(true);
    onComplete();
  };
  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };
  const handleToggleAuthMode = () => {
    hapticFeedback.selection();
    setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
  };
  const pageVariants = {
    initial: {
      opacity: 0,
      x: 100
    },
    animate: {
      opacity: 1,
      x: 0
    },
    exit: {
      opacity: 0,
      x: -100
    }
  };
  return <>
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: 0.3
      }} className="font-sans">
          {currentStep === 'carousel' && <OnboardingCarousel onComplete={handleCarouselComplete} onSkip={handleCarouselComplete} />}
          {currentStep === 'gender' && <GenderSelectionScreen onBack={() => transitionToStep('carousel')} onNext={handleGenderComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'activity' && <ActivityLevelScreen onBack={() => transitionToStep('gender')} onNext={handleActivityComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'referral-source' && <ReferralSourceScreen onBack={() => transitionToStep('activity')} onNext={handleReferralSourceComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'height-weight' && <HeightWeightScreen onBack={() => transitionToStep('referral-source')} onNext={handleHeightWeightComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'birth-date' && <BirthDateScreen onBack={() => transitionToStep('height-weight')} onNext={handleBirthDateComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'goal-selection' && <GoalSelectionScreen onBack={() => transitionToStep('birth-date')} onNext={handleGoalSelectionComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'target-weight' && <TargetWeightScreen onBack={() => transitionToStep('goal-selection')} onNext={handleTargetWeightComplete} currentWeight={userData.weight} goal={userData.goal} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'weight-speed' && <WeightSpeedScreen onBack={() => transitionToStep('target-weight')} onNext={handleWeightSpeedComplete} goal={userData.goal} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'weight-transition' && <WeightTransitionScreen onBack={() => transitionToStep('weight-speed')} onNext={handleWeightTransitionComplete} goal={userData.goal} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'dietary' && <DietaryPreferencesScreen onBack={() => userData.goal === 'maintain' ? transitionToStep('goal-selection') : transitionToStep('weight-transition')} onNext={handleDietaryComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'goal-accomplishment' && <GoalAccomplishmentScreen onBack={() => transitionToStep('dietary')} onNext={handleGoalAccomplishmentComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'referral-code' && <ReferralCodeScreen onBack={() => transitionToStep('goal-accomplishment')} onNext={handleReferralCodeComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'nutrition-loading' && <NutritionPlanLoadingScreen onComplete={handleNutritionLoadingComplete} userData={userData} />}
          {currentStep === 'macros' && <MacroTargetsScreen onBack={() => transitionToStep('nutrition-loading')} onComplete={handleMacrosComplete} userData={userData} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'auth' && <AuthScreen mode={authMode} onBack={() => transitionToStep('macros')} onComplete={handleAuthComplete} onToggleMode={handleToggleAuthMode} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'subscription' && <SubscriptionScreen onBack={() => transitionToStep('auth')} onComplete={handleSubscriptionComplete} hasReferralCode={userData.referralCodeValid} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'notifications' && <NotificationsPermissionScreen onBack={() => transitionToStep('subscription')} onAllow={handleNotificationsComplete} onSkip={handleNotificationsComplete} progress={getProgressPercentage(currentStep)} />}
          {currentStep === 'success' && <SuccessScreen onComplete={handleSuccessComplete} />}
        </motion.div>
      </AnimatePresence>
      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
    </>;
};