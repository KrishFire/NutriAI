import React, { useState } from 'react';
import { ArrowLeftIcon, ScaleIcon, SmileIcon, MehIcon, FrownIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { WeightTrendGraph } from './WeightTrendGraph';
import { hapticFeedback } from '../../utils/haptics';
interface WeightCheckInScreenProps {
  onBack: () => void;
  onComplete: () => void;
}
export const WeightCheckInScreen: React.FC<WeightCheckInScreenProps> = ({
  onBack,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'weight' | 'mood' | 'recommendation'>('weight');
  const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'unhappy' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Sample data
  const weightData = [{
    date: 'Mon',
    weight: 165.2
  }, {
    date: 'Tue',
    weight: 164.8
  }, {
    date: 'Wed',
    weight: 164.5
  }, {
    date: 'Thu',
    weight: 164.3
  }, {
    date: 'Fri',
    weight: 164.0
  }, {
    date: 'Sat',
    weight: 163.8
  }, {
    date: 'Sun',
    weight: 163.5
  }];
  const handleNextStep = () => {
    hapticFeedback.selection();
    if (currentStep === 'weight') {
      setCurrentStep('mood');
    } else if (currentStep === 'mood') {
      setCurrentStep('recommendation');
    } else {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onComplete();
      }, 1500);
    }
  };
  const handleSelectMood = (mood: 'happy' | 'neutral' | 'unhappy') => {
    hapticFeedback.selection();
    setSelectedMood(mood);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4" onClick={() => {
          hapticFeedback.selection();
          onBack();
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Weekly Check-In
          </h1>
        </div>
        <div className="px-4 py-4 flex-1">
          {currentStep === 'weight' && <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.3
        }}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                  <ScaleIcon size={24} className="text-[#320DFF] dark:text-[#6D56FF]" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                    Confirm Your Weight
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Let's check your progress for the week
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Current Weight
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white mr-1">
                      163.5
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      lbs
                    </span>
                  </div>
                </div>
                <div className="bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 rounded-lg p-3 mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8L7 12L13 4" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        -1.7 lbs this week
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Great progress! You're on track.
                      </p>
                    </div>
                  </div>
                </div>
                <button className="text-sm text-[#320DFF] dark:text-[#6D56FF] font-medium">
                  Update Weight
                </button>
              </div>
              <WeightTrendGraph data={weightData} startWeight={165.2} currentWeight={163.5} goalWeight={150} unit="lbs" />
            </motion.div>}
          {currentStep === 'mood' && <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.3
        }}>
              <div className="mb-6 text-center">
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  How do you feel about your progress?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your feedback helps us personalize your plan
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.button className={`flex flex-col items-center justify-center p-6 rounded-xl border ${selectedMood === 'happy' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'}`} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => handleSelectMood('happy')}>
                  <div className={`w-16 h-16 rounded-full ${selectedMood === 'happy' ? 'bg-green-100 dark:bg-green-800/30' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center mb-3`}>
                    <SmileIcon size={32} className={selectedMood === 'happy' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'} />
                  </div>
                  <span className={`font-medium ${selectedMood === 'happy' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Happy
                  </span>
                </motion.button>
                <motion.button className={`flex flex-col items-center justify-center p-6 rounded-xl border ${selectedMood === 'neutral' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}`} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => handleSelectMood('neutral')}>
                  <div className={`w-16 h-16 rounded-full ${selectedMood === 'neutral' ? 'bg-blue-100 dark:bg-blue-800/30' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center mb-3`}>
                    <MehIcon size={32} className={selectedMood === 'neutral' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'} />
                  </div>
                  <span className={`font-medium ${selectedMood === 'neutral' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Neutral
                  </span>
                </motion.button>
                <motion.button className={`flex flex-col items-center justify-center p-6 rounded-xl border ${selectedMood === 'unhappy' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800' : 'border-gray-200 dark:border-gray-700'}`} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} onClick={() => handleSelectMood('unhappy')}>
                  <div className={`w-16 h-16 rounded-full ${selectedMood === 'unhappy' ? 'bg-amber-100 dark:bg-amber-800/30' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center mb-3`}>
                    <FrownIcon size={32} className={selectedMood === 'unhappy' ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400'} />
                  </div>
                  <span className={`font-medium ${selectedMood === 'unhappy' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Unhappy
                  </span>
                </motion.button>
              </div>
              {selectedMood === 'unhappy' && <motion.div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4 mb-6" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3
          }}>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Remember that progress isn't always linear. Would you like
                    to discuss adjusting your goals?
                  </p>
                </motion.div>}
            </motion.div>}
          {currentStep === 'recommendation' && <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.3
        }}>
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  Your Weekly Recommendation
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Based on your progress and feedback
                </p>
              </div>
              <div className="bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 border border-[#320DFF]/10 dark:border-[#6D56FF]/20 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 dark:bg-[#6D56FF]/30 flex items-center justify-center mr-3 mt-1">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 4V16M4 10H16" stroke="#320DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-[#6D56FF]" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#320DFF] dark:text-[#6D56FF] mb-1">
                      Plan Update: +80 kcal Daily Target
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      You're losing weight faster than your goal rate. We're
                      adjusting your daily calorie target to ensure sustainable
                      progress.
                    </p>
                    <div className="flex items-center">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#320DFF] dark:bg-[#6D56FF] w-3/4"></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                        1920 → 2000 kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Progress Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Weekly Weight Change
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        -1.7 lbs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Weight Loss
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        -6.5 lbs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Goal Progress
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        43%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Estimated Goal Date
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Oct 15, 2023
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Nutrition Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 6L5 9L10 3" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Great job staying within your protein targets this week.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 2V7M6 10V10.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Consider adding more fiber-rich foods to your diet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="primary" fullWidth onClick={handleNextStep} disabled={currentStep === 'mood' && selectedMood === null} loading={isLoading}>
            {currentStep === 'weight' ? 'Continue' : currentStep === 'mood' ? 'Next' : isLoading ? 'Updating Plan...' : 'Apply Changes & Continue'}
          </Button>
        </div>
      </div>
    </PageTransition>;
};