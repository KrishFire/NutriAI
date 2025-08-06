import React, { useState } from 'react';
import { ArrowLeftIcon, SendIcon, SparklesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface RefineWithAIScreenProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  currentResults: any;
}
export const RefineWithAIScreen: React.FC<RefineWithAIScreenProps> = ({
  onBack,
  onSubmit,
  currentResults
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(['Add a side of chips', 'The bread was whole wheat', 'There was mayo on the sandwich', 'The portion was smaller', 'There was cheese on the sandwich']);
  const handleSubmit = () => {
    if (!inputText.trim()) return;
    hapticFeedback.impact();
    setIsLoading(true);
    // Simulate API processing
    setTimeout(() => {
      setIsLoading(false);
      onSubmit({
        ...currentResults,
        refinedWith: inputText
      });
    }, 1500);
  };
  const handleSuggestionClick = (suggestion: string) => {
    hapticFeedback.selection();
    setInputText(suggestion);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center">
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
          <div>
            <h1 className="text-xl font-bold">Refine with AI</h1>
            <p className="text-sm text-gray-500">
              Add details to improve accuracy
            </p>
          </div>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="bg-[#320DFF]/5 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <SparklesIcon size={20} className="text-[#320DFF] mr-3 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                Tell our AI about any details we missed or corrections needed.
                This helps us improve the accuracy of your meal analysis.
              </p>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-medium mb-3">Quick Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => <motion.button key={index} className="bg-gray-100 py-2 px-3 rounded-full text-sm text-gray-700" whileHover={{
              scale: 1.05,
              backgroundColor: 'rgba(50, 13, 255, 0.1)'
            }} whileTap={{
              scale: 0.95
            }} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion}
                </motion.button>)}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="refinement-input" className="font-medium mb-2 block">
              Your Refinement
            </label>
            <div className="relative">
              <textarea id="refinement-input" className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50" placeholder="Example: The sandwich had mayo and cheese, and the bread was whole wheat..." value={inputText} onChange={e => setInputText(e.target.value)}></textarea>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Current analysis:</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium">Turkey Sandwich with Chips</p>
              <p className="text-xs text-gray-500">
                {currentResults?.totalCalories || 542} calories •{' '}
                {currentResults?.totalProtein || 28}g protein •{' '}
                {currentResults?.totalCarbs || 62}g carbs •{' '}
                {currentResults?.totalFat || 22}g fat
              </p>
            </div>
          </div>
          <div className="mt-auto">
            <Button onClick={handleSubmit} variant="primary" fullWidth disabled={!inputText.trim() || isLoading} loading={isLoading}>
              {isLoading ? 'Analyzing...' : 'Submit Refinement'}
              {!isLoading && <SendIcon size={16} className="ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};