import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
import { Dumbbell, Salad, Calculator, Zap, Brain } from 'lucide-react';
interface NutritionPlanLoadingScreenProps {
  onComplete: () => void;
  userData: any;
}
export const NutritionPlanLoadingScreen: React.FC<NutritionPlanLoadingScreenProps> = ({
  onComplete,
  userData
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const loadingSteps = [{
    text: 'Analyzing your profile data...',
    icon: <Calculator size={24} className="text-[#320DFF]" />
  }, {
    text: 'Calculating optimal macronutrient ratios...',
    icon: <Brain size={24} className="text-[#320DFF]" />
  }, {
    text: 'Personalizing your nutrition plan...',
    icon: <Salad size={24} className="text-[#320DFF]" />
  }, {
    text: 'Optimizing for your activity level...',
    icon: <Dumbbell size={24} className="text-[#320DFF]" />
  }, {
    text: 'Finalizing your personalized plan...',
    icon: <Zap size={24} className="text-[#320DFF]" />
  }];
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
            hapticFeedback.success();
            onComplete();
          }, 500);
        }
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [currentStep, onComplete]);
  return <div className="flex flex-col min-h-screen bg-white p-6 items-center justify-center font-sans">
      <div className="w-full max-w-md">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3">Creating Your Plan</h1>
          <p className="text-gray-600 text-lg">
            We're calculating your personalized nutrition plan
          </p>
        </motion.div>
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
            <motion.div className="h-full bg-[#320DFF] rounded-full" initial={{
            width: 0
          }} animate={{
            width: `${progress}%`
          }} transition={{
            duration: 0.2
          }} />
          </div>
          <div className="text-right text-sm text-gray-500">{progress}%</div>
        </div>
        <div className="space-y-4 mb-8">
          {loadingSteps.map((step, index) => <motion.div key={index} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: index <= currentStep ? 1 : 0.3,
          x: 0
        }} transition={{
          duration: 0.3,
          delay: index * 0.1
        }} className={`flex items-center p-4 rounded-xl ${index === currentStep ? 'bg-[#320DFF]/5 border border-[#320DFF]/20' : ''}`}>
              <div className="mr-4">{step.icon}</div>
              <span className={`${index === currentStep ? 'text-[#320DFF] font-medium' : ''}`}>
                {step.text}
              </span>
              {index < currentStep && <motion.div className="ml-auto text-green-500" initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            type: 'spring'
          }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 10.5L9 12.5L13 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </motion.div>}
            </motion.div>)}
        </div>
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: progress > 75 ? 1 : 0
      }} transition={{
        duration: 0.5
      }} className="text-center text-gray-600">
          Almost there! Your personalized nutrition plan is ready.
        </motion.div>
      </div>
    </div>;
};