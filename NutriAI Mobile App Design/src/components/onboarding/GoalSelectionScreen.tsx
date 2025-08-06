import React, { useState } from 'react';
import { ArrowLeftIcon, TrendingDown, Scale, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface GoalSelectionScreenProps {
  onBack: () => void;
  onNext: (goal: string) => void;
  progress: number;
}
export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({
  onBack,
  onNext,
  progress
}) => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const goals = [{
    id: 'lose',
    label: 'Lose Weight',
    description: 'Reduce body fat and get leaner',
    icon: <TrendingDown size={28} />
  }, {
    id: 'maintain',
    label: 'Maintain Weight',
    description: 'Stay at your current weight',
    icon: <Scale size={28} />
  }, {
    id: 'gain',
    label: 'Gain Weight',
    description: 'Build muscle and increase weight',
    icon: <TrendingUp size={28} />
  }];
  const handleSelect = (goal: string) => {
    hapticFeedback.selection();
    setSelectedGoal(goal);
  };
  const handleContinue = () => {
    if (selectedGoal) {
      onNext(selectedGoal);
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
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">What is your goal?</h1>
        <p className="text-gray-600 text-lg">
          We'll create a plan tailored to your goal
        </p>
      </div>
      <div className="space-y-4 mb-8">
        {goals.map(goal => <motion.button key={goal.id} className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGoal === goal.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`} onClick={() => handleSelect(goal.id)} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
            <div className={`text-3xl mr-4 ${selectedGoal === goal.id ? 'text-[#320DFF]' : 'text-gray-500'}`}>
              {goal.icon}
            </div>
            <div className="text-left">
              <div className="text-lg font-medium">{goal.label}</div>
              <div className="text-sm text-gray-600">{goal.description}</div>
            </div>
          </motion.button>)}
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth disabled={!selectedGoal}>
          Continue
        </Button>
      </div>
    </div>;
};