import React from 'react';
import { motion } from 'framer-motion';
import { WifiOffIcon, RefreshCwIcon } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface OfflineStateBannerProps {
  onRetry: () => void;
}
export const OfflineStateBanner: React.FC<OfflineStateBannerProps> = ({
  onRetry
}) => {
  return <motion.div className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4" initial={{
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
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
          <WifiOffIcon size={18} className="text-gray-600 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            You're Offline
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Working with limited functionality. Some features may not be
            available.
          </p>
        </div>
        <motion.button className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center text-gray-700 dark:text-gray-300 text-sm" onClick={() => {
        hapticFeedback.selection();
        onRetry();
      }} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <RefreshCwIcon size={14} className="mr-1" />
          Retry
        </motion.button>
      </div>
    </motion.div>;
};