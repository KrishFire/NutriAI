import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { PlusIcon } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface EmptyDayPlaceholderProps {
  onAddMeal: () => void;
}
export const EmptyDayPlaceholder: React.FC<EmptyDayPlaceholderProps> = ({
  onAddMeal
}) => {
  return <motion.div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center" initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <motion.div className="w-32 h-32 mb-4" initial={{
      scale: 0.8,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} transition={{
      delay: 0.2,
      duration: 0.5
    }}>
        <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="64" cy="64" r="64" fill="#F3F4F6" className="dark:fill-gray-700" />
          <ellipse cx="64" cy="98" rx="40" ry="6" fill="#E5E7EB" className="dark:fill-gray-600" />
          <path d="M64 90C77.2548 90 88 79.2548 88 66C88 52.7452 77.2548 42 64 42C50.7452 42 40 52.7452 40 66C40 79.2548 50.7452 90 64 90Z" fill="#D1D5DB" className="dark:fill-gray-600" />
          <path d="M64 84C74.4934 84 83 75.4934 83 65C83 54.5066 74.4934 46 64 46C53.5066 46 45 54.5066 45 65C45 75.4934 53.5066 84 64 84Z" fill="white" className="dark:fill-gray-500" />
          <path d="M54 58C56.2091 58 58 56.2091 58 54C58 51.7909 56.2091 50 54 50C51.7909 50 50 51.7909 50 54C50 56.2091 51.7909 58 54 58Z" fill="#4B5563" className="dark:fill-gray-400" />
          <path d="M74 58C76.2091 58 78 56.2091 78 54C78 51.7909 76.2091 50 74 50C71.7909 50 70 51.7909 70 54C70 56.2091 71.7909 58 74 58Z" fill="#4B5563" className="dark:fill-gray-400" />
          <path d="M64 78C68.4183 78 72 74.4183 72 70C72 65.5817 68.4183 62 64 62C59.5817 62 56 65.5817 56 70C56 74.4183 59.5817 78 64 78Z" fill="#320DFF" className="dark:fill-[#6D56FF]" />
        </svg>
      </motion.div>
      <motion.h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2" initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3,
      duration: 0.3
    }}>
        No Meals Logged Today
      </motion.h3>
      <motion.p className="text-center text-gray-600 dark:text-gray-400 mb-6" initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.4,
      duration: 0.3
    }}>
        Start tracking your nutrition by adding your first meal of the day.
      </motion.p>
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.5,
      duration: 0.3
    }}>
        <Button variant="primary" icon={<PlusIcon size={18} />} onClick={() => {
        hapticFeedback.impact();
        onAddMeal();
      }}>
          Add Your First Meal
        </Button>
      </motion.div>
    </motion.div>;
};