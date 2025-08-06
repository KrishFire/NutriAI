import React from 'react';
import { motion } from 'framer-motion';
interface SubscriptionPlanCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  isPopular?: boolean;
  isSelected?: boolean;
  discount?: string;
  onSelect: () => void;
}
export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  title,
  price,
  period,
  description,
  isPopular = false,
  isSelected = false,
  discount,
  onSelect
}) => {
  return <motion.div className={`p-4 rounded-xl border ${isSelected ? 'border-[#320DFF] bg-[#320DFF]/5 dark:border-[#6D56FF] dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} relative`} whileHover={{
    scale: 1.02
  }} whileTap={{
    scale: 0.98
  }} onClick={onSelect}>
      {isPopular && <div className="absolute -top-3 right-4 bg-[#320DFF] dark:bg-[#6D56FF] text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </div>}
      {discount && <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
          Save {discount}
        </div>}
      <div className="flex items-center mb-2">
        <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'border-[#320DFF] dark:border-[#6D56FF] bg-[#320DFF] dark:bg-[#6D56FF]' : 'border-gray-300 dark:border-gray-600'} mr-2`}>
          {isSelected && <div className="w-full h-full rounded-full bg-white dark:bg-white scale-50" />}
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="mb-2">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {price}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            /{period}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </motion.div>;
};