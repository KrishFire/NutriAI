import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { TrendingDownIcon, CheckCircleIcon } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
import confetti from 'canvas-confetti';
import { Berry } from '../ui/Berry';
interface GoalProgressCelebrationScreenProps {
  onContinue: () => void;
  onSetNewGoal: () => void;
  goalWeight: number;
  startWeight: number;
  currentWeight: number;
  unit: 'lbs' | 'kg';
}
export const GoalProgressCelebrationScreen: React.FC<GoalProgressCelebrationScreenProps> = ({
  onContinue,
  onSetNewGoal,
  goalWeight,
  startWeight,
  currentWeight,
  unit = 'lbs'
}) => {
  const totalLoss = startWeight - currentWeight;
  const percentComplete = Math.min(100, Math.round(totalLoss / (startWeight - goalWeight) * 100));
  useEffect(() => {
    // Trigger haptic feedback on load
    hapticFeedback.success();
    // Trigger confetti animation
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0
    };
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }
    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        }
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div className="mb-8" initial={{
          scale: 0,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}>
            <Berry variant="celebrate" size="large" />
          </motion.div>
          <motion.h1 className="text-3xl font-bold mb-3 text-center text-gray-900 dark:text-white" initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.4,
          duration: 0.5
        }}>
            Goal Achieved!
          </motion.h1>
          <motion.p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs" initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.5,
          duration: 0.5
        }}>
            Congratulations! You've reached your weight goal.
          </motion.p>
          <motion.div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8" initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.6,
          duration: 0.5
        }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Starting Weight
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {startWeight} {unit}
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                  <TrendingDownIcon size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    -{totalLoss.toFixed(1)} {unit}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Loss
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Weight
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentWeight} {unit}
                </p>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">
                  Progress
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {percentComplete}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div className="h-full bg-green-500 dark:bg-green-400 rounded-full" initial={{
                width: 0
              }} animate={{
                width: `${percentComplete}%`
              }} transition={{
                delay: 0.8,
                duration: 1.5
              }}></motion.div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Goal Weight: {goalWeight} {unit}
            </p>
          </motion.div>
          <motion.div className="w-full space-y-4" initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.9,
          duration: 0.5
        }}>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                <div className="w-5 h-5 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                28-day streak maintained
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                <div className="w-5 h-5 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                Healthy weight loss pace achieved
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                <div className="w-5 h-5 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-800 dark:text-gray-200">
                Nutrition balance improved by 45%
              </p>
            </div>
          </motion.div>
        </div>
        <motion.div className="space-y-3 mt-8" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 1.2,
        duration: 0.5
      }}>
          <Button onClick={() => {
          hapticFeedback.impact();
          onSetNewGoal();
        }} variant="primary" fullWidth>
            Set a New Goal
          </Button>
          <Button onClick={() => {
          hapticFeedback.selection();
          onContinue();
        }} variant="secondary" fullWidth>
            Continue with Maintenance
          </Button>
        </motion.div>
      </div>
    </PageTransition>;
};