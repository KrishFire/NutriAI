import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, Snail, Rabbit, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface WeightSpeedScreenProps {
  onBack: () => void;
  onNext: (speed: number) => void;
  goal: string;
  progress: number;
}
export const WeightSpeedScreen: React.FC<WeightSpeedScreenProps> = ({
  onBack,
  onNext,
  goal,
  progress
}) => {
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [isMetric, setIsMetric] = useState(false);
  useEffect(() => {
    // Check if user's system is using metric
    const isMetricSystem = Intl.NumberFormat().resolvedOptions().locale !== 'en-US';
    setIsMetric(isMetricSystem);
  }, []);
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    hapticFeedback.selection();
    setSelectedSpeed(value);
  };
  const handleContinue = () => {
    onNext(selectedSpeed);
  };
  const actionWord = goal === 'lose' ? 'lose' : 'gain';
  // Get description based on selected speed
  const getSpeedDescription = () => {
    if (selectedSpeed < 0.8) {
      return 'Slower pace, but easier to maintain long-term';
    } else if (selectedSpeed < 2.3) {
      return 'Balanced approach for most people';
    } else {
      return 'Faster results, but requires more discipline';
    }
  };
  // Get icon based on selected speed
  const getSpeedIcon = () => {
    if (selectedSpeed < 0.8) {
      return <Snail size={40} className="text-[#320DFF]" />;
    } else if (selectedSpeed < 2.3) {
      return <Rabbit size={40} className="text-[#320DFF]" />;
    } else {
      return <Zap size={40} className="text-[#320DFF]" />;
    }
  };
  // Convert to kg per week for metric display
  const kgPerWeek = (selectedSpeed * 0.453592).toFixed(1);
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
        <h1 className="text-3xl font-bold mb-3">
          How fast do you want to reach your goal?
        </h1>
        <p className="text-gray-600 text-lg">
          {`Select your preferred ${actionWord} weight speed`}
        </p>
      </div>
      <div className="space-y-8 mb-8">
        <div className="flex justify-center mb-4">
          <motion.div key={selectedSpeed < 0.8 ? 'snail' : selectedSpeed < 2.3 ? 'rabbit' : 'zap'} initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          type: 'spring',
          stiffness: 300,
          damping: 15
        }}>
            {getSpeedIcon()}
          </motion.div>
        </div>
        <div className="text-center mb-4">
          <motion.div key={selectedSpeed.toString()} initial={{
          scale: 0.9
        }} animate={{
          scale: 1
        }} transition={{
          type: 'spring',
          stiffness: 300,
          damping: 15
        }}>
            <span className="text-3xl font-bold text-[#320DFF]">
              {selectedSpeed.toFixed(1)}
            </span>
            <span className="text-xl font-medium text-gray-700"> lb/week</span>
            {isMetric && <div className="text-sm text-gray-500 mt-1">
                ({kgPerWeek} kg/week)
              </div>}
          </motion.div>
        </div>
        <div className="px-4">
          <input type="range" min="0.2" max="3.0" step="0.1" value={selectedSpeed} onChange={handleSpeedChange} className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{
          background: `linear-gradient(to right, #320DFF ${(selectedSpeed - 0.2) / 2.8 * 100}%, #e5e7eb ${(selectedSpeed - 0.2) / 2.8 * 100}%)`
        }} />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Gradual</span>
            <span>Moderate</span>
            <span>Ambitious</span>
          </div>
          {/* Indicators for each speed range */}
          <div className="flex justify-between mt-1">
            <div className={`h-1 w-3 rounded-full ${selectedSpeed < 0.8 ? 'bg-[#320DFF]' : 'bg-gray-300'}`}></div>
            <div className={`h-1 w-3 rounded-full ${selectedSpeed >= 0.8 && selectedSpeed < 2.3 ? 'bg-[#320DFF]' : 'bg-gray-300'}`}></div>
            <div className={`h-1 w-3 rounded-full ${selectedSpeed >= 2.3 ? 'bg-[#320DFF]' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        <motion.div className="bg-gradient-to-r from-[#320DFF]/20 to-[#5D4DFF]/20 p-5 rounded-2xl" initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
          <p className="text-center text-[#320DFF] font-medium">
            {getSpeedDescription()}
          </p>
        </motion.div>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>;
};