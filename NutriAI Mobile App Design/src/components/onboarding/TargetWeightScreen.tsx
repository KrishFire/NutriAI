import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface TargetWeightScreenProps {
  onBack: () => void;
  onNext: (targetWeight: any) => void;
  currentWeight: {
    value: string;
    unit: string;
  };
  goal: string;
  progress: number;
}
export const TargetWeightScreen: React.FC<TargetWeightScreenProps> = ({
  onBack,
  onNext,
  currentWeight,
  goal,
  progress
}) => {
  const [targetWeight, setTargetWeight] = useState({
    value: '',
    unit: currentWeight.unit
  });
  const [currentGoal, setCurrentGoal] = useState(goal);
  useEffect(() => {
    // Set initial target weight based on goal and current weight
    const currentWeightValue = parseInt(currentWeight.value);
    let initialTarget = currentWeightValue;
    // Start with ±10 from current weight based on goal
    if (goal === 'lose') {
      initialTarget = Math.max(currentWeightValue - 10, currentWeight.unit === 'lbs' ? 100 : 45);
    } else if (goal === 'gain') {
      initialTarget = currentWeightValue + 10;
    }
    setTargetWeight({
      value: initialTarget.toString(),
      unit: currentWeight.unit
    });
  }, [currentWeight, goal]);
  useEffect(() => {
    // Update goal based on target weight compared to current weight
    const currentWeightValue = parseInt(currentWeight.value);
    const targetWeightValue = parseInt(targetWeight.value);
    if (targetWeightValue < currentWeightValue) {
      setCurrentGoal('lose');
    } else if (targetWeightValue > currentWeightValue) {
      setCurrentGoal('gain');
    } else {
      setCurrentGoal('maintain');
    }
  }, [targetWeight, currentWeight]);
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTargetWeight({
      ...targetWeight,
      value: newValue
    });
    hapticFeedback.selection();
  };
  const handleContinue = () => {
    onNext({
      ...targetWeight,
      goal: currentGoal
    });
  };
  // Generate min and max values for the slider
  const getSliderLimits = () => {
    const currentWeightValue = parseInt(currentWeight.value);
    const range = currentWeight.unit === 'lbs' ? 50 : 23; // Approx 50 lbs or 23 kg range
    return {
      min: Math.max(currentWeightValue - range, currentWeight.unit === 'lbs' ? 80 : 36),
      max: currentWeightValue + range
    };
  };
  const {
    min,
    max
  } = getSliderLimits();
  const currentWeightValue = parseInt(currentWeight.value);
  const goalText = currentGoal === 'lose' ? 'lose' : currentGoal === 'gain' ? 'gain' : 'maintain';
  const weightDifference = Math.abs(parseInt(targetWeight.value) - currentWeightValue);
  // Generate tick marks for the slider
  const generateTickMarks = () => {
    const ticks = [];
    const totalRange = max - min;
    const majorInterval = 10; // Major tick every 10 units
    const minorTicksPerMajor = 4; // 4 minor ticks between major ticks
    for (let i = 0; i <= totalRange; i++) {
      const isMajorTick = i % majorInterval === 0;
      if (isMajorTick || i % (majorInterval / minorTicksPerMajor) === 0) {
        ticks.push({
          value: min + i,
          isMajorTick: isMajorTick
        });
      }
    }
    return ticks;
  };
  const ticks = generateTickMarks();
  return <div className="flex flex-col min-h-screen bg-white p-6">
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
        <h1 className="text-3xl font-bold mb-3">What's your target weight?</h1>
        <p className="text-gray-600 text-lg">
          {`Select how much weight you want to ${goalText}`}
        </p>
      </div>
      <div className="flex flex-col items-center mb-8">
        <div className="text-center mb-4">
          <p className={`text-sm font-medium ${currentGoal === 'lose' ? 'text-[#320DFF]' : currentGoal === 'gain' ? 'text-[#320DFF]' : 'text-[#320DFF]'}`}>
            {currentGoal === 'lose' ? 'Lose weight' : currentGoal === 'gain' ? 'Gain weight' : 'Maintain weight'}
          </p>
        </div>
        <div className="w-full mb-6">
          {/* Slider design inspired by Cal AI */}
          <div className="relative h-24">
            {/* Gradient background based on goal */}
            <div className="absolute left-0 right-0 top-10 h-1 overflow-hidden">
              <div className="absolute left-0 right-0 h-full" style={{
              background: `linear-gradient(to right, 
                    rgba(50, 13, 255, 0.3) 0%, 
                    rgba(50, 13, 255, 0.05) 50%, 
                    rgba(50, 13, 255, 0.3) 100%)`
            }}></div>
            </div>
            {/* Tick marks */}
            <div className="absolute left-0 right-0 top-4 flex justify-between">
              {ticks.map((tick, index) => <div key={index} className="relative" style={{
              height: tick.isMajorTick ? '14px' : '8px'
            }}>
                  <div className={`absolute bottom-0 w-0.5 ${tick.isMajorTick ? 'bg-gray-400 h-full' : 'bg-gray-300 h-full'}`}></div>
                </div>)}
            </div>
            {/* Current weight marker */}
            <div className="absolute w-1 h-20 bg-gray-700 rounded-full z-10" style={{
            left: `${(currentWeightValue - min) / (max - min) * 100}%`,
            top: '0px'
          }}></div>
            {/* Slider thumb */}
            <div className="absolute w-6 h-6 bg-white border-2 border-[#320DFF] rounded-full shadow-lg z-20 flex items-center justify-center" style={{
            left: `${(parseInt(targetWeight.value) - min) / (max - min) * 100}%`,
            transform: 'translateX(-50%)',
            top: '8px'
          }}>
              <div className="w-2 h-2 rounded-full bg-[#320DFF]"></div>
            </div>
            {/* Hidden range input for interaction */}
            <input type="range" min={min} max={max} step="1" value={targetWeight.value} onChange={handleWeightChange} className="absolute w-full h-20 top-0 opacity-0 cursor-pointer z-30" />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>
              {min} {targetWeight.unit}
            </span>
            <span>
              {max} {targetWeight.unit}
            </span>
          </div>
        </div>
        <div className="text-center mb-6">
          <motion.div className="text-5xl font-bold text-[#320DFF] mb-2" key={targetWeight.value} initial={{
          scale: 0.9
        }} animate={{
          scale: 1
        }} transition={{
          type: 'spring',
          stiffness: 300,
          damping: 15
        }}>
            {targetWeight.value}{' '}
            <span className="text-2xl">{targetWeight.unit}</span>
          </motion.div>
          <p className="text-gray-600">Target Weight</p>
        </div>
      </div>
      <motion.div className="bg-gradient-to-r from-[#320DFF]/20 to-[#5D4DFF]/20 p-5 rounded-2xl mb-8" initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }}>
        <p className="text-center text-[#320DFF] font-medium text-lg">
          {currentGoal === 'maintain' ? 'You want to maintain your current weight' : `You want to ${goalText} ${weightDifference} ${targetWeight.unit}`}
        </p>
      </motion.div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>;
};