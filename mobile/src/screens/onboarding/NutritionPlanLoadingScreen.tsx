import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import {
  Calculator,
  Brain,
  Salad,
  Activity as Dumbbell,
  Zap,
} from 'lucide-react-native';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const { width: screenWidth } = Dimensions.get('window');

const NutritionPlanLoadingScreen = () => {
  const { goToNextStep, userData } = useOnboarding();

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    {
      text: 'Analyzing your profile data...',
      icon: Calculator,
    },
    {
      text: 'Calculating optimal macronutrient ratios...',
      icon: Brain,
    },
    {
      text: 'Personalizing your nutrition plan...',
      icon: Salad,
    },
    {
      text: 'Optimizing for your activity level...',
      icon: Dumbbell,
    },
    {
      text: 'Finalizing your personalized plan...',
      icon: Zap,
    },
  ];

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;

        // Update current step based on progress
        if (newProgress % 20 === 0 && currentStep < loadingSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
          hapticFeedback.selection();
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            hapticFeedback.impact();
            goToNextStep();
          }, 500);
        }

        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep, goToNextStep]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-md">
          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            className="mb-10 items-center"
          >
            <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
              Creating Your Plan
            </Text>
            <Text className="text-gray-600 text-lg text-center">
              We're calculating your personalized nutrition plan
            </Text>
          </MotiView>

          {/* Progress Bar */}
          <View className="mb-8">
            <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
              <MotiView
                from={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'timing', duration: 200 }}
                className="h-full bg-primary rounded-full"
              />
            </View>
            <Text className="text-right text-sm text-gray-500">
              {progress}%
            </Text>
          </View>

          {/* Loading Steps */}
          <View className="mb-8">
            {loadingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <MotiView
                  key={index}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{
                    opacity: index <= currentStep ? 1 : 0.3,
                    translateX: 0,
                  }}
                  transition={{ delay: index * 100 }}
                  className="mb-4"
                >
                  <View
                    className={`flex-row items-center p-4 rounded-xl ${
                      isActive ? 'bg-primary/5 border border-primary/20' : ''
                    }`}
                  >
                    <View className="mr-4">
                      <Icon
                        size={24}
                        color={isActive ? '#320DFF' : '#9CA3AF'}
                      />
                    </View>
                    <Text
                      className={`flex-1 ${
                        isActive ? 'text-primary font-medium' : 'text-gray-600'
                      }`}
                    >
                      {step.text}
                    </Text>
                    {isCompleted && (
                      <MotiView
                        from={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                          <Text className="text-white text-xs font-bold">
                            ✓
                          </Text>
                        </View>
                      </MotiView>
                    )}
                  </View>
                </MotiView>
              );
            })}
          </View>

          {/* Almost Done Text */}
          <MotiView
            animate={{ opacity: progress > 75 ? 1 : 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <Text className="text-center text-gray-600">
              Almost there! Your personalized nutrition plan is ready.
            </Text>
          </MotiView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NutritionPlanLoadingScreen;
