import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Heart, PlusCircle } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface FoodItemCardProps {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  image?: string;
  isFavorite?: boolean;
  isRecent?: boolean;
  isFrequent?: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}
export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  id,
  name,
  brand,
  calories,
  protein,
  carbs,
  fat,
  image,
  isFavorite = false,
  isRecent = false,
  isFrequent = false,
  onSelect,
  onToggleFavorite
}) => {
  const handleSelect = () => {
    hapticFeedback.selection();
    onSelect(id);
  };
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      hapticFeedback.impact();
      onToggleFavorite(id);
    }
  };
  return <motion.div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden" whileHover={{
    scale: 1.02
  }} whileTap={{
    scale: 0.98
  }} onClick={handleSelect}>
      <div className="flex p-3">
        {image ? <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mr-3">
            <img src={image} alt={name} className="w-full h-full object-cover" />
          </div> : <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
            <span className="text-2xl text-gray-400 dark:text-gray-500">
              🍽️
            </span>
          </div>}
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {name}
              </h3>
              {brand && <p className="text-xs text-gray-500 dark:text-gray-400">
                  {brand}
                </p>}
            </div>
            {onToggleFavorite && <motion.button className="w-8 h-8 rounded-full flex items-center justify-center" onClick={handleToggleFavorite} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
                <Heart size={18} className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 dark:text-gray-500'} />
              </motion.button>}
          </div>
          <div className="flex justify-between items-end mt-1">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {calories} cal
            </div>
            <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
              {protein !== undefined && <span>P: {protein}g</span>}
              {carbs !== undefined && <span>C: {carbs}g</span>}
              {fat !== undefined && <span>F: {fat}g</span>}
            </div>
          </div>
        </div>
      </div>
      {(isRecent || isFrequent) && <div className={`px-3 py-1 text-xs border-t border-gray-200 dark:border-gray-700 ${isFrequent ? 'bg-[#320DFF]/5 dark:bg-[#6D56FF]/10' : 'bg-gray-50 dark:bg-gray-750'}`}>
          <div className="flex items-center">
            {isRecent && <>
                <Clock size={12} className="text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-gray-500 dark:text-gray-400">
                  Recently added
                </span>
              </>}
            {isFrequent && <>
                <Star size={12} className="text-[#320DFF] dark:text-[#6D56FF] mr-1" />
                <span className="text-[#320DFF] dark:text-[#6D56FF]">
                  Frequently used
                </span>
              </>}
          </div>
        </div>}
    </motion.div>;
};