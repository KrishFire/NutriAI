import React from 'react';
import { LockIcon, StarIcon, SparklesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface TrialExpiredScreenProps {
  onUpgrade: () => void;
  onRestore: () => void;
}
export const TrialExpiredScreen: React.FC<TrialExpiredScreenProps> = ({
  onUpgrade,
  onRestore
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const handleUpgrade = () => {
    hapticFeedback.impact();
    onUpgrade();
  };
  const handleRestore = () => {
    hapticFeedback.selection();
    onRestore();
  };
  return <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 justify-center items-center p-6">
        <motion.div className="w-24 h-24 bg-[#320DFF] dark:bg-[#6D56FF] rounded-full flex items-center justify-center mb-8" initial={{
        scale: 0.8,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}>
          <LockIcon size={48} className="text-white" />
        </motion.div>
        <motion.div className="text-center mb-10" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Free Trial Has Ended
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Upgrade to Premium to continue tracking your nutrition and accessing
            all features
          </p>
        </motion.div>
        <motion.div className="w-full max-w-xs mb-10" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">
                Premium Features
              </h2>
              <div className="flex">
                {[...Array(3)].map((_, i) => <motion.div key={i} className="w-4 h-4 ml-0.5" initial={{
                rotate: 0
              }} animate={{
                rotate: 360
              }} transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
                delay: i * 0.2,
                ease: 'linear'
              }}>
                    <StarIcon size={16} className="text-[#320DFF] dark:text-[#6D56FF]" />
                  </motion.div>)}
              </div>
            </div>
            <div className="space-y-3">
              {['AI-powered food recognition', 'Detailed nutrition insights', 'Custom meal plans', 'Unlimited food logging', 'Progress tracking'].map((feature, index) => <motion.div key={index} className="flex items-center" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 0.4 + index * 0.1
            }}>
                  <div className="w-5 h-5 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3 flex-shrink-0">
                    <SparklesIcon size={12} className="text-[#320DFF] dark:text-[#6D56FF]" />
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {feature}
                  </p>
                </motion.div>)}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Monthly
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  $4.99/month
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
                    Annual
                  </span>
                  <span className="text-xs bg-[#320DFF] dark:bg-[#6D56FF] text-white px-1.5 py-0.5 rounded">
                    SAVE 15%
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  $49.99/year
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div className="w-full max-w-xs" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.8
      }}>
          <Button variant="primary" fullWidth onClick={handleUpgrade} className="mb-3">
            Upgrade to Premium
          </Button>
          <button className="w-full text-center text-[#320DFF] dark:text-[#6D56FF] text-sm font-medium" onClick={handleRestore}>
            Restore Purchase
          </button>
        </motion.div>
      </div>
    </PageTransition>;
};