import React, { useState } from 'react';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { FoodSearchBar } from '../food-input/FoodSearchBar';
import { FoodItemCard } from '../food-input/FoodItemCard';
import { MealTypeSelector } from '../food-input/MealTypeSelector';
import { hapticFeedback } from '../../utils/haptics';
interface AddFoodScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, params: any) => void;
}
export const AddFoodScreen: React.FC<AddFoodScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  // Sample data
  const recentSearches = ['chicken breast', 'greek yogurt', 'protein shake', 'banana'];
  const recentFoods = [{
    id: '1',
    name: 'Greek Yogurt',
    brand: 'Fage',
    calories: 130,
    protein: 18,
    carbs: 6,
    fat: 4,
    isRecent: true
  }, {
    id: '2',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    isRecent: true
  }];
  const frequentFoods = [{
    id: '3',
    name: 'Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    isFrequent: true
  }, {
    id: '4',
    name: 'Protein Shake',
    brand: 'Optimum Nutrition',
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1,
    isFrequent: true
  }];
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onNavigate('search-results', {
      query
    });
  };
  const handleSelectFood = (id: string) => {
    // Find the selected food item
    const food = [...recentFoods, ...frequentFoods].find(item => item.id === id);
    if (food) {
      onNavigate('food-detail', {
        food
      });
    }
  };
  const handleVoiceSearch = () => {
    onNavigate('voice-input', {});
  };
  const handleCameraSearch = () => {
    onNavigate('camera-input', {});
  };
  const handleBarcodeSearch = () => {
    onNavigate('barcode-input', {});
  };
  const handleCreateCustomFood = () => {
    onNavigate('create-food', {});
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
            Add Food
          </h1>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="mb-4">
            <FoodSearchBar onSearch={handleSearch} onVoiceSearch={handleVoiceSearch} onCameraSearch={handleCameraSearch} onBarcodeSearch={handleBarcodeSearch} recentSearches={recentSearches} />
          </div>
          <MealTypeSelector selectedMeal={selectedMeal} onSelect={setSelectedMeal} />
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Recent Foods
              </h2>
              <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
                See All
              </button>
            </div>
            <div className="space-y-3">
              {recentFoods.map(food => <FoodItemCard key={food.id} {...food} onSelect={handleSelectFood} onToggleFavorite={id => console.log('Toggle favorite', id)} />)}
            </div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Frequent Foods
              </h2>
              <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
                See All
              </button>
            </div>
            <div className="space-y-3">
              {frequentFoods.map(food => <FoodItemCard key={food.id} {...food} onSelect={handleSelectFood} onToggleFavorite={id => console.log('Toggle favorite', id)} />)}
            </div>
          </div>
          <div className="mb-6">
            <Button variant="secondary" fullWidth icon={<PlusIcon size={18} />} onClick={handleCreateCustomFood}>
              Create Custom Food
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};