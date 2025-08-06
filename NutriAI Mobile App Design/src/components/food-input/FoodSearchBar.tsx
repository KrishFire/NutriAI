import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mic, Camera } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface FoodSearchBarProps {
  onSearch: (query: string) => void;
  onVoiceSearch: () => void;
  onCameraSearch: () => void;
  onBarcodeSearch: () => void;
  recentSearches?: string[];
}
export const FoodSearchBar: React.FC<FoodSearchBarProps> = ({
  onSearch,
  onVoiceSearch,
  onCameraSearch,
  onBarcodeSearch,
  recentSearches = []
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSearch = () => {
    if (query.trim()) {
      hapticFeedback.selection();
      onSearch(query);
      setShowRecent(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const handleClear = () => {
    hapticFeedback.selection();
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const handleRecentSearch = (searchTerm: string) => {
    hapticFeedback.selection();
    setQuery(searchTerm);
    onSearch(searchTerm);
    setShowRecent(false);
  };
  useEffect(() => {
    if (isFocused && recentSearches.length > 0 && !query) {
      setShowRecent(true);
    } else {
      setShowRecent(false);
    }
  }, [isFocused, query, recentSearches]);
  return <div className="relative">
      <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="pl-4 pr-2 py-3">
          <Search size={20} className="text-gray-500 dark:text-gray-400" />
        </div>
        <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyPress={handleKeyPress} onFocus={() => setIsFocused(true)} onBlur={() => setTimeout(() => setIsFocused(false), 200)} placeholder="Search for food..." className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
        <div className="flex items-center pr-2">
          {query && <motion.button className="w-8 h-8 rounded-full flex items-center justify-center mr-1" onClick={handleClear} initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} exit={{
          scale: 0
        }} whileTap={{
          scale: 0.9
        }}>
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </motion.button>}
          <div className="flex space-x-1">
            <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={() => {
            hapticFeedback.selection();
            onVoiceSearch();
          }} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
              <Mic size={16} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
            <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={() => {
            hapticFeedback.selection();
            onCameraSearch();
          }} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
              <Camera size={16} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
            <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={() => {
            hapticFeedback.selection();
            onBarcodeSearch();
          }} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
              <div size={16} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showRecent && <motion.div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden" initial={{
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
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                Recent searches
              </p>
              {recentSearches.map((search, index) => <motion.button key={index} className="w-full text-left px-3 py-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleRecentSearch(search)} whileHover={{
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}>
                  <div className="flex items-center">
                    <Search size={14} className="text-gray-500 dark:text-gray-400 mr-2" />
                    <span>{search}</span>
                  </div>
                </motion.button>)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};