import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Coffee, Sun, Moon } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface MealTypeSelectorProps {
  selectedMeal: string;
  onSelect: (mealType: string) => void;
}
export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selectedMeal,
  onSelect
}) => {
  const mealTypes = [{
    id: 'breakfast',
    name: 'Breakfast',
    icon: <Coffee size={20} />,
    time: '6-10 AM'
  }, {
    id: 'lunch',
    name: 'Lunch',
    icon: <Sun size={20} />,
    time: '11-3 PM'
  }, {
    id: 'dinner',
    name: 'Dinner',
    icon: <Moon size={20} />,
    time: '5-9 PM'
  }, {
    id: 'snack',
    name: 'Snack',
    icon: <Clock size={20} />,
    time: 'Anytime'
  }];
  return <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
      <h3 className="font-medium text-gray-900 dark:text-white mb-3">
        Meal Type
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {mealTypes.map(meal => <motion.button key={meal.id} className={`flex items-center p-3 rounded-lg border ${selectedMeal === meal.id ? 'border-[#320DFF] bg-[#320DFF]/5 dark:border-[#6D56FF] dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700'}`} onClick={() => {
        hapticFeedback.selection();
        onSelect(meal.id);
      }} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedMeal === meal.id ? 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 text-[#320DFF] dark:text-[#6D56FF]' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              {meal.icon}
            </div>
            <div className="text-left">
              <p className={`font-medium ${selectedMeal === meal.id ? 'text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-900 dark:text-white'}`}>
                {meal.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {meal.time}
              </p>
            </div>
          </motion.button>)}
      </div>
    </div>;
};