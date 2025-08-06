import React, { useState } from 'react';
import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon, CameraIcon, MicIcon, BarcodeIcon, KeyboardIcon, SparklesIcon, CheckIcon, XIcon, HeartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
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
  isEditing?: boolean;
}
interface FoodGroup {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: FoodItem[];
  isEditing?: boolean;
}
interface EditMealScreenProps {
  meal: any;
  onBack: () => void;
  onSave: (meal: any) => void;
  onAddMore: (method: string) => void;
  onRefineWithAI: () => void;
}
export const EditMealScreen: React.FC<EditMealScreenProps> = ({
  meal,
  onBack,
  onSave,
  onAddMore,
  onRefineWithAI
}) => {
  const [selectedMealType, setSelectedMealType] = useState(meal?.type || 'Meal');
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  // Mock food groups for the detailed breakdown
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([{
    id: 'sandwich',
    name: 'Turkey Sandwich',
    calories: 380,
    protein: 25,
    carbs: 45,
    fat: 12,
    items: [{
      id: 'bread',
      name: 'Whole Wheat Bread',
      quantity: '2 slices',
      calories: 140,
      protein: 6,
      carbs: 24,
      fat: 2,
      parent: 'sandwich'
    }, {
      id: 'turkey',
      name: 'Turkey Breast',
      quantity: '3 oz',
      calories: 90,
      protein: 19,
      carbs: 0,
      fat: 1,
      parent: 'sandwich'
    }, {
      id: 'lettuce',
      name: 'Lettuce',
      quantity: '0.5 cup',
      calories: 4,
      protein: 0.5,
      carbs: 1,
      fat: 0,
      parent: 'sandwich'
    }, {
      id: 'tomato',
      name: 'Tomato',
      quantity: '2 slices',
      calories: 5,
      protein: 0.3,
      carbs: 1,
      fat: 0,
      parent: 'sandwich'
    }]
  }, {
    id: 'chips',
    name: 'Potato Chips',
    calories: 150,
    protein: 2,
    carbs: 15,
    fat: 10,
    items: []
  }, {
    id: 'pickle',
    name: 'Dill Pickle',
    calories: 12,
    protein: 0.5,
    carbs: 2,
    fat: 0.1,
    items: []
  }]);
  const handleEditItem = (groupId: string, itemId?: string) => {
    hapticFeedback.selection();
    setFoodGroups(prevGroups => prevGroups.map(group => {
      if (group.id === groupId) {
        if (!itemId) {
          // Editing the whole group
          return {
            ...group,
            isEditing: !group.isEditing
          };
        } else {
          // Editing a specific item
          return {
            ...group,
            items: group.items.map(item => item.id === itemId ? {
              ...item,
              isEditing: !item.isEditing
            } : item)
          };
        }
      }
      return group;
    }));
  };
  const handleUpdateItem = (groupId: string, itemId: string | undefined, field: 'calories' | 'protein' | 'carbs' | 'fat' | 'quantity' | 'name', value: string | number) => {
    setFoodGroups(prevGroups => prevGroups.map(group => {
      if (group.id === groupId) {
        if (!itemId) {
          // Update group
          return {
            ...group,
            [field]: field === 'name' || field === 'quantity' ? value : Number(value)
          };
        } else {
          // Update specific item
          return {
            ...group,
            items: group.items.map(item => item.id === itemId ? {
              ...item,
              [field]: field === 'name' || field === 'quantity' ? value : Number(value)
            } : item)
          };
        }
      }
      return group;
    }));
  };
  const handleSaveEdit = (groupId: string, itemId?: string) => {
    hapticFeedback.success();
    setFoodGroups(prevGroups => prevGroups.map(group => {
      if (group.id === groupId) {
        if (!itemId) {
          // Save group edit
          return {
            ...group,
            isEditing: false
          };
        } else {
          // Save specific item edit
          return {
            ...group,
            items: group.items.map(item => item.id === itemId ? {
              ...item,
              isEditing: false
            } : item)
          };
        }
      }
      return group;
    }));
    // Recalculate group totals if an item was edited
    if (itemId) {
      recalculateGroupTotals(groupId);
    }
  };
  const recalculateGroupTotals = (groupId: string) => {
    setFoodGroups(prevGroups => prevGroups.map(group => {
      if (group.id === groupId && group.items.length > 0) {
        const totals = group.items.reduce((acc, item) => ({
          calories: acc.calories + item.calories,
          protein: acc.protein + item.protein,
          carbs: acc.carbs + item.carbs,
          fat: acc.fat + item.fat
        }), {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        });
        return {
          ...group,
          ...totals
        };
      }
      return group;
    }));
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
  const handleToggleFavorite = (itemId: string, groupId?: string) => {
    hapticFeedback.impact();
    if (favoriteItems.includes(itemId)) {
      // Remove from favorites
      setFavoriteItems(favoriteItems.filter(id => id !== itemId));
    } else {
      // Add to favorites
      setFavoriteItems([...favoriteItems, itemId]);
    }
  };
  const calculateTotalCalories = () => {
    return foodGroups.reduce((total, group) => total + group.calories, 0);
  };
  const handleSave = () => {
    hapticFeedback.success();
    setIsLoading(true);
    // Simulate saving
    setTimeout(() => {
      setIsLoading(false);
      onSave({
        ...meal,
        type: selectedMealType,
        time: meal?.time,
        calories: calculateTotalCalories(),
        foodGroups
      });
    }, 800);
  };
  // Handler functions for adding more food
  const handleAddMoreCamera = () => {
    hapticFeedback.selection();
    onAddMore('camera');
  };
  const handleAddMoreVoice = () => {
    hapticFeedback.selection();
    onAddMore('voice');
  };
  const handleAddMoreBarcode = () => {
    hapticFeedback.selection();
    onAddMore('barcode');
  };
  const handleAddMoreText = () => {
    hapticFeedback.selection();
    onAddMore('text');
  };
  const handleRefineWithAI = () => {
    hapticFeedback.selection();
    onRefineWithAI();
  };
  // Meal type options
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={() => {
            hapticFeedback.selection();
            onBack();
          }} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <ArrowLeftIcon size={20} className="text-gray-700" />
            </motion.button>
            <h1 className="text-xl font-bold">Edit Meal</h1>
          </div>
        </div>
        <div className="px-4 py-2 flex-1">
          {/* Meal Type Selector */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <h3 className="font-medium mb-3">Meal Type</h3>
            <div className="grid grid-cols-4 gap-2">
              {mealTypes.map(type => <button key={type} className={`py-2 rounded-lg text-center text-sm ${selectedMealType === type ? 'bg-[#320DFF] text-white' : 'bg-gray-100 text-gray-700'}`} onClick={() => setSelectedMealType(type)}>
                  {type}
                </button>)}
            </div>
          </div>
          {/* Food items */}
          <h2 className="font-medium mb-3">Food Items</h2>
          <div className="space-y-3 mb-6">
            {foodGroups.map(group => <div key={group.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                {group.isEditing ?
            // Group editing mode
            <div className="space-y-3">
                    <div className="flex justify-between">
                      <input type="text" className="flex-1 p-2 border border-gray-200 rounded-lg" value={group.name} onChange={e => handleUpdateItem(group.id, undefined, 'name', e.target.value)} />
                      <div className="flex ml-2">
                        <motion.button className="p-1 rounded-full bg-green-100 text-green-600 mr-1" onClick={() => handleSaveEdit(group.id)} whileTap={{
                    scale: 0.9
                  }}>
                          <CheckIcon size={18} />
                        </motion.button>
                        <motion.button className="p-1 rounded-full bg-red-100 text-red-600" onClick={() => handleEditItem(group.id)} whileTap={{
                    scale: 0.9
                  }}>
                          <XIcon size={18} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Calories
                        </label>
                        <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={group.calories} onChange={e => handleUpdateItem(group.id, undefined, 'calories', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Protein (g)
                        </label>
                        <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={group.protein} onChange={e => handleUpdateItem(group.id, undefined, 'protein', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Carbs (g)
                        </label>
                        <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={group.carbs} onChange={e => handleUpdateItem(group.id, undefined, 'carbs', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Fat (g)
                        </label>
                        <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={group.fat} onChange={e => handleUpdateItem(group.id, undefined, 'fat', e.target.value)} />
                      </div>
                    </div>
                  </div> :
            // Group normal view
            <div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{group.name}</h3>
                      <div className="flex items-center">
                        <div className="flex space-x-2">
                          <button className="p-1 text-[#320DFF]" onClick={() => handleEditItem(group.id)}>
                            <PencilIcon size={16} />
                          </button>
                          <button className="p-1 text-red-500" onClick={() => handleDeleteItem(group.id)}>
                            <Trash2Icon size={16} />
                          </button>
                          <button className="p-1" onClick={() => handleToggleFavorite(group.id)}>
                            <HeartIcon size={16} className={favoriteItems.includes(group.id) ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                          </button>
                        </div>
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
                  </div>}
                {/* Ingredients */}
                {group.items.length > 0 && <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Ingredients:</p>
                    <div className="space-y-2">
                      {group.items.map(item => item.isEditing ?
                // Item editing mode
                <div key={item.id} className="p-3 bg-white border border-[#320DFF]/30 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <input type="text" className="flex-1 p-2 border border-gray-200 rounded-lg" value={item.name} onChange={e => handleUpdateItem(group.id, item.id, 'name', e.target.value)} />
                              <div className="flex ml-2">
                                <motion.button className="p-1 rounded-full bg-green-100 text-green-600 mr-1" onClick={() => handleSaveEdit(group.id, item.id)} whileTap={{
                        scale: 0.9
                      }}>
                                  <CheckIcon size={18} />
                                </motion.button>
                                <motion.button className="p-1 rounded-full bg-red-100 text-red-600" onClick={() => handleEditItem(group.id, item.id)} whileTap={{
                        scale: 0.9
                      }}>
                                  <XIcon size={18} />
                                </motion.button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">
                                Quantity
                              </label>
                              <input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={item.quantity} onChange={e => handleUpdateItem(group.id, item.id, 'quantity', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Calories
                                </label>
                                <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={item.calories} onChange={e => handleUpdateItem(group.id, item.id, 'calories', e.target.value)} />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Protein
                                </label>
                                <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={item.protein} onChange={e => handleUpdateItem(group.id, item.id, 'protein', e.target.value)} />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Carbs
                                </label>
                                <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={item.carbs} onChange={e => handleUpdateItem(group.id, item.id, 'carbs', e.target.value)} />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Fat
                                </label>
                                <input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={item.fat} onChange={e => handleUpdateItem(group.id, item.id, 'fat', e.target.value)} />
                              </div>
                            </div>
                          </div> :
                // Item normal view
                <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <div className="text-right mr-3">
                                <p className="text-sm font-medium">
                                  {item.calories} cal
                                </p>
                                <div className="flex space-x-2 text-xs text-gray-500">
                                  <span>Protein: {item.protein}g</span>
                                  <span>Carbs: {item.carbs}g</span>
                                  <span>Fat: {item.fat}g</span>
                                </div>
                              </div>
                              <div className="flex">
                                <button className="p-1 text-[#320DFF]" onClick={() => handleEditItem(group.id, item.id)}>
                                  <PencilIcon size={14} />
                                </button>
                                <button className="p-1 text-red-500" onClick={() => handleDeleteItem(group.id, item.id)}>
                                  <Trash2Icon size={14} />
                                </button>
                                <button className="p-1" onClick={() => handleToggleFavorite(item.id, group.id)}>
                                  <HeartIcon size={14} className={favoriteItems.includes(item.id) ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                                </button>
                              </div>
                            </div>
                          </div>)}
                    </div>
                  </div>}
              </div>)}
          </div>
          {/* Add more options */}
          <h2 className="font-medium mb-3">Add More Food</h2>
          <div className="grid grid-cols-4 gap-2 mb-6">
            <motion.button className="flex flex-col items-center p-3 bg-gray-50 rounded-xl" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(50, 13, 255, 0.05)'
          }} whileTap={{
            scale: 0.95
          }} onClick={handleAddMoreCamera}>
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <CameraIcon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">Camera</span>
            </motion.button>
            <motion.button className="flex flex-col items-center p-3 bg-gray-50 rounded-xl" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(50, 13, 255, 0.05)'
          }} whileTap={{
            scale: 0.95
          }} onClick={handleAddMoreVoice}>
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <MicIcon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">Voice</span>
            </motion.button>
            <motion.button className="flex flex-col items-center p-3 bg-gray-50 rounded-xl" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(50, 13, 255, 0.05)'
          }} whileTap={{
            scale: 0.95
          }} onClick={handleAddMoreBarcode}>
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <BarcodeIcon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">Barcode</span>
            </motion.button>
            <motion.button className="flex flex-col items-center p-3 bg-gray-50 rounded-xl" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(50, 13, 255, 0.05)'
          }} whileTap={{
            scale: 0.95
          }} onClick={handleAddMoreText}>
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <KeyboardIcon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">Text</span>
            </motion.button>
          </div>
          <div className="mb-6">
            <Button variant="secondary" fullWidth onClick={handleRefineWithAI}>
              <SparklesIcon size={18} className="mr-1" />
              Refine with AI
            </Button>
          </div>
          <div className="mb-4">
            <Button variant="primary" fullWidth onClick={handleSave} loading={isLoading} disabled={isLoading}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};