import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface NutritionItem {
  name: string;
  amount: number;
  unit: string;
  dailyValue?: number;
  subItems?: {
    name: string;
    amount: number;
    unit: string;
    dailyValue?: number;
  }[];
}
interface NutritionFactsPanelProps {
  servingSize: string;
  calories: number;
  nutritionItems: NutritionItem[];
}
export const NutritionFactsPanel: React.FC<NutritionFactsPanelProps> = ({
  servingSize,
  calories,
  nutritionItems
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    hapticFeedback.selection();
    setExpanded(!expanded);
  };
  return <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="p-4 flex justify-between items-center cursor-pointer" onClick={toggleExpanded}>
        <h3 className="font-medium text-gray-900 dark:text-white">
          Nutrition Facts
        </h3>
        <motion.div animate={{
        rotate: expanded ? 180 : 0
      }} transition={{
        duration: 0.3
      }}>
          <ChevronDown className="text-gray-500 dark:text-gray-400" size={20} />
        </motion.div>
      </div>
      <AnimatePresence>
        {expanded && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} transition={{
        duration: 0.3
      }}>
            <div className="px-4 pb-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Serving size: {servingSize}
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Calories
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {calories}
                  </p>
                </div>
              </div>
              <p className="text-xs text-right text-gray-500 dark:text-gray-400 mb-2">
                % Daily Value*
              </p>
              <div className="space-y-2">
                {nutritionItems.map((item, index) => <div key={index}>
                    <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name} {item.amount}
                        {item.unit}
                      </p>
                      {item.dailyValue && <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.dailyValue}%
                        </p>}
                    </div>
                    {item.subItems && item.subItems.map((subItem, subIndex) => <div key={`${index}-${subIndex}`} className="flex justify-between items-center py-1 pl-4 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subItem.name} {subItem.amount}
                            {subItem.unit}
                          </p>
                          {subItem.dailyValue && <p className="text-sm text-gray-600 dark:text-gray-400">
                              {subItem.dailyValue}%
                            </p>}
                        </div>)}
                  </div>)}
              </div>
              <div className="mt-3 flex items-start text-xs text-gray-500 dark:text-gray-400">
                <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                <p>
                  *Percent Daily Values are based on a 2,000 calorie diet. Your
                  daily values may be higher or lower depending on your calorie
                  needs.
                </p>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};