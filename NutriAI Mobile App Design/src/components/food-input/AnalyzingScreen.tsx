import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Berry } from '../ui/Berry';
interface AnalyzingScreenProps {
  inputType: string;
  data: any;
  onResults: (results: any) => void;
}
export const AnalyzingScreen: React.FC<AnalyzingScreenProps> = ({
  inputType,
  data,
  onResults
}) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    // Simulate completion after a delay
    const timeout = setTimeout(() => {
      onResults({
        foods: [{
          name: 'Grilled Chicken Salad',
          calories: 320,
          protein: 28,
          carbs: 12,
          fat: 16
        }, {
          name: 'Avocado',
          calories: 160,
          protein: 2,
          carbs: 8,
          fat: 15
        }],
        totalCalories: 480
      });
    }, 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onResults]);
  return <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="mb-8">
          <Berry variant="search" size="large" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">
          Analyzing Your Food
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Berry is using AI to identify your meal and calculate nutrition
          information
        </p>
        <div className="w-full h-2 bg-gray-100 rounded-full mb-2">
          <motion.div className="h-full bg-[#320DFF] rounded-full" initial={{
          width: 0
        }} animate={{
          width: `${progress}%`
        }} transition={{
          duration: 0.5
        }}></motion.div>
        </div>
        <p className="text-sm text-gray-500">{progress}%</p>
      </div>
    </PageTransition>;
};