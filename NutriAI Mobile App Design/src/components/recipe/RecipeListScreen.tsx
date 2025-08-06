import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, PlusIcon, SearchIcon, FilterIcon, BookmarkIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface RecipeListScreenProps {
  onBack: () => void;
  onCreateRecipe: () => void;
  onSelectRecipe: (recipe: any) => void;
}
export const RecipeListScreen: React.FC<RecipeListScreenProps> = ({
  onBack,
  onCreateRecipe,
  onSelectRecipe
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  // Mock recipes data
  const mockRecipes = [{
    id: 1,
    name: 'Homemade Granola',
    image: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    servings: 8,
    ingredients: [{
      id: 1,
      name: 'Rolled oats'
    }, {
      id: 2,
      name: 'Honey'
    }, {
      id: 3,
      name: 'Almonds'
    }, {
      id: 4,
      name: 'Coconut flakes'
    }],
    calories: 320,
    protein: 8,
    carbs: 45,
    fat: 12,
    category: 'breakfast'
  }, {
    id: 2,
    name: 'Greek Salad',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    servings: 2,
    ingredients: [{
      id: 1,
      name: 'Cucumber'
    }, {
      id: 2,
      name: 'Tomatoes'
    }, {
      id: 3,
      name: 'Feta cheese'
    }, {
      id: 4,
      name: 'Olives'
    }, {
      id: 5,
      name: 'Olive oil'
    }],
    calories: 250,
    protein: 8,
    carbs: 12,
    fat: 20,
    category: 'lunch'
  }, {
    id: 3,
    name: 'Chicken Stir Fry',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    servings: 4,
    ingredients: [{
      id: 1,
      name: 'Chicken breast'
    }, {
      id: 2,
      name: 'Bell peppers'
    }, {
      id: 3,
      name: 'Broccoli'
    }, {
      id: 4,
      name: 'Soy sauce'
    }, {
      id: 5,
      name: 'Garlic'
    }],
    calories: 380,
    protein: 35,
    carbs: 20,
    fat: 15,
    category: 'dinner'
  }, {
    id: 4,
    name: 'Protein Smoothie',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    servings: 1,
    ingredients: [{
      id: 1,
      name: 'Protein powder'
    }, {
      id: 2,
      name: 'Banana'
    }, {
      id: 3,
      name: 'Almond milk'
    }, {
      id: 4,
      name: 'Peanut butter'
    }],
    calories: 280,
    protein: 25,
    carbs: 30,
    fat: 8,
    category: 'snack'
  }];
  useEffect(() => {
    // Simulate loading recipes
    setIsLoading(true);
    setTimeout(() => {
      setRecipes(mockRecipes);
      setIsLoading(false);
    }, 1000);
  }, []);
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || recipe.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });
  const handleFilterChange = (filter: string) => {
    hapticFeedback.selection();
    setSelectedFilter(filter);
    setFilterOpen(false);
  };
  const handleSelectRecipe = (recipe: any) => {
    hapticFeedback.impact();
    onSelectRecipe(recipe);
  };
  const handleClearSearch = () => {
    hapticFeedback.selection();
    setSearchQuery('');
  };
  return <PageTransition>
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
              My Recipes
            </h1>
          </div>
          <motion.button className="w-10 h-10 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center" onClick={() => {
          hapticFeedback.impact();
          onCreateRecipe();
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <PlusIcon size={20} className="text-white" />
          </motion.button>
        </div>
        <div className="px-4 py-2">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <input type="text" className="block w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Search recipes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <motion.button onClick={handleClearSearch} whileHover={{
              scale: 1.1
            }} whileTap={{
              scale: 0.9
            }}>
                  <XIcon size={18} className="text-gray-500 dark:text-gray-400" />
                </motion.button>
              </div>}
          </div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Loading recipes...' : filteredRecipes.length > 0 ? `${filteredRecipes.length} recipes` : 'No recipes found'}
            </p>
            <motion.button className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${filterOpen || selectedFilter !== 'all' ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} onClick={() => {
            hapticFeedback.selection();
            setFilterOpen(!filterOpen);
          }} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <FilterIcon size={16} />
              <span className="text-sm font-medium">Filter</span>
            </motion.button>
          </div>
          <AnimatePresence>
            {filterOpen && <motion.div className="mb-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm" initial={{
            opacity: 0,
            y: -10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} transition={{
            duration: 0.2
          }}>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Filter by meal:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(filter => <motion.button key={filter} className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedFilter === filter ? 'bg-[#320DFF] dark:bg-[#6D56FF] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`} onClick={() => handleFilterChange(filter)} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </motion.button>)}
                </div>
              </motion.div>}
          </AnimatePresence>
          <div className="space-y-4">
            {isLoading ?
          // Loading skeletons
          [...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-24 animate-pulse"></div>) : filteredRecipes.length > 0 ? <AnimatePresence>
                {filteredRecipes.map((recipe, index) => <motion.div key={recipe.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -20
            }} transition={{
              duration: 0.3,
              delay: index * 0.05
            }} onClick={() => handleSelectRecipe(recipe)} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }}>
                    <div className="flex h-24">
                      <div className="w-24 h-full bg-gray-100 dark:bg-gray-700">
                        {recipe.image && <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {recipe.name}
                            </h3>
                            <div className="flex items-center">
                              <BookmarkIcon size={16} className="text-[#320DFF] dark:text-[#6D56FF]" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {recipe.ingredients.length} ingredients •{' '}
                            {recipe.servings} servings
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{recipe.calories} cal</span>
                            <span>P: {recipe.protein}g</span>
                            <span>C: {recipe.carbs}g</span>
                            <span>F: {recipe.fat}g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>)}
              </AnimatePresence> : <div className="py-10 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BookmarkIcon size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                  No recipes found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  {searchQuery ? 'Try a different search term' : 'Create your first recipe to get started'}
                </p>
                <motion.button className="px-4 py-2 bg-[#320DFF] dark:bg-[#6D56FF] text-white rounded-full text-sm font-medium" onClick={onCreateRecipe} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                  Create Recipe
                </motion.button>
              </div>}
          </div>
        </div>
      </div>
    </PageTransition>;
};