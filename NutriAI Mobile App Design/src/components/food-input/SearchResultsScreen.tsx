import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, SearchIcon, FilterIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Skeleton } from '../ui/Skeleton';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
import { Berry } from '../ui/Berry';
import { EmptyStateScreen } from '../screens/EmptyStateScreen';
interface SearchResultsScreenProps {
  query?: string;
  onBack: () => void;
  onSelectFood: (food: any) => void;
}
export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  query = '',
  onBack,
  onSelectFood
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [searchQuery, setSearchQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  // Mock food data
  const mockFoods = [{
    id: 1,
    name: 'Grilled Chicken Breast',
    brand: 'Generic',
    servingSize: '100g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    category: 'protein'
  }, {
    id: 2,
    name: 'Avocado',
    brand: 'Fresh Produce',
    servingSize: '1 medium (150g)',
    calories: 240,
    protein: 3,
    carbs: 12,
    fat: 22,
    category: 'vegetable'
  }, {
    id: 3,
    name: 'Brown Rice',
    brand: 'Organic',
    servingSize: '1 cup cooked (195g)',
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.8,
    category: 'grain'
  }, {
    id: 4,
    name: 'Greek Yogurt',
    brand: 'Fage',
    servingSize: '170g container',
    calories: 100,
    protein: 18,
    carbs: 6,
    fat: 0,
    category: 'dairy'
  }, {
    id: 5,
    name: 'Salmon Fillet',
    brand: 'Wild Caught',
    servingSize: '100g',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    category: 'protein'
  }];
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery, selectedFilter]);
  const performSearch = (query: string) => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockFoods.filter(food => {
        const matchesQuery = food.name.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || food.category === selectedFilter;
        return matchesQuery && matchesFilter;
      });
      setResults(filtered);
      setIsLoading(false);
      hapticFeedback.selection();
    }, 800);
  };
  const handleSearch = () => {
    if (searchQuery.trim()) {
      hapticFeedback.selection();
      performSearch(searchQuery);
    }
  };
  const clearSearch = () => {
    hapticFeedback.selection();
    setSearchQuery('');
    setResults([]);
  };
  const handleFilterChange = (filter: string) => {
    hapticFeedback.selection();
    setSelectedFilter(filter);
    setFilterOpen(false);
  };
  const handleSelectFood = (food: any) => {
    hapticFeedback.impact();
    onSelectFood(food);
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Search Foods
          </h1>
        </div>
        <div className="px-4 py-2 flex-1">
          {results.length > 0 ? <>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
                <input type="text" className="block w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Search foods..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} />
                {searchQuery && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <motion.button onClick={clearSearch} whileHover={{
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
                  {isLoading ? 'Searching...' : results.length > 0 ? `${results.length} results found` : searchQuery ? 'No results found' : 'Enter a search term'}
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
              {isLoading ? <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div> : <div className="space-y-3">
                  <AnimatePresence>
                    {results.map((food, index) => <motion.div key={food.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm" initial={{
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
              }} onClick={() => handleSelectFood(food)} whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }}>
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {food.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {food.brand} • {food.servingSize}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {food.calories} cal
                            </p>
                            <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>C: {food.carbs}g</span>
                              <span>P: {food.protein}g</span>
                              <span>F: {food.fat}g</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>)}
                  </AnimatePresence>
                </div>}
            </> : <EmptyStateScreen title="No Results Found" description={`Berry couldn't find any foods matching "${query}". Try a different search term or add a custom food.`} buttonText="Add Custom Food" onAction={() => {}} />}
        </div>
      </div>
    </PageTransition>;
};