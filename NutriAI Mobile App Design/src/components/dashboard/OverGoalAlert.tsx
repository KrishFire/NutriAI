import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircleIcon, XIcon } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface OverGoalAlertProps {
  amount: number;
  onDismiss: () => void;
}
export const OverGoalAlert: React.FC<OverGoalAlertProps> = ({
  amount,
  onDismiss
}) => {
  return <motion.div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl p-4 mb-4" initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: -20
  }} transition={{
    duration: 0.3
  }}>
      <div className="flex items-start">
        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/40 flex items-center justify-center mr-3 shrink-0">
          <AlertCircleIcon size={18} className="text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1 text-red-700 dark:text-red-400">
            Daily Goal Exceeded
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You're {amount} calories over your daily goal. Consider adjusting
            your next meal or adding some activity.
          </p>
        </div>
        <motion.button className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-800/40 flex items-center justify-center ml-2 shrink-0" onClick={() => {
        hapticFeedback.selection();
        onDismiss();
      }} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.9
      }}>
          <XIcon size={14} className="text-red-600 dark:text-red-400" />
        </motion.button>
      </div>
    </motion.div>;
};