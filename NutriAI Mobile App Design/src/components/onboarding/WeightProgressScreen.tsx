import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
import { Berry } from '../ui/Berry';
interface WeightProgressScreenProps {
  onBack: () => void;
  onNext: () => void;
  goal: string;
}
export const WeightProgressScreen: React.FC<WeightProgressScreenProps> = ({
  onBack,
  onNext,
  goal
}) => {
  const handleContinue = () => {
    hapticFeedback.selection();
    onNext();
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsAnimated(true);
    }, 500);
  }, []);
  return <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-8">
        <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Thank you for trusting us</h1>
        <p className="text-gray-600 text-lg">
          Now let's personalize NutriAI for you
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center mb-8" ref={containerRef}>
        <motion.div className="flex items-center justify-center" initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.5
      }}>
          <motion.div initial={{
          x: -50,
          opacity: 0
        }} animate={{
          x: isAnimated ? 0 : -50,
          opacity: isAnimated ? 1 : 0
        }} transition={{
          duration: 0.5
        }}>
            <Berry variant="trophy" size="large" />
          </motion.div>
          <motion.div initial={{
          x: 50,
          opacity: 0
        }} animate={{
          x: isAnimated ? 0 : 50,
          opacity: isAnimated ? 1 : 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }}>
            <Berry variant="celebrate" size="large" />
          </motion.div>
        </motion.div>
        <motion.div className="mt-8 bg-[#320DFF]/10 p-4 rounded-2xl w-full" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: isAnimated ? 1 : 0,
        y: isAnimated ? 0 : 20
      }} transition={{
        duration: 0.5,
        delay: 0.5
      }}>
          <p className="text-center text-[#320DFF] font-medium">
            {goal === 'lose' ? "We'll help you lose weight while maintaining your energy and health" : goal === 'gain' ? "We'll help you gain weight and build muscle effectively" : "We'll help you maintain your weight and optimize your nutrition"}
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