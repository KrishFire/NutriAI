import React, { useEffect } from 'react';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
import { Berry } from '../ui/Berry';
interface SuccessScreenProps {
  onComplete: () => void;
}
export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  onComplete
}) => {
  useEffect(() => {
    // Launch confetti
    const duration = 2 * 1000;
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
    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        }
      }));
    }, 250);
    return () => clearInterval(interval);
  }, []);
  // Sample user data
  const userData = {
    dailyCalories: 2000,
    macros: {
      carbs: {
        percentage: 45,
        grams: 225
      },
      protein: {
        percentage: 30,
        grams: 150
      },
      fat: {
        percentage: 25,
        grams: 55
      }
    },
    goal: 'Lose weight',
    firstMilestone: '5 lbs in 5 weeks'
  };
  return <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div className="mb-8" initial={{
        scale: 0.8,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        duration: 0.8
      }}>
          <Berry variant="celebrate" size="large" />
        </motion.div>
        <motion.h1 className="text-3xl font-bold mb-4 text-center" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.2,
        duration: 0.5
      }}>
          You're All Set!
        </motion.h1>
        <motion.p className="text-center text-gray-600 text-lg mb-8" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.3,
        duration: 0.5
      }}>
          Let's log your first meal
        </motion.p>
        <motion.div className="w-full bg-gray-50 rounded-xl p-6 mb-8" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.4,
        duration: 0.5
      }}>
          <h2 className="font-semibold text-lg mb-4">Your Nutrition Plan</h2>
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600 text-sm">Daily Calories</p>
              <p className="text-2xl font-bold">{userData.dailyCalories}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Goal</p>
              <p className="font-medium">{userData.goal}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FFA726] mr-2"></div>
                  <span>Carbs</span>
                </div>
                <span>
                  {userData.macros.carbs.percentage}% (
                  {userData.macros.carbs.grams}g)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#FFA726]" style={{
                width: `${userData.macros.carbs.percentage}%`
              }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#42A5F5] mr-2"></div>
                  <span>Protein</span>
                </div>
                <span>
                  {userData.macros.protein.percentage}% (
                  {userData.macros.protein.grams}g)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#42A5F5]" style={{
                width: `${userData.macros.protein.percentage}%`
              }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#66BB6A] mr-2"></div>
                  <span>Fat</span>
                </div>
                <span>
                  {userData.macros.fat.percentage}% ({userData.macros.fat.grams}
                  g)
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#66BB6A]" style={{
                width: `${userData.macros.fat.percentage}%`
              }}></div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[#320DFF]/5 rounded-xl">
            <p className="text-sm">
              <span className="font-medium">First milestone:</span>{' '}
              {userData.firstMilestone}
            </p>
          </div>
        </motion.div>
      </div>
      <motion.div initial={{
      y: 20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      delay: 0.6,
      duration: 0.5
    }}>
        <Button onClick={() => {
        hapticFeedback.impact();
        onComplete();
      }} variant="primary" fullWidth>
          Start Tracking
        </Button>
      </motion.div>
    </div>;
};