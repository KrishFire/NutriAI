import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface BirthDateScreenProps {
  onBack: () => void;
  onNext: (date: any) => void;
  progress: number;
}
export const BirthDateScreen: React.FC<BirthDateScreenProps> = ({
  onBack,
  onNext,
  progress
}) => {
  const [birthDate, setBirthDate] = useState({
    month: '1',
    day: '1',
    year: '1990'
  });
  const handleChange = (field: string, value: string) => {
    hapticFeedback.selection();
    setBirthDate({
      ...birthDate,
      [field]: value
    });
  };
  const handleContinue = () => {
    onNext(birthDate);
  };
  // Generate options for pickers
  const months = Array.from({
    length: 12
  }, (_, i) => i + 1).map(month => ({
    value: month.toString(),
    label: new Date(2000, month - 1, 1).toLocaleString('default', {
      month: 'long'
    })
  }));
  const days = Array.from({
    length: 31
  }, (_, i) => i + 1).map(day => ({
    value: day.toString(),
    label: day.toString()
  }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({
    length: 100
  }, (_, i) => currentYear - 100 + i).map(year => ({
    value: year.toString(),
    label: year.toString()
  }));
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">When were you born?</h1>
        <p className="text-gray-600 text-lg">
          Your age helps us calculate your metabolic rate
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month
          </label>
          <select value={birthDate.month} onChange={e => handleChange('month', e.target.value)} className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none">
            {months.map(option => <option key={option.value} value={option.value}>
                {option.label}
              </option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Day
          </label>
          <select value={birthDate.day} onChange={e => handleChange('day', e.target.value)} className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none">
            {days.map(option => <option key={option.value} value={option.value}>
                {option.label}
              </option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <select value={birthDate.year} onChange={e => handleChange('year', e.target.value)} className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none">
            {years.map(option => <option key={option.value} value={option.value}>
                {option.label}
              </option>)}
          </select>
        </div>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>;
};