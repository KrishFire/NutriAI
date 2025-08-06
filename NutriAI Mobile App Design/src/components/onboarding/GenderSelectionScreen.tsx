import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface GenderSelectionScreenProps {
  onBack: () => void;
  onNext: (gender: string) => void;
  progress: number;
}
export const GenderSelectionScreen: React.FC<GenderSelectionScreenProps> = ({
  onBack,
  onNext,
  progress
}) => {
  const [selectedGender, setSelectedGender] = useState('');
  const handleSelect = (gender: string) => {
    hapticFeedback.selection();
    setSelectedGender(gender);
  };
  const handleContinue = () => {
    if (selectedGender) {
      onNext(selectedGender);
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
        <h1 className="text-3xl font-bold mb-3">Tell us about yourself</h1>
        <p className="text-gray-600 text-lg">
          This helps us calculate your metabolic rate
        </p>
      </div>
      <div className="space-y-4 mb-8">
        <motion.button className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGender === 'male' ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`} onClick={() => handleSelect('male')} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
          <span className={`text-lg font-medium ${selectedGender === 'male' ? 'text-[#320DFF]' : ''}`}>
            Male
          </span>
        </motion.button>
        <motion.button className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGender === 'female' ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`} onClick={() => handleSelect('female')} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
          <span className={`text-lg font-medium ${selectedGender === 'female' ? 'text-[#320DFF]' : ''}`}>
            Female
          </span>
        </motion.button>
        <motion.button className={`w-full flex items-center p-5 rounded-2xl border-2 ${selectedGender === 'other' ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`} onClick={() => handleSelect('other')} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
          <span className={`text-lg font-medium ${selectedGender === 'other' ? 'text-[#320DFF]' : ''}`}>
            Other
          </span>
        </motion.button>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth disabled={!selectedGender}>
          Continue
        </Button>
      </div>
    </div>;
};