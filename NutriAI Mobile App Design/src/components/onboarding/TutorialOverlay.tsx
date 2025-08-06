import React, { useState } from 'react';
import { Button } from '../ui/Button';
interface TutorialStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}
interface TutorialOverlayProps {
  onComplete: () => void;
}
export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialSteps: TutorialStep[] = [{
    target: 'quick-log-button',
    title: 'Log Your Meals',
    description: 'Tap here to quickly log what you eat',
    position: 'bottom'
  }, {
    target: 'progress-rings',
    title: 'Track Your Progress',
    description: 'Monitor your daily nutrition goals',
    position: 'bottom'
  }, {
    target: 'streak-badge',
    title: 'Build Healthy Habits',
    description: 'Keep your streak going by logging daily',
    position: 'bottom'
  }];
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  const step = tutorialSteps[currentStep];
  return <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* This would be positioned dynamically based on the target element */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white rounded-xl p-4 w-64 shadow-lg">
            <h3 className="font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{step.description}</p>
            <div className="flex justify-between">
              <button className="text-sm text-gray-500" onClick={onComplete}>
                Skip
              </button>
              <button className="text-sm font-medium text-[#320DFF]" onClick={handleNext}>
                {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};