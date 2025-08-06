import React, { useState } from 'react';
import { ArrowLeftIcon, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { PortionSizeSelector } from '../food-input/PortionSizeSelector';
import { MealTypeSelector } from '../food-input/MealTypeSelector';
import { NutritionFactsPanel } from '../food-input/NutritionFactsPanel';
import { hapticFeedback } from '../../utils/haptics';
interface FoodDetailsScreenProps {
  food: any;
  onBack: () => void;
  onAddToLog: (food: any, quantity: number, mealType: string) => void;
}
export const FoodDetailsScreen: React.FC<FoodDetailsScreenProps> = ({
  food,
  onBack,
  onAddToLog
}) => {
  const [isFavorite, setIsFavorite] = useState(food.isFavorite || false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [selectedPortion, setSelectedPortion] = useState('serving');
  const [quantity, setQuantity] = useState(1);
  const portionOptions = [{
    id: 'serving',
    name: 'Serving',
    multiplier: 1
  }, {
    id: 'cup',
    name: 'Cup',
    multiplier: 1.5
  }, {
    id: 'oz',
    name: 'Ounce',
    multiplier: 0.25
  }, {
    id: 'gram',
    name: 'Gram',
    multiplier: 0.01
  }];
  const nutritionItems = [{
    name: 'Total Fat',
    amount: food.fat || 0,
    unit: 'g',
    dailyValue: Math.round((food.fat || 0) / 65 * 100),
    subItems: [{
      name: 'Saturated Fat',
      amount: food.saturatedFat || 0,
      unit: 'g',
      dailyValue: Math.round((food.saturatedFat || 0) / 20 * 100)
    }]
  }, {
    name: 'Cholesterol',
    amount: food.cholesterol || 0,
    unit: 'mg',
    dailyValue: Math.round((food.cholesterol || 0) / 300 * 100)
  }, {
    name: 'Sodium',
    amount: food.sodium || 0,
    unit: 'mg',
    dailyValue: Math.round((food.sodium || 0) / 2300 * 100)
  }, {
    name: 'Total Carbohydrate',
    amount: food.carbs || 0,
    unit: 'g',
    dailyValue: Math.round((food.carbs || 0) / 300 * 100),
    subItems: [{
      name: 'Dietary Fiber',
      amount: food.fiber || 0,
      unit: 'g',
      dailyValue: Math.round((food.fiber || 0) / 25 * 100)
    }, {
      name: 'Total Sugars',
      amount: food.sugar || 0,
      unit: 'g'
    }]
  }, {
    name: 'Protein',
    amount: food.protein || 0,
    unit: 'g'
  }];
  const handleToggleFavorite = () => {
    hapticFeedback.impact();
    setIsFavorite(!isFavorite);
  };
  const handleAddToLog = () => {
    hapticFeedback.success();
    onAddToLog(food, quantity, selectedMeal);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
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
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" onClick={handleToggleFavorite} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <Heart size={20} className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-700 dark:text-gray-300'} />
          </motion.button>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            <div className="flex items-start">
              {food.image ? <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mr-4">
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                </div> : <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                  <span className="text-2xl text-gray-400 dark:text-gray-500">
                    🍽️
                  </span>
                </div>}
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                  {food.name}
                </h2>
                {food.brand && <p className="text-gray-500 dark:text-gray-400">
                    {food.brand}
                  </p>}
                <div className="flex justify-between items-end mt-2">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {food.calories} cal
                  </div>
                  <div className="flex space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    {food.protein !== undefined && <span>P: {food.protein}g</span>}
                    {food.carbs !== undefined && <span>C: {food.carbs}g</span>}
                    {food.fat !== undefined && <span>F: {food.fat}g</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <MealTypeSelector selectedMeal={selectedMeal} onSelect={setSelectedMeal} />
          <PortionSizeSelector options={portionOptions} selectedOption={selectedPortion} quantity={quantity} onOptionChange={setSelectedPortion} onQuantityChange={setQuantity} caloriesPerServing={food.calories} />
          <NutritionFactsPanel servingSize={`${quantity} ${selectedPortion}`} calories={Math.round(food.calories * quantity * (portionOptions.find(o => o.id === selectedPortion)?.multiplier || 1))} nutritionItems={nutritionItems} />
          <div className="mt-6">
            <Button variant="primary" fullWidth onClick={handleAddToLog}>
              Add to Food Log
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};