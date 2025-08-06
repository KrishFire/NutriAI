import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { CheckCircleIcon, ZapIcon } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
import confetti from 'canvas-confetti';
import { Berry } from '../ui/Berry';
interface SubscriptionSuccessScreenProps {
  onContinue: () => void;
}
export const SubscriptionSuccessScreen: React.FC<SubscriptionSuccessScreenProps> = ({
  onContinue
}) => {
  useEffect(() => {
    // Trigger haptic feedback on load
    hapticFeedback.success();
    // Trigger confetti animation
    const duration = 3 * 1000;
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
            Welcome to Premium!
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
            You now have unlimited access to all premium features.
          </motion.p>
          <motion.div className="w-full space-y-4 mb-8" initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.6,
          duration: 0.5
        }}>
            {['Advanced Analytics & Insights', 'Unlimited History & Data', 'Cloud Backup & Sync', 'Custom Recipe Creation', 'Priority Support'].map((feature, index) => <motion.div key={index} className="flex items-center" initial={{
            x: -20,
            opacity: 0
          }} animate={{
            x: 0,
            opacity: 1
          }} transition={{
            delay: 0.7 + index * 0.1
          }}>
                <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-4">
                  <ZapIcon size={20} className="text-[#320DFF] dark:text-[#6D56FF]" />
                </div>
                <p className="text-gray-800 dark:text-gray-200">{feature}</p>
              </motion.div>)}
          </motion.div>
        </div>
        <motion.div initial={{
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
          onContinue();
        }} variant="primary" fullWidth>
            Continue to App
          </Button>
        </motion.div>
      </div>
    </PageTransition>;
};