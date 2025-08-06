import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface TrialCountdownSheetProps {
  daysLeft: number;
  onUpgrade: () => void;
  onClose: () => void;
}
export const TrialCountdownSheet: React.FC<TrialCountdownSheetProps> = ({
  daysLeft,
  onUpgrade,
  onClose
}) => {
  const isLastDay = daysLeft <= 1;
  return <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      <motion.div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-2xl overflow-hidden" initial={{
      y: '100%'
    }} animate={{
      y: 0
    }} exit={{
      y: '100%'
    }} transition={{
      type: 'spring',
      damping: 30,
      stiffness: 300
    }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <ClockIcon size={20} className={isLastDay ? 'text-red-500' : 'text-[#320DFF] dark:text-[#6D56FF]'} />
              <h2 className="font-bold text-lg text-gray-900 dark:text-white ml-2">
                {isLastDay ? 'Trial Ends Today' : `${daysLeft} Days Left`}
              </h2>
            </div>
            <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={() => {
            hapticFeedback.selection();
            onClose();
          }} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
              <XIcon size={16} className="text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>
          <div className={`p-4 rounded-xl ${isLastDay ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30' : 'bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 border border-[#320DFF]/10 dark:border-[#6D56FF]/20'} mb-4`}>
            <p className={`text-sm ${isLastDay ? 'text-red-600 dark:text-red-400' : 'text-[#320DFF] dark:text-[#6D56FF]'}`}>
              {isLastDay ? 'Your free trial ends today. Subscribe now to keep all premium features and avoid losing access.' : `Your free trial will end in ${daysLeft} days. Upgrade now to continue enjoying all premium features.`}
            </p>
          </div>
          <div className="space-y-4 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Advanced Analytics & Insights
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Unlimited History & Data
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                <div className="w-3 h-3 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Custom Recipe Creation
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="primary" fullWidth onClick={() => {
            hapticFeedback.impact();
            onUpgrade();
          }}>
              {isLastDay ? 'Subscribe Now' : 'Upgrade to Premium'}
            </Button>
            <Button variant="secondary" fullWidth onClick={() => {
            hapticFeedback.selection();
            onClose();
          }}>
              {isLastDay ? 'Remind Me Later' : 'Maybe Later'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>;
};