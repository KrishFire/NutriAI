import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { XIcon, ZapIcon } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
import { Berry } from '../ui/Berry';
interface StreakBreakModalProps {
  streakDays: number;
  onUseToken: () => void;
  onClose: () => void;
  tokensAvailable: number;
}
export const StreakBreakModal: React.FC<StreakBreakModalProps> = ({
  streakDays,
  onUseToken,
  onClose,
  tokensAvailable
}) => {
  return <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      <motion.div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl overflow-hidden" initial={{
      scale: 0.9,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} exit={{
      scale: 0.9,
      opacity: 0
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 300
    }}>
        <div className="relative h-48 bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
          <motion.button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" onClick={() => {
          hapticFeedback.selection();
          onClose();
        }} whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }}>
            <XIcon size={16} className="text-white" />
          </motion.button>
          <motion.div className="text-center" initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          delay: 0.2,
          duration: 0.5
        }}>
            <div className="mx-auto mb-3">
              <Berry variant="streak" size="small" />
            </div>
            <p className="text-white font-bold text-xl">
              {streakDays} Day Streak at Risk!
            </p>
          </motion.div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            You haven't logged any meals today. Use a Freeze Token to protect
            your {streakDays} day streak.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center mr-3">
                <ZapIcon size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  Freeze Tokens Available: {tokensAvailable}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Premium users get 3 tokens per month
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="primary" fullWidth onClick={() => {
            hapticFeedback.impact();
            onUseToken();
          }} disabled={tokensAvailable <= 0}>
              Use a Freeze Token
            </Button>
            <Button variant="secondary" fullWidth onClick={() => {
            hapticFeedback.selection();
            onClose();
          }}>
              I'll Log a Meal
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>;
};