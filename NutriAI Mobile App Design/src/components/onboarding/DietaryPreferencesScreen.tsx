import React, { useState } from 'react';
import { ArrowLeftIcon, Salad, Fish, Leaf, Drumstick, Apple } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface DietaryPreferencesScreenProps {
  onBack: () => void;
  onNext: (diet: string) => void;
  progress: number;
}
export const DietaryPreferencesScreen: React.FC<DietaryPreferencesScreenProps> = ({
  onBack,
  onNext,
  progress
}) => {
  const [selectedDiet, setSelectedDiet] = useState('');
  const diets = [{
    id: 'no-restrictions',
    label: 'No Restrictions',
    description: 'Standard balanced diet',
    icon: <Apple size={24} />
  }, {
    id: 'vegetarian',
    label: 'Vegetarian',
    description: 'No meat, fish allowed',
    icon: <Salad size={24} />
  }, {
    id: 'vegan',
    label: 'Vegan',
    description: 'No animal products',
    icon: <Leaf size={24} />
  }, {
    id: 'pescatarian',
    label: 'Pescatarian',
    description: 'Vegetarian + seafood',
    icon: <Fish size={24} />
  }, {
    id: 'keto',
    label: 'Keto',
    description: 'Low carb, high fat',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.06 4.75L17.31 3.97C17.21 3.87 17.09 3.8 16.96 3.77L15.53 3.45C15.4 3.42 15.28 3.43 15.16 3.47L13.82 3.92C13.7 3.96 13.59 4.03 13.51 4.12L12.94 4.74C12.86 4.83 12.8 4.93 12.77 5.05L12.51 6.13C12.48 6.24 12.48 6.36 12.51 6.48L12.77 7.57C12.8 7.68 12.86 7.79 12.94 7.87L13.51 8.5C13.59 8.59 13.7 8.66 13.82 8.7L15.16 9.15C15.28 9.19 15.4 9.2 15.53 9.17L16.96 8.85C17.09 8.82 17.21 8.75 17.31 8.65L18.06 7.87C18.15 7.77 18.22 7.65 18.25 7.51L18.5 6.31C18.53 6.18 18.53 6.04 18.5 5.91L18.25 4.71C18.22 4.57 18.15 4.45 18.06 4.35V4.75Z" fill="currentColor" />
          <path d="M11.94 11.76L11.19 10.98C11.09 10.88 10.97 10.81 10.84 10.78L9.41 10.46C9.28 10.43 9.16 10.44 9.04 10.48L7.7 10.93C7.58 10.97 7.47 11.04 7.39 11.13L6.82 11.75C6.74 11.84 6.68 11.94 6.65 12.06L6.39 13.14C6.36 13.25 6.36 13.37 6.39 13.49L6.65 14.58C6.68 14.69 6.74 14.8 6.82 14.88L7.39 15.51C7.47 15.6 7.58 15.67 7.7 15.71L9.04 16.16C9.16 16.2 9.28 16.21 9.41 16.18L10.84 15.86C10.97 15.83 11.09 15.76 11.19 15.66L11.94 14.88C12.03 14.78 12.1 14.66 12.13 14.52L12.38 13.32C12.41 13.19 12.41 13.05 12.38 12.92L12.13 11.72C12.1 11.58 12.03 11.46 11.94 11.36V11.76Z" fill="currentColor" />
          <path d="M18.06 11.76L17.31 10.98C17.21 10.88 17.09 10.81 16.96 10.78L15.53 10.46C15.4 10.43 15.28 10.44 15.16 10.48L13.82 10.93C13.7 10.97 13.59 11.04 13.51 11.13L12.94 11.75C12.86 11.84 12.8 11.94 12.77 12.06L12.51 13.14C12.48 13.25 12.48 13.37 12.51 13.49L12.77 14.58C12.8 14.69 12.86 14.8 12.94 14.88L13.51 15.51C13.59 15.6 13.7 15.67 13.82 15.71L15.16 16.16C15.28 16.2 15.4 16.21 15.53 16.18L16.96 15.86C17.09 15.83 17.21 15.76 17.31 15.66L18.06 14.88C18.15 14.78 18.22 14.66 18.25 14.52L18.5 13.32C18.53 13.19 18.53 13.05 18.5 12.92L18.25 11.72C18.22 11.58 18.15 11.46 18.06 11.36V11.76Z" fill="currentColor" />
          <path d="M11.94 18.77L11.19 17.99C11.09 17.89 10.97 17.82 10.84 17.79L9.41 17.47C9.28 17.44 9.16 17.45 9.04 17.49L7.7 17.94C7.58 17.98 7.47 18.05 7.39 18.14L6.82 18.76C6.74 18.85 6.68 18.95 6.65 19.07L6.39 20.15C6.36 20.26 6.36 20.38 6.39 20.5L6.65 21.59C6.68 21.7 6.74 21.81 6.82 21.89L7.39 22.52C7.47 22.61 7.58 22.68 7.7 22.72L9.04 23.17C9.16 23.21 9.28 23.22 9.41 23.19L10.84 22.87C10.97 22.84 11.09 22.77 11.19 22.67L11.94 21.89C12.03 21.79 12.1 21.67 12.13 21.53L12.38 20.33C12.41 20.2 12.41 20.06 12.38 19.93L12.13 18.73C12.1 18.59 12.03 18.47 11.94 18.37V18.77Z" fill="currentColor" />
        </svg>
  }, {
    id: 'paleo',
    label: 'Paleo',
    description: 'Whole foods based diet',
    icon: <Drumstick size={24} />
  }];
  const handleSelect = (diet: string) => {
    hapticFeedback.selection();
    setSelectedDiet(diet);
  };
  const handleContinue = () => {
    if (selectedDiet) {
      onNext(selectedDiet);
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
          Do you follow a specific diet?
        </h1>
        <p className="text-gray-600 text-lg">
          We'll customize your meal recommendations
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {diets.map(diet => <motion.button key={diet.id} className={`flex flex-col items-center p-5 rounded-2xl border-2 ${selectedDiet === diet.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`} onClick={() => handleSelect(diet.id)} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
            <div className={`mb-2 ${selectedDiet === diet.id ? 'text-[#320DFF]' : 'text-gray-500'}`}>
              {diet.icon}
            </div>
            <div className="text-lg font-medium">{diet.label}</div>
            <div className="text-xs text-gray-600 text-center">
              {diet.description}
            </div>
          </motion.button>)}
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth disabled={!selectedDiet}>
          Continue
        </Button>
        <p className="text-center text-gray-500 text-sm mt-2">
          You can change this anytime in settings
        </p>
      </div>
    </div>;
};