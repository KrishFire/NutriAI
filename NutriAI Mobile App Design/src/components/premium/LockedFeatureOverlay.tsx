import React from 'react';
import { motion } from 'framer-motion';
import { LockIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface LockedFeatureOverlayProps {
  featureName: string;
  onUpgrade: () => void;
  onClose: () => void;
}
export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({
  featureName,
  onUpgrade,
  onClose
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
        <div className="relative h-48 bg-gradient-to-br from-[#320DFF] to-[#6D56FF] flex items-center justify-center">
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
          <motion.div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center" initial={{
          scale: 0,
          rotate: -45
        }} animate={{
          scale: 1,
          rotate: 0
        }} transition={{
          type: 'spring',
          damping: 15,
          stiffness: 200
        }}>
            <LockIcon size={40} className="text-white" />
          </motion.div>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Premium Feature
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {featureName} is available exclusively to Premium subscribers.
            Upgrade now to unlock this and all other premium features.
          </p>
          <div className="space-y-3">
            <Button variant="primary" fullWidth onClick={() => {
            hapticFeedback.impact();
            onUpgrade();
          }}>
              Upgrade to Premium
            </Button>
            <Button variant="secondary" fullWidth onClick={() => {
            hapticFeedback.selection();
            onClose();
          }}>
              Maybe Later
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>;
};