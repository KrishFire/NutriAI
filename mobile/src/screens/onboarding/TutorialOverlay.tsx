import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TutorialStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const TutorialOverlay = () => {
  const { goToNextStep } = useOnboarding();

  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      target: 'quick-log-button',
      title: 'Log Your Meals',
      description: 'Tap here to quickly log what you eat',
      position: 'bottom',
      highlightArea: {
        x: screenWidth / 2 - 35,
        y: screenHeight - 150,
        width: 70,
        height: 70,
      },
    },
    {
      target: 'progress-rings',
      title: 'Track Your Progress',
      description: 'Monitor your daily nutrition goals',
      position: 'bottom',
      highlightArea: {
        x: 20,
        y: 100,
        width: screenWidth - 40,
        height: 200,
      },
    },
    {
      target: 'streak-badge',
      title: 'Build Healthy Habits',
      description: 'Keep your streak going by logging daily',
      position: 'bottom',
      highlightArea: {
        x: screenWidth - 80,
        y: 50,
        width: 60,
        height: 60,
      },
    },
  ];

  const handleNext = () => {
    hapticFeedback.selection();
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    handleComplete();
  };

  const handleComplete = () => {
    hapticFeedback.impact();
    goToNextStep();
  };

  const step = tutorialSteps[currentStep];

  // Calculate tooltip position based on highlight area and position
  const getTooltipPosition = () => {
    if (!step.highlightArea) {
      return { top: screenHeight / 2 - 100, left: 20, right: 20 };
    }

    const { x, y, width, height } = step.highlightArea;
    const tooltipWidth = screenWidth - 40;
    const tooltipHeight = 140;

    switch (step.position) {
      case 'top':
        return {
          top: y - tooltipHeight - 20,
          left: 20,
          right: 20,
        };
      case 'bottom':
        return {
          top: y + height + 20,
          left: 20,
          right: 20,
        };
      default:
        return {
          top: screenHeight / 2 - 100,
          left: 20,
          right: 20,
        };
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} className="bg-black/70 z-50">
      {/* Highlight Area */}
      {step.highlightArea && (
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={{
            position: 'absolute',
            ...step.highlightArea,
            borderRadius: step.highlightArea.width / 2,
            borderWidth: 3,
            borderColor: '#320DFF',
            backgroundColor: 'transparent',
          }}
        />
      )}

      {/* Tooltip */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200 }}
        style={{
          position: 'absolute',
          ...getTooltipPosition(),
        }}
      >
        <View className="bg-white rounded-xl p-4 shadow-lg">
          <Text className="font-bold text-lg mb-2">{step.title}</Text>
          <Text className="text-gray-600 mb-4">{step.description}</Text>

          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={handleSkip}>
              <Text className="text-gray-500">Skip</Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              {/* Step indicators */}
              <View className="flex-row mr-4">
                {tutorialSteps.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full mx-0.5 ${
                      index === currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={handleNext}
                className="bg-primary px-4 py-2 rounded-full"
              >
                <Text className="text-white font-medium">
                  {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Done'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </MotiView>
    </View>
  );
};

export default TutorialOverlay;
