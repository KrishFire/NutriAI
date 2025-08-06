import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface ActivityLevelScreenProps {
  onBack: () => void;
  onNext: (activityLevel: string) => void;
  progress: number;
}
export const ActivityLevelScreen: React.FC<ActivityLevelScreenProps> = ({
  onBack,
  onNext,
  progress
}) => {
  const [selectedLevel, setSelectedLevel] = useState('');
  const activityLevels = [{
    id: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="currentColor" strokeWidth="2" />
          <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" />
        </svg>
  }, {
    id: 'light',
    label: 'Lightly Active',
    description: 'Exercise 1-3 days/week',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 16L19 19M18 12H22M16 8L19 5M12 6V2M8 8L5 5M6 12H2M8 16L5 19M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
  }, {
    id: 'moderate',
    label: 'Moderately Active',
    description: 'Exercise 3-5 days/week',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.5 4.5C14.5 5.88071 13.3807 7 12 7C10.6193 7 9.5 5.88071 9.5 4.5C9.5 3.11929 10.6193 2 12 2C13.3807 2 14.5 3.11929 14.5 4.5Z" stroke="currentColor" strokeWidth="2" />
          <path d="M20 8L4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19.5 11.5L4.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 15L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 18.5L6 18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 22L8 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
  }, {
    id: 'active',
    label: 'Very Active',
    description: 'Exercise 6-7 days/week',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 14.5C7.5 14.5 8.33333 13 10 13C11.6667 13 12.5 14.5 12.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 7L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 20C18.7614 20 21 17.7614 21 15C21 12.2386 18.7614 10 16 10C15.9666 10 15.9334 10.0003 15.9002 10.0009C15.4373 7.7605 13.4193 6 11 6C9.11389 6 7.51485 7.06741 6.73929 8.66458C6.49618 8.6224 6.24949 8.6 6 8.6C3.79086 8.6 2 10.3909 2 12.6C2 14.8091 3.79086 16.6 6 16.6C6.37485 16.6 6.73999 16.5482 7.08826 16.4518" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
  }, {
    id: 'very-active',
    label: 'Extremely Active',
    description: 'Very intense exercise daily',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5355 8.46447L17.6569 6.34315M8.46447 15.5355L6.34315 17.6569M12 5V2M5 12H2M19 12H22M12 19V22M17.6569 17.6569L15.5355 15.5355M6.34315 6.34315L8.46447 8.46447" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
  }];
  const handleSelect = (level: string) => {
    hapticFeedback.selection();
    setSelectedLevel(level);
  };
  const handleContinue = () => {
    if (selectedLevel) {
      onNext(selectedLevel);
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
        <h1 className="text-3xl font-bold mb-3">How active are you?</h1>
        <p className="text-gray-600 text-lg">
          This helps us calculate your daily calorie needs
        </p>
      </div>
      <div className="space-y-4 mb-8">
        {activityLevels.map(level => <motion.button key={level.id} className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedLevel === level.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`} onClick={() => handleSelect(level.id)} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedLevel === level.id ? 'bg-[#320DFF]/20' : 'bg-gray-100'}`}>
              <div className={selectedLevel === level.id ? 'text-[#320DFF]' : 'text-gray-500'}>
                {level.icon}
              </div>
            </div>
            <div className="text-left">
              <div className="text-lg font-medium">{level.label}</div>
              <div className="text-sm text-gray-600">{level.description}</div>
            </div>
          </motion.button>)}
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth disabled={!selectedLevel}>
          Continue
        </Button>
      </div>
    </div>;
};