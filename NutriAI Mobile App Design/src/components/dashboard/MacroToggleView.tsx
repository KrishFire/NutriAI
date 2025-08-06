import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressRing } from '../ui/ProgressRing';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { hapticFeedback } from '../../utils/haptics';
interface MacroToggleViewProps {
  dailyGoal: number;
  consumed: number;
  macros: {
    carbs: {
      goal: number;
      consumed: number;
      color: string;
    };
    protein: {
      goal: number;
      consumed: number;
      color: string;
    };
    fat: {
      goal: number;
      consumed: number;
      color: string;
    };
  };
}
export const MacroToggleView: React.FC<MacroToggleViewProps> = ({
  dailyGoal,
  consumed,
  macros
}) => {
  const [selectedMacro, setSelectedMacro] = useState<'calories' | 'carbs' | 'protein' | 'fat'>('calories');
  const [animateValues, setAnimateValues] = useState(true);
  const handleMacroSelect = (macro: 'calories' | 'carbs' | 'protein' | 'fat') => {
    if (selectedMacro === macro) return;
    hapticFeedback.selection();
    setAnimateValues(false);
    setTimeout(() => {
      setSelectedMacro(macro);
      setAnimateValues(true);
    }, 100);
  };
  const getDisplayData = () => {
    switch (selectedMacro) {
      case 'calories':
        return {
          value: consumed,
          goal: dailyGoal,
          unit: 'cal',
          color: '#320DFF',
          percentage: Math.round(consumed / dailyGoal * 100)
        };
      case 'carbs':
        return {
          value: macros.carbs.consumed,
          goal: macros.carbs.goal,
          unit: 'g',
          color: macros.carbs.color,
          percentage: Math.round(macros.carbs.consumed / macros.carbs.goal * 100)
        };
      case 'protein':
        return {
          value: macros.protein.consumed,
          goal: macros.protein.goal,
          unit: 'g',
          color: macros.protein.color,
          percentage: Math.round(macros.protein.consumed / macros.protein.goal * 100)
        };
      case 'fat':
        return {
          value: macros.fat.consumed,
          goal: macros.fat.goal,
          unit: 'g',
          color: macros.fat.color,
          percentage: Math.round(macros.fat.consumed / macros.fat.goal * 100)
        };
    }
  };
  const data = getDisplayData();
  return <div className="w-full">
      <div className="w-48 h-48 mx-auto mb-4 relative">
        <ProgressRing percentage={data.percentage} color={data.color} size={192} strokeWidth={12} animate={animateValues} duration={1}>
          <AnimatePresence mode="wait">
            <motion.div key={selectedMacro} initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.8
          }} transition={{
            duration: 0.2
          }} className="flex flex-col items-center justify-center">
              <AnimatedNumber value={data.value} className="text-2xl font-bold" duration={1} />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                of {data.goal} {data.unit}
              </p>
            </motion.div>
          </AnimatePresence>
        </ProgressRing>
      </div>
      <div className="grid grid-cols-4 gap-2 w-full">
        <motion.button className={`flex flex-col items-center p-2 rounded-lg ${selectedMacro === 'calories' ? 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20' : 'bg-gray-50 dark:bg-gray-800'}`} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => handleMacroSelect('calories')}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${selectedMacro === 'calories' ? 'bg-[#320DFF]/20 dark:bg-[#6D56FF]/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <span className={`text-sm ${selectedMacro === 'calories' ? 'text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-700 dark:text-gray-300'}`}>
              Cal
            </span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Calories
          </span>
        </motion.button>
        {Object.entries(macros).map(([key, macro]) => <motion.button key={key} className={`flex flex-col items-center p-2 rounded-lg ${selectedMacro === key ? `bg-${macro.color.replace('#', '')}/10` : 'bg-gray-50 dark:bg-gray-800'}`} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => handleMacroSelect(key as 'carbs' | 'protein' | 'fat')}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${selectedMacro === key ? `bg-${macro.color.replace('#', '')}/20` : 'bg-gray-100 dark:bg-gray-700'}`} style={{
          backgroundColor: selectedMacro === key ? `${macro.color}20` : ''
        }}>
              <span className="text-sm" style={{
            color: selectedMacro === key ? macro.color : ''
          }}>
                {key.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {key}
            </span>
          </motion.button>)}
      </div>
    </div>;
};