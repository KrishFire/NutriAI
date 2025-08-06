import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, SearchIcon, PlusIcon, HeartIcon, FilterIcon, SparklesIcon, Trash2Icon, XIcon, CheckIcon, CheckCircleIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface FavoriteItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: 'meal' | 'food' | 'recipe' | 'ingredient';
  quantity?: string;
  frequency: number;
  isFavorite?: boolean;
}
interface FavoritesScreenProps {
  onBack: () => void;
  onSelectFavorite: (item: FavoriteItem) => void;
}
export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onBack,
  onSelectFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'meals' | 'foods' | 'ingredients'>('all');
  const [showAddWithAI, setShowAddWithAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: ''
  });
  // Sample favorites data
  const [favorites, setFavorites] = useState<FavoriteItem[]>([{
    id: '1',
    name: 'Turkey Sandwich',
    calories: 380,
    protein: 25,
    carbs: 45,
    fat: 12,
    type: 'meal',
    frequency: 12,
    isFavorite: true
  }, {
    id: '2',
    name: 'Protein Shake',
    calories: 220,
    protein: 30,
    carbs: 15,
    fat: 3,
    type: 'food',
    frequency: 8,
    isFavorite: true
  }, {
    id: '3',
    name: 'Greek Salad',
    calories: 320,
    protein: 12,
    carbs: 20,
    fat: 24,
    type: 'food',
    frequency: 5,
    isFavorite: true
  }, {
    id: '4',
    name: 'Chicken & Rice Bowl',
    calories: 450,
    protein: 35,
    carbs: 55,
    fat: 10,
    type: 'meal',
    frequency: 7,
    isFavorite: true
  }, {
    id: '5',
    name: 'Avocado Toast',
    calories: 280,
    protein: 8,
    carbs: 30,
    fat: 16,
    type: 'food',
    frequency: 10,
    isFavorite: true
  }, {
    id: '6',
    name: 'Turkey Breast',
    calories: 90,
    protein: 19,
    carbs: 0,
    fat: 1,
    quantity: '3 oz',
    type: 'ingredient',
    frequency: 15,
    isFavorite: true
  }, {
    id: '7',
    name: 'Whole Wheat Bread',
    calories: 70,
    protein: 3,
    carbs: 12,
    fat: 1,
    quantity: '1 slice',
    type: 'ingredient',
    frequency: 14,
    isFavorite: true
  }, {
    id: '8',
    name: 'Lettuce',
    calories: 4,
    protein: 0.5,
    carbs: 1,
    fat: 0,
    quantity: '0.5 cup',
    type: 'ingredient',
    frequency: 9,
    isFavorite: true
  }]);
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
  const handleFilterChange = (filter: 'all' | 'meals' | 'foods' | 'ingredients') => {
    hapticFeedback.selection();
    setActiveFilter(filter);
  };
  const handleSelectFavorite = (item: FavoriteItem) => {
    hapticFeedback.selection();
    if (isMultiSelectMode) {
      toggleItemSelection(item.id);
    } else {
      // Set isFavorite to true when selecting an item from favorites
      onSelectFavorite({
        ...item,
        isFavorite: true
      });
    }
  };
  const toggleItemSelection = (id: string) => {
    hapticFeedback.selection();
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
      if (!isMultiSelectMode) {
        setIsMultiSelectMode(true);
      }
    }
  };
  const handleToggleMultiSelectMode = () => {
    hapticFeedback.selection();
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      setSelectedItems([]);
    }
  };
  const handleAddSelectedItems = () => {
    hapticFeedback.success();
    // Here you would handle adding all selected items
    // For now, we'll just log them and clear selection
    console.log('Adding items:', selectedItems);
    setNotification({
      show: true,
      message: `${selectedItems.length} items added to meal`
    });
    setSelectedItems([]);
    setIsMultiSelectMode(false);
  };
  const handleAddWithAI = () => {
    if (!aiInput.trim()) return;
    hapticFeedback.selection();
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      // Add a new item based on AI input
      const newItem: FavoriteItem = {
        id: Date.now().toString(),
        name: aiInput,
        calories: Math.floor(Math.random() * 300) + 100,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 30) + 10,
        fat: Math.floor(Math.random() * 15) + 2,
        type: 'food',
        frequency: 1,
        isFavorite: true
      };
      setFavorites([newItem, ...favorites]);
      setAiInput('');
      setIsProcessing(false);
      setShowAddWithAI(false);
      setNotification({
        show: true,
        message: `${newItem.name} added to favorites`
      });
      hapticFeedback.success();
    }, 1500);
  };
  const handleSwipe = (id: string) => {
    if (swipedItemId === id) {
      setSwipedItemId(null);
    } else {
      hapticFeedback.selection();
      setSwipedItemId(id);
    }
  };
  const handleDeleteFavorite = (id: string) => {
    hapticFeedback.impact();
    const itemToDelete = favorites.find(item => item.id === id);
    setFavorites(favorites.filter(item => item.id !== id));
    setSwipedItemId(null);
    if (itemToDelete) {
      setNotification({
        show: true,
        message: `${itemToDelete.name} removed from favorites`
      });
    }
  };
  const filteredFavorites = favorites.filter(item => {
    // Apply search filter
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }).filter(item => {
    // Apply type filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'meals') return item.type === 'meal';
    if (activeFilter === 'foods') return item.type === 'food';
    if (activeFilter === 'ingredients') return item.type === 'ingredient';
    return true;
  });
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        {/* Header - Fixed height */}
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4" onClick={() => {
            hapticFeedback.selection();
            if (isMultiSelectMode) {
              setIsMultiSelectMode(false);
              setSelectedItems([]);
            } else {
              onBack();
            }
          }} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <ArrowLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Favorites
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your saved meals and foods
              </p>
            </div>
          </div>
          {isMultiSelectMode ? <Button variant="primary" size="sm" onClick={handleToggleMultiSelectMode}>
              Done
            </Button> : <div className="flex space-x-2">
              <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" onClick={handleToggleMultiSelectMode} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
                <CheckIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </motion.button>
              <motion.button className="w-10 h-10 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center" onClick={() => {
            hapticFeedback.selection();
            setShowAddWithAI(!showAddWithAI);
          }} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
                <PlusIcon size={20} className="text-white" />
              </motion.button>
            </div>}
        </div>

        {/* Add with AI section */}
        <AnimatePresence>
          {showAddWithAI && <motion.div className="mx-4 bg-white dark:bg-gray-800 border border-[#320DFF]/20 dark:border-[#6D56FF]/20 rounded-xl p-4 mb-4 shadow-sm" initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }}>
              <div className="flex items-center mb-2">
                <SparklesIcon size={16} className="text-[#320DFF] dark:text-[#6D56FF] mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Add with AI
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Describe the food you want to add to your favorites
              </p>
              <div className="flex items-center mb-2">
                <input type="text" className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50 dark:focus:ring-[#6D56FF]/50" placeholder="E.g., Grilled chicken breast with rice" value={aiInput} onChange={e => setAiInput(e.target.value)} />
                <Button variant="primary" className="ml-2" onClick={handleAddWithAI} loading={isProcessing} disabled={isProcessing || !aiInput.trim()}>
                  Add
                </Button>
              </div>
            </motion.div>}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className="px-4">
          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={16} className="text-gray-400" />
            </div>
            <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50 dark:focus:ring-[#6D56FF]/50" placeholder="Search favorites..." value={searchQuery} onChange={e => {
            setSearchQuery(e.target.value);
            hapticFeedback.selection();
          }} />
          </div>
          {/* Filters */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'all' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} onClick={() => handleFilterChange('all')}>
              All Favorites
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'meals' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} onClick={() => handleFilterChange('meals')}>
              Meals
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'foods' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} onClick={() => handleFilterChange('foods')}>
              Foods
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeFilter === 'ingredients' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} onClick={() => handleFilterChange('ingredients')}>
              Ingredients
            </button>
          </div>
        </div>

        {/* Quick Add section */}
        {filteredFavorites.length > 0 && !isMultiSelectMode && <div className="px-4 mb-4">
            <h2 className="font-medium text-gray-900 dark:text-white mb-2">
              Quick Add
            </h2>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {filteredFavorites.slice(0, 5).map(item => <motion.button key={item.id} className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg min-w-[80px]" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(50, 13, 255, 0.05)'
          }} whileTap={{
            scale: 0.95
          }} onClick={() => {
            handleSelectFavorite(item);
            hapticFeedback.selection();
          }}>
                  <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/10 flex items-center justify-center mb-1">
                    <span className="text-[#320DFF] dark:text-[#6D56FF] font-bold">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-center line-clamp-1 text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.calories} cal
                  </span>
                </motion.button>)}
            </div>
          </div>}

        {/* Favorites list */}
        <div className="px-4 pb-24">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredFavorites.length === 0 ? <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <HeartIcon size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No favorites found
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                    {searchQuery ? 'No results match your search' : 'Save your favorite meals and foods for quick access'}
                  </p>
                  {!showAddWithAI && <Button variant="primary" onClick={() => {
                setShowAddWithAI(true);
                hapticFeedback.selection();
              }}>
                      <PlusIcon size={16} className="mr-1" />
                      Add with AI
                    </Button>}
                </div> : filteredFavorites.map(item => <div key={item.id} className="relative overflow-hidden">
                    {/* Swipe delete action - Enhanced with better visual */}
                    <motion.div className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center px-6 rounded-r-xl" initial={{
                x: '100%'
              }} animate={{
                x: swipedItemId === item.id ? '0%' : '100%'
              }} transition={{
                duration: 0.2
              }}>
                      <button className="text-white" onClick={() => handleDeleteFavorite(item.id)}>
                        <Trash2Icon size={24} />
                      </button>
                    </motion.div>
                    <motion.div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm relative z-10" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -20
              }} transition={{
                duration: 0.2
              }} drag={!isMultiSelectMode ? 'x' : false} dragConstraints={{
                left: -100,
                right: 0
              }} dragElastic={0.1} onDragEnd={(e, info) => {
                if (!isMultiSelectMode && info.offset.x < -50) {
                  handleSwipe(item.id);
                  hapticFeedback.impact();
                }
              }} style={{
                x: swipedItemId === item.id ? -100 : 0,
                borderColor: selectedItems.includes(item.id) ? '#320DFF' : undefined,
                borderWidth: selectedItems.includes(item.id) ? '2px' : '1px'
              }}>
                      <div className="flex">
                        <div className="mr-3 flex items-center" onClick={e => {
                    e.stopPropagation();
                    toggleItemSelection(item.id);
                  }}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedItems.includes(item.id) ? 'bg-[#320DFF] dark:bg-[#6D56FF] border-[#320DFF] dark:border-[#6D56FF]' : 'border-gray-300 dark:border-gray-600'}`}>
                            {selectedItems.includes(item.id) && <CheckIcon size={14} className="text-white" />}
                          </div>
                        </div>
                        <div className="flex-grow" onClick={e => {
                    if (isMultiSelectMode) {
                      // In multi-select mode, clicking on the content should also select the item
                      toggleItemSelection(item.id);
                    } else {
                      // In normal mode, clicking on the content should navigate to details
                      handleSelectFavorite(item);
                    }
                  }}>
                          <div className="flex">
                            <div className="w-12 h-12 rounded-lg mr-3 bg-[#320DFF]/10 dark:bg-[#6D56FF]/10 flex items-center justify-center">
                              <span className="text-[#320DFF] dark:text-[#6D56FF] font-bold text-xl">
                                {item.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      {item.name}
                                    </h3>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span className="capitalize">
                                      {item.type}
                                    </span>
                                    {item.quantity && <span className="ml-2">
                                        • {item.quantity}
                                      </span>}
                                  </div>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {item.calories} cal
                                </span>
                              </div>
                              <div className="flex justify-between mt-2">
                                <div className="flex space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Protein: {item.protein}g</span>
                                  <span>Carbs: {item.carbs}g</span>
                                  <span>Fat: {item.fat}g</span>
                                </div>
                                {!isMultiSelectMode && <button className="text-[#320DFF] dark:text-[#6D56FF] text-xs flex items-center" onClick={e => {
                            e.stopPropagation();
                            hapticFeedback.selection();
                            // Handle adding item logic
                            setNotification({
                              show: true,
                              message: `${item.name} added to meal`
                            });
                          }}>
                                    <PlusIcon size={12} className="mr-0.5" />
                                    Add
                                  </button>}
                              </div>
                            </div>
                          </div>
                        </div>
                        {swipedItemId === item.id && !isMultiSelectMode && <motion.button className="ml-2 self-center" onClick={() => {
                    setSwipedItemId(null);
                    hapticFeedback.selection();
                  }} initial={{
                    opacity: 0,
                    scale: 0.5
                  }} animate={{
                    opacity: 1,
                    scale: 1
                  }}>
                            <XIcon size={20} className="text-gray-500 dark:text-gray-400" />
                          </motion.button>}
                      </div>
                    </motion.div>
                  </div>)}
            </AnimatePresence>
          </div>
          {!isMultiSelectMode && filteredFavorites.length > 0 && <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 mb-4">
              Swipe left on an item to delete
            </div>}
        </div>

        {/* Multi-select action bar - Floating but smaller */}
        <AnimatePresence>
          {isMultiSelectMode && selectedItems.length > 0 && <motion.div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-lg z-40" initial={{
          y: 100,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} exit={{
          y: 100,
          opacity: 0
        }}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  {selectedItems.length} items selected
                </span>
                <Button variant="primary" size="sm" onClick={handleAddSelectedItems}>
                  Add Selected
                </Button>
              </div>
            </motion.div>}
        </AnimatePresence>

        {/* Notification - Floating */}
        <AnimatePresence>
          {notification.show && <motion.div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg z-40" initial={{
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
      </div>
    </PageTransition>;
};