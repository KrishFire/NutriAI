import React, { useState } from 'react';
import { ArrowLeftIcon, SendIcon, MicIcon, XIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
import { motion } from 'framer-motion';
interface TextInputScreenProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
}
export const TextInputScreen: React.FC<TextInputScreenProps> = ({
  onBack,
  onSubmit
}) => {
  const [inputText, setInputText] = useState('');
  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit({
        text: inputText.trim()
      });
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const clearInput = () => {
    setInputText('');
  };
  const suggestions = ['Chicken salad with avocado', 'Greek yogurt with berries', 'Grilled salmon with vegetables', 'Protein shake with banana'];
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-xl font-bold">Describe Your Meal</h1>
        </div>
        <div className="flex-1 flex flex-col p-4">
          {/* Instructions */}
          <motion.div className="mb-6" initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            <h2 className="font-semibold mb-2">Tell us what you ate</h2>
            <p className="text-sm text-gray-600">
              Describe your meal in detail and our AI will analyze the
              nutritional content
            </p>
          </motion.div>
          {/* Input Area */}
          <motion.div className="bg-gray-50 rounded-xl p-4 mb-6" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.4
        }}>
            <div className="relative">
              <textarea value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={handleKeyPress} placeholder="E.g. Grilled chicken salad with avocado, tomatoes, and olive oil dressing" className="w-full h-32 bg-white rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 text-gray-800" />
              {inputText && <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center" onClick={clearInput}>
                  <XIcon size={14} className="text-gray-600" />
                </button>}
            </div>
            <div className="flex justify-between mt-3">
              <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <MicIcon size={18} className="text-gray-700" />
              </button>
              <motion.button className={`px-4 py-2 rounded-full flex items-center ${inputText.trim() ? 'bg-[#320DFF] text-white' : 'bg-gray-200 text-gray-400'}`} onClick={handleSubmit} disabled={!inputText.trim()} whileHover={inputText.trim() ? {
              scale: 1.05
            } : {}} whileTap={inputText.trim() ? {
              scale: 0.95
            } : {}}>
                <span className="mr-1">Analyze</span>
                <SendIcon size={16} />
              </motion.button>
            </div>
          </motion.div>
          {/* Suggestions */}
          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.4,
          delay: 0.2
        }}>
            <h3 className="font-medium mb-3">Suggestions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => <motion.button key={index} className="w-full text-left bg-white border border-gray-100 rounded-lg p-3 shadow-sm" onClick={() => setInputText(suggestion)} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3,
              delay: 0.3 + index * 0.1
            }} whileHover={{
              backgroundColor: 'rgba(50, 13, 255, 0.05)'
            }}>
                  {suggestion}
                </motion.button>)}
            </div>
          </motion.div>
          {/* Tips */}
          <motion.div className="mt-6 bg-[#320DFF]/5 p-4 rounded-lg" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.4,
          delay: 0.6
        }}>
            <h3 className="font-medium mb-2">Tips for Better Results</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Include portion sizes (e.g., 1 cup, 3 oz)</li>
              <li>• Mention cooking methods (e.g., grilled, baked)</li>
              <li>• Describe ingredients and toppings</li>
              <li>• Include brand names if applicable</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </PageTransition>;
};