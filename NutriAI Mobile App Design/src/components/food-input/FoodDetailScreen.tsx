import React, { useState } from 'react';
import { ArrowLeftIcon, MinusIcon, PlusIcon, BookmarkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface FoodDetailScreenProps {
  food?: any; // Replace with proper type
  onBack: () => void;
  onAddToLog: (food: any, quantity: number, mealType: string) => void;
}
export const FoodDetailScreen: React.FC<FoodDetailScreenProps> = ({
  food = {
    name: 'Grilled Chicken Breast',
    brand: 'Generic',
    servingSize: '100g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    vitamins: [{
      name: 'Vitamin B6',
      amount: '15%'
    }, {
      name: 'Niacin',
      amount: '50%'
    }, {
      name: 'Phosphorus',
      amount: '20%'
    }, {
      name: 'Selenium',
      amount: '36%'
    }]
  },
  onBack,
  onAddToLog
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('lunch');
  const [isFavorite, setIsFavorite] = useState(false);
  const handleQuantityChange = (value: number) => {
    if (quantity + value > 0) {
      hapticFeedback.selection();
      setQuantity(quantity + value);
    }
  };
  const handleMealTypeChange = (type: string) => {
    hapticFeedback.selection();
    setMealType(type);
  };
  const handleAddToLog = () => {
    hapticFeedback.success();
    onAddToLog(food, quantity, mealType);
  };
  const toggleFavorite = () => {
    hapticFeedback.impact();
    setIsFavorite(!isFavorite);
  };
  // Calculate nutrition based on quantity
  const calculateNutrition = (value: number) => {
    return Math.round(value * quantity);
  };
  return <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Food Details
            </h1>
          </div>
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" onClick={toggleFavorite} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.9
        }}>
            <BookmarkIcon size={20} className={isFavorite ? 'text-[#320DFF] dark:text-[#6D56FF] fill-[#320DFF] dark:fill-[#6D56FF]' : 'text-gray-700 dark:text-gray-300'} />
          </motion.button>
        </div>
        <div className="px-4 py-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {food.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {food.brand}
            </p>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Serving Size
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {food.servingSize}
                </p>
              </div>
              <div className="flex items-center">
                <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }}>
                  <MinusIcon size={16} className="text-gray-700 dark:text-gray-300" />
                </motion.button>
                <span className="mx-4 font-bold text-lg text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={() => handleQuantityChange(1)} whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }}>
                  <PlusIcon size={16} className="text-gray-700 dark:text-gray-300" />
                </motion.button>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Calories
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(food.calories)}
                </p>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div className="h-full bg-[#320DFF] dark:bg-[#6D56FF]" initial={{
                width: 0
              }} animate={{
                width: '100%'
              }} transition={{
                duration: 0.8
              }}></motion.div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Carbs
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(food.carbs)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#FFA726]" initial={{
                  width: 0
                }} animate={{
                  width: `${food.carbs / (food.carbs + food.protein + food.fat) * 100}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.1
                }}></motion.div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Protein
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(food.protein)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#42A5F5]" initial={{
                  width: 0
                }} animate={{
                  width: `${food.protein / (food.carbs + food.protein + food.fat) * 100}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.2
                }}></motion.div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fat</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {calculateNutrition(food.fat)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#66BB6A]" initial={{
                  width: 0
                }} animate={{
                  width: `${food.fat / (food.carbs + food.protein + food.fat) * 100}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.3
                }}></motion.div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Nutrition Facts
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Fiber
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(food.fiber)}g
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Sugar
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(food.sugar)}g
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Sodium
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateNutrition(food.sodium)}mg
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Vitamins & Minerals
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {food.vitamins.map((vitamin: any, index: number) => <div key={index} className="flex justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {vitamin.name}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {vitamin.amount}
                    </p>
                  </div>)}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <p className="font-medium text-gray-900 dark:text-white mb-2">
              Add to meal:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => <motion.button key={meal} className={`py-2 rounded-lg text-sm font-medium ${mealType === meal ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} onClick={() => handleMealTypeChange(meal)} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </motion.button>)}
            </div>
          </div>
          <Button variant="primary" fullWidth onClick={handleAddToLog}>
            Add to Log ({calculateNutrition(food.calories)} cal)
          </Button>
        </div>
      </div>
    </PageTransition>;
};