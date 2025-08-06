import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, PlusCircle } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
interface MealSummaryCardProps {
  mealType: string;
  time: string;
  foodItems: FoodItem[];
  onEdit: () => void;
  onDelete: () => void;
  onAddMore: () => void;
}
export const MealSummaryCard: React.FC<MealSummaryCardProps> = ({
  mealType,
  time,
  foodItems,
  onEdit,
  onDelete,
  onAddMore
}) => {
  const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = foodItems.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalFat = foodItems.reduce((sum, item) => sum + (item.fat || 0), 0);
  const handleEdit = () => {
    hapticFeedback.selection();
    onEdit();
  };
  const handleDelete = () => {
    hapticFeedback.impact();
    onDelete();
  };
  const handleAddMore = () => {
    hapticFeedback.selection();
    onAddMore();
  };
  return <motion.div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm" initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {mealType}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 dark:text-white">
              {totalCalories} cal
            </p>
            <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span>P: {totalProtein}g</span>
              <span>C: {totalCarbs}g</span>
              <span>F: {totalFat}g</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-3">
          {foodItems.map(item => <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <p className="text-gray-800 dark:text-gray-200">{item.name}</p>
                {item.brand && <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.brand}
                  </p>}
              </div>
              <div className="text-right">
                <p className="text-gray-800 dark:text-gray-200">
                  {item.calories} cal
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.quantity} {item.quantity === 1 ? 'serving' : 'servings'}
                </p>
              </div>
            </div>)}
        </div>
        <div className="flex space-x-2">
          <motion.button className="flex-1 py-2 flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700" onClick={handleEdit} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }}>
            <Edit2 size={14} />
            <span>Edit</span>
          </motion.button>
          <motion.button className="flex-1 py-2 flex items-center justify-center space-x-1 text-sm text-gray-600 dark:text-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700" onClick={handleDelete} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }}>
            <Trash2 size={14} />
            <span>Delete</span>
          </motion.button>
          <motion.button className="flex-1 py-2 flex items-center justify-center space-x-1 text-sm text-[#320DFF] dark:text-[#6D56FF] rounded-lg bg-[#320DFF]/5 dark:bg-[#6D56FF]/10" onClick={handleAddMore} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }}>
            <PlusCircle size={14} />
            <span>Add More</span>
          </motion.button>
        </div>
      </div>
    </motion.div>;
};