import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, EditIcon, PlusIcon, CheckIcon, XIcon, HeartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isFavorite?: boolean;
}
interface AnalyzingResultsScreenProps {
  results: any;
  onBack: () => void;
  onSave: (results: any) => void;
  onEdit: (item: any, index: number) => void;
}
export const AnalyzingResultsScreen: React.FC<AnalyzingResultsScreenProps> = ({
  results = {
    items: [{
      id: '1',
      name: 'Scrambled eggs',
      quantity: '2 large',
      calories: 180,
      protein: 12,
      carbs: 1,
      fat: 12,
      isFavorite: false
    }, {
      id: '2',
      name: 'Butter',
      quantity: '1 tbsp',
      calories: 100,
      protein: 0,
      carbs: 0,
      fat: 11,
      isFavorite: false
    }, {
      id: '3',
      name: 'Wheat toast',
      quantity: '1 slice',
      calories: 80,
      protein: 3,
      carbs: 15,
      fat: 1,
      isFavorite: false
    }, {
      id: '4',
      name: 'Peanut butter',
      quantity: '1 tbsp',
      calories: 95,
      protein: 4,
      carbs: 3,
      fat: 8,
      isFavorite: false
    }, {
      id: '5',
      name: 'Orange juice',
      quantity: '1 cup',
      calories: 110,
      protein: 2,
      carbs: 26,
      fat: 0,
      isFavorite: false
    }],
    total: {
      calories: 565,
      protein: 21,
      carbs: 45,
      fat: 32
    }
  },
  onBack,
  onSave,
  onEdit
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [mealType, setMealType] = useState('breakfast');
  const [items, setItems] = useState<FoodItem[]>(results.items);
  const [totals, setTotals] = useState(results.total);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: ''
  });
  useEffect(() => {
    // Calculate totals whenever items change
    const newTotals = items.reduce((acc, item) => {
      return {
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
    setTotals(newTotals);
  }, [items]);
  // Clear notification after timeout
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({
          show: false,
          message: ''
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  const handleMealTypeChange = (type: string) => {
    hapticFeedback.selection();
    setMealType(type);
  };
  const handleRemoveItem = (index: number) => {
    hapticFeedback.impact();
    setItems(items.filter((_, i) => i !== index));
  };
  const toggleSelectItem = (index: number) => {
    hapticFeedback.selection();
    setSelectedItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };
  const handleToggleFavorite = (index: number) => {
    hapticFeedback.impact();
    setItems(prevItems => {
      const newItems = [...prevItems];
      const item = newItems[index];
      if (!item) return prevItems;
      const newFavoriteState = !item.isFavorite;
      newItems[index] = {
        ...item,
        isFavorite: newFavoriteState
      };
      // Show notification
      setNotification({
        show: true,
        message: newFavoriteState ? `${item.name} added to favorites` : `${item.name} removed from favorites`,
        type: newFavoriteState ? 'success' : 'info'
      });
      return newItems;
    });
  };
  const handleSave = () => {
    hapticFeedback.success();
    onSave({
      items,
      total: totals,
      mealType
    });
  };
  return <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-20">
        {/* Notification */}
        <AnimatePresence>
          {notification.show && <motion.div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg z-50" initial={{
          y: 50,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} exit={{
          y: 50,
          opacity: 0
        }}>
              {notification.message}
            </motion.div>}
        </AnimatePresence>
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
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Analysis Results
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review and adjust if needed
            </p>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Nutrition Summary
              </h2>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                {totals.calories} cal
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Carbs
                </p>
                <div className="flex items-baseline">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totals.carbs}g
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({Math.round(totals.carbs * 4 / totals.calories * 100)}
                    %)
                  </span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#FFA726]" initial={{
                  width: 0
                }} animate={{
                  width: `${totals.carbs * 4 / totals.calories * 100}%`
                }} transition={{
                  duration: 0.8
                }}></motion.div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Protein
                </p>
                <div className="flex items-baseline">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totals.protein}g
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    (
                    {Math.round(totals.protein * 4 / totals.calories * 100)}
                    %)
                  </span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#42A5F5]" initial={{
                  width: 0
                }} animate={{
                  width: `${totals.protein * 4 / totals.calories * 100}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.1
                }}></motion.div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fat
                </p>
                <div className="flex items-baseline">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totals.fat}g
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({Math.round(totals.fat * 9 / totals.calories * 100)}%)
                  </span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#66BB6A]" initial={{
                  width: 0
                }} animate={{
                  width: `${totals.fat * 9 / totals.calories * 100}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.2
                }}></motion.div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4">
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
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Food Items
              </h2>
              <div className="flex space-x-2">
                <motion.button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full" whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <PlusIcon size={14} className="text-gray-700 dark:text-gray-300" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Add Item
                  </span>
                </motion.button>
              </div>
            </div>
            <AnimatePresence>
              {items.map((item, index) => <motion.div key={index} className={`flex items-center justify-between p-3 mb-2 rounded-lg border ${selectedItems.includes(index) ? 'border-[#320DFF] dark:border-[#6D56FF] bg-[#320DFF]/5 dark:bg-[#6D56FF]/10' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }} transition={{
              duration: 0.2,
              delay: index * 0.05
            }}>
                  <div className="flex items-center flex-1">
                    <motion.button className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${selectedItems.includes(index) ? 'bg-[#320DFF] dark:bg-[#6D56FF] border-[#320DFF] dark:border-[#6D56FF]' : 'border-gray-300 dark:border-gray-600'}`} onClick={() => toggleSelectItem(index)} whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }}>
                      {selectedItems.includes(index) && <CheckIcon size={12} className="text-white" />}
                    </motion.button>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.calories} cal
                      </p>
                      <div className="flex space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Protein: {item.protein}g</span>
                        <span>Carbs: {item.carbs}g</span>
                        <span>Fat: {item.fat}g</span>
                      </div>
                    </div>
                    <div className="flex">
                      <motion.button className="p-1 text-gray-500 dark:text-gray-400" onClick={() => handleToggleFavorite(index)} whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }}>
                        <HeartIcon size={16} className={item.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-500'} />
                      </motion.button>
                      <motion.button className="p-1 text-gray-500 dark:text-gray-400" onClick={() => onEdit(item, index)} whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }}>
                        <EditIcon size={16} />
                      </motion.button>
                      <motion.button className="p-1 text-gray-500 dark:text-gray-400" onClick={() => handleRemoveItem(index)} whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }}>
                        <XIcon size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>)}
            </AnimatePresence>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleSave}>
              Save to Log
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};