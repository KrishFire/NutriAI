import React from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { CustomFoodForm } from '../food-input/CustomFoodForm';
import { hapticFeedback } from '../../utils/haptics';
interface CreateFoodScreenProps {
  onBack: () => void;
  onSave: (foodData: any) => void;
}
export const CreateFoodScreen: React.FC<CreateFoodScreenProps> = ({
  onBack,
  onSave
}) => {
  const handleSave = (foodData: any) => {
    onSave(foodData);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4" onClick={() => {
          hapticFeedback.selection();
          onBack();
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Custom Food
          </h1>
        </div>
        <div className="px-4 py-2 flex-1">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add details about your custom food item. Fields marked with * are
            required.
          </p>
          <CustomFoodForm onSave={handleSave} onCancel={onBack} />
        </div>
      </div>
    </PageTransition>;
};