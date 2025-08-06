import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon, ArrowRightIcon, CalendarIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface WeightLogSheetProps {
  onClose: () => void;
  onSave: (weight: number, date: Date) => void;
  currentWeight?: number;
}
export const WeightLogSheet: React.FC<WeightLogSheetProps> = ({
  onClose,
  onSave,
  currentWeight = 150
}) => {
  const [weight, setWeight] = useState(currentWeight);
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const handleSave = () => {
    hapticFeedback.impact();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSave(weight, date);
    }, 1000);
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  const incrementWeight = () => {
    hapticFeedback.selection();
    setWeight(prev => {
      const increment = weightUnit === 'lbs' ? 0.2 : 0.1;
      return parseFloat((prev + increment).toFixed(1));
    });
  };
  const decrementWeight = () => {
    hapticFeedback.selection();
    setWeight(prev => {
      const decrement = weightUnit === 'lbs' ? 0.2 : 0.1;
      return parseFloat((prev - decrement).toFixed(1));
    });
  };
  const toggleWeightUnit = () => {
    hapticFeedback.selection();
    if (weightUnit === 'lbs') {
      // Convert lbs to kg
      setWeight(parseFloat((weight * 0.453592).toFixed(1)));
      setWeightUnit('kg');
    } else {
      // Convert kg to lbs
      setWeight(parseFloat((weight * 2.20462).toFixed(1)));
      setWeightUnit('lbs');
    }
  };
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Log Weight
            </h2>
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
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={decrementWeight}>
                <svg width="16" height="2" viewBox="0 0 16 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="16" height="2" rx="1" fill="#6B7280" className="dark:fill-gray-400" />
                </svg>
              </button>
              <div className="flex items-baseline mx-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {weight}
                </span>
                <button className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded" onClick={toggleWeightUnit}>
                  {weightUnit}
                </button>
              </div>
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={incrementWeight}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1V15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" className="dark:stroke-gray-400" />
                  <path d="M1 8H15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" className="dark:stroke-gray-400" />
                </svg>
              </button>
            </div>
            <div className="flex justify-center">
              <button className="flex items-center text-sm text-gray-600 dark:text-gray-400" onClick={() => setDate(new Date())}>
                <CalendarIcon size={16} className="mr-1" />
                {formatDate(date)}
                <ArrowRightIcon size={14} className="ml-1" />
              </button>
            </div>
          </div>
          <div className="bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 border border-[#320DFF]/10 dark:border-[#6D56FF]/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
              Regular weigh-ins help track your progress and adjust your
              nutrition plan for better results.
            </p>
          </div>
          <Button variant="primary" fullWidth onClick={handleSave} loading={isLoading} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Weight'}
          </Button>
        </div>
      </motion.div>
    </motion.div>;
};