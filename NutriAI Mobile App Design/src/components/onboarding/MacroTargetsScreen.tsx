import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
interface MacroTargetsScreenProps {
  onBack: () => void;
  onComplete: () => void;
  userData?: any;
  progress: number;
}
export const MacroTargetsScreen: React.FC<MacroTargetsScreenProps> = ({
  onBack,
  onComplete,
  userData,
  progress
}) => {
  const [calories, setCalories] = useState(2000);
  const [macros, setMacros] = useState({
    carbs: 50,
    protein: 30,
    fat: 20
  });
  const [originalMacros, setOriginalMacros] = useState({
    carbs: 50,
    protein: 30,
    fat: 20
  });
  const [originalCalories, setOriginalCalories] = useState(2000);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    // Calculate calories based on user data if available
    if (userData) {
      // This is a simplified calculation
      let baseCalories = 0;
      // Base metabolic rate calculation (simplified)
      if (userData.gender === 'male') {
        baseCalories = 1800;
      } else {
        baseCalories = 1600;
      }
      // Adjust for activity level
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725
      };
      const activityLevel = userData.activityLevel || 'moderate';
      baseCalories *= activityMultipliers[activityLevel as keyof typeof activityMultipliers];
      // Adjust for goal
      if (userData.goal === 'lose') {
        baseCalories *= 0.8; // 20% deficit
      } else if (userData.goal === 'gain') {
        baseCalories *= 1.15; // 15% surplus
      }
      // Round to nearest 50
      const calculatedCalories = Math.round(baseCalories / 50) * 50;
      setCalories(calculatedCalories);
      setOriginalCalories(calculatedCalories);
      // Adjust macros based on goal
      let calculatedMacros = {
        carbs: 45,
        protein: 30,
        fat: 25
      };
      if (userData.goal === 'lose') {
        calculatedMacros = {
          carbs: 40,
          protein: 40,
          fat: 20
        };
      } else if (userData.goal === 'gain') {
        calculatedMacros = {
          carbs: 50,
          protein: 30,
          fat: 20
        };
      }
      setMacros(calculatedMacros);
      setOriginalMacros(calculatedMacros);
    }
  }, [userData]);
  const handleMacroChange = (macro: string, value: number) => {
    hapticFeedback.selection();
    // Calculate the other macros to ensure they sum to 100%
    const remaining = 100 - value;
    const others = Object.keys(macros).filter(m => m !== macro);
    const currentOthersTotal = others.reduce((sum, m) => sum + macros[m as keyof typeof macros], 0);
    const newMacros = {
      ...macros,
      [macro]: value
    };
    others.forEach((m, index) => {
      if (index === others.length - 1) {
        // Last one gets whatever is left to ensure 100%
        newMacros[m as keyof typeof macros] = Math.max(0, 100 - (newMacros[macro] + newMacros[others[0] as keyof typeof macros]));
      } else {
        // Distribute proportionally
        const proportion = macros[m as keyof typeof macros] / currentOthersTotal;
        newMacros[m as keyof typeof macros] = Math.round(remaining * proportion);
      }
    });
    setMacros(newMacros);
  };
  const handleCaloriesChange = (newCalories: number) => {
    hapticFeedback.selection();
    setCalories(newCalories);
  };
  const handleContinue = () => {
    onComplete();
  };
  const toggleEditing = () => {
    hapticFeedback.selection();
    setIsEditing(!isEditing);
  };
  const handleRevertChanges = () => {
    hapticFeedback.selection();
    setCalories(originalCalories);
    setMacros(originalMacros);
  };
  // Prepare data for pie chart
  const pieChartData = [{
    name: 'Carbs',
    value: macros.carbs,
    color: '#FFC078' // More muted orange
  }, {
    name: 'Protein',
    value: macros.protein,
    color: '#74C0FC' // More muted blue
  }, {
    name: 'Fat',
    value: macros.fat,
    color: '#8CE99A' // More muted green
  }];
  // Check if values have been changed from original
  const hasChanges = calories !== originalCalories || macros.carbs !== originalMacros.carbs || macros.protein !== originalMacros.protein || macros.fat !== originalMacros.fat;
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
        <h1 className="text-3xl font-bold mb-3">
          Your nutrition plan is ready!
        </h1>
        <p className="text-gray-600 text-lg">
          Here's your personalized daily targets
        </p>
      </div>
      <div className="space-y-6 mb-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Daily Calories</h2>
            <div className="flex items-center">
              {hasChanges && <motion.button className="text-sm text-gray-500 font-medium mr-3 flex items-center" onClick={handleRevertChanges} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }}>
                  <RotateCcwIcon size={14} className="mr-1" />
                  Reset
                </motion.button>}
              {isEditing ? <button className="text-sm text-[#320DFF] font-medium" onClick={toggleEditing}>
                  Done
                </button> : <button className="text-sm text-[#320DFF] font-medium" onClick={toggleEditing}>
                  Edit
                </button>}
            </div>
          </div>
          {isEditing ? <div className="bg-gray-100 p-4 rounded-xl">
              <input type="range" min="1200" max="3000" step="50" value={calories} onChange={e => handleCaloriesChange(parseInt(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" style={{
            background: `linear-gradient(to right, #320DFF ${(calories - 1200) / 18}%, #e5e7eb ${(calories - 1200) / 18}%)`
          }} />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">1200</span>
                <span className="text-lg font-bold text-[#320DFF]">
                  {calories}
                </span>
                <span className="text-sm text-gray-600">3000</span>
              </div>
            </div> : <div className="bg-[#320DFF]/10 p-6 rounded-xl flex justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#320DFF]">{calories}</p>
                <p className="text-sm text-gray-600">calories per day</p>
              </div>
            </div>}
        </div>
        <div>
          <h2 className="text-lg font-medium mb-4">Macronutrient Balance</h2>
          {/* Pie Chart with more spacing */}
          <div className="h-56 mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{
              top: 10,
              right: 10,
              bottom: 10,
              left: 10
            }}>
                <Pie data={pieChartData} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" animationDuration={1000} animationBegin={200}>
                  {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value, entry, index) => {
                const item = pieChartData[index];
                return `${value}: ${item.value}%`;
              }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {Object.entries(macros).map(([macro, percentage]) => <div key={macro} className="space-y-1">
                <div className="flex justify-between">
                  <p className="text-gray-700 capitalize">{macro}</p>
                  <p className="font-medium">{percentage}%</p>
                </div>
                {isEditing ? <input type="range" min="10" max="70" value={percentage} onChange={e => handleMacroChange(macro, parseInt(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${macro === 'carbs' ? 'bg-[#FFC078]' : macro === 'protein' ? 'bg-[#74C0FC]' : 'bg-[#8CE99A]'}`} /> : <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${macro === 'carbs' ? 'bg-[#FFC078]' : macro === 'protein' ? 'bg-[#74C0FC]' : 'bg-[#8CE99A]'}`} style={{
                width: `${percentage}%`
              }}></div>
                  </div>}
                <p className="text-xs text-gray-600">
                  {macro === 'carbs' && `${Math.round(calories * percentage / 400)} g`}
                  {macro === 'protein' && `${Math.round(calories * percentage / 400)} g`}
                  {macro === 'fat' && `${Math.round(calories * percentage / 900)} g`}
                </p>
              </div>)}
          </div>
        </div>
      </div>
      <div className="bg-[#320DFF]/10 p-4 rounded-xl mb-8">
        <p className="text-center text-[#320DFF] font-medium">
          These targets are optimized for your goals, but you can adjust them
          anytime
        </p>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>;
};