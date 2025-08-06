import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface PortionOption {
  id: string;
  name: string;
  multiplier: number;
}
interface PortionSizeSelectorProps {
  options: PortionOption[];
  selectedOption: string;
  quantity: number;
  onOptionChange: (optionId: string) => void;
  onQuantityChange: (quantity: number) => void;
  caloriesPerServing: number;
}
export const PortionSizeSelector: React.FC<PortionSizeSelectorProps> = ({
  options,
  selectedOption,
  quantity,
  onOptionChange,
  onQuantityChange,
  caloriesPerServing
}) => {
  const selectedPortionOption = options.find(option => option.id === selectedOption) || options[0];
  const totalCalories = Math.round(caloriesPerServing * selectedPortionOption.multiplier * quantity);
  const handleIncrement = () => {
    hapticFeedback.selection();
    onQuantityChange(quantity + 0.5);
  };
  const handleDecrement = () => {
    if (quantity > 0.5) {
      hapticFeedback.selection();
      onQuantityChange(quantity - 0.5);
    }
  };
  return <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
        Portion Size
      </h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map(option => <motion.button key={option.id} className={`px-3 py-1.5 rounded-full text-sm ${selectedOption === option.id ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`} onClick={() => {
        hapticFeedback.selection();
        onOptionChange(option.id);
      }} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
            {option.name}
          </motion.button>)}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 dark:text-gray-400">Quantity</span>
        <div className="flex items-center">
          <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={handleDecrement} disabled={quantity <= 0.5} whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }}>
            <Minus size={16} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
          <span className="mx-4 font-medium text-gray-900 dark:text-white">
            {quantity}
          </span>
          <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={handleIncrement} whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }}>
            <Plus size={16} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400">Total calories</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {totalCalories}
        </span>
      </div>
    </div>;
};