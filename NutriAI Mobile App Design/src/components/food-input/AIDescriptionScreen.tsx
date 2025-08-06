import React, { useState, useRef } from 'react';
import { ArrowLeftIcon, MicIcon, SendIcon, SparklesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface AIDescriptionScreenProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}
export const AIDescriptionScreen: React.FC<AIDescriptionScreenProps> = ({
  onBack,
  onSubmit
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const examples = ['2 scrambled eggs with butter, wheat toast with peanut butter, and orange juice', 'Grilled chicken salad with avocado, tomatoes, and olive oil dressing', 'Protein shake with banana, peanut butter, and almond milk', 'Turkey sandwich on whole wheat with lettuce, tomato, and mayo'];
  const handleVoiceInput = () => {
    hapticFeedback.impact();
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setDescription(prev => prev + (prev ? ' ' : '') + examples[Math.floor(Math.random() * examples.length)]);
        setIsListening(false);
        hapticFeedback.success();
      }, 3000);
    }
  };
  const handleSubmit = () => {
    if (!description.trim()) return;
    hapticFeedback.impact();
    setIsAnalyzing(true);
    // Simulate API call to analyze food
    setTimeout(() => {
      const mockResult = {
        items: [{
          name: 'Scrambled eggs',
          quantity: '2 large',
          calories: 180,
          protein: 12,
          carbs: 1,
          fat: 12
        }, {
          name: 'Butter',
          quantity: '1 tbsp',
          calories: 100,
          protein: 0,
          carbs: 0,
          fat: 11
        }, {
          name: 'Wheat toast',
          quantity: '1 slice',
          calories: 80,
          protein: 3,
          carbs: 15,
          fat: 1
        }, {
          name: 'Peanut butter',
          quantity: '1 tbsp',
          calories: 95,
          protein: 4,
          carbs: 3,
          fat: 8
        }, {
          name: 'Orange juice',
          quantity: '1 cup',
          calories: 110,
          protein: 2,
          carbs: 26,
          fat: 0
        }],
        total: {
          calories: 565,
          protein: 21,
          carbs: 45,
          fat: 32
        }
      };
      setIsAnalyzing(false);
      hapticFeedback.success();
      onSubmit(mockResult);
    }, 2000);
  };
  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  return <PageTransition direction="elastic">
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
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
            Describe Your Meal
          </h1>
        </div>
        <div className="px-4 py-4 flex-1 flex flex-col">
          <div className="mb-4 bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 border-none rounded-xl p-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3 flex-shrink-0">
                <SparklesIcon size={20} className="text-[#320DFF] dark:text-[#6D56FF]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  AI-Powered Food Analysis
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Describe what you ate, and our AI will analyze the nutrition
                  for you.
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 mb-4 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800" onClick={focusTextarea}>
              <textarea ref={textareaRef} className="w-full h-full min-h-[150px] bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none" placeholder="Describe your meal in detail. For example: '2 scrambled eggs cooked in butter, 1 slice of wheat toast with peanut butter, and a cup of orange juice'" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tips for better results:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                <li>
                  Include portion sizes (e.g., "1 cup of rice, 200g chicken")
                </li>
                <li>Mention cooking methods (e.g., grilled, boiled, fried)</li>
                <li>List all major ingredients and toppings</li>
                <li>Include brand names if relevant for packaged foods</li>
              </ul>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Example meals:
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, index) => <motion.button key={index} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full" onClick={() => {
                hapticFeedback.selection();
                setDescription(example);
              }} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    {example.length > 25 ? example.substring(0, 25) + '...' : example}
                  </motion.button>)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button className={`w-14 h-14 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500' : 'bg-gray-100 dark:bg-gray-800'}`} onClick={handleVoiceInput} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.9
          }}>
              <MicIcon size={24} className={isListening ? 'text-white' : 'text-gray-700 dark:text-gray-300'} />
            </motion.button>
            <Button variant="primary" disabled={!description.trim() || isAnalyzing} onClick={handleSubmit} fullWidth loading={isAnalyzing} icon={<SendIcon size={18} />} iconPosition="right">
              {isAnalyzing ? 'Analyzing...' : 'Analyze Food'}
            </Button>
          </div>
          <AnimatePresence>
            {isListening && <motion.div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: 20
          }}>
                <div className="flex space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => <motion.div key={i} className="w-1 h-5 bg-[#320DFF] dark:bg-[#6D56FF] rounded-full" animate={{
                height: [5, 15, 5]
              }} transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1
              }} />)}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Listening...
                </p>
              </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>;
};