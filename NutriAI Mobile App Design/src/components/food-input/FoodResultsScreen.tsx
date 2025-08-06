import React, { useEffect, useState, Children } from 'react';
import { ArrowLeftIcon, PencilIcon, PlusIcon, CheckIcon, Trash2Icon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, HeartIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
  confidence?: number;
  parent?: string;
  isFavorite?: boolean;
}
interface FoodGroup {
  id: string;
  name: string;
  image?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
  expanded: boolean;
  isFavorite?: boolean;
}
interface FoodResultsScreenProps {
  results: any;
  onBack: () => void;
  onSave: () => void;
  onAddMore: () => void;
  onRefine: (data: any) => void;
}
export const FoodResultsScreen: React.FC<FoodResultsScreenProps> = ({
  results,
  onBack,
  onSave,
  onAddMore,
  onRefine
}) => {
  const [selectedMeal, setSelectedMeal] = useState('Lunch');
  const [servingSize, setServingSize] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResults, setEditedResults] = useState(results);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: ''
  });
  // Organize food items into groups/individual items
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
  const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const handleServingChange = (change: number) => {
    const newSize = Math.max(0.5, servingSize + change);
    setServingSize(newSize);
    hapticFeedback.selection();
    // Update nutrition values based on serving size
    const scaleFactor = newSize / servingSize;
    setFoodGroups(prevGroups => prevGroups.map(group => ({
      ...group,
      calories: Math.round(group.calories * scaleFactor),
      protein: Math.round(group.protein * scaleFactor),
      carbs: Math.round(group.carbs * scaleFactor),
      fat: Math.round(group.fat * scaleFactor),
      items: group.items.map(item => ({
        ...item,
        calories: Math.round(item.calories * scaleFactor),
        protein: Math.round(item.protein * scaleFactor),
        carbs: Math.round(item.carbs * scaleFactor),
        fat: Math.round(item.fat * scaleFactor)
      }))
    })));
    // Update total nutrition values
    if (results) {
      setEditedResults({
        ...results,
        totalCalories: Math.round(calculateTotalCalories() * scaleFactor),
        totalProtein: Math.round(calculateTotalProtein() * scaleFactor),
        totalCarbs: Math.round(calculateTotalCarbs() * scaleFactor),
        totalFat: Math.round(calculateTotalFat() * scaleFactor)
      });
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
  const toggleGroupExpanded = (groupId: string) => {
    hapticFeedback.selection();
    setFoodGroups(prevGroups => prevGroups.map(group => group.id === groupId ? {
      ...group,
      expanded: !group.expanded
    } : group));
  };
  const handleDeleteItem = (groupId: string, itemId?: string) => {
    hapticFeedback.impact();
    if (!itemId) {
      // Delete entire group
      setFoodGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
      return;
    }
    // Delete specific item from group
    setFoodGroups(prevGroups => prevGroups.map(group => {
      if (group.id === groupId) {
        const updatedItems = group.items.filter(item => item.id !== itemId);
        // If all items are deleted, remove the group
        if (group.items.length > 0 && updatedItems.length === 0) {
          return null;
        }
        // Recalculate group totals
        const itemCalories = group.items.find(item => item.id === itemId)?.calories || 0;
        const itemProtein = group.items.find(item => item.id === itemId)?.protein || 0;
        const itemCarbs = group.items.find(item => item.id === itemId)?.carbs || 0;
        const itemFat = group.items.find(item => item.id === itemId)?.fat || 0;
        return {
          ...group,
          items: updatedItems,
          calories: group.calories - itemCalories,
          protein: group.protein - itemProtein,
          carbs: group.carbs - itemCarbs,
          fat: group.fat - itemFat
        };
      }
      return group;
    }).filter(Boolean) as FoodGroup[]);
  };
  const handleEditItem = (groupId: string, itemId?: string) => {
    hapticFeedback.selection();
    // This would navigate to an edit screen for the specific item
    console.log(`Edit ${itemId ? 'item' : 'group'} ${itemId || groupId}`);
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
          message: newFavoriteState ? `${group.name} added to favorites` : `${group.name} removed from favorites`,
          type: newFavoriteState ? 'success' : 'info'
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
            message: newFavoriteState ? `${item.name} added to favorites` : `${item.name} removed from favorites`,
            type: newFavoriteState ? 'success' : 'info'
          });
        }
      }
      return newGroups;
    });
  };
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
  const handleRefine = () => {
    hapticFeedback.selection();
    onRefine(editedResults);
  };
  const toggleEdit = () => {
    hapticFeedback.selection();
    setIsEditing(!isEditing);
  };
  const handleSaveMeal = () => {
    hapticFeedback.success();
    onSave();
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1
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

        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold">Analysis Results</h1>
            <p className="text-sm text-gray-500">Review and save your meal</p>
          </div>
        </div>

        <motion.div className="px-4 py-2 flex-1" variants={containerVariants} initial="hidden" animate="visible">
          {/* Food Items/Groups */}
          {foodGroups.map(group => <motion.div key={group.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4" variants={itemVariants}>
              <div className="flex">
                {group.image && <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 bg-gray-100">
                    <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                  </div>}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <h2 className="font-semibold">{group.name}</h2>
                      {group.items.length > 0 && <button className="ml-2 p-1 rounded-full hover:bg-gray-100" onClick={() => toggleGroupExpanded(group.id)}>
                          {group.expanded ? <ChevronUpIcon size={16} className="text-gray-500" /> : <ChevronDownIcon size={16} className="text-gray-500" />}
                        </button>}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-gray-500" onClick={() => handleToggleFavorite(group.id)}>
                        <HeartIcon size={18} className={group.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                      </button>
                      {isEditing && <>
                          <button className="text-[#320DFF] text-sm flex items-center" onClick={() => handleEditItem(group.id)}>
                            <PencilIcon size={14} className="mr-1" />
                            Edit
                          </button>
                          <button className="text-red-500 text-sm flex items-center" onClick={() => handleDeleteItem(group.id)}>
                            <Trash2Icon size={14} className="mr-1" />
                            Remove
                          </button>
                        </>}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="text-sm">
                      <p className="font-medium">{group.calories} cal</p>
                    </div>
                    <div className="flex space-x-3 text-xs text-gray-500">
                      <span>Protein: {group.protein}g</span>
                      <span>Carbs: {group.carbs}g</span>
                      <span>Fat: {group.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable ingredients list */}
              {group.items.length > 0 && group.expanded && <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Ingredients:</p>
                  <div className="space-y-2">
                    <AnimatePresence>
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
                              <div className="flex text-xs text-gray-500">
                                <span className="w-[90px] text-right">
                                  Protein: {item.protein}g
                                </span>
                                <span className="w-[80px] text-right">
                                  Carbs: {item.carbs}g
                                </span>
                                <span className="w-[60px] text-right">
                                  Fat: {item.fat}g
                                </span>
                              </div>
                            </div>
                            <div className="flex">
                              <button className="p-1 text-gray-500" onClick={() => handleToggleFavorite(group.id, item.id)}>
                                <HeartIcon size={14} className={item.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                              </button>
                              {isEditing && <>
                                  <button className="p-1 text-[#320DFF]" onClick={() => handleEditItem(group.id, item.id)}>
                                    <PencilIcon size={14} />
                                  </button>
                                  <button className="p-1 text-red-500" onClick={() => handleDeleteItem(group.id, item.id)}>
                                    <Trash2Icon size={14} />
                                  </button>
                                </>}
                            </div>
                          </div>
                        </motion.div>)}
                    </AnimatePresence>
                  </div>
                </div>}
            </motion.div>)}

          {/* Serving Size Adjuster */}
          <motion.div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4" variants={itemVariants}>
            <h3 className="font-medium mb-3">Serving Size</h3>
            <div className="flex items-center justify-between">
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" onClick={() => handleServingChange(-0.5)} disabled={servingSize <= 0.5}>
                <span className="text-xl font-medium">-</span>
              </button>
              <div className="text-center">
                <span className="text-xl font-semibold">{servingSize}</span>
                <span className="text-gray-500 ml-1">
                  serving{servingSize !== 1 ? 's' : ''}
                </span>
              </div>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" onClick={() => handleServingChange(0.5)}>
                <span className="text-xl font-medium">+</span>
              </button>
            </div>
          </motion.div>

          {/* Meal Type Selector */}
          <motion.div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4" variants={itemVariants}>
            <h3 className="font-medium mb-3">Meal Type</h3>
            <div className="grid grid-cols-4 gap-2">
              {mealOptions.map(meal => <button key={meal} className={`py-2 rounded-lg text-center text-sm ${selectedMeal === meal ? 'bg-[#320DFF] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setSelectedMeal(meal)}>
                  {meal}
                </button>)}
            </div>
          </motion.div>

          {/* Nutrition Summary */}
          <motion.div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6" variants={itemVariants}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Nutrition Summary</h3>
              <button className="text-[#320DFF] text-sm flex items-center" onClick={toggleEdit}>
                {isEditing ? <>
                    <CheckIcon size={14} className="mr-1" />
                    Done
                  </> : <>
                    <PencilIcon size={14} className="mr-1" />
                    Edit
                  </>}
              </button>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Calories</span>
              <span className="font-semibold">
                {calculateTotalCalories()} cal
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Protein</span>
                  <span>{calculateTotalProtein()}g</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#42A5F5]" style={{
                  width: `${calculateTotalProtein() / (calculateTotalProtein() + calculateTotalCarbs() + calculateTotalFat()) * 100}%`
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Carbs</span>
                  <span>{calculateTotalCarbs()}g</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFA726]" style={{
                  width: `${calculateTotalCarbs() / (calculateTotalProtein() + calculateTotalCarbs() + calculateTotalFat()) * 100}%`
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Fat</span>
                  <span>{calculateTotalFat()}g</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#66BB6A]" style={{
                  width: `${calculateTotalFat() / (calculateTotalProtein() + calculateTotalCarbs() + calculateTotalFat()) * 100}%`
                }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <Button onClick={handleSaveMeal} variant="primary" fullWidth>
              Save Meal
            </Button>
            <div className="flex space-x-3">
              <Button onClick={onAddMore} variant="secondary" fullWidth>
                <PlusIcon size={18} className="mr-1" />
                Add More
              </Button>
              <Button onClick={handleRefine} variant="secondary" fullWidth>
                <SparklesIcon size={18} className="mr-1" />
                Refine with AI
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>;
};