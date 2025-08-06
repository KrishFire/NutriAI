import React, { useState } from 'react';
import { ArrowLeftIcon, Salad, Zap, Flame, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface GoalAccomplishmentScreenProps {
  onBack: () => void;
  onNext: (goals: string[]) => void;
  progress: number;
}
export const GoalAccomplishmentScreen: React.FC<GoalAccomplishmentScreenProps> = ({
  onBack,
  onNext,
  progress
}) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const goals = [{
    id: 'healthier',
    label: 'Eat and live healthier',
    icon: <Salad size={24} />
  }, {
    id: 'energy',
    label: 'Boost energy and mood',
    icon: <Zap size={24} />
  }, {
    id: 'motivation',
    label: 'Stay motivated and consistent',
    icon: <Flame size={24} />
  }, {
    id: 'confidence',
    label: 'Feel better about my body',
    icon: <Activity size={24} />
  }];
  const handleToggleGoal = (goalId: string) => {
    hapticFeedback.selection();
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };
  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      onNext(selectedGoals);
    }
  };
  return <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div className="h-full bg-[#320DFF] rounded-full" style={{
        width: `${progress}%`
      }}></div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          What would you like to accomplish?
        </h1>
        <p className="text-gray-600 text-lg">Select all that apply to you</p>
      </div>
      <div className="space-y-4 mb-8">
        {goals.map(goal => <motion.button key={goal.id} className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGoals.includes(goal.id) ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`} onClick={() => handleToggleGoal(goal.id)} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
            <div className={`mr-4 ${selectedGoals.includes(goal.id) ? 'text-[#320DFF]' : 'text-gray-500'}`}>
              {goal.icon}
            </div>
            <span className="text-lg font-medium">{goal.label}</span>
          </motion.button>)}
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth disabled={selectedGoals.length === 0}>
          Continue
        </Button>
      </div>
    </div>;
};