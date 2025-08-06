import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, Share2Icon, PencilIcon, HeartIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  parent?: string;
  isFavorite?: boolean;
}
interface FoodGroup {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
  expanded: boolean;
  isFavorite?: boolean;
}
interface MealDetailProps {
  meal: any;
  onBack: () => void;
  onEdit?: (meal: any) => void;
  onAddToFavorites?: (meal: any) => void;
}
export const MealDetailScreen: React.FC<MealDetailProps> = ({
  meal,
  onBack,
  onEdit,
  onAddToFavorites,
  onNavigate
}) => {
  // Initialize isFavorite from the meal prop if available
  const [isFavorite, setIsFavorite] = useState(meal?.isFavorite || false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: ''
  });
  // Mock food groups for the detailed breakdown
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([{
    id: 'sandwich',
    name: 'Turkey Sandwich',
    calories: 380,
    protein: 25,
    carbs: 45,
    fat: 12,
    expanded: true,
    isFavorite: false,
    items: [{
      id: 'bread',
      name: 'Whole Wheat Bread',
      quantity: '2 slices',
      calories: 140,
      protein: 6,
      carbs: 24,
      fat: 2,
      parent: 'sandwich',
      isFavorite: false
    }, {
      id: 'turkey',
      name: 'Turkey Breast',
      quantity: '3 oz',
      calories: 90,
      protein: 19,
      carbs: 0,
      fat: 1,
      parent: 'sandwich',
      isFavorite: false
    }, {
      id: 'lettuce',
      name: 'Lettuce',
      quantity: '0.5 cup',
      calories: 4,
      protein: 0.5,
      carbs: 1,
      fat: 0,
      parent: 'sandwich',
      isFavorite: false
    }, {
      id: 'tomato',
      name: 'Tomato',
      quantity: '2 slices',
      calories: 5,
      protein: 0.3,
      carbs: 1,
      fat: 0,
      parent: 'sandwich',
      isFavorite: false
    }]
  }, {
    id: 'chips',
    name: 'Potato Chips',
    calories: 150,
    protein: 2,
    carbs: 15,
    fat: 10,
    expanded: true,
    isFavorite: false,
    items: []
  }, {
    id: 'pickle',
    name: 'Dill Pickle',
    calories: 12,
    protein: 0.5,
    carbs: 2,
    fat: 0.1,
    expanded: true,
    isFavorite: false,
    items: []
  }]);
  // Update isFavorite when meal prop changes
  useEffect(() => {
    if (meal?.isFavorite !== undefined) {
      setIsFavorite(meal.isFavorite);
    }
    // If meal has items, update the foodGroups with those items and their favorite status
    if (meal?.items) {
      setFoodGroups(prev => {
        const updatedGroups = [...prev];
        // Update favorite status for each group
        for (let i = 0; i < updatedGroups.length; i++) {
          const group = updatedGroups[i];
          // Check if this group exists in meal.items
          const mealGroup = meal.items.find((item: any) => item.id === group.id);
          if (mealGroup && mealGroup.isFavorite !== undefined) {
            group.isFavorite = mealGroup.isFavorite;
            // Also update items within the group
            if (mealGroup.items) {
              group.items = group.items.map(item => {
                const mealItem = mealGroup.items.find((mi: any) => mi.id === item.id);
                return {
                  ...item,
                  isFavorite: mealItem?.isFavorite || item.isFavorite || false
                };
              });
            }
          }
        }
        return updatedGroups;
      });
    }
  }, [meal]);
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
  if (!meal) {
    onBack();
    return null;
  }
  const {
    type,
    time,
    calories,
    image,
    macros
  } = meal;
  const toggleGroupExpanded = (groupId: string) => {
    hapticFeedback.selection();
    setFoodGroups(prevGroups => prevGroups.map(group => group.id === groupId ? {
      ...group,
      expanded: !group.expanded
    } : group));
  };
  // New function to handle favoriting items and groups with cascading effect
  const handleToggleFavorite = (groupId: string, itemId?: string) => {
    hapticFeedback.impact();
    // Update the food groups state
    setFoodGroups(prevGroups => {
      const newGroups = [...prevGroups];
      // Find the group
      const groupIndex = newGroups.findIndex(g => g.id === groupId);
      if (groupIndex === -1) return prevGroups;
      if (!itemId) {
        // Toggle favorite for the entire group
        const group = newGroups[groupIndex];
        const newFavoriteState = !group.isFavorite;
        // Update the group
        newGroups[groupIndex] = {
          ...group,
          isFavorite: newFavoriteState,
          // Cascade the favorite state to all items in the group
          items: group.items.map(item => ({
            ...item,
            isFavorite: newFavoriteState
          }))
        };
        // Show notification
        setNotification({
          show: true,
          message: newFavoriteState ? `${group.name} added to favorites` : `${group.name} removed from favorites`
        });
      } else {
        // Toggle favorite for a specific item
        const group = newGroups[groupIndex];
        const itemIndex = group.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          const item = group.items[itemIndex];
          const newFavoriteState = !item.isFavorite;
          // Update the item
          const newItems = [...group.items];
          newItems[itemIndex] = {
            ...item,
            isFavorite: newFavoriteState
          };
          newGroups[groupIndex] = {
            ...group,
            items: newItems
          };
          // Show notification
          setNotification({
            show: true,
            message: newFavoriteState ? `${item.name} added to favorites` : `${item.name} removed from favorites`
          });
        }
      }
      return newGroups;
    });
    // If this is the main meal (no groupId/itemId), toggle the whole meal's favorite status
    if (!groupId && !itemId) {
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      // Cascade to all groups and items
      setFoodGroups(prevGroups => prevGroups.map(group => ({
        ...group,
        isFavorite: newFavoriteState,
        items: group.items.map(item => ({
          ...item,
          isFavorite: newFavoriteState
        }))
      })));
      setNotification({
        show: true,
        message: newFavoriteState ? `${type} added to favorites` : `${type} removed from favorites`
      });
      if (onAddToFavorites) {
        onAddToFavorites({
          ...meal,
          isFavorite: newFavoriteState
        });
      }
    }
  };
  const calculateTotalCalories = () => {
    return foodGroups.reduce((total, group) => total + group.calories, 0);
  };
  const calculateTotalProtein = () => {
    return foodGroups.reduce((total, group) => total + group.protein, 0);
  };
  const calculateTotalCarbs = () => {
    return foodGroups.reduce((total, group) => total + group.carbs, 0);
  };
  const calculateTotalFat = () => {
    return foodGroups.reduce((total, group) => total + group.fat, 0);
  };
  const handleViewFavorites = () => {
    hapticFeedback.selection();
    // Navigate to favorites screen
    if (onNavigate) {
      onNavigate('favorites', {});
    }
  };
  const handleEdit = () => {
    hapticFeedback.selection();
    if (onEdit) {
      onEdit(meal);
    }
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
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

        {/* Header with Image or Gradient */}
        <div className="relative h-64 w-full">
          {image ? <motion.img src={image} alt={type} className="w-full h-full object-cover" initial={{
          opacity: 0.8,
          scale: 1.1
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5
        }} /> : <div className="w-full h-full bg-gradient-to-b from-[#320DFF] to-[#5B56E8]"></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center" onClick={onBack}>
            <ArrowLeftIcon size={20} className="text-white" />
          </button>
          <div className="absolute top-12 right-4 flex space-x-2">
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center" onClick={() => handleToggleFavorite('', '')}>
              <HeartIcon size={20} className={isFavorite ? 'text-red-500 fill-red-500' : 'text-white'} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Share2Icon size={20} className="text-white" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-1">{type}</h1>
            <div className="flex items-center text-white/80 text-sm">
              <ClockIcon size={14} className="mr-1" />
              <span className="mr-4">{time}</span>
              <CalendarIcon size={14} className="mr-1" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Macros Summary */}
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">
                {calculateTotalCalories()} calories
              </h2>
              <p className="text-gray-500 text-sm">Total meal</p>
            </div>
            <div className="flex space-x-2">
              <motion.button className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm font-medium flex items-center" whileTap={{
              scale: 0.95
            }} onClick={() => handleToggleFavorite('', '')}>
                <HeartIcon size={16} className={`mr-1 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                {isFavorite ? 'Saved' : 'Save Meal'}
              </motion.button>
              <motion.button className="bg-[#320DFF] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center" whileTap={{
              scale: 0.95
            }} onClick={handleEdit}>
                <PencilIcon size={16} className="mr-1" />
                Edit Meal
              </motion.button>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <h3 className="font-medium mb-3">Macronutrients</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1 overflow-hidden">
                  <motion.div className="h-full bg-[#FFA726]" initial={{
                  width: 0
                }} animate={{
                  width: `${calculateTotalCarbs() / (calculateTotalCarbs() + calculateTotalProtein() + calculateTotalFat()) * 100}%`
                }} transition={{
                  delay: 0.3,
                  duration: 0.8
                }}></motion.div>
                </div>
                <p className="text-xs text-gray-500">Carbs</p>
                <p className="font-medium">{calculateTotalCarbs()}g</p>
              </div>
              <div className="text-center">
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1 overflow-hidden">
                  <motion.div className="h-full bg-[#42A5F5]" initial={{
                  width: 0
                }} animate={{
                  width: `${calculateTotalProtein() / (calculateTotalCarbs() + calculateTotalProtein() + calculateTotalFat()) * 100}%`
                }} transition={{
                  delay: 0.3,
                  duration: 0.8
                }}></motion.div>
                </div>
                <p className="text-xs text-gray-500">Protein</p>
                <p className="font-medium">{calculateTotalProtein()}g</p>
              </div>
              <div className="text-center">
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1 overflow-hidden">
                  <motion.div className="h-full bg-[#66BB6A]" initial={{
                  width: 0
                }} animate={{
                  width: `${calculateTotalFat() / (calculateTotalCarbs() + calculateTotalProtein() + calculateTotalFat()) * 100}%`
                }} transition={{
                  delay: 0.3,
                  duration: 0.8
                }}></motion.div>
                </div>
                <p className="text-xs text-gray-500">Fat</p>
                <p className="font-medium">{calculateTotalFat()}g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Food Items Breakdown */}
        <div className="px-4">
          <h2 className="text-lg font-bold mb-4">Food Items</h2>
          <div className="space-y-3 mb-6">
            {foodGroups.map(group => <div key={group.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h3 className="font-medium">{group.name}</h3>
                    {group.items.length > 0 && <button className="ml-2 p-1 rounded-full hover:bg-gray-100" onClick={() => toggleGroupExpanded(group.id)}>
                        {group.expanded ? <ChevronUpIcon size={16} className="text-gray-500" /> : <ChevronDownIcon size={16} className="text-gray-500" />}
                      </button>}
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-2">
                      <p className="font-medium">{group.calories} cal</p>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span>P: {group.protein}g</span>
                        <span>C: {group.carbs}g</span>
                        <span>F: {group.fat}g</span>
                      </div>
                    </div>
                    <button className="p-1" onClick={() => handleToggleFavorite(group.id)}>
                      <HeartIcon size={18} className={group.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                    </button>
                  </div>
                </div>
                {/* Expandable ingredients list */}
                {group.items.length > 0 && group.expanded && <div className="mt-3 pt-3 border-t border-gray-100">
                    <AnimatePresence>
                      <div className="space-y-2">
                        {group.items.map(item => <motion.div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg" initial={{
                    opacity: 0,
                    height: 0
                  }} animate={{
                    opacity: 1,
                    height: 'auto'
                  }} exit={{
                    opacity: 0,
                    height: 0
                  }}>
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <div className="text-right mr-2">
                                <p className="text-sm font-medium">
                                  {item.calories} cal
                                </p>
                                <div className="flex space-x-2 text-xs text-gray-500">
                                  <span>Protein: {item.protein}g</span>
                                  <span>Carbs: {item.carbs}g</span>
                                  <span>Fat: {item.fat}g</span>
                                </div>
                              </div>
                              <button className="p-1" onClick={() => handleToggleFavorite(group.id, item.id)}>
                                <HeartIcon size={16} className={item.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                              </button>
                            </div>
                          </motion.div>)}
                      </div>
                    </AnimatePresence>
                  </div>}
              </div>)}
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" fullWidth onClick={handleViewFavorites}>
              <HeartIcon size={18} className="mr-1" />
              View Favorites
            </Button>
            <Button variant="secondary" fullWidth onClick={handleEdit}>
              <PlusIcon size={18} className="mr-1" />
              Log Again
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};